# Task 9.2 Implementation Plan: Integrate DOMPurify for XSS Prevention

---

## Purpose

Establish a robust, reusable DOMPurify-based sanitization layer for all backend API endpoints to
prevent XSS attacks, ensure data integrity, and support platform trust, compliance, and
maintainability goals.

---

## PRD & Task Alignment

- **Parent Task:** Task 9 – Implement Input Validation Middleware
- **PRD References:**
  - Section 5: User Journey (F1–F9)
  - Section 6: Functional Requirements (input validation)
  - Section 7.2: Security (XSS prevention)
  - Section 8.3: Platform compatibility
  - Section 8.6: Monitoring/logging
  - Section 9: User experience (error messaging)
  - Section 12: Metrics (trust, error rates)
  - Section 13.1: Testing
  - Section 14.1: Data retention

---

## Scope

**In Scope:**

- DOMPurify integration for XSS prevention in all backend API endpoints.
- Migration from custom sanitizer in `backend/middleware/validation.js` to a dedicated DOMPurify
  utility.
- Field-specific sanitization rules (plain text, rich text, file metadata).
- Comprehensive test coverage for all sanitization logic.
- Integration with error handling and analytics (PostHog/Sentry).
- Documentation and update process for sanitization rules.

**Out of Scope:**

- Frontend validation (handled separately).
- Analytics beyond sanitization/validation errors.
- Non-API input sources.

---

## Codebase Insights & Integration Points

A comprehensive review of the backend codebase reveals the following actionable insights for
implementing Task 9.2 in a modular, maintainable, and PRD-aligned way:

### 1. Validation Middleware

- **Current:** `backend/middleware/validation.js` uses a custom `sanitizeInput` function
  (regex-based) for all request data.
- **Action:** Replace or extend `sanitizeInput` with a DOMPurify-based utility (e.g.,
  `backend/middleware/sanitize.js`). Ensure all uses of the `validate` middleware leverage the new
  utility.
- **Migration:** Plan for a phased migration—first, implement the new utility and test in isolation,
  then update the middleware to use it, and finally refactor all routes to ensure compliance.

### 2. Error Handling & Logging

- **Current:** Validation errors are handled generically in `validation.js`. Structured error
  handling is available in `backend/errors/ValidationError.ts`. Analytics/logging is handled via
  `backend/services/posthog.js`.
- **Action:** Integrate sanitization errors with the custom `ValidationError` class. Log all
  sanitization failures and suspicious payloads to PostHog and Sentry for monitoring and continuous
  improvement.

### 3. Test Coverage

- **Current:** Tests exist for validation and analytics in `backend/tests/`, but
  sanitization/XSS-specific tests are limited or absent.
- **Action:** Create/expand Vitest test suites to cover:
  - Valid input (should remain unchanged)
  - Malicious input (e.g., `<script>`, event handlers, malformed HTML)
  - Edge cases (empty strings, long input, unicode)
  - Integration with error handling and analytics
- **Files to update/add:** `backend/tests/validation.test.ts`, `backend/tests/integration/*.js`, and
  any new test files for sanitization.

### 4. Analytics & Auditing

- **Current:** PostHog is used for analytics (`backend/services/posthog.js`).
- **Action:** Ensure all sanitization events (success, failure, edge cases) are logged for
  monitoring and improvement. Use environment variables for configuration.

### 5. Documentation & Update Process

- **Current:** Validation rules are documented in `docs/validation-rules.md`.
- **Action:** Document all sanitization logic, field-specific rules, and update process. Require PR
  review for all changes to sanitization logic.

### 6. Environment & Security

- **Current:** Environment variables are used for analytics and error logging.
- **Action:** Ensure all secrets/configuration are managed via environment variables. Never log or
  expose secrets in application logs.

---

## Implementation Phases & Phase Gates

### Phase 1: Planning & Utility Creation

- Confirm `dompurify` and `jsdom` are installed (`npm install dompurify jsdom`).
- Implement a dedicated sanitization utility (e.g., `backend/middleware/sanitize.js`) that wraps
  DOMPurify with jsdom for server-side use.
- Configure allowed HTML tags/attributes (default: strip all for plain text; allow minimal safe tags
  for rich text).
- **Phase Gate:** Utility passes unit tests for all major input types.

### Phase 2: Middleware Integration

- Update `backend/middleware/validation.js` to use the new DOMPurify utility for all string fields.
- Add a `sanitize` flag to schemas or middleware options for field-level control.
- **Phase Gate:** All endpoints using the middleware are covered by tests and pass with the new
  utility.

### Phase 3: Error Handling & Analytics

- Integrate sanitization errors with `ValidationError` and ensure all events are logged to
  PostHog/Sentry.
- **Phase Gate:** All error and analytics events are captured and validated in test/staging.

### Phase 4: Test Coverage & Validation

- Create/expand Vitest tests for all valid, invalid, and malicious payloads.
- Ensure 100% test pass rate, including edge cases and XSS vectors.
- **Phase Gate:** All tests pass and coverage is documented.

### Phase 5: Documentation & Maintenance

- Update `docs/validation-rules.md` and this file with all logic, rules, and update process.
- Require PR review for all changes to sanitization logic.
- **Phase Gate:** Documentation is current and reviewed.

---

## Success Criteria

- All user input is sanitized before processing/storage.
- No XSS payloads survive sanitization in any tested field.
- All endpoints use the new DOMPurify utility via middleware.
- All sanitization logic is reusable, documented, and covered by tests.
- Logging and error handling are robust and user-centric.
- Documentation and update process are clear and enforced.

