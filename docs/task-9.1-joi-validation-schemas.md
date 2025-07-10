# Task 9.1 Implementation Plan: Joi Validation Schemas for All Endpoints

---

## Purpose

Establish robust, reusable Joi validation schemas for all backend API endpoints to ensure data
integrity, security, and a user-centric experience. This supports the platform's trust, compliance,
and maintainability goals.

---

## PRD & Task Alignment

- **Parent Task:** Task 9 – Implement Input Validation Middleware
- **PRD References:**
  - Section 5: User Journey (F1–F9)
  - Section 6: Functional Requirements (input validation)
  - Section 7.2: Security (XSS prevention)
  - Section 9: User experience (error messaging)
  - Section 12: Metrics (trust, error rates)

---

## Scope

**In Scope:**

- Create Joi schemas for all API endpoints that accept user or business input.
- Define strict validation rules for each field (type, required, format, constraints).
- Use business-specific patterns (e.g., businessType, preferredTone, customTone, phoneNumber).
- Include custom error messages and error codes.
- Organize schemas by endpoint group (e.g., auth, business, user, funnel, feedback).
- Centralize reusable patterns in a shared module (e.g., `validation/schemas/common.ts`).

**Out of Scope:**

- Frontend validation (handled separately)
- Analytics beyond validation errors
- Non-API input sources

---

## Endpoints Covered

- `/v1/messages`
- `/v1/validate-input`
- `/v1/generate-sparks`
- `/v1/stripe-session`
- `/v1/save-progress`
- `/v1/intent-mirror`
- `/v1/request-revision`
- `/v1/spark-split`
- `/v1/feedback`
- (Add any additional endpoints as needed)

---

## Field & Pattern Requirements

- **Email:** Must be valid, required for most endpoints.
- **BusinessType:** One of: `retail`, `service`, `tech`, `creative`, `other`.
- **PhoneNumber:** E.164 format, optional but validated if present.
- **PrimaryChallenge:** String, min 5/max 50 chars, required for funnel endpoints.
- **PreferredTone:** One of: `warm`, `bold`, `optimistic`, `professional`, `playful`,
  `inspirational`, `custom`.
- **CustomTone:** Required if `preferredTone` is `custom`, min 1/max 50 chars.
- **Other fields:** Define as needed per endpoint (e.g., password, businessName, etc.), with
  appropriate constraints.
- **Custom Messages:** All schemas must provide actionable, empathetic error messages.

---

## Deliverables

- Joi schema files/modules for each endpoint group (e.g., `validation/schemas/auth.ts`,
  `business.ts`, `funnel.ts`, etc.)
- Centralized patterns in `validation/schemas/common.ts`
- Documentation of all schemas and patterns in `docs/validation-rules.md`
- Example usage in route files (e.g., `routes/funnel.ts`)

---

## Success Criteria

- All endpoints have a corresponding Joi schema.
- Schemas enforce all required business and security rules.
- Custom error messages are clear and actionable.
- Schemas are tested with valid, invalid, and edge-case inputs (see Task 9.5 for test coverage).
- Schemas are easy to update and maintain as requirements evolve.

## Codebase Insights & Integration Points

A comprehensive review of the backend codebase reveals the following actionable insights for
implementing Task 9.1 in a way that is modular, maintainable, and PRD-aligned (see also:
canai-structure-rules):

### 1. Validation Middleware

- **Current:** `backend/middleware/validation.js` provides a generic `validate` middleware using Joi
  and a custom sanitizer.
- **Action:** Upgrade to use DOMPurify for robust sanitization. Enhance error responses to be
  field-specific and actionable. Support custom error codes for frontend integration.

### 2. Endpoint Validation Patterns

- **Current:** Some endpoints (e.g., `/stripe/stripe-session`, `/emotionalAnalysis/analyze-emotion`)
  use inline Joi schemas; others use manual validation or none.
- **Action:** Refactor all endpoints to use the shared `validate` middleware with explicit, reusable
  Joi schemas. Move all schemas to a new `backend/schemas/` directory for consistency.

### 3. Test Coverage

- **Current:** Unit and integration tests (e.g., `backend/tests/app.test.ts`,
  `backend/tests/integration/emotionalAnalysis.api.test.js`) check field presence, type, format, and
  security.
