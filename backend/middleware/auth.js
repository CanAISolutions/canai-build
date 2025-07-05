import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import Sentry from '../services/instrument.js';
import posthog from '../services/posthog.js';
import log from '../api/src/Shared/Logger';

// PRD Alignment: Enforces authentication in production (F2: Discovery Funnel, F4: Purchase Flow, F5: Input Collection)
// - Only allows authenticated users in production
// - Allows all requests in non-production for testing
// - Uses Memberstack JWTs and JWKS for verification
// - Logs all authentication events (success/failure) to Sentry and PostHog
// - Explicit error codes for all failures

const MEMBERSTACK_JWKS_URI =
  process.env.MEMBERSTACK_JWKS_URI ||
  'https://api.memberstack.com/.well-known/jwks.json';
const NODE_ENV = process.env.NODE_ENV || 'development';
const MEMBERSTACK_ISSUER = process.env.MEMBERSTACK_ISSUER || 'memberstack.com';
const MEMBERSTACK_AUDIENCE = process.env.MEMBERSTACK_AUDIENCE || undefined; // Set if required

const client = jwksClient({
  jwksUri: MEMBERSTACK_JWKS_URI,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

/**
 * Unified Memberstack JWT authentication middleware
 * Accepts JWTs from both Authorization and x-memberstack-token headers
 * Attaches decoded user to req.memberstackUser
 * Logs all events to Sentry and PostHog
 */
export function memberstackAuthMiddleware(req, res, next) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      log.debug('[auth] Non-production mode: bypassing Memberstack auth');
      return next();
    }

    // Accept token from either header
    let token = req.headers['x-memberstack-token'];
    if (!token) {
      const authHeader =
        req.headers['authorization'] || req.headers['Authorization'] || '';
      token = authHeader.replace(/^Bearer\s+/i, '');
    }

    if (!token) {
      const error = {
        error: 'Missing authentication token',
        code: 'AUTH_TOKEN_MISSING',
      };
      log.warn('[auth] ' + error.error);
      Sentry.captureException(new Error(error.error), { extra: error });
      posthog.capture({
        distinctId: 'system',
        event: 'auth_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      return res.status(401).json(error);
    }

    jwt.verify(
      token,
      getKey,
      {
        algorithms: ['RS256'],
        audience: MEMBERSTACK_AUDIENCE,
        issuer: MEMBERSTACK_ISSUER,
      },
      (err, decoded) => {
        if (err) {
          let errorCode = 'AUTH_TOKEN_INVALID';
          let status = 403;
          if (err.name === 'TokenExpiredError') {
            errorCode = 'AUTH_TOKEN_EXPIRED';
            status = 401;
          }
          const error = {
            error: err.message,
            code: errorCode,
          };
          log.warn(`[auth] ${error.code}: ${error.error}`);
          Sentry.captureException(err, { extra: error });
          posthog.capture({
            distinctId: 'system',
            event: 'auth_failure',
            properties: { ...error, timestamp: new Date().toISOString() },
          });
          return res.status(status).json(error);
        }
        req.memberstackUser = decoded;
        log.info(`[auth] Auth success for user ${decoded.id || decoded.sub}`);
        posthog.capture({
          distinctId: decoded.id || decoded.sub || 'unknown',
          event: 'auth_success',
          properties: {
            userId: decoded.id || decoded.sub,
            timestamp: new Date().toISOString(),
          },
        });
        return next();
      }
    );
  } catch (error) {
    const errorDetails = {
      error: 'Internal server error during authentication',
      code: 'AUTH_INTERNAL_ERROR',
      message: error.message,
    };
    log.error(`[auth] ${errorDetails.code}: ${error.message}`);
    Sentry.captureException(error, { extra: errorDetails });
    posthog.capture({
      distinctId: 'system',
      event: 'auth_failure',
      properties: { ...errorDetails, timestamp: new Date().toISOString() },
    });
    return res.status(500).json(errorDetails);
  }
}

// TODO: In future phases, add Make.com signature verification, RBAC, etc.

export default memberstackAuthMiddleware;
