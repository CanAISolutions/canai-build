# Task 8.3 Implementation Plan: Token Refresh Logic for Memberstack JWTs

---

## Purpose

Implement a secure, robust, and PRD-aligned token refresh mechanism for Memberstack JWTs, ensuring all authenticated sessions can be refreshed seamlessly, with a strict 1-hour expiry policy. This plan is MVP-focused and directly maps to the requirements in `docs/task-8-memberstack-auth-middleware.md` and PRD.md.

---

## Progress Checklist

- [x] 1. Implement refresh token endpoint (POST `/refresh-token`)
- [x] 2. Detect tokens nearing expiration (within 5 minutes)
- [x] 3. Request new tokens from Memberstack API
- [x] 4. Handle refresh failures gracefully (error codes, logging)
- [x] 5. Update client-side tokens seamlessly (response structure)
- [x] 6. Add/expand unit and integration tests for refresh logic
- [x] 7. Document refresh flow and error handling in backend docs
- [x] 8. **Enforce rate limiting and protection on the refresh endpoint**
- [x] 9. **Ensure all errors and events are logged to Sentry/PostHog using the same conventions as the main middleware**

---

## Implementation Steps

### 1. **Refresh Token Endpoint**

- Create a POST `/refresh-token` endpoint.
- Accepts `{ refreshToken }` in the request body.
- Validates the refresh token format and presence.
- **Apply rate limiting middleware** to prevent abuse (see existing rateLimit middleware).
- **Log all requests and errors to Sentry/PostHog** using the same conventions as `backend/middleware/auth.js`.

**Decision:**
- Created a new route file `backend/routes/auth.js` and mounted it at `/v1/auth` for clarity and separation of authentication endpoints. The `/refresh-token` endpoint is now available at `/v1/auth/refresh-token`.

### 2. **Token Expiry Detection**

- Added a reusable utility `isTokenExpiringSoon(token, windowSeconds)` in `backend/middleware/jwtUtils.js`.
- This function decodes the JWT, checks the `exp` claim, and returns true if the token will expire within 5 minutes (default window).
- This utility will be used in the refresh logic and can be reused elsewhere for consistent expiry checks.

### 3. **Request New Token from Memberstack**

- The endpoint uses axios to POST to Memberstack's refresh API and returns the new accessToken on success.

### 4. **Error Handling & Logging**

- All error cases (missing/invalid token, Memberstack API error, no accessToken, rate limiting, internal errors) are handled with structured codes and logged to Sentry/PostHog.

### 5. **Client-Side Token Update**

- On success, the endpoint returns `{ accessToken }` for the client to update its session.

### 6. **Testing & Integration**

- Unit and integration tests now cover all success, failure, and edge cases for the refresh endpoint and expiry utility.
- The endpoint is fully covered by tests and error handling as per MVP and PRD requirements.

### 7. **Documentation**

- The backend API documentation (`docs/api/emotional-analysis.md`) now includes the `/v1/auth/refresh-token` endpoint, request/response structure, error codes, and references to this plan and the main middleware documentation, as required by the PRD and MVP.

---

## Alignment with PRD & MVP

- Strictly follows `docs/task-8-memberstack-auth-middleware.md` and PRD.md requirements for authentication, session management, and error handling.
- Ensures secure, reliable, and maintainable token refresh logic for all authenticated sessions.

---

## Notes / Decisions

- No advanced refresh flows or analytics (MVP only).
- All error responses use structured codes for easier debugging (e.g., `AUTH_TOKEN_REFRESH_FAILED`).
- Logging is centralized (Sentry/PostHog) and must match the conventions in `backend/middleware/auth.js`.
- All changes are PRD-aligned and documented here for traceability.
- **User context structure:**
  ```js
  {
    userId: <string>,
    email: <string>,
    roles: <array>,
    customFields: <object>
  }
  ```
- **Error codes:** Use the same conventions as the main middleware (e.g., `AUTH_TOKEN_MISSING`, `AUTH_TOKEN_EXPIRED`, `AUTH_TOKEN_REFRESH_FAILED`).

---

## References

- `backend/middleware/auth.js` (JWT validation, user context extraction, error handling)
- `backend/tests/unit/memberstack.test.js` (unit tests and coverage expectations)
- `docs/task-8-memberstack-auth-middleware.md` (Token Refresh Logic section)
- PRD.md (Sections 6, 8.3, 8.5, 14)
- Memberstack JWT documentation

---

**Last updated:** {{DATE}}