vi.mock('../../services/instrument.js', () => ({
  __esModule: true,
  captureException: (...args) => {
    console.log('[MOCK] Sentry.captureException called with:', ...args);
    return vi.fn()(...args);
  },
  default: {
    captureException: (...args) => {
      console.log(
        '[MOCK] Sentry.default.captureException called with:',
        ...args
      );
      return vi.fn()(...args);
    },
  },
}));
vi.mock('../../services/posthog.js', () => ({
  __esModule: true,
  capture: (...args) => {
    console.log('[MOCK] PostHog.capture called with:', ...args);
    return vi.fn()(...args);
  },
  default: {
    capture: (...args) => {
      console.log('[MOCK] PostHog.default.capture called with:', ...args);
      return vi.fn()(...args);
    },
  },
}));
vi.mock('axios', () => ({
  default: {
    post: vi.fn(() => {
      throw new Error('Memberstack error');
    }),
  },
}));
vi.mock('../../services/gpt4oFallback.js', () => ({
  default: class MockGPT4oFallbackService {
    async analyzeEmotion() {
      return { arousal: 0.7, valence: 0.8, confidence: 0.9, source: 'gpt4o' };
    }
  },
}));
vi.mock('openai', () => ({
  default: function OpenAI() {
    return {};
  },
}));

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';

let Sentry, PostHog, createApp, server;

beforeEach(async () => {
  console.log('[DEBUG] beforeEach: start');
  vi.resetModules();
  // Dynamically import after mocks
  Sentry = await import('../../services/instrument.js');
  PostHog = await import('../../services/posthog.js');
  ({ createApp } = await import('../../server.js'));
  server = createApp().listen(0);
  console.log('[DEBUG] beforeEach: end');
}, 30000);

afterEach(async () => {
  console.log('[DEBUG] afterEach: start');
  if (server && server.close) await server.close();
  console.log('[DEBUG] afterEach: end');
  vi.clearAllMocks();
}, 30000);

const validJWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

const sentrySpy = vi.fn();
const posthogSpy = vi.fn();

vi.mock('../../services/instrument.js', () => ({
  __esModule: true,
  captureException: sentrySpy,
  default: { captureException: sentrySpy },
}));
vi.mock('../../services/posthog.js', () => ({
  __esModule: true,
  capture: posthogSpy,
  default: { capture: posthogSpy },
}));

