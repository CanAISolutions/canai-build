/**
 * Stripe Checkout Session Service
 * PRD-aligned, supports multiple product tracks and dynamic pricing.
 */
import stripe from './stripe.js';
import crypto from 'crypto';

/**
 * Maps productTrack to Stripe price and product details.
 * TODO: Replace with backend fetch for dynamic pricing.
 */
const PRODUCT_TRACKS = {
  'business-plan-builder': {
    name: 'Business Plan Builder',
    amount: 9900, // $99.00
  },
  'social-media-campaign': {
    name: 'Social Media & Email Campaign',
    amount: 4900, // $49.00
  },
  'website-audit-feedback': {
    name: 'Website Audit & Feedback',
    amount: 7900, // $79.00
  },
};

/**
 * Creates a Stripe checkout session for the given product track and user.
 * @param {Object} params
 * @param {string} params.productTrack - The product track key
 * @param {string} params.userId - The user ID
 * @param {Object} params.metadata - Additional metadata (optional)
 * @returns {Promise<Object>} Stripe session object
 */
export async function createCheckoutSession({
  productTrack,
  userId,
  metadata = {},
}) {
  const config = PRODUCT_TRACKS[productTrack];
  if (!config) throw new Error('Invalid product track');

  // TODO: Fetch price from backend for validation
  const amount = config.amount;
  const name = config.name;

  // Use environment-based URLs with safety checks
  const { STRIPE_SUCCESS_URL, STRIPE_CANCEL_URL, CLIENT_URL } = process.env;

  let success_url, cancel_url;

  if (STRIPE_SUCCESS_URL) {
    success_url = STRIPE_SUCCESS_URL;
  } else if (CLIENT_URL) {
    success_url = `${CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`;
  } else {
    throw new Error(
      'Missing CLIENT_URL and STRIPE_SUCCESS_URL environment variables. Cannot construct Stripe success_url.'
    );
  }

  if (STRIPE_CANCEL_URL) {
    cancel_url = STRIPE_CANCEL_URL;
  } else if (CLIENT_URL) {
    cancel_url = `${CLIENT_URL}/cancel`;
  } else {
    throw new Error(
      'Missing CLIENT_URL and STRIPE_CANCEL_URL environment variables. Cannot construct Stripe cancel_url.'
    );
  }

  // Generate idempotency key (user+track+timestamp or provided)
  const idempotencyKey =
    metadata.idempotency_key ||
    crypto
      .createHash('sha256')
      .update(`${userId}-${productTrack}-${Date.now()}`)
      .digest('hex');

  try {
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url,
        cancel_url,
        metadata: {
          user_id: userId,
          product_track: productTrack,
          ...metadata,
        },
      },
      {
        idempotencyKey,
      }
    );
    return session;
  } catch (err) {
    throw new Error('Stripe checkout session creation failed: ' + err.message);
  }
}
