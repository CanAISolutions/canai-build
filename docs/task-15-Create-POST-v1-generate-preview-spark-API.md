# Task 15: Create POST /v1/generate-preview-spark API — **Defensive, Evidence-Based Implementation Plan**

---

## ⚠️ Current Status & Gaps (as of July 2024)

- The `/v1/generate-preview-spark` endpoint is **not yet implemented**.
- No `generatePreviewSpark` service function exists.
- No unit or integration tests for preview spark exist.
- Only the Joi schema (`backend/schemas/generatePreviewSpark.js`) and the prompt template
  (`backend/prompts/preview_spark.js`) exist.
- Rate limiting uses `rate-limiter-flexible`, not `express-rate-limit`.
- Sanitization is performed by a custom function, not DOMPurify.
- **All implementation and test plan items for this feature are deferred/future work.**
- This document is a **PRD-aligned, evidence-based plan** and requirements reference. All
  implementation details below are **deferred** and do not reflect the current code. See the summary
  above for the actual state.

---

## Hindsight Analysis & Defensive Playbook

### What Went Wrong Last Time (Root Causes)

- **Unmocked External Dependencies:** Real API calls to OpenAI, Supabase, PostHog, and Sentry in
  tests led to flakiness, 500 errors, and unpredictable failures.
- **Analytics Event Mismatch:** Validation middleware logged generic events (e.g., 'error_occurred')
  instead of route-specific ones (e.g., 'preview_error'), causing analytics assertion failures and
  masking real issues.
- **Test State Leakage:** Shared Express app and unreset mocks led to cascading failures across
  tests.
- **Lack of Evidence-Based Debugging:** No temporary logs or incremental test runs, making root
  causes hard to trace and fix.
- **Module Scoping Issues:** Analytics spies in tests did not always capture events due to instance
  mismatches.

### Prevention-First Strategy (Checklist)

- **Mock all externals** at the top of every test file (`vi.mock('openai', ...)`, etc.).
- **Use `.env.test`** with fake keys to prevent real API calls.
- **Reset mocks and app state** in `afterEach` and `beforeEach`.
- **Add path-aware analytics and validation:** Log the correct event for each route (e.g.,
  'preview_error' for preview spark).
- **Add temporary logs** (guarded by `process.env.NODE_ENV === 'test'`) for request paths and
  analytics events in tests and code.
- **Run tests incrementally** after every subtask; rollback on failure.
- **Require evidence** (logs, screenshots) of passing tests and correct event logging before
  merging.
- **CI/CD and Code Review Requirements:**
  - PRs must show evidence of mocks in all test files.
  - Passing incremental and full test suite runs.
  - Temporary logs removed before merge.
  - Coverage threshold met (80%+).
  - All failures must be logged and root-caused before proceeding.
- **Spy on the exact analytics instance** used in the app to avoid module scoping issues.
- **Update assertion logic** in malicious payload tests to check for user-friendly error messages
  and absence of stack traces.

---

## Defensive Implementation Steps

### 1. Preparation

- [ ] Review all affected files: tests, middleware, service, and analytics modules.
- [ ] Ensure all current tests pass (`npm run test -- --coverage`).
- [ ] Back up the current state (commit or branch).
- [ ] Document current test coverage and any known flaky tests.

### 2. Implementation (Apply Changes Incrementally)

- [ ] Add OpenAI and Supabase mocks at the top of the integration test file only.
  - Example:
    ```js
    vi.mock('openai', ...);
    vi.mock('../supabase/client.js', ...);
    ```
- [ ] Update validation middleware with a conditional for
      `req.path === '/v1/generate-preview-spark'` to log `preview_error`.
  - Example:
    ```js
    const eventName =
      req.path === '/v1/generate-preview-spark' ? 'preview_error' : 'error_occurred';
    ```
- [ ] Add temporary logging (guarded by `process.env.NODE_ENV === 'test'`) to verify code paths
      during test runs.
- [ ] Spy on the exact analytics instance used in the app.
- [ ] Update assertion logic in malicious payloads test to check for user-friendly error messages
      and absence of stack traces.
- [ ] Run only the affected integration test (`generatePreviewSpark.api.test.js`) after each change.

