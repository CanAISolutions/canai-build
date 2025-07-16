# Task 15 Best Practices Guide: Defensive, Evidence-Based API & Test Development

> **Reference for: Tasks 13, 18, 22, 25, 29, and all future API/test work**

---

## Overview

This guide distills the proven best practices from Task 15 (POST /v1/generate-preview-spark API)
into actionable patterns for API, service, and test development. It is based on real code, tests,
and documentation, and is intended for quick reference and reuse across the codebase.

---

## 1. API Route & Handler Design

- **Schema-Driven Validation:** Use Joi schemas in middleware for all input validation.
- **Defensive Error Handling:**
  - Treat service errors as user input errors (400), unexpected as 500.
  - Always return user-friendly error messages; never leak stack traces.
- **Logging-First Instrumentation:**
  - Log at entry, success, error, and exit (guarded by `NODE_ENV === 'test'`).
- **Analytics Event Tracking:**
  - Fire route-specific analytics events for both success and error paths.

---

## 2. Service Layer Patterns

- **Input Normalization:** Sanitize, trim, and type-check all inputs before validation.
- **Schema Validation:** Validate normalized input with Joi, collecting all errors.
- **Prompt Construction:** Use dedicated prompt templates for LLM calls.
- **Error Handling:** Catch and log all errors, return user-friendly messages.
- **Test-Only Logging:** Add logs for entry, success, and error, guarded by `NODE_ENV`.

---

## 3. Input Schema Design

- **Explicit Field Validation:** Use Joi for types, required/optional, and constraints.
- **Conditional Requirements:** Use `.when()` for fields with conditional logic.
- **Pattern Reuse:** Centralize regex/value patterns in a shared module.

---

## 4. Testing Strategy

- **Mock All Externals:** Use `vi.mock` at the top of test files for all dependencies.
- **State Reset:** Use `beforeEach`/`afterEach` to reset modules and clear mocks.
- **Comprehensive Test Cases:** Cover all valid, minimal, missing, malformed, and edge cases.
- **Analytics & Logging Assertions:** Spy on analytics/loggers; assert correct events and logs.
- **Error Response Assertions:** Assert user-friendly errors and no stack traces.
- **Type Safety:** Use `expectTypeOf` or similar for output structure.
- **No .only/.skip in VCS:** Ensure all tests run in CI.

---

## 5. Prompt Engineering

- **Structured, Minimal Prompts:**
  - Clear, concise instructions for LLMs.
  - Specify output format (e.g., JSON with `title` and `tagline`).
  - Require only the needed fields in output.

---

## 6. Documentation & Test Plan

- **API Contract:** Document endpoint, input/output schema, and error structure.
- **Test Plan Skeleton:** List input permutations, analytics, logging, mocking, edge cases,
  performance, and security.
- **Defensive Implementation Plan:** Stepwise plan for incremental changes, logging, mocking,
  rollback, and verification.
- **Evidence of Success:** Require logs/screenshots, analytics logs, coverage, and confirmation of
  mocks before merge.
- **Lessons Learned:** Document root causes and prevention strategies.

---

## 7. General Defensive Patterns

- **Guard All Logs:** Use `NODE_ENV === 'test'` for all debug/test logs.
- **Analytics Consistency:** Use the same analytics instance in app and tests.
- **Rollback Plan:** Revert, isolate, and reapply changes incrementally after failures.
- **CI/CD Gates:** Enforce ≥80% coverage, analytics event verification, and performance targets.

---

## 8. Reusable Code Snippets

**Mocking Externals in Vitest:**

```js
vi.mock('openai', () => ({
  default: class MockOpenAI {
    /* ... */
  },
}));
vi.mock('../supabase/client.js', () => ({
  default: { rpc: vi.fn(), from: vi.fn() },
}));
```

**Test-Only Logging:**

```js
if (process.env.NODE_ENV === 'test') {
  logger.info('[route] /generate-preview-spark ENTRY', req.body);
}
```

**Analytics Event Assertion:**

```js
expect(analyticsSpy).toHaveBeenCalledWith('preview_viewed', expect.any(Object));
expect(errorAnalyticsSpy).toHaveBeenCalledWith(expect.objectContaining({ event: 'preview_error' }));
```

**User-Friendly Error Assertion:**

```js
expect(response.body.error).toMatch(/user-friendly/i);
expect(response.body.stack).toBeUndefined();
```

---

## 9. File-by-File Best Practices Table

| File/Area                                                   | Best Practice Highlights                                                          |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `routes/generateSparks.js`                                  | Schema-driven validation, logging-first, analytics, defensive error handling      |
| `services/previewGenerator.js`                              | Input normalization, schema validation, orchestrator pattern, test-only logs      |
| `schemas/generatePreviewSpark.js`                           | Explicit Joi validation, custom messages, conditional requirements                |
| `tests/integration/generatePreviewSpark.api.test.js`        | Mock all externals, reset state, analytics/logging assertions, edge case coverage |
| `prompts/preview_spark.js`                                  | Minimal, structured prompt, output format enforcement                             |
| `docs/task-15-Create-POST-v1-generate-preview-spark-API.md` | API contract, error structure, analytics/logging assertion patterns               |
| `docs/generate-preview-spark-test-plan.md`                  | Test plan skeleton, input permutations, analytics/logging, mocking, edge cases    |
| `docs/task-15-defensive-implementation-plan.md`             | Stepwise plan, rollback, evidence requirements, lessons learned                   |

---

## 10. Who Should Use This Guide?

**Directly applicable to:**

- Task 13: GET /v1/messages API
- Task 18: POST /v1/validate-input API
- Task 22: POST /v1/intent-mirror API
- Task 25: POST /v1/spark-split API
- Task 29: POST /v1/feedback API
- **Any new API, service, or test work in this codebase**

**Reference this file in PRs, test plans, and implementation docs for all new backend/API work.**

---

## 11. References

- [Task 15 API Contract](task-15-Create-POST-v1-generate-preview-spark-API.md)
- [Task 15 Test Plan](generate-preview-spark-test-plan.md)
- [Task 15 Defensive Implementation Plan](task-15-defensive-implementation-plan.md)
- [CanAI Structure Rules](../.cursor/rules/canai-structure-rules.mdc)
- [CanAI Testing Rules](../.cursor/rules/canai-testing-rules.mdc)
- [CanAI Test Debugging Best Practices](../.cursor/rules/canai-test-debugging-best-practices.mdc)
