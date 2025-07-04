import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Patch global URL to allow relative URLs in tests
const OriginalURL = global.URL;
global.URL = function (url, base) {
  if (base === undefined && typeof url === 'string' && url.startsWith('/')) {
    return new OriginalURL(url, 'http://localhost');
  }
  return new OriginalURL(url, base);
};
global.URL.createObjectURL = OriginalURL.createObjectURL;
global.URL.revokeObjectURL = OriginalURL.revokeObjectURL;

// Mock Supabase client for all tests
vi.mock('../utils/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        // Simulate resolved data for all select queries
        then: (cb: unknown) =>
          cb({ data: [{ id: 1, details: 'Mocked Data' }], error: null }),
      }),
      insert: () => ({
        then: (cb: unknown) => cb({ data: [{ id: 1 }], error: null }),
      }),
      update: () => ({
        then: (cb: unknown) => cb({ data: [{ id: 1 }], error: null }),
      }),
    }),
  },
  insertPromptLog: vi.fn(),
  insertErrorLog: vi.fn(),
}));

import { vi } from 'vitest';

// Mock the Memberstack client
vi.mock('@memberstack/react', () => ({
  useMemberstack: () => ({
    member: {
      id: 'test-user-id',
      email: 'test@example.com',
      metadata: {},
      auth: {
        uid: 'test-uid',
        accessToken: 'test-token',
        refreshToken: 'test-refresh-token',
      },
    },
  }),
}));

// Mock PostHog
vi.mock('posthog-js', () => ({
  default: {
    init: vi.fn(),
    capture: vi.fn(),
  },
}));

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(() => Promise.resolve()),
  },
});

// Mock window.matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock global fetch for API calls
if (!global.fetch) {
  global.fetch = vi.fn((input: RequestInfo | URL, ..._args: unknown[]) => {
    const url = typeof input === 'string' ? input : input.toString();
    if (url.includes('/v1/intent-mirror')) {
      const body = JSON.stringify({
        promptId: 'test-prompt-123',
        confidence: 0.95,
        summary: 'Create a family-friendly bakery',
        clarifyingQuestions: [],
        score: 0.95,
      });
      return Promise.resolve(
        new Response(body, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    // Default mock response for other endpoints
    return Promise.resolve(
      new Response('{}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });
}

// Ensure analytics uses real PostHog client in test
if (!process.env.VITE_POSTHOG_API_KEY) {
  throw new Error(
    'VITE_POSTHOG_API_KEY not set. Please add it to your .env file. See .env.example for details.'
  );
}
