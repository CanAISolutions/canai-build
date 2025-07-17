import Joi from 'joi';

export const intentMirrorSchema = Joi.object({
  businessName: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Business name must be a string',
    'string.min': 'Business name must be at least 3 characters',
    'string.max': 'Business name must be at most 50 characters',
    'any.required': 'Business name is required',
  }),
  targetAudience: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Target audience must be a string',
    'string.min': 'Target audience must be at least 3 characters',
    'string.max': 'Target audience must be at most 100 characters',
    'any.required': 'Target audience is required',
  }),
  primaryGoal: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Primary goal must be a string',
    'string.min': 'Primary goal must be at least 3 characters',
    'string.max': 'Primary goal must be at most 100 characters',
    'any.required': 'Primary goal is required',
  }),
  competitiveContext: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Competitive context must be a string',
    'string.min': 'Competitive context must be at least 3 characters',
    'string.max': 'Competitive context must be at most 100 characters',
    'any.required': 'Competitive context is required',
  }),
  brandVoice: Joi.string().min(3).max(50).required().messages({
    'string.base': 'Brand voice must be a string',
    'string.min': 'Brand voice must be at least 3 characters',
    'string.max': 'Brand voice must be at most 50 characters',
    'any.required': 'Brand voice is required',
  }),
  resourceConstraints: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Resource constraints must be a string',
    'string.min': 'Resource constraints must be at least 3 characters',
    'string.max': 'Resource constraints must be at most 100 characters',
    'any.required': 'Resource constraints are required',
  }),
  currentStatus: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Current status must be a string',
    'string.min': 'Current status must be at least 3 characters',
    'string.max': 'Current status must be at most 100 characters',
    'any.required': 'Current status is required',
  }),
  businessDescription: Joi.string().min(10).max(500).required().messages({
    'string.base': 'Business description must be a string',
    'string.min': 'Business description must be at least 10 characters',
    'string.max': 'Business description must be at most 500 characters',
    'any.required': 'Business description is required',
  }),
  revenueModel: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Revenue model must be a string',
    'string.min': 'Revenue model must be at least 3 characters',
    'string.max': 'Revenue model must be at most 100 characters',
    'any.required': 'Revenue model is required',
  }),
  planPurpose: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Plan purpose must be a string',
    'string.min': 'Plan purpose must be at least 3 characters',
    'string.max': 'Plan purpose must be at most 100 characters',
    'any.required': 'Plan purpose is required',
  }),
  location: Joi.string().min(2).max(100).required().messages({
    'string.base': 'Location must be a string',
    'string.min': 'Location must be at least 2 characters',
    'string.max': 'Location must be at most 100 characters',
    'any.required': 'Location is required',
  }),
  uniqueValue: Joi.string().min(3).max(100).required().messages({
    'string.base': 'Unique value must be a string',
    'string.min': 'Unique value must be at least 3 characters',
    'string.max': 'Unique value must be at most 100 characters',
    'any.required': 'Unique value is required',
  }),
});
