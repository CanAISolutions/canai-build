# Supabase Test Environment Setup & Automation: Subtask Checklist

> **This checklist reflects the enhanced, production-aligned plan.** > **Critical subtasks for
> immediate production testing safety are marked with [PRIORITY].**

---

## 1. Create/Configure Dedicated Supabase Test Project

- [x] 1.1 [PRIORITY] Create a new Supabase project (cloud) for testing with identical settings to
      production (auth, storage, rate limits)
- [x] 1.2 Set up project config (`supabase/config.toml`) for local dev/test with unique `project_id`
      and ports
- [x] 1.3 Document project/environment separation in `docs/testing.md`

## 2. Schema & RLS Policy Synchronization

- [x] 2.1 Store schema migrations and RLS policies in `backend/supabase/migrations/`
- [x] 2.2 Apply migrations and RLS policies to the test project using Supabase CLI or dashboard
- [x] 2.3 Automate in CI/CD with `supabase db reset && supabase db migrate`
- [x] 2.4 Add tests to validate RLS policy parity programmatically

## 3. Test Data Management & Tagging

- [ ] 3.1 [PRIORITY] Add `test_run_id` column to `prompt_logs` and audit logs for test data tagging
- [ ] 3.2 [PRIORITY] Create seed scripts with synthetic data mimicking production (no PII)
- [ ] 3.3 [PRIORITY] Implement cleanup scripts to remove data with `test_run_id` after each run,
      handling partial failures
- [ ] 3.4 Tag audit logs with `test: true` and clean them post-test
- [ ] 3.5 Add performance tests for Supabase queries (e.g., read/write latency)

## 4. Environment Variables & Secret Management

- [x] 4.1 [PRIORITY] Store Supabase keys in `.env.test` (separate from production `.env`)
- [ ] 4.2 [PRIORITY] Update `.env.example` and CI/CD secrets for test environment
- [ ] 4.3 Document secret management and rotation in `docs/testing.md`

## 5. JWT Generation for Test Flows

- [ ] 5.1 [PRIORITY] Create a utility to generate test JWTs with custom claims (user, admin) for RLS
      testing
- [ ] 5.2 Integrate into test setup/teardown scripts
- [ ] 5.3 Document usage in `docs/testing.md`

## 6. Local Development & Fast Iteration

- [ ] 6.1 Enable local test DB via `supabase start` with production-like settings
- [ ] 6.2 Document switching between local and cloud test environments, highlighting config parity

## 7. CI/CD Integration

- [ ] 7.1 [PRIORITY] Add CI steps to spin up test DB, apply migrations, and seed data
- [ ] 7.2 [PRIORITY] Inject secrets securely via GitHub Secrets
- [ ] 7.3 [PRIORITY] Run integration and RLS tests against the test project
- [ ] 7.4 [PRIORITY] Ensure cleanup runs after tests, even on failure, using
      `scripts/cleanup-test-data.js`
- [ ] 7.5 Monitor Supabase API rate limits in CI/CD

## 8. Documentation & Best Practices

- [ ] 8.1 Create `docs/testing.md` with test environment structure, config, and flows
- [ ] 8.2 Update `README.md` to reference `docs/testing.md` for test setup
- [ ] 8.3 Document config changes, ports, and service toggles
- [ ] 8.4 Reference `docs/supabase-frontend-integration.md` for frontend integration patterns

## 9. Monitoring & Security

- [ ] 9.1 Add checks to prevent secret leaks in logs or code
- [ ] 9.2 Document procedures for rotating secrets and cleaning test data
- [ ] 9.3 Audit test project usage for rate limits and security

---

**Notes:**

- Email/notification testing (Inbucket) omitted unless confirmed relevant for `prompt_logs`.
- Prioritize [PRIORITY] subtasks for immediate production testing safety.
- Check off each item as you complete it. Remove this file when the setup is fully complete and
  documented elsewhere.
