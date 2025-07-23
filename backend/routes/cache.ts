import express from 'express';
import Joi from 'joi';
import validate from '../middleware/validation.js';
import { cache } from '../services/cache.js';
import { logger } from '../services/logger.js';
import Sentry from '../services/instrument.js';
import {
  getCacheMetrics,
  getCacheAlerts,
  exportMetrics,
  clearCacheMetrics,
} from '../middleware/cacheMonitor.js';

interface CacheItem {
  key: string;
  value: unknown;
  ttl?: number;
}

interface CacheKeyValuePairs {
  [key: string]: unknown;
}

const router = express.Router();

// Monitoring endpoints must be registered first
router.get('/metrics', async (req, res) => {
  console.log('[ROUTE HIT] /metrics', req.method, req.originalUrl);
  try {
    const metrics = getCacheMetrics();
    logger.debug('Cache metrics retrieved', { service: 'cache-api' });
    res.status(200).json(metrics);
  } catch (error) {
    logger.error('Cache metrics error', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });
    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.get('/alerts', async (req, res) => {
  console.log('[ROUTE HIT] /alerts', req.method, req.originalUrl);
  try {
    const alerts = getCacheAlerts();
    logger.debug('Cache alerts retrieved', {
      alertCount: alerts.count,
      service: 'cache-api',
    });
    res.status(200).json(alerts);
  } catch (error) {
    logger.error('Cache alerts error', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });
    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

router.get('/export', async (req, res) => {
  console.log('[ROUTE HIT] /export', req.method, req.originalUrl);
  try {
    const exportData = exportMetrics();
    logger.debug('Cache export data retrieved', { service: 'cache-api' });
    res.status(200).json(exportData);
  } catch (error) {
    logger.error('Cache export error', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });
    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

/**
 * DELETE /v1/cache/metrics
 * Clear cache performance metrics
 */
router.delete('/metrics', async (req, res) => {
  console.log('[ROUTE HIT] DELETE /metrics', req.method, req.originalUrl);
  try {
    clearCacheMetrics();

    logger.info('Cache metrics cleared', { service: 'cache-api' });

    res.status(200).json({
      success: true,
      message: 'Cache metrics cleared',
      error: null,
    });
  } catch (error) {
    logger.error('Cache metrics clear error', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });

    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

// Validation schemas
const cacheKeySchema = Joi.object({
  key: Joi.string().min(1).max(255).required(),
});

const cacheSetSchema = Joi.object({
  key: Joi.string().min(1).max(255).required(),
  value: Joi.any().required(),
  ttl: Joi.number().integer().min(1).max(86400).optional(), // 1 second to 24 hours
});

const cacheBatchSetSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().min(1).max(255).required(),
        value: Joi.any().required(),
        ttl: Joi.number().integer().min(1).max(86400).optional(),
      })
    )
    .min(1)
    .max(100)
    .required(), // Limit batch size to 100 items
});

const cacheBatchGetSchema = Joi.object({
  keys: Joi.array()
    .items(Joi.string().min(1).max(255))
    .min(1)
    .max(100)
    .required(),
});

const cacheBatchDeleteSchema = Joi.object({
  keys: Joi.array()
    .items(Joi.string().min(1).max(255))
    .min(1)
    .max(100)
    .required(),
});

/**
 * GET /v1/cache/health
 * Health check endpoint for cache service
 */
router.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();

    // Test basic cache operations
    const testKey = '__health_check__';
    const testValue = { timestamp: Date.now(), status: 'healthy' };

    // Test set operation
    const setSuccess = cache.set(testKey, testValue, 60); // 1 minute TTL

    if (!setSuccess) {
      logger.error('Cache health check failed: set operation', {
        service: 'cache-api',
      });
      return res.status(503).json({
        status: 'unhealthy',
        service: 'cache',
        error: 'Cache set operation failed',
        timestamp: new Date().toISOString(),
      });
    }

    // Test get operation
    const retrievedValue = cache.get<{ timestamp: number; status: string }>(
      testKey
    );

    if (!retrievedValue || retrievedValue.status !== 'healthy') {
      logger.error('Cache health check failed: get operation', {
        service: 'cache-api',
      });
      return res.status(503).json({
        status: 'unhealthy',
        service: 'cache',
        error: 'Cache get operation failed',
        timestamp: new Date().toISOString(),
      });
    }

    // Test delete operation
    const deleteSuccess = cache.del(testKey) > 0;

    if (!deleteSuccess) {
      logger.error('Cache health check failed: delete operation', {
        service: 'cache-api',
      });
      return res.status(503).json({
        status: 'unhealthy',
        service: 'cache',
        error: 'Cache delete operation failed',
        timestamp: new Date().toISOString(),
      });
    }

    const responseTime = Date.now() - startTime;
    const stats = cache.getStats();

    logger.info('Cache health check passed', {
      responseTime,
      service: 'cache-api',
    });

    res.status(200).json({
      status: 'healthy',
      service: 'cache',
      responseTime: `${responseTime}ms`,
      stats: {
        hits: stats.hits,
        misses: stats.misses,
        keys: stats.keys,
        memoryUsage: stats.memoryUsage,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Cache health check error', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });

    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }

    res.status(503).json({
      status: 'unhealthy',
      service: 'cache',
      error: 'Cache service unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /v1/cache/stats
 * Get cache statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = cache.getStats();

    logger.debug('Cache STATS retrieved', { service: 'cache-api' });

    res.status(200).json({
      stats,
      error: null,
    });
  } catch (error) {
    logger.error('Cache STATS error', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });

    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /v1/cache/keys
 * Get all cache keys
 */
router.get('/keys', async (req, res) => {
  try {
    const keys = cache.keys();

    logger.debug('Cache KEYS retrieved', {
      count: keys.length,
      service: 'cache-api',
    });

    res.status(200).json({
      keys,
      count: keys.length,
      error: null,
    });
  } catch (error) {
    logger.error('Cache KEYS error', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });

    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /v1/cache/:key
 * Get a value from cache by key
 */
router.get('/:key', validate({ params: cacheKeySchema }), async (req, res) => {
  try {
    const { key } = req.params;

    const value = cache.get(key);

    if (value === undefined) {
      return res.status(404).json({
        error: 'Key not found in cache',
        key,
        code: 'CACHE_MISS',
      });
    }

    logger.info('Cache GET success', { key, service: 'cache-api' });

    res.status(200).json({
      key,
      value,
      found: true,
      error: null,
    });
  } catch (error) {
    logger.error('Cache GET error', {
      key: req.params.key,
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });

    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }

    res.status(500).json({
      error: 'Internal server error',
      key: req.params.key,
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /v1/cache
 * Set a value in cache
 */
router.post('/', validate({ body: cacheSetSchema }), async (req, res) => {
  try {
    const { key, value, ttl } = req.body;

    const success = cache.set(key, value, ttl);

    if (!success) {
      return res.status(500).json({
        error: 'Failed to set cache value',
        key,
        code: 'CACHE_SET_FAILED',
      });
    }

    logger.info('Cache SET success', { key, ttl, service: 'cache-api' });

    res.status(201).json({
      key,
      success: true,
      ttl: ttl || 300, // Default TTL
      error: null,
    });
  } catch (error) {
    logger.error('Cache SET error', {
      key: req.body?.key,
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });

    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }

    res.status(500).json({
      error: 'Internal server error',
      key: req.body?.key,
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * DELETE /v1/cache/batch-delete
 * Delete multiple keys from cache
 */
router.delete(
  '/batch-delete',
  validate({ body: cacheBatchDeleteSchema }),
  async (req, res) => {
    try {
      const { keys } = req.body;

      const deletedCount = cache.mdel(keys);

      logger.info('Cache BATCH DELETE success', {
        keys: keys.length,
        deletedCount,
        service: 'cache-api',
      });

      res.status(200).json({
        success: true,
        keys,
        deletedCount,
        error: null,
      });
    } catch (error) {
      logger.error('Cache BATCH DELETE error', {
        keys: req.body?.keys,
        error: error instanceof Error ? error.message : String(error),
        service: 'cache-api',
      });

      if (Sentry && typeof Sentry.captureException === 'function') {
        Sentry.captureException(error);
      }

      res.status(500).json({
        error: 'Internal server error',
        keys: req.body?.keys,
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

/**
 * DELETE /v1/cache/:key
 * Delete a key from cache
 */
router.delete(
  '/:key',
  validate({ params: cacheKeySchema }),
  async (req, res) => {
    try {
      const { key } = req.params;

      const deletedCount = cache.del(key);

      logger.info('Cache DELETE success', {
        key,
        deletedCount,
        service: 'cache-api',
      });

      res.status(200).json({
        key,
        deleted: deletedCount > 0,
        deletedCount,
        error: null,
      });
    } catch (error) {
      logger.error('Cache DELETE error', {
        key: req.params.key,
        error: error instanceof Error ? error.message : String(error),
        service: 'cache-api',
      });

      if (Sentry && typeof Sentry.captureException === 'function') {
        Sentry.captureException(error);
      }

      res.status(500).json({
        error: 'Internal server error',
        key: req.params.key,
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

/**
 * DELETE /v1/cache
 * Clear all cache
 */
router.delete('/', async (req, res) => {
  try {
    cache.clear();

    logger.info('Cache CLEAR success', { service: 'cache-api' });

    res.status(200).json({
      success: true,
      message: 'All cache entries cleared',
      error: null,
    });
  } catch (error) {
    logger.error('Cache CLEAR error', {
      error: error instanceof Error ? error.message : String(error),
      service: 'cache-api',
    });

    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }

    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /v1/cache/batch-get
 * Get multiple values from cache
 */
router.post(
  '/batch-get',
  validate({ body: cacheBatchGetSchema }),
  async (req, res) => {
    try {
      const { keys } = req.body;

      const results = cache.mget(keys);

      logger.info('Cache BATCH GET success', {
        keys: keys.length,
        found: Object.keys(results).length,
        service: 'cache-api',
      });

      res.status(200).json({
        results,
        requestedKeys: keys,
        foundKeys: Object.keys(results),
        foundCount: Object.keys(results).length,
        error: null,
      });
    } catch (error) {
      logger.error('Cache BATCH GET error', {
        keys: req.body?.keys,
        error: error instanceof Error ? error.message : String(error),
        service: 'cache-api',
      });

      if (Sentry && typeof Sentry.captureException === 'function') {
        Sentry.captureException(error);
      }

      res.status(500).json({
        error: 'Internal server error',
        keys: req.body?.keys,
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

/**
 * POST /v1/cache/batch-set
 * Set multiple values in cache
 */
router.post(
  '/batch-set',
  validate({ body: cacheBatchSetSchema }),
  async (req, res) => {
    try {
      const { items } = req.body;

      // Convert items array to key-value pairs for mset
      const keyValuePairs: CacheKeyValuePairs = {};
      items.forEach((item: CacheItem) => {
        keyValuePairs[item.key] = item.value;
      });

      // Use the first item's TTL as default, or cache default
      const defaultTtl = items[0]?.ttl;

      const success = cache.mset(keyValuePairs, defaultTtl);

      if (!success) {
        return res.status(500).json({
          error: 'Failed to set batch cache values',
          keys: items.map(item => item.key),
          code: 'CACHE_BATCH_SET_FAILED',
        });
      }

      logger.info('Cache BATCH SET success', {
        keys: items.length,
        service: 'cache-api',
      });

      res.status(201).json({
        success: true,
        keys: items.map(item => item.key),
        count: items.length,
        error: null,
      });
    } catch (error) {
      logger.error('Cache BATCH SET error', {
        items: req.body?.items,
        error: error instanceof Error ? error.message : String(error),
        service: 'cache-api',
      });

      if (Sentry && typeof Sentry.captureException === 'function') {
        Sentry.captureException(error);
      }

      res.status(500).json({
        error: 'Internal server error',
        items: req.body?.items,
        code: 'INTERNAL_ERROR',
      });
    }
  }
);

export default router;