### 3. Verification

- [ ] Confirm the integration test now passes (both success and error event tracking).
- [ ] Re-run the **entire test suite** (`npm run test -- --coverage`).
- [ ] Check for any new failures or regressions in unrelated tests (unit, integration, malicious
      payloads, etc.).
- [ ] Review code coverage to ensure no decrease in critical areas.
- [ ] Remove any temporary logging/debug code.

### 4. Rollback & Mitigation Plan

- [ ] If new failures are introduced:
  - Revert the last change (use git or manual undo).
  - Isolate the failing test and analyze logs/output.
  - Re-apply changes one at a time, running tests after each.
  - If a fix cannot be made without regressions, restore from backup/branch and escalate for review.

### 5. Regression Verification

- [ ] Confirm that endpoints unrelated to `/v1/generate-preview-spark` are unaffected (run their
      tests, check logs).
- [ ] Manually test any critical flows if automated coverage is incomplete.
- [ ] Document any edge cases or unexpected behaviors found during testing.

---

## Testing Strategy & Plan (Consolidated)

- **Mock all external dependencies** (OpenAI, Supabase, PostHog, Sentry) in all test files.
- **Spy on analytics/logging functions** in tests and assert correct event names and payloads for
  both success and error paths.
- **Add temporary logs** in analytics and middleware layers during test development to confirm event
  firing (remove before merge).
- **Update assertion logic** in malicious payloads test to check for user-friendly error messages
  and absence of stack traces.
- **Run tests incrementally** after each change; rollback on failure.
- **Run the full test suite** after all changes to check for regressions.
- **Require evidence** (logs, screenshots) of passing tests and correct event logging before
  merging.
- **Update internal documentation** (`test-advice.md`, etc.) with new patterns and lessons learned.

---

## Acceptance Criteria

- All integration and unit tests pass, including analytics event tracking and malicious payloads.
- No real API or DB calls are made during tests (all externals are mocked).
- Analytics events are correctly logged and captured by spies in both success and error paths.
- Error responses are user-friendly and do not leak stack traces.
- No regressions in unrelated endpoints or tests.
- All temporary logs are removed before merge.
- Internal documentation is updated with new patterns and lessons learned.

---

## Defensive Rollback & Iteration Plan

- After each change, run the affected test and then the full suite.
- If a regression occurs, revert the last change, isolate the issue, and reapply fixes
  incrementally.
- If a fix cannot be made without regressions, restore from backup/branch and escalate for review.
- Document all findings and lessons learned during the process.

---

## Malicious Payloads & Error Handling

- Assert that error responses contain user-friendly messages and do not leak stack traces.
- Update assertion logic in malicious payloads test to check for these conditions.

---

## Lessons Learned & Documentation

- After implementation, update `test-advice.md` and other internal docs with new patterns for
  mocking, analytics verification, and error handling.
- Share findings with the team to prevent similar issues in the future.

---

## References

- [Task 15 PRD & Implementation Plan](task-15-Create-POST-v1-generate-preview-spark-API.md)
- [Defensive Implementation Plan](task-15-defensive-implementation-plan.md)
- [Test Plan & Strategy](task-15-Create-POST-v1-generate-preview-spark-API.md#testing-strategy--plan-consolidated)
- [CanAI Testing Rules](../.cursor/rules/canai-testing-rules.mdc)
- [CanAI Structure Rules](../.cursor/rules/canai-structure-rules.mdc)
- [Best Practices: Logging-First Debugging](test-debugging-best-practices.md)
- [Checkpoint Logs](...)
- [Grok’s guidance](../backend/task15-guidance.md)

---

## Minimal Repro & Support Request Guidance (Optional)

- If issues persist, prepare a minimal repro (branch or gist) with only the relevant files and
  failing test.
- Include a README with reproduction steps, test output, and a summary of what you’ve tried.
- Use this package for outside support or future debugging.

---

**This document is designed to ensure Task 15’s fixes are delivered safely, with full traceability,
maximum hindsight, and minimal risk to the rest of the codebase.**

---

For detailed step-by-step implementation, rollback, and iteration plans, see
[task-15-defensive-implementation-plan.md](task-15-defensive-implementation-plan.md).
