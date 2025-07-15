# Task 15 Testing Strategy: POST /v1/generate-preview-spark API

---

## 1. Overview & Scope Control
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

## 2. Test Types & Approach
- **Unit Tests:**
  - Validate Joi schemas for businessType/tone
  - Test DOMPurify sanitization logic
  - Service logic for spark generation and error handling
- **Integration Tests:**
  - End-to-end POST /v1/generate-preview-spark (valid, invalid, malicious payloads)
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

## 3. Enumerated Test Cases
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

## 4. Test Data & Setup
- **Test Data:**
  - Valid/invalid payloads for all fields
  - Malicious payloads (see tests/helpers/maliciousPayloads.ts)
- **Setup:**
  - Use Vitest for all tests
  - Use supertest for integration tests
  - Mock PostHog and Sentry services
  - Set required env vars (OPENAI_API_KEY, POSTHOG_API_KEY, SENTRY_DSN)
  - Use beforeEach/afterEach hooks to reset state/mocks

## 5. Logging & Debugging Validation
- **Evidence-Based:**
  - All failures must be logged with requestId and actionable context
  - Use logging-first, iterative debugging (see docs/test-debugging-best-practices.md)
  - Validate logs in test assertions where possible

## 6. References
- docs/task-15-test-plan.md
- docs/test-advice.md
- docs/test-case-specification.md
- docs/test-debugging-best-practices.md
- .cursor/rules/canai-test-debugging-best-practices.mdc
- .cursor/rules/canai-test-plan-skeleton-rule.mdc
- .cursor/rules/canai-testing-rules.mdc
- Task 15 PRD

## 7. Test File Structure Outline
- tests/integration/generatePreviewSpark.api.test.js/ts
- tests/unit/generatePreviewSpark.service.test.js/ts
- tests/security/maliciousPayloads.test.js/ts
- tests/helpers/maliciousPayloads.ts

## 8. Scope Creep Prevention & MVP Focus
- **No PDF serving, frontend, or paid features included—explicitly out of scope.**
- **All tests and code changes must map to MVP acceptance criteria and PRD.**
- **Any new requirement must be logged as a future issue, not added to this scope.**
- **Test strategy is defensive: maximize pass rates, catch regressions, and ensure robust, evidence-based debugging.**

---

**This strategy ensures Task 15 is delivered on time, on scope, and with high test pass confidence for MVP.**