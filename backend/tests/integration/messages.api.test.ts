import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock the MessagesRepository to prevent Supabase connection issues in tests
vi.mock('../../services/messages.js', () => ({
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
        comparisons_count: 3,
      };
    }
  },
}));

// Mock analytics service
vi.mock('../../services/analytics.js', () => ({
  analytics: {
    track: vi.fn(),
  },
}));

// Mock PostHog service with default export
vi.mock('../../services/posthog.js', () => ({
  default: {
    capture: vi.fn(),
  },
  safeCapture: vi.fn(),
}));

// Mock cache service
vi.mock('../../services/cache.js', () => ({
  default: {
    get: vi.fn(() => null),
    set: vi.fn(() => true),
    del: vi.fn(() => 1),
  },
}));

import { createApp } from '../../server';

describe('GET /v1/messages Integration Tests', () => {
  let app: ReturnType<typeof createApp>;

  beforeEach(async () => {
    vi.resetModules();
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

  describe('Route Existence', () => {
    it('should confirm messages route exists', async () => {
      // This test verifies that the route is properly mounted
      const response = await request(app)
        .get('/v1/messages')
        .set('Accept', 'application/json');

      // Should not be 404 - should be 200 in test environment
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('messages');
    });
  });
});
