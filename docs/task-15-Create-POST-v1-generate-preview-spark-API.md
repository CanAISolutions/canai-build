# Task 15: Create POST /v1/generate-preview-spark API — PRD-Aligned Scope & Implementation Plan

---

## PRD Section Mapping
| Feature                | PRD Section           |
|------------------------|-----------------------|
| Spark Generation       | 6.1 Discovery Hook    |
| Security/Validation    | 7.2 Security          |
| Analytics              | 8.6 Monitoring        |
| Testing                | 13 Testing Strategy   |
| Deployment             | 15 Deployment         |

---

## 1. Purpose & PRD Alignment

This document defines the requirements, architecture, and implementation plan for the **POST /v1/generate-preview-spark** API, synthesizing the CanAI PRD, security, validation, and deployment best practices. It is the single source of truth for this feature’s development, testing, and review.

**PRD References:**
- Section 5: User Journey (F1–F9, esp. F1 Discovery Hook, F3 Spark Layer)
- Section 6.1: Discovery Hook (Preview Spark, sample PDF serving)
- Section 7.2: Security (input validation, XSS prevention)
- Section 8.6: Monitoring/logging (PostHog, Sentry)
- Section 12: Metrics (trust, error rates, preview_viewed)
- Section 13.1: Testing (unit, integration, malicious payloads)
- Section 15: Deployment (Render, health checks)

**Business Value:**
- Enables users to try a free, emotionally resonant Spark (AI-generated preview) before purchase.
- Demonstrates CanAI’s unique value and builds trust via transparent, high-quality outputs.
- Supports analytics, conversion, and product improvement via event logging and metrics.

---

## Success Metrics
- 100% test coverage for all in-scope features
- <1.5s API response time (see PRD 7.1 Performance)
- Verified PostHog events for preview_viewed and errors
- No secrets exposed; all inputs sanitized

---

## 2. Scope & Out of Scope

**In Scope:**
- Express route: `POST /v1/generate-preview-spark` (backend/routes/sparks.js)
- GPT-4o prompt for spark generation (backend/services/gpt4o.js, backend/prompts/preview_spark.js)
- Input validation (Joi schemas, DOMPurify for sanitization)
- Analytics event logging (PostHog: preview_viewed)
- Comprehensive error handling and logging (Sentry, PostHog)
- Rate limiting (express-rate-limit, 100 req/min/IP)
- Unit, integration, and malicious payload tests (Vitest)
- API documentation (OpenAPI spec, usage examples)

**Out of Scope (Explicitly Deferred):**
- Frontend UI (handled in Webflow/React)
- Paid spark generation (handled by /v1/generate-sparks)
- Analytics beyond preview_viewed (handled elsewhere)
- PDF serving (defer to future enhancement)
- Voice mode, multi-spark generation, advanced analytics (log as future issues)

---

## 3. Architecture Overview

- **Route:** `POST /v1/generate-preview-spark` (backend/routes/sparks.js)
- **Service:** Spark generation logic (backend/services/gpt4o.js, backend/prompts/preview_spark.js)
- **Validation:** Joi schemas for `businessType`, `tone`; DOMPurify for all string fields
- **PDF Serving:** (Deferred; see Future Enhancements)
- **Analytics:** PostHog event logging (preview_viewed)
- **Error Handling:** Custom error classes, Sentry integration, user-friendly messages
- **Rate Limiting:** express-rate-limit (100 req/min/IP)
- **Testing:** Vitest (unit, integration, malicious payloads)
- **Docs:** OpenAPI spec, usage examples

---

## 4. Implementation Checklist (Sequential, Time-Estimated)

**Taskmaster Status Updates:**
- [ ] For each subtask, update the corresponding Taskmaster subtask status to 'in progress' when starting and 'done' when completed. This is a required workflow step for traceability and progress tracking.

**Preparation (30-45 min) – Align & Setup**
- [ ] Review dependencies: Ensure middleware/validation.js, services/gpt4o.js, services/supabase.js, and prompts/preview_spark.js exist or stub them.
- [ ] Set up dev environment: npm install (joi, dompurify, express-rate-limit, @sentry/node, posthog-node if missing).
- [ ] Define MVP schema:
  - Request: `{ businessType: string (enum: ['retail','service','tech','creative','other']), tone: string (enum: ['warm','bold','optimistic','professional','playful','inspirational','custom']) }`
  - Response: `{ spark: { title: string, tagline: string }, error: null | string }`
