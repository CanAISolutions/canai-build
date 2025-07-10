import express from 'express';
import HumeService from '../services/hume.js';
// Placeholder: implement or import these middleware as needed
import validate from '../middleware/validation.js';
import rateLimit from '../middleware/rateLimit.js';
import auth from '../middleware/auth.js';
import Joi from 'joi';
import { rbacMiddleware } from '../middleware/rbac.js';
import log from '../api/src/Shared/Logger';
import { analyzeEmotionSchema } from '../schemas/emotionalAnalysis.js';

const router = express.Router();

// --- CORS Preflight Handler ---
router.options('*', (req, res) => {
  res.sendStatus(204);
});

const humeService = new HumeService();

router.post(
  '/analyze-emotion',
  [
    auth,
    rbacMiddleware(['user', 'admin']),
    // Fast dev short-circuit BEFORE expensive validation / rate-limit
    (req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        return res.status(200).json({
          arousal: 0.7,
          valence: 0.8,
          confidence: 0.9,
          source: 'hume',
          error: null,
        });
      }
      next();
    },
    validate({ body: analyzeEmotionSchema }),
    rateLimit,
  ],
  async (req, res) => {
    try {
      const user = req.memberstackUser;
      log.info('[Route] /analyze-emotion handler called', {
        userId: user?.userId,
        email: user?.email,
        roles: user?.roles,
        // Do not log customFields or the full user object to avoid sensitive data
      });
      const { text, comparisonId } = req.body;

      const result = await humeService.analyzeEmotion(text, comparisonId);
      res.status(200).json({ ...result, error: null });
    } catch (error) {
      // BEGIN: Add detailed error logging
      console.error('[analyze-emotion] Error:', error);
      if (error && error.details) {
        console.error('[analyze-emotion] Joi details:', error.details);
      }
      console.error('[analyze-emotion] Request body:', req.body);
      // END: Add detailed error logging
      let status = 500;
      let message = error.message || 'Internal server error';
      if (message === 'Emotional score below thresholds') {
        status = 400;
      } else if (message === 'Hume circuit breaker is OPEN') {
        status = 503;
      } else if (message === 'HUME_API_KEY is missing') {
        status = 500;
      } else if (message.toLowerCase().includes('not found')) {
        status = 404;
      }
      // BEGIN: Return Joi details for debugging
      res
        .status(status === 500 ? 400 : status)
        .json({ error: message, joi: error.details, body: req.body });
      // END: Return Joi details for debugging
    }
  }
);

router.get('/analyze-emotion/status', auth, async (req, res) => {
  try {
    const status =
      humeService.circuitBreaker && humeService.circuitBreaker.isOpen()
        ? 'degraded'
        : 'operational';
    res.status(200).json({
      status,
      circuitBreakerState: humeService.circuitBreaker
        ? humeService.circuitBreaker.state
        : 'UNKNOWN',
      error: null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
