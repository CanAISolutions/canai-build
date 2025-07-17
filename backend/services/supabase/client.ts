import { createClient } from '@supabase/supabase-js';

let supabaseClient;

if (!supabaseClient) {
  const url =
    process.env.SUPABASE_URL || 'https://xegwrehxfbxbatsdpvqe.supabase.co';
  const key = process.env.SUPABASE_ANON_KEY;
  if (!key) throw new Error('SUPABASE_ANON_KEY is required');
  console.log('Initializing Supabase client...', url, key);
  supabaseClient = createClient(url, key);
  console.log('Supabase client initialized:', !!supabaseClient);
}

export default supabaseClient;
