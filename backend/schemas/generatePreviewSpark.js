import Joi from 'joi';
import { patterns } from './common.js';

// Joi schema for POST /v1/generate-preview-spark (F1 Discovery Hook)
export const generatePreviewSparkSchema = Joi.object({
  // Required: business type (retail, service, tech, creative, other)
  businessType: patterns.businessType,
  // Required: preferred tone (warm, bold, optimistic, professional, playful, inspirational, custom)
  tone: patterns.preferredTone,
  // Conditionally required: custom tone if tone is 'custom'
  customTone: Joi.string()
    .min(1)
    .max(50)
    .when('tone', { is: 'custom', then: Joi.required() })
    .messages({
      'string.min': 'Custom tone must be at least 1 character',
      'string.max': 'Custom tone must be at most 50 characters',
      'any.required': 'Custom tone is required when tone is custom',
    }),
  // Optional: target audience (string, max 100 chars)
  targetAudience: Joi.string().max(100).optional().messages({
    'string.max': 'Target audience must be at most 100 characters',
  }),
  // Optional: custom instructions (string, max 500 chars)
  customInstructions: Joi.string().max(500).optional().messages({
    'string.max': 'Custom instructions must be at most 500 characters',
  }),
  // Optional: max length (number, min 50, max 2000)
  maxLength: Joi.number().integer().min(50).max(2000).optional().messages({
    'number.min': 'Max length must be at least 50',
    'number.max': 'Max length must be at most 2000',
  }),
});
