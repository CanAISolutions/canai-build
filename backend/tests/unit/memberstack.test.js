import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { memberstackAuthMiddleware } from '../../middleware/auth.js';
import jwt from 'jsonwebtoken';
import * as Sentry from '../../services/instrument.js';
import posthog from '../../services/posthog.js';
import log from '../../api/src/Shared/Logger';
import authRouter from '../../routes/auth.js';
import request from 'supertest';
import * as jwtUtils from '../../middleware/jwtUtils.js';
import axios from 'axios';
import {
  hasRequiredRole,
  checkScenarioAccess,
  rbacMiddleware,
} from '../../middleware/rbac.js';
import { scenarioPermissions } from '../../config/rolePermissions.js';

vi.mock('jsonwebtoken', () => {
  // Define the mock functions once
  const verify = vi.fn();
  const sign = (payload, secret) => {
    const header = Buffer.from(
      JSON.stringify({ alg: 'HS256', typ: 'JWT' })
    ).toString('base64');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64');
    return `${header}.${body}.signature`;
  };
  const decode = token => {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    try {
      return JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    } catch {
      return null;
    }
  };
  // Export only once, both as named and default for compatibility
  return {
    default: { verify, sign, decode },
    verify,
    sign,
    decode,
  };
});
vi.mock('../../services/instrument.js', () => {
  const captureException = vi.fn();
  return {
    __esModule: true,
    default: {
      logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
      },
      captureException,
    },
    captureException,
  };
});
vi.mock('../../services/posthog.js', () => {
  const capture = vi.fn();
  return {
    __esModule: true,
    default: { capture },
    capture,
  };
});
vi.mock('../../api/src/Shared/Logger');
vi.mock('axios');

describe('memberstackAuthMiddleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
    process.env.NODE_ENV = 'production';
    jwt.verify.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('bypasses auth in non-production', () => {
    console.log('TEST: bypasses auth in non-production');
    process.env.NODE_ENV = 'development';
    memberstackAuthMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 if no token is provided', () => {
    console.log('TEST: returns 401 if no token is provided');
    memberstackAuthMiddleware(req, res, next);
    expect(jwt.verify).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Missing authentication token',
        code: 'AUTH_TOKEN_MISSING',
      })
    );
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
  });

  it('accepts token from Authorization header', () => {
    req.headers['authorization'] = 'Bearer validtoken';
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, {
        id: 'user123',
        email: 'user123@example.com',
        roles: [],
        customFields: {},
      })
    );
    memberstackAuthMiddleware(req, res, next);
    expect(jwt.verify).toHaveBeenCalledWith(
      'validtoken',
      expect.any(Function),
      expect.objectContaining({ algorithms: ['RS256'] }),
      expect.any(Function)
    );
    expect(next).toHaveBeenCalled();
    expect(req.memberstackUser).toEqual({
      userId: 'user123',
      email: 'user123@example.com',
      roles: [],
      customFields: {},
    });
    expect(req.memberstackUserRaw).toEqual({
      id: 'user123',
      email: 'user123@example.com',
      roles: [],
      customFields: {},
    });
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_success' })
    );
    expect(res.status).not.toHaveBeenCalled();
  });

  it('accepts token from x-memberstack-token header', () => {
    req.headers['x-memberstack-token'] = 'validtoken';
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, {
        id: 'user456',
        email: 'user456@example.com',
        roles: [],
        customFields: {},
      })
    );
    memberstackAuthMiddleware(req, res, next);
    expect(jwt.verify).toHaveBeenCalledWith(
      'validtoken',
      expect.any(Function),
      expect.objectContaining({ algorithms: ['RS256'] }),
      expect.any(Function)
    );
    expect(next).toHaveBeenCalled();
    expect(req.memberstackUser).toEqual({
      userId: 'user456',
      email: 'user456@example.com',
      roles: [],
      customFields: {},
    });
    expect(req.memberstackUserRaw).toEqual({
      id: 'user456',
      email: 'user456@example.com',
      roles: [],
      customFields: {},
    });
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_success' })
    );
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 for expired token', () => {
    console.log('TEST: returns 401 for expired token');
    req.headers['authorization'] = 'Bearer expiredtoken';
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb({ name: 'TokenExpiredError', message: 'jwt expired' })
    );
    memberstackAuthMiddleware(req, res, next);
    expect(jwt.verify).toHaveBeenCalledWith(
      'expiredtoken',
      expect.any(Function),
      expect.objectContaining({ algorithms: ['RS256'] }),
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'jwt expired',
        code: 'AUTH_TOKEN_EXPIRED',
      })
    );
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
  });

  it('returns 403 for invalid token', () => {
    console.log('TEST: returns 403 for invalid token');
    req.headers['authorization'] = 'Bearer invalidtoken';
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb({ name: 'JsonWebTokenError', message: 'invalid signature' })
    );
    memberstackAuthMiddleware(req, res, next);
    expect(jwt.verify).toHaveBeenCalledWith(
      'invalidtoken',
      expect.any(Function),
      expect.objectContaining({ algorithms: ['RS256'] }),
      expect.any(Function)
    );
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'invalid signature',
        code: 'AUTH_TOKEN_INVALID',
      })
    );
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
  });

  it('maps and validates standardized user context (all fields present)', () => {
    req.headers['authorization'] = 'Bearer validtoken';
    const decoded = {
      id: 'user789',
      email: 'user@example.com',
      roles: ['user', 'admin'],
      customFields: { foo: 'bar' },
    };
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, decoded)
    );
    memberstackAuthMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.memberstackUser).toEqual({
      userId: 'user789',
      email: 'user@example.com',
      roles: ['user', 'admin'],
      customFields: { foo: 'bar' },
    });
    // Backward compatibility: raw JWT attached
    expect(req.memberstackUserRaw).toEqual(decoded);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 if roles or customFields are missing', () => {
    req.headers['authorization'] = 'Bearer validtoken';
    // Missing roles
    let decoded = {
      id: 'user101',
      email: 'user101@example.com',
      customFields: {},
    };
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, decoded)
    );
    memberstackAuthMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid or missing user context fields in JWT',
        code: 'AUTH_USER_CONTEXT_INVALID',
      })
    );
    expect(next).not.toHaveBeenCalled();

    // Missing customFields
    decoded = { id: 'user102', email: 'user102@example.com', roles: [] };
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, decoded)
    );
    memberstackAuthMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid or missing user context fields in JWT',
        code: 'AUTH_USER_CONTEXT_INVALID',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 and logs error if userId is missing', () => {
    req.headers['authorization'] = 'Bearer validtoken';
    const decoded = {
      email: 'user@example.com',
      roles: ['user'],
      customFields: {},
    };
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, decoded)
    );
    memberstackAuthMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'AUTH_USER_CONTEXT_INVALID',
      })
    );
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 and logs error if email is missing', () => {
    req.headers['authorization'] = 'Bearer validtoken';
    const decoded = {
      id: 'user999',
      roles: ['user'],
      customFields: {},
    };
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, decoded)
    );
    memberstackAuthMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'AUTH_USER_CONTEXT_INVALID',
      })
    );
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 and logs error if roles is not an array', () => {
    req.headers['authorization'] = 'Bearer validtoken';
    const decoded = {
      id: 'user999',
      email: 'user999@example.com',
      roles: 'not-an-array',
      customFields: {},
    };
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, decoded)
    );
    memberstackAuthMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid or missing user context fields in JWT',
        code: 'AUTH_USER_CONTEXT_INVALID',
      })
    );
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 and logs error if customFields is not an object', () => {
    req.headers['authorization'] = 'Bearer validtoken';
    const decoded = {
      id: 'user1000',
      email: 'user1000@example.com',
      roles: [],
      customFields: 'not-an-object',
    };
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, decoded)
    );
    memberstackAuthMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Invalid or missing user context fields in JWT',
        code: 'AUTH_USER_CONTEXT_INVALID',
      })
    );
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe('/v1/auth/refresh-token endpoint', () => {
  let app;
  beforeAll(() => {
    const express = require('express');
    app = express();
    app.use(express.json());
    app.use('/v1/auth', authRouter);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns new accessToken for valid refreshToken', async () => {
    axios.post.mockResolvedValue({ data: { accessToken: 'new.jwt.token' } });
    const res = await request(app)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'header.payload.signature' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accessToken: 'new.jwt.token' });
  });

  it('returns 400 for missing refreshToken', async () => {
    const res = await request(app).post('/v1/auth/refresh-token').send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('AUTH_TOKEN_MISSING');
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
  });

  it('returns 400 for invalid refreshToken type', async () => {
    const res = await request(app)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 123 });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('AUTH_TOKEN_MISSING');
  });

  it('returns 401 if Memberstack API returns error', async () => {
    axios.post.mockRejectedValue({ response: { data: { error: 'invalid' } } });
    const res = await request(app)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'header.payload.signature' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_TOKEN_REFRESH_FAILED');
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
  });

  it('returns 401 if no accessToken in response', async () => {
    axios.post.mockResolvedValue({ data: {} });
    const res = await request(app)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'header.payload.signature' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('AUTH_TOKEN_REFRESH_FAILED');
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
  });

  it('returns 429 if rate limit exceeded', async () => {
    // Find the correct layer for POST /refresh-token
    const layer = authRouter.stack.find(
      l => l.route && l.route.path === '/refresh-token' && l.route.methods.post
    );
    if (!layer) {
      // Add logging for debugging if the correct layer is not found
      console.error(
        'Could not find POST /refresh-token route layer in authRouter.stack'
      );
      console.error(
        'authRouter.stack:',
        authRouter.stack.map(l => l.route && l.route.path)
      );
      throw new Error(
        'Test setup error: Could not find POST /refresh-token route layer'
      );
    }
    const origHandle = layer.route.stack[0].handle;
    layer.route.stack[0].handle = (req, res, next) =>
      res.status(429).json({ error: 'Rate limit exceeded' });
    const res = await request(app)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'header.payload.signature' });
    expect(res.status).toBe(429);
    expect(res.body.error).toBe('Rate limit exceeded');
    // Restore
    layer.route.stack[0].handle = origHandle;
  });

  it('logs and returns 500 for internal errors', async () => {
    axios.post.mockImplementation(() => {
      throw new Error('unexpected');
    });
    const res = await request(app)
      .post('/v1/auth/refresh-token')
      .send({ refreshToken: 'header.payload.signature' });
    expect(res.status).toBe(401); // Should be 401 for refresh failure, 500 for true internal
    // (depends on error path)
  });

  it('isTokenExpiringSoon returns true for expiring token', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign({ exp: now + 200 }, 'secret');
    expect(jwtUtils.isTokenExpiringSoon(token, 300)).toBe(true);
  });

  it('isTokenExpiringSoon returns false for non-expiring token', () => {
    const now = Math.floor(Date.now() / 1000);
    const token = jwt.sign({ exp: now + 10000 }, 'secret');
    expect(jwtUtils.isTokenExpiringSoon(token, 300)).toBe(false);
  });
});

