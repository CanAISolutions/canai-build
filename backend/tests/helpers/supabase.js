import { createClient } from '@supabase/supabase-js';

let supabaseClient;

export function getSupabaseClient() {
  if (!supabaseClient) {
    const url =
      process.env.SUPABASE_URL || 'https://your-test-project.supabase.co';
    const key =
      process.env.SUPABASE_ANON_KEY ||
      process.env.SUPABASE_KEY ||
      'test-anon-key';

    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return supabaseClient;
}

export function resetSupabaseClient() {
  supabaseClient = null;
}
