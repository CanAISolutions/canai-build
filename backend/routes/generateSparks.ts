import express from 'express';
import validate from '../middleware/validation.js';
import { generateSparksSchema } from '../schemas/generateSparks.js';
import { generatePreviewSparkSchema } from '../schemas/generatePreviewSpark.js';
import previewGenerator from '../services/previewGenerator.js';
import posthog from '../services/posthog.js';

// Simple logger for route logging
const logger = {
  info: (...args: unknown[]) => console.info('[generateSparks]', ...args),
  error: (...args: unknown[]) => console.error('[generateSparks]', ...args),
};

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

router.post(
  '/generate-preview-spark',
  validate({ body: generatePreviewSparkSchema }),
  async (req, res) => {
    if (process.env['NODE_ENV'] === 'test')
      logger.info('[route] /generate-preview-spark ENTRY', req.body);
    try {
      let result;
      try {
        result = await previewGenerator.generatePreviewSpark(req.body);
      } catch (userErr) {
        if (process.env['NODE_ENV'] === 'test')
          logger.error('[route] /generate-preview-spark USER ERROR', userErr);
        if (posthog && typeof posthog.capture === 'function') {
          posthog.capture('preview_error', {
            error: userErr instanceof Error ? userErr.message : String(userErr),
            input: req.body,
            timestamp: new Date().toISOString(),
          });
        }
        // Defensive: Any error from the service is treated as user input error
        return res.status(400).json({
          error: 'A user-friendly error occurred. Please check your input.',
        });
      }
      if (result && !result.error) {
        if (process.env['NODE_ENV'] === 'test')
          logger.info('[route] /generate-preview-spark SUCCESS', result);
        if (posthog && typeof posthog.capture === 'function') {
          posthog.capture('preview_viewed', {
            ...result,
            timestamp: new Date().toISOString(),
          });
        }
        const previewSpark = {
          content: result.preview,
          id: result.id || 'mock-id',
          metadata: {
            businessType: result.businessType,
            tone: result.tone,
            customTone: result.customTone,
            targetAudience: result.targetAudience,
            customInstructions: result.customInstructions,
            maxLength: result.maxLength,
          },
        };
        if (process.env['NODE_ENV'] === 'test')
          logger.info('[route] /generate-preview-spark RESPONSE', {
            previewSpark,
          });
        return res.status(200).json({ previewSpark });
      } else if (result && result.error) {
        if (process.env['NODE_ENV'] === 'test')
          logger.info('[route] /generate-preview-spark ERROR', result);
        if (posthog && typeof posthog.capture === 'function') {
          posthog.capture('preview_error', {
            error: result.error,
            input: req.body,
            timestamp: new Date().toISOString(),
          });
        }
        // Defensive: Any error from the service is treated as user input error
        return res.status(400).json({
          error: 'A user-friendly error occurred. Please check your input.',
        });
      } else {
        // Defensive: Unexpected result
        if (process.env['NODE_ENV'] === 'test')
          logger.info(
            '[route] /generate-preview-spark UNEXPECTED RESULT',
            result
          );
        return res.status(500).json({ error: 'Internal server error.' });
      }
    } catch (err) {
      if (process.env['NODE_ENV'] === 'test')
        logger.error('[route] /generate-preview-spark FATAL', err);
      if (posthog && typeof posthog.capture === 'function') {
        posthog.capture('preview_error', {
          error: err instanceof Error ? err.message : String(err),
          input: req.body,
          timestamp: new Date().toISOString(),
        });
      }
      // Defensive: Only truly unexpected errors reach here
      return res.status(500).json({ error: 'Internal server error.' });
    } finally {
      if (process.env['NODE_ENV'] === 'test')
        logger.info('[route] /generate-preview-spark EXIT');
    }
  }
);

export default router;