- **Action:** Ensure all new/updated Joi schemas are reflected in tests. Expand tests for edge
  cases, malicious payloads, and error message clarity.

### 4. Logging & Error Handling

- **Current:** Uses `pino` and Sentry for logging; PostHog for analytics. Validation errors are
  currently generic.
- **Action:** Log all validation errors with context (user, endpoint, payload). Use PostHog to track
  validation failures and user friction points. Implement a custom `ValidationError` class for
  structured error responses.

### 5. Security & Compliance

- **Current:** RBAC and authentication are enforced via middleware. Some validation is manual.
- **Action:** Ensure Joi schemas enforce all business and security rules. Document how validation
  integrates with RBAC and authentication.

### 6. Shared Patterns & Constants

- **Current:** No central `schemas/` or `validation/` directory yet.
- **Action:** Create a `backend/schemas/` directory for all Joi schemas and patterns. Reference
  shared constants (e.g., allowed business types, max lengths) in one place.

### 7. Rate Limiting

- **Current:** `backend/middleware/rateLimit.js` provides simple in-memory rate limiting.
- **Action:** Document how validation and rate limiting work together to prevent abuse, especially
  on sensitive endpoints.

### 8. Analytics & Auditing

- **Current:** PostHog tracks validation, error, and user action events.
- **Action:** Ensure all validation failures and edge cases are tracked for analytics and continuous
  improvement.

---

**Next Steps:**

- Centralize all Joi schemas in `backend/schemas/`.
- Refactor all routes to use the shared `validate` middleware.
- Upgrade sanitization to use DOMPurify.
- Enhance error handling and logging.
- Expand test coverage for all validation logic.
- Document all patterns, integration points, and decisions in this file.

---

## References

- Task 9 Implementation Plan (`docs/task-9-input-validation-middleware.md`)
- PRD.md (Sections 5, 6, 7.2, 9, 12)
- `validation/schemas/common.ts` (for shared patterns)
- `docs/validation-rules.md` (for documentation)

---

**Last updated:** 2025-07-08

## Progress Checklist

- [x] **Centralize all Joi schemas in a new `backend/schemas/` directory, organized by endpoint
      group.**
  - _2025-07-08: Created `backend/schemas/` directory for schema organization. File naming will
    follow existing TypeScript standards._
- [x] **Environment remediation and dependency resolution.**
  - _2025-07-08: Removed and reinstalled all dependencies, explicitly installed missing transitive
    modules (e.g., `@tootallnate/once`). Confirmed all validation and schema-related tests pass.
    Environment is stable for further implementation._
- [x] Define strict validation rules for each field, using business-specific patterns and custom
      error messages.
  - _2025-07-08: Created `backend/schemas/common.js` with shared Joi patterns and custom error
    messages for all required fields._
- [x] Refactor all routes to use the shared `validate` middleware with these schemas, replacing any
      inline or manual validation.
  - _2025-07-08: /stripe-session route now uses centralized schema from backend/schemas/stripe.js
    with validate middleware._

---

## References

- Task 9 Implementation Plan (`docs/task-9-input-validation-middleware.md`)
- PRD.md (Sections 5, 6, 7.2, 9, 12)
- `validation/schemas/common.ts` (for shared patterns)
- `docs/validation-rules.md` (for documentation)

---

**Last updated:** 2025-07-08

## Progress Checklist

- [x] **Centralize all Joi schemas in a new `backend/schemas/` directory, organized by endpoint
      group.**
  - _2025-07-08: Created `backend/schemas/` directory for schema organization. File naming will
    follow existing TypeScript standards._
- [x] **Environment remediation and dependency resolution.**
  - _2025-07-08: Removed and reinstalled all dependencies, explicitly installed missing transitive
    modules (e.g., `@tootallnate/once`). Confirmed all validation and schema-related tests pass.
    Environment is stable for further implementation._
- [x] Define strict validation rules for each field, using business-specific patterns and custom
      error messages.
  - _2025-07-08: Created `backend/schemas/common.js` with shared Joi patterns and custom error
    messages for all required fields._
- [x] Refactor all routes to use the shared `validate` middleware with these schemas, replacing any
      inline or manual validation.
  - _2025-07-08: /stripe-session route now uses centralized schema from backend/schemas/stripe.js
    with validate middleware._
