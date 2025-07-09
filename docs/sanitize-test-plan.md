# Sanitize Test Plan

---

## Purpose

Document the test strategy for the new DOMPurify-based sanitization logic in `sanitize.js` and its
integration with `validation.js`, ensuring robust XSS prevention, schema-driven field-level control,
and full observability/logging as required by project rules and PRD.

---

## Scope

- **Modules:** `backend/middleware/sanitize.js`, `backend/middleware/validation.js`
- **APIs:** All backend endpoints using validation middleware
- **Test Types:** Unit, integration, and e2e (where applicable)
- **Edge Cases:** Unicode, zero-width, malformed HTML, nested objects/arrays
- **Attack Vectors:** XSS (classic, SVG, MathML, JS URLs, polyglot), malformed payloads
- **Observability:** Logging (PostHog/Sentry), error handling, analytics hooks

---

## Test Layers

### 1. Unit Tests

- **sanitize.js**
  - Plain text mode: strips all HTML, preserves safe text
  - Rich text mode: allows minimal safe tags/attributes
  - Recursion: handles nested objects/arrays
  - Edge cases: empty, long, unicode, malformed input
  - Attack vectors: `<script>`, SVG, JS URLs, event handlers, polyglots
  - Logging: logs all sanitization events (success/failure)
- **validation.js**
  - Invokes sanitize utility for all string fields
  - Schema-driven: respects field-level `sanitize` and `mode` flags
  - Error handling: throws/returns ValidationError on failure

### 2. Integration Tests

- **API Endpoints**
  - All endpoints using validation middleware sanitize input as expected
  - Malicious payloads are neutralized and logged
  - Analytics: PostHog/Sentry events are triggered on sanitization
  - Error responses: user-centric, actionable messages

### 3. E2E/Scenario Tests

- **Full request/response cycle**
  - Simulate real-world XSS attempts via API
  - Validate no XSS payloads survive to storage/response
  - Confirm logs/analytics for all events

---

## Edge Cases & Attack Vectors

- Empty strings, null, undefined
- Long input, unicode, zero-width
- `<script>`, `<img onerror>`, SVG, MathML, JS URLs
- Polyglot payloads, malformed HTML
- Nested/array fields

---

## Logging & Analytics

- All sanitization events (success/failure) must be logged to PostHog and Sentry
- No sensitive data in logs
- Error handling must use ValidationError and structured logging

---

## Observability Hooks

- Use backend/Shared/Logger.ts for structured logs
- Analytics via backend/services/posthog.js
- Sentry integration for error events

---

## Test Data & Mocking

- Use scenario-based test data for reproducibility
- Mock analytics/logging services in unit tests
- Isolate test environments, clean up after each run

---

## Success Criteria

- 100% of sanitization logic is covered by explicit, scenario-driven tests
- All attack vectors and edge cases are neutralized and logged
- Analytics and error handling are fully integrated and testable
- Test plan and coverage are reviewed and updated with every logic change

---

## References

- docs/task-9.2-dompurify-integration.md
- docs/test-debugging-best-practices.md
- .cursor/rules/canai-test-plan-skeleton-rule.mdc
- .cursor/rules/canai-test-debugging-best-practices.mdc
- tests/\_example.gold.spec.ts
