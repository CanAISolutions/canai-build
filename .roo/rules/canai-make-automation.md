---
description:
globs: backend/webhooks/*.js, backend/webhooks/make_scenarios/*.json
alwaysApply: false
---

---

description: Guides Make.com automation workflows globs: backend/webhooks/_.js,
backend/webhooks/make_scenarios/_.json alwaysApply: false

---

# CanAI Make.com Automation Guidelines

## Purpose

Enable reliable, secure, and efficient automation workflows to support the 9-stage user journey
(F1-F9) of the CanAI Emotional Sovereignty Platform, aligning with PRD Sections 6, 8.3, 9.4, and
14.1 for seamless integration and user experience.

## Scope

Provide high-level guidance for creating and managing Make.com automation workflows, prioritizing
PRD alignment, reliability, and adaptability to project needs.

## Guiding Principles

### Reliability

- Ensure workflows are fault-tolerant with robust retry and recovery mechanisms.
- Maintain consistent data states across operations.

### Security

- Protect data and interactions with strong authentication and access controls.
- Align with PRD privacy and security standards (e.g., GDPR/CCPA).

### Efficiency

- Optimize workflows for performance and resource usage.
- Respect external service limits to avoid disruptions.

### PRD Alignment

- Support PRD-defined goals for user journey, integration, and performance.
- Adapt to evolving PRD requirements and project needs.

## Automation Approach

### Naming & Organization

- Use clear, descriptive names for scenarios (e.g., `project-creation`, `payment-processing`).
- Organize scenarios and handlers logically in a dedicated backend directory.
- Pair scenarios with corresponding handlers for maintainability.

### Triggers

- Configure webhooks to initiate actions (e.g., data updates, payment confirmations).
- Support triggers from database changes for seamless data flow.
- Optimize trigger response times to meet PRD performance goals.

### Data Integrity

- Implement idempotency with unique identifiers to prevent duplicate actions.
- Use correlation IDs to track operations across systems.
- Ensure state consistency during retries and failures.

### Error Handling

- Handle failures gracefully to minimize user impact.
- Categorize errors for targeted recovery (e.g., transient, permanent).
- Provide user-friendly feedback when errors affect the journey.

## Stage-Specific Guidance

Apply automation thoughtfully across the 9-stage journey, guided by PRD:

- **F1: Discovery Hook**: Automate trust indicator updates and interaction logging.
- **F2: Discovery Funnel**: Trigger input validation and tooltip generation.
- **F3: Spark Layer**: Automate spark generation and regeneration workflows.
- **F4: Purchase Flow**: Handle payment confirmations and project creation.
- **F5: Input Collection**: Support autosave and resume workflows.
- **F6: Intent Mirror**: Automate summary generation and clarification requests.
- **F7: Deliverable**: Trigger output generation and status updates.
- **F8: SparkSplit**: Automate comparison logging and preference tracking.
- **F9: Feedback**: Handle feedback submission and follow-up emails.

## Implementation Guidance

### Security

- Authenticate webhook requests (e.g., HMAC signatures).
- Use minimal-permission tokens for API interactions.
- Protect sensitive data with encryption and access controls.

### Payload Validation

- Validate payloads against schemas to ensure data correctness.
- Enforce required fields and project-specific rules.
- Log validation failures for debugging.

### Performance

- Batch high-volume operations to reduce overhead.
- Respect rate limits with backoff strategies for external services.
- Use asynchronous processing for non-critical tasks.

### Integration

- Ensure smooth data flow with databases and analytics platforms.
- Support AI-driven workflows (e.g., GPT-4o, Hume AI).
- Handle payment-related actions securely via Stripe.

### Monitoring & Logging

- Log automation events (e.g., triggers, successes, failures) securely.
- Track metrics like success rates and latency for insights.
- Use tools (e.g., PostHog, Sentry) for real-time monitoring.

## Validation & Testing

- Test webhook triggers, payloads, and integrations in CI/CD pipelines.
- Validate retry logic, security measures, and performance.
- Simulate failures to ensure robust recovery.

## Documentation

- Document scenario purposes, triggers, and data flows.
- Maintain a registry of workflows and their PRD alignment.
- Update documentation with project or PRD changes.

## Ownership

- **Backend Team**: Implements and maintains workflows.
- **Product Team**: Defines automation goals and metrics.
- **QA Team**: Validates functionality and reliability.
- **DevOps Team**: Monitors performance and errors.

## References

- **PRD Sections**: 6 (Requirements), 8.3 (Automation), 9.4 (Error Handling), 14.1 (Security).
- **Standards**: Emphasize reliability, security, and PRD alignment.

---

**Created**: June 19, 2025 **Version**: 1.0.0
