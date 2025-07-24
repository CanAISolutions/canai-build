import Joi from 'joi';

// For GET /v1/messages, no query/params expected, but placeholder for future
export const messagesQuerySchema = Joi.object({
  // Add query params here if needed
});

// Task 13: Extended query schema for GET /v1/messages
export const messageQuerySchema = Joi.object({
  type: Joi.string()
    .valid('trust_indicator', 'testimonial', 'system_notification')
    .optional(),
  limit: Joi.number().integer().min(1).max(100).default(10),
  offset: Joi.number().integer().min(0).default(0),
  sort_by: Joi.string()
    .valid('created_at', 'trust_score_context')
    .default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc').default('desc'),
}).messages({
  'object.unknown': 'Unknown query parameter',
});

// Response schema for documentation/testing
export const messagesResponseSchema = Joi.object({
  messages: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required().messages({
          'string.base': 'Message text must be a string',
          'any.required': 'Message text is required',
        }),
        user_id: Joi.string()
          .guid({ version: ['uuidv4'] })
          .allow(null)
          .optional(),
      })
    )
    .required(),
  error: Joi.string().allow(null),
});

// Task 13: Extended response schema for GET /v1/messages
export const messageResponseSchema = Joi.object({
  messages: Joi.array()
    .items(
      Joi.object({
        text: Joi.string().required(),
        user_id: Joi.string().uuid().allow(null).required(),
      })
    )
    .required(),
  error: Joi.string().allow(null).required(),
  cached: Joi.boolean().optional(),
});
