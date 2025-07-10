import Joi from 'joi';
import { sanitize } from './sanitize.js';
import { sanitizeWithSchema, ValidationError } from './sanitize.js';
import { createRequire } from 'module';
import posthog, { safeCapture } from '../services/posthog.js';
import Sentry from '../services/instrument.js';
let _logger;
try {
  const require = createRequire(import.meta.url);
  _logger =
    require('../api/src/Shared/Logger').default ||
    require('../api/src/Shared/Logger');
} catch (err) {
  _logger = console;
}

/**
 * @typedef {Object} SanitizeSchemaField
 * @property {boolean} sanitize
 * @property {'plain'|'rich'} [mode]
 *
 * @typedef {Object.<string, SanitizeSchemaField>} SanitizeSchema
 */

/**
 * schema: {
 *   body?: Joi.Schema,
 *   query?: Joi.Schema,
 *   params?: Joi.Schema,
 *   headers?: Joi.Schema
 * }
 * options: {
 *   sanitizeSchema?: SanitizeSchema
 * }
 */

function logDebug(msg, meta) {
  if (_logger && typeof _logger.debug === 'function') {
    _logger.debug(meta || {}, msg);
  } else if (_logger && typeof _logger.log === 'function') {
    _logger.log(msg, meta);
  }
}

function validate(schemas = {}, options = {}) {
  return (req, res, next) => {
    logDebug('[validation] invoked', { method: req.method, path: req.path });
    // Accept per-part sanitize schemas or fallback to default
    const sanitizeSchemas = options.sanitizeSchemas || {
      body: options.sanitizeSchema || inferSanitizeSchema(req.body),
      query: options.sanitizeSchema || inferSanitizeSchema(req.query),
      params: options.sanitizeSchema || inferSanitizeSchema(req.params),
      headers: options.sanitizeSchema || inferSanitizeSchema(req.headers),
    };
    try {
      req.body = sanitizeWithSchema(req.body, sanitizeSchemas.body);
      req.query = sanitizeWithSchema(req.query, sanitizeSchemas.query);
      req.params = sanitizeWithSchema(req.params, sanitizeSchemas.params);
      req.headers = sanitizeWithSchema(req.headers, sanitizeSchemas.headers);
    } catch (err) {
      logDebug('[validation] error', { error: err.message, field: err.field });
      // Integrate PostHog/Sentry analytics for all failures
      const context = {
        method: req.method,
        path: req.path,
        user: req.user ? { id: req.user.id, email: req.user.email } : undefined,
        error: err.message,
        stack: err.stack,
        type: err.name,
        source: 'sanitize',
      };
      if (safeCapture) {
        safeCapture({
          event: 'error_occurred',
          properties: {
            errorType: err.name || 'SanitizationError',
            stackTrace: err.stack,
            context,
            sessionId:
              req.sessionId || (req.user && req.user.sessionId) || 'unknown',
            timestamp: new Date().toISOString(),
          },
        });
      }
      if (Sentry && typeof Sentry.captureException === 'function') {
        Sentry.captureException(err, { extra: context });
      }
      res
        .status(400)
        .json(
          err instanceof ValidationError
            ? { error: err.message, field: err.field }
            : { error: err.message || 'Invalid input.' }
        );
      logDebug('[validation] error response sent', {
        error: err.message,
        field: err.field,
      });
      return; // Explicitly stop middleware chain
    }
    // Validate each part if schema provided
    const sources = ['body', 'query', 'params', 'headers'];
    for (const source of sources) {
      if (schemas[source]) {
        const { error } = schemas[source].validate(req[source]);
        if (error) {
          // Integrate analytics/logging for validation errors
          const context = {
            method: req.method,
            path: req.path,
            user: req.user
              ? { id: req.user.id, email: req.user.email }
              : undefined,
            error: error.message,
            stack: error.stack,
            type: error.name,
            source,
          };
          if (safeCapture)
            safeCapture({
              event: 'error_occurred',
              properties: {
                errorType: error.name || 'ValidationError',
                stackTrace: error.stack,
                context,
                sessionId:
                  req.sessionId ||
                  (req.user && req.user.sessionId) ||
                  'unknown',
                timestamp: new Date().toISOString(),
              },
            });
          if (Sentry && typeof Sentry.captureException === 'function') {
            Sentry.captureException(error, { extra: context });
          }
          return res
            .status(400)
            .json({ error: 'Invalid request. Please check your input.' });
        }
      }
    }
    logDebug('[validation] passed', { method: req.method, path: req.path });
    next();
  };
}

// Helper: Infer a default sanitize schema (plain mode for all string fields)
function inferSanitizeSchema(obj) {
  if (!obj || typeof obj !== 'object') return {};
  const schema = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      schema[key] = { sanitize: true, mode: 'plain' };
    }
  }
  return schema;
}

export default validate;
