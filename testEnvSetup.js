// Centralized test environment setup for all sensitive API keys and log sanitization

// TEST-ONLY: Set fake keys for test environment
process.env.HUME_API_KEY = 'test_hume_key';
process.env.POSTHOG_API_KEY = 'test_posthog_key';
process.env.SUPABASE_ANON_KEY = 'test-supabase-anon-key';
// Guard: throw if a real key is detected
if (process.env.HUME_API_KEY && !process.env.HUME_API_KEY.startsWith('test')) {
  throw new Error('Real HUME_API_KEY detected in test environment!');
}
if (
  process.env.POSTHOG_API_KEY &&
  !process.env.POSTHOG_API_KEY.startsWith('test')
) {
  throw new Error('Real POSTHOG_API_KEY detected in test environment!');
}
if (
  process.env.SUPABASE_ANON_KEY &&
  !process.env.SUPABASE_ANON_KEY.startsWith('test')
) {
  throw new Error('Real SUPABASE_ANON_KEY detected in test environment!');
}

// Sanitize logs to prevent leaking sensitive values
const originalLog = console.log;
const originalError = console.error;
const sanitize = msg => {
  if (
    typeof msg === 'string' &&
    (msg.includes('HUME_API_KEY') ||
      msg.includes('POSTHOG_API_KEY') ||
      msg.includes('SUPABASE_ANON_KEY'))
  ) {
    return '[SANITIZED]';
  }
  return msg;
};
console.log = (...args) => originalLog(...args.map(sanitize));
console.error = (...args) => originalError(...args.map(sanitize));
