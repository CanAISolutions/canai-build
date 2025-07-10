import Joi from 'joi';
import { allowedTracks } from '../api/src/Shared/Constants.ts';

export const checkoutSessionSchema = Joi.object({
  productTrack: Joi.string()
    .valid(...allowedTracks)
    .required()
    .messages({
      'any.only': `Product track must be one of: ${allowedTracks.join(', ')}`,
      'any.required': 'Product track is required',
    }),
  user_id: Joi.string().required().messages({
    'any.required': 'User ID is required',
  }),
  metadata: Joi.object().optional(),
});
