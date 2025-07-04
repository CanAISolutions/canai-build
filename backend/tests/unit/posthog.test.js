// backend/tests/unit/posthog.test.js
require('../../../testEnvSetup');
import * as posthogNode from 'posthog-node';

process.env.POSTHOG_HOST = 'http://localhost';
process.env.npm_package_version = '1.2.3';
process.env.NODE_ENV = 'test';
process.env.DEPLOYMENT_ID = 'test-deploy';
process.env.POSTHOG_FLUSH_AT = '20';
process.env.POSTHOG_FLUSH_INTERVAL = '10000';
process.env.SESSION_TIMEOUT_MINUTES = '30';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  validateEvent,
  scrubPII,
  startSession,
  getSession,
  endSession,
  enrichWithSession,
  sessionStore,
  initPosthog,
  trackFunnelStep,
  trackApiLatency,
  trackErrorOccurred,
  trackUserAction,
  posthog,
} from '../../services/posthog.js';

// Mock posthog-node to prevent real API calls
vi.mock('posthog-node', () => ({
  PostHog: vi.fn().mockImplementation(() => ({
    capture: vi.fn().mockResolvedValue(undefined),
    shutdown: vi.fn().mockResolvedValue(undefined),
  })),
}));

beforeEach(() => {
  initPosthog();
  // Reset sessionStore for test isolation
  for (const key in sessionStore) {
    delete sessionStore[key];
  }
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('posthog.js analytics logic', () => {
  describe('Event validation', () => {
    it('validates a correct funnel_step event', () => {
      const event = {
        stepName: 'F1',
        sessionId: 'abc',
        timestamp: new Date().toISOString(),
      };
      const { error } = validateEvent('funnel_step', event);
      expect(error).toBeNull();
    });
    it('rejects a funnel_step event missing stepName', () => {
      const event = {
        sessionId: 'abc',
        timestamp: new Date().toISOString(),
      };
      const { error } = validateEvent('funnel_step', event);
      expect(error).not.toBeNull();
    });
  });

  describe('PII scrubbing', () => {
    it('removes email, name, phone, userId', () => {
      const obj = {
        email: 'a@b.com',
        name: 'Test',
        phone: '123',
        userId: 'u1',
        keep: 'ok',
      };
      const scrubbed = scrubPII(obj);
      expect(scrubbed).not.toHaveProperty('email');
      expect(scrubbed).not.toHaveProperty('name');
      expect(scrubbed).not.toHaveProperty('phone');
      expect(scrubbed).not.toHaveProperty('userId');
      expect(scrubbed.keep).toBe('ok');
    });
  });

  describe('Session management', () => {
    let session;
    beforeEach(() => {
      session = startSession({ id: 'user1', deviceInfo: { os: 'test' } });
    });
    it('creates and retrieves a session', () => {
      const found = getSession(session.sessionId);
      expect(found).toBeDefined();
      expect(found.userId).toBe('user1');
      expect(found.deviceInfo.os).toBe('test');
    });
    it('ends a session and marks as ended', () => {
      endSession(session.sessionId);
      const ended = getSession(session.sessionId);
      expect(ended).toBeNull();
    });
  });

  describe('Event enrichment', () => {
    it('adds appVersion, environment, deploymentId to events', () => {
      const session = startSession({ id: 'user2' });
      const event = enrichWithSession({ foo: 'bar' }, session.sessionId);
      expect(event.appVersion).toBe('1.2.3');
      expect(event.environment).toBe('test');
      expect(event.deploymentId).toBe('test-deploy');
      expect(event.foo).toBe('bar');
      expect(event.userId).toBe('user2');
    });
  });

  describe('Event tracking', () => {
    let session;
    beforeEach(() => {
      session = startSession({ id: 'user3' });
    });

    it('tracks funnel_step event correctly', () => {
      const spy = vi.spyOn(posthog, 'capture');
      trackFunnelStep('F1', session, { prop: 'value' });
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'funnel_step',
          properties: expect.objectContaining({
            stepName: 'F1',
            sessionId: session.sessionId,
            properties: { prop: 'value' },
          }),
        })
      );
    });

    it('tracks api_latency event correctly', () => {
      const spy = vi.spyOn(posthog, 'capture');
      trackApiLatency('/api/test', 100, 200, session);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'api_latency',
          properties: expect.objectContaining({
            endpoint: '/api/test',
            duration: 100,
            status: 200,
          }),
        })
      );
    });

    it('tracks error_occurred event correctly', () => {
      const spy = vi.spyOn(posthog, 'capture');
      trackErrorOccurred(
        'TypeError',
        'stack trace',
        { context: 'test' },
        session
      );
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'error_occurred',
          properties: expect.objectContaining({
            errorType: 'TypeError',
            stackTrace: 'stack trace',
            context: { context: 'test' },
          }),
        })
      );
    });

    it('tracks user_action event correctly', () => {
      const spy = vi.spyOn(posthog, 'capture');
      trackUserAction('click', 'button', { page: '/home' }, session);
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          event: 'user_action',
          properties: expect.objectContaining({
            actionType: 'click',
            element: 'button',
            pageContext: { page: '/home' },
          }),
        })
      );
    });
  });

  describe('Batching', () => {
    it('batches events according to flushAt', async () => {
      const spy = vi.spyOn(posthog, 'capture');
      const session = startSession({ id: 'user4' });
      for (let i = 0; i < 20; i++) {
        trackFunnelStep(`F${i}`, session);
      }
      await new Promise(res => setTimeout(res, 50));
      // Count only funnel_step events
      const funnelStepCalls = spy.mock.calls.filter(
        ([arg]) => arg && arg.event === 'funnel_step'
      );
      expect(funnelStepCalls).toHaveLength(20);
    });
  });
});
