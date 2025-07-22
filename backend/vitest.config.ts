import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

process.env.NODE_ENV = 'test';
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 30000, // Global timeout for all tests
    hookTimeout: 30000, // Global timeout for hooks (beforeEach, afterEach, etc.)
    pool: 'forks', // Use fork pool for better isolation
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork for better resource management
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
    include: [
      'tests/**/*.test.{js,ts}',
      'middleware/*.test.{js,ts}',
      'validation/*.test.{js,ts}',
    ],
    setupFiles: ['tests/vitest.setup.ts'],
  },
});
