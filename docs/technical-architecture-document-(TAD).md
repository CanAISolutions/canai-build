# Technical Architecture Document (TAD) - CanAI Emotional Sovereignty Platform

## Purpose

Defines the CanAI platform's architecture, components, and integration flows to guide Cursor AI in
building a cohesive, scalable system. Prevents misaligned implementations by providing a
comprehensive blueprint aligned with PRD Section 8 Architecture requirements.

## Structure

- **System Overview**: Architecture diagram mapping frontend, backend, and integrations.
- **Tech Stack**: Detailed versions and costs of tools/services aligned with PRD specifications.
- **Component Interactions**: API, webhook, and data flows for all 9 user journey stages.
- **Deployment**: Render, Heroku fallback, CI/CD, and monitoring specifics per PRD Section 15.
- **Performance and Security**: PRD-aligned targets and measures from Sections 7.1-7.2.

## System Overview

The CanAI Emotional Sovereignty Platform is a SaaS solution delivering AI-driven, emotionally
intelligent outputs (e.g., business plans, social media strategies, website audits) via a 9-stage
user journey. Hosted on Webflow (frontend) and Render (backend at
`https://canai-router.onrender.com`, internal: `canai-router:10000`, IPs: 52.41.36.82,
54.191.253.12, 44.226.122.3), it integrates Memberstack, Supabase, Make.com, Stripe, GPT-4o, and
Hume AI to ensure scalability, security, and emotional resonance achieving TrustDelta ≥4.2 and
emotional resonance >0.7.

```mermaid
graph LR
    WebClient[Webflow Frontend] -->|API calls| Backend((Node/Express API<br/>canai-router:10000))
    Backend -->|Query| Supabase[(Database<br/>RLS Policies)]
    Backend -->|AI| GPT4o((GPT-4o AI Service<br/>128K tokens, $5/1M))
    Backend -->|Emotion| HumeAI((Hume AI Service<br/>$0.01/req, 1000/day))
    Backend -->|Auth| Memberstack((Memberstack 2.0<br/>JWT Auth))
    Backend -->|Payment| Stripe((Stripe v1<br/>Payment Processing))
    Backend -->|Cache| Cache[(Node-cache<br/>TTL: 5min)]
    Backend -->|Webhooks| MakeCom((Make.com v3<br/>Automation))
    subgraph Monitoring
      Backend -.-> Sentry((Sentry v10<br/>Error Tracking))
      Backend -.-> PostHog((PostHog v2<br/>Analytics))
    end
    subgraph TaskMaster
      Backend -.-> TaskMaster((TaskMaster<br/>Task Management))
    end
```

- **Frontend**: Webflow-based UI (`frontend/public/`), WCAG 2.2 AA compliant with ≥48px tap targets,
  serves dynamic content via CMS (`frontend/src/cms/`).
- **Backend**: Node.js 18.0/Express 4.18 server (`backend/server.js`) orchestrates APIs
  (`backend/routes/`), webhooks (`backend/webhooks/make_scenarios/`), AI prompts
  (`backend/prompts/`), and middleware (`backend/middleware/`).
- **Supabase**: PostgreSQL 14 stores data with Row-Level Security (RLS) (`databases/migrations/`),
  ensuring user ownership and GDPR/CCPA compliance via 24-month data purging
  (`databases/cron/purge.sql`).
- **Integrations**: Stripe for payments, GPT-4o for content generation (MapReduce for >128K tokens),
  Hume AI for emotional resonance with circuit breaker at >900 req/day, Make.com for automation with
  existing scenarios, PostHog/Sentry for analytics/monitoring.

## Tech Stack

### Frontend

- **Webflow 2025**: UI hosting at canai-frontend.onrender.com, CMS for pricing/samples with cache
  fallback.
- **Vite 5.0**: Build tool for responsive design with TypeScript 4.9 support.
- **React 18.0**: Component library with shadcn/ui integration.
- **TypeScript 4.9**: Frontend logic (`frontend/src/`) with strict mode enabled.
- **Memberstack 2.0**: Authentication (`backend/services/memberstack.js`) with JWT validation.
- **Supabase Integration**: React/Vite client integration following
  `docs/supabase-frontend-integration.md`.

### Backend

- **Node.js 18.0, Express 4.18**: API server (`backend/server.js`) with TypeScript 4.9.
- **Docker 24.0**: Containerization (`docker-compose.yml`) for development and deployment.
- **Performance Targets**: <200ms API responses, <1.5s spark generation, <2s deliverable generation.

### Database

- **Supabase v2, PostgreSQL 14**: Data storage (`databases/migrations/`) with RLS policies.
- **pg_cron**: Data purging after 24 months (`databases/cron/purge.sql`) for GDPR/CCPA compliance.
- **Indexes**: Optimized for <50ms queries (`idx_prompt_logs_user_id`,
  `idx_comparisons_trust_delta`).
