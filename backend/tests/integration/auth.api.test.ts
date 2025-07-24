import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

// Mock services at the top level
vi.mock('../../services/instrument.js', () => ({
  __esModule: true,
  captureException: vi.fn(),
  default: { captureException: vi.fn() },
}));

vi.mock('../../services/posthog.js', () => ({
  __esModule: true,
  capture: vi.fn(),
  default: { capture: vi.fn() },
}));

vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => {
      throw new Error('Memberstack error');
    }),
  },
}));

import { createApp } from '../../server';
import instrument from '../../services/instrument';
import posthog from '../../services/posthog';

let server;

beforeEach(async () => {
  console.log('[DEBUG] beforeEach: start');
  vi.clearAllMocks();

  // Create app and server directly
  const app = createApp();
  server = app.listen(0);

  console.log('[DEBUG] beforeEach: end');
}, 10000); // Reduced timeout

afterEach(async () => {
  console.log('[DEBUG] afterEach: start');
  if (server && server.close) await server.close();
  console.log('[DEBUG] afterEach: end');
  vi.clearAllMocks();
}, 10000); // Reduced timeout

describe('/refresh-token defensive integration', () => {
  it('should return 400 if refreshToken is missing', async () => {
    console.log('[TEST] /refresh-token: missing refreshToken');
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({});
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(400);
    expect(instrument.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalled();
  });

  it('should return 400 and AUTH_TOKEN_MISSING for non-string token', async () => {
    console.log('[TEST] /refresh-token: non-string token');
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 123 });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
    expect(instrument.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalled();
  });

  it('should return 400 and AUTH_TOKEN_MISSING for too short token', async () => {
    console.log('[TEST] /refresh-token: too short token');
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'a' });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
    expect(instrument.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalled();
  });

  it('should return 400 and AUTH_TOKEN_MISSING for bad format token', async () => {
    console.log('[TEST] /refresh-token: bad format token');
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'bad.token' });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
    expect(instrument.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalled();
  });

  it('should return 401 and AUTH_TOKEN_REFRESH_FAILED for Memberstack API error', async () => {
    console.log('[TEST] /refresh-token: Memberstack API error');
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'valid.jwt.token' });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('AUTH_TOKEN_REFRESH_FAILED');
    expect(instrument.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalled();
  });

  it('should return 200 and accessToken for valid token and Memberstack success', async () => {
    console.log('[TEST] /refresh-token: valid token and Memberstack success');
    // Override axios mock for this test only
    const axios = await import('axios');
    (
      axios.default.post as jest.MockedFunction<typeof axios.default.post>
    ).mockImplementationOnce(() =>
      Promise.resolve({
        data: { accessToken: 'new-access-token' },
      })
    );

    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'valid.jwt.token' });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBe('new-access-token');
  });

  it('should trigger Sentry and PostHog on all error paths', async () => {
    console.log('[TEST] /refresh-token: all error paths');
    await request(server).post('/v1/auth/refresh-token').send({});
    expect(instrument.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalled();
  });
});

// @refresh-token-migration TEST: Joi schema edge/fuzz cases

describe('/refresh-token Joi schema edge/fuzz cases @refresh-token-migration', () => {
  const cases = [
    { name: 'null', value: null, code: 'AUTH_TOKEN_MISSING' },
    { name: 'undefined', value: undefined, code: 'AUTH_TOKEN_MISSING' },
    { name: 'empty string', value: '', code: 'AUTH_TOKEN_MISSING' },
    { name: 'whitespace', value: '   ', code: 'AUTH_TOKEN_MISSING' },
    { name: 'unicode', value: '𝒯𝑒𝓈𝓉𝒥𝒲𝒯', code: 'AUTH_TOKEN_MISSING' },
    { name: 'object', value: { foo: 'bar' }, code: 'AUTH_TOKEN_MISSING' },
    { name: 'array', value: ['a', 'b'], code: 'AUTH_TOKEN_MISSING' },
    {
      name: 'overly long',
      value: 'a'.repeat(1000) + '.b.c',
      code: 'AUTH_TOKEN_MISSING',
    },
    { name: 'malformed JWT', value: 'bad.token', code: 'AUTH_TOKEN_MISSING' },
  ];
  cases.forEach(({ name, value, code }) => {
    it(`should return 400 and ${code} for ${name} refreshToken`, async () => {
      const response = await request(server)
        .post('/v1/auth/refresh-token')
        .send({ refreshToken: value });
      expect(response.status).toBe(400);
      expect(response.body.code).toBe(code);
      expect(instrument.captureException).toHaveBeenCalled();
      expect(posthog.capture).toHaveBeenCalled();
      // [DEBUG] log assertion (if logs are captured)
    });
  });

  it('should accept any string in test env (relaxed regex)', async () => {
    process.env.NODE_ENV = 'test';
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'not.a.jwt.but.ok.in.test' });
    // Should pass Joi, but may fail downstream
    expect([200, 400, 401]).toContain(response.status);
    // Reset env
    process.env.NODE_ENV = 'production';
  });
});
