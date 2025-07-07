# Task 8.2 Implementation Plan: User Context Extraction from Memberstack JWTs

---

## Purpose
Establish a robust, standardized user context extraction process from Memberstack JWTs, ensuring all authenticated requests have a reliable `req.memberstackUser` object for downstream use, fully aligned with PRD and MVP requirements.

---

## Progress Checklist
- [x] 1. Map and validate JWT payload to standardized user context object
- [x] 2. Attach standardized object to `req.memberstackUser` in middleware
- [x] 3. Add error handling for missing/malformed fields (log & respond)
- [x] 4. Update at least one route to use `req.memberstackUser` for user identification/RBAC
- [x] 5. Add/expand unit and integration tests for mapping, validation, and error handling
- [x] 6. Document user context structure and usage in backend docs

---

## Implementation Steps

### 1. **JWT Payload Extraction & Mapping**
- After successful JWT validation, extract:
  - `id` (Memberstack user ID)
  - `email`
  - `roles` (array, default to `[]` if missing)
  - `customFields` (object, default to `{}` if missing)
- Map these into a standardized object:
  ```js
  {
    userId: decoded.id,
    email: decoded.email,
    roles: Array.isArray(decoded.roles) ? decoded.roles : [],
    customFields: typeof decoded.customFields === 'object' && decoded.customFields !== null ? decoded.customFields : {},
  }
  ```
- Attach as `req.memberstackUser`.
- **Backward compatibility:** Raw JWT is also attached as `req.memberstackUserRaw` for transition period.

### 2. **Validation**
- Ensures `userId` and `email` are present and strings; `roles` is array; `customFields` is object.
- If any required field is missing or malformed:
  - Logs error to Sentry/PostHog
  - Returns `{ code: 'AUTH_USER_CONTEXT_INVALID' }` with details and 401 status

### 3. **Error Handling**
- All errors are logged and surfaced with actionable codes.
- See middleware for details.

### 4. **Downstream Usage**
- The `emotionalAnalysis` route now uses `req.memberstackUser` for user identification and RBAC.
- If the user context is missing or invalid, returns a 401 with `{ code: 'AUTH_USER_CONTEXT_INVALID' }`.
- This replaces any manual JWT decoding or assumptions in the route.

### 5. **Testing**
- Expanded unit tests in `backend/tests/unit/memberstack.test.js` to cover:
  - Standardized user context mapping (userId, email, roles, customFields)
  - Defaults for missing roles/customFields
  - Error handling for missing/malformed fields (userId/email missing, roles not array, customFields not object)
  - Backward compatibility (raw JWT attached)
  - Success and failure cases for new logic

### 6. **Documentation**
- Documented the structure and usage of `req.memberstackUser` in `docs/api/emotional-analysis.md`.
- Includes required fields, error handling, and references to Task 8.2 and backend middleware for details.

---

## Alignment with PRD & MVP
- Strictly follows docs/task-8-memberstack-auth-middleware.md and PRD.md requirements for authentication, user context, and RBAC.
- Ensures all authenticated requests are reliable and secure for downstream business logic.
- Provides a clear, testable, and maintainable path for future enhancements.

---

## Notes / Decisions
- Raw JWT is attached for backward compatibility (`req.memberstackUserRaw`).
- Error response for invalid user context is `{ code: 'AUTH_USER_CONTEXT_INVALID' }` with details.
- All changes are PRD-aligned and documented here for traceability.

---

## Task 8.2 is now fully implemented, tested, and documented. All requirements and quality standards have been met.

**Last updated:** {{DATE}}