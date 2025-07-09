# Test Debugging Best Practices for CanAI

> **Note:** This document is enforced by the
> [canai-test-debugging-best-practices.mdc](mdc:.cursor/rules/canai-test-debugging-best-practices.mdc)
> Cursor rule. All test file changes and debugging must follow these practices.

---

## Purpose

Establish a standardized, logging-first, dependency-aware workflow for debugging test failures in
the CanAI platform. This ensures efficient, evidence-based resolution and continuous learning from
each opportunity.

---

## Rationale

- **Logging-first:** Instrumentation before changes maximizes root cause visibility and reduces
  wasted debugging effort.
- **Dependency hygiene:** Proactively address all dependencies (including transitive) to prevent
  avoidable failures.
- **Strategic, analytical process:** Each step is measured and evidence-driven, minimizing risk and
  scope creep.
- **Continuous improvement:** Document lessons learned to refine the process over time.

---

## Standard Debugging Workflow

### 1. Logging-First Instrumentation

- Add robust, privacy-conscious logging to all new/changed utilities and middleware.
- Log entry/exit, input/output (redacted), and all errors/exceptions.
- Use structured logging (e.g., with backend/Shared/Logger.ts) where possible.

### 2. Automated Dependency Hygiene

- Audit and install all required dependencies, including transitive ones.
- Use `npm install`, `npm audit fix`, and address any missing modules.
- Document any new or changed dependencies in the appropriate place (e.g., README, docs).

### 3. Test Suite Execution

- Run the full test suite after logging and dependency fixes.
- Review logs for errors, edge cases, and unexpected behaviors.

### 4. Evidence-Based Analysis

- Use logs and test output to pinpoint root causes.
- Only consider code rewrites or logic changes after gathering sufficient evidence.

### 5. Lessons Learned & Documentation

- After resolution, update this document with new insights, pitfalls, or best practices discovered.
- Encourage a culture of continuous improvement and knowledge sharing.

### Advanced Vitest Debugging Techniques

- **Structured Logging:** Use a custom logger for test suites to capture input, output, and context,
  not just console.log.
- **Test Isolation:** Use `.only` to focus on a single test during debugging and isolate failures.
- **Snapshot Testing:** Use `toMatchSnapshot()` for complex objects to track changes over time.
- **Deterministic Tests:** Mock randomness, timestamps, and external dependencies to ensure
  repeatable results.
- **Test Hooks:** Use Vitest's `context.onTestFailed` to log diagnostics automatically on test
  failures.
- **Stepwise Assertions:** Break complex tests into smaller, granular checks for easier diagnosis.

These advanced techniques are required best practices for all test debugging and test file changes.
See the Cursor rule for enforcement details.

### Preventative Practices

- **Colocate Tests with Source Code:** Place test files next to the modules they test for better
  discoverability and maintainability.
- **Consistent Naming Conventions:** Use `.spec.ts`, `.spec.js`, `.test.ts`, or `.test.js` suffixes
  for all test files.
- **Arrange-Act-Assert (AAA) Pattern:** Structure every test into clear Arrange, Act, and Assert
  sections for clarity and reliability.
- **Mock External Dependencies:** Always mock network calls, databases, and other external services
  to ensure tests are deterministic and fast.

### Common Anti-Patterns to Avoid

- **Global State:** Never rely on or mutate global state between tests. Use setup/teardown hooks to
  reset state.
- **Test Interdependence:** Each test must be fully independent; do not rely on the outcome or side
  effects of other tests.
- **Overuse of beforeAll:** Prefer `beforeEach` for setup to avoid state leakage between tests.
- **Unclear Test Names:** Test names should clearly describe the scenario and expected outcome.

These preventative practices and anti-patterns are required standards for all test debugging and
test file changes. See the Cursor rule for enforcement details.

### Explicit & Comprehensive Assertions

- All tests must use explicit, specific assertions (`toBe`, `toEqual`, etc.).
- For multi-assertion tests, use `expect.soft()` to accumulate failures.
- Always await asynchronous assertions.

### Type Safety & Type Tests

- For TypeScript, add `expectTypeOf` or `assertType` tests for new/changed types and interfaces.
- Maintain `.test-d.ts` files and ensure `vitest typecheck` passes.

### Test Isolation & State Management

- Use `vi.mock`, `vi.importActual`, and `vi.resetModules` to ensure test isolation.
- Use `beforeEach`/`afterEach` to reset state and avoid cross-test contamination.

### Descriptive & Consistent Naming

- Use clear, consistent naming for `describe`/`it` blocks (e.g., `Given_When_Then`).
- Test names must reflect the feature/module and expected behavior.

### Standardized Error Handling

- Always assert on specific error types, messages, or codes.
- Avoid generic `toThrow()` without arguments.

### Enhanced Logging for Diagnostics

- Add targeted `console.log`, `console.error`, or `debug` statements on failure.
- Log variables, inputs/outputs, and intermediate states.

### Interactive Debugging Guidance

- Use breakpoints in your IDE and run Vitest with `--inspect-brk` for debugging.
- Disable parallelism for complex scenarios if needed.

### Chain Effect Analysis

- When a test fails after code changes, analyze recent changes for chain effects and dependencies.

### Baseline Validation for New Files

- Scaffold minimal test files, initial snapshots, and type tests for all new files.
- Require human review of initial snapshots.

### Automated Fix Suggestions & Git Rollback

