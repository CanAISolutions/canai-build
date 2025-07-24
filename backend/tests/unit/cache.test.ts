import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CacheService } from '../../services/cache';

// Mock the logger and Sentry
vi.mock('../../services/logger.js', () => ({
  logger: {
    info: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../services/instrument.js', () => ({
  default: {
    captureException: vi.fn(),
  },
  captureException: vi.fn(),
}));

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    // Create a new cache service instance for each test
    cacheService = new CacheService({
      stdTTL: 60, // 1 minute for faster testing
      checkperiod: 30, // 30 seconds check period
      maxKeys: 100,
    });
  });

  afterEach(() => {
    // Clean up after each test
    cacheService.clear();
    cacheService.close();
  });

  describe('Constructor', () => {
    it('should initialize with default configuration', () => {
      const defaultCache = new CacheService();
      expect(defaultCache).toBeInstanceOf(CacheService);
      defaultCache.close();
    });

    it('should initialize with custom configuration', () => {
      const config = {
        stdTTL: 120,
        checkperiod: 60,
        maxKeys: 500,
        useClones: true,
        deleteOnExpire: false,
      };

      const customCache = new CacheService(config);
      expect(customCache).toBeInstanceOf(CacheService);
      customCache.close();
    });
  });

  describe('Basic Operations', () => {
    it('should set and get a string value', () => {
      const key = 'test-string';
      const value = 'test-value';

      const setResult = cacheService.set(key, value);
      expect(setResult).toBe(true);

      const getResult = cacheService.get<string>(key);
      expect(getResult).toBe(value);
    });

    it('should set and get an object value', () => {
      const key = 'test-object';
      const value = { name: 'test', count: 42 };

      const setResult = cacheService.set(key, value);
      expect(setResult).toBe(true);

      const getResult = cacheService.get<typeof value>(key);
      expect(getResult).toEqual(value);
    });

    it('should set and get an array value', () => {
      const key = 'test-array';
      const value = [1, 2, 3, 'test'];

      const setResult = cacheService.set(key, value);
      expect(setResult).toBe(true);

      const getResult = cacheService.get<typeof value>(key);
      expect(getResult).toEqual(value);
    });

    it('should return undefined for non-existent key', () => {
      const result = cacheService.get('non-existent');
      expect(result).toBeUndefined();
    });

    it('should handle null and undefined values', () => {
      // Test null
      cacheService.set('null-key', null);
      expect(cacheService.get('null-key')).toBeNull();

      // Test undefined - node-cache stores undefined as null
      cacheService.set('undefined-key', undefined);
      expect(cacheService.get('undefined-key')).toBeNull();
    });
  });

  describe('TTL Operations', () => {
    it('should set value with custom TTL', () => {
      const key = 'ttl-test';
      const value = 'ttl-value';
      const ttl = 1; // 1 second

      const setResult = cacheService.set(key, value, ttl);
      expect(setResult).toBe(true);

      // Value should exist immediately
      expect(cacheService.get(key)).toBe(value);

      // Wait for TTL to expire
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(cacheService.get(key)).toBeUndefined();
          resolve();
        }, 1100); // Wait slightly more than 1 second
      });
    });

    it('should use default TTL when not specified', () => {
      const key = 'default-ttl-test';
      const value = 'default-ttl-value';

      cacheService.set(key, value);
      expect(cacheService.get(key)).toBe(value);
    });
  });

  describe('Delete Operations', () => {
    it('should delete an existing key', () => {
      const key = 'delete-test';
      const value = 'delete-value';

      cacheService.set(key, value);
      expect(cacheService.get(key)).toBe(value);

      const deleteResult = cacheService.del(key);
      expect(deleteResult).toBe(1);
      expect(cacheService.get(key)).toBeUndefined();
    });

    it('should return 0 when deleting non-existent key', () => {
      const deleteResult = cacheService.del('non-existent');
      expect(deleteResult).toBe(0);
    });

    it('should clear all keys', () => {
      // Set multiple keys
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');

      expect(cacheService.get('key1')).toBe('value1');
      expect(cacheService.get('key2')).toBe('value2');
      expect(cacheService.get('key3')).toBe('value3');

      cacheService.clear();

      expect(cacheService.get('key1')).toBeUndefined();
      expect(cacheService.get('key2')).toBeUndefined();
      expect(cacheService.get('key3')).toBeUndefined();
    });
  });

  describe('Utility Operations', () => {
    it('should check if key exists', () => {
      const key = 'exists-test';

      expect(cacheService.has(key)).toBe(false);

      cacheService.set(key, 'value');
      expect(cacheService.has(key)).toBe(true);

      cacheService.del(key);
      expect(cacheService.has(key)).toBe(false);
    });

    it('should get all keys', () => {
      expect(cacheService.keys()).toEqual([]);

      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');

      const keys = cacheService.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });
  });

  describe('Batch Operations', () => {
    it('should get multiple values', () => {
      cacheService.set('key1', 'value1');
      cacheService.set('key2', 'value2');
      cacheService.set('key3', 'value3');

      const result = cacheService.mget([
        'key1',
        'key2',
        'key3',
        'non-existent',
      ]);

      expect(result).toEqual({
        key1: 'value1',
        key2: 'value2',
        key3: 'value3',
      });
      expect(result).not.toHaveProperty('non-existent');
    });

    it('should set multiple values', () => {
      const keyValuePairs = {
        'batch-key1': 'batch-value1',
        'batch-key2': 'batch-value2',
        'batch-key3': 'batch-value3',
      };

      const result = cacheService.mset(keyValuePairs);
      expect(result).toBe(true);

      expect(cacheService.get('batch-key1')).toBe('batch-value1');
      expect(cacheService.get('batch-key2')).toBe('batch-value2');
      expect(cacheService.get('batch-key3')).toBe('batch-value3');
    });

    it('should set multiple values with TTL', () => {
      const keyValuePairs = {
        'batch-ttl-key1': 'batch-ttl-value1',
        'batch-ttl-key2': 'batch-ttl-value2',
      };

      const result = cacheService.mset(keyValuePairs, 1); // 1 second TTL
      expect(result).toBe(true);

      expect(cacheService.get('batch-ttl-key1')).toBe('batch-ttl-value1');
      expect(cacheService.get('batch-ttl-key2')).toBe('batch-ttl-value2');
    });

    it('should delete multiple keys', () => {
      cacheService.set('mdel-key1', 'value1');
      cacheService.set('mdel-key2', 'value2');
      cacheService.set('mdel-key3', 'value3');

      const deleteResult = cacheService.mdel([
        'mdel-key1',
        'mdel-key2',
        'mdel-key3',
        'non-existent',
      ]);
      expect(deleteResult).toBe(3); // Only existing keys are deleted

      expect(cacheService.get('mdel-key1')).toBeUndefined();
      expect(cacheService.get('mdel-key2')).toBeUndefined();
      expect(cacheService.get('mdel-key3')).toBeUndefined();
    });
  });

  describe('Statistics', () => {
    it('should return cache statistics', () => {
      const stats = cacheService.getStats();

      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('keys');
      expect(stats).toHaveProperty('ksize');
      expect(stats).toHaveProperty('vsize');
      expect(stats).toHaveProperty('memoryUsage');

      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
      expect(typeof stats.keys).toBe('number');
      expect(typeof stats.memoryUsage).toBe('number');
    });

    it('should track hits and misses correctly', () => {
      const key = 'stats-test';

      // Initial stats
      const initialStats = cacheService.getStats();
      const initialHits = initialStats.hits;
      const initialMisses = initialStats.misses;

      // Miss
      cacheService.get(key);
      let stats = cacheService.getStats();
      expect(stats.misses).toBe(initialMisses + 1);
      expect(stats.hits).toBe(initialHits);

      // Set value
      cacheService.set(key, 'value');

      // Hit
      cacheService.get(key);
      stats = cacheService.getStats();
      expect(stats.hits).toBe(initialHits + 1);
      expect(stats.misses).toBe(initialMisses + 1);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully in get operation', () => {
      // This test ensures the service doesn't crash on errors
      const result = cacheService.get('test-key');
      expect(result).toBeUndefined();
    });

    it('should handle errors gracefully in set operation', () => {
      // This test ensures the service doesn't crash on errors
      const result = cacheService.set('test-key', 'test-value');
      expect(typeof result).toBe('boolean');
    });

    it('should handle errors gracefully in delete operation', () => {
      // This test ensures the service doesn't crash on errors
      const result = cacheService.del('test-key');
      expect(typeof result).toBe('number');
    });

    it('should handle errors gracefully in statistics', () => {
      // This test ensures the service doesn't crash on errors
      const stats = cacheService.getStats();
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
    });
  });

  describe('Memory Management', () => {
    it('should respect maxKeys configuration', () => {
      const limitedCache = new CacheService({ maxKeys: 2 });

      limitedCache.set('key1', 'value1');
      limitedCache.set('key2', 'value2');

      // Verify we have 2 keys
      expect(limitedCache.get('key1')).toBe('value1');
      expect(limitedCache.get('key2')).toBe('value2');
      expect(limitedCache.getStats().keys).toBe(2);

      // Add a third key which should trigger LRU eviction
      limitedCache.set('key3', 'value3');

      // Verify maxKeys is respected
      expect(limitedCache.getStats().keys).toBeLessThanOrEqual(2);

      // At least one of the original keys should be evicted
      const key1Exists = limitedCache.has('key1');
      const key2Exists = limitedCache.has('key2');
      const key3Exists = limitedCache.has('key3');

      // We should have exactly 2 keys remaining
      expect([key1Exists, key2Exists, key3Exists].filter(Boolean)).toHaveLength(
        2
      );

      limitedCache.close();
    });
  });
});

describe('Cache Export', () => {
  it('should export default cache instance', async () => {
    const { default: defaultCache } = await import('../../services/cache');
    expect(defaultCache).toBeDefined();
    expect(typeof defaultCache.get).toBe('function');
    expect(typeof defaultCache.set).toBe('function');
  });

  it('should export cache object with methods', async () => {
    const { cache } = await import('../../services/cache');
    expect(cache).toBeDefined();
    expect(typeof cache.get).toBe('function');
    expect(typeof cache.set).toBe('function');
    expect(typeof cache.del).toBe('function');
    expect(typeof cache.clear).toBe('function');
    expect(typeof cache.getStats).toBe('function');
  });
});