---

## Best Practices / Nuggets of Gold

- **Centralize Sanitization:** Use a single utility for all sanitization logic.
- **User-Centric Errors:** Provide actionable, empathetic error messages for sanitized input.
- **Comprehensive Logging:** Log all sanitization events for monitoring and improvement.
- **Test Coverage:** Ensure all edge cases and attack vectors are tested.
- **Security Audits:** Regularly review sanitization logic for new threats.
- **Environment Management:** Use environment variables for all secrets/configuration.
- **Documentation:** Keep all rules and update processes well-documented and reviewed.

---

## Known Pitfalls & Gotchas

- **Partial Migration:** Leaving some endpoints on the old sanitizer can create security gaps.
- **Missing Sanitization:** Failing to sanitize all string fields leaves XSS/injection vectors open.
- **Inconsistent Error Formats:** Makes debugging and support harder.
- **Unlogged Failures:** Hinders monitoring and improvement.
- **No Test Coverage:** Increases risk of regressions and missed vulnerabilities.
- **Scope Creep:** Stick to API validation—avoid frontend or analytics scope.

---

## Environment Variables: Validation & Security

| Variable Name                | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `POSTHOG_API_KEY`            | PostHog API key for event logging           |
| `SENTRY_DSN`                 | Sentry DSN for error logging                |
| `GDPR_DATA_RETENTION_MONTHS` | Allowed data retention periods (comma list) |

**Best Practices:**

- Use environment variables for all secrets/configuration.
- Document variable locations and update processes.
- Never log or expose secrets in application logs.

---

## Documentation & Update Process

- Document all sanitization logic and field-specific rules in `docs/validation-rules.md`.
- Require PR review for all changes to sanitization logic.
- Update documentation whenever logic or rules change.

---

## Deliverables & Checklist

- [x] Dedicated DOMPurify utility module implemented and tested.
- [ ] Validation middleware updated to use new utility.
- [ ] All endpoints migrated to new sanitization logic.
- [ ] Comprehensive Vitest test coverage for all input types and XSS vectors.
- [ ] All sanitization events logged to PostHog/Sentry.
- [ ] Documentation updated and reviewed.
- [ ] All environment variables set and documented.
- [x] **Test plan documented in [sanitize-test-plan.md](./sanitize-test-plan.md).**
- [x] **Vitest skeletons scaffolded: [sanitize.test.ts](../backend/middleware/sanitize.test.ts),
      [validation.test.ts](../backend/middleware/validation.test.ts).**

---

## Test Plan & Skeletons Tracking

To ensure full traceability and auditability, the following artifacts are part of Task 9.2's
deliverables:

- **Test Plan:** See [docs/sanitize-test-plan.md](./sanitize-test-plan.md) for the comprehensive
  test strategy, scope, edge cases, attack vectors, logging, and analytics requirements for all
  sanitization logic.
- **Vitest Skeletons:** Initial test scaffolds for the new sanitization logic are located at:
  - [backend/middleware/sanitize.test.ts](../backend/middleware/sanitize.test.ts)
  - [backend/middleware/validation.test.ts](../backend/middleware/validation.test.ts)

These artifacts are required by project rules and must be kept in sync with all code and
documentation changes for Task 9.2. Reviewers and auditors should reference these files to verify
test-driven development and compliance with the PRD.

---

## Research Insights (2025-07-09)

**The following best practices and guidelines are now part of Task 9.2's completion criteria and
must be met for successful delivery:**

- **Schema-Driven, Field-Level Sanitization:**
  - All input sanitization must be controlled by a schema or flag per field (e.g.,
    `{ name: { sanitize: true, mode: 'plain' }, bio: { sanitize: true, mode: 'rich' } }`).
  - This ensures maintainability, testability, and clarity for all backend API endpoints.

- **Edge Case Handling:**
  - The sanitization utility must robustly handle Unicode, zero-width characters, malformed HTML,
    and recursively sanitize nested objects/arrays.
  - Use DOMPurify options like `FORCE_BODY` and `WHOLE_DOCUMENT` as needed for malformed input.

- **Modern XSS Vector Protection:**
  - The utility and tests must cover up-to-date XSS payloads, including SVG, MathML, JavaScript
    URLs, and polyglot attacks.
  - Use `ALLOWED_URI_REGEXP` and strict tag/attribute whitelists to block dangerous content.

- **Analytics & Error Logging:**
  - All sanitization events (success/failure) must be logged to PostHog and Sentry, with no
    sensitive data exposure.
  - Integrate with the custom `ValidationError` class for structured error handling.

- **Documentation:**
  - All logic, field-specific rules, and update processes must be clearly documented in this file
    and in `docs/validation-rules.md`.
  - Documentation must be kept in sync with code and tests for all changes in Task 9.2.

**These requirements are strictly within the scope of Task 9.2 and the PRD. No features or practices
outside this scope are to be implemented at this stage.**

---

## References

- [Task 9 Implementation Plan: Input Validation Middleware](./task-9-input-validation-middleware.md)
- [Task 9.1: Joi Validation Schemas](./task-9.1-joi-validation-schemas.md)
- [Validation Rules](./validation-rules.md)
- PRD.md (Sections 5, 6, 7.2, 8.3, 8.6, 9, 12, 13.1, 14.1)
- DOMPurify and jsdom documentation
- backend/middleware/validation.js
- backend/middleware/sanitize.js (to be created)
- backend/errors/ValidationError.ts
- backend/services/posthog.js
- backend/tests/

---

**Last updated:** 2025-07-09
