# Test Plan Skeleton: POST /v1/generate-preview-spark API

## Scope & Objectives
- Validate all input permutations and output structures for the preview spark endpoint.
- Ensure analytics, logging, and error handling meet PRD and internal standards.
- Achieve ≥80% coverage, 100% on critical paths, and full CI/CD integration.

## Input Permutations
- Valid: all required/optional fields, trimmed, Unicode, max/min lengths
- Missing: each required/optional field omitted
- Malformed: wrong types, extra fields, invalid values
- Edge: empty strings, max-length, special characters, emojis

## Analytics Event Expectations
- Log 'preview_viewed' on success
- Log 'preview_error' on validation or service failure
- Assert correct payloads and event names in all cases

## Logging Strategy
- Add test-only logs at entry/exit of route, middleware, and service
- Log input, output, errors, and analytics events (redacted as needed)
- Use process.env.NODE_ENV === 'test' guards

## Mocking & Dependency Hygiene
- Mock OpenAI, Supabase, PostHog, Sentry in all test files
- Use .env.test with fake keys
- Reset mocks and app state in beforeEach/afterEach

## Edge Cases & Boundaries
- Null, empty, max/min, Unicode, emojis, injection attempts
- Rate limiting, authentication, and request parsing

## Performance & Security
- Response time <1.5s
- No stack traces or sensitive info in errors
- Assert on user-friendly error messages

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

## Completion Checklist
- [ ] All input/output cases tested
- [ ] Analytics and logging verified
- [ ] Mocking and dependency hygiene enforced
- [ ] Edge cases and boundaries covered
- [ ] Performance and security assertions present
- [ ] AAA structure and naming in all tests
- [ ] Type safety and snapshots validated
- [ ] CI/CD and coverage gates configured
- [ ] Documentation and lessons learned updated
- [ ] All temporary logs removed before merge