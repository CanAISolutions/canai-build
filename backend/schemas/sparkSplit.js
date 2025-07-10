import Joi from 'joi';

export const sparkSplitSchema = Joi.object({
  prompt_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'Prompt ID must be a string',
      'string.guid': 'Prompt ID must be a valid UUID',
      'any.required': 'Prompt ID is required',
    }),
  canaiOutput: Joi.string().min(10).max(2000).required().messages({
    'string.base': 'CanAI output must be a string',
    'string.min': 'CanAI output must be at least 10 characters',
    'string.max': 'CanAI output must be at most 2000 characters',
    'any.required': 'CanAI output is required',
  }),
  genericOutput: Joi.string().min(10).max(2000).required().messages({
    'string.base': 'Generic output must be a string',
    'string.min': 'Generic output must be at least 10 characters',
    'string.max': 'Generic output must be at most 2000 characters',
    'any.required': 'Generic output is required',
  }),
  user_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .required()
    .messages({
      'string.base': 'User ID must be a string',
      'string.guid': 'User ID must be a valid UUID',
      'any.required': 'User ID is required',
    }),
});
