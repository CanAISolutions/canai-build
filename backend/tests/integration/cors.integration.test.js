vi.mock('../../services/gpt4oFallback.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    analyzeEmotion: vi.fn().mockResolvedValue({
      arousal: 0.5,
      valence: 0.5,
      confidence: 0.5,
    }),
  })),
}));
vi.mock('../../services/hume.js', () => ({
  default: vi.fn().mockImplementation(() => ({
    analyzeEmotion: vi.fn().mockResolvedValue({
      arousal: 0.5,
      valence: 0.5,
      confidence: 0.5,
    }),
    circuitBreaker: { isOpen: vi.fn().mockReturnValue(false), state: 'CLOSED' },
  })),
}));
vi.mock('../../services/instrument.js', () => ({
  captureException: vi.fn(),
  default: { captureException: vi.fn() },
}));
vi.mock('../../services/posthog.js', () => ({
  capture: vi.fn(),
  default: { capture: vi.fn() },
}));

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

let server;
let app;

beforeEach(async () => {
  // Diagnostic logging for timeout root cause
  // eslint-disable-next-line no-console
  console.log('[CORS TEST] beforeEach: starting');
  vi.clearAllMocks();
  // eslint-disable-next-line no-console
  console.log('[CORS TEST] beforeEach: after clearAllMocks');
  vi.resetModules();
  // eslint-disable-next-line no-console
  console.log('[CORS TEST] beforeEach: after resetModules');
  // (Assume app/server setup here)
  // eslint-disable-next-line no-console
  console.log('[CORS TEST] beforeEach: before app/server setup');
  const mod = await import('../../server.js');
  app = mod.createApp();
  server = app.listen(0);
  // eslint-disable-next-line no-console
  console.log('[CORS TEST] beforeEach: completed');
}, 20000); // Increase timeout to 20s
afterEach(async () => {
  if (server && server.close) {
    await new Promise(resolve => server.close(resolve));
    server = null;
  }
});

const ALLOWED_ORIGIN = 'http://localhost:3000';
const DISALLOWED_ORIGIN = 'http://evil.com';

describe('CORS Integration', () => {
  it('allows requests from allowed origin', async () => {
    const res = await request(server)
      .get('/v1/auth/refresh-token')
      .set('Origin', ALLOWED_ORIGIN);
    expect(res.status).not.toBe(500);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('blocks requests from disallowed origin', async () => {
    const res = await request(server)
      .get('/v1/auth/refresh-token')
      .set('Origin', DISALLOWED_ORIGIN);
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/CORS: Origin not allowed/);
  });

  it('supports credentialed requests', async () => {
    const res = await request(server)
      .get('/v1/auth/refresh-token')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Cookie', 'test=1');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('handles preflight OPTIONS requests', async () => {
    const res = await request(server)
      .options('/v1/auth/refresh-token')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Authorization,Content-Type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(res.headers['access-control-allow-methods']).toMatch(/POST/);
  });

  it('returns clear error for CORS violation', async () => {
    const res = await request(server)
      .get('/v1/auth/refresh-token')
      .set('Origin', DISALLOWED_ORIGIN);
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/CORS: Origin not allowed/);
  });
});
