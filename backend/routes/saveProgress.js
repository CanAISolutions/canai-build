import express from 'express';
import validate from '../middleware/validation.js';
import { saveProgressSchema } from '../schemas/saveProgress.js';

const router = express.Router();

router.post(
  '/save-progress',
  validate({ body: saveProgressSchema }),
  async (req, res) => {
    // Stub: In production, save to Supabase or DB
    const { prompt_id } = req.body;
    // Return the prompt_id (or generate one if not provided)
    res.status(200).json({
      prompt_id: prompt_id || 'generated-uuid',
      error: null,
    });
  }
);

export default router;