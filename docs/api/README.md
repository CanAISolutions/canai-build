# CanAI API Documentation

## Overview

This directory contains API documentation for the CanAI Emotional Sovereignty Platform backend
services.

## CORS Configuration & Environment Variables

The CanAI backend enforces strict CORS (Cross-Origin Resource Sharing) policies to ensure only trusted origins can access protected API endpoints. This is critical for security and compliance with PRD requirements.

### Setting Allowed Origins
- Allowed origins are configured via the `CORS_ORIGIN` environment variable in your `.env` or `.env.example` file.
- This variable should be a comma-separated list of trusted origins (e.g., frontend, Make.com, staging domains).
- Example:
  ```env
  CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://canai.so,https://hook.us1.make.com
  ```
- See `.env.example` in the project root for the latest format and required values.

### How CORS Works in the Backend
- The backend reads `CORS_ORIGIN` and only allows requests from these origins.
- Credentials (cookies, JWTs) are supported for authentication flows.
- Allowed methods: `GET, POST, PUT, DELETE, OPTIONS`
- Allowed headers: `Authorization, x-memberstack-token, x-make-signature, x-make-timestamp, Content-Type, X-Requested-With`
- Preflight (OPTIONS) requests are handled for all protected endpoints.
- See `backend/server.js` for implementation details.

### Error Handling
- Requests from disallowed origins receive a clear CORS error response.
- All CORS errors are logged for monitoring and compliance.

## Contents

- **endpoints.md** - Complete API endpoint documentation
- API schemas and request/response examples
- Authentication and authorization guides
- Rate limiting and error handling documentation

## API Structure

The CanAI API follows RESTful conventions and supports the complete 9-stage user journey:

### Core Endpoints

| Stage | Endpoint              | Purpose                        |
| ----- | --------------------- | ------------------------------ |
| F1    | `/v1/messages`        | Trust indicators and messaging |
| F2    | `/v1/validate-input`  | Funnel input validation        |
| F3    | `/v1/generate-sparks` | Spark generation               |
| F4    | `/v1/stripe-session`  | Payment processing             |
| F5    | `/v1/save-progress`   | Progress tracking              |
| F6    | `/v1/intent-mirror`   | Intent validation              |
| F7    | `/v1/deliverable`     | Content generation             |
| F8    | `/v1/spark-split`     | Comparison analysis            |
| F9    | `/v1/feedback`        | Feedback capture               |

## Authentication

All API endpoints require authentication via Memberstack JWT tokens.

## Rate Limiting

- 100 requests per minute per IP address
- 1000 requests per hour per authenticated user

## Error Handling

All API responses follow a consistent error format with appropriate HTTP status codes.

---

## Role-Based Access Control (RBAC)

The CanAI backend uses a robust Role-Based Access Control (RBAC) system to ensure only users with appropriate permissions can access protected routes and features. This system is fully aligned with PRD requirements and validated by comprehensive unit and integration tests (as of July 7, 2024).

### Role Hierarchy & Permission Mapping
- **Roles:** `user`, `admin`, `superadmin` (expandable)
- **Permission mapping:** Centralized in [`backend/config/rolePermissions.js`](../../backend/config/rolePermissions.js)
  - Example: `emotional_analysis: ['user', 'admin']`
- **Scenario-based permissions:** Use the exported `scenarioPermissions` object for dynamic lookups

### Using the RBAC Middleware
- **Middleware:** `rbacMiddleware(requiredRoles)` from [`backend/middleware/rbac.js`](../../backend/middleware/rbac.js)
- **Usage in routes:**
  ```js
  import { rbacMiddleware } from '../middleware/rbac.js';
  // ...
  router.post('/analyze-emotion', authMiddleware, rbacMiddleware(['user', 'admin']), handler);
  ```
- **Scenario-based check:**
  ```js
  import { checkScenarioAccess } from '../middleware/rbac.js';
  // ...
  if (!checkScenarioAccess(req.memberstackUser, 'emotional_analysis')) {
    // handle insufficient permissions
  }
  ```

### Error Handling & Logging
- **401 Unauthorized:** Returned if user context is missing or invalid
- **403 Forbidden:** Returned if user lacks required role(s)
- **Error codes:** `AUTH_USER_CONTEXT_INVALID`, `AUTH_ROLE_INSUFFICIENT`
- **Logging:** All unauthorized access attempts are logged to Sentry and PostHog with structured codes for observability and compliance
- **Example error response:**
  ```json
  {
    "error": "User does not have required role(s) for this action",
    "code": "AUTH_ROLE_INSUFFICIENT",
    "requiredRoles": ["user", "admin"],
    "userRoles": ["guest"]
  }
  ```

### Updating Roles and Permissions
- To add or change roles, edit [`backend/config/rolePermissions.js`](../../backend/config/rolePermissions.js)
- To update scenario/route permissions, modify the exported `scenarioPermissions` object
- All changes are immediately reflected in RBAC logic and tests

### References
- [`backend/middleware/rbac.js`](../../backend/middleware/rbac.js) (middleware and utilities)
- [`backend/config/rolePermissions.js`](../../backend/config/rolePermissions.js) (role and scenario mapping)
- [`backend/tests/unit/memberstack.test.js`](../../backend/tests/unit/memberstack.test.js) (unit tests for RBAC)
- [`docs/task-8.4-rbac-implementation-plan.md`](../task-8.4-rbac-implementation-plan.md) (implementation plan)

### Example Usage in a Route
```js
import { rbacMiddleware } from '../middleware/rbac.js';
router.post('/analyze-emotion', authMiddleware, rbacMiddleware(['user', 'admin']), handler);
```

### Validation
- All RBAC failures (401/403) are logged to Sentry and PostHog
- This is fully validated by passing unit and integration tests as of July 7, 2024

[🏠 Back to Docs](../README.md) | [📖 Full API Specification](../api-contract-specification.md)
