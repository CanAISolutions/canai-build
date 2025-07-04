# Supabase Test Environment: Structure, Config, and Flows

This document describes the setup, configuration, and best practices for the dedicated Supabase test
environment for the CanAI Platform. It aligns with the
[Supabase Test Environment Checklist](./supabase-test-environment-checklist.md) and is designed for
production-level safety, repeatability, and security.

---

## 1. Test Project Creation & Configuration

- **Create a dedicated Supabase project** in the cloud, matching production settings (auth, storage,
  rate limits).
- Use a unique `project_id` in `supabase/config.toml` for local dev/test.
- **Project/Environment Separation:**

### Project/Environment Separation

To ensure safety, repeatability, and clarity, the CanAI Platform uses two distinct Supabase
projects:

- **Production:**
  - Project name: `canai-build`
  - Used for all live, user-facing data and operations.
  - Environment variables: stored in `.env` (never `.env.test`)
  - Config: `supabase/config.toml` should use the production `project_id` only in production
    environments.

- **Test:**
  - Project name: `canai-build-Test`
  - Used exclusively for automated tests, integration tests, and local development.
  - Environment variables: stored in `.env.test` (never `.env`)
  - Config: `supabase/config.toml` should use the test `project_id` for local dev and CI/CD.

**Best Practices:**

- Never use production keys or project IDs in test environments, or vice versa.
- Always double-check the `project_id` in `supabase/config.toml` before running migrations or tests.
- Use clear naming conventions for both projects to avoid confusion in the Supabase dashboard and
  scripts.
- Document any changes to environment separation in this file and in the checklist.

## Local Development URLs & Keys

When running `npx supabase start`, your local Supabase stack provides the following services:

- **API URL:** http://127.0.0.1:54321
- **GraphQL URL:** http://127.0.0.1:54321/graphql/v1
- **S3 Storage URL:** http://127.0.0.1:54321/storage/v1/s3
- **DB URL:** postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio URL:** http://127.0.0.1:54323
- **Inbucket URL (Email Testing):** http://127.0.0.1:54324

**Keys and Secrets:**

- JWT secret, anon key, and service role key are generated for local development and shown in the
  terminal output when you start Supabase.
- **Do NOT commit real secrets or keys to git.**
- Store these values in your `.env.test` file for local development and testing.
- Never use production keys in your test or local environment.

## 2. Schema & RLS Policy Synchronization

- Store all schema migrations and RLS policies in `backend/supabase/migrations/`.
- Apply migrations and RLS policies to the test project using the Supabase CLI or dashboard.
- Automate this in CI/CD with `supabase db reset && supabase db migrate`.
- Add automated tests to validate RLS policy parity between test and production.

## 3. Test Data Management & Tagging

- Add a `test_run_id` column to `prompt_logs` and audit logs for tagging test data.
- Seed scripts should use synthetic, non-PII data.
- Implement cleanup scripts to remove all data with the test tag after each run, handling partial
  failures.
- Tag audit logs with `test: true` and clean them post-test.
- Add performance tests for Supabase queries (read/write latency).

## 4. Environment Variables & Secret Management

- Store all Supabase keys in `.env.test` (never in code or production `.env`).
- Update `.env.example` and CI/CD secrets to reflect test environment needs.
- Document secret management and rotation procedures below.

## 5. JWT Generation for Test Flows

- Use a utility to generate test JWTs with custom claims (user, admin) for RLS testing.
- Integrate this utility into test setup/teardown scripts.
- See usage examples below.

## 6. Local Development & Fast Iteration

- Enable local test DB via `supabase start` with production-like settings.
- Document how to switch between local and cloud test environments, and ensure config parity.

## 7. CI/CD Integration

- Add CI steps to spin up the test DB, apply migrations, and seed data.
- Inject secrets securely via GitHub Secrets or your CI provider.
- **Supabase test DB automation:**
  - The CI pipeline uses the `SUPABASE_TEST_PROJECT_ID` and `SUPABASE_TEST_DB_URL` secrets to
    automate database resets and migrations.
  - Example GitHub Actions step:
    ```yaml
    - name: Reset and migrate Supabase test DB
      env:
        SUPABASE_TEST_PROJECT_ID: ${{ secrets.SUPABASE_TEST_PROJECT_ID }}
        SUPABASE_TEST_DB_URL: ${{ secrets.SUPABASE_TEST_DB_URL }}
      run: |
        supabase db reset --project-id $SUPABASE_TEST_PROJECT_ID --db-url $SUPABASE_TEST_DB_URL --non-interactive
    ```
  - This ensures every test run starts with a clean, production-aligned schema and RLS policy set.
