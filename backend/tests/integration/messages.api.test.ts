import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import type { MockedFunction } from 'vitest';

// Mock the MessagesRepository to prevent Supabase connection issues in tests
vi.mock('../../services/messages', () => ({
  MessagesRepository: class MockMessagesRepository {
    async getMessages() {
      return {
        data: [
          {
            text: 'Test message 1',
            user_id: null,
            created_at: new Date().toISOString(),
          },
          {
            text: 'Test message 2',
            user_id: null,
            created_at: new Date().toISOString(),
          },
        ],
        count: 2,
      };
    }

    async getStatistics() {
      return {
        total_messages: 10,
        trust_indicators: 5,
        testimonials: 3,
        system_notifications: 2,
      };
    }
  },
}));

// Mock analytics service
vi.mock('../../services/analytics', () => ({
  analytics: {
    track: vi.fn(),
    trackFunnelStep: vi.fn(),
    trackDiscoveryHook: vi.fn(),
  },
}));

// Mock PostHog service with default export
vi.mock('../../services/posthog', () => ({
  default: {
    capture: vi.fn(),
  },
  safeCapture: vi.fn(),
}));

// Mock cache service with more detailed behavior
vi.mock('../../services/cache', () => {
  const mockCache = {
    get: vi.fn(),
    set: vi.fn(() => true),
    del: vi.fn(() => 1),
    has: vi.fn(),
    clear: vi.fn(),
    getStats: vi.fn(() => ({
      hits: 0,
      misses: 0,
      keys: 0,
      ksize: 0,
      vsize: 0,
      memoryUsage: 0,
    })),
  };

  return {
    default: mockCache,
  };
});

// Mock Sentry for performance monitoring
vi.mock('../../services/instrument', () => ({
  default: {
    startSpan: vi.fn((config, fn) => fn({ setAttribute: vi.fn() })),
    captureException: vi.fn(),
  },
}));

import { createApp } from '../../server';
import { analytics } from '../../services/analytics';
import cache from '../../services/cache';

