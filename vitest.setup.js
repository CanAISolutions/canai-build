import 'dotenv/config';

// Environment variables should be loaded from .env file
process.env.SUPABASE_URL = 'https://xegwrehxfbxbatsdpvqe.supabase.co';

// Only check that required env vars are present
if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL environment variable is required for tests');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY environment variable is required for tests'
  );
}
if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    'SUPABASE_ANON_KEY environment variable is required for tests'
  );
}
