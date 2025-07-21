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

console.log('🚀 Starting deployment build...');
console.log(`📁 Script directory: ${__dirname}`);
console.log(`📁 Dist directory: ${distDir}`);

// Copy pre-made JavaScript files for deployment
const jsFiles = [
  { src: 'start-deploy.js', dest: 'start.js' },
  { src: 'server-deploy.js', dest: 'server.js' },
];

jsFiles.forEach(file => {
  const srcPath = path.join(__dirname, file.src);
  const destPath = path.join(distDir, file.dest);

  console.log(`🔍 Checking: ${srcPath}`);
  console.log(`📄 Will copy to: ${destPath}`);

  if (fs.existsSync(srcPath)) {
    console.log(`📄 Copying ${file.src} -> ${file.dest}`);
    fs.copyFileSync(srcPath, destPath);
  } else {
    console.error(`❌ Error: ${file.src} not found at ${srcPath}`);
    process.exit(1);
  }
});

// Copy package.json to dist
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const distPackageJsonPath = path.join(distDir, 'package.json');

console.log(`🔍 Checking package.json: ${packageJsonPath}`);

if (fs.existsSync(packageJsonPath)) {
  console.log('📦 Copying package.json');
  fs.copyFileSync(packageJsonPath, distPackageJsonPath);
} else {
  console.error(`❌ Error: package.json not found at ${packageJsonPath}`);
  process.exit(1);
}

// Verify all required files exist
const requiredFiles = ['start.js', 'server.js', 'package.json'];
const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(distDir, file)));

if (missingFiles.length > 0) {
  console.error(`❌ Error: Missing required files in dist: ${missingFiles.join(', ')}`);
  process.exit(1);
}

console.log('✅ Deployment build completed successfully!');
console.log(`📂 Output directory: ${distDir}`);
console.log(`📂 Dist contents:`, fs.readdirSync(distDir));
