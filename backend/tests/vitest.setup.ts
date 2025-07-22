// backend/tests/vitest.setup.ts
import { vi } from 'vitest';

// Set test environment variables
vi.stubEnv('POSTHOG_API_KEY', 'test-key');
vi.stubEnv('POSTHOG_HOST', 'http://localhost');
vi.stubEnv('npm_package_version', '1.2.3');
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('DEPLOYMENT_ID', 'test-deploy');
vi.stubEnv('POSTHOG_FLUSH_AT', '20');
vi.stubEnv('POSTHOG_FLUSH_INTERVAL', '10000');
vi.stubEnv('SESSION_TIMEOUT_MINUTES', '30');

// Additional test stability configurations
vi.stubEnv('SUPABASE_URL', 'http://localhost:54321');
vi.stubEnv('SUPABASE_ANON_KEY', 'test-anon-key');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
vi.stubEnv('OPENAI_API_KEY', 'test-openai-key');
vi.stubEnv('HUME_API_KEY', 'test-hume-key');

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});

// Restore console after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
