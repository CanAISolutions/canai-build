import Joi from 'joi';
import { patterns } from './common.js';

// Joi schema for POST /v1/validate-input (F2 Discovery Funnel)
export const validateInputSchema = Joi.object({
  email: patterns.email,
  businessType: patterns.businessType,
  phoneNumber: patterns.phoneNumber.optional(),
  primaryChallenge: patterns.primaryChallenge,
  preferredTone: patterns.preferredTone,
  customTone: patterns.customTone,
  businessName: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Business name must be at least 3 characters',
    'string.max': 'Business name must be at most 50 characters',
    'any.required': 'Business name is required',
  }),
  targetAudience: Joi.string().min(5).max(100).required().messages({
    'string.min': 'Target audience must be at least 5 characters',
    'string.max': 'Target audience must be at most 100 characters',
    'any.required': 'Target audience is required',
  }),
  businessDescription: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Business description must be at least 10 characters',
    'string.max': 'Business description must be at most 500 characters',
    'any.required': 'Business description is required',
  }),
  trustScore: Joi.number().min(0).max(100).optional(),
  // Add any additional fields as required by the PRD
});