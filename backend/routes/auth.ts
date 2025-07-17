import express from 'express';
import rateLimit from '../middleware/rateLimit.js';
import * as Sentry from '../services/instrument.js';
import posthog from '../services/posthog.js';
import axios from 'axios';
import Joi from 'joi';
import { refreshTokenSchema } from '../schemas/auth.js';
import { JWT_FORMAT_REGEX } from '../constants/jwt.js';

const router = express.Router();

// --- CORS Preflight Handler ---
router.options('*', (req, res) => {
  res.sendStatus(204);
});

// Defensive logging utility
function logDefensiveAuth(msg, meta) {
  try {
    // Redact refreshToken in logs
    if (meta && meta.refreshToken) meta.refreshToken = '[REDACTED]';
    // Use structured logging if available
    if (typeof console.debug === 'function') {
      console.debug(`[auth.js][defensive] ${msg}`, meta);
    } else {
      console.log(`[auth.js][defensive] ${msg}`, meta);
    }
  } catch (e) {
    // Fallback to basic log
    console.log(`[auth.js][defensive] ${msg}`);
  }
}

/**
 * POST /refresh-token
 * Body: { refreshToken }
 * Returns: { accessToken } on success, or error with code on failure
 */
router.post('/refresh-token', rateLimit, async (req, res) => {
  // Defensive: never log the actual refreshToken
  const safeBody = { ...req.body };
  if (safeBody.refreshToken) safeBody.refreshToken = '[REDACTED]';
  logDefensiveAuth('Received /refresh-token request', { body: safeBody });
  try {
    // --- NEW: Validate with Joi schema, catch all validation errors ---
    let validated;
    try {
      validated = await refreshTokenSchema.validateAsync(req.body, {
        abortEarly: false,
      });
    } catch (err) {
      const error = {
        error: 'Missing or invalid refresh token',
        code: 'AUTH_TOKEN_MISSING',
        details: err.details || err.message,
      };
      logDefensiveAuth('[DEBUG] Joi validation failed', {
        ...error,
        refreshToken: '[REDACTED]',
      });
      Sentry.captureException(err, { extra: error });
      posthog.capture({
        distinctId: 'system',
        event: 'auth_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      return res.status(400).json(error);
    }
    const { refreshToken } = validated;

    // JWT format: three base64url segments separated by dots
    if (
      !refreshToken ||
      typeof refreshToken !== 'string' ||
      refreshToken.length < 10 ||
      refreshToken.length > 512 || // Defensive: max length
      !JWT_FORMAT_REGEX.test(refreshToken)
    ) {
      const error = {
        error: 'Missing or invalid refresh token',
        code: 'AUTH_TOKEN_MISSING',
      };
      logDefensiveAuth('[DEBUG] Validation failed (length or format)', {
        ...error,
        refreshToken: '[REDACTED]',
      });
      Sentry.captureException(new Error(error.error), { extra: error });
      posthog.capture({
        distinctId: 'system',
        event: 'auth_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      return res.status(400).json(error);
    }

    // Request new token from Memberstack
    let response;
    try {
      response = await axios.post(
        'https://auth.memberstack.com/refresh',
        { refreshToken },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );
    } catch (err) {
      // Always return 401 for any Memberstack API error, regardless of err.response status
      const error = {
        error: 'Token refresh failed',
        code: 'AUTH_TOKEN_REFRESH_FAILED',
        details: err.response?.data || err.message,
      };
      logDefensiveAuth('Memberstack API error', {
        ...error,
        refreshToken: '[REDACTED]',
      });
      Sentry.captureException(err, { extra: error });
      posthog.capture({
        distinctId: 'system',
        event: 'auth_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      // Intentionally always 401 for all Memberstack API errors (test/spec compliance)
      return res.status(401).json(error);
    }

    const { accessToken } = response.data || {};
    if (!accessToken || typeof accessToken !== 'string') {
      const error = {
        error: 'Token refresh failed: No accessToken returned',
        code: 'AUTH_TOKEN_REFRESH_FAILED',
      };
      logDefensiveAuth('No accessToken returned', {
        ...error,
        refreshToken: '[REDACTED]',
      });
      Sentry.captureException(new Error(error.error), { extra: error });
      posthog.capture({
        distinctId: 'system',
        event: 'auth_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      return res.status(401).json(error);
    }

    // Success: log and return new accessToken
    logDefensiveAuth('Token refresh successful', { accessToken });
    posthog.capture({
      distinctId: 'system',
      event: 'auth_token_refreshed',
      properties: { timestamp: new Date().toISOString() },
    });
    return res.json({ accessToken });
  } catch (error) {
    const errorDetails = {
      error: 'Internal server error during token refresh',
      code: 'AUTH_INTERNAL_ERROR',
      message: error.message,
    };
    logDefensiveAuth('Internal server error', { ...errorDetails });
    Sentry.captureException(error, { extra: errorDetails });
    posthog.capture({
      distinctId: 'system',
      event: 'auth_failure',
      properties: { ...errorDetails, timestamp: new Date().toISOString() },
    });
    return res.status(500).json(errorDetails);
  }
});

export default router;
