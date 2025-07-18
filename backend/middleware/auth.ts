import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import Sentry from '../services/instrument.js';
import posthog from '../services/posthog.js';
import type { Request, Response, NextFunction } from 'express';

// PRD Alignment: Enforces authentication in production (F2: Discovery Funnel, F4: Purchase Flow, F5: Input Collection)
// - Only allows authenticated users in production
// - Allows all requests in non-production for testing
// - Uses Memberstack JWTs and JWKS for verification
// - Logs all authentication events (success/failure) to Sentry and PostHog
// - Explicit error codes for all failures

const MEMBERSTACK_JWKS_URI =
  process.env['MEMBERSTACK_JWKS_URI'] ||
  'https://api.memberstack.com/.well-known/jwks.json';
// const _NODE_ENV = process.env['NODE_ENV'] || 'development';
const MEMBERSTACK_ISSUER =
  process.env['MEMBERSTACK_ISSUER'] || 'memberstack.com';
const MEMBERSTACK_AUDIENCE = process.env['MEMBERSTACK_AUDIENCE'] || null; // Set if required

const client = jwksClient({
  jwksUri: MEMBERSTACK_JWKS_URI,
  cache: true,
  cacheMaxEntries: 5,
  cacheMaxAge: 10 * 60 * 1000, // 10 minutes
});

function getKey(
  header: jwt.JwtHeader,
  callback: (err: Error | null, key?: string) => void
): void {
  if (!header.kid) {
    callback(new Error('No key ID in header'));
    return;
  }
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
import { pino } from 'pino';
const logger = pino({
  level: 'debug',
  redact: ['req.headers.authorization'],
});

// Add JwtPayload type if not present
interface JwtPayload {
  id?: string;
  email?: string;
  roles?: string[];
  customFields?: Record<string, unknown>;
  [key: string]: unknown;
}

// Use type guards for property access
function isJwtPayload(obj: unknown): obj is JwtPayload {
  return (
    obj &&
    typeof obj === 'object' &&
    obj !== null &&
    ('id' in obj || 'email' in obj || 'roles' in obj)
  );
}

interface MemberstackUser {
  userId: string;
  email: string;
  roles: string[];
  customFields: Record<string, unknown>;
}

interface AuthenticatedRequest extends Request {
  memberstackUser?: MemberstackUser;
  memberstackUserRaw?: JwtPayload;
}

/**
 * Unified Memberstack JWT authentication middleware
 * Accepts JWTs from both Authorization and x-memberstack-token headers
 * Attaches decoded user to req.memberstackUser
 * Logs all events to Sentry and PostHog
 */
export function memberstackAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    if (process.env['NODE_ENV'] !== 'production') {
      // In test/dev, attach a default user context if a JWT is present, or always
      let token = req.headers['x-memberstack-token'] as string;
      if (!token) {
        const authHeader = (req.headers['authorization'] ||
          req.headers['Authorization'] ||
          '') as string;
        token = authHeader.replace(/^Bearer\s+/i, '');
      }
      let userContext: MemberstackUser | undefined;
      if (token) {
        try {
          const decoded = jwt.decode(token);
          if (
            isJwtPayload(decoded) &&
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

    if (process.env['NODE_ENV'] === 'production') {
      logger.info('[auth] Production mode: enforcing Memberstack auth');
    }

    // Accept token from either header
    let token = req.headers['x-memberstack-token'] as string;
    if (!token) {
      const authHeader = (req.headers['authorization'] ||
        req.headers['Authorization'] ||
        '') as string;
      token = authHeader.replace(/^Bearer\s+/i, '');
    }

    if (!token) {
      const error = {
        error: 'Missing authentication token',
        code: 'AUTH_TOKEN_MISSING',
      };
      logger.warn('[auth] ' + error.error);
      if (Sentry && typeof Sentry.captureException === 'function') {
        Sentry.captureException(new Error(error.error), { extra: error });
      }
      posthog.capture({
        distinctId: 'system',
        event: 'auth_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      res.status(401).json(error);
      return;
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
          if (Sentry && typeof Sentry.captureException === 'function') {
            Sentry.captureException(err, { extra: error });
          }
          posthog.capture({
            distinctId: 'system',
            event: 'auth_failure',
            properties: { ...error, timestamp: new Date().toISOString() },
          });
          res.status(status).json(error);
          return;
        }
        // --- Task 8.2: Standardized user context extraction and validation ---
        // Strict validation: check original decoded values
        const isValid =
          isJwtPayload(decoded) &&
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
              userId: isJwtPayload(decoded) ? decoded.id : undefined,
              email: isJwtPayload(decoded) ? decoded.email : undefined,
              roles: isJwtPayload(decoded) ? decoded.roles : undefined,
              customFields: isJwtPayload(decoded)
                ? decoded.customFields
                : undefined,
            },
          };
          logger.warn(`[auth] ${error.code}: ${error.error}`);
          if (Sentry && typeof Sentry.captureException === 'function') {
            Sentry.captureException(new Error(error.error), { extra: error });
          }
          posthog.capture({
            distinctId: 'system',
            event: 'auth_failure',
            properties: { ...error, timestamp: new Date().toISOString() },
          });
          res.status(401).json(error);
          return;
        }
        // Map and validate user context (after strict validation)
        const userContext = isJwtPayload(decoded)
          ? {
              userId: decoded.id,
              email: decoded.email,
              roles: decoded.roles,
              customFields: decoded.customFields || {},
            }
          : undefined;
        if (!userContext) {
          const error = {
            error: 'Invalid or missing user context fields in JWT',
            code: 'AUTH_USER_CONTEXT_INVALID',
            details: {
              userId: isJwtPayload(decoded) ? decoded.id : undefined,
              email: isJwtPayload(decoded) ? decoded.email : undefined,
              roles: isJwtPayload(decoded) ? decoded.roles : undefined,
              customFields: isJwtPayload(decoded)
                ? decoded.customFields
                : undefined,
            },
          };
          logger.warn(`[auth] ${error.code}: ${error.error}`);
          if (Sentry && typeof Sentry.captureException === 'function') {
            Sentry.captureException(new Error(error.error), { extra: error });
          }
          posthog.capture({
            distinctId: 'system',
            event: 'auth_failure',
            properties: { ...error, timestamp: new Date().toISOString() },
          });
          res.status(401).json(error);
          return;
        }
        // Backward compatibility: attach raw JWT for transition period
        req.memberstackUserRaw = decoded;
        // Attach the validated user context
        req.memberstackUser = userContext;

        // Log successful authentication
        logger.info(
          `[auth] User authenticated: ${userContext.userId} (${userContext.email})`
        );
        posthog.capture({
          distinctId: userContext.userId,
          event: 'auth_success',
          properties: {
            userId: userContext.userId,
            email: userContext.email,
            roles: userContext.roles,
            timestamp: new Date().toISOString(),
          },
        });

        next();
      }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown authentication error';
    logger.error(`[auth] Unexpected error: ${errorMessage}`);
    if (Sentry && typeof Sentry.captureException === 'function') {
      Sentry.captureException(error);
    }
    posthog.capture({
      distinctId: 'system',
      event: 'auth_error',
      properties: {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
    });
    res.status(500).json({
      error: 'Internal authentication error',
      code: 'AUTH_INTERNAL_ERROR',
    });
  }
}

// TODO: In future phases, add Make.com signature verification, RBAC, etc.

export default memberstackAuthMiddleware;
