import express from 'express';
import validate from '../middleware/validation.js';
import { validateInputSchema } from '../schemas/validateInput.js';

const router = express.Router();

router.post(
  '/validate-input',
  validate({ body: validateInputSchema }),
  async (req, res) => {
    // Example trust score calculation (replace with real logic as needed)
    const { businessName, primaryChallenge, businessType } = req.body;
    let trustScore = 0;
    if (businessName && businessName.length >= 3) trustScore += 30;
    if (primaryChallenge && primaryChallenge.length >= 5) trustScore += 40;
    if (businessType && businessType !== 'other') trustScore += 30;
    trustScore = Math.min(trustScore, 100);

    res.status(200).json({
      ...req.body,
      trustScore,
      error: null,
    });
  }
);

export default router;
