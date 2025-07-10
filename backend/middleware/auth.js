import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import * as Sentry from '../services/instrument.js';
import posthog from '../services/posthog.js';

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
const MEMBERSTACK_AUDIENCE = process.env.MEMBERSTACK_AUDIENCE || null; // Set if required

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

// Attach a pino logger (do not assign to Sentry.logger)
import pino from 'pino';
const logger = pino({
  level: 'debug',
  redact: ['req.headers.authorization'],
});

/**
 * Unified Memberstack JWT authentication middleware
 * Accepts JWTs from both Authorization and x-memberstack-token headers
 * Attaches decoded user to req.memberstackUser
 * Logs all events to Sentry and PostHog
 */
export function memberstackAuthMiddleware(req, res, next) {
  try {
    if (process.env.NODE_ENV !== 'production') {
      // In test/dev, attach a default user context if a JWT is present, or always
      let token = req.headers['x-memberstack-token'];
      if (!token) {
        const authHeader =
          req.headers['authorization'] || req.headers['Authorization'] || '';
        token = authHeader.replace(/^Bearer\s+/i, '');
      }
      let userContext;
      if (token) {
        try {
          const decoded = jwt.decode(token);
          if (
            decoded &&
            decoded.id &&
            decoded.email &&
            Array.isArray(decoded.roles)
          ) {
            userContext = {
              userId: decoded.id,
              email: decoded.email,
              roles: decoded.roles,
              customFields: decoded.customFields || {},
            };
          }
        } catch (e) {
          // ignore decode errors in test
        }
      }
      if (!userContext) {
        // fallback: always attach a default user for test/dev
        userContext = {
          userId: 'test-user',
          email: 'test@example.com',
          roles: ['user'],
          customFields: {},
        };
      }
      req.memberstackUser = userContext;
      return next();
    }

    if (process.env.NODE_ENV === 'production') {
      logger.debug('[auth] Production mode: enforcing Memberstack auth');
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
      logger.warn('[auth] ' + error.error);
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
        issuer: MEMBERSTACK_ISSUER,
        ...(MEMBERSTACK_AUDIENCE && { audience: MEMBERSTACK_AUDIENCE }),
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
          logger.warn(`[auth] ${error.code}: ${error.error}`);
          Sentry.captureException(err, { extra: error });
          posthog.capture({
            distinctId: 'system',
            event: 'auth_failure',
            properties: { ...error, timestamp: new Date().toISOString() },
          });
          return res.status(status).json(error);
        }
        // --- Task 8.2: Standardized user context extraction and validation ---
        // Strict validation: check original decoded values
        const isValid =
          typeof decoded.id === 'string' &&
          decoded.id.length > 0 &&
          typeof decoded.email === 'string' &&
          decoded.email.length > 0 &&
          Array.isArray(decoded.roles) &&
          typeof decoded.customFields === 'object' &&
          decoded.customFields !== null;
        if (!isValid) {
          const error = {
            error: 'Invalid or missing user context fields in JWT',
            code: 'AUTH_USER_CONTEXT_INVALID',
            details: {
              userId: decoded.id,
              email: decoded.email,
              roles: decoded.roles,
              customFields: decoded.customFields,
            },
          };
          logger.warn(`[auth] ${error.code}: ${error.error}`);
          Sentry.captureException(new Error(error.error), { extra: error });
          posthog.capture({
            distinctId: 'system',
            event: 'auth_failure',
            properties: { ...error, timestamp: new Date().toISOString() },
          });
          return res.status(401).json(error);
        }
        // Map and validate user context (after strict validation)
        const userContext = {
          userId: decoded.id,
          email: decoded.email,
          roles: decoded.roles,
          customFields: decoded.customFields,
        };
        req.memberstackUser = userContext;
        // Backward compatibility: attach raw JWT for transition period
        req.memberstackUserRaw = decoded;
        logger.info(`[auth] Auth success for user ${userContext.userId}`);
        posthog.capture({
          distinctId: userContext.userId || 'unknown',
          event: 'auth_success',
          properties: {
            userId: userContext.userId,
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
    logger.error(`[auth] ${errorDetails.code}: ${error.message}`);
    Sentry.captureException(error, { extra: errorDetails });
    posthog.capture({
      distinctId: 'system',
      event: 'auth_failure',
      properties: { ...errorDetails, timestamp: new Date().toISOString() },
    });
    const isProd = NODE_ENV === 'production';
    return res.status(500).json({
      error: isProd ? 'An internal error occurred' : errorDetails.error,
      code: errorDetails.code,
      ...(isProd ? {} : { message: errorDetails.message }),
    });
  }
}

// TODO: In future phases, add Make.com signature verification, RBAC, etc.

export default memberstackAuthMiddleware;
