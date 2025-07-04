# CanAI Scripts - Automation & Utilities

<div align="center">

**🔧 Development & Deployment Automation**

![Bash](https://img.shields.io/badge/bash-scripts-green.svg)
![Node.js](https://img.shields.io/badge/node.js-utilities-blue.svg)
![Automation](https://img.shields.io/badge/automation-enabled-orange.svg)

</div>

## 🌟 Overview

This directory contains automation scripts, utilities, and tools for the CanAI Emotional Sovereignty
Platform development and deployment workflows. These scripts help streamline development processes,
validate configurations, and automate routine tasks across the 9-stage user journey implementation.

## 📁 Directory Structure

```
scripts/
├── 🚀 deployment/                # Deployment automation scripts
│   ├── deploy.sh                # Main deployment script
│   ├── health-check.sh          # Post-deployment health checks
│   ├── rollback.sh              # Emergency rollback script
│   └── backup.sh                # Database backup script
├── 🧪 testing/                  # Testing automation scripts
│   ├── run-tests.sh             # Comprehensive test runner
│   ├── e2e-setup.sh             # E2E test environment setup
│   ├── performance-test.sh       # Performance testing script
│   └── accessibility-test.sh     # A11y testing automation
├── 🔧 development/              # Development utility scripts
│   ├── setup.sh                # Initial development setup
│   ├── reset-db.sh              # Database reset for development
│   ├── generate-types.sh        # TypeScript type generation
│   └── lint-fix.sh              # Code quality fixes
├── 🔍 validation/               # Configuration validation scripts
│   ├── validate-env.js          # Environment variable validation
│   ├── validate-taskmaster.js   # TaskMaster task validation
│   ├── validate-cortex.js       # Cortex memory validation
│   └── validate-rules.js        # Cursor rules validation
├── 📊 analytics/                # Analytics and reporting scripts
│   ├── generate-report.js       # Quality metrics report
│   ├── bundle-analysis.js       # Bundle size analysis
│   └── performance-report.js    # Performance metrics report
├── 🛠️ utilities/                # General utility scripts
│   ├── clean.sh                 # Cleanup script
│   ├── update-deps.sh           # Dependency updates
│   └── format-code.sh           # Code formatting
└── 📖 README.md                 # This documentation file
```

## 🚀 Deployment Scripts

### Main Deployment (`deployment/deploy.sh`)

```bash
#!/bin/bash
# Main deployment script for CanAI platform

set -e

ENVIRONMENT=${1:-staging}
BRANCH=${2:-main}

echo "🚀 Starting CanAI deployment to $ENVIRONMENT"

# Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
./scripts/validation/validate-env.js $ENVIRONMENT
./scripts/testing/run-tests.sh

# Build applications
echo "🏗️ Building applications..."
npm run build:frontend
npm run build:backend

# Deploy to Render
echo "📦 Deploying to Render..."
if [ "$ENVIRONMENT" = "production" ]; then
    curl -X POST \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        "https://api.render.com/v1/services/$RENDER_PRODUCTION_SERVICE_ID/deploys"
else
    curl -X POST \
        -H "Authorization: Bearer $RENDER_API_KEY" \
        -H "Content-Type: application/json" \
        "https://api.render.com/v1/services/$RENDER_STAGING_SERVICE_ID/deploys"
fi

# Post-deployment health checks
echo "🏥 Running health checks..."
./scripts/deployment/health-check.sh $ENVIRONMENT

echo "✅ Deployment completed successfully!"
```

### Health Check (`deployment/health-check.sh`)

```bash
#!/bin/bash
# Post-deployment health check script

ENVIRONMENT=${1:-staging}
MAX_RETRIES=30
RETRY_INTERVAL=10

if [ "$ENVIRONMENT" = "production" ]; then
    BASE_URL="https://canai-router.onrender.com"
else
    BASE_URL="https://canai-staging.onrender.com"
fi

echo "🏥 Running health checks for $ENVIRONMENT environment..."

# Check API health
for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i/$MAX_RETRIES: Checking API health..."

    if curl -f -s "$BASE_URL/health" > /dev/null; then
        echo "✅ API health check passed"
        break
    fi

    if [ $i -eq $MAX_RETRIES ]; then
        echo "❌ API health check failed after $MAX_RETRIES attempts"
        exit 1
    fi

    sleep $RETRY_INTERVAL
done

# Check frontend availability
if curl -f -s "$BASE_URL" > /dev/null; then
    echo "✅ Frontend availability check passed"
else
    echo "❌ Frontend availability check failed"
    exit 1
fi

# Check database connectivity
if curl -f -s "$BASE_URL/api/health/db" > /dev/null; then
    echo "✅ Database connectivity check passed"
else
    echo "❌ Database connectivity check failed"
    exit 1
fi

# Check external service integrations
echo "🔍 Checking external service integrations..."
SERVICES=("openai" "hume" "stripe" "memberstack" "supabase")

for service in "${SERVICES[@]}"; do
    if curl -f -s "$BASE_URL/api/health/$service" > /dev/null; then
        echo "✅ $service integration check passed"
    else
        echo "⚠️ $service integration check failed"
    fi
done

echo "🎉 All health checks completed!"
```

## 🧪 Testing Scripts

### Comprehensive Test Runner (`testing/run-tests.sh`)

```bash
#!/bin/bash
# Comprehensive test runner for CanAI platform

set -e

echo "🧪 Running CanAI test suite..."

# Environment setup
export NODE_ENV=test
export CI=true

# Unit tests
echo "🔬 Running unit tests..."
npm run test:unit -- --coverage --watchAll=false

# Integration tests
echo "🔗 Running integration tests..."
npm run test:integration -- --watchAll=false

# API tests
echo "🌐 Running API tests..."
npm run test:api

# E2E tests (if not in CI or explicitly requested)
if [ "$RUN_E2E" = "true" ] || [ -z "$CI" ]; then
    echo "🎭 Running E2E tests..."
    ./scripts/testing/e2e-setup.sh
    npm run test:e2e
fi

# Performance tests
if [ "$RUN_PERFORMANCE" = "true" ]; then
    echo "⚡ Running performance tests..."
    ./scripts/testing/performance-test.sh
fi

# Accessibility tests
echo "♿ Running accessibility tests..."
./scripts/testing/accessibility-test.sh

# Security tests
echo "🔒 Running security tests..."
npm audit --audit-level=moderate
npm run test:security

echo "✅ All tests completed successfully!"
```

### E2E Setup (`testing/e2e-setup.sh`)

```bash
#!/bin/bash
# E2E test environment setup

echo "🎭 Setting up E2E test environment..."

# Start test database
echo "🗄️ Starting test database..."
docker-compose -f docker-compose.test.yml up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
npm run db:migrate:test

# Seed test data
echo "🌱 Seeding test data..."
npm run db:seed:test

# Start backend server
echo "🔧 Starting backend server..."
npm run start:test &
BACKEND_PID=$!

# Start frontend server
echo "🎨 Starting frontend server..."
npm run dev:test &
FRONTEND_PID=$!

# Wait for servers to be ready
echo "⏳ Waiting for servers to be ready..."
npx wait-on http://localhost:3000 http://localhost:10000

echo "✅ E2E environment setup completed!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
```

## 🔍 Validation Scripts

### Environment Validation (`validation/validate-env.js`)

```javascript
#!/usr/bin/env node
/**
 * Environment variable validation script
 */

const fs = require('fs');
const path = require('path');

const environment = process.argv[2] || 'development';

console.log(`🔍 Validating environment variables for ${environment}...`);

// Required environment variables by environment
const requiredVars = {
  development: ['NODE_ENV', 'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'OPENAI_API_KEY'],
  staging: [
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'HUME_API_KEY',
    'STRIPE_SECRET_KEY',
    'MEMBERSTACK_SECRET_KEY',
  ],
  production: [
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY',
    'HUME_API_KEY',
    'STRIPE_SECRET_KEY',
    'MEMBERSTACK_SECRET_KEY',
    'SENTRY_DSN',
    'POSTHOG_API_KEY',
  ],
};

// Load environment file
const envFile = `.env.${environment}`;
if (fs.existsSync(envFile)) {
  require('dotenv').config({ path: envFile });
}

// Validate required variables
const missing = [];
const required = requiredVars[environment] || requiredVars.development;

required.forEach(varName => {
  if (!process.env[varName]) {
    missing.push(varName);
  }
});

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(varName => {
    console.error(`  - ${varName}`);
  });
  process.exit(1);
}

// Validate API keys format
const apiKeys = [
  { name: 'OPENAI_API_KEY', pattern: /^sk-/ },
  { name: 'STRIPE_SECRET_KEY', pattern: /^sk_/ },
  { name: 'SUPABASE_ANON_KEY', pattern: /^eyJ/ },
];

apiKeys.forEach(({ name, pattern }) => {
  const value = process.env[name];
  if (value && !pattern.test(value)) {
    console.warn(`⚠️ ${name} format appears invalid`);
  }
});

console.log('✅ Environment validation passed!');
```

### TaskMaster Validation (`validation/validate-taskmaster.js`)

```javascript
#!/usr/bin/env node
/**
 * TaskMaster task validation script
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating TaskMaster tasks...');

const taskFile = 'Taskmaster-Tasks.md';
if (!fs.existsSync(taskFile)) {
  console.error('❌ TaskMaster tasks file not found');
  process.exit(1);
}

const content = fs.readFileSync(taskFile, 'utf8');

// Validate task format
const taskPattern = /^##\s+T\d+\.\d+\.\d+/gm;
const tasks = content.match(taskPattern) || [];

console.log(`📋 Found ${tasks.length} tasks`);

// Validate task dependencies
const dependencyPattern = /Depends on:\s*(T\d+\.\d+\.\d+(?:,\s*T\d+\.\d+\.\d+)*)/gm;
const dependencies = [];
let match;

while ((match = dependencyPattern.exec(content)) !== null) {
  const deps = match[1].split(',').map(d => d.trim());
  dependencies.push(...deps);
}

// Check for missing dependencies
const taskIds = tasks.map(task => task.match(/T\d+\.\d+\.\d+/)[0]);
const missingDeps = dependencies.filter(dep => !taskIds.includes(dep));

if (missingDeps.length > 0) {
  console.error('❌ Missing task dependencies:');
  missingDeps.forEach(dep => console.error(`  - ${dep}`));
  process.exit(1);
}

// Validate task structure
const requiredSections = ['Description', 'Acceptance Criteria', 'Technical Requirements'];
let missingStructure = false;

tasks.forEach(task => {
  const taskId = task.match(/T\d+\.\d+\.\d+/)[0];
  const taskStart = content.indexOf(task);
  const nextTaskIndex = content.indexOf('## T', taskStart + 1);
  const taskContent =
    nextTaskIndex === -1 ? content.slice(taskStart) : content.slice(taskStart, nextTaskIndex);

  requiredSections.forEach(section => {
    if (!taskContent.includes(section)) {
      console.error(`❌ Task ${taskId} missing section: ${section}`);
      missingStructure = true;
    }
  });
});

if (missingStructure) {
  process.exit(1);
}

console.log('✅ TaskMaster validation passed!');
```

## 📊 Analytics Scripts

### Performance Report (`analytics/performance-report.js`)

```javascript
#!/usr/bin/env node
/**
 * Performance metrics report generator
 */

const fs = require('fs');
const path = require('path');

console.log('📊 Generating performance report...');

// Read Lighthouse results
const lighthouseResults = JSON.parse(fs.readFileSync('lighthouse-results.json', 'utf8'));

// Read bundle analysis
const bundleStats = JSON.parse(fs.readFileSync('bundle-stats.json', 'utf8'));

// Generate report
const report = {
  timestamp: new Date().toISOString(),
  coreWebVitals: {
    lcp: lighthouseResults.audits['largest-contentful-paint'].numericValue,
    fid: lighthouseResults.audits['max-potential-fid'].numericValue,
    cls: lighthouseResults.audits['cumulative-layout-shift'].numericValue,
    fcp: lighthouseResults.audits['first-contentful-paint'].numericValue,
  },
  bundleSize: {
    total: bundleStats.assets.reduce((sum, asset) => sum + asset.size, 0),
    javascript: bundleStats.assets
      .filter(asset => asset.name.endsWith('.js'))
      .reduce((sum, asset) => sum + asset.size, 0),
    css: bundleStats.assets
      .filter(asset => asset.name.endsWith('.css'))
      .reduce((sum, asset) => sum + asset.size, 0),
  },
  performance: {
    score: lighthouseResults.categories.performance.score * 100,
    accessibility: lighthouseResults.categories.accessibility.score * 100,
    bestPractices: lighthouseResults.categories['best-practices'].score * 100,
    seo: lighthouseResults.categories.seo.score * 100,
  },
};

// Check against performance budget
const budget = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  bundleSize: 500000,
  performanceScore: 90,
};

const violations = [];

if (report.coreWebVitals.lcp > budget.lcp) {
  violations.push(`LCP: ${report.coreWebVitals.lcp}ms > ${budget.lcp}ms`);
}

if (report.coreWebVitals.fid > budget.fid) {
  violations.push(`FID: ${report.coreWebVitals.fid}ms > ${budget.fid}ms`);
}

if (report.coreWebVitals.cls > budget.cls) {
  violations.push(`CLS: ${report.coreWebVitals.cls} > ${budget.cls}`);
}

if (report.bundleSize.total > budget.bundleSize) {
  violations.push(`Bundle: ${report.bundleSize.total} > ${budget.bundleSize}`);
}

if (report.performance.score < budget.performanceScore) {
  violations.push(`Performance: ${report.performance.score} < ${budget.performanceScore}`);
}

// Output report
console.log('\n📊 Performance Report');
console.log('===================');
console.log(`Timestamp: ${report.timestamp}`);
console.log('\nCore Web Vitals:');
console.log(`  LCP: ${report.coreWebVitals.lcp}ms`);
console.log(`  FID: ${report.coreWebVitals.fid}ms`);
console.log(`  CLS: ${report.coreWebVitals.cls}`);
console.log(`  FCP: ${report.coreWebVitals.fcp}ms`);
console.log('\nBundle Size:');
console.log(`  Total: ${(report.bundleSize.total / 1024).toFixed(2)} KB`);
console.log(`  JavaScript: ${(report.bundleSize.javascript / 1024).toFixed(2)} KB`);
console.log(`  CSS: ${(report.bundleSize.css / 1024).toFixed(2)} KB`);
console.log('\nLighthouse Scores:');
console.log(`  Performance: ${report.performance.score}%`);
console.log(`  Accessibility: ${report.performance.accessibility}%`);
console.log(`  Best Practices: ${report.performance.bestPractices}%`);
console.log(`  SEO: ${report.performance.seo}%`);

if (violations.length > 0) {
  console.log('\n❌ Performance Budget Violations:');
  violations.forEach(violation => console.log(`  - ${violation}`));
  process.exit(1);
} else {
  console.log('\n✅ All performance budgets met!');
}

// Save report
fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
console.log('\n📄 Report saved to performance-report.json');
```

## 🛠️ Utility Scripts

### Development Setup (`development/setup.sh`)

```bash
#!/bin/bash
# Initial development environment setup

echo "🚀 Setting up CanAI development environment..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js version $REQUIRED_VERSION or higher required"
    echo "Current version: $NODE_VERSION"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup git hooks
echo "🔗 Setting up git hooks..."
npx husky install

# Copy environment files
echo "⚙️ Setting up environment files..."
if [ ! -f ".env.local" ]; then
    cp env.example .env.local
    echo "📝 Created .env.local - please update with your API keys"
fi

# Setup database
echo "🗄️ Setting up development database..."
./scripts/development/reset-db.sh

# Generate TypeScript types
echo "📝 Generating TypeScript types..."
./scripts/development/generate-types.sh

# Initial build
echo "🏗️ Running initial build..."
npm run build

# Validate setup
echo "🔍 Validating setup..."
./scripts/validation/validate-env.js development

echo "✅ Development environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your API keys"
echo "2. Run 'npm run dev' to start development servers"
echo "3. Visit http://localhost:3000 to see the application"
```

## 🌱 Test Data Seeding Scripts

### Unified Supabase Test User Seeder (`seed-supabase-users.js`)

This script seeds test users and data into Supabase for integration and development testing. It
consolidates the functionality of the previous single-user and multi-user seeding scripts.

**Usage:**

```bash
# Seed the default integration test user (registers user, generates JWT, seeds data)
node scripts/seed-supabase-users.js --single

# Seed all test users (admin/regular, just data seeding)
node scripts/seed-supabase-users.js --all

# Seed a specific user by email (registers user, generates JWT, seeds data)
node scripts/seed-supabase-users.js --email testuser+integration@example.com
```

**Options:**

- `--single` (default): Seed the default integration test user. Registers the user if needed,
  generates a JWT, and seeds all required tables.
- `--all`: Seed all test users (admin/regular) as defined in the script. Only seeds data; does not
  handle registration or JWT.
- `--email <email>`: Seed a specific user by email. Registers the user if needed, generates a JWT,
  and seeds all required tables.

**Environment Variables Required:**

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (required for admin operations)
- `SUPABASE_JWT_SECRET`

**What it does:**

- Registers users (if needed) and generates JWTs for integration testing
- Seeds `prompt_logs`, `comparisons`, and `spark_logs` tables for each user
- Provides clear logging and error handling

## 🚀 Usage

### Running Scripts

```bash
# Make scripts executable
chmod +x scripts/**/*.sh

# Run deployment
./scripts/deployment/deploy.sh production

# Run tests
./scripts/testing/run-tests.sh

# Setup development environment
./scripts/development/setup.sh

# Validate configuration
node scripts/validation/validate-env.js production
```

### Script Dependencies

Most scripts require:

- Node.js 18+
- npm or yarn
- Docker (for database scripts)
- curl (for API calls)
- jq (for JSON processing)

## 🤝 Contributing

### Adding New Scripts

1. Create script in appropriate subdirectory
2. Add executable permissions: `chmod +x script-name.sh`
3. Include comprehensive error handling
4. Add documentation to this README
5. Test script in different environments

### Script Guidelines

- Use `set -e` for bash scripts to exit on error
- Include comprehensive logging with emojis
- Validate inputs and environment
- Provide helpful error messages
- Include usage examples

## check-secrets.sh: Pre-commit Secret/API Key Scanner

- This script scans staged files for likely API keys, secrets, or tokens before every commit.
- If any are found, the commit is blocked and you must remove the secret before proceeding.
- Patterns checked include: \_API_KEY, SECRET, TOKEN, sk-..., JWT, and more.
- Used automatically by the Husky pre-commit hook.

---

<div align="center">

**Built with ❤️ for the CanAI Emotional Sovereignty Platform**

[🏠 Back to Root](../README.md) | [🔧 Backend](../backend/README.md) |
[🎨 Frontend](../frontend/README.md)

</div>