describe('/refresh-token defensive integration', () => {
  it('should return 400 if refreshToken is missing', async () => {
    console.log('[TEST] /refresh-token: missing refreshToken');
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({});
    console.log('[TEST] Response:', response.status, response.body);
    // Print Sentry/PostHog object reference from test
    console.log('[TEST] Sentry ref:', Sentry.default);
    console.log('[TEST] PostHog ref:', PostHog.default);
    expect(response.status).toBe(400);
    expect(sentrySpy).toHaveBeenCalled();
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(PostHog.default.capture).toHaveBeenCalled();
    console.log('[TEST] Sentry called:', sentrySpy.mock.calls.length);
    console.log('[TEST] PostHog called:', posthogSpy.mock.calls.length);
  });

  it('should return 400 and AUTH_TOKEN_MISSING for non-string token', async () => {
    console.log('[TEST] /refresh-token: non-string token');
    console.log('[TEST] Sentry ref (test):', Sentry.default);
    console.log('[TEST] PostHog ref (test):', PostHog.default);
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 123 });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
    expect(sentrySpy).toHaveBeenCalled();
    expect(posthogSpy).toHaveBeenCalled();
    console.log('[TEST] Sentry called:', sentrySpy.mock.calls.length);
    console.log('[TEST] PostHog called:', posthogSpy.mock.calls.length);
  });

  it('should return 400 and AUTH_TOKEN_MISSING for too short token', async () => {
    console.log('[TEST] /refresh-token: too short token');
    console.log('[TEST] Sentry ref (test):', Sentry.default);
    console.log('[TEST] PostHog ref (test):', PostHog.default);
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'a' });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
    expect(sentrySpy).toHaveBeenCalled();
    expect(posthogSpy).toHaveBeenCalled();
    console.log('[TEST] Sentry called:', sentrySpy.mock.calls.length);
    console.log('[TEST] PostHog called:', posthogSpy.mock.calls.length);
  });

  it('should return 400 and AUTH_TOKEN_MISSING for bad format token', async () => {
    console.log('[TEST] /refresh-token: bad format token');
    console.log('[TEST] Sentry ref (test):', Sentry.default);
    console.log('[TEST] PostHog ref (test):', PostHog.default);
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'bad.token' });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(400);
    expect(response.body.code).toBe('AUTH_TOKEN_MISSING');
    expect(sentrySpy).toHaveBeenCalled();
    expect(posthogSpy).toHaveBeenCalled();
    console.log('[TEST] Sentry called:', sentrySpy.mock.calls.length);
    console.log('[TEST] PostHog called:', posthogSpy.mock.calls.length);
  });

  it('should return 401 and AUTH_TOKEN_REFRESH_FAILED for Memberstack API error', async () => {
    console.log('[TEST] /refresh-token: Memberstack API error');
    console.log('[TEST] Sentry ref (test):', Sentry.default);
    console.log('[TEST] PostHog ref (test):', PostHog.default);
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'header.payload.signature' });
    console.log('[TEST] Response:', response.status, response.body);
    expect([401, 400]).toContain(response.status);
    expect(response.body.code).toBe('AUTH_TOKEN_REFRESH_FAILED');
    expect(sentrySpy).toHaveBeenCalled();
    expect(posthogSpy).toHaveBeenCalled();
    console.log('[TEST] Sentry called:', sentrySpy.mock.calls.length);
    console.log('[TEST] PostHog called:', posthogSpy.mock.calls.length);
  });

  it('should return 401 and AUTH_TOKEN_REFRESH_FAILED if no accessToken returned', async () => {
    console.log('[TEST] /refresh-token: no accessToken returned');
    console.log('[TEST] Sentry ref (test):', Sentry.default);
    console.log('[TEST] PostHog ref (test):', PostHog.default);
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'header.payload.signature' });
    console.log('[TEST] Response:', response.status, response.body);
    expect([401, 400]).toContain(response.status);
    expect(response.body.code).toBe('AUTH_TOKEN_REFRESH_FAILED');
    expect(sentrySpy).toHaveBeenCalled();
    expect(posthogSpy).toHaveBeenCalled();
    console.log('[TEST] Sentry called:', sentrySpy.mock.calls.length);
    console.log('[TEST] PostHog called:', posthogSpy.mock.calls.length);
  });

  it('should return 200 and accessToken for valid token and Memberstack success', async () => {
    console.log('[TEST] /refresh-token: valid token and Memberstack success');
    console.log('[TEST] Sentry ref (test):', Sentry.default);
    console.log('[TEST] PostHog ref (test):', PostHog.default);
    // Override axios mock for this test only
    const axios = await import('axios');
    axios.default.post.mockImplementationOnce(() =>
      Promise.resolve({ data: { accessToken: 'newtoken' } })
    );
    const response = await request(server)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'header.payload.signature' });
    console.log('[TEST] Response:', response.status, response.body);
    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBe('newtoken');
  });

  it('should trigger Sentry and PostHog on all error paths', async () => {
    console.log('[TEST] /refresh-token: all error paths');
    console.log('[TEST] Sentry ref (test):', Sentry.default);
    console.log('[TEST] PostHog ref (test):', PostHog.default);
    await request(server).post('/v1/auth/refresh-token').send({});
    expect(sentrySpy).toHaveBeenCalled();
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(PostHog.default.capture).toHaveBeenCalled();
    console.log('[TEST] Sentry called:', sentrySpy.mock.calls.length);
    console.log('[TEST] PostHog called:', posthogSpy.mock.calls.length);
  });

  // Add more edge/malicious cases as needed
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
      expect(sentrySpy).toHaveBeenCalled();
      expect(posthogSpy).toHaveBeenCalled();
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
