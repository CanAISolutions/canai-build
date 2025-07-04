# Supabase Integration Test Plan

**Location:** `backend/supabase/integration-test-plan.md`

---

## Purpose

To ensure the Supabase schema, migrations, and backend API services are fully production-ready and
compliant with the real-world requirements of `PRD.md`. This plan defines end-to-end integration
tests for all core tables and flows, validating CRUD, RLS, business logic, audit, and retention
requirements using real API endpoints.

---

## 1. Test Objectives & PRD Alignment

- **Verify**: All tables, constraints, indexes, and RLS policies are enforced as intended.
- **Test**: Real CRUD operations via backend API endpoints (not just direct DB access).
- **Simulate**: Real user flows and edge cases (including security, multi-user, and error
  scenarios).
- **Comply**: All tests must map to PRD.md requirements (e.g., F1-F9 journey, security, audit,
  retention, business logic).

---

## 2. Test Coverage Matrix

For each table (e.g., `prompt_logs`, `spark_logs`, `comparisons`, `feedback_logs`, `payment_logs`,
etc.):

| Area               | Example Test Cases                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **CRUD**           | Create, Read, Update, Delete (where allowed by RLS/policies)                               |
| **RLS**            | Only owner can access/modify; admin/support override; unauthorized access is blocked       |
| **Constraints**    | Required fields, value ranges, unique constraints, foreign keys, check constraints         |
| **Indexes**        | Query performance (optional, but can check index usage in explain plans)                   |
| **Audit/Triggers** | Audit logs are written for all changes (where required)                                    |
| **Retention**      | Data older than 24 months is deleted (simulate with time travel or direct DB manipulation) |
| **Security**       | Sensitive fields are not exposed to unauthorized users                                     |
| **Business Logic** | E.g., payment status cannot be changed after completion, feedback rating in 1-5, etc.      |

---

## 3. Test Implementation Approach

- **Framework**: Use [Vitest](https://vitest.dev/) or [Jest](https://jestjs.io/) for integration
  tests.
- **API Layer**: Use backend API endpoints for all operations (no direct DB writes/reads in tests
  except for setup/teardown).
- **Test Data**: Use test users with different roles (user, admin, support).
- **Isolation**: Use a test database or Supabase project, reset state before each test suite.
- **Validation**: Assert both API responses and DB state (using Supabase client if needed).

---

## 4. Test Suite Structure

**Directory:**  
`backend/tests/integration/supabase/`

**Files:**

- `prompt-logs.integration.test.ts`
- `spark-logs.integration.test.ts`
- `comparisons.integration.test.ts`
- `feedback-logs.integration.test.ts`
- `payment-logs.integration.test.ts`
- `support-requests.integration.test.ts`
- `rls-policies.integration.test.ts`
- `audit-logs.integration.test.ts`
- `retention.integration.test.ts`

---

## 5. Example Test Case Design

### A. prompt-logs.integration.test.ts

- **Create Prompt Log**:
  - POST `/api/prompt-logs` as user → expect 201, record created, fields validated.
- **Read Own Prompt Log**:
  - GET `/api/prompt-logs/:id` as owner → expect 200, correct data.
- **Read Others' Prompt Log**:
  - GET `/api/prompt-logs/:id` as another user → expect 403/404.
- **Update Prompt Log**:
  - PATCH `/api/prompt-logs/:id` as owner → expect 200, updated_at changes.
- **Delete Prompt Log**:
  - DELETE `/api/prompt-logs/:id` as owner → expect 204, record gone.
- **RLS Enforcement**:
  - Try all above as unauthenticated → expect 401/403.
- **Constraint Violations**:
  - POST with missing/invalid fields → expect 400, error message.
- **Audit Log**:
  - After create/update/delete, check `audit_logs` for entry.

### B. payment-logs.integration.test.ts

- **Create Payment**:
  - POST `/api/payments` as user → expect 201, record created.
- **Update Payment (Immutable Fields)**:
  - PATCH `/api/payments/:id` to change amount/currency → expect 400/error.
- **RLS**:
  - GET `/api/payments/:id` as another user → expect 403/404.
- **Admin Access**:
  - GET `/api/payments/:id` as admin → expect 200.
- **Audit Log**:
  - Check audit log for all changes.

### C. rls-policies.integration.test.ts

- **Test all RLS policies** for each table, including admin/support overrides.

### D. retention.integration.test.ts

- **Simulate old data** (manually set created_at) → run retention function → assert old data is
  deleted.

---

## 6. Test Utilities

- **Supabase Client**: Use the official JS client for direct DB checks if needed.
- **API Client**: Use [supertest](https://github.com/ladjs/supertest) or
  [axios](https://axios-http.com/) for HTTP requests.
- **User Auth**: Use test JWTs or Supabase auth for simulating different roles.

---

## 7. PRD.md Mapping

- **Before each test suite**, reference the relevant PRD.md section (e.g., F5: Input Collection for
  prompt_logs, F4: Purchase Flow for payment_logs).
- **After each suite**, assert that the real-world user journey and business requirements are met
  (not just technical CRUD).

---

## 8. Documentation & Reporting

- **Document**: Each test file should have a header mapping it to PRD.md and schema requirements.
- **Output**: Generate a test report (e.g., with Vitest/Jest reporters).
- **Update**: After running tests, update `docs/project-structure-mapping.md` and `cortex.md` with
  new/changed files and test coverage.

---

## 9. Next Steps

1. **Confirm**: Is this the level of detail and coverage you want? Any specific flows or edge cases
   to emphasize?
2. **Implement**: Scaffold the first test file (e.g., `prompt-logs.integration.test.ts`) as a
   template for the rest.
3. **Automate**: Add to CI/CD pipeline for every migration/deployment.

---

**Maintainer:** [Your Name] **Created:** [Date] **Last Updated:** [Date]
