import Joi from 'joi';
import { sanitize } from './sanitize.js';
import { sanitizeWithSchema } from './sanitize.js';
import { createRequire } from 'module';
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

// Recursively sanitize all string fields in an object, respecting schema if provided
function deepSanitize(obj, schema = {}, path = []) {
  if (!obj || typeof obj !== 'object') return obj;
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fieldPath = [...path, key].join('.');
    const fieldRule = schema[key] || { sanitize: true, mode: 'plain' };
    if (fieldRule && fieldRule.sanitize) {
      if (typeof value === 'string') {
        obj[key] = sanitize(value, fieldRule);
      } else if (value && typeof value === 'object') {
        obj[key] = deepSanitize(value, schema[key] || {}, [...path, key]);
      } else if (value === null || value === undefined) {
        // User-centric error for null/undefined
        throw new Error(`Invalid input: field '${fieldPath}' is required.`);
      }
    }
  }
  return obj;
}

function validate(schemas = {}, options = {}) {
  return (req, res, next) => {
    logDebug('[validation] invoked', { method: req.method, path: req.path });
    const sanitizeSchema =
      options.sanitizeSchema || inferSanitizeSchema(req.body);
    try {
      req.body = deepSanitize(req.body, sanitizeSchema);
      req.query = deepSanitize(req.query, sanitizeSchema);
      req.params = deepSanitize(req.params, sanitizeSchema);
      req.headers = deepSanitize(req.headers, sanitizeSchema);
    } catch (err) {
      logDebug('[validation] error', { error: err.message });
      if (typeof res.status === 'function') {
        return res.status(400).json({ error: err.message || 'Invalid input.' });
      } else {
        // In test/mock environments, throw so tests can catch
        throw err;
      }
    }
    // Logging for debugging: warn if a field is sanitized but not in schema
    for (const key in req.body) {
      if (typeof req.body[key] === 'string' && !sanitizeSchema[key]) {
        console.warn(
          `[Sanitize] Field '${key}' sanitized with default plain mode (no schema provided).`
        );
      }
    }
    // Validate each part if schema provided
    const sources = ['body', 'query', 'params', 'headers'];
    for (const source of sources) {
      if (schemas[source]) {
        const { error } = schemas[source].validate(req[source]);
        if (error) {
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
