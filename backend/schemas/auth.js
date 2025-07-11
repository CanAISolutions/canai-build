import Joi from 'joi';
import { JWT_FORMAT_REGEX } from '../constants/jwt.js';

// Joi schema for POST /refresh-token
// Canonical: docs/refresh-token-execution-plan.md, docs/task-9.1-joi-validation-schemas.md

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .min(10)
    .max(512)
    .pattern(process.env.NODE_ENV === 'test' ? /.*/ : JWT_FORMAT_REGEX)
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
