**Prompt for Task 9.5: Malicious Payload Validation Testing**

We are working on Task 9.5: Malicious Payload Validation Testing as part of our input validation
middleware initiative. Please follow these instructions to ensure a secure, robust, and PRD-aligned
execution:

---

### Instructions

**Reference the Implementation Guide**

- Use the detailed plan in `docs/task-9.5-malicious-payload-testing-guide.md` as your primary guide.
- This guide includes a comprehensive checklist—update it after each completed step.

---

### Implementation Steps

1. **Payload Library Creation**
   - Curate a comprehensive set of malicious payloads for each attack type (XSS, SQLi, buffer
     overflow, Unicode, malformed/edge).
   - Reference OWASP cheat sheets, recent CVEs, and `docs/task-9.4-pattern-library.md`.
   - Document each payload with attack type, example, and expected outcome.
   - Store as a markdown table or JSON/TS file (e.g., `docs/malicious-payload-library.md` or
     `backend/tests/helpers/maliciousPayloads.ts`).

2. **Endpoint & Helper Mapping**
   - List all backend API endpoints and validation helpers.
   - For each, map user-controllable fields and relevant payload types.
   - Create a mapping matrix and store as `docs/task-9.5-endpoint-payload-mapping.md`.

3. **Test Suite Scaffolding**
   - Scaffold Vitest test files for each endpoint/helper.
   - Use parameterized tests (`it.each`) for payload coverage.
   - For each test, inject payloads, assert on response, error code, logs, and sanitization.
   - Integrate with existing test plans (see `backend/middleware/validation.test.ts`,
     `sanitize.test.ts`).

4. **Logging & Evidence Collection**
   - Ensure all test failures/anomalies are logged with payload, endpoint/field, actual vs. expected
     outcome, and error details.
   - Archive all test logs and artifacts for review and regression testing.

5. **Continuous Documentation & Update Process**
   - After each test/fix cycle, update the guide, payload library, and endpoint mapping.
   - Require PR review for all changes.
   - Document all validation schemas and patterns in `docs/validation-rules.md`.

6. **Integration with Task 9 and PRD**
   - Ensure all malicious payload tests are referenced in the overall Task 9 implementation plan
     (`docs/task-9-input-validation-middleware.md`).
   - Use results to refine validation middleware, schemas, and error handling.

---

### Testing Best Practices

- Follow the standards in `docs/test-debugging-best-practices.md`, `docs/test-advice.md`, and
  `.cursor/rules/canai-test-plan-skeleton-rule.mdc`.
- Every test must assert, cover edge cases, and use explicit, comprehensive assertions.
- Use AAA structure, descriptive naming, and parameterized tests.
- Mock only external dependencies, ensure test isolation, and use robust teardown.
- Configure Vitest with `json`, `html`, and `verbose` reporters for diagnostics and CI/CD.
- Run the full suite with coverage on every push; block merges on any failure.
- Archive logs and artifacts for review.

---

### Progress Tracking

- After each step, check off the corresponding item in the checklist in
  `docs/task-9.5-malicious-payload-testing-guide.md`.
- Briefly document any decisions, edge cases, or deviations in the same file.

---

### Quality Assurance

- Ensure all code changes are covered by tests.
- Validate that all endpoints and helpers are tested against the full payload library.
- Confirm that all failures are logged, root-caused, and addressed.
- Review for PRD alignment, maintainability, and modularity (see canai-structure-rules).

---

### Communication

- If you encounter blockers, ambiguities, or edge cases, document them in the implementation guide
  and flag them for review.
- Use the guide as a living document—keep it up to date!

---

### Success Criteria

- All endpoints and helpers are tested against a comprehensive malicious payload library.
- No XSS, SQLi, or other attack payloads survive validation/sanitization in any tested field.
- All failures are logged, root-caused, and addressed.
- All logic is reusable, documented, and covered by tests.
- Logging and error handling are robust and user-centric.
- Documentation and update process are clear and enforced.

---

### Reference

- `docs/task-9.5-malicious-payload-testing-guide.md`
- `docs/task-9-input-validation-middleware.md`
- `docs/validation-rules.md`
- `docs/task-9.4-pattern-library.md`
- `docs/task-9.3-validation-middleware.md`
- `docs/test-debugging-best-practices.md`
- `docs/test-advice.md`
- `.cursor/rules/canai-test-plan-skeleton-rule.mdc`
- `backend/middleware/validation.test.ts`
- `backend/middleware/sanitize.test.ts`
- canai-structure-rules

---

**Summary:** Follow the plan, check off progress, document as you go, and ensure all requirements
and quality standards are met. If in doubt, update the plan and ask for clarification!
