require('../../testEnvSetup');
import { describe, it, expect } from 'vitest';

describe('API Key Safety', () => {
  it('should use only dummy keys in test environment', () => {
    expect(process.env.HUME_API_KEY).toMatch(/^test/);
    expect(process.env.POSTHOG_API_KEY).toMatch(/^test/);
    expect(process.env.SUPABASE_ANON_KEY).toMatch(/^test/);
  });
});
