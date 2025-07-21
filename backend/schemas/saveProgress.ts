import Joi from 'joi';
import { patterns } from './common.js';

// Joi schema for POST /v1/save-progress (F5 Detailed Input Collection)
export const saveProgressSchema = Joi.object({
  prompt_id: Joi.string()
    .guid({ version: ['uuidv4'] })
    .optional(),
  payload: Joi.object({
    businessName: Joi.string().min(3).max(50).required().messages({
      'string.min': 'Business name must be at least 3 characters',
      'string.max': 'Business name must be at most 50 characters',
      'any.required': 'Business name is required',
    }),
    targetAudience: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Target audience must be at least 3 characters',
      'string.max': 'Target audience must be at most 100 characters',
      'any.required': 'Target audience is required',
    }),
    primaryChallenge: patterns.primaryChallenge,
    preferredTone: patterns.preferredTone,
    customTone: patterns.customTone,
    phoneNumber: patterns.phoneNumber.optional(),
    businessType: patterns.businessType,
    consent: Joi.boolean().valid(true).required().messages({
      'any.only': 'Consent must be explicitly granted',
      'any.required': 'Consent is required',
    }),
    dataRetention: Joi.number().valid(12, 24, 36).required().messages({
      'any.only': 'Invalid data retention period',
      'any.required': 'Data retention period is required',
    }),
    // Add additional F5 fields as needed
    businessDescription: Joi.string().min(10).max(500).required().messages({
      'string.min': 'Business description must be at least 10 characters',
      'string.max': 'Business description must be at most 500 characters',
      'any.required': 'Business description is required',
    }),
    revenueModel: Joi.string().min(3).max(100).required().messages({
      'string.min': 'Revenue model must be at least 3 characters',
      'string.max': 'Revenue model must be at most 100 characters',
      'any.required': 'Revenue model is required',
    }),
    resourceConstraints: Joi.string().min(3).max(100).optional(),
    currentStatus: Joi.string().min(3).max(100).optional(),
    planPurpose: Joi.string().min(3).max(100).optional(),
    location: Joi.string().min(2).max(100).optional(),
    uniqueValue: Joi.string().min(3).max(100).optional(),
  })
    .required()
    .messages({
      'object.base': 'Payload must be an object',
      'any.required': 'Payload is required',
    }),
});
