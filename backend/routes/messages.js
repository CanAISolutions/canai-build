import express from 'express';
import validate from '../middleware/validation.js';

const router = express.Router();

// Example: No query/params validation needed, but placeholder for future
const querySchema = null; // Replace with Joi schema if needed

// Dummy trust indicators (replace with DB/service call as needed)
const TRUST_INDICATORS = [
  { text: 'CanAI launched my bakery!', user_id: null },
  { text: '99.9% uptime' },
  { text: 'GDPR compliant' },
  { text: '10k+ users' }
];

router.get(
  '/messages',
  validate({ query: querySchema }),
  async (req, res) => {
    try {
      // In production, fetch from DB/service
      res.status(200).json({ messages: TRUST_INDICATORS, error: null });
    } catch (err) {
      res.status(500).json({ messages: [], error: 'Failed to fetch trust indicators' });
    }
  }
);

export default router;