import { vi, describe, it, expect, beforeAll, afterAll } from 'vitest';

// --- MOCK AI SERVICES TO PREVENT API CALLS IN TEST ENV ---
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

import request from 'supertest';
import express from 'express';
import app from '../../server.js';

const ALLOWED_ORIGIN = 'http://localhost:3000';
const DISALLOWED_ORIGIN = 'http://evil.com';

// Patch process.env for test isolation
beforeAll(() => {
  process.env.CORS_ORIGIN = `${ALLOWED_ORIGIN},http://localhost:5173`;
});
afterAll(() => {
  delete process.env.CORS_ORIGIN;
});

describe('CORS Integration', () => {
  it('allows requests from allowed origin', async () => {
    const res = await request(app)
      .get('/v1/auth/refresh-token')
      .set('Origin', ALLOWED_ORIGIN);
    // Should not be blocked by CORS
    expect(res.status).not.toBe(500);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('blocks requests from disallowed origin', async () => {
    const res = await request(app)
      .get('/v1/auth/refresh-token')
      .set('Origin', DISALLOWED_ORIGIN);
    // Should be blocked by CORS
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/CORS: Origin not allowed/);
  });

  it('supports credentialed requests', async () => {
    const res = await request(app)
      .get('/v1/auth/refresh-token')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Cookie', 'test=1');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('handles preflight OPTIONS requests', async () => {
    const res = await request(app)
      .options('/v1/auth/refresh-token')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Authorization,Content-Type');
    expect(res.status).toBe(204);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(res.headers['access-control-allow-methods']).toMatch(/POST/);
  });

  it('returns clear error for CORS violation', async () => {
    const res = await request(app)
      .get('/v1/auth/refresh-token')
      .set('Origin', DISALLOWED_ORIGIN);
    expect(res.status).toBe(500);
    expect(res.body.error).toMatch(/CORS: Origin not allowed/);
  });
});
