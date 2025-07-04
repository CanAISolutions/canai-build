# CanAI Platform Project Structure Mapping

## Overview

The CanAI Emotional Sovereignty Platform is a monorepo with backend and frontend workspaces,
supporting a 9-stage user journey (F1-F9). It includes robust tooling, testing, and deployment
infrastructure for scalable development.

- **Version**: 3.0.0 (June 2025)
- **Status**: Infrastructure Foundation Complete
- **Last Updated**: June 23, 2025

## Project Structure

```
canai-build/
├── .cursor/                    # Cursor IDE rules
├── .github/                    # GitHub Actions workflows
├── .githooks/                  # Git hooks (TaskMaster automation)
├── .husky/                     # Git hooks
├── .roo/                       # Roo configuration
├── .taskmaster/                # TaskMaster AI configuration
├── .vscode/                    # VS Code settings
├── backend/                    # Backend APIs (workspace) ✅ LIVE
├── frontend/                   # React/Vite app (workspace)
├── databases/                  # Database schemas
├── docs/                       # Documentation
├── packages/                   # Shared utilities
├── scripts/                    # Automation scripts
├── coverage/                   # Test coverage
├── node_modules/               # Dependencies
├── Dockerfile                  # Docker container config (Render deployment)
└── [config files]              # Root configs
```

## Detailed Structure

### 1. Configuration & Tooling

- **.cursor/rules/**: Development guidelines
  - canai-typescript-rules.mdc
  - canai-testing-rules.mdc
  - canai-security-rules.mdc
  - canai-production-readiness.mdc
  - taskmaster.mdc
- **.github/workflows/**: 17 CI/CD pipelines
  - ci.yml: Main pipeline
  - test.yml: Unit, integration, e2e tests
  - lint.yml: ESLint, Prettier
  - performance.yml: Performance monitoring
  - security.yml: Security scans
- **.taskmaster/config/**: TaskMaster AI settings
- **Root Configs**:
  - .eslintrc.js
  - .prettierrc.js
  - tsconfig.json
  - vitest.config.ts
  - render.yaml
  - docker-compose.yml
  - taskmaster_tasks.md

### 2. Backend (Workspace)

```
backend/
├── db.js                    # Direct Postgres/SQL client for admin scripts and migrations (Node.js only, never used in frontend)
├── api/src/                   # Express APIs
│   ├── App.ts
│   ├── Server.ts
│   └── Contexts/             # Domain logic
├── config/                   # Configurations
│   └── quizRules.json
├── middleware/               # Express middleware
│   └── auth.js               # PRD-compliant authentication middleware
├── routes/                   # API routes
├── services/                 # Business logic
├── supabase/client.js        # Supabase client for RLS-safe CRUD (preferred for app logic)
├── tests/                    # Test suites
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── webhooks/                 # Make.com scenarios
│   └── make_scenarios/
├── package-backend.json      # Backend dependencies (Express 4.18.2)
└── server.js                 # Production Express server (✅ LIVE)
```

**Backend Infrastructure Status**: ✅ **PRODUCTION READY**

- **Live URL**: <https://canai-router.onrender.com>
- **Port**: 10000 with SSL termination
- **Middleware Stack**: Helmet (security), CORS, Morgan (logging), Body parsing
- **Health Endpoints**: `/` and `/health` with system metrics
- **Environment**: Production deployment with graceful shutdown
- **Docker**: Containerized with Alpine Node.js 18, non-root user

- **db.js**: Provides a direct Postgres connection using the `postgres` library. Use only for
  backend admin scripts, migrations, or advanced analytics that require raw SQL. Always use
  environment variable `DATABASE_URL` for credentials. Do **not** use in frontend or expose to
  client code.
- **auth.js**: PRD-compliant authentication middleware. Enforces Memberstack JWT authentication in
  production using `jsonwebtoken` and `jwks-rsa`. Bypasses auth in non-production for testing. See
  [docs/api/endpoints.md](api/endpoints.md) for details and usage.

### 3. Frontend (Workspace)

```
frontend/
├── src/
│   ├── components/           # Feature-based React components
│   │   ├── DiscoveryHook/    # F1: Hero.tsx, CTAButtons.tsx
│   │   ├── PurchaseFlow/     # F4: CheckoutModal.tsx
│   │   ├── DetailedInput/    # F5: StepOneForm.tsx
│   │   ├── IntentMirror/     # F6: SummaryCard.tsx
│   │   ├── SparkSplit/       # F8: EmotionalCompass.tsx
│   │   ├── feedback/         # F9: StarRating.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── pages/                # 9-stage journey
│   │   ├── DiscoveryHook.tsx # F1
│   │   ├── PurchaseFlow.tsx  # F4
│   │   ├── DetailedInput.tsx # F5
│   │   ├── IntentMirror.tsx  # F6
│   │   ├── SparkSplit.tsx    # F8
│   │   └── Feedback.tsx      # F9
│   ├── integrations/         # External service integrations
│   │   └── supabase/         # Supabase client and types
│   │       ├── client.ts     # Supabase client instance
│   │       ├── server.ts     # Server-side Supabase client
│   │       ├── supabase.ts   # Supabase configuration
│   │       └── types.ts      # Database type definitions
│   ├── utils/                # Utility functions
│   │   ├── supabase.ts       # Supabase utilities
│   │   ├── memberstack.ts
│   │   └── analytics.ts
│   └── tests/                # Unit, integration, e2e
├── public/                   # Static assets
├── vite.config.ts            # Vite build
└── tailwind.config.ts        # Tailwind CSS
```

### 4. Database

```
databases/
├── migrations/               # Schemas
├── seed/                     # Seed data
└── cron/                     # Scheduled tasks
```

### 5. Documentation

```
docs/
├── api/endpoints.md          # API docs
├── deployment/guide.md       # Deployment guide
├── cost-optimization-blueprint.md # Cost-value optimization strategy ✨ NEW
├── crm-export-guide.md       # CRM integration
├── glossary.md               # Project terms
├── PRD.md                    # Production Readiness Document (authoritative)
├── supabase-frontend-integration.md # Supabase React/Vite integration guide
└── project-structure-mapping.md # This document
```

### 6. Shared Packages

```
packages/
├── config/                   # Shared configs
└── tsconfig/                 # TypeScript configs
    ├── api.json
    └── ui.json
```

## Architecture Patterns

- **Monorepo**: Backend, frontend, shared workspaces
- **9-Stage Journey**:
  - F1: Discovery Hook
  - F2: Discovery Funnel
  - F3: Spark Layer
  - F4: Purchase Flow
  - F5: Detailed Input
  - F6: Intent Mirror
  - F7: Deliverable Generation
  - F8: SparkSplit
  - F9: Feedback Capture
- **Integrations**:
  - Supabase: Database, auth
  - Make.com: Automation
  - Memberstack: User management
  - Stripe: Payments
  - PostHog: Analytics
- **Standards**:
  - TypeScript (strict)
  - WCAG 2.2 AA accessibility
  - <2s response times
  - Vitest testing
  - ESLint, Prettier

## Cost Optimization Strategy

The platform implements a **tiered intelligence architecture** for sustainable scaling:

### Pricing Tiers

- **Basic** ($49/mo): GPT-3.5 + cultural awareness
- **Growth** ($199/mo): GPT-4o-mini + full emotional intelligence
- **Scale** ($499/mo): GPT-4o + premium features

### Technical Implementation

- **Smart Model Selection**: Automatic tier-based routing
- **Multi-level Caching**: Cultural context (24hr), templates (1hr), responses (30min)
- **Progressive Enhancement**: Tier-specific feature scaling
- **Cost Control**: 60-75% reduction target through optimization

### Expected Outcomes

- **API Cost Reduction**: $0.30 → $0.05-0.25 per request
- **Cache Hit Rate**: 40-70% API call reduction
- **Quality Maintenance**: TrustDelta ≥4.2, emotional resonance ≥0.7
- **Business Impact**: $124/month blended ARPU, >85% gross margins

_Full details in `docs/cost-optimization-blueprint.md`_

## Development Status

### Completed

- ✅ Monorepo setup
- ✅ Frontend: 9-stage journey components
- ✅ Tooling: Cursor, TaskMaster, ESLint
- ✅ CI/CD: 17 GitHub Actions workflows
- ✅ Testing: Vitest structure
- ✅ Documentation: CRM, deployment, glossary
- ✅ Cost optimization strategy and blueprint
- ✅ **Backend Infrastructure**: Express server with production middleware
- ✅ **Deployment**: Render containerized deployment (<https://canai-router.onrender.com>)
- ✅ **Security**: Helmet, CORS, SSL termination, non-root Docker user
- ✅ **Monitoring**: Health endpoints, Morgan logging, graceful shutdown

### Pending

- 🔄 Backend API routes and business logic
- 🔄 Database schemas, migrations
- 🔄 PostHog analytics integration
- 🔄 Test case implementation

## Development Workflow

### Setup

1. `npm install` (root)
2. Backend: `cd backend && npm run dev`
3. Frontend: `cd frontend && npm run dev`
4. Full: `npm run dev`

### Commands

- Test: `npm run test`
- Unit Test (Frontend): `cd frontend && npm run test:unit`
- Lint: `npm run lint`
- Typecheck (Root): `npm run typecheck:strict`
- Typecheck (Backend): `cd backend && npm run typecheck`
- Format: `npm run format`
- Format Diff: `npm run format:diff`
- Build: `npm run build`
- Migrate Test DB (Backend): `cd backend && npm run migrate:test`

### Quality Assurance

- Pre-commit hooks
- 17 CI/CD workflows
- CodeRabbit reviews
- Performance monitoring (Lighthouse)
- Security scans
- GDPR-compliant analytics

## Deployment

- **Platform**: Render
- **Containerization**: Docker
- **Config**: render.yaml
- **Checklists**: .github/templates/

## Next Steps

- Implement backend routes, services, middleware
- Define database schemas, migrations
- Write unit, integration, e2e tests
- Enhance monitoring with Sentry
- Populate email templates, webhooks

## Supabase Schema & RLS Migration Progress (TaskMaster Task 2)

**Last updated:** [AI-assisted, YYYY-MM-DD]

### Overview

This section tracks the implementation and verification of the Supabase database schema, Row Level
Security (RLS) policies, and performance indexes as mapped to TaskMaster task 2 and its subtasks.
All work is aligned with PRD.md (see Section 7.2 Security Requirements and related schema specs).

### Migration Files

- `backend/supabase/migrations/001_core_tables.sql`
- `backend/supabase/migrations/002_logging_tables.sql`
- `backend/supabase/migrations/003_business_tables.sql`
- `backend/supabase/migrations/004_rls_policies.sql`
- `backend/supabase/migrations/010_payment_logs_retention.sql`: Adds a monthly pg_cron job to purge payment_logs older than 24 months (MVP retention policy). See docs/analytics-implementation-log.md for details.

### Core Tables (Subtask 1: **done**)

- **Tables:** `prompt_logs`, `comparisons`, `spark_logs`
- **Features:**
  - Proper data types, constraints, UUID/timestamp defaults
  - Foreign key relationships
  - RLS enabled and user-only access enforced
  - Admin override policies for support
  - Composite indexes on `user_id`, `created_at`
- **Validation:** Schema, RLS, and index checks passed; test data insert/query successful

### Logging Tables (Subtask 2: **pending**)

- **Tables:** `feedback_logs`, `share_logs`, `error_logs`, `session_logs`
- **Features:**
  - Data retention policies (24 months)
  - Partitioning strategy for large tables (optional, planned)
  - RLS for user-specific access
  - Composite indexes for performance
- **Validation:** Migration applied, schema and RLS checks passed

### Business Tables (Subtask 3: **pending**)

- **Tables:** `payment_logs`, `support_requests`, `pricing`
- **Features:**
  - Audit triggers for change tracking
  - Immutable financial records (triggers prevent updates to amount/currency)
  - RLS: user, admin, and support team access as per PRD
  - Public read/admin write for pricing
  - Composite indexes for user_id, created_at, status
- **Validation:** Migration applied, schema and RLS checks passed

### RLS Policies for Core Tables (Subtask 4: **pending**)

- RLS enabled and tested for `prompt_logs`, `comparisons`, `spark_logs`
- Admin override policies in place
- No anonymous/public access (per PRD)

### RLS Policies for Logging & Business Tables (Subtask 5: **pending**)

- RLS enabled for all logging and business tables
- Role-based access for payment_logs, support_requests, pricing

### Composite Indexes (Subtask 6: **pending**)

- Indexes created for all user-specific tables: `(user_id, created_at)`
- Additional indexes: `(user_id, status)` for support_requests, `(error_type, created_at)` for
  error_logs
- Indexes are PRD-compliant and validated for performance

### Test & Validation Summary

- All migrations applied successfully (no errors)
- Schema, RLS, and index existence verified via SQL
- Test data insert/query performed for core and logging tables
- RLS policies tested for user/admin access
- No destructive operations performed on production data

---

**Author:** AI-assisted (Cursor Agent)

## Analytics & Event Tracking Milestones

- **2025-06-25**: All analytics events (backend and frontend) are now automatically enriched with
  `appVersion`, `environment`, and `deploymentId` for every event. This applies to:
  - `backend/services/posthog.js` (Node: uses process.env.npm_package_version, NODE_ENV,
    DEPLOYMENT_ID)
  - `frontend/src/utils/analytics.ts` (Vite: uses import.meta.env['VITE_APP_VERSION'], MODE,
    VITE_DEPLOYMENT_ID)
- This fulfills TaskMaster subtask 3.6 and aligns with PRD analytics enrichment requirements and
  canai-analytics-rules.

## [2024-06-20] PostHog Analytics Integration Updates

- Updated `backend/services/posthog.js` for PRD compliance: connection validation, SIGTERM shutdown,
  improved retry logic, batching config.
- Updated/expanded unit tests in `backend/tests/unit/posthog.test.js`.
- Added `backend/tests/vitest.setup.js` for test environment setup.
- Updated `backend/vitest.config.js` to include setup file.
- Cleaned up `package.json` and `tsconfig.json` duplicates.
- All changes align with TaskMaster Task 3 and PRD analytics requirements.

- See [docs/analytics-implementation-log.md](analytics-implementation-log.md) for analytics
  milestone history and technical audit trail.

## Analytics Implementation (PostHog)

- **Service:** `backend/services/posthog.js` — Handles PostHog client initialization, event
  batching, user/session tracking, event enrichment, and privacy compliance.
- **Unit Tests:** `backend/tests/unit/posthog.test.js` — Covers event validation, PII scrubbing,
  session management, event enrichment, all event tracking functions, and batching logic.
- **Integration Test Skeleton:** `backend/tests/integration/posthog.integration.test.js` —
  Placeholder for dashboard verification logic.
- **Setup:** `backend/tests/vitest.setup.js` — Ensures all analytics-related environment variables
  are set for tests.
- **Config:** `vitest.config.js` — Includes setup file and integration test path.

## Test Coverage

- All analytics logic is unit tested, including error and user action events.
- Batching logic is tested for flushAt compliance.
- Integration test placeholder exists for future dashboard/API verification.

## Next Steps

- Implement integration test logic for dashboard verification.
- Migrate sessionStore to Redis/DB for production scalability.
- Update documentation as analytics evolves.

## Sentry Error Monitoring Setup

### Backend (Node.js)

- Sentry initialized in `backend/api/src/Server.ts` using `@sentry/node` and `@sentry/tracing`.
- DSN and environment set via `SENTRY_DSN` and `SENTRY_ENV` in `backend/api/.env`.
- Profiling and release tagging enabled.
- Test error can be triggered with `SENTRY_TEST_ERROR=true`.

### Frontend (React)

- Sentry initialized in `frontend/src/main.tsx` using `@sentry/react` and `@sentry/tracing`.
- DSN and environment set via `SENTRY_DSN` and `SENTRY_ENV` in `frontend/.env`.
- Release tagging and BrowserTracing enabled.
- Test error can be triggered with `VITE_SENTRY_TEST_ERROR=true`.

## Sentry Frontend Configuration (Task 4)

- **File**: `frontend/src/main.tsx`
- **Purpose**: Initializes Sentry React SDK for error monitoring and release tracking.
- **Environment Variables**:
  - `VITE_SENTRY_DSN` (or `SENTRY_DSN`): Sentry DSN for error reporting, stored in `.env` and CI/CD
    secrets.
  - `VITE_SENTRY_ENV` (or `SENTRY_ENV`): Environment name (development, production).
- **Integration Details**:
  - Uses `@sentry/react` v7+ only (no `@sentry/tracing` or `BrowserTracing`).
  - Sentry is initialized in `main.tsx` before rendering the app.
  - App is wrapped in a custom `ErrorBoundary` for UI error capture.
  - Sentry test error logic and manual trigger button have been removed after verification.
- **Verification**:
  - Sentry test error was triggered and confirmed in the Sentry dashboard.
  - All errors in production will be reported to Sentry.
- **Documentation Updated**: 2025-06-26

## Sentry Error Capture (Task 4.2)

- **Backend**: Configured PII scrubbing, context tags, and error handlers in
  `backend/api/src/instrument.ts` and middleware in `backend/api/src/Shared/Logger.ts`.
- **Frontend**: Added error boundary, context enrichment, and test route in `frontend/src/App.tsx`
  and `frontend/src/components/SentryTest.tsx`.
- **Validation**: Errors captured with tags and breadcrumbs in Sentry dashboard.

- [ ] Backend: Triggered /test-error, confirmed error with tags (user.id, session.id, tenant.id) and
      [REDACTED] PII in Sentry.
- [ ] Frontend: Visited /sentry-test, clicked button, confirmed error with tags and ui.click
      breadcrumb.

### Sentry Performance Monitoring & Release Tracking (Task 4.3)

- **Backend**:
  - Sentry initialized in `backend/api/src/instrument.ts` with `tracesSampleRate`,
    `profilesSampleRate`, and release tagging.
  - API endpoints instrumented with Sentry transactions and spans (see `/test-sentry` in `App.ts`
    for template).
  - Source maps are generated via TypeScript build (`tsc --sourceMap true --outDir dist`) and
    uploaded to Sentry in CI/CD (`.github/workflows/ci.yml`).
  - Release version is set from `process.env.npm_package_version` (injected by CI).
- **Frontend**:
  - Sentry initialized in `frontend/src/main.tsx` with `tracesSampleRate` and release tagging.
  - Vite build outputs source maps to `dist/`, which are uploaded to Sentry in CI/CD.
  - Release version is set from `import.meta.env.VITE_APP_VERSION` (injected by CI).
- **CI/CD**:
  - Both backend and frontend jobs in `.github/workflows/ci.yml` include steps to build with source
    maps and upload them to Sentry using `@sentry/cli`.
  - Sentry release version is set to `${{ github.sha }}` for traceability.
- **Validation**:
  - Test errors and transactions are visible in Sentry dashboard.
  - Source maps resolve stack traces to original TypeScript/React code.
  - Release tracking is visible in Sentry for both backend and frontend.

### Sentry User Identification & Alerting (Task 4.4)

- **Backend**:
  - Sentry context enrichment now uses real user, session, and tenant data from the request object
    (see `setSentryContext` in `instrument.ts`).
  - All Sentry events are tagged with the actual user ID, session ID, and tenant ID when available.
- **Frontend**:
  - Sentry context enrichment is ready to use real user and tenant data from the authentication
    system (see `setSentryContext` in `utils/sentry.ts` and usage in `App.tsx`).
  - Update the call to `setSentryContext` to use real user/session/tenant data as soon as available
    from Memberstack or your auth provider.
- **Alerting**:
  - Both email and Slack alerting are enabled in Sentry for critical errors and performance issues.
  - Alert rules are configured for high error frequency and performance degradation.
  - Notifications are routed to project members via email and to the designated Slack channel.

## Managing Encrypted Secrets (Supabase Vault)

To securely store API keys and other sensitive secrets in Supabase, always use the built-in
`vault.create_secret` SQL function. This ensures proper encryption, UUID generation, and avoids
permission errors.

**How to add a new secret:**

```sql
SELECT vault.create_secret('your_secret_value', 'unique_name', 'description');
```

- `your_secret_value`: The actual secret (e.g., API key)
- `unique_name`: A unique identifier for the secret (e.g., 'openai_api_key')
- `description`: A human-readable description for context

**Example:**

```sql
SELECT vault.create_secret('sk-XXXXXXXXXXXXXXXXXXXXXXXX', 'openai_api_key', 'OpenAI API key for GPT-4o integration');
```

**To verify the secret was added:**

```sql
SELECT name, description FROM vault.secrets WHERE name = 'openai_api_key';
```

**Important:**

- Do NOT use direct `INSERT` statements or the table editor for `vault.secrets`—these will fail due
  to permissions and UUID requirements.
- The `secret` value is encrypted and not visible in query results.

**Reference:** See Supabase Vault documentation: https://supabase.com/docs/guides/database/vault

## [2025-06-19] Prompt Template System Overhaul

- Added modular, PRD-aligned prompt templates for:
  - Business Plans (`backend/prompts/businessPlanTemplate.js`)
  - Social Media & Email Campaigns (`backend/prompts/socialMediaTemplate.js`)
  - Website Audit & Feedback (`backend/prompts/websiteAuditTemplate.js`)
- All templates inherit from `backend/prompts/framework.js` (emotional/cultural context, validation,
  versioning).
- Each template has a dedicated test harness (see `backend/prompts/testGoldStandard.js`,
  `testSocialMediaTemplate.js`, `testWebsiteAuditTemplate.js`).
- Input validation (Joi), gold standard output schemas, and robust validation functions implemented.
- Fully extensible for future prompt types and PRD changes.
- All tests pass with real-world, PRD-aligned data.

## GPT-4o Service Integration (Task 5)

- Status: Complete and production-ready.
- All subtasks (5.1–5.5) are done and tested.
- The only relevant test file for GPT-4o is `backend/tests/gpt4o.test.js`.
- Next: Task 6 (Hume AI Emotional Resonance Service).

### Security & Secret Hygiene Controls

- **Pre-commit secret scanner**: `scripts/check-secrets.sh` blocks commits with likely secrets/API
  keys.
- **CI secret scan**: `.github/workflows/secret-scan.yml` blocks pushes/PRs with likely secrets.
- **Contributor documentation**: See `docs/CONTRIBUTING.md` for secret/API key hygiene rules.

## backend/services/

### stripe.js
- Stripe payment integration service
- Supports STRIPE_SECRET_KEY_TEST and STRIPE_SECRET_KEY_LIVE (with STRIPE_SECRET_KEY fallback)
- Validates key presence and environment
- Exports a singleton Stripe client instance
- Provides testStripeConnection() for health checks
- Fully PRD-aligned (see docs/PRD.md and docs/stripe-payment-strategy.md)
- Ready for integration with payment, refund, and subscription flows

# Payment Log Querying Service and Endpoint (Task 7.6)

## Backend Service
- **File:** `backend/services/paymentLogs.js`
- **Purpose:** Encapsulates all payment log querying logic, supporting filters, pagination, sorting, and RLS enforcement.
- **Key Function:** `queryPaymentLogs(params, jwtToken, isAdmin)`
  - Filters: `user_id`, `event_type`, `status`, `from`, `to`
  - Pagination: `limit`, `offset`
  - Sorting: `sort`
  - RLS: Only allows users to see their own logs unless admin

## API Endpoint
- **Route:** `GET /v1/stripe/payment-logs`
- **Handler Location:** `backend/routes/stripe.js`
- **Query Parameters:**
  - `user_id` (admin only), `event_type`, `status`, `from`, `to`, `limit`, `offset`, `sort`
- **Auth:** JWT required; RLS enforced
- **Response:** `{ data, metadata: { total } }`

## Test Coverage
- **File:** `backend/tests/integration/paymentLogs.api.test.js`
- **Coverage:** Filtering, pagination, sorting, RLS enforcement for user and admin roles

### API Endpoints
- /v1/stripe/payment-logs/analytics (GET): Returns payment analytics (total revenue, refunds, event counts) for the requesting user. MVP scope; admin access to all data pending RLS update. See docs/api/endpoints.md for details.

---
_Last updated: 2025-07-03_


