import Joi from 'joi';

export const requestRevisionSchema = Joi.object({
  prompt_id: Joi.string().guid({ version: ['uuidv4'] }).required().messages({
    'string.base': 'Prompt ID must be a string',
    'string.guid': 'Prompt ID must be a valid UUID',
    'any.required': 'Prompt ID is required',
  }),
  revisionReason: Joi.string().min(5).max(200).required().messages({
    'string.base': 'Revision reason must be a string',
    'string.min': 'Revision reason must be at least 5 characters',
    'string.max': 'Revision reason must be at most 200 characters',
    'any.required': 'Revision reason is required',
  }),
  user_id: Joi.string().guid({ version: ['uuidv4'] }).required().messages({
    'string.base': 'User ID must be a string',
    'string.guid': 'User ID must be a valid UUID',
    'any.required': 'User ID is required',
  })
});