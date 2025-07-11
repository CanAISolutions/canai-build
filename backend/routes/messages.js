import express from 'express';
import Joi from 'joi';
import validate from '../middleware/validation.js';

const router = express.Router();

// Example: No query/params validation needed, but placeholder for future
const querySchema = null; // Replace with Joi schema if needed

// Dummy trust indicators (replace with DB/service call as needed)
const TRUST_INDICATORS = [
  { text: 'CanAI launched my bakery!', user_id: null },
  { text: '99.9% uptime' },
  { text: 'GDPR compliant' },
  { text: '10k+ users' },
];

router.get('/messages', validate({ query: querySchema }), async (req, res) => {
  try {
    // In production, fetch from DB/service
    res.status(200).json({ messages: TRUST_INDICATORS, error: null });
  } catch (err) {
    res
      .status(500)
      .json({ messages: [], error: 'Failed to fetch trust indicators' });
  }
});

// ---
// POST /v1/messages (Planned/Experimental)
// Accepts: { messageText: string, subject?: string, user_id: uuid }
// Returns: 501 Not Implemented (stub for future user messaging)
const postMessageSchema = Joi.object({
  messageText: Joi.string().min(1).max(1000).required(),
  subject: Joi.string().max(200).optional(),
  user_id: Joi.string().guid({ version: 'uuidv4' }).required(),
});

router.post('/', validate({ body: postMessageSchema }), (req, res) => {
  // This is a stub endpoint for future user messaging features.
  // It is fully validated and sanitized, but not implemented yet.
  res.status(501).json({
    error:
      'POST /v1/messages is not implemented yet. This endpoint is planned for future user messaging features.',
    code: 'NOT_IMPLEMENTED',
  });
});

// Ensure this router handles both GET and POST at '/'
// and is exported as default for mounting at /v1/messages
export default router;
