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
vi.stubEnv('SUPABASE_JWT_SECRET', 'test-jwt-secret-for-testing-only');
vi.stubEnv('OPENAI_API_KEY', 'test-openai-key');
vi.stubEnv('HUME_API_KEY', 'test-hume-key');

// Global Supabase mock for all tests
vi.mock('@supabase/supabase-js', () => {
  const mockLog = {
    id: 'test-log-id',
    user_id: 'test-user-id',
    event_type: 'checkout.session.created',
    status: 'completed',
    amount: 1000,
    created_at: new Date().toISOString(),
  };

  // Create chainable mock methods
  const createChainableMock = () => ({
    select: vi.fn(() => ({
      eq: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      gte: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      lte: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      order: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      range: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      limit: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [mockLog], error: null })),
    })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    eq: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    gte: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    lte: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    order: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    range: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    limit: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
  });

  return {
    createClient: vi.fn(() => ({
      from: vi.fn(() => createChainableMock()),
      rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  };
});

// Mock the local Supabase client that's imported in routes
vi.mock('../supabase/client.js', () => {
  const mockLog = {
    id: 'test-log-id',
    user_id: 'test-user-id',
    event_type: 'checkout.session.created',
    status: 'completed',
    amount: 1000,
    created_at: new Date().toISOString(),
  };

  // Create chainable mock methods
  const createChainableMock = () => ({
    select: vi.fn(() => ({
      eq: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      gte: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      lte: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      order: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      range: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
      limit: vi.fn(() =>
        Promise.resolve({ data: [mockLog], error: null, count: 1 })
      ),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [mockLog], error: null })),
    })),
    update: vi.fn(() => Promise.resolve({ data: null, error: null })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    eq: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    gte: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    lte: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    order: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    range: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
    limit: vi.fn(() =>
      Promise.resolve({ data: [mockLog], error: null, count: 1 })
    ),
  });

  return {
    default: {
      from: vi.fn(() => createChainableMock()),
      rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    },
  };
});

// Mock console methods to reduce noise in tests
// const originalConsole = { ...console };
// vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'warn').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});
// vi.spyOn(console, 'info').mockImplementation(() => {});

// Restore console after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
