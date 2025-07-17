import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@supabase/supabase-js';
let supabaseClient;
if (!supabaseClient) {
  supabaseClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}
export default supabaseClient;
