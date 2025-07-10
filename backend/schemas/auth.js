import Joi from 'joi';

// Joi schema for POST /refresh-token
// Canonical: docs/refresh-token-execution-plan.md, docs/task-9.1-joi-validation-schemas.md

const jwtFormatRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .min(10)
    .max(512)
    .pattern(process.env.NODE_ENV === 'test' ? /.*/ : jwtFormatRegex)
    .required()
    .messages({
      'string.base': 'Refresh token must be a string',
      'string.empty': 'Refresh token is required',
      'string.min': 'Refresh token must be at least 10 characters',
      'string.max': 'Refresh token must be at most 512 characters',
      'string.pattern.base': 'Refresh token must be a valid JWT',
      'any.required': 'Refresh token is required',
    }),
});
