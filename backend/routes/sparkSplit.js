import express from 'express';
import validate from '../middleware/validation.js';
import { sparkSplitSchema } from '../schemas/sparkSplit.js';

const router = express.Router();

router.post(
  '/spark-split',
  validate({ body: sparkSplitSchema }),
  async (req, res) => {
    // Stub: In production, save split comparison to DB
    res.status(200).json({
      split_id: 'generated-split-uuid',
      error: null,
    });
  }
);

export default router;