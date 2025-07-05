import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { memberstackAuthMiddleware } from '../../middleware/auth.js';
import jwt from 'jsonwebtoken';
import Sentry from '../../services/instrument.js';
import posthog from '../../services/posthog.js';
import log from '../../api/src/Shared/Logger';

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn(),
  },
  verify: vi.fn(),
}));
vi.mock('../../services/instrument.js');
vi.mock('../../services/posthog.js');
vi.mock('../../api/src/Shared/Logger');

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
    expect(Sentry.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
  });

  it('accepts token from Authorization header', () => {
    console.log('TEST: accepts token from Authorization header');
    req.headers['authorization'] = 'Bearer validtoken';
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, { id: 'user123' })
    );
    memberstackAuthMiddleware(req, res, next);
    expect(jwt.verify).toHaveBeenCalledWith(
      'validtoken',
      expect.any(Function),
      expect.objectContaining({ algorithms: ['RS256'] }),
      expect.any(Function)
    );
    expect(next).toHaveBeenCalled();
    expect(req.memberstackUser).toEqual({ id: 'user123' });
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_success' })
    );
    expect(res.status).not.toHaveBeenCalled();
  });

  it('accepts token from x-memberstack-token header', () => {
    console.log('TEST: accepts token from x-memberstack-token header');
    req.headers['x-memberstack-token'] = 'validtoken';
    vi.spyOn(jwt, 'verify').mockImplementation((token, getKey, opts, cb) =>
      cb(null, { id: 'user456' })
    );
    memberstackAuthMiddleware(req, res, next);
    expect(jwt.verify).toHaveBeenCalledWith(
      'validtoken',
      expect.any(Function),
      expect.objectContaining({ algorithms: ['RS256'] }),
      expect.any(Function)
    );
    expect(next).toHaveBeenCalled();
    expect(req.memberstackUser).toEqual({ id: 'user456' });
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
    expect(Sentry.captureException).toHaveBeenCalled();
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
    expect(Sentry.captureException).toHaveBeenCalled();
    expect(posthog.capture).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'auth_failure' })
    );
  });
});
