#!/usr/bin/env node

// Simple JavaScript wrapper to run TypeScript files
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run ts-node with proper ES module support
const tsNode = spawn(
  'npx',
  ['ts-node', '--esm', '--experimental-specifier-resolution=node', 'start.ts'],
  {
    stdio: 'inherit',
    cwd: __dirname,
  }
);

tsNode.on('error', error => {
  console.error('Failed to start ts-node:', error);
  process.exit(1);
});

tsNode.on('exit', code => {
  process.exit(code);
});
