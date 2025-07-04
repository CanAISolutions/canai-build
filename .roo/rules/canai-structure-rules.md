---
description:
globs:
  frontend/src/**/*, backend/**/*, databases/**/*, docs/**/*, packages/**/*, .github/workflows/*
alwaysApply: false
---

---

description: Guides consistent project file and folder organization globs: frontend/src/**/\*,
backend/**/_, databases/\*\*/_, docs/**/\*, packages/**/_, .github/workflows/_ alwaysApply: true

---

# CanAI Structure Guidelines

## Purpose

Foster a scalable, modular, and maintainable codebase for the CanAI Emotional Sovereignty Platform,
ensuring consistency, reusability, and alignment with the Product Requirements Document (PRD).

## Guidelines

### Repository Organization

- Organize the codebase into logical sections for backend, frontend, database, documentation, shared
  utilities, and CI/CD workflows.
- Adapt the structure to project needs while maintaining clarity and PRD alignment.

### Backend Architecture

- Encapsulate business logic in modular services for reusability and testability.
- Keep API route handlers lightweight, delegating logic to services.
- Use middleware to address cross-cutting concerns like authentication and validation.
- Design stateless services with minimal dependencies for scalability.

### Frontend Organization

- Group components by feature, with shared UI elements centralized for reuse.
- Align pages with user journey stages, focusing on presentation logic.
- Centralize API clients and helper functions in utilities for consistency.
- Promote reusable components and hooks to enhance efficiency.

### Naming Conventions

- Use consistent naming for clarity (e.g., kebab-case for directories, PascalCase for components,
  camelCase for functions).
- Align file names with their purpose to improve discoverability.

### Code Organization

- Separate concerns by keeping business logic in services and presentation in components.
- Design modules with single responsibilities to simplify maintenance.
- Ensure clear dependency flows, with routes relying on services and services on infrastructure.
- Build modular code with well-defined interfaces and low coupling.

### AI Code Patterns

- Structure AI services for clarity, separating concerns like content generation and validation.
- Organize AI prompts by feature, ensuring traceability and maintainability.
- Incorporate reliability patterns like async calls and fallbacks for AI integrations.
- Validate AI outputs to meet quality and schema requirements.

### Database Structure

- Use consistent naming conventions and unique identifiers for schemas.
- Separate migrations, access policies, and indexes for clarity.
- Include audit fields, such as timestamps, to track data changes.
- Support flexible data storage where needed, guided by PRD requirements.

### Best Practices

- Avoid deep nesting in utility functions for accessibility.
- Group files by feature to enhance navigation.
- Provide clear, documented interfaces for modules.
- Minimize dependencies to improve maintainability.

### Reusable Patterns

- Apply consistent validation schemas for inputs and outputs.
- Standardize event logging to support analytics.
- Use uniform error handling with clear, user-friendly messages.
- Implement retry logic for external services to ensure reliability.

## Validation

### CI/CD Checks

- Enforce naming and organization standards in CI/CD pipelines.
- Verify code quality through type safety, test coverage, and documentation checks.
- Confirm adherence to reusable patterns for consistency.

### Testing

- Write unit tests for services and utilities to ensure functionality.
- Conduct integration tests to validate API and feature interactions.
- Test file organization and naming for compliance.
- Verify consistent application of reusable patterns.

### Acceptance Criteria

- Codebase follows clear naming and organization conventions.
- Business logic is encapsulated in services, not routes.
- Components adhere to single-responsibility principles.
- AI services incorporate reliability patterns.
- Database schemas align with defined standards.
- Reusable patterns are applied consistently.

## PRD Alignment

- Support PRD requirements for architecture, backend, frontend, and database design.
- Prioritize PRD guidance, adapting these guidelines to avoid conflicts and meet evolving needs.

## Development Principles

- **Modularity**: Create reusable, independent modules.
- **Consistency**: Maintain uniform structure and naming.
- **Quality**: Produce testable, well-documented code.
- **Flexibility**: Design for adaptability to PRD updates.

---

**Created**: June 19, 2025 **Version**: 1.0.0
