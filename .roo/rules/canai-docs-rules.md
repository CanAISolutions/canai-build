---
description:
globs:
alwaysApply: true
---

---

description: Principle-based guidelines for documentation in the CanAI Emotional Sovereignty
Platform. globs: alwaysApply: true

---

# CanAI Documentation Guidelines

## Purpose

Provide clear, concise, and maintainable documentation to support the 9-stage user journey (F1-F9),
aligning with PRD goals (Sections 5, 6, 12) and enhancing developer and user experience.

## Scope

Offer flexible guidance for creating and maintaining documentation, ensuring alignment with PRD
objectives, ease of use, and adaptability to project evolution.

## Guiding Principles

### Clarity

- Write concise, accessible documentation for developers and users.
- Avoid jargon and overly technical details unless necessary.

### PRD Alignment

- Map documentation to PRD-defined stages and goals (e.g., user journey, metrics).
- Update documentation to reflect PRD changes.

### Maintainability

- Keep documentation current with project updates.
- Use consistent formats to simplify maintenance.

### Accessibility

- Ensure documentation is easy to navigate and understand.
- Support both technical and non-technical audiences.

## Documentation Structure

### Format

- Use Markdown for consistency and portability.
- Organize into logical categories (e.g., API, developer guides, user guides).
- Name files clearly (e.g., kebab-case) and include metadata (title, purpose, date).

### Key Documentation Areas

- **Project Overview**: Summarize the platform, its goals, and key components.
- **API Reference**: Document endpoints with clear schemas, requests, and responses.
- **Developer Guides**: Provide setup, integration, and troubleshooting steps.
- **User Journey**: Map components and processes to F1-F9 stages.
- **Database**: Describe schemas, access policies, and retention guidelines.

### User Journey Documentation

- Align documentation with the 9-stage journey (F1-F9):
  - **F1: Discovery Hook**: Document trust-building features and interactions.
  - **F2: Discovery Funnel**: Explain input validation and user flows.
  - **F3: Spark Layer**: Cover spark generation and selection processes.
  - **F4: Purchase Flow**: Detail payment integration and checkout.
  - **F5: Input Collection**: Describe input collection and progress saving.
  - **F6: Intent Mirror**: Outline summarization and confidence scoring.
  - **F7: Deliverable**: Document output generation and quality validation.
  - **F8: SparkSplit**: Explain output comparison and preference tracking.
  - **F9: Feedback**: Cover feedback collection and sentiment analysis.
- Use simple diagrams (e.g., flowcharts) to illustrate processes where helpful.

## Implementation Guidance

### Code Documentation

- Include brief, clear comments in code to explain purpose and context.
- Link code to relevant PRD sections and journey stages where applicable.

### API Documentation

- Provide endpoint descriptions, example requests, and responses.
- Highlight authentication, rate limits, and input validation requirements.

### Integrations

- Document connections to external services (e.g., Supabase, Stripe, PostHog).
- Include high-level setup and configuration steps.

### Validation

- Verify code examples and links for accuracy.
- Use linting tools to ensure consistent Markdown formatting.
- Gather feedback from developers to improve usability.

### README

- Include an overview, quick setup guide, journey map, key components, and performance goals.
- Keep it concise and beginner-friendly.

## Quality Assurance

- Regularly update documentation to reflect project changes.
- Ensure documentation remains concise and relevant.
- Validate alignment with PRD and user journey stages.

## Ownership

- **Product Team**: Defines documentation requirements.
- **Backend Team**: Documents APIs and integrations.
- **QA Team**: Verifies accuracy and usability.
- **DevOps Team**: Supports documentation for deployment and monitoring.

## References

- **PRD Sections**: 5 (User Journey), 6 (Requirements), 12 (Metrics).
- **Standards**: Prioritize clarity, PRD alignment, and maintainability.

---

**Created**: June 19, 2025 **Version**: 1.0.0 **Alignment**: PRD Sections 5, 6, 12