- [ ] Log potential scope risks (e.g., "Defer customTone handling to future task").

**Subtask 1: Core Preview Generation Engine (45-60 min)**
- [ ] In backend/services/gpt4o.js: Add a function `generatePreviewSpark({ businessType, tone })` that calls GPT-4o with prompt from backend/prompts/preview_spark.js.
- [ ] Handle GPT-4o errors: Throw custom errors (e.g., new SparkGenerationError('API failure')).
- [ ] Add basic unit tests (Vitest): Test happy path (valid inputs → valid JSON output), edge cases (empty inputs → error).
- [ ] **Update Taskmaster subtask status to 'in progress' when starting and 'done' when completed.**

**Subtask 2: API Endpoint Structure & Request Handling (45-60 min)**
- [ ] In backend/routes/sparks.js: Add router.post('/v1/generate-preview-spark', middleware/validation.js, async (req, res) => { ... }).
- [ ] Validation: Use Joi schema in middleware (required fields, enums); sanitize strings with DOMPurify.
- [ ] Rate limiting: Apply express-rate-limit middleware (100/min/IP).
- [ ] Call generatePreviewSpark(req.body); Send 200 on success, 400/500 on errors with user-friendly messages.
- [ ] No auth (public endpoint per PRD 6.1).
- [ ] **Update Taskmaster subtask status to 'in progress' when starting and 'done' when completed.**

**Subtask 4: Analytics Event Tracking (30 min)**
- [ ] In the route handler: On success, posthog.capture('preview_viewed', { businessType: req.body.businessType, tone: req.body.tone, success: true }).
- [ ] On error: posthog.capture('preview_error', { errorType: err.name, details: err.message }).
- [ ] Mock PostHog in tests; verify events in integration tests.
- [ ] Add Sentry captureException(err) for all errors.
- [ ] **Update Taskmaster subtask status to 'in progress' when starting and 'done' when completed.**

**Subtask 5: Vitest Skeleton Setup (15-30 min)**
- [ ] Create files: tests/unit/generatePreviewSpark.service.test.js, tests/integration/generatePreviewSpark.api.test.js, tests/security/maliciousPayloads.test.js.
- [ ] Use supertest for API tests; mock GPT-4o/PostHog/Sentry.
- [ ] Skeleton: beforeEach(setup mocks); test('valid input', ...); test('invalid input', ...); test('malicious payload', ...).
- [ ] **Update Taskmaster subtask status to 'in progress' when starting and 'done' when completed.**

