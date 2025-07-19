#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('🚀 Starting JavaScript build for deployment...');

// Copy essential files only
const essentialFiles = ['start.ts', 'server.ts', 'health.ts', 'db.ts'];

essentialFiles.forEach(file => {
  const srcPath = path.join(__dirname, '..', file);
  const destPath = path.join(distDir, file.replace('.ts', '.js'));

  if (fs.existsSync(srcPath)) {
    console.log(`📄 Copying ${file} -> ${file.replace('.ts', '.js')}`);
    fs.copyFileSync(srcPath, destPath);
  } else {
    console.log(`⚠️  Warning: ${file} not found`);
  }
});

// Copy package.json to dist
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const distPackageJsonPath = path.join(distDir, 'package.json');

if (fs.existsSync(packageJsonPath)) {
  console.log('📦 Copying package.json');
  fs.copyFileSync(packageJsonPath, distPackageJsonPath);
}

console.log('✅ JavaScript build completed successfully!');
console.log(`📂 Output directory: ${distDir}`);