- Run integration and RLS tests against the test project.
- Ensure cleanup runs after tests, even on failure, using `scripts/cleanup-test-data.js`.
- Monitor Supabase API rate limits in CI/CD.

## 8. Documentation & Best Practices

- This file (`docs/testing.md`) is the canonical reference for test environment structure, config,
  and flows.
- The [README.md](../README.md) should reference this file for test setup.
- Document all config changes, ports, and service toggles here.

## 9. Monitoring & Security

- Add checks to prevent secret leaks in logs or code.
- Document procedures for rotating secrets and cleaning test data.
- Audit test project usage for rate limits and security.

---

## Keeping Test and Production Environments in Sync

- Always apply schema and RLS migrations to both environments.
- Use automated tests to validate parity.
- Regularly review and update `.env.test` and `config.toml` to match production settings (except for
  secrets).

---

## Quickstart: Running Tests Locally and in CI/CD

### Local

1. Create `.env.test` with test Supabase keys.
2. Run `supabase start` (ensure `config.toml` uses test project_id and ports).
3. Apply migrations: `supabase db reset && supabase db migrate`.
4. Seed test data: run seed scripts.
5. Run tests: `npm test` or your preferred runner.
6. Cleanup: run cleanup script to remove test data.

### CI/CD

1. Inject secrets via CI provider (GitHub Actions, etc.).
   - **Use `SUPABASE_TEST_PROJECT_ID` and `SUPABASE_TEST_DB_URL` for all automated DB operations.**
2. Spin up test DB and apply migrations.
3. Seed data and run tests.
4. Ensure cleanup runs after tests, even on failure.

---

## Security & Cleanup Procedures

- Never commit secrets to git.
- Rotate secrets regularly and document the process.
- Ensure all test data is tagged and cleaned up after each run.
- Monitor for rate limit issues and audit logs for anomalies.

---

**For the full checklist, see
[supabase-test-environment-checklist.md](./supabase-test-environment-checklist.md).**

---

## Supabase Connectivity Test Script (Canonical Workflow)

To verify Supabase test environment connectivity and permissions, use the script at
`backend/scripts/check-supabase.js`:

- Loads credentials from `backend/.env.test` (see variable names below).
- Inserts a test row with a valid UUID into the `prompt_logs` table.
- Selects the test row to confirm both write and read access.
- Deletes the test row after verification to keep the table clean.
- Logs all steps and errors for transparency.

### Required .env.test Variables

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_KEY=...
```

### How to Run

```sh
cd backend
node scripts/check-supabase.js
```

### Expected Output

- Success: Shows insert, select, and cleanup logs, e.g.
  ```
  ✅ Inserted test row: null
  ✅ Supabase connectivity OK, test row found: { id: '...' }
  🧹 Test row cleaned up.
  ```
- Failure: Clear error message for missing env vars, insert/select errors, or cleanup issues.

### Why This Matters

- Ensures test environment is safe, isolated, and always ready for CI/CD or local runs.
- Prevents test data buildup in tables.
- Canonical reference for onboarding and troubleshooting.

---

## Centralized Test Environment Setup for Sensitive API Keys

To ensure security and PRD alignment, all tests that use sensitive API keys (such as HUME_API_KEY,
POSTHOG_API_KEY, etc.) must:

1. **Use Dummy/Test Keys Only:**
   - Never use real API keys in test environments. Always use values like 'test_hume_key' or
     'test_posthog_key'.
2. **Import the Centralized Setup:**
   - At the very top of each test file that uses sensitive keys, add:
     ```js
     require('../../../testEnvSetup'); // Adjust path as needed
     ```
   - For TypeScript, use require with an eslint-disable comment if needed.
3. **Log Sanitization:**
   - The setup file automatically sanitizes any log output containing sensitive key names, replacing
     them with '[SANITIZED]'.
4. **Enforcement:**
   - The setup will throw an error if a real (non-test) key is detected in the test environment.

### Example

```js
// At the very top of your test file
require('../../../testEnvSetup');
```

### File Location

- The setup file is located at the project root as `testEnvSetup.js`.

### Why?

- This approach prevents accidental leakage of real API keys, aligns with PRD security requirements,
  and ensures all test output is safe to share or commit.

**All contributors must follow this policy for any new or existing test files.**

---
