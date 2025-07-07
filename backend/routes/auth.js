import express from 'express';
import rateLimit from '../middleware/rateLimit.js';
import * as Sentry from '../services/instrument.js';
import posthog from '../services/posthog.js';
import axios from 'axios';

const router = express.Router();

/**
 * POST /refresh-token
 * Body: { refreshToken }
 * Returns: { accessToken } on success, or error with code on failure
 */
router.post('/refresh-token', rateLimit, async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.length < 10) {
      const error = {
        error: 'Missing or invalid refresh token',
        code: 'AUTH_TOKEN_MISSING',
      };
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
      response = await axios.post('https://auth.memberstack.com/refresh', { refreshToken }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });
    } catch (err) {
      // Always return 401 for any Memberstack API error, regardless of err.response status
      const error = {
        error: 'Token refresh failed',
        code: 'AUTH_TOKEN_REFRESH_FAILED',
        details: err.response?.data || err.message,
      };
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
      Sentry.captureException(new Error(error.error), { extra: error });
      posthog.capture({
        distinctId: 'system',
        event: 'auth_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      return res.status(401).json(error);
    }

    // Success: log and return new accessToken
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