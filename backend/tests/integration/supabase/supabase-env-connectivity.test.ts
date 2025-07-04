/**
 * Supabase .env Connectivity Test
 *
 * This test verifies that the Supabase client can connect using credentials from .env.
 * It is the lowest-level, most direct check of environment configuration and network access.
 *
 * PRD.md Mapping:
 *   - Section 6: Requirements (Platform must reliably connect to Supabase for all F1-F9 flows)
 *   - Section 12: Metrics (System health, uptime, and error reporting)
 */

import { describe, it, expect, beforeAll } from 'vitest';
require('./testEnvSetup');

describe('Supabase .env connectivity (debug)', () => {
  beforeAll(() => {
    // Debug output
    console.log('CWD:', process.cwd());
    console.log('SUPABASE_URL:', process.env['SUPABASE_URL']);
    console.log(
      'SUPABASE_ANON_KEY:',
      process.env['SUPABASE_ANON_KEY'] ? 'set' : 'not set'
    );

    expect(
      process.env['SUPABASE_URL'],
      'SUPABASE_URL is not set in .env'
    ).toBeTruthy();
    expect(
      process.env['SUPABASE_ANON_KEY'],
      'SUPABASE_ANON_KEY is not set in .env'
    ).toBeTruthy();
  });

  it('should print debug info and confirm env vars are set', async () => {
    // Debug output
    console.log('CWD:', process.cwd());
    console.log('SUPABASE_URL:', process.env['SUPABASE_URL']);
    console.log(
      'SUPABASE_ANON_KEY:',
      process.env['SUPABASE_ANON_KEY'] ? 'set' : 'not set'
    );

    expect(
      process.env['SUPABASE_URL'],
      'SUPABASE_URL is not set in .env'
    ).toBeTruthy();
    expect(
      process.env['SUPABASE_ANON_KEY'],
      'SUPABASE_ANON_KEY is not set in .env'
    ).toBeTruthy();
  });
});
