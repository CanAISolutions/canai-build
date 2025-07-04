import stripe, { testStripeConnection } from '../services/stripe.js';

(async () => {
  try {
    await testStripeConnection();
    console.log('✅ Stripe connection test successful.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Stripe connection test failed:', err.message);
    process.exit(1);
  }
})();