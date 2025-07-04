import express from 'express';
import HumeService from '../services/hume.js';
// Placeholder: implement or import these middleware as needed
import validate from '../middleware/validation.js';
import rateLimit from '../middleware/rateLimit.js';
import auth from '../middleware/auth.js';
import Joi from 'joi';

const router = express.Router();
const humeService = new HumeService();

const analyzeEmotionSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required(),
  comparisonId: Joi.string().uuid().required(),
});

router.post(
  '/analyze-emotion',
  [auth, validate({ body: analyzeEmotionSchema }), rateLimit],
  async (req, res) => {
    try {
      const { text, comparisonId } = req.body;
      const result = await humeService.analyzeEmotion(text, comparisonId);
      res.status(200).json({ ...result, error: null });
    } catch (error) {
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
      res.status(status).json({ error: message });
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
