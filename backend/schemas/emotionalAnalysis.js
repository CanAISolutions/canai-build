import Joi from 'joi';

export const analyzeEmotionSchema = Joi.object({
  text: Joi.string().min(1).max(1000).required().messages({
    'string.base': 'Text must be a string',
    'string.min': 'Text must not be empty',
    'string.max': 'Text must be at most 1000 characters',
    'any.required': 'Text is required',
  }),
  comparisonId: Joi.string().guid().required().messages({
    'string.guid': 'Comparison ID must be a valid UUID',
    'any.required': 'Comparison ID is required',
  }),
});
