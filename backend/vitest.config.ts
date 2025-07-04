import { defineConfig } from 'vitest/config';
import dotenv from 'dotenv';
import path from 'path';

process.env.NODE_ENV = 'test';
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
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
  },
});
