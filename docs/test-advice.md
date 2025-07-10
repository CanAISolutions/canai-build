# Bulletproof Vitest Testing in Cursor AI Workflows

_A definitive .mdc playbook for robust, agent-aware testing_

## 🎯 Goal

Ensure every Vitest run in Cursor AI is **loud on failure, rich in insight, fast to fix, and safe to
ship**. This rule-set enables Cursor AI agents to generate, refactor, and debug Vitest suites in
TypeScript/Node.js projects that never fail silently, always provide actionable diagnostics, and
support rapid recovery.

---

## 1 · Preventative Practices

Prevent issues proactively to create a resilient test suite.

| #    | Directive                                                                                                                                                             | Why It Works                                       | Verification Method                                          |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------ |
| 1.1  | **Every test must assert.** Reject or rewrite tests that contain no `expect()` (or snapshot) statements.                                                              | Vacuous tests mask bugs.                           | Lint or search for tests lacking `expect`.                   |
| 1.2  | **Use explicit, comprehensive assertions.** Prefer strict/deep equality; fall back to `expect.soft` for non-critical checks. Await all promises (`resolves/rejects`). | Surfaces incorrect states immediately.             | Review generated code; run suite with a known failing value. |
| 1.3  | **Add type tests for TS APIs.** Auto-scaffold `*.test-d.ts` and run `vitest --typecheck`.                                                                             | Catches type regressions before runtime.           | Suite must fail on a deliberate type error.                  |
| 1.4  | **Isolate state.** Use `vi.mock`, `vi.resetModules`, and default `isolate:true`.                                                                                      | Prevents cross-test contamination & flakiness.     | Shuffle test order; all must still pass.                     |
| 1.5  | **Colocate tests** (`*.spec.ts` or `*.test.ts` beside source).                                                                                                        | Keeps AI-generated files in sync and discoverable. | Script confirms one test per source file.                    |
| 1.6  | **AAA structure & descriptive names.** `describe/it` should read like specifications (Given → When → Then).                                                           | Enhances readability for humans and AI.            | Verbose run shows meaningful titles.                         |
| 1.7  | **Gold-standard examples in `.cursorrules`.** Provide a canonical test file at `tests/_example.gold.spec.ts`.                                                         | Pattern-driven generation improves quality.        | Compare new tests against exemplar.                          |
| 1.8  | **Fail fast on misconfiguration.** Enable TS type-checks & lints during `vitest` run.                                                                                 | Surfaces hidden errors early.                      | Introduce a type error or misnamed import → run must fail.   |
| 1.9  | **Mock only externals; avoid over-mocking internals.**                                                                                                                | Prevents false-green tests & brittle coupling.     | Integration tests on real modules continue to pass.          |
| 1.10 | **Guard edge cases & boundaries.** Generate tests for `null`, empty, max/min, Unicode, etc.                                                                           | Edge-case bugs are silent killers.                 | Feed extreme inputs → suite must catch failures.             |

---

## 2 · Debugging Methods

Quickly identify and resolve test failures with these techniques.

- **Interactive Debugger First**
  - **What**: Run `vitest --inspect-brk` and attach a debugger (e.g., VS Code/Chrome DevTools) to
    step through failing tests.
  - **Why**: Reveals runtime state at failure, crucial for silent hangs or promise issues.
  - **Verification**: Set breakpoints; confirm you can inspect variables at failure points.

- **Watch + Focus Loop**
  - **What**: Use `vitest --watch`, `.only()`, and `R` reload loop for rapid fix-verify cycles.
  - **Why**: Speeds up debugging by isolating and re-running specific tests.
  - **Verification**: Apply `.only()` to a failing test; ensure only it runs, then remove before
    committing.

- **Console Insight**
  - **What**: Add `console.log` statements; disable interception with `--disableConsoleIntercept`.
  - **Why**: Provides real-time execution traces for diagnosing failures.
  - **Verification**: Add logs before an assertion; confirm they appear in output with the flag.