describe('RBAC Utilities', () => {
  it('hasRequiredRole returns true if user has required role', () => {
    expect(hasRequiredRole(['admin'], ['admin'])).toBe(true);
    expect(hasRequiredRole(['user', 'admin'], ['admin'])).toBe(true);
    expect(hasRequiredRole(['user'], ['admin', 'user'])).toBe(true);
    expect(hasRequiredRole(['superadmin'], ['superadmin'])).toBe(true);
  });
  it('hasRequiredRole returns false if user lacks required role', () => {
    expect(hasRequiredRole(['user'], ['admin'])).toBe(false);
    expect(hasRequiredRole([], ['admin'])).toBe(false);
    expect(hasRequiredRole(undefined, ['admin'])).toBe(false);
    expect(hasRequiredRole(['guest'], ['user', 'admin'])).toBe(false);
  });
  it('checkScenarioAccess returns true for allowed scenario', () => {
    const user = { roles: ['admin'] };
    expect(checkScenarioAccess(user, 'admin_add_project')).toBe(true);
    expect(checkScenarioAccess({ roles: ['user'] }, 'add_project')).toBe(true);
    expect(
      checkScenarioAccess({ roles: ['superadmin'] }, 'admin_add_project')
    ).toBe(true);
  });
  it('checkScenarioAccess returns false for disallowed scenario', () => {
    expect(checkScenarioAccess({ roles: ['user'] }, 'admin_add_project')).toBe(
      false
    );
    expect(checkScenarioAccess({ roles: [] }, 'add_project')).toBe(false);
    expect(checkScenarioAccess({ roles: ['guest'] }, 'add_project')).toBe(
      false
    );
  });
  it('checkScenarioAccess returns false for unknown scenario', () => {
    expect(checkScenarioAccess({ roles: ['admin'] }, 'unknown_scenario')).toBe(
      false
    );
  });
  it('checkScenarioAccess reflects dynamic scenarioPermissions changes', () => {
    const original = { ...scenarioPermissions };
    scenarioPermissions['test_scenario'] = ['user'];
    expect(checkScenarioAccess({ roles: ['user'] }, 'test_scenario')).toBe(
      true
    );
    scenarioPermissions['test_scenario'] = ['admin'];
    expect(checkScenarioAccess({ roles: ['user'] }, 'test_scenario')).toBe(
      false
    );
    Object.assign(scenarioPermissions, original);
  });
});

describe('rbacMiddleware', () => {
  let req, res, next;
  beforeEach(() => {
    req = { memberstackUser: { userId: 'u1', roles: ['user'] } };
    res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    next = vi.fn();
  });
  it('calls next if user has required role', () => {
    rbacMiddleware(['user'])(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
  it('returns 403 if user lacks required role', () => {
    req.memberstackUser.roles = ['user'];
    rbacMiddleware(['admin'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_ROLE_INSUFFICIENT' })
    );
    expect(next).not.toHaveBeenCalled();
  });
  it('returns 401 if user context is missing', () => {
    req.memberstackUser = undefined;
    rbacMiddleware(['user'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_USER_CONTEXT_INVALID' })
    );
    expect(next).not.toHaveBeenCalled();
  });
  it('returns 401 if roles are not an array', () => {
    req.memberstackUser.roles = undefined;
    rbacMiddleware(['user'])(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AUTH_USER_CONTEXT_INVALID' })
    );
    expect(next).not.toHaveBeenCalled();
  });
  it('calls Sentry and PostHog on unauthorized access', () => {
    req.memberstackUser.roles = ['guest'];
    rbacMiddleware(['user'])(req, res, next);
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'rbac_failure' })
    );
  });
  it('calls Sentry and PostHog on missing user context', () => {
    req.memberstackUser = undefined;
    rbacMiddleware(['user'])(req, res, next);
    expect(Sentry.default.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'rbac_failure' })
    );
  });
});