- Offer concrete code fixes and recommend git rollback if immediate fix is not evident.

### Comprehensive Vitest Reporter Setup

- Configure `vitest.config.ts` with `json`, `html`, and `verbose` reporters for diagnostics and
  CI/CD.

### Agent Internal Logging & Explanation

- Add comments and commit messages explaining agent-driven changes, especially those affecting
  tests.

### Expanded Anti-Patterns to Avoid

- **Flaky Test Patterns:** No arbitrary timers, control randomness, stable mocks.
- **Snapshot Overuse:** Use snapshots judiciously, always review on creation.
- **Direct DOM Manipulation:** Prefer testing libraries over direct DOM access.
- **Excessive/Brittle Mocks:** Mock only what's necessary, prefer module-level mocks.

### Success Checklist

```markdown
### ✅ Vitest & Cursor AI Success Checklist

- **Explicit Assertions:** Every test has clear, specific `expect()` calls. No silent passes.
- **Type Safety First:** New/modified TS code has accompanying `expectTypeOf` tests.
- **Isolated Tests:** Tests use `vi.mock` and `vi.resetModules` to ensure clean, independent runs.
- **Descriptive Naming:** `describe`/`it` blocks are clear, concise, and follow a consistent
  pattern.
- **Contextual Logging:** Use `console.log`/`debug` strategically for fast failure diagnosis.
- **Leverage Cursor AI for Debugging:**
  - Ask Cursor to `Explain why this test failed.`
  - Ask Cursor to `Analyze chain effects related to recent changes.`
  - Ask Cursor to `Suggest fixes for this failing test.`
- **Agent-Aware Design:** Modular files, clear exports/imports for AI readability.
- **Baseline Validation:** New files have initial snapshots (human-reviewed!) and basic functional
  tests.
- **No Flaky Patterns:** Avoid `setTimeout`/`sleep`. Use `expect.poll` or controlled randomness.
- **Judicious Snapshots:** Use sparingly, review carefully, balance with explicit assertions.
- **Git Hygiene:** Commit frequently, especially after agent-driven changes, for easy rollbacks.
- **Comprehensive Reporters:** `vitest.config.ts` has `json`/`html`/`verbose` reporters configured.
- **Agent Explanations:** Encourage Cursor to add comments/commit messages explaining complex
  changes.
```

---

## Lessons Learned / Opportunities

- [2025-07-09] Missing transitive dependency (`url-parse`) caused test failures after introducing
  `jsdom`. Proactive dependency checks and logging would have surfaced this earlier.
- [Add new entries as issues and solutions are discovered.]

---

## References

- PRD.md (Sections 13.1, 14.1)
- docs/task-9.2-dompurify-integration.md
- backend/Shared/Logger.ts
- npm, Node.js, and dependency management best practices

---

**Last updated:** 2025-07-09

### Recovery Procedures & Observability Enhancements

> **New:** Added 2025-07-09 to align with `docs/test-advice.md` guidelines.

| Area                           | Requirement                                                                                         | Rationale                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| **Robust Teardown**            | Use `afterEach` / `afterAll` to release resources, reset mocks, and close connections.              | Prevents cascading failures or flakiness in subsequent tests.       |
| **Snapshot Discipline**        | Update snapshots only with explicit human review; PRs must display diffs.                           | Avoids silent snapshot creep and ensures meaningful assertions.     |
| **Retries & Flake Quarantine** | Enable `--retry=2` (CI only) and quarantine persistently flaky tests for triage.                    | Provides a safety-net while enforcing eventual root-cause fixes.    |
| **Unhandled Rejections**       | Treat unhandled promise rejections and console warnings as failures.                                | Ensures hidden issues surface immediately.                          |
| **Timeout Guardrails**         | Configure per-test & global timeouts; flag tests running >80 % of the threshold for review.         | Detects performance regressions proactively.                        |
| **CI Safety Nets**             | Run the full suite (with coverage) across Node versions & OSes on every push; block on any failure. | Catches environment-specific defects and maintains high confidence. |
| **Reporter Artifacts**         | Ensure `verbose`, `json`, and `html` reporters are configured and uploaded as CI artifacts.         | Provides rich diagnostics for fast failure analysis.                |

These additions complement the existing **Comprehensive Vitest Reporter Setup** section and should
be treated as **non-negotiable standards** for all future test work.

### Planning-Phase Requirements (added 2025-07-09)

1. **Test Design Document:** Every new feature/task must include a `<feature>-test-plan.md`
   outlining scope, edge-cases, and logging before coding starts.
2. **Taskmaster Skeleton Subtask:** Implementation tasks must depend on a `Create Vitest skeleton`
   subtask that blocks completion until a spec file is scaffolded.
3. **Template Enforcement:** Use `tests/_example.gold.spec.ts` as the mandatory starting point for
   new specs.

### Progressive Coverage Strategy

We adopt a ratcheting model to avoid blocking early development while preventing regression later:

| Baseline Coverage | CI Action                                                 |
| ----------------- | --------------------------------------------------------- |
| < 40 %            | Warn only; annotate uncovered lines.                      |
| 40 % – 80 %       | Fail if coverage decreases vs. `master`.                  |
| ≥ 80 %            | Fail if total < 80 % **or** changed-line coverage < 80 %. |

Coverage thresholds are configurable in CI (`vitest --coverage`) and may tighten as the PRD task
list nears completion.
