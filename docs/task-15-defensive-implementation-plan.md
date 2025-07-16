# Task 15: Defensive Implementation Plan for Analytics & Test Fixes

<!--
Related Documentation:
- Test Plan: docs/generate-preview-spark-test-plan.md
- API Contract: docs/task-15-Create-POST-v1-generate-preview-spark-API.md
-->

---

## Quick Reference: Common Pitfalls & Solutions

- **Analytics Spy Not Triggered:**
  - Ensure the test and app share the same analytics instance.
  - Use `vi.mock` or `jest.mock` at the top level.
  - Use dependency injection if possible.
  - Add temporary logs to confirm which instance is being used.
- **Module Scoping Issues:**
  - Avoid importing analytics/logging modules in multiple places.
  - Centralize analytics instance and inject as needed.
- **Test State Leakage:**
  - Reset mocks and app state in `beforeEach`/`afterEach`.
- **Unmocked Externals:**
  - Mock all external dependencies at the top of every test file.
- **Temporary Logs:**
  - Guard with `process.env.NODE_ENV === 'test'` and remove before merge.

---

## Required Evidence Before Merge

- [x] Logs or screenshots of passing tests (success and error paths)
- [x] Analytics event logs/spies showing correct event names and payloads
- [x] Coverage report meeting threshold
- [x] Confirmation that all external dependencies are mocked (show code snippets)
- [x] TaskMaster status updated for the current subtask
- [x] Documentation updated (test plan, API doc, defensive plan, lessons learned)
- [x] Minimal valid input scenario implemented and passing (July 2024). Test asserts on response
      structure, analytics, and logging. All tests pass as of this step.
- [x] Missing optional fields scenario implemented and passing (July 2024). Test asserts on response
      structure, analytics, and logging. All tests pass as of this step.

---

## Completion Summary (July 2024)

- All steps for Task 15 completed successfully.
- /v1/generate-preview-spark endpoint is implemented, tested, and passing all integration tests.
- Logging and analytics assertions are satisfied using Sentry logger and proper mocking.
- No regressions or cascading failures observed after incremental and full suite runs.
- TaskMaster and documentation updated after each step.
- See TaskMaster for status and lessons learned.

---

## Purpose & Context

This document provides a **step-by-step, risk-minimizing approach** for implementing, verifying, and
rolling back analytics and test fixes for Task 15 (Preview Spark API). It is designed to maximize
issue prevention, traceability, and learning from past rollbacks and debugging sessions.

---

## 1. Preparation & Backup

- [ ] Review all affected files: tests, middleware, service, analytics modules.
- [ ] Ensure all current tests pass (`npm run test -- --coverage`).
- [ ] Back up the current state (commit or branch).
- [ ] Document current test coverage and any known flaky tests.
- [ ] **Update TaskMaster status and documentation after each step.**

---

## 2. Incremental Implementation Steps

- [ ] **Mock OpenAI and Supabase** at the top of the integration test file only:
  ```js
  vi.mock('openai', ...);
  vi.mock('../supabase/client.js', ...);
  ```
- [ ] **Update validation middleware** to log `preview_error` for `/v1/generate-preview-spark`:
  ```js
  const eventName = req.path === '/v1/generate-preview-spark' ? 'preview_error' : 'error_occurred';
  ```
- [ ] **Add temporary logging** (guarded by `process.env.NODE_ENV === 'test'`) in analytics,
      middleware, and service layers to confirm event firing and code paths:
  ```js
  if (process.env.NODE_ENV === 'test') console.log('Analytics event:', eventName, context);
  ```
- [ ] **Spy on the exact analytics instance** used in the app to avoid module scoping issues.
- [ ] **Update assertion logic** in malicious payloads test to check for user-friendly error
      messages and absence of stack traces.
- [ ] **Run only the affected integration test** (`generatePreviewSpark.api.test.js`) after each
      change.
- [ ] **Log all findings and test outputs** after each step.
- [ ] **Update TaskMaster status and documentation after each step.**

---

## 3. Verification & Regression Testing

- [ ] Confirm the integration test now passes (both success and error event tracking).
- [ ] Re-run the **entire test suite** (`npm run test -- --coverage`).
- [ ] Check for any new failures or regressions in unrelated tests (unit, integration, malicious
      payloads, etc.).
- [ ] Review code coverage to ensure no decrease in critical areas.
- [ ] Remove any temporary logging/debug code before merging.
- [ ] **Update TaskMaster status and documentation after each step.**

---

## 4. Rollback & Mitigation Procedures

- [ ] If new failures are introduced:
  - Revert the last change (use git or manual undo).
  - Isolate the failing test and analyze logs/output.
  - Re-apply changes one at a time, running tests after each.
  - If a fix cannot be made without regressions, restore from backup/branch and escalate for review.
- [ ] Document all findings and lessons learned during the process.
- [ ] **Update TaskMaster status and documentation after each step.**

---

## 5. Regression Verification

- [ ] Confirm that endpoints unrelated to `/v1/generate-preview-spark` are unaffected (run their
      tests, check logs).
- [ ] Manually test any critical flows if automated coverage is incomplete.
- [ ] Document any edge cases or unexpected behaviors found during testing.
- [ ] **Update TaskMaster status and documentation after each step.**

---

## 6. Logging-First Debugging Patterns

- Add temporary logs in all new/changed code paths during test development.
- Use environment guards to ensure logs do not leak to production:
  ```js
  if (process.env.NODE_ENV === 'test') console.log('Debug:', ...);
  ```
- Remove all logs before merging.

---

## 7. Mocking & Analytics Spy Troubleshooting

- Ensure the test and app share the same analytics instance for effective spying.
- If the spy is not called, check for module scoping issues:
  - Use `vi.mock` at the top level.
  - Use dependency injection if possible.
  - Add logs to confirm which instance is being used.

---

## 8. Lessons Learned & Documentation Update

- After implementation, update `test-advice.md` and other internal docs with new patterns for
  mocking, analytics verification, and error handling.
- Share findings with the team to prevent similar issues in the future.
- [ ] **Update TaskMaster status and documentation after each step.**

---

## 9. Minimal Repro/Support Request Template

- Prepare a minimal repro (branch or gist) with only the relevant files and failing test.
- Include a README with:
  - Reproduction steps
  - Test output
  - Summary of what you’ve tried
  - Any logs or screenshots
- Use this package for outside support or future debugging.

---

## 10. Additional Hindsight & Best Practices

- Always run the full test suite after any change, not just the affected test.
- Require evidence (logs, screenshots) of passing tests and correct event logging before merging.
- Document all failures and root causes before proceeding.
- If a fix cannot be made without regressions, escalate for review and restore from backup.

---

**This plan is designed to ensure Task 15’s fixes are delivered safely, with full traceability,
maximum hindsight, and minimal risk to the rest of the codebase.**

---

## Related Documentation

- [Test Plan](generate-preview-spark-test-plan.md)
- [API Contract](task-15-Create-POST-v1-generate-preview-spark-API.md)
