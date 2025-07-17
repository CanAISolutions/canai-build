import Joi from 'joi';

export const feedbackSchema = Joi.object({
  user_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'User ID must be a string',
      'string.guid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required',
    }),
  feedbackText: Joi.string().min(5).max(1000).required().messages({
    'string.base': 'Feedback must be a string',
    'string.min': 'Feedback must be at least 5 characters',
    'string.max': 'Feedback must be at most 1000 characters',
    'any.required': 'Feedback is required',
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    'number.base': 'Rating must be a number',
    'number.min': 'Rating must be at least 1',
    'number.max': 'Rating must be at most 5',
    'any.required': 'Rating is required',
  }),
  prompt_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .optional()
    .messages({
      'string.base': 'Prompt ID must be a string',
      'string.guid': 'Prompt ID must be a valid UUID',
    }),
});
