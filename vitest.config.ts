import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load environment variables for tests
dotenv.config();

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    testTimeout: 10000,
    setupFiles: ['./vitest.setup.ts', './vitest.setup.js'],
    deps: {
      external: ['@ai-sdk/hume', 'supertest'],
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 10,
        functions: 10,
        branches: 10,
        statements: 10,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './frontend/src'),
      '~': resolve(__dirname, './'),
    },
  },
});
