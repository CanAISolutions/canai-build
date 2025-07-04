---
description:
globs: backend/api/src/**/*.ts, backend/routes/*.js, backend/services/*.js
alwaysApply: false
---

---

description: Guides REST API design and implementation globs: backend/api/src/\*_/_.ts,
backend/routes/_.js, backend/services/_.js alwaysApply: false

---

# CanAI API Guidelines

## Purpose

Guide the development of REST APIs that are developer-friendly, performant, and aligned with the
CanAI Emotional Sovereignty Platform’s 9-stage user journey (F1-F9), supporting PRD objectives
(Sections 3, 8.6, 12) while fostering user trust and engagement.

## Scope

Provide flexible, high-level guidance for creating APIs that integrate with services like Stripe and
Supabase, prioritizing PRD alignment, adaptability, and ease of use.

## Guiding Principles

### PRD Alignment

- Design APIs to support PRD-defined goals, such as trust, engagement, and conversion.
- Adapt to evolving PRD requirements and user needs.

### Performance

- Aim for low-latency responses to enhance user experience.
- Optimize for scalability to handle growing user demand.

### User Trust

- Craft responses that promote emotional resonance and reliability.
- Ensure transparency in error handling and data usage.

### Simplicity

- Create intuitive endpoints that are easy for developers to integrate.
- Avoid overcomplicating API structures or requirements.

## API Standards

### Structure

- Use a consistent base URL (e.g., `/v1`) for versioning.
- Return standardized responses (e.g., `{ data, error, metadata }`).
- Organize endpoints logically by journey stage or function.

### Authentication

- Allow anonymous access for early journey stages (F1-F2) and utility endpoints (e.g., consent,
  interaction logging).
- Use secure JWT-based authentication (e.g., Memberstack) for protected endpoints (F3-F9).
- Restrict admin endpoints with elevated permissions.

### Rate Limiting

- Apply reasonable rate limits to prevent abuse (e.g., per IP or user).
- Communicate limits clearly in responses.

### Input Validation

- Validate inputs to ensure security and data integrity.
- Use established libraries (e.g., Joi, Zod) for schema validation.

## User Journey Support

Design APIs to support the 9-stage journey, guided by PRD:

- **F1: Discovery Hook** – Provide endpoints for trust indicators and interaction tracking (e.g.,
  fetch messages, log interactions).
- **F2: 2-Step Discovery Funnel** – Validate user inputs and provide feedback (e.g., input
  validation).
- **F3: Spark Layer** – Generate and manage spark concepts (e.g., spark generation).
- **F4: Purchase Flow** – Handle payment processing (e.g., Stripe checkout).
- **F5: Detailed Input Collection** – Save and retrieve user inputs (e.g., progress saving).
- **F6: Intent Mirror** – Summarize inputs with confidence scoring (e.g., intent summary).
- **F7: Deliverable Generation** – Produce tailored outputs with quality validation (e.g.,
  deliverable generation).
- **F8: SparkSplit** – Compare platform and generic outputs (e.g., output comparison).
- **F9: Feedback Capture** – Collect and analyze user feedback (e.g., feedback submission).

## Implementation Guidance

### Idempotency

- Support idempotent operations for critical endpoints (e.g., POST, PATCH) to prevent duplication.
- Store idempotency keys securely with a reasonable TTL (e.g., 24 hours).

### Error Handling

- Return clear, user-friendly error messages.
- Include error codes or metadata for debugging where applicable.

### Integrations

- Integrate with Supabase for secure data storage with row-level security (RLS).
- Use Make.com for webhook-driven workflows.
- Leverage PostHog for event tracking and analytics.

### Caching

- Cache non-sensitive responses to improve performance (e.g., trust indicators, tooltips).
- Set appropriate TTLs based on data volatility.

## Testing & Validation

- Aim for high test coverage (e.g., unit, integration) to ensure reliability.
- Conduct load testing to verify scalability (e.g., for 10,000 users).
- Perform security scans (e.g., OWASP ZAP) to identify vulnerabilities.

## Monitoring

- Implement error tracking (e.g., Sentry) for real-time issue detection.
- Monitor API latency and usage with analytics tools (e.g., PostHog).
- Maintain health check endpoints (e.g., `/health`) for uptime monitoring.

## Documentation

- Provide clear, up-to-date API documentation (e.g., OpenAPI format).
- Include examples of requests and responses.
- Track changes to ensure transparency.

## Success Metrics

- **Performance**: Target low latency for critical endpoints (e.g., <500ms for validation).
- **Reliability**: Minimize downtime and errors through robust monitoring.
- **User Satisfaction**: Achieve high trust scores and positive feedback as per PRD.

## Ownership

- **Backend Team**: Develops and maintains APIs.
- **Product Team**: Defines endpoint requirements.
- **QA Team**: Validates functionality and performance.
- **DevOps Team**: Ensures scalability and monitoring.

## References

- **PRD Sections**: 3 (Objectives), 5 (User Journey), 8.6 (Monitoring), 12 (Metrics).
- **Standards**: Emphasize PRD precedence, privacy, and security.

---

**Created**: June 19, 2025 **Version**: 1.0.0 **Alignment**: PRD Sections 3, 5, 8.6, 12
