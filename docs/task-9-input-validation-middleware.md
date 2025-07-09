# Task 9 Implementation Plan: Input Validation Middleware (Joi & DOMPurify)

---

## Pre-Implementation Checklist

Before beginning any phase of Task 9, ensure the following are addressed to align with the
TaskMaster task and PRD requirements:

- [ ] **Joi and DOMPurify dependencies are installed and up-to-date**:
  - Run `npm install joi dompurify jsdom` in the project root.
  - Verify compatibility with Node.js version (per PRD Section 8.3) and check for vulnerabilities
    using `npm audit`.

- [ ] **Validation schemas are planned for all endpoints**:
  - Target endpoints: `/v1/messages`, `/v1/validate-input`, `/v1/generate-sparks`,
    `/v1/stripe-session`, `/v1/save-progress`, `/v1/intent-mirror`, `/v1/request-revision`,
    `/v1/spark-split`, `/v1/feedback` (PRD Section 5).
  - Include schemas for `body`, `query`, and `params` locations to cover all input types.

- [ ] **Sanitization rules are defined for all user input fields**:
  - Apply DOMPurify to all string fields to prevent XSS (PRD Section 7.2).
  - Consider trimming or normalizing case for fields like `businessName` or `primaryChallenge`.

- [ ] **Custom error handling and logging are designed**:
  - Craft user-friendly, actionable, and empathetic error messages (e.g., "Please enter a valid
    email address") per PRD Section 9.
  - Log errors to PostHog or Sentry for monitoring (PRD Section 8.6).

- [ ] **Regex patterns for business-specific fields are specified**:
  - Define patterns for `businessType` (e.g., `retail|service|tech|creative|other`), `email`,
    `phoneNumber`, `primaryChallenge`, `preferredTone`, and `customTone` (PRD Section 6.2).
  - Store in a reusable `patterns` object in `validation/schemas/common.ts`.

- [ ] **Test suite is planned for valid, invalid, and malicious payloads**:
  - Test valid inputs (e.g., `businessType: "retail"`), invalid inputs (e.g., missing `email`), and
    malicious payloads (e.g., `<script>alert("xss")</script>`) per TaskMaster Subtask 5.
  - Include edge cases like max lengths and special characters.

- [ ] **Rate limiting is configured for validation endpoints**:
  - Use `express-rate-limit` with tailored limits (e.g., 100 req/min for `/v1/validate-input`) per
    PRD Section 7.2.

- [ ] **GDPR/data retention requirements are reviewed**:
  - Validate consent and retention fields for endpoints like `/v1/save-progress` (PRD Section 7.3).
  - Ensure compliance with 24-month data purge (PRD Section 14.1).

- [ ] **Documentation and update process for validation rules is outlined**:
  - Document schemas and patterns in `docs/validation-rules.md`.
  - Define an update process (e.g., PR review) for maintainability.

- [ ] **Integration/regression tests are planned for all protected routes and edge cases**:
  - Cover full user journey (F1–F9, PRD Section 5) with Vitest (PRD Section 13.1).

---

## Purpose & PRD Alignment

This document establishes a secure, reusable input validation and sanitization layer for all API
endpoints, supporting:

- **PRD References**:
  - Section 5: User Journey (F1–F9)
  - Section 6: Functional Requirements (input validation)
  - Section 7.2: Security (XSS prevention)
  - Section 8.3: Platform compatibility
  - Section 8.6: Monitoring/logging
  - Section 9: User experience (error messaging)
  - Section 12: Metrics (trust, error rates)
  - Section 13.1: Testing
  - Section 14.1: Data retention

**Goals**:

- Prevent XSS, SQL injection, and malformed data.
- Deliver clear, empathetic error messages for high trust.
- Ensure GDPR compliance and maintainable validation rules.

---

## Scope & Out of Scope

**In Scope**:

- Joi validation schemas for all API endpoints.
- DOMPurify integration for XSS prevention.
- Reusable middleware with custom error handling.
- Regex patterns for business-specific fields.
- Comprehensive testing with malicious payloads.

**Out of Scope**:

- Frontend validation (handled separately, PRD Section 8.2).
- Non-API input sources.
- Analytics beyond validation errors (PRD Section 8.6).

---

## Architecture Overview

- **Reusable Middleware**: `validateInput` function in `validation/middleware.ts` accepts a Joi
  schema, request location, and sanitize flag.
- **Sanitization Utility**: DOMPurify sanitizes string fields with configurable options.
- **Centralized Schemas**: Regex patterns and rules in `validation/schemas/common.ts`.
- **Error Handling**: Custom `ValidationError` class with user-friendly messages and logging.
- **Testing**: Vitest suite in `tests/validation.test.ts` for all scenarios.

---

## Implementation Phases & Phase Gates

### 1. Validation Middleware & Sanitization Utility

> **Phase Gate**: Confirm Joi and DOMPurify are installed (`npm list joi dompurify jsdom`). Plan
> middleware to handle `body`, `query`, and `params`. Define DOMPurify options (e.g., allowed tags:
> `['b', 'i']`).

**Success Criteria**:

- Middleware validates and sanitizes inputs for all endpoints.
- Invalid inputs trigger custom errors.
- Sanitized data replaces original request data.

**Example**:

```typescript
// routes/funnel.ts
router.post(
  '/v1/validate-input',
  validateInput({ schema: funnelSchema, location: 'body', sanitize: true }),
  (req, res) => {
    res.json({ message: 'Input validated', data: req.body });
  }
);
```

---

### 2. Centralized Schema Patterns & Regex Library

> **Phase Gate**: Define patterns for `email`, `businessType`, `phoneNumber`, `primaryChallenge`,
> `preferredTone`, and `customTone` (PRD Section 6.2). Document in `validation/schemas/common.ts`.

**Success Criteria**:

- Schemas use centralized patterns.
- Patterns are tested with valid/invalid inputs.

**Example**:

```typescript
// validation/schemas/common.ts
import Joi from 'joi';

export const patterns = {
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
  businessType: Joi.string().valid('retail', 'service', 'tech', 'creative', 'other').required(),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .messages({
      'string.pattern.base': 'Please enter a valid phone number',
    }),
  primaryChallenge: Joi.string().min(5).max(50).required().messages({
    'string.min': 'Challenge must be at least 5 characters',
  }),
  preferredTone: Joi.string()
    .valid('warm', 'bold', 'optimistic', 'professional', 'playful', 'inspirational', 'custom')
    .required(),
  customTone: Joi.string()
    .min(1)
    .max(50)
    .when('preferredTone', { is: 'custom', then: Joi.required() }),
};
```

---

### 3. Custom Error Handling & Logging

> **Phase Gate**: Design error format with field, message, and code. Integrate PostHog/Sentry
> logging (PRD Section 8.6).

**Success Criteria**:

- Errors follow a consistent, user-friendly format.
- Validation failures are logged with context.

**Example**:

```typescript
// errors/ValidationError.ts
export class ValidationError extends Error {
  public details: any[];
  public statusCode: number = 400;
  constructor(details: any[]) {
    super('Validation Error');
    this.details = details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message || 'Invalid input',
      code: detail.type,
    }));
  }
}

// middleware/errorHandler.ts
import { posthog } from '../services/posthog';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    posthog.capture({
      event: 'validation_error',
      properties: { endpoint: req.path, errors: err.details },
    });
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: err.details,
      requestId: req.id,
    });
  }
  next(err);
};
```

---

### 4. Rate Limiting & Security Enhancements

> **Phase Gate**: Configure `express-rate-limit` for endpoints like `/v1/validate-input` (100
> req/min). Ensure legitimate users aren't blocked (PRD Section 7.2).

**Success Criteria**:

- Rate limiting prevents abuse.
- Legitimate requests succeed.

**Example**:

```typescript
// security/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const validationRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// routes/funnel.ts
router.post(
  '/v1/validate-input',
  validationRateLimit,
  validateInput({ schema: funnelSchema, location: 'body', sanitize: true }),
  (req, res) => {
    // Handle request
  }
);
```

---

### 5. GDPR/Data Retention Validation

> **Phase Gate**: Review PRD Section 7.3 for consent and retention rules. Plan validation for
> `/v1/save-progress`.

**Success Criteria**:

- Consent is validated and logged.
- Retention periods are enforced.

**Example**:

```typescript
// validation/schemas/gdpr.ts
import Joi from 'joi';

export const personalDataSchema = Joi.object({
  consent: Joi.boolean().valid(true).required().messages({
    'any.only': 'Consent must be explicitly granted',
  }),
  dataRetention: Joi.number().valid(12, 24, 36).required().messages({
    'any.only': 'Invalid data retention period',
  }),
});
```

---

### 6. Testing & Validation

> **Phase Gate**: Plan Vitest test suite for all validation and sanitization logic. Include tests
> for valid, invalid, and malicious payloads (PRD Section 13.1).

**Success Criteria**:

- All validation logic is covered by tests.
- Malicious payloads are rejected and sanitized.
- Test results are documented and used to refine rules.

---

## Best Practices / Nuggets of Gold

- **Centralize Patterns:** Use shared modules for all regex and validation rules.
- **User-Centric Errors:** Provide actionable, empathetic error messages.
- **Sanitize Everything:** Apply DOMPurify to all user input, not just text fields.
- **Consistent Logging:** Log all validation events for monitoring and improvement.
- **Rate Limiting:** Prevent brute-force and abuse without blocking legitimate flows.
- **Documentation:** Keep validation rules and update processes well-documented.
- **Security Audits:** Regularly review validation logic for new threats.
- **Test Coverage:** Ensure all edge cases and attack vectors are tested.

---

## Known Pitfalls & Gotchas

- **Overly Restrictive Validation:** Can frustrate users—balance security and UX.
- **Missing Sanitization:** Leaves XSS/injection vectors open.
- **Inconsistent Error Formats:** Makes debugging and support harder.
- **Unlogged Validation Failures:** Hinders monitoring and improvement.
- **Scope Creep:** Stick to API validation—avoid frontend or analytics scope.
- **No Test Coverage:** Increases risk of regressions and missed vulnerabilities.

---

## Environment Variables: Validation & Security

| Variable Name                | Description                                 |
| ---------------------------- | ------------------------------------------- |
| `POSTHOG_API_KEY`            | PostHog API key for event logging           |
| `SENTRY_DSN`                 | Sentry DSN for error logging                |
| `GDPR_DATA_RETENTION_MONTHS` | Allowed data retention periods (comma list) |

**Best Practices:**

- Use environment variables for all secrets/configuration.
- Document variable locations and update processes.
- Never log or expose secrets in application logs.

---

## Documentation & Update Process

- Document all validation schemas and patterns in `docs/validation-rules.md`.
- Use PR review for all validation rule changes to ensure maintainability and compliance.
- Update documentation whenever schemas or patterns change.

---

## References

- PRD.md (Sections 5, 6, 7.2, 8.3, 8.6, 9, 12, 13.1, 14.1)
- task-8-memberstack-auth-middleware.md (for structure and best practices)
- docs/api/README.md (API documentation)
- docs/project-structure-mapping.md (for file organization)
- Joi, DOMPurify, express-rate-limit documentation
- Sentry, PostHog integration guides

---

**Last updated:** 2025-07-08