**Subtask 3: Comprehensive Testing & Optimization (60-90 min)**
- [ ] Unit: Cover validation (Joi rejects invalid enums), sanitization (DOMPurify strips <script>), generation (mock GPT-4o returns JSON).
- [ ] Integration: supertest.post('/v1/generate-preview-spark').send(validPayload) → 200; invalid → 400; malicious → 400 + logged.
- [ ] Edge/Malicious: Empty fields, oversized payloads, XSS (<script>alert(1)</script>), SQLi (' OR 1=1), rapid requests (rate limit → 429).
- [ ] Performance: Benchmark response time (<1.5s) in tests.
- [ ] Analytics: Verify PostHog/Sentry calls in all paths.
- [ ] Run vitest --coverage; aim for 80%+.
- [ ] **Update Taskmaster subtask status to 'in progress' when starting and 'done' when completed.**

**Final Review & Deployment Prep (30 min)**
- [ ] PR Review: Self-check against PRD (e.g., <1.5s generation).
- [ ] Docs: Update OpenAPI (paths: /v1/generate-preview-spark, examples); add to docs/deploy-backend-to-render.md.
- [ ] Merge & Deploy: Push to Render; monitor logs for errors.
- [ ] Mark Task 15 "complete" in TaskMaster; document proof (screenshots of tests passing, PostHog events).
- [ ] **Ensure all Taskmaster subtask statuses are up to date and marked 'done' as appropriate.**

---

## Dependencies to Install/Verify

> **Note:** Ensure all dependencies are installed and compatible with your project setup. Run `npm ls <package>` and `npm outdated` to check for issues.

- **express-rate-limit** (>=6.7.0 recommended for Express 4/5 compatibility)
- **joi** (>=17.0.0)
- **dompurify** (>=3.0.0)
- **jsdom** (peer dependency for dompurify, >=22.0.0)
- **@sentry/node** (>=7.0.0)
- **posthog-node** (>=3.0.0)
- **supertest** (for integration tests, >=6.0.0)
- **vitest** (for all tests, >=0.34.0)

**Potential Conflicts/Caveats:**
- dompurify requires jsdom for server-side usage; ensure both are installed.
- express-rate-limit v6+ is required for Express 5 compatibility; check your Express version.
- If using TypeScript, install `@types/joi`, `@types/jsdom`, and `@types/supertest` as needed.

---

## 5. Acceptance Criteria

- AC-1: Endpoint returns 200 and valid spark for all valid inputs
- AC-2: Input validation and sanitization block all invalid/malicious payloads
- AC-3: All analytics events (preview_viewed, errors) are logged to PostHog/Sentry
- AC-4: Rate limiting is enforced (100 req/min/IP)
- AC-5: All code is covered by unit/integration tests (Vitest)
- AC-6: API is documented in OpenAPI spec with usage examples
- AC-7: No secrets are logged or exposed in responses
- AC-8: Deployment is monitored and documented in Render logs and deploy-backend-to-render.md

---

## Best Practices
- Evidence-based debugging: Log everything (requestId, endpoint, details) first; iterate on failures.
- Use modular code (separate services for GPT-4o calls, validation, analytics).
- Environment: Ensure .env has OPENAI_API_KEY, POSTHOG_API_KEY, SENTRY_DSN.
- CI/CD: Run tests in GitHub Actions; block merges on failures.
- Documentation: Update OpenAPI spec and docs/api/README.md with examples.

---

## Pitfalls & Quick Fixes
- **Scope Creep:** If tempted to add regeneration, multi-spark, or advanced analytics, log as a future task—do not add to this scope.
- **Stability Issues:** If GPT-4o flakes, add timeout (5s) in services/gpt4o.js.
- **Test Failures:** Use logging-first: Add console.log(requestId) in route; debug iteratively.
- **MVP Blockers:** If analytics or error logging fails, fallback to static error message and log for review.

---

## Future Enhancements (Deferred)
- PDF serving from Supabase (public read access)
- Voice mode
- Multi-spark generation
- Advanced analytics (Trust Score, cultural context, etc.)
- Any new features not explicitly listed in scope

---

## 6. Risks & Mitigations

| Risk                        | Mitigation                                                      |
|-----------------------------|-----------------------------------------------------------------|
| Malicious input/XSS         | Joi + DOMPurify validation, comprehensive tests                  |
| GPT-4o downtime/latency     | Graceful error handling, fallback messaging                      |
| Analytics event loss        | Retry logic, evidence-based logging, Sentry backup               |
| Rate limit bypass/abuse     | express-rate-limit, monitoring, alerting                        |
| Secrets exposure            | Never log secrets, review logs, use env vars                     |
| Documentation drift         | Update this doc, PRD, and deploy-backend-to-render.md after changes |
| Scope creep                 | Strictly enforce scope, log new ideas as future issues           |

---

## 7. References & Inspiration

- PRD.md (Sections 5, 6.1, 7.2, 8.6, 12, 13.1, 15)
- docs/task-9-input-validation-middleware.md (validation, error handling)
- docs/task-98-security-scanning-cicd.md (security, CI/CD, evidence-based logging)
- docs/deploy-backend-to-render.md (deployment, monitoring, environment)
- canai-structure-rules (modular, maintainable code organization)
- backend/routes/sparks.js, backend/services/gpt4o.js, backend/prompts/preview_spark.js
- backend/services/posthog.js, backend/services/instrument.js
- docs/validation-rules.md, docs/api/README.md
- docs/task-15-test-plan.md, docs/task-15-testing-strategy.md, docs/Task15-Advice.md

---

**Last updated:** [auto-fill on edit]

---

## Testing Strategy & Plan (Consolidated)

### Key Examples & Snippets

**Joi Schema Example:**
```javascript
const Joi = require('joi');

const previewSparkSchema = Joi.object({
  businessType: Joi.string().valid('retail', 'service', 'tech', 'creative', 'other').required(),
  tone: Joi.string().valid('warm', 'bold', 'optimistic', 'professional', 'playful', 'inspirational', 'custom').required()
});
```

**Sample Prompt (backend/prompts/preview_spark.js):**
```javascript
// Pseudocode for GPT-4o prompt
module.exports = ({ businessType, tone }) => `
You are an expert business copywriter. Generate a preview Spark for a business of type "${businessType}" with a "${tone}" tone.
Respond with a JSON object: { "title": "...", "tagline": "..." }
`;
```

---

> **Note:** This section consolidates all test planning and strategy for Task 15. The separate docs/task-15-test-plan.md and docs/task-15-testing-strategy.md are now deprecated; all updates should be made here.

### 1. Overview & Scope Control
- **Purpose:** Ensure all testing for Task 15 is tightly aligned with MVP requirements, PRD, and project rules—no scope creep.
- **In Scope:**
  - POST /v1/generate-preview-spark API (backend only)
  - Input validation (Joi), sanitization (DOMPurify)
  - Analytics logging (PostHog), error handling (Sentry)
  - Rate limiting
  - Comprehensive testing: unit, integration, malicious payloads, edge cases
- **Out of Scope:**
  - PDF serving (future)
  - Frontend UI
  - Paid spark generation
- **Defensive Focus:** All tests are designed to maximize pass rates by catching issues early, using mocks, and validating all error and edge cases.

### 2. Test Types & Approach
- **Unit Tests:**
  - Joi schema validation (businessType, tone)
  - DOMPurify sanitization
  - Service logic (spark generation, error handling)
- **Integration Tests:**
  - End-to-end API flow (valid/invalid/malicious payloads)
  - Analytics event delivery (mock PostHog)
  - Error event delivery (mock Sentry)
  - Rate limiting enforcement
- **Malicious Payload Tests:**
  - XSS, SQLi, malformed data, and edge cases
  - Ensure all are blocked, sanitized, and logged
- **Edge Case Tests:**
  - Empty, missing, or malformed fields
  - Unsupported values
  - Oversized payloads
  - Rapid repeated requests
  - Analytics/logging failures

### 3. Enumerated Test Cases
- **Validation:**
  - Accepts valid businessType/tone
  - Rejects invalid/unsupported values
  - Handles missing/empty fields
- **Sanitization:**
  - Strips XSS/script tags
  - Handles malformed HTML
- **Analytics:**
  - Fires preview_viewed event on success
  - Logs errors to PostHog/Sentry on failure
- **Error Handling:**
  - Returns user-friendly error messages
  - Logs all errors with requestId/context
- **Rate Limiting:**
  - Blocks after 100 req/min/IP
- **Malicious Payloads:**
  - Blocks and logs XSS, SQLi, malformed data
- **Edge Cases:**
  - Handles oversized payloads gracefully
  - Handles analytics/logging service failures

### 4. Test Data & Setup
- **Test Data:**
  - Valid/invalid payloads for all fields
  - Malicious payloads (see tests/helpers/maliciousPayloads.ts)
- **Setup:**
  - Use Vitest for all tests
  - Use supertest for integration tests
  - Mock PostHog and Sentry services
  - Set required env vars (OPENAI_API_KEY, POSTHOG_API_KEY, SENTRY_DSN)
  - Use beforeEach/afterEach hooks to reset state/mocks

### 5. Logging & Analytics Validation
- **Evidence-Based:**
  - All failures must be logged with requestId and actionable context
  - Use logging-first, iterative debugging (see docs/test-debugging-best-practices.md)
  - Validate logs in test assertions where possible

### 6. References
- docs/test-advice.md
- docs/test-case-specification.md
- docs/test-debugging-best-practices.md
- .cursor/rules/canai-test-debugging-best-practices.mdc
- .cursor/rules/canai-test-plan-skeleton-rule.mdc
- .cursor/rules/canai-testing-rules.mdc
- Task 15 PRD

### 7. Test File Structure Outline
- tests/integration/generatePreviewSpark.api.test.js/ts
- tests/unit/generatePreviewSpark.service.test.js/ts
- tests/security/maliciousPayloads.test.js/ts
- tests/helpers/maliciousPayloads.ts

### 8. Scope Creep Prevention & MVP Focus
- **No PDF serving, frontend, or paid features included—explicitly out of scope.**
- **All tests and code changes must map to MVP acceptance criteria and PRD.**
- **Any new requirement must be logged as a future issue, not added to this scope.**
- **Test strategy is defensive: maximize pass rates, catch regressions, and ensure robust, evidence-based debugging.**

---

**This strategy ensures Task 15 is delivered on time, on scope, and with high test pass confidence for MVP.**

---

## Environment Variables

| Variable           | Purpose                | Example Value                |
|--------------------|------------------------|------------------------------|
| OPENAI_API_KEY     | GPT-4o API access      | sk-...                       |
| POSTHOG_API_KEY    | Analytics              | phc_...                      |
| SENTRY_DSN         | Error logging          | https://...                  |
| SUPABASE_URL       | (future, for PDFs)     | https://xyz.supabase.co      |

---

## CI/CD Integration

- [ ] Ensure all tests pass in CI before merge (e.g., GitHub Actions, Render deploy hooks)
- [ ] Enforce linting and code formatting in CI
- [ ] Enforce test coverage threshold (e.g., 80%+)
- [ ] Block deploy/merge on test or lint failures

---

## API Usage Example

**Sample Request:**
```bash
curl -X POST https://yourdomain.com/v1/generate-preview-spark \
  -H "Content-Type: application/json" \
  -d '{"businessType":"tech","tone":"optimistic"}'
```

**Sample Response:**
```json
{
  "spark": {
    "title": "Innovate with Confidence",
    "tagline": "Empowering tech businesses to lead the future."
  },
  "error": null
}
```

---

## OpenAPI/Swagger Spec Reference

**Minimal OpenAPI Example:**
```yaml
openapi: 3.0.0
info:
  title: Generate Preview Spark API
  version: 1.0.0
paths:
  /v1/generate-preview-spark:
    post:
      summary: Generate a preview Spark
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                businessType:
                  type: string
                  enum: [retail, service, tech, creative, other]
                tone:
                  type: string
                  enum: [warm, bold, optimistic, professional, playful, inspirational, custom]
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                type: object
                properties:
                  spark:
                    type: object
                    properties:
                      title:
                        type: string
                      tagline:
                        type: string
                  error:
                    type: string
```
> For the full OpenAPI spec, see [docs/api/endpoints.md](api/endpoints.md) or your OpenAPI YAML file.

---

## How to Run Tests

```bash
# Run all tests
npm run test

# Run coverage
npm run test -- --coverage
```

---

## Change Log

| Date       | Change/Update Description                | Author         |
|------------|------------------------------------------|----------------|
| 2024-07-15 | Initial PRD-aligned implementation plan  | (Your Name)    |
| 2024-07-15 | Added consolidated test plan/strategy    | (Your Name)    |
| 2024-07-15 | Added code snippets, dependencies, envs  | (Your Name)    |
| 2024-07-15 | Added usage, OpenAPI, CI/CD, links       | (Your Name)    |

---

## Related Links

- [Taskmaster Task 15](#) (link to your Taskmaster system)
- [PRD.md](PRD.md)
- [docs/api/endpoints.md](api/endpoints.md)
- [docs/test-advice.md](test-advice.md)
- [docs/test-case-specification.md](test-case-specification.md)
- [docs/test-debugging-best-practices.md](test-debugging-best-practices.md)
- [docs/task-15-test-plan.md](task-15-test-plan.md) (deprecated, see main doc)
- [docs/task-15-testing-strategy.md](task-15-testing-strategy.md) (deprecated, see main doc)