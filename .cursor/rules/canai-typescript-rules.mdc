---
description:
globs: frontend/src/**/*.{ts,tsx}, backend/api/src/**/*.{ts}, backend/**/*.{ts}
alwaysApply: false
---
---
description: Enforces TypeScript best practices for reliable code
globs: frontend/src/**/*.{ts,tsx}, backend/api/src/**/*.{ts}, backend/**/*.{ts}
alwaysApply: true
---

# CanAI TypeScript Guidelines

## Purpose
Promote type-safe, maintainable, and efficient TypeScript development for the CanAI Emotional Sovereignty Platform, ensuring alignment with the Product Requirements Document (PRD) while supporting scalability and adaptability.

## Scope
These guidelines apply to all TypeScript code in frontend and backend development, balancing type safety, performance, and developer flexibility to meet PRD requirements.

## Core Principles

### Type Safety
- Enable strict TypeScript settings where feasible to enhance code reliability.
- Use optional chaining and nullish coalescing for safe handling of null values.
- Apply type guards or runtime validation for external data, such as AI responses.
- Prefer specific types (e.g., literals, enums) for constrained value sets, like journey stages.

### Project Structure
- Organize code by feature or domain to support clarity and scalability, guided by PRD architecture.
- Use path aliases to streamline imports and improve readability.
- Group related components, services, and types logically for ease of maintenance.

### Naming Conventions
- Use camelCase for functions and variables, PascalCase for types and interfaces, and SCREAMING_SNAKE_CASE for constants.
- Prefix booleans with descriptive terms (e.g., `is`, `has`) for clarity.
- Align names with functionality, reflecting PRD-defined features or journey stages.

### Code Organization
- Keep files and functions concise, splitting complex modules as needed.
- Use typed objects for functions with multiple parameters to improve readability.
- Place tests near source code or in dedicated directories for consistency.

### Performance
- Optimize rendering with techniques like React Server Components where applicable.
- Memoize computationally expensive operations to reduce overhead.
- Load non-critical components dynamically to improve initial load times.
- Align code with PRD performance targets for response times and reliability.

### Error Handling
- Handle errors in async operations with try/catch or `.catch` patterns.
- Define typed error structures for domain-specific scenarios.
- Ensure error responses are fast and align with PRD performance goals.

### AI Integration
- Validate AI response structures with defined types or schemas.
- Use typed prompt templates and response interfaces for consistency.
- Implement fallback mechanisms for AI service limitations or failures.

### Testing
- Write unit, integration, and end-to-end tests for critical functionality.
- Ensure test isolation to prevent shared state issues.
- Use type-safe utilities and mocks to support robust testing.

### Security and Validation
- Validate inputs using libraries like Zod to ensure data integrity.
- Apply user-scoped Row-Level Security (RLS) for database interactions, per PRD.
- Follow secure coding practices to protect data and prevent vulnerabilities.

### AI-Assisted Development
- Filter AI-generated code to avoid type-related anti-patterns (e.g., `any` usage).
- Encourage advanced type features, like mapped or conditional types, where beneficial.
- Prefer path aliases and named imports in AI-assisted code for consistency.

## Development Workflow
- Define types early to guide feature implementation, particularly for AI outputs.
- Write tests incrementally alongside code development.
- Monitor performance regularly to ensure alignment with PRD goals.
- Adapt practices to project context and evolving requirements.

## Code Review Focus
- Ensure critical paths (e.g., AI generation, payments) are fully typed.
- Verify alignment with PRD functional and performance requirements.
- Check for clear, maintainable code structures.
- Confirm comprehensive error handling.

## Continuous Improvement
- Refine types as AI services or project needs evolve.
- Conduct periodic performance audits to meet PRD targets.
- Adapt guidelines based on developer feedback and project requirements.

## PRD Alignment
- Support PRD Sections 6 (Functional Requirements), 7 (Performance), and 8 (Architecture).
- Prioritize PRD guidance, adapting these guidelines to avoid conflicts.

---

**Created**: June 19, 2025
**Version**: 1.0.0
