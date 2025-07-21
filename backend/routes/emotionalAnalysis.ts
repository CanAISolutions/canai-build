import express from 'express';
import HumeService from '../services/hume.js';
// Placeholder: implement or import these middleware as needed
import validate from '../middleware/validation.js';
import rateLimit from '../middleware/rateLimit.js';
import auth from '../middleware/auth.js';
import { rbacMiddleware } from '../middleware/rbac.js';
// import log from '../api/src/Shared/Logger';
// TODO: Migrate to a shared logger (e.g., backend/Shared/Logger.js)
const log = {
  info: (...args: unknown[]) => console.info('[emotionalAnalysis]', ...args),
  error: (...args: unknown[]) => console.error('[emotionalAnalysis]', ...args),
};
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
    rbacMiddleware(['user', 'admin']), // Require user or admin role
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
      if (error && typeof error === 'object' && 'details' in error) {
        console.error(
          '[analyze-emotion] Joi details:',
          (error as { details: unknown }).details
        );
      }
      console.error('[analyze-emotion] Request body:', req.body);
      // END: Add detailed error logging
      let status = 500;
      const message =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && 'message' in error
            ? (error as { message: unknown }).message
            : 'Internal server error';
      const messageStr =
        typeof message === 'string' ? message : String(message);
      if (messageStr === 'Emotional score below thresholds') {
        status = 400;
      } else if (messageStr === 'Hume circuit breaker is OPEN') {
        status = 503;
      } else if (messageStr === 'HUME_API_KEY is missing') {
        status = 500;
      } else if (messageStr.toLowerCase().includes('not found')) {
        status = 404;
      }
      // BEGIN: Return Joi details for debugging
      res.status(status === 500 ? 400 : status).json({
        error: messageStr,
        joi:
          typeof error === 'object' && 'details' in error
            ? (error as { details: unknown }).details
            : undefined,
        body: req.body,
      });
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
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && 'message' in error
          ? (error as { message: unknown }).message
          : String(error);
    const errorStr =
      typeof errorMessage === 'string' ? errorMessage : String(errorMessage);
    res.status(500).json({
      error: errorStr,
    });
  }
});

export default router;
