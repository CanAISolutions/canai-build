import { Application } from 'express';
import { Redis } from 'ioredis';
import { createClient } from '@supabase/supabase-js';
// If needed, import node-fetch for Node.js fetch polyfill
// import fetch from 'node-fetch';

export default async function bootstrapAsyncDependencies(_app: Application) {
  console.log('[Bootstrap] Starting bootstrapAsyncDependencies...');
  try {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      throw new Error(
        'REDIS_URL is not set. Please configure it in your environment.'
      );
    }
    const redisClient = new Redis(redisUrl, { enableOfflineQueue: false });
    redisClient.on('error', err => console.error('Redis error:', err));

    // Supabase connection
    const supabase = createClient(
      process.env.DATABASE_URL!,
      process.env.SUPABASE_ANON_KEY || ''
      // Remove custom fetch unless you have a specific reason to override
    );
    try {
      const { data, error } = await supabase
        .from('your_table')
        .select('id')
        .limit(1);
      if (error) throw error;
      console.log('Supabase connection successful');
    } catch (err) {
      console.error('Supabase connection failed:', err);
      throw err;
    }
    console.log(
      '[Bootstrap] bootstrapAsyncDependencies completed successfully'
    );
  } catch (err) {
    console.error('[Bootstrap] bootstrapAsyncDependencies failed:', err);
    throw err;
  }
}
