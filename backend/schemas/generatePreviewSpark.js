import Joi from 'joi';
import { patterns } from './common.js';

// Joi schema for POST /v1/generate-preview-spark (F1 Discovery Hook)
export const generatePreviewSparkSchema = Joi.object({
  businessType: patterns.businessType,
  tone: patterns.preferredTone,
});
