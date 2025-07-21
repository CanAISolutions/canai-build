# CanAI Local Testing Plan

## Overview

This test plan ensures your CanAI backend is ready for Render deployment by systematically testing
all components locally.

## Test Phases

### Phase 1: Environment Setup ✅

- [ ] Node.js version check (18.19.0+)
- [ ] Environment file setup (.env)
- [ ] Required dependencies installed
- [ ] TypeScript configuration valid

### Phase 2: Build Process ✅

- [ ] Dependencies installation (`npm ci`)
- [ ] TypeScript compilation (`npm run build`)
- [ ] No build errors or warnings
- [ ] Production build artifacts generated

### Phase 3: Code Quality ✅

- [ ] All tests pass (`npm test`)
- [ ] TypeScript type checking (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] No security vulnerabilities

### Phase 4: Server Startup ✅

- [ ] Server starts without errors
- [ ] Correct port binding (10000)
- [ ] Environment variables loaded
- [ ] Graceful shutdown handling

### Phase 5: Health & Basic Functionality ✅

- [ ] Health endpoint responds (`/healthz`)
- [ ] CORS headers present
- [ ] Error handling works
- [ ] Rate limiting functional

### Phase 6: API Endpoint Testing ✅

- [ ] Authentication endpoints
- [ ] Input validation endpoints
- [ ] Emotional analysis endpoints
- [ ] Spark generation endpoints
- [ ] Intent mirror endpoints
- [ ] Feedback endpoints
- [ ] Spark split endpoints
- [ ] Progress saving endpoints
- [ ] Revision request endpoints
- [ ] Payment endpoints

### Phase 7: Integration Testing ✅

- [ ] Database connectivity (Supabase)
- [ ] AI service integration (OpenAI/Anthropic)
- [ ] Payment processing (Stripe)
- [ ] Authentication (Memberstack)
- [ ] Analytics (PostHog/Sentry)

### Phase 8: Performance Testing ✅

- [ ] Response times acceptable
- [ ] Memory usage reasonable
- [ ] Concurrent request handling
- [ ] Error recovery mechanisms

## Quick Test Commands

```bash
# 1. Environment check
node --version
ls -la .env

# 2. Build test
cd backend
npm ci
npm run build

# 3. Quality checks
npm test
npm run typecheck

# 4. Server test
npm start &
sleep 3
curl http://localhost:10000/healthz

# 5. API test
./scripts/test-api-endpoints.sh

# 6. Cleanup
pkill -f "npm start"
```

## Expected Results

### Build Process

- ✅ No errors during `npm ci`
- ✅ TypeScript compilation succeeds
- ✅ All tests pass
- ✅ No linting errors

### Server Startup

- ✅ Server starts on port 10000
- ✅ Health endpoint returns 200 OK
- ✅ CORS headers present
- ✅ Graceful shutdown works

### API Endpoints

- ✅ All endpoints respond with correct status codes
- ✅ JSON responses are valid
- ✅ Error handling returns appropriate errors
- ✅ Authentication works with valid tokens

### Integration

- ✅ Database queries succeed
- ✅ AI service calls work
- ✅ Payment processing functional
- ✅ Analytics events sent

## Troubleshooting Guide

### Build Failures

```bash
# Clear everything and rebuild
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm ci
npm run build
```

### Server Won't Start

```bash
# Check port availability
lsof -i :10000
# Check environment variables
node -e "console.log(process.env.PORT)"
```

### API Tests Fail

```bash
# Check server is running
curl http://localhost:10000/healthz
# Check specific endpoint
curl http://localhost:10000/api/v1/auth/status
```

### Database Issues

```bash
# Test Supabase connection
cd backend
npm run check:supabase:connection
```

## Success Criteria

Your local build is ready for Render deployment when:

1. ✅ All build steps complete without errors
2. ✅ All tests pass (100% success rate)
3. ✅ Server starts and responds to health checks
4. ✅ All API endpoints return expected responses
5. ✅ Integration tests pass with real credentials
6. ✅ Performance meets PRD requirements
7. ✅ Error handling is robust
8. ✅ Security measures are in place

## Pre-Deployment Checklist

Before pushing to Render:

- [ ] Local build test passes completely
- [ ] All environment variables documented
- [ ] Database migrations tested
- [ ] API documentation updated
- [ ] Error logs reviewed
- [ ] Performance benchmarks met
- [ ] Security scan completed
- [ ] Backup procedures verified

## Rollback Plan

If deployment fails:

1. **Immediate**: Revert to previous working commit
2. **Investigation**: Check Render logs for specific errors
3. **Fix**: Address issues in local environment
4. **Retest**: Run full local test suite
5. **Redeploy**: Push fixed code to Render

## Monitoring Post-Deployment

After successful deployment:

1. **Health Monitoring**: Check `/healthz` endpoint
2. **Error Tracking**: Monitor Sentry for errors
3. **Performance**: Track response times
4. **User Experience**: Test full user journey
5. **Analytics**: Verify data collection

## Support Resources

- [CanAI Documentation](docs/)
- [PRD Requirements](docs/PRD.md)
- [API Documentation](docs/api/)
- [Render Dashboard](https://dashboard.render.com)
- [Supabase Dashboard](https://supabase.com/dashboard)