- **Direct SQL Access**: For migrations or admin scripts, use `backend/db.js` (Node.js only, never
  in frontend). This utility uses the `postgres` library and the `DATABASE_URL` environment variable
  for secure, direct Postgres access.

### Integrations

- **GPT-4o (OpenAI API v1)**: Content generation, $5/1M tokens, 128K tokens/req with MapReduce
  chunking.
- **Hume AI v1**: Emotional resonance validation, $0.01/req, <500ms latency, 1000 req/day with
  circuit breaker.
- **Stripe API v1**: Payment processing (`backend/services/stripe.js`) with exponential backoff
  retry.
- **Make.com v3**: Automation with scenarios (`add_project.json`, `admin_add_project.json`,
  `SAAP Update Project Blueprint.json`, `add_client.json`).
- **PostHog v2**: Analytics (`backend/services/posthog.js`) tracking funnel completion and
  TrustDelta.
- **Sentry v10**: Error tracking (`backend/services/sentry.js`) with <100ms error responses.

### CI/CD

- **GitHub Actions**: Build/test/deploy pipelines (`.github/workflows/`) with TaskMaster validation.
- **OWASP ZAP, Semgrep**: Security scans in `.github/workflows/security.yml`.
- **Coverage Requirements**: >80% Jest test coverage with Supatest integration testing.

## Component Interactions

The platform supports a 9-stage user journey per PRD Section 5, with each stage driven by specific
APIs, services, and data flows achieving >90% completion rate for F1-F2 and >65% CanAI preference in
SparkSplit:

### F1 (Discovery Hook)

- **APIs**: `GET /v1/messages`, `POST /v1/log-interaction`, `POST /v1/generate-preview-spark`
- **Data Flow**: Fetches trust indicators from `trust_indicators` table, logs interactions to
  `session_logs` via Make.com
- **Caching**: 5min TTL for trust indicators, localStorage fallback for offline access
- **Performance**: <200ms response times with Supabase index optimization

### F2 (2-Step Discovery Funnel)

- **APIs**: `POST /v1/validate-input`, `POST /v1/generate-tooltip`, `POST /v1/detect-contradiction`
- **Data Flow**: Validates inputs with GPT-4o trust scoring, stores in `initial_prompt_logs`, Hume
  AI emotional validation
- **AI Integration**: GPT-4o for validation, Hume AI for resonance (arousal >0.5, valence >0.6)
- **Performance**: <500ms validation response with circuit breaker fallback

### F3 (Spark Layer)

- **APIs**: `POST /v1/generate-sparks`, `POST /v1/regenerate-sparks`
- **Data Flow**: Creates three sparks with GPT-4o, logs to `spark_logs`, tracks selection rates >80%
- **AI Integration**: GPT-4o with emotional driver prompts (`backend/prompts/sparks.js`)
- **Performance**: <1.5s generation time with emotional resonance validation

### F4 (Purchase Flow)

- **APIs**: `POST /v1/stripe-session`, `POST /v1/refund`, `POST /v1/switch-product`
- **Data Flow**: Stripe checkout initiation, triggers `add_project.json` webhook, logs to
  `payment_logs`
- **Integration**: Make.com webhook processing with dead-letter queue for failures
- **Performance**: <1s payment session creation with retry logic

### F5 (Detailed Input Collection)

- **APIs**: `POST /v1/save-progress`, `POST /v1/resume`, `POST /v1/generate-tooltip`
- **Data Flow**: Auto-saves 12-field inputs to `prompt_logs` with <200ms response
- **Features**: localStorage backup, 100ms debouncing, contextual tooltips
- **Validation**: Joi schemas with DOMPurify sanitization

### F6 (Intent Mirror)

- **APIs**: `POST /v1/intent-mirror`
- **Data Flow**: GPT-4o generates summary with confidence score, stored in `prompt_logs`
- **Target**: >85% user confirmation rate with emotional tone preservation
- **Performance**: <400ms summary generation

### F7 (Deliverable Generation)

- **APIs**: `POST /v1/deliverable`, `POST /v1/request-revision`, `POST /v1/regenerate-deliverable`,
  `GET /v1/generation-status`
- **Data Flow**: GPT-4o generates outputs (700-800 words for business plans), Hume AI validation
- **Quality Metrics**: TrustDelta ≥4.2, emotional resonance >0.7
- **Performance**: <2s generation with progress tracking

### F8 (SparkSplit)

- **APIs**: `POST /v1/spark-split`
- **Data Flow**: Compares CanAI vs. generic outputs, computes TrustDelta, logs to `comparisons`
- **Target**: >65% CanAI preference with emotional resonance differential
- **Performance**: <1s comparison generation

### F9 (Feedback Capture)

- **APIs**: `POST /v1/feedback`, `POST /v1/refer`
- **Data Flow**: Captures ratings in `feedback_logs`, generates referral links for >25% social
  shares
- **Integration**: Social sharing APIs with analytics tracking
- **Performance**: <100ms feedback submission

