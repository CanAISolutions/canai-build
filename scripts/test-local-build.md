# CanAI Local Build Testing Guide

This guide helps you test your CanAI backend build locally before deploying to Render, ensuring your
deployment will be successful.

## Prerequisites

- Node.js 18.19.0 or higher
- npm or yarn package manager
- Git (for version control)
- curl (for API testing)

## Quick Start

### 1. Environment Setup

First, ensure you have the correct environment variables:

```bash
# Copy the example environment file
cp env.example .env

# Edit .env with your actual values
# At minimum, you'll need:
# - SUPABASE_URL and SUPABASE_ANON_KEY (for database)
# - OPENAI_API_KEY or ANTHROPIC_API_KEY (for AI services)
# - STRIPE_SECRET_KEY_TEST (for payment testing)
```

### 2. Run Local Build Test

#### On macOS/Linux:

```bash
# Make the script executable
chmod +x scripts/test-local-build.sh

# Run the test
./scripts/test-local-build.sh
```

#### On Windows (PowerShell):

```powershell
# Run the PowerShell script
.\scripts\test-local-build.ps1
```

#### Manual Testing:

```bash
# Navigate to backend directory
cd backend

# Install dependencies (mirrors Render buildCommand)
npm ci

# Build the project (mirrors Render buildCommand)
npm run build

# Run tests
npm test

# Start the server (mirrors Render startCommand)
npm start
```

## What the Test Script Does

The local build test script mirrors your Render deployment process:

1. **Environment Check**: Verifies Node.js version and .env file
2. **Dependency Installation**: Runs `npm ci` (same as Render)
3. **Build Process**: Runs `npm run build` (same as Render)
4. **Testing**: Runs all tests to ensure code quality
5. **Type Checking**: Validates TypeScript types
6. **Server Start**: Starts the server using `npm start` (same as Render)
7. **Health Check**: Verifies the server is running and responding
8. **API Testing**: Tests critical endpoints

## API Endpoint Testing

After the server is running, you can test all API endpoints:

```bash
# Make the API test script executable
chmod +x scripts/test-api-endpoints.sh

# Run comprehensive API tests
./scripts/test-api-endpoints.sh

# Or test a specific endpoint
curl http://localhost:10000/healthz
```

## Testing with Real Credentials

For full functionality testing, you'll need:

### Required Environment Variables

```bash
# Database (Supabase)
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# AI Services (at least one)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
HUME_API_KEY=your-hume-api-key

# Payment Processing
STRIPE_SECRET_KEY_TEST=your-stripe-test-secret-key
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Authentication
MEMBERSTACK_API_KEY=your-memberstack-api-key
MEMBERSTACK_JWKS_URI=your-memberstack-jwks-uri

# Analytics (optional for testing)
POSTHOG_API_KEY=your-posthog-api-key
SENTRY_DSN=your-sentry-dsn
```

### Testing Authentication

```bash
# Test with a real JWT token
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:10000/api/v1/auth/status
```

## Common Issues and Solutions

### 1. Port Already in Use

```bash
# Check what's using port 10000
lsof -i :10000

# Kill the process or use a different port
export PORT=10001
./scripts/test-local-build.sh
```

### 2. Missing Dependencies

```bash
# Clear npm cache and reinstall
cd backend
rm -rf node_modules package-lock.json
npm ci
```

### 3. TypeScript Build Errors

```bash
# Check TypeScript configuration
cd backend
npx tsc --noEmit

# Fix any type errors before proceeding
```

### 4. Environment Variable Issues

```bash
# Verify .env file is loaded
cd backend
node -e "console.log(process.env.SUPABASE_URL)"
```

## Testing Different Scenarios

### 1. Production Mode Testing

```bash
# Set production environment
export NODE_ENV=production
./scripts/test-local-build.sh
```

### 2. Different Port Testing

```bash
# Test on a different port
export PORT=8080
./scripts/test-local-build.sh
```

### 3. API Testing with Different Base URLs

```bash
# Test against a different server
./scripts/test-api-endpoints.sh http://localhost:8080
```

## Integration Testing

### 1. Frontend Integration

```bash
# Start the backend
cd backend && npm start &

# Start the frontend (in another terminal)
cd frontend && npm run dev

# Test the full stack
curl http://localhost:5173
```

### 2. Database Integration

```bash
# Test Supabase connection
cd backend
npm run check:supabase:connection

# Run database tests
npm run test:supabase:connection
```

## Performance Testing

### 1. Load Testing

```bash
# Install Apache Bench (if available)
ab -n 100 -c 10 http://localhost:10000/healthz

# Or use wrk
wrk -t12 -c400 -d30s http://localhost:10000/healthz
```

### 2. Memory Usage

```bash
# Monitor memory usage
watch -n 1 'ps aux | grep node'
```

## Troubleshooting

### Build Failures

1. Check Node.js version: `node --version`
2. Clear npm cache: `npm cache clean --force`
3. Delete node_modules and reinstall: `rm -rf node_modules && npm ci`
4. Check TypeScript errors: `npm run typecheck`

### Runtime Errors

1. Check environment variables: `echo $NODE_ENV`
2. Verify database connection
3. Check API service credentials
4. Review server logs for specific errors

### Test Failures

1. Run tests individually: `npm run test:unit`
2. Check test environment setup
3. Verify mock configurations
4. Review test coverage: `npm run test -- --coverage`

## Pre-Deployment Checklist

Before deploying to Render, ensure:

- [ ] Local build test passes completely
- [ ] All tests pass (`npm test`)
- [ ] TypeScript compilation succeeds (`npm run typecheck`)
- [ ] API endpoints respond correctly
- [ ] Environment variables are configured in Render
- [ ] Database migrations are up to date
- [ ] Health check endpoint returns 200
- [ ] CORS is configured correctly
- [ ] Rate limiting is working
- [ ] Error handling is robust

## Next Steps

After successful local testing:

1. **Commit your changes**: `git add . && git commit -m "Ready for deployment"`
2. **Push to GitHub**: `git push origin main`
3. **Monitor Render deployment**: Check the Render dashboard
4. **Verify production health**: Test the deployed application
5. **Monitor logs**: Check for any runtime issues

## Support

If you encounter issues:

1. Check the [CanAI Documentation](docs/)
2. Review the [PRD](docs/PRD.md) for requirements
3. Check [Render deployment logs](https://dashboard.render.com)
4. Review [backend logs](backend/logs/) for errors

## Scripts Reference

| Script                  | Purpose                    | Usage                             |
| ----------------------- | -------------------------- | --------------------------------- |
| `test-local-build.sh`   | Full local build test      | `./scripts/test-local-build.sh`   |
| `test-local-build.ps1`  | Windows PowerShell version | `.\scripts\test-local-build.ps1`  |
| `test-api-endpoints.sh` | API endpoint testing       | `./scripts/test-api-endpoints.sh` |

## Environment Variables Reference

See [env.example](env.example) for a complete list of required environment variables and their
descriptions.
