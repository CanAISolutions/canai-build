import express from 'express';
import validate from '../middleware/validation.js';
import { requestRevisionSchema } from '../schemas/requestRevision.js';

const router = express.Router();

router.post(
  '/request-revision',
  validate({ body: requestRevisionSchema }),
  async (req, res) => {
    // Stub: In production, save revision request to DB
    res.status(200).json({
      revision_id: 'generated-revision-uuid',
      error: null,
    });
  }
);

export default router;
