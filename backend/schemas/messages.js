import Joi from 'joi';

// For GET /v1/messages, no query/params expected, but placeholder for future
export const messagesQuerySchema = Joi.object({
  // Add query params here if needed
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