- **Cursor Feedback Loop**
  - **What**: Let Cursor analyze test failures and propose ranked fixes based on stack traces.
  - **Why**: Automates trivial fixes, leveraging AI’s error interpretation.
  - **Verification**: Trigger a failure; apply AI’s fix and rerun to confirm resolution.

- **Divide & Conquer**
  - **What**: Fix one failure at a time, committing after each success.
  - **Why**: Isolates fixes, preventing confusion and ensuring progress.
  - **Verification**: Run suite after each fix; confirm fewer failures or rollback if needed.

- **Causal-Chain Scan**
  - **What**: On failure after an AI change, traverse the dependency graph (e.g., using `madge`) to
    explain the probable root cause.
  - **Why**: Identifies how changes impact tests, aiding targeted fixes.
  - **Verification**: Trace dependencies manually or with tools; confirm the root cause is
    addressed.

---

## 3 · Test Intelligence (Understanding Test Contexts)

Build self-explanatory tests with clear failure context.

- **Hierarchical `describe` Blocks**
  - **What**: Organize tests with `describe` blocks mirroring the code structure.
  - **Why**: Provides context in failure reports (e.g., "UserService > login").
  - **Verification**: Check failure output; ensure it includes a clear `describe` chain.

- **Hooks as Hygiene**
  - **What**: Use `beforeEach`/`afterEach` to reset state (e.g., mocks, globals); leverage
    `test.extend` for shared fixtures.
  - **Why**: Ensures test independence, avoiding state leakage.
  - **Verification**: Run tests in random order; confirm consistent results.

- **Test-Mode Code Branches**
  - **What**: Use `if (import.meta.vitest)` for test-specific logic, and unit-test these branches.
  - **Why**: Prevents environmental failures unrelated to logic.
  - **Verification**: Test both test and production paths separately.

- **Baseline Scaffolding**
  - **What**: For every new file, auto-generate:
    - Minimal functional test
    - Snapshot (UI/data) with human review gate
    - Type tests
    - ESLint/Prettier pass
  - **Why**: Ensures new code is testable and meets quality standards.
  - **Verification**: Check that all new files have corresponding tests and pass linting.

---

## 4 · Recovery Procedures

Recover quickly from failures and maintain suite integrity.

- **Robust Teardown**
  - **What**: Use `afterEach`/`afterAll` for resource cleanup.
  - **Why**: Prevents cascading failures or flakiness.
  - **Verification**: Fail a test with resources; ensure subsequent tests pass.

- **Snapshot Discipline**
  - **What**: Review and update snapshots (`vitest --update`) only when valid; show diffs in PRs for
    human confirmation.
  - **Why**: Keeps snapshots relevant, avoiding false failures.
  - **Verification**: Update a snapshot; rerun and check PR diff for clarity.

- **Retries as Safety-Net, Not Crutch**
  - **What**: Configure `vitest --retry=2` in CI; quarantine flaky tests for triage.
  - **Why**: Smooths out intermittent issues while investigating root causes.
  - **Verification**: Test a flaky case; confirm retries work but isolate and fix the root cause.

- **Version-Control Checkpoints**
  - **What**: Commit before AI changes; revert with `git reset --hard` if tests fail.
  - **Why**: Offers a quick undo for problematic AI edits.
  - **Verification**: Revert a failed AI change; confirm tests pass again.

- **CI Safety Nets**
  - **What**: Run full suite with coverage across Node versions and OSes on every push; treat any
    failure as blocking.
  - **Why**: Catches local oversights and platform-specific issues.
  - **Verification**: Break a test in CI; ensure it fails with clear logs.

---

## 5 · Observability & Logging

Enhance visibility for effective diagnosis.

- **Custom Reporters**
  - **What**: Configure `verbose`, `json`, or `junit` reporters in `vitest.config.ts`; attach
    artifacts in CI.
  - **Why**: Offers detailed, parseable failure data.
  - **Verification**: Run with a reporter; confirm output details failures.

