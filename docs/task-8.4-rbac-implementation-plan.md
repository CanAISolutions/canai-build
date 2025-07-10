# Task 8.4 Implementation Plan: Role-Based Access Control (RBAC) for Memberstack JWTs

---

## Purpose

Implement a secure, maintainable, and PRD-aligned Role-Based Access Control (RBAC) system for the
CanAI backend, leveraging roles extracted from Memberstack JWTs. This ensures that only users with
appropriate permissions can access protected routes and features, supporting both frontend and
automation (Make.com) flows.

---

## Progress Checklist

- [x] 1. Define role hierarchy and permission mapping (scenarios, routes, actions)
- [x] 2. Implement RBAC middleware to enforce required roles on protected routes
- [x] 3. Create reusable permission-checking utilities
- [x] 4. Integrate RBAC checks into at least one protected route (e.g., emotionalAnalysis)
- [x] 5. Add/expand unit and integration tests for RBAC logic and edge cases
- [x] 6. Document RBAC structure, usage, and error handling in backend docs
- [x] 7. Ensure all unauthorized access attempts are logged to Sentry/PostHog with structured codes
- [x] 8. Provide a flexible system for updating roles and permissions as requirements evolve

---

## Implementation Steps

### 1. **Role Hierarchy & Permission Mapping**

- Centralized in `backend/config/rolePermissions.js`.
- Roles: `user`, `admin`, `superadmin` (expandable).
- Scenario/route mapping: e.g., `emotional_analysis: ['user', 'admin']`.
- Utility: `getRequiredRoles(scenario)` for dynamic lookups.

### 2. **RBAC Middleware**

- Implemented in `backend/middleware/rbac.js`.
- Middleware: `rbacMiddleware(requiredRoles)` checks `req.memberstackUser.roles`.
- Logs unauthorized attempts to Sentry/PostHog with structured codes.
- Returns `{ code: 'AUTH_ROLE_INSUFFICIENT' }` on failure.

### 3. **Permission-Checking Utilities**

- `hasRequiredRole(userRoles, requiredRoles)` for generic checks.
- `checkScenarioAccess(user, scenarioName)` for scenario-based checks (Make.com, etc).

### 4. **Route Integration**

- `/analyze-emotion` route in `backend/routes/emotionalAnalysis.js` now uses
  `rbacMiddleware(['user', 'admin'])` after `auth` middleware.
- Ensures only users with correct roles can access the endpoint.

---

## Notes / Decisions

- All role and scenario mappings are centralized for maintainability.
- Middleware and utilities are reusable and documented in code.
- Logging and error handling follow PRD and Task 8.4 conventions.
- Next: Expand tests and backend docs, then validate logging and flexibility.

---

## Alignment with PRD & MVP

- **Strictly follows** `docs/task-8-memberstack-auth-middleware.md` and PRD.md requirements for
  RBAC, security, and user journey support.
- **Supports both frontend and Make.com automation flows**.
- **Ensures maintainable, testable, and extensible RBAC logic**.

---

## References

- `backend/middleware/auth.js` (user context extraction)
- `docs/task-8-memberstack-auth-middleware.md` (RBAC, scenario mapping)
- `backend/tests/unit/memberstack.test.js` (add/expand tests for RBAC)
- PRD.md (Sections 6, 8.3, 8.5, 14)
- Memberstack JWT documentation

---

## Updating Roles and Permissions

- To add or change roles, edit `backend/config/rolePermissions.js`.
- To update scenario/route permissions, modify the exported `scenarioPermissions` object.
- All changes are immediately reflected in RBAC logic and tests.
- See backend docs and this file for further details.

---

## Logging and Flexibility Validation

- All RBAC failures (401/403) are logged to Sentry and PostHog (see tests and code).
- **This is now fully validated by passing unit and integration tests as of July 7, 2024.**
- Flexibility is validated by dynamic tests and centralized config.

---

**Last updated:** July 7, 2024
