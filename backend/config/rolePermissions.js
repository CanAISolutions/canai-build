// Centralized Role and Scenario Permission Mapping for RBAC
// PRD/Task 8.4 compliant

// List of all roles (expand as needed)
export const ROLES = ['user', 'admin', 'superadmin'];

// Scenario/route permission mapping
// Update as new scenarios/routes are added
export const scenarioPermissions = {
  admin_add_project: ['admin'],
  add_project: ['admin', 'user'],
  emotional_analysis: ['user', 'admin'], // Example for emotionalAnalysis route
  // Add more scenarios/routes as needed
};

// Utility to get required roles for a scenario
export function getRequiredRoles(scenario) {
  return scenarioPermissions[scenario] || [];
}

// Documentation: Update this file to add new roles or scenario mappings.