### Security & Admin

- **APIs**: `POST /v1/consent`, `POST /v1/purge-data`, `GET /v1/admin-metrics`
- **Data Flow**: GDPR/CCPA consent logging, data purging, admin analytics from aggregated logs
- **Security**: Admin JWT validation, RLS policy enforcement
- **Compliance**: 24-month data retention with automated purging

### Middleware Layer

- **Rate Limiting**: 100 req/min/IP (`middleware/rateLimit.js`) with exponential backoff
- **Retries**: 3 attempts with 500ms delays (`middleware/retry.js`) for external services
- **Validation**: DOMPurify input sanitization (`middleware/validation.js`) with Joi schemas
- **Error Handling**: <100ms empathetic responses (`middleware/error.js`) with PostHog logging

## Deployment

### Render Configuration

- **Backend**: `canai-router.onrender.com` (internal: `canai-router:10000`)
- **IPs**: 52.41.36.82, 54.191.253.12, 44.226.122.3
- **Frontend**: `canai-frontend.onrender.com` integrated with Webflow CMS
- **Admin Dashboard**: `canai-admin.onrender.com` secured with Memberstack Admin JWT
- **Auto-scaling**: Configured for 10,000 concurrent users per PRD Section 7.4

### Heroku Fallback

- **Configuration**: Fallback deployment configured in `package.json` for backend resilience
- **Triggers**: Automatic failover on Render health check failures

### Health Checks

- **Endpoint**: `GET /health` (`backend/health.js`) with Supabase connectivity validation
- **Monitoring**: 99.9% uptime target validated by Sentry with 5min check intervals
- **Alerts**: PostHog event logging for health check failures

### CI/CD Pipeline

- **GitHub Actions**:
  - `.github/workflows/build.yml` - Build and test validation
  - `.github/workflows/deploy.yml` - Deployment automation
  - `.github/workflows/taskmaster.yml` - TaskMaster task validation
  - `.github/workflows/security.yml` - Security scanning
- **Rollback**: Tagged releases (e.g., `v1.0.0`) with <5min rollback capability
- **Quality Gates**: >80% test coverage, 0 critical security issues, TaskMaster validation

### Data Lifecycle

- **Retention**: 24-month data retention via Supabase `pg_cron` (`databases/cron/purge.sql`)
- **Anonymization**: Monthly anonymization jobs for compliance (`databases/cron/anonymize.sql`)
- **Backup**: Daily automated backups with 30-day retention and cross-region replication

### Monitoring Stack

- **Sentry**: Error tracking for API timeouts, Stripe failures, AI service issues
- **PostHog**: Analytics capturing funnel completion, TrustDelta trends, emotional resonance metrics
- **Logs**: Centralized logging in `databases/error_logs` and `databases/session_logs` with RLS
  policies
- **Performance**: API response time monitoring with alerts for >200ms baseline

## Performance Targets (PRD Section 7.1)

- **Page Load**: <1.5s (Webflow frontend optimization with CDN)
- **API Response**: <200ms standard, optimized with Supabase indexes and caching
- **Spark Generation**: <1.5s (`POST /v1/generate-sparks`) with GPT-4o integration
- **Deliverable Generation**: <2s (`POST /v1/deliverable`) with progress tracking
- **Error Handling**: <100ms empathetic error responses (`middleware/error.js`)
- **Uptime**: 99.9% with health monitoring and automated failover
- **Scalability**: 10,000 concurrent users with auto-scaling configuration

## Security Measures (PRD Section 7.2)

- **Supabase RLS**: Row-Level Security restricts data access to `auth.uid() = user_id`
  (`databases/migrations/*_rls.sql`)
- **Encryption**: API keys stored in `supabase/vault` with automated rotation in `.env`
- **Rate Limiting**: 100 req/min/IP (`middleware/rateLimit.js`) with progressive penalties
- **Input Sanitization**: DOMPurify (`middleware/validation.js`) prevents XSS/injection attacks
- **CSP Headers**: `default-src 'self'` configured in `backend/server.js` for XSS prevention
- **Security Scanning**: OWASP ZAP and Semgrep in CI/CD pipeline (`.github/workflows/security.yml`)
- **Authentication**: Memberstack JWT validation with session management
- **GDPR/CCPA**: Consent management (`POST /v1/consent`) and data purging (`POST /v1/purge-data`)

## TaskMaster Integration

### Task Validation

- **CI/CD Integration**: TaskMaster tasks validated in `.github/workflows/taskmaster.yml`
- **Dependency Management**: Comprehensive dependency graphs prevent circular dependencies
- **Quality Assurance**: Automated validation of task completion and output quality

### Architecture Alignment

- **Component Mapping**: All architectural components map to specific TaskMaster task IDs
- **Implementation Tracking**: Progress tracking through TaskMaster dashboard integration
- **Documentation Sync**: Automated documentation updates when architecture evolves
