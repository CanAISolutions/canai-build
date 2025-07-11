# Validation Rules: API Input Schemas (Task 9.1)

---

## Purpose

Document all Joi validation schemas, shared patterns, and error handling conventions for backend API
endpoints, supporting trust, security, and maintainability per PRD and Task 9.1 implementation plan.

---

## Shared Patterns (backend/schemas/common.js)

- **Email:** Joi.string().email().required()
- **BusinessType:** Joi.string().valid('retail', 'service', 'tech', 'creative', 'other').required()
- **PhoneNumber:** Joi.string().pattern(/^[+][1-9]\d{1,14}$/)
- **PrimaryChallenge:** Joi.string().min(5).max(50).required()
- **PreferredTone:** Joi.string().valid('warm', 'bold', 'optimistic', 'professional', 'playful',
  'inspirational', 'custom').required()
- **CustomTone:** Joi.string().min(1).max(50).when('preferredTone', { is: 'custom', then:
  Joi.required() })
- **Custom Error Messages:** All patterns provide actionable, empathetic error messages.

---

## Endpoint Schemas

### `/v1/messages` (GET)

- **Query:** None (reserved for future)
- **Response:**

  ```json
  {
    "messages": [{ "text": "string", "user_id": "uuid|null" }],
    "error": null
  }
  ```

- **Validation:** No input required. Response schema defined for testing/documentation.

---

### `/v1/validate-input` (POST)

- **Schema:**
  - email (required, valid email)
  - businessType (required, shared pattern)
  - phoneNumber (optional, E.164)
  - primaryChallenge (required, min 5/max 50)
  - preferredTone (required, shared pattern)
  - customTone (required if preferredTone is 'custom')
  - businessName (required, min 3/max 50)
  - targetAudience (required, min 3/max 100)
- **Example Error:**

  ```json
  { "field": "email", "message": "Please enter a valid email address" }
  ```

---

### `/v1/generate-sparks` (POST)

- **Schema:**
  - All fields as in `/v1/validate-input`
  - Used for spark generation (F3)
- **Example Error:**

  ```json
  { "field": "primaryChallenge", "message": "Challenge must be at least 5 characters" }
  ```

---

### `/v1/save-progress` (POST)

- **Schema:**
  - prompt_id (optional, uuid)
  - payload: object with fields:
    - businessName, targetAudience, primaryChallenge, etc. (see above)
    - consent (required, boolean true)
    - dataRetention (required, allowed values: 12, 24, 36)
- **Example Error:**

  ```json
  { "field": "payload.consent", "message": "Consent must be explicitly granted" }
  ```

---

### `/v1/intent-mirror` (POST)

- **Schema:**
  - businessName, targetAudience, primaryGoal, competitiveContext, brandVoice, resourceConstraints,
    currentStatus, businessDescription, revenueModel, planPurpose, location, uniqueValue (all
    required, min/max as per PRD)
- **Example Error:**

  ```json
  { "field": "primaryGoal", "message": "Primary goal is required" }
  ```

---

### `/v1/request-revision` (POST)

- **Schema:**
  - prompt_id (required, uuid)
  - revisionReason (required, min 5/max 200)
  - user_id (required, uuid)
- **Example Error:**

  ```json
  { "field": "revisionReason", "message": "Revision reason must be at least 5 characters" }
  ```

---

### `/v1/spark-split` (POST)

- **Schema:**
  - prompt_id (required, uuid)
  - canaiOutput (required, min 10/max 2000)
  - genericOutput (required, min 10/max 2000)
  - user_id (required, uuid)
- **Example Error:**

  ```json
  { "field": "canaiOutput", "message": "CanAI output must be at least 10 characters" }
  ```

---

### `/v1/feedback` (POST)

- **Schema:**
  - user_id (required, uuid)
  - feedbackText (required, min 5/max 1000)
  - rating (required, integer 1-5)
  - prompt_id (required, uuid)
- **Example Error:**

  ```json
  { "field": "rating", "message": "Rating must be between 1 and 5" }
  ```

---

## Error Handling & Logging

- All validation errors are returned in a consistent, user-friendly format with actionable messages.
- Errors are logged to Sentry/PostHog for monitoring and analytics.
- See `backend/middleware/validation.js` and `docs/task-9-input-validation-middleware.md` for
  details.

---

## References

- [Task 9.1 Implementation Plan](./task-9.1-joi-validation-schemas.md)
- [Input Validation Middleware](./task-9-input-validation-middleware.md)
- PRD.md (Sections 5, 6, 7.2, 9, 12)
- backend/schemas/common.js (shared patterns)

---

**Last updated:** 2025-07-08
