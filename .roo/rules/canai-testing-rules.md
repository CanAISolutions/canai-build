---
description:
globs: backend/tests/**/*.{test.js}, frontend/src/tests/**/*.{test.tsx,ts}
alwaysApply: false
---

---

description: Enforces comprehensive testing strategies globs: backend/tests/**/\*.{test.js},
frontend/src/tests/**/\*.{test.tsx,ts} alwaysApply: true

---

# CanAI Testing Guidelines

## Purpose

Promote robust testing for the CanAI Emotional Sovereignty Platform to ensure quality, reliability,
and alignment with the 9-stage user journey and Product Requirements Document (PRD).

## Guidelines

### Testing Strategy

- Focus unit tests on backend logic, AI services, and frontend components.
- Validate API endpoints, integrations, and database interactions through integration tests.
- Test complete user journeys and cross-browser compatibility with end-to-end tests.
- Prioritize unit tests while ensuring critical paths are covered by integration and E2E tests.

### Coverage Goals

- Aim for high test coverage across all test types to ensure reliability.
- Fully cover critical paths, such as AI outputs and payment flows.
- Regularly review coverage reports to identify gaps.

### Test Organization

- Group backend tests by domain (e.g., routes, services) for clarity.
- Organize frontend tests by user journey stage or component.
- Use descriptive, PRD-aligned naming to reflect test purpose and context.

### AI Testing

- Test AI service functions, prompts, and quality metrics at the unit level.
- Validate AI pipelines from input to output, including fallback mechanisms.
- Check AI outputs for accuracy, consistency, and resilience against edge cases.
- Ensure AI generation meets performance and quality targets, such as resonance or trust scores.

### Scenario Testing

- Validate functionality for PRD-defined use cases, such as business plans or campaigns.
- Test edge cases, timeouts, and error recovery scenarios.
- Aim for high pass rates, prioritizing critical scenarios.

### Testing Tools

- Use tools like Jest or Vitest for backend unit tests, Supertest for APIs, and Locust for load
  testing.
- Leverage Vitest, React Testing Library, and Cypress for frontend and E2E testing.
- Employ accessibility tools like axe-core to ensure WCAG compliance.
- Configure mocking and coverage tools to support efficient testing.

### Accessibility

- Ensure user-facing components meet WCAG 2.2 AA standards for accessibility.
- Run automated accessibility tests to verify compliance.

### Load Testing

- Simulate high user loads to verify system scalability.
- Target low response times and minimal errors under stress.
- Focus on critical endpoints and AI services during load tests.

### CI/CD Integration

- Automate test execution in CI/CD pipelines for consistency.
- Enforce coverage and quality thresholds to prevent regressions.
- Optimize test runs with techniques like sharding or caching.

### Test Data

- Use consistent, scenario-based test data for reproducibility.
- Isolate test environments with mocked services to avoid interference.
- Ensure tests clean up residual data to maintain integrity.

## Validation

### CI/CD Checks

- Verify test coverage meets defined targets.
- Track test pass/fail rates and execution performance.
- Enforce quality standards before deployment.

### Monitoring

- Log test metrics, including completion rates and failures, for analysis.
- Track test-related errors to support debugging.
- Monitor test execution efficiency to optimize workflows.

## Quality Standards

- Apply high-quality standards to test code, matching production code rigor.
- Document complex test scenarios for clarity and maintenance.
- Regularly refine test suites based on feedback and project evolution.

## Development Principles

- **Test-Driven**: Write tests to guide feature development.
- **Behavior-Focused**: Prioritize testing user-facing functionality.
- **Efficiency**: Optimize tests for speed and resource use.
- **Flexibility**: Adapt tests to meet evolving PRD requirements.

## PRD Alignment

- Support PRD requirements for testing, performance, and accessibility.
- Align with quality and user journey specifications in the PRD.
- Prioritize PRD guidance, adapting these guidelines to avoid conflicts.

---

**Created**: June 19, 2025 **Version**: 1.0.0
