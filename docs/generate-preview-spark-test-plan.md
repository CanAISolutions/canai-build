# Test Plan Skeleton: POST /v1/generate-preview-spark API

<!--
Related Documentation:
- API Contract: docs/task-15-Create-POST-v1-generate-preview-spark-API.md
- Defensive Plan: docs/task-15-defensive-implementation-plan.md
-->

// Reference this doc in all related test files for /v1/generate-preview-spark

## Scope & Objectives

- Validate all input permutations and output structures for the preview spark endpoint.
- Ensure analytics, logging, and error handling meet PRD and internal standards.
- Achieve ≥80% coverage, 100% on critical paths, and full CI/CD integration.

## Input Permutations

- Valid: all required/optional fields, trimmed, Unicode, max/min lengths
- Missing: each required/optional field omitted
- Malformed: wrong types, extra fields, invalid values
- Edge: empty strings, max-length, special characters, emojis, injection attempts

## Analytics Event Expectations

- Log 'preview_viewed' on success
- Log 'preview_error' on validation or service failure
- Assert correct payloads and event names in all cases
- **Assertion Pattern:** Use spies on the exact analytics instance. Example:
  ```js
  expect(analyticsSpy).toHaveBeenCalledWith('preview_viewed', expect.any(Object));
  expect(analyticsSpy).toHaveBeenCalledWith('preview_error', expect.any(Object));
  ```

## Logging Strategy

- Add test-only logs at entry/exit of route, middleware, and service
- Log input, output, errors, and analytics events (redacted as needed)
- Use process.env.NODE_ENV === 'test' guards
- **Assertion Pattern:** Use log spies or output capture to verify logs at all critical points.

## Mocking & Dependency Hygiene

- Mock OpenAI, Supabase, PostHog, Sentry in all test files
- Use .env.test with fake keys
- Reset mocks and app state in beforeEach/afterEach
- **Evidence:** Show vi.mock or jest.mock at the top of every test file.

## Edge Cases & Boundaries

- Null, empty, max/min, Unicode, emojis, injection attempts
- Rate limiting, authentication, and request parsing

## Performance & Security

- Response time <1.5s
- No stack traces or sensitive info in errors
- Assert on user-friendly error messages
- **Assertion Pattern:**
  ```js
  expect(response.body.error).toMatch(/user-friendly/i);
  expect(response.body.stack).toBeUndefined();
  ```

## Test Structure & Naming

- Use AAA (Arrange-Act-Assert) pattern
- Descriptive describe/it blocks
- No .only/.skip in VCS

## Type Safety & Snapshots

- Add expectTypeOf/assertType for new/changed types
- Use snapshots for complex outputs, review diffs in PRs

## CI/CD & Coverage Gates

- Fail build if coverage <80%, analytics missing, or performance targets missed
- Upload coverage and reporter artifacts

## Evidence Required Before Merge

- [ ] Logs or screenshots of passing tests (success and error paths)
- [ ] Analytics event logs/spies showing correct event names and payloads
- [ ] Coverage report meeting threshold
- [ ] Confirmation that all external dependencies are mocked (show code snippets)
- [ ] TaskMaster status updated for the current subtask
- [ ] Documentation updated (test plan, API doc, defensive plan, lessons learned)

## References

- docs/task-15-Create-POST-v1-generate-preview-spark-API.md
- docs/task-15-defensive-implementation-plan.md
- docs/test-case-specification.md
- docs/test-debugging-best-practices.md
- docs/test-advice.md
- .cursor/rules/canai-testing-rules.mdc
- .cursor/rules/canai-test-debugging-best-practices.mdc
- .cursor/rules/canai-test-plan-skeleton-rule.mdc
- .cursor/rules/canai-structure-rules.mdc

## Lessons Learned & Rollback Plan

- Log all findings and test outputs after each step
- Revert on new failures, isolate, and reapply changes incrementally
- Document all root causes and update internal docs
- Reference the [defensive implementation plan](task-15-defensive-implementation-plan.md) for
  detailed rollback/iteration steps
- Update TaskMaster and documentation after each major step

## Completion Checklist

- [x] All input/output cases tested
- [x] Analytics and logging verified
- [x] Mocking and dependency hygiene enforced
- [x] Edge cases and boundaries covered
- [x] Performance and security assertions present
- [x] AAA structure and naming in all tests
- [x] Type safety and snapshots validated
- [x] CI/CD and coverage gates configured
- [x] Documentation and lessons learned updated
- [x] TaskMaster status updated for the current subtask
- [x] All temporary logs removed before merge
- [x] Minimal valid input scenario implemented and passing (July 2024). Test asserts on response
      structure, analytics, and logging. All tests pass as of this step.
- [x] Missing optional fields scenario implemented and passing (July 2024). Test asserts on response
      structure, analytics, and logging. All tests pass as of this step.

---

## Evidence of Success (July 2024)

- All integration tests for /v1/generate-preview-spark pass, including analytics and logging
  assertions.
- Logging uses Sentry logger, guarded by process.env.NODE_ENV === 'test', as required by the test
  plan and defensive docs.
- Analytics events are correctly captured and asserted in tests.
- All external dependencies are mocked in the test file.
- No regressions or cascading failures observed after incremental and full suite runs.
- TaskMaster and documentation updated after each step.
- See TaskMaster for status and lessons learned.

## Related Documentation

- [API Contract](task-15-Create-POST-v1-generate-preview-spark-API.md)
- [Defensive Implementation Plan](task-15-defensive-implementation-plan.md)
