import Joi from 'joi';

// Simple input sanitizer to remove HTML/script tags
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  } else if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  } else if (input && typeof input === 'object') {
    const sanitized = {};
    for (const key in input) {
      sanitized[key] = sanitizeInput(input[key]);
    }
    return sanitized;
  }
  return input;
}

/**
 * schema: {
 *   body?: Joi.Schema,
 *   query?: Joi.Schema,
 *   params?: Joi.Schema,
 *   headers?: Joi.Schema
 * }
 */
export default function validate(schemas = {}) {
  return (req, res, next) => {
    // Sanitize all inputs
    req.body = sanitizeInput(req.body);
    req.query = sanitizeInput(req.query);
    req.params = sanitizeInput(req.params);
    req.headers = sanitizeInput(req.headers);

    // Validate each part if schema provided
    const sources = ['body', 'query', 'params', 'headers'];
    for (const source of sources) {
      if (schemas[source]) {
        const { error } = schemas[source].validate(req[source]);
        if (error) {
          // Generic error message to avoid leaking schema details
          return res
            .status(400)
            .json({ error: 'Invalid request. Please check your input.' });
        }
      }
    }
    next();
  };
}
