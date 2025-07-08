import express from 'express';
import validate from '../middleware/validation.js';
import { generateSparksSchema } from '../schemas/generateSparks.js';

const router = express.Router();

router.post(
  '/generate-sparks',
  validate({ body: generateSparksSchema }),
  async (req, res) => {
    // Dummy spark generation (replace with real logic as needed)
    const sparks = [
      { text: 'The Growth Spark', metadata: { type: 'growth' } },
      { text: 'The Community Spark', metadata: { type: 'community' } },
      { text: 'The Innovation Spark', metadata: { type: 'innovation' } },
    ];
    res.status(200).json({
      sparks,
      error: null,
    });
  }
);

export default router;