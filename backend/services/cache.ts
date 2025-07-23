import NodeCache from 'node-cache';
import { logger } from './logger.js';
import Sentry from './instrument.js';

// Cache configuration interface
export interface CacheConfig {
  stdTTL?: number; // Default TTL in seconds (5 minutes = 300)
  checkperiod?: number; // How often to check for expired keys (1 minute = 60)
  maxKeys?: number; // Maximum number of keys in cache
  useClones?: boolean; // Whether to clone objects when storing
  deleteOnExpire?: boolean; // Whether to delete expired keys
}

interface CacheEntry {
  value: unknown;
  expiry: number;
}

// Cache statistics interface
export interface CacheStats {
  hits: number;
  misses: number;
  keys: number;
  ksize: number;
  vsize: number;
  memoryUsage: number;
}

// Cache service class
export class CacheService {
  private cache: NodeCache;
  private config: CacheConfig;
  private stats: { hits: number; misses: number } = { hits: 0, misses: 0 };
  private defaultTtl: number;

  constructor(config: CacheConfig = {}) {
    this.config = {
      stdTTL: 300, // 5 minutes default
      checkperiod: 60, // 1 minute check period
      maxKeys: 1000, // Maximum 1000 keys
      useClones: false, // Don't clone objects for performance
      deleteOnExpire: true, // Delete expired keys
      ...config,
    };

    this.defaultTtl = this.config.stdTTL || 300;

    this.cache = new NodeCache(this.config);

    // Set up event listeners for monitoring
    this.setupEventListeners();

    logger.info('Cache service initialized', {
      config: this.config,
      service: 'cache',
    });
  }

  /**
   * Get a value from cache
   */
  get<T = unknown>(key: string): T | undefined {
    try {
      const entry = this.cache.get<CacheEntry>(key);

      if (!entry) {
        this.stats.misses++;
        return undefined;
      }

      if (Date.now() > entry.expiry) {
        this.cache.del(key);
        this.stats.misses++;
        return undefined;
      }

      this.stats.hits++;
      // Return null if the stored value is null (was originally undefined)
      return entry.value === null ? null : (entry.value as T);
    } catch (error) {
      this.stats.misses++;
      Sentry.captureException(error);
      return undefined;
    }
  }

  /**
   * Set a value in cache
   */
  set<T = unknown>(key: string, value: T, ttl?: number): boolean {
    try {
      const expiry = ttl
        ? Date.now() + ttl * 1000
        : Date.now() + this.defaultTtl * 1000;

      // Store undefined as null to match node-cache behavior
      const valueToStore = value === undefined ? null : value;
      this.cache.set(key, { value: valueToStore, expiry });
      return true;
    } catch (error) {
      this.stats.misses++;
      Sentry.captureException(error);
      return false;
    }
  }

  /**
   * Delete a key from cache
   */
  del(key: string): number {
    try {
      const deletedCount = this.cache.del(key);

      if (deletedCount > 0) {
        logger.debug('Cache delete success', { key, service: 'cache' });
      } else {
        logger.debug('Cache delete - key not found', { key, service: 'cache' });
      }

      return deletedCount;
    } catch (error) {
      logger.error('Cache delete error', {
        key,
        error: error instanceof Error ? error.message : String(error),
        service: 'cache',
      });
      Sentry.captureException(error);
      return 0;
    }
  }

  /**
   * Clear all keys from cache
   */
  clear(): void {
    try {
      this.cache.flushAll();
      logger.info('Cache cleared', { service: 'cache' });
    } catch (error) {
      logger.error('Cache clear error', {
        error: error instanceof Error ? error.message : String(error),
        service: 'cache',
      });
      Sentry.captureException(error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      keys: this.cache.getStats().keys,
      ksize: this.calculateKeySize(),
      vsize: this.calculateValueSize(),
      memoryUsage: this.calculateMemoryUsage(),
    };
  }

  /**
   * Check if a key exists in cache
   */
  has(key: string): boolean {
    try {
      return this.cache.has(key);
    } catch (error) {
      logger.error('Cache has check error', {
        key,
        error: error instanceof Error ? error.message : String(error),
        service: 'cache',
      });
      Sentry.captureException(error);
      return false;
    }
  }

  /**
   * Get all keys in cache
   */
  keys(): string[] {
    try {
      return this.cache.keys();
    } catch (error) {
      logger.error('Cache keys error', {
        error: error instanceof Error ? error.message : String(error),
        service: 'cache',
      });
      Sentry.captureException(error);
      return [];
    }
  }

  /**
   * Get multiple values from cache
   */
  mget<T = unknown>(keys: string[]): { [key: string]: T } {
    const results: { [key: string]: T } = {};

    try {
      for (const key of keys) {
        const entry = this.cache.get<CacheEntry>(key);
        if (!entry) {
          this.stats.misses++;
          continue;
        }

        if (Date.now() > entry.expiry) {
          this.cache.del(key);
          this.stats.misses++;
          continue;
        }

        this.stats.hits++;
        results[key] = entry.value as T;
      }
    } catch (error) {
      this.stats.misses += keys.length;
      Sentry.captureException(error);
    }

    return results;
  }

  /**
   * Set multiple values in cache
   */
  mset<T = unknown>(
    keyValuePairs: { [key: string]: T },
    ttl?: number
  ): boolean {
    try {
      const expiry = ttl
        ? Date.now() + ttl * 1000
        : Date.now() + this.defaultTtl * 1000;

      for (const [key, value] of Object.entries(keyValuePairs)) {
        // Store undefined as null to match node-cache behavior
        const valueToStore = value === undefined ? null : value;
        this.cache.set(key, { value: valueToStore, expiry });
      }

      return true;
    } catch (error) {
      this.stats.misses += Object.keys(keyValuePairs).length;
      Sentry.captureException(error);
      return false;
    }
  }

  /**
   * Delete multiple keys from cache
   */
  mdel(keys: string[]): number {
    try {
      return this.cache.del(keys);
    } catch (error) {
      logger.error('Cache mdel error', {
        keys,
        error: error instanceof Error ? error.message : String(error),
        service: 'cache',
      });
      Sentry.captureException(error);
      return 0;
    }
  }

  /**
   * Set up event listeners for monitoring
   */
  private setupEventListeners(): void {
    // Monitor when keys expire
    this.cache.on('expired', (key: string, _value: unknown) => {
      logger.debug('Cache key expired', { key, service: 'cache' });
    });

    // Monitor when keys are deleted
    this.cache.on('del', (key: string, _value: unknown) => {
      logger.debug('Cache key deleted', { key, service: 'cache' });
    });

    // Monitor flush events
    this.cache.on('flush', () => {
      logger.info('Cache flushed', { service: 'cache' });
    });
  }

  /**
   * Close the cache service
   */
  close(): void {
    try {
      this.cache.close();
      logger.info('Cache service closed', { service: 'cache' });
    } catch (error) {
      logger.error('Cache close error', {
        error: error instanceof Error ? error.message : String(error),
        service: 'cache',
      });
      Sentry.captureException(error);
    }
  }

  private calculateKeySize(): number {
    let size = 0;
    for (const key of this.cache.keys()) {
      size += Buffer.byteLength(key, 'utf8');
    }
    return size;
  }

  private calculateValueSize(): number {
    let size = 0;
    const keys = this.cache.keys();
    for (const key of keys) {
      const entry = this.cache.get<CacheEntry>(key);
      if (entry) {
        size += Buffer.byteLength(JSON.stringify(entry.value), 'utf8');
      }
    }
    return size;
  }

  private calculateMemoryUsage(): number {
    return this.calculateKeySize() + this.calculateValueSize();
  }
}

// Create and export a default cache instance
const defaultCache = new CacheService();

export default defaultCache;

// Export individual methods for convenience
export const cache = {
  get: <T = unknown>(key: string): T | undefined => defaultCache.get<T>(key),
  set: <T = unknown>(key: string, value: T, ttl?: number): boolean =>
    defaultCache.set(key, value, ttl),
  del: (key: string): number => defaultCache.del(key),
  clear: (): void => defaultCache.clear(),
  getStats: (): CacheStats => defaultCache.getStats(),
  has: (key: string): boolean => defaultCache.has(key),
  keys: (): string[] => defaultCache.keys(),
  mget: <T = unknown>(keys: string[]): { [key: string]: T } =>
    defaultCache.mget<T>(keys),
  mset: <T = unknown>(
    keyValuePairs: { [key: string]: T },
    ttl?: number
  ): boolean => defaultCache.mset(keyValuePairs, ttl),
  mdel: (keys: string[]): number => defaultCache.mdel(keys),
  close: (): void => defaultCache.close(),
};
