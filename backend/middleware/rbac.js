import Sentry from '../services/instrument.js';
import posthog from '../services/posthog.js';
import { scenarioPermissions } from '../config/rolePermissions.js';

// Utility: Check if user has at least one required role
export function hasRequiredRole(userRoles, requiredRoles) {
  if (!Array.isArray(userRoles) || !Array.isArray(requiredRoles)) return false;
  return userRoles.some(role => requiredRoles.includes(role));
}

// Utility: Scenario-based permission check
export function checkScenarioAccess(user, scenarioName) {
  const userRoles = user?.roles || [];
  // Superadmin override: always allow
  if (userRoles.includes('superadmin')) return true;
  const requiredRoles = scenarioPermissions[scenarioName] || [];
  return hasRequiredRole(userRoles, requiredRoles);
}

// RBAC Middleware: Usage rbacMiddleware(['admin'])
export function rbacMiddleware(requiredRoles = []) {
  return (req, res, next) => {
    const user = req.memberstackUser;
    if (!user || !Array.isArray(user.roles)) {
      const error = {
        error: 'Missing or invalid user context',
        code: 'AUTH_USER_CONTEXT_INVALID',
      };
      try {
        Sentry.captureException(new Error(error.error), { extra: error });
      } catch (e) {
        /* Sentry logging failed, ignore for hygiene */
      }
      posthog.capture({
        distinctId: 'system',
        event: 'rbac_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      return res.status(401).json(error);
    }
    if (!hasRequiredRole(user.roles, requiredRoles)) {
      const error = {
        error: 'User does not have required role(s) for this action',
        code: 'AUTH_ROLE_INSUFFICIENT',
        requiredRoles,
        userRoles: user.roles,
      };
      try {
        Sentry.captureException(new Error(error.error), { extra: error });
      } catch (e) {
        /* Sentry logging failed, ignore for hygiene */
      }
      posthog.capture({
        distinctId: user.userId || 'unknown',
        event: 'rbac_failure',
        properties: { ...error, timestamp: new Date().toISOString() },
      });
      return res.status(403).json(error);
    }
    next();
  };
}

// Documentation: Use rbacMiddleware([roles]) in routes to enforce RBAC.
// Use checkScenarioAccess(user, scenario) for scenario-based checks (e.g., Make.com flows).