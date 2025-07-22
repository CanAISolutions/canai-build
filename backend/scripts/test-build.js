#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing build process...');

// Test 1: Check if required source files exist
const requiredSourceFiles = ['start-deploy.js', 'server-deploy.js'];
const missingSourceFiles = requiredSourceFiles.filter(
  file => !fs.existsSync(path.join(__dirname, file))
);

if (missingSourceFiles.length > 0) {
  console.error(`❌ Missing source files: ${missingSourceFiles.join(', ')}`);
  process.exit(1);
}

console.log('✅ All source files exist');

// Test 2: Check if package.json exists
const packageJsonPath = path.join(__dirname, '..', 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found');
  process.exit(1);
}

console.log('✅ package.json exists');

// Test 3: Run the build process
try {
  console.log('🔨 Running build process...');
  const { execSync } = await import('child_process');
  execSync('node scripts/build-deploy.js', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
  });
  console.log('✅ Build process completed successfully');
} catch (error) {
  console.error('❌ Build process failed:', error.message);
  process.exit(1);
}

// Test 4: Verify dist directory contents
const distDir = path.join(__dirname, '..', 'dist');
const requiredDistFiles = ['start.js', 'server.js', 'package.json'];
const missingDistFiles = requiredDistFiles.filter(
  file => !fs.existsSync(path.join(distDir, file))
);

if (missingDistFiles.length > 0) {
  console.error(`❌ Missing dist files: ${missingDistFiles.join(', ')}`);
  process.exit(1);
}

console.log('✅ All dist files created successfully');
console.log('🎉 Build test passed!');
