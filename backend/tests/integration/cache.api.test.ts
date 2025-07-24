import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import cacheRouter from '../../routes/cache';

// Mock the cache service
vi.mock('../../services/cache.js', () => {
  const mockCache = {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    clear: vi.fn(),
    has: vi.fn(),
    keys: vi.fn(),
    getStats: vi.fn(),
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

describe('Cache API Integration Tests', () => {
  let app: express.Application;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCache: any; // Mock cache service - dynamically created in beforeEach

  beforeEach(async () => {
    // Create a fresh Express app for each test
    app = express();
    app.use(express.json());
    app.use('/v1/cache', cacheRouter);

    // Get the mocked cache service
    const { cache } = await import('../../services/cache');
    mockCache = cache;

    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /v1/cache/:key', () => {
    it('should return cached value when key exists', async () => {
      const testKey = 'test-key';
      const testValue = { data: 'test-value' };

      mockCache.get.mockReturnValue(testValue);

      const response = await request(app)
        .get(`/v1/cache/${testKey}`)
        .expect(200);

      expect(response.body).toEqual({
        key: testKey,
        value: testValue,
        found: true,
        error: null,
      });
      expect(mockCache.get).toHaveBeenCalledWith(testKey);
    });

    it('should return 404 when key does not exist', async () => {
      const testKey = 'non-existent-key';

      mockCache.get.mockReturnValue(undefined);

      const response = await request(app)
        .get(`/v1/cache/${testKey}`)
        .expect(404);

      expect(response.body).toEqual({
        error: 'Key not found in cache',
        key: testKey,
        code: 'CACHE_MISS',
      });
    });

    it('should validate key parameter', async () => {
      const response = await request(app)
        .get('/v1/cache/empty-key')
        .expect(404); // Will be caught by the :key route but return 404 for missing key

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /v1/cache', () => {
    it('should set a value in cache successfully', async () => {
      const testData = {
        key: 'test-key',
        value: { data: 'test-value' },
        ttl: 600,
      };

      mockCache.set.mockReturnValue(true);

      const response = await request(app)
        .post('/v1/cache')
        .send(testData)
        .expect(201);

      expect(response.body).toEqual({
        key: testData.key,
        success: true,
        ttl: testData.ttl,
        error: null,
      });
      expect(mockCache.set).toHaveBeenCalledWith(
        testData.key,
        testData.value,
        testData.ttl
      );
    });

    it('should use default TTL when not provided', async () => {
      const testData = {
        key: 'test-key',
        value: { data: 'test-value' },
      };

      mockCache.set.mockReturnValue(true);

      const response = await request(app)
        .post('/v1/cache')
        .send(testData)
        .expect(201);

      expect(response.body.ttl).toBe(300); // Default TTL
      expect(mockCache.set).toHaveBeenCalledWith(
        testData.key,
        testData.value,
        undefined
      );
    });

    it('should return 500 when cache set fails', async () => {
      const testData = {
        key: 'test-key',
        value: { data: 'test-value' },
      };

      mockCache.set.mockReturnValue(false);

      const response = await request(app)
        .post('/v1/cache')
        .send(testData)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to set cache value',
        key: testData.key,
        code: 'CACHE_SET_FAILED',
      });
    });

    it('should validate request body', async () => {
      const invalidData = {
        key: '', // Invalid: empty key
        value: 'test-value',
      };

      const response = await request(app)
        .post('/v1/cache')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /v1/cache/:key', () => {
    it('should delete an existing key successfully', async () => {
      const testKey = 'test-key';

      mockCache.del.mockReturnValue(1);

      const response = await request(app)
        .delete(`/v1/cache/${testKey}`)
        .expect(200);

      expect(response.body).toEqual({
        key: testKey,
        deleted: true,
        deletedCount: 1,
        error: null,
      });
      expect(mockCache.del).toHaveBeenCalledWith(testKey);
    });

    it('should handle deletion of non-existent key', async () => {
      const testKey = 'non-existent-key';

      mockCache.del.mockReturnValue(0);

      const response = await request(app)
        .delete(`/v1/cache/${testKey}`)
        .expect(200);

      expect(response.body).toEqual({
        key: testKey,
        deleted: false,
        deletedCount: 0,
        error: null,
      });
    });
  });

  describe('DELETE /v1/cache', () => {
    it('should clear all cache successfully', async () => {
      const response = await request(app).delete('/v1/cache').expect(200);

      expect(response.body).toEqual({
        success: true,
        message: 'All cache entries cleared',
        error: null,
      });
      expect(mockCache.clear).toHaveBeenCalled();
    });
  });

  describe('POST /v1/cache/batch-get', () => {
    it('should get multiple values successfully', async () => {
      const testKeys = ['key1', 'key2', 'key3'];
      const testResults = {
        key1: { data: 'value1' },
        key2: { data: 'value2' },
      };

      mockCache.mget.mockReturnValue(testResults);

      const response = await request(app)
        .post('/v1/cache/batch-get')
        .send({ keys: testKeys })
        .expect(200);

      expect(response.body).toEqual({
        results: testResults,
        requestedKeys: testKeys,
        foundKeys: ['key1', 'key2'],
        foundCount: 2,
        error: null,
      });
      expect(mockCache.mget).toHaveBeenCalledWith(testKeys);
    });
  });

  describe('POST /v1/cache/batch-set', () => {
    it('should set multiple values successfully', async () => {
      const testItems = [
        { key: 'key1', value: { data: 'value1' }, ttl: 600 },
        { key: 'key2', value: { data: 'value2' }, ttl: 600 },
      ];

      mockCache.mset.mockReturnValue(true);

      const response = await request(app)
        .post('/v1/cache/batch-set')
        .send({ items: testItems })
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        keys: ['key1', 'key2'],
        count: 2,
        error: null,
      });
      expect(mockCache.mset).toHaveBeenCalledWith(
        { key1: { data: 'value1' }, key2: { data: 'value2' } },
        600
      );
    });
  });

  describe('DELETE /v1/cache/batch-delete', () => {
    it('should delete multiple keys successfully', async () => {
      const testKeys = ['key1', 'key2', 'key3'];

      mockCache.mdel.mockReturnValue(2);

      const response = await request(app)
        .delete('/v1/cache/batch-delete')
        .send({ keys: testKeys })
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        keys: testKeys,
        deletedCount: 2,
        error: null,
      });
      expect(mockCache.mdel).toHaveBeenCalledWith(testKeys);
    });
  });

  describe('GET /v1/cache/stats', () => {
    it('should return cache statistics', async () => {
      const testStats = {
        hits: 100,
        misses: 50,
        keys: 25,
        ksize: 1024,
        vsize: 2048,
        memoryUsage: 3072,
      };

      mockCache.getStats.mockReturnValue(testStats);

      const response = await request(app).get('/v1/cache/stats').expect(200);

      expect(response.body).toEqual({
        stats: testStats,
        error: null,
      });
    });
  });

  describe('GET /v1/cache/keys', () => {
    it('should return all cache keys', async () => {
      const testKeys = ['key1', 'key2', 'key3'];

      mockCache.keys.mockReturnValue(testKeys);

      const response = await request(app).get('/v1/cache/keys').expect(200);

      expect(response.body).toEqual({
        keys: testKeys,
        count: testKeys.length,
        error: null,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle cache service errors gracefully', async () => {
      mockCache.get.mockImplementation(() => {
        throw new Error('Cache service error');
      });

      const response = await request(app).get('/v1/cache/test-key').expect(500);

      expect(response.body).toEqual({
        error: 'Internal server error',
        key: 'test-key',
        code: 'INTERNAL_ERROR',
      });
    });
  });
});