- **Targeted Logs & Debug Namespaces**
  - **What**: Use `console.error` or libraries (e.g., `debug`) with env controls; strip noisy logs
    in green builds.
  - **Why**: Provides a failure trail while keeping successful runs clean.
  - **Verification**: Fail a test; check for custom logs, then confirm clean output in green builds.

- **Performance Guardrails**
  - **What**: Set per-test and global timeouts (`--testTimeout`); flag tests within 80% of the
    limit.
  - **Why**: Spots inefficiencies or potential hangs proactively.
  - **Verification**: Adjust timeout; ensure slow tests fail predictably and are flagged.

- **UI/Integration Artifacts**
  - **What**: Capture screenshots or API dumps on `onTestFailed` hook.
  - **Why**: Adds context beyond assertion failures.
  - **Verification**: Fail a UI test; confirm artifacts are generated.

- **Unhandled Rejections**
  - **What**: Treat Vitest warnings as failures; require explicit `expect(...).rejects`.
  - **Why**: Prevents hidden bugs from passing silently.
  - **Verification**: Add an unhandled rejection; fix after Vitest flags it.

---

## 6 · Anti-Patterns to Avoid

Avoid these pitfalls to maintain a reliable test suite.

| Issue                                        | Why It’s Bad           | Cursor AI Action                          |
| -------------------------------------------- | ---------------------- | ----------------------------------------- |
| `.only`, `.skip`, or ignored failures in VCS | Masks real problems    | Fail lint; auto-remove or block commit    |
| Over-mocking internals                       | Gives false confidence | Suggest integration tests / lighter mocks |
| Brittle tests (line-number, exact message)   | Breaks on refactor     | Replace with flexible matchers            |
| Flaky timing or randomness                   | CI noise, mistrust     | Insert deterministic fakes / seeds        |
| Silent `catch` without assertion             | Swallows errors        | Rewrite to `expect(...).toThrow()`        |
| Blindly applying AI fixes                    | Unknown regressions    | Require human review + rerun suite        |

---

## 7 · Rapid-Fire Checklist

Ensure your test suite is bulletproof with this checklist.

```markdown
✅ Assertion in every test ✅ Edge cases & boundaries covered ✅ Descriptive names + AAA pattern ✅
State isolation via hooks/mocks ✅ No `.only` / `.skip` in VCS ✅ Mock externals, not internals ✅
Type tests for new TS APIs ✅ Watch mode for fast feedback ✅ Snapshots reviewed & intentional ✅
Flakes tracked; retries temporary ✅ CI full suite + coverage on every push ✅ Frequent commits for
easy rollback ✅ Agent explanations in comments/commits
```

---

## 8 · Cursor-Specific Configuration

Embed this snippet in `.cursorrules` to guide Cursor AI in generating high-quality tests.

```mdc
# vitest-testing.mdc
- Always generate Vitest tests beside source (`*.spec.ts`).
- Reject any test lacking an assertion or snapshot.
- Enforce `vitest --typecheck` and ESLint before commit.
- Use AAA structure and descriptive `describe/it` naming.
- Mock external services with `vi.mock`; avoid internal mocks.
- Provide a gold-standard example at `tests/_example.gold.spec.ts`.
- Remove `.only` / `.skip` and failing lints in PR.
- Capture artifacts on failure; upload via CI reporter.
- Configure retries (max 2) only in CI and quarantine flaky tests.
- Treat unhandled rejections/warnings as failures.
- Flag tests within 80% of timeout limit for review.
- Show snapshot diffs in PRs for human confirmation.
```

---

## ✨ Outcome

By embedding these rules in `.cursorrules`, Cursor AI agents will author, evaluate, and debug Vitest
suites that are resilient, transparent, and fast-healing, giving teams total confidence in every
merge.

---

**Sources**:

- Bulletproof Vitest Testing in Cursor AI Workflows
- Cursor AI Rules for Bulletproof Vitest Test Suites
- Best Practices for Vitest in Cursor AI Workflows
- .cursorrules – Vitest Debugging & Test Excellence
