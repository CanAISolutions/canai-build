import { testStripeConnection } from '../services/stripe.js';

(async () => {
  try {
    await testStripeConnection();
    console.log('✅ Stripe connection test passed');
    process.exit(0);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Stripe connection test failed:', errorMessage);
    process.exit(1);
  }
})();
