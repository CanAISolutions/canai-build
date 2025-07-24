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

  try {
    // Import with timeout protection
    const mod = await Promise.race([
      import('../../server'),
      new Promise<never>(
        (_, reject) =>
          setTimeout(() => reject(new Error('Server import timeout')), 20000) // Increased timeout to 20s for test stability
      ),
    ]);

    // eslint-disable-next-line no-console
    console.log('[CORS TEST] beforeEach: before app/server setup');
    app = mod.createApp();

    // Start server with timeout protection
    server = await Promise.race([
      new Promise<import('http').Server>(resolve => {
        const s = app.listen(0, () => resolve(s));
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Server startup timeout')), 5000)
      ),
    ]);

    // eslint-disable-next-line no-console
    console.log('[CORS TEST] beforeEach: completed');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[CORS TEST] beforeEach failed:', error);
    throw error;
  }
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
    expect(res.status).toBe(403);
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
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/CORS: Origin not allowed/);
  });
});
