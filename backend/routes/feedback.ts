import express from 'express';
import validate from '../middleware/validation.js';
import { feedbackSchema } from '../schemas/feedback.js';

const router = express.Router();

router.post(
  '/feedback',
  validate({ body: feedbackSchema }),
  async (req, res) => {
    // Stub: In production, save feedback to DB
    res.status(200).json({
      feedback_id: 'generated-feedback-uuid',
      error: null,
    });
  }
);

export default router;
