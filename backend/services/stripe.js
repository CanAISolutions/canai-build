import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Returns the appropriate Stripe secret key based on NODE_ENV.
 * Falls back to STRIPE_SECRET_KEY for backward compatibility.
 * Throws an error if no valid key is found.
 */
function getStripeSecretKey() {
  const env = process.env.NODE_ENV || 'development';
  let key = null;
  if (env === 'production') {
    key = process.env.STRIPE_SECRET_KEY_LIVE;
  } else {
    key = process.env.STRIPE_SECRET_KEY_TEST;
  }
  // Fallback for legacy setups
  if (!key && process.env.STRIPE_SECRET_KEY) {
    key = process.env.STRIPE_SECRET_KEY;
  }
  if (!key) {
    throw new Error('Stripe secret key is required. Please set STRIPE_SECRET_KEY_TEST, STRIPE_SECRET_KEY_LIVE, or STRIPE_SECRET_KEY in your environment.');
  }
  return key;
}

/**
 * Singleton Stripe client instance
 */
const stripeKey = getStripeSecretKey();
const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16', // Use latest stable Stripe API version
});

/**
 * Performs a basic connection test to Stripe API.
 * Throws if the connection or key is invalid.
 */
export async function testStripeConnection() {
  try {
    // This is a lightweight call that requires authentication
    await stripe.balance.retrieve();
    return true;
  } catch (err) {
    throw new Error('Stripe connection test failed: ' + err.message);
  }
}

export default stripe;

// Allow direct CLI testing of Stripe connection (ESM compatible)
if (import.meta && import.meta.url && (import.meta.url === `file://${process.cwd().replace(/\\/g, '/')}/backend/services/stripe.js` || import.meta.url === process.argv[1])) {
  testStripeConnection()
    .then(() => {
      console.log('Stripe connection test successful.');
      import('process').then(p => p.exit(0));
    })
    .catch((err) => {
      console.error('Stripe connection test failed:', err.message);
      import('process').then(p => p.exit(1));
    });
}