describe('GET /v1/messages Integration Tests', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    app = createApp();
  });

  describe('Basic Functionality', () => {
    it('should return 200 when no auth token provided (test environment)', async () => {
      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(null);
    });

    it('should return 200 for invalid auth token (test environment)', async () => {
      const response = await request(app)
        .get('/v1/messages')
        .set('Authorization', 'Bearer invalid-token')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(null);
    });

    it('should return 404 for non-existent route', async () => {
      const response = await request(app)
        .get('/v1/nonexistent')
        .set('Accept', 'application/json');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Not Found');
    });
  });

  describe('Query Parameter Validation', () => {
    it('should accept valid type parameter', async () => {
      const response = await request(app)
        .get('/v1/messages?type=trust_indicator')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
    });

    it('should accept valid limit parameter', async () => {
      const response = await request(app)
        .get('/v1/messages?limit=5')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
    });

    it('should accept valid offset parameter', async () => {
      const response = await request(app)
        .get('/v1/messages?offset=10')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
    });

    it('should accept valid sort_by parameter', async () => {
      const response = await request(app)
        .get('/v1/messages?sort_by=created_at')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
    });

    it('should accept valid sort_order parameter', async () => {
      const response = await request(app)
        .get('/v1/messages?sort_order=asc')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
    });

    it('should accept multiple valid parameters', async () => {
      const response = await request(app)
        .get(
          '/v1/messages?type=testimonial&limit=20&offset=5&sort_by=trust_score_context&sort_order=desc'
        )
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
    });

    it('should handle offset without limit parameter (uses default limit)', async () => {
      const response = await request(app)
        .get('/v1/messages?offset=5')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
    });

    it('should reject invalid type parameter', async () => {
      const response = await request(app)
        .get('/v1/messages?type=invalid_type')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user-friendly error');
    });

    it('should reject invalid limit parameter (negative)', async () => {
      const response = await request(app)
        .get('/v1/messages?limit=-1')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user-friendly error');
    });

    it('should reject invalid limit parameter (too high)', async () => {
      const response = await request(app)
        .get('/v1/messages?limit=101')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user-friendly error');
    });

    it('should reject invalid offset parameter (negative)', async () => {
      const response = await request(app)
        .get('/v1/messages?offset=-5')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user-friendly error');
    });

    it('should reject invalid sort_by parameter', async () => {
      const response = await request(app)
        .get('/v1/messages?sort_by=invalid_sort')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user-friendly error');
    });

    it('should reject invalid sort_order parameter', async () => {
      const response = await request(app)
        .get('/v1/messages?sort_order=invalid_order')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user-friendly error');
    });

    it('should reject unknown query parameters', async () => {
      const response = await request(app)
        .get('/v1/messages?unknown_param=value')
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('user-friendly error');
    });

    it('should use default values when parameters are not provided', async () => {
      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
    });
  });

  describe('Caching Behavior', () => {
    beforeEach(() => {
      // Reset cache mock for each test
      vi.clearAllMocks();
    });

    it('should return cached response when cache hit occurs', async () => {
      // Mock cache hit
      const cachedData = {
        messages: [
          { text: 'Cached message 1', user_id: null },
          { text: 'Cached message 2', user_id: null },
        ],
        error: null,
      };
      (cache.get as MockedFunction<typeof cache.get>).mockReturnValue(
        cachedData
      );

      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...cachedData,
        cached: true,
      });
      expect(response.body.cached).toBe(true);

      // Verify cache was checked with correct key
      expect(cache.get).toHaveBeenCalledWith('trust_indicators_cache:{}');

      // Verify analytics tracking for cache hit
      expect(analytics.track).toHaveBeenCalledWith('funnel_step', {
        stepName: 'discovery_hook',
        completed: true,
        user_id: 'test-user',
        cache_hit: true,
      });
    });

    it('should cache response when cache miss occurs', async () => {
      // Mock cache miss
      (cache.get as MockedFunction<typeof cache.get>).mockReturnValue(
        undefined
      );

      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);
      expect(response.body.cached).toBeUndefined(); // Should not have cached flag

      // Verify cache was checked
      expect(cache.get).toHaveBeenCalledWith('trust_indicators_cache:{}');

      // Verify cache was set with correct data and TTL
      expect(cache.set).toHaveBeenCalledWith(
        'trust_indicators_cache:{}',
        expect.objectContaining({
          messages: expect.any(Array),
          error: null,
        }),
        300 // 5 minutes TTL
      );

      // Verify analytics tracking for cache miss
      expect(analytics.track).toHaveBeenCalledWith('funnel_step', {
        stepName: 'discovery_hook',
        completed: true,
        user_id: 'test-user',
        cache_hit: false,
        message_count: 2,
      });
    });

    it('should use different cache keys for different query parameters', async () => {
      // Mock cache miss
      (cache.get as MockedFunction<typeof cache.get>).mockReturnValue(
        undefined
      );

      const response1 = await request(app)
        .get('/v1/messages?type=trust_indicator&limit=5')
        .set('Accept', 'application/json');

      const response2 = await request(app)
        .get('/v1/messages?type=testimonial&limit=10')
        .set('Accept', 'application/json');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Verify different cache keys were used (note: query params are strings)
      expect(cache.get).toHaveBeenCalledWith(
        'trust_indicators_cache:{"type":"trust_indicator","limit":"5"}'
      );
      expect(cache.get).toHaveBeenCalledWith(
        'trust_indicators_cache:{"type":"testimonial","limit":"10"}'
      );

      // Verify cache was set with different keys
      expect(cache.set).toHaveBeenCalledWith(
        'trust_indicators_cache:{"type":"trust_indicator","limit":"5"}',
        expect.any(Object),
        300
      );
      expect(cache.set).toHaveBeenCalledWith(
        'trust_indicators_cache:{"type":"testimonial","limit":"10"}',
        expect.any(Object),
        300
      );
    });

    it('should handle cache service errors gracefully', async () => {
      // Mock cache service error
      (cache.get as MockedFunction<typeof cache.get>).mockImplementation(() => {
        throw new Error('Cache service error');
      });

      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      // The actual implementation returns 500 when cache fails
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Failed to fetch messages');
    });

    it('should handle cache set errors gracefully', async () => {
      // Mock cache miss but cache set failure
      (cache.get as MockedFunction<typeof cache.get>).mockReturnValue(
        undefined
      );
      (cache.set as MockedFunction<typeof cache.set>).mockReturnValue(false);

      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      // Should still return successful response even if cache set fails
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
      expect(response.body.error).toBe(null);

      // Verify analytics tracking still occurs
      expect(analytics.track).toHaveBeenCalledWith('funnel_step', {
        stepName: 'discovery_hook',
        completed: true,
        user_id: 'test-user',
        cache_hit: false,
        message_count: 2,
      });
    });

    it('should return cached response with correct structure', async () => {
      // Mock cache hit with specific structure
      const cachedData = {
        messages: [
          { text: 'Trust indicator message', user_id: null },
          { text: 'Another trust message', user_id: 'user-123' },
        ],
        error: null,
      };
      (cache.get as MockedFunction<typeof cache.get>).mockReturnValue(
        cachedData
      );

      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        messages: [
          { text: 'Trust indicator message', user_id: null },
          { text: 'Another trust message', user_id: 'user-123' },
        ],
        error: null,
        cached: true,
      });

      // Verify message structure matches schema requirements
      expect(response.body.messages[0]).toHaveProperty('text');
      expect(response.body.messages[0]).toHaveProperty('user_id');
      expect(typeof response.body.messages[0].text).toBe('string');
      expect(response.body.messages[0].user_id).toBe(null);
    });
  });

  describe('Route Existence and Analytics Tracking', () => {
    it('should confirm messages route exists and track analytics events', async () => {
      // This test verifies that the route is properly mounted and analytics are tracked
      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      // Should not be 404 - should be 200 in test environment
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');

      // Verify analytics tracking was called
      expect(analytics.track).toHaveBeenCalled();

      // Get the actual call details
      const analyticsCall = (
        analytics.track as MockedFunction<typeof analytics.track>
      ).mock.calls[0];
      const eventName = analyticsCall[0];
      const properties = analyticsCall[1];
      const userId = analyticsCall[2];

      // Verify the event name
      expect(eventName).toBe('funnel_step');

      // Verify the properties contain required PRD fields
      expect(properties).toMatchObject({
        stepName: 'discovery_hook',
        completed: true,
        cache_hit: expect.any(Boolean),
      });

      // Verify message_count is present (may not be present in cache hit scenarios)
      if (properties.message_count !== undefined) {
        expect(properties.message_count).toBeGreaterThan(0);
      }

      // Verify user_id is present (could be undefined or a string)
      expect(properties).toHaveProperty('user_id');

      // Verify userId parameter (should be undefined in test environment)
      expect(userId).toBeUndefined();

      // Verify the analytics call contains all required PRD properties for funnel_step event
      expect(properties).toMatchObject({
        stepName: 'discovery_hook', // PRD: funnel_step event with stepName
        completed: true, // PRD: completed boolean
        cache_hit: expect.any(Boolean), // PRD: cache hit tracking
        user_id: expect.anything(), // PRD: user identification
      });

      // Verify message_count is present when not a cache hit
      if (!properties.cache_hit) {
        expect(properties).toHaveProperty('message_count');
        expect(properties.message_count).toBeGreaterThan(0);
      }
    });
  });
});
