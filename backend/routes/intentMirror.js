import express from 'express';
import validate from '../middleware/validation.js';
import { intentMirrorSchema } from '../schemas/intentMirror.js';

const router = express.Router();

router.post(
  '/intent-mirror',
  validate({ body: intentMirrorSchema }),
  async (req, res) => {
    // Stub: In production, call AI service for summary and confidence
    res.status(200).json({
      summary: 'Your business is ready to launch with a strong value proposition.',
      confidenceScore: 0.92,
      clarifyingQuestions: [],
      error: null,
    });
  }
);

export default router;