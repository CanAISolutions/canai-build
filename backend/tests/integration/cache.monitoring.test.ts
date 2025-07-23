import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cacheRouter from '../../routes/cache.js';
import {
  cacheMonitor,
  clearCacheMetrics,
  getCacheMetrics,
} from '../../middleware/cacheMonitor.js';

// Mock the cache service
vi.mock('../../services/cache.js', () => {
  const mockCache = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn().mockReturnValue({
      hits: 100,
      misses: 50,
      keys: 25,
      ksize: 1024,
      vsize: 2048,
      memoryUsage: 3072,
    }),
    has: vi.fn(),
    keys: vi.fn(),
    mget: vi.fn(),
    mset: vi.fn(),
    mdel: vi.fn(),
    close: vi.fn(),
  };

  return {
    cache: mockCache,
  };
});

// Mock the logger
vi.mock('../../services/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Sentry
vi.mock('../../services/instrument.js', () => ({
  default: {
    captureException: vi.fn(),
  },
}));

interface TestMetric {
  operation: string;
  key: string;
  responseTime: number;
  success: boolean;
  cacheHit: boolean;
  timestamp: Date;
  memoryUsage: number;
}

describe('Cache Monitoring Integration Tests', () => {
  let app: express.Application;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCache: any; // Mock cache service - dynamically created in beforeEach

  beforeEach(async () => {
    // Create a fresh Express app for each test
    app = express();
    app.use((req, res, next) => {
      console.log('[TOP LEVEL REQUEST]', req.method, req.originalUrl);
      next();
    });
    app.use(express.json());
    app.use(cacheMonitor); // Add monitoring middleware
    app.use('/v1/cache', cacheRouter);

    // Fallback route for debugging
    app.use((req, res) => {
      console.error('[FALLBACK ROUTE HIT]', req.method, req.originalUrl);
      res
        .status(599)
        .json({ fallback: true, method: req.method, url: req.originalUrl });
    });

    // Get the mocked cache service
    const { cache } = await import('../../services/cache.js');
    mockCache = cache;

    // Reset all mocks before each test
    vi.clearAllMocks();
    clearCacheMetrics();
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearCacheMetrics();
  });

  describe('Health Check Endpoint', () => {
    it('should return healthy status when cache operations work', async () => {
      mockCache.set.mockReturnValue(true);
      mockCache.get.mockReturnValue({
        timestamp: Date.now(),
        status: 'healthy',
      });
      mockCache.del.mockReturnValue(1);

      const response = await request(app).get('/v1/cache/health').expect(200);

      expect(response.body).toEqual({
        status: 'healthy',
        service: 'cache',
        responseTime: expect.stringMatching(/\d+ms/),
        stats: {
          hits: 100,
          misses: 50,
          keys: 25,
          memoryUsage: 3072,
        },
        timestamp: expect.any(String),
      });
    });

    it('should return unhealthy status when set operation fails', async () => {
      mockCache.set.mockReturnValue(false);

      const response = await request(app).get('/v1/cache/health').expect(503);

      expect(response.body).toEqual({
        status: 'unhealthy',
        service: 'cache',
        error: 'Cache set operation failed',
        timestamp: expect.any(String),
      });
    });

    it('should return unhealthy status when get operation fails', async () => {
      mockCache.set.mockReturnValue(true);
      mockCache.get.mockReturnValue(undefined);

      const response = await request(app).get('/v1/cache/health').expect(503);

      expect(response.body).toEqual({
        status: 'unhealthy',
        service: 'cache',
        error: 'Cache get operation failed',
        timestamp: expect.any(String),
      });
    });

    it('should return unhealthy status when delete operation fails', async () => {
      mockCache.set.mockReturnValue(true);
      mockCache.get.mockReturnValue({
        timestamp: Date.now(),
        status: 'healthy',
      });
      mockCache.del.mockReturnValue(0);

      const response = await request(app).get('/v1/cache/health').expect(503);

      expect(response.body).toEqual({
        status: 'unhealthy',
        service: 'cache',
        error: 'Cache delete operation failed',
        timestamp: expect.any(String),
      });
    });
  });

  describe('Metrics Endpoint', () => {
    it('should return cache performance metrics', async () => {
      // Add some cache operations to generate metrics
      await request(app).post('/v1/cache').send({ key: 'test', value: 'data' });

      console.log('[DEBUG] Making request to /v1/cache/metrics');
      const response = await request(app).get('/v1/cache/metrics').expect(200);

      // Debug logging to see actual response structure
      console.log(
        '[DEBUG] Actual response body:',
        JSON.stringify(response.body, null, 2)
      );
      console.log('[DEBUG] Response body keys:', Object.keys(response.body));
      console.log('[DEBUG] Response body type:', typeof response.body);
      console.log('[DEBUG] Response status:', response.status);

      expect(response.body).toHaveProperty('lastHour');
      expect(response.body).toHaveProperty('lastDay');
      expect(response.body).toHaveProperty('allTime');
      expect(response.body).toHaveProperty('currentMemoryUsage');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should handle metrics calculation with no operations', async () => {
      const response = await request(app).get('/v1/cache/metrics').expect(200);

      expect(response.body.lastHour.totalOperations).toBe(0);
      expect(response.body.lastHour.averageResponseTime).toBe(0);
      expect(response.body.lastHour.successRate).toBe(0);
    });
  });

  describe('Alerts Endpoint', () => {
    it('should return cache performance alerts', async () => {
      const response = await request(app).get('/v1/cache/alerts').expect(200);

      expect(response.body).toHaveProperty('alerts');
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should detect performance issues when thresholds are exceeded', async () => {
      // Mock high memory usage to trigger alert (above 1KB threshold)
      mockCache.getStats.mockReturnValue({
        hits: 100,
        misses: 50,
        keys: 25,
        ksize: 1024,
        vsize: 2048,
        memoryUsage: 2048, // 2KB (above 1KB threshold)
      });

      const response = await request(app).get('/v1/cache/alerts').expect(200);

      console.log('[DEBUG] Memory usage test - alerts:', response.body.alerts);
      console.log('[DEBUG] Memory usage test - count:', response.body.count);

      expect(response.body.count).toBeGreaterThan(0);
      expect(
        response.body.alerts.some(alert => alert.includes('High memory usage'))
      ).toBe(true);
    });
  });

  describe('Export Endpoint', () => {
    it('should export comprehensive cache data', async () => {
      const response = await request(app).get('/v1/cache/export').expect(200);

      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('alerts');
      expect(response.body).toHaveProperty('rawData');
    });
  });

  describe('Metrics Management', () => {
    it('should clear metrics when requested', async () => {
      // First, make some operations to generate metrics
      mockCache.get.mockReturnValue({ data: 'test' });
      await request(app).get('/v1/cache/test-key');

      // Verify metrics exist
      let metricsResponse = await request(app).get('/v1/cache/metrics');
      expect(metricsResponse.body.allTime.totalOperations).toBeGreaterThan(0);

      // Clear metrics
      const clearResponse = await request(app)
        .delete('/v1/cache/metrics')
        .expect(200);

      expect(clearResponse.body).toEqual({
        success: true,
        message: 'Cache metrics cleared',
        error: null,
      });

      // Verify metrics are cleared
      metricsResponse = await request(app).get('/v1/cache/metrics');
      expect(metricsResponse.body.allTime.totalOperations).toBe(0);
    });
  });

  describe('Monitoring Middleware', () => {
    it('should track cache operation metrics', async () => {
      mockCache.get.mockReturnValue({ data: 'test' });

      await request(app).get('/v1/cache/test-key');

      const metrics = getCacheMetrics();
      expect(metrics.allTime.totalOperations).toBe(1);
      expect(metrics.allTime.successfulOperations).toBe(1);
    });

    it('should track cache hits and misses', async () => {
      // First request - cache miss
      mockCache.get.mockReturnValue(undefined);
      await request(app).get('/v1/cache/miss-key');

      // Second request - cache hit
      mockCache.get.mockReturnValue({ data: 'test' });
      await request(app).get('/v1/cache/hit-key');

      const metrics = getCacheMetrics();
      expect(metrics.allTime.totalOperations).toBe(2);
      expect(metrics.allTime.cacheHits).toBe(1);
    });

    it('should track response times', async () => {
      mockCache.get.mockReturnValue({ data: 'test' });

      await request(app).get('/v1/cache/test-key');

      const metrics = getCacheMetrics();
      expect(metrics.allTime.totalResponseTime).toBeGreaterThan(0);
      expect(metrics.allTime.averageResponseTime).toBeGreaterThan(0);
    });

    it('should track different operation types', async () => {
      mockCache.get.mockReturnValue({ data: 'test' });
      mockCache.set.mockReturnValue(true);
      mockCache.del.mockReturnValue(1);

      await request(app).get('/v1/cache/test-key');
      await request(app).post('/v1/cache').send({ key: 'test', value: 'data' });
      await request(app).delete('/v1/cache/test-key');

      const metrics = getCacheMetrics();
      expect(metrics.allTime.totalOperations).toBe(3);
    });
  });

  describe('Performance Monitoring', () => {
    it('should generate alerts for slow operations', async () => {
      // Clear existing metrics first
      clearCacheMetrics();

      // Add multiple slow operations to trigger the alert threshold (>100ms average)
      const slowMetric: TestMetric = {
        operation: 'GET',
        key: 'slow-key',
        responseTime: 150, // Above 100ms threshold
        success: true,
        cacheHit: true,
        timestamp: new Date(),
        memoryUsage: 3072,
      };

      // Add enough slow operations to make average > 100ms
      const cacheMonitorModule = await import(
        '../../middleware/cacheMonitor.js'
      );
      (
        cacheMonitorModule as unknown as {
          __addTestMetric: (metric: TestMetric) => void;
        }
      ).__addTestMetric(slowMetric);
      (
        cacheMonitorModule as unknown as {
          __addTestMetric: (metric: TestMetric) => void;
        }
      ).__addTestMetric(slowMetric);
      (
        cacheMonitorModule as unknown as {
          __addTestMetric: (metric: TestMetric) => void;
        }
      ).__addTestMetric(slowMetric);

      const response = await request(app).get('/v1/cache/alerts').expect(200);

      console.log(
        '[DEBUG] Slow operations test - alerts:',
        response.body.alerts
      );
      console.log('[DEBUG] Slow operations test - count:', response.body.count);

      expect(response.body.count).toBeGreaterThan(0);
      expect(
        response.body.alerts.some(alert =>
          alert.includes('High average response time')
        )
      ).toBe(true);
    });

    it('should generate alerts for low success rates', async () => {
      // Clear existing metrics first
      clearCacheMetrics();

      // Add failed operations manually to trigger the alert
      const failedMetric: TestMetric = {
        operation: 'GET',
        key: 'fail-key',
        responseTime: 50,
        success: false, // Mark as failed
        cacheHit: false,
        timestamp: new Date(),
        memoryUsage: 3072,
      };

      const successMetric: TestMetric = {
        operation: 'GET',
        key: 'success-key',
        responseTime: 50,
        success: true, // Mark as successful
        cacheHit: true,
        timestamp: new Date(),
        memoryUsage: 3072,
      };

      // Add operations to ensure success rate is below 95%
      // 1 success + 20 failures = 4.76% success rate (well below 95%)
      const cacheMonitorModule = await import(
        '../../middleware/cacheMonitor.js'
      );
      (
        cacheMonitorModule as unknown as {
          __addTestMetric: (metric: TestMetric) => void;
        }
      ).__addTestMetric(successMetric);
      for (let i = 0; i < 20; i++) {
        (
          cacheMonitorModule as unknown as {
            __addTestMetric: (metric: TestMetric) => void;
          }
        ).__addTestMetric(failedMetric);
      }

      const response = await request(app).get('/v1/cache/alerts').expect(200);

      console.log(
        '[DEBUG] Low success rate test - alerts:',
        response.body.alerts
      );
      console.log(
        '[DEBUG] Low success rate test - count:',
        response.body.count
      );

      expect(response.body.count).toBeGreaterThan(0);
      expect(
        response.body.alerts.some(alert => alert.includes('Low success rate'))
      ).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle monitoring middleware errors gracefully', async () => {
      // Mock cache service to throw error
      mockCache.get.mockImplementation(() => {
        throw new Error('Cache service error');
      });

      const response = await request(app)
        .get('/v1/cache/error-key')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error',
        key: 'error-key',
        code: 'INTERNAL_ERROR',
      });
    });

    it('should handle metrics calculation errors', async () => {
      // Mock getStats to throw error
      mockCache.getStats.mockImplementation(() => {
        throw new Error('Stats error');
      });

      const response = await request(app).get('/v1/cache/metrics').expect(500);

      expect(response.body).toHaveProperty('error', 'Internal server error');
      expect(response.body).toHaveProperty('code', 'INTERNAL_ERROR');
    });
  });
});
