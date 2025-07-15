# Instructions for Cursor AI: Deep Code Inspection and Fix for Render Backend Deployment Issue

## Overview

This Markdown file provides a comprehensive guide for you (Cursor AI) to perform a deep code
inspection and resolve deployment issues for a Node.js backend application on Render. The app is a
monorepo using Turbo, TypeScript, Express, Supabase (DB), Redis (rate limiting), and Sentry. The
deployment fails due to:

- No open ports detected (app hangs before `app.listen()`).
- Redis connection errors (defaults to localhost).
- Potential hangs in async bootstrapping (e.g., DB connection).
- Missing TypeScript compilation in Dockerfile.
- Absent `/health` route for health checks.

The user has shared code files, logs, and environment variables. Your task is to inspect the
codebase deeply, suggest and apply fixes, and ensure the app deploys successfully on Render.

### Key Shared Files and Details

- **Server.ts**: Entry point; awaits `startup()` then listens on port.
- **App.ts**: Defines Express app, middleware, Sentry; awaits `bootstrapAsyncDependencies(app)`.
- **Dockerfile**: Builds the image but lacks TS compilation; runs `node server.js`.
- **docker-compose.yml**: Local setup with Postgres, Redis, Mongo.
- **package.json** (backend/root): Monorepo with Turbo; dependencies include
  `@supabase/supabase-js`, `ioredis`, `redis`, `rate-limiter-flexible`, `express`, etc. Scripts:
  `build` via Turbo.
- **tsconfig.json**: Targets ES2020, CommonJS module, outputs to `./dist`.
- **Environment Variables**:
  - `REDIS_URL=redis://localhost:6379/0` (local; invalid on Render).
  - `DATABASE_URL=postgresql://postgres:Ic4rqNFfJ24DQGlN@db.xegwrehxfbxbatsdpvqe.supabase.co:5432/postgres`
    (Direct Supabase URL; recommend switching to Connection Pooler).
- **Deployment Logs**: Repeated Redis ECONNREFUSED on localhost; port scan timeout.
- **Repo**: https://github.com/CanAISolutions/canai-build
- **Render Service**: https://canai-router.onrender.com (internal port 3000; outbound IPs provided).

Assume the full codebase is available in your workspace (e.g., cloned from the repo). If not, clone
it first.

## Step-by-Step Instructions for Deep Code Inspection and Fixes

Follow these steps sequentially. For each, perform a deep inspection: Analyze code flow,
dependencies, potential edge cases, and test locally (e.g., via Docker). Suggest changes with code
snippets, then apply them. After fixes, test deployment on a staging Render service.

### 1. **Setup and Initial Inspection**

- Clone the repo: `git clone https://github.com/CanAISolutions/canai-build.git`.
- Install dependencies: `npm install`.
- Build locally: `npm run build` (uses Turbo; verify `./dist` is generated with JS files).
- Run locally: Set env vars (`REDIS_URL`, `DATABASE_URL` to local or test values), then `npm start`.
- Inspect: Trace from `Server.ts` -> `startup()` in `App.ts` -> `bootstrapAsyncDependencies`. Check
  for async awaits that could hang (e.g., Supabase client creation, Redis init).
- Add debug logs: In `App.ts` and `bootstrapAsyncDependencies.ts`, add
  `console.log('Step: [description]')` to track progress.
- Test: Run and curl `http://localhost:10000/health` (should fail initially).

### 2. **Fix TypeScript Compilation and Dockerfile**

- **Inspection**: tsconfig outputs CommonJS to `./dist`, but package.json is ESM
  (`"type": "module"`). Dockerfile installs prod deps only and runs `node server.js` without
  building—TS files won't run.
