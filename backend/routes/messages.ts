import express from 'express';
import Joi from 'joi';
import validate from '../middleware/validation.js';
import rateLimit from '../middleware/rateLimit.js';
import memberstackAuthMiddleware from '../middleware/auth.js';
import { messageQuerySchema } from '../schemas/messages.js';
import { MessagesRepository } from '../services/messages.js';
import { analytics } from '../services/analytics.js';
import cache from '../services/cache.js';
import log from '../Shared/Logger.js';
import Sentry from '../services/instrument.js';

const router = express.Router();
const logger = log;
const messageRepo = new MessagesRepository();

// Example: No query/params validation needed, but placeholder for future
// const querySchema = null; // Replace with Joi schema if needed

// Dummy trust indicators (replace with DB/service call as needed)
// const TRUST_INDICATORS = [
//   { text: 'CanAI launched my bakery!', user_id: null },
//   { text: '99.9% uptime' },
//   { text: 'GDPR compliant' },
//   { text: '10k+ users' },
// ];

// Task 13: GET /v1/messages API endpoint
router.get(
  '/messages',
  rateLimit, // PRD: 100 req/min per IP
  memberstackAuthMiddleware,
  validate({ query: messageQuerySchema }),
  async (req, res) => {
    if (process.env.NODE_ENV === 'test') {
      logger.info('[route] GET /v1/messages ENTRY', req.query);
    }

    try {
      const userId = req.memberstackUser?.userId; // Fixed: Use memberstackUser instead of user for authentication compatibility
      const query = req.query;

      // Check cache first (5-minute TTL) - PRD: trust_indicators_cache key
      const cacheKey = `trust_indicators_cache:${JSON.stringify(query)}`;
      const cached = cache.get<{
        messages: Array<{ text: string; user_id: string | null }>;
        error: null;
      }>(cacheKey);
      if (cached && cached.messages) {
        if (process.env.NODE_ENV === 'test') {
          logger.info('[cache] trust_indicators_cache HIT', cacheKey);
        }

        // PRD: funnel_step event for cache hit
        analytics.track('funnel_step', {
          stepName: 'discovery_hook',
          completed: true,
          user_id: userId,
          cache_hit: true,
        });

        return res.json({
          messages: cached.messages,
          error: null,
          cached: true,
        });
      }

      if (process.env.NODE_ENV === 'test') {
        logger.info('[cache] trust_indicators_cache MISS', cacheKey);
      }

      // Build filters and fetch data
      const filters = {
        type: query.type as string,
        limit: parseInt(query.limit as string) || 10,
        offset: parseInt(query.offset as string) || 0,
      };

      // Fetch messages with Sentry performance monitoring
      const messagesResult = await Sentry.startSpan(
        {
          op: 'db.query',
          name: 'GET /v1/messages - fetch messages',
        },
        async span => {
          // Add relevant attributes to the span
          span.setAttribute('filters.type', filters.type);
          span.setAttribute('filters.limit', filters.limit);
          span.setAttribute('filters.offset', filters.offset);
          span.setAttribute('cache.miss', true);

          return await messageRepo.getMessages(filters);
        }
      );

      // PRD Response Format: { "messages": [{ "text": "string", "user_id": "uuid|null" }], "error": null }
      const responseData = {
        messages: messagesResult.data.map(msg => ({
          text: msg.text,
          user_id: msg.user_id,
        })),
        error: null,
      };

      // Cache for 5 minutes - PRD: trust_indicators_cache, TTL: 5min
      cache.set(cacheKey, responseData, 300);

      // Analytics tracking - PRD: funnel_step event
      analytics.track('funnel_step', {
        stepName: 'discovery_hook',
        completed: true,
        user_id: userId,
        cache_hit: false,
        message_count: messagesResult.data.length,
      });

      res.json(responseData);
    } catch (error) {
      // Capture error in Sentry for monitoring (before logging)
      if (Sentry && typeof Sentry.captureException === 'function') {
        Sentry.captureException(error, {
          tags: {
            route: 'GET /v1/messages',
            step: 'discovery_hook',
          },
          extra: {
            userId: req.memberstackUser?.userId,
            query: req.query,
            errorName: error.name,
            errorMessage: error.message,
          },
        });
      }

      logger.error('[route] GET /v1/messages ERROR:', error);

      // PRD: Error handling with analytics tracking
      analytics.track('messages_error', {
        user_id: req.memberstackUser?.userId, // Fixed: Use memberstackUser instead of user for authentication compatibility
        error_type: error.name,
        stepName: 'discovery_hook',
        completed: false,
      });

      // PRD: Return error format consistent with success response structure
      // Success: { messages: [...], error: null }
      // Error: { messages: [], error: "error message" }
      res.status(500).json({
        messages: [],
        error: 'Failed to fetch messages. Please try again later.',
      });
    }
  }
);

// ---
// POST /v1/messages (Planned/Experimental)
// Accepts: { messageText: string, subject?: string, user_id: uuid }
// Returns: 501 Not Implemented (stub for future user messaging)
const postMessageSchema = Joi.object({
  messageText: Joi.string().min(1).max(1000).required(),
  subject: Joi.string().max(200).optional(),
  user_id: Joi.string().guid({ version: 'uuidv4' }).required(),
});

router.post('/messages', validate({ body: postMessageSchema }), (req, res) => {
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
