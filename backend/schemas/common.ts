// Shared Joi patterns for validation across endpoints
import Joi from 'joi';

export const patterns = {
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  businessType: Joi.string()
    .valid('retail', 'service', 'tech', 'creative', 'other')
    .required()
    .messages({
      'any.only':
        'Business type must be one of: retail, service, tech, creative, other',
      'any.required': 'Business type is required',
    }),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
    }),
  primaryChallenge: Joi.string().min(5).max(50).required().messages({
    'string.min': 'Challenge must be at least 5 characters',
    'string.max': 'Challenge must be at most 50 characters',
    'any.required': 'Primary challenge is required',
  }),
  preferredTone: Joi.string()
    .valid(
      'warm',
      'bold',
      'optimistic',
      'professional',
      'playful',
      'inspirational',
      'custom'
    )
    .required()
    .messages({
      'any.only': 'Preferred tone must be one of the allowed values',
      'any.required': 'Preferred tone is required',
    }),
  customTone: Joi.string()
    .min(1)
    .max(50)
    .when('preferredTone', { is: 'custom', then: Joi.required() })
    .messages({
      'string.min': 'Custom tone must be at least 1 character',
      'string.max': 'Custom tone must be at most 50 characters',
      'any.required': 'Custom tone is required when preferred tone is custom',
    }),
};