- **Fixes**:
  - Update tsconfig.json: Change `"module": "CommonJS"` to `"module": "NodeNext"` for ESM
    compatibility.
  - Update Dockerfile to multi-stage (build with Turbo, copy dist):

    ```
    # Build stage
    FROM node:20.19.0-alpine AS builder

    WORKDIR /app

    COPY package.json yarn.lock turbo.json ./
    COPY apps ./apps  # Adjust if backend workspace differs
    COPY packages ./packages

    RUN npm install
    RUN npm run build  # Or turbo run build --filter=backend

    # Production stage
    FROM node:20.19.0-alpine

    WORKDIR /app

    RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

    COPY --from=builder /app/apps/backend/dist ./dist  # Adjust path
    COPY --from=builder /app/apps/backend/package.json ./

    RUN npm install --only=production

    RUN chown -R nodejs:nodejs /app
    USER nodejs

    EXPOSE 10000
    ENV NODE_ENV=production

    HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
      CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 10000) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

    CMD ["node", "dist/Server.js"]  # Adjust if output filename differs
    ```

  - Test: `docker build -t myapp -f Dockerfile .` and
    `docker run -p 10000:10000 -e PORT=10000 myapp`. Verify no module errors.

### 3. **Add /health Route and Improve Health Checks**

- **Inspection**: No `/health` route in App.ts; Render requires it for liveness.
- **Fix**: In App.ts, after middleware:
  ```
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'OK' });
  });
  ```
- Test: Run app, curl `/health`—expect 200 OK.

### 4. **Fix Redis Configuration**

- **Inspection**: Uses `ioredis` or `redis` with `rate-limiter-flexible`. Defaults to localhost if
  `REDIS_URL` unset. Logs show repeated failures but fallback to memory.
- **Fixes**:
  - In rate limiter init (likely in bootstrapAsyncDependencies or utils file): Use
    `process.env.REDIS_URL` without local fallback. Add error handling:
    ```
    const redisClient = new Redis(process.env.REDIS_URL, { enableOfflineQueue: false });
    redisClient.on('error', err => console.error('Redis error:', err));
    ```
  - Recommend: Create Render Redis instance; set `REDIS_URL` in Render env to internal connection
    string.
- Test: Set env to a local Redis, verify no localhost attempts.

### 5. **Fix Supabase DB Connection**

- **Inspection**: Uses `@supabase/supabase-js`. Direct URL may hang on IPv6; hangs could block
  bootstrap.
- **Fixes**:
  - Switch to Supabase Connection Pooler (Session mode, port 5432) for IPv4/IPv6 compatibility.
    Update `DATABASE_URL` to pooler string.
  - In Supabase client init (in bootstrap):
    ```
    import { createClient } from '@supabase/supabase-js';
    const supabase = createClient(process.env.DATABASE_URL, process.env.SUPABASE_ANON_KEY || '', {
      auth: { persistSession: false },
      db: { schema: 'public' },
      global: { fetch: (...args) => fetch(...args) }  // If fetch issues
    });
    // Test connection
    const { data, error } = await supabase.from('your_test_table').select('count(*)');
    if (error) throw error;
    ```
  - Add timeout/retry logic if needed.
- Test: Connect locally with pooler URL.

### 6. **Handle Bootstrapping Hangs**

- **Inspection**: `bootstrapAsyncDependencies` likely initializes DB/Redis; add try-catch to prevent
  silent failures.
- **Fix**: Wrap in try-catch, log errors, and rethrow to trigger Server.ts catch.
  ```
  try {
    // DB/Redis init
    console.log('Bootstrap success');
  } catch (err) {
    logger.fatal(serializeError(err), 'Bootstrap failed');
    throw err;
  }
  ```
- If migrations run here, ensure they don't block.

### 7. **Final Testing and Deployment**

- Build and run Docker locally; simulate Render with dynamic PORT.
- Deploy to Render: Update Dockerfile path, env vars (NODE_ENV=production, REDIS_URL, DATABASE_URL).
- Monitor logs: Ensure port binds within 60s, no Redis errors.
- If fails, inspect new logs and iterate.

## Additional Guidelines

- **Deep Inspection Tips**: Use VS Code/Cursor features for call graphs, dependency analysis. Check
  for unhandled promises, async leaks.
- **Best Practices**: Add integration tests for deployment (e.g., via `npm run test:deployment`).
- **If Stuck**: Ask for more files (e.g., bootstrapAsyncDependencies.ts) or logs.

Save changes, commit, and push. Confirm with user before final deploy.
