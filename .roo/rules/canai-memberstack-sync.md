---
description:
globs: backend/middleware/auth.js, frontend/src/utils/memberstack*.ts
alwaysApply: false
---

---

description: Enforces secure user authentication practices globs: backend/middleware/auth.js,
frontend/src/utils/memberstack\*.ts alwaysApply: false

---

# CanAI Memberstack Sync Guidelines

## Purpose

Facilitate secure and efficient synchronization of user authentication, plans, and subscriptions
between Memberstack and Supabase, supporting the 9-stage user journey while prioritizing PRD
alignment and adaptability.

## Guidelines

### Change Tracking

- Log significant sync events (e.g., user creation, subscription updates) to support auditing and
  conflict resolution.
- Handle Memberstack webhook events (e.g., registration, profile changes) to maintain data
  consistency.
- Use timestamps or event IDs to track changes and resolve discrepancies.

### Conflict Resolution

- Designate Memberstack as the primary source for user profiles and subscriptions, and Supabase for
  application-specific data (e.g., projects, usage).
- Resolve conflicts using authoritative sources or timestamp-based logic, guided by PRD
  requirements.

### Security

- Implement robust access controls to align with PRD security standards.
- Validate sync requests using secure authentication methods.
- Protect data through sanitization and scoped access to minimize risks.

### Webhook Handling

- Verify webhook authenticity to ensure secure processing.
- Use idempotency to prevent duplicate event handling.
- Process events reliably, logging outcomes for transparency.

### Error Handling

- Retry failed sync operations with reasonable delays to ensure reliability.
- Log errors for debugging and monitoring.
- Route persistent failures to a resolution queue, as needed.

### Sync Operations

- Create Supabase records for new Memberstack registrations.
- Update subscription statuses and plans in response to changes.
- Aim for data consistency across systems to reflect accurate user states.

### Data Validation

- Validate sync data against expected schemas to ensure integrity.
- Ensure critical fields (e.g., user ID, email) are present.
- Sanitize inputs to maintain security and data quality.

### Integrations

- Align subscription updates with payment platform events, per PRD.
- Trigger automated workflows based on sync events to support user journey stages.
- Track sync events for analytics to monitor system health and user lifecycle.

### Performance

- Process syncs efficiently, using batching or caching where appropriate.
- Leverage asynchronous tasks for non-critical operations to reduce latency.
- Optimize resource use to support scalability.

### Monitoring

- Track sync success and failures to ensure reliability.
- Log key events (e.g., user creation, subscription changes) for analytics.
- Monitor and address sync issues promptly through alerts or dashboards.

## Validation

### CI/CD Checks

- Test sync logic within CI/CD pipelines to ensure functionality.
- Validate data schemas and integration flows to maintain consistency.
- Confirm end-to-end sync operations align with PRD expectations.

### Testing

- Verify access controls to ensure secure sync operations.
- Test conflict resolution and data merging scenarios.
- Validate retry and error handling for robustness.

### Monitoring

- Use dashboards to track sync performance and user events.
- Set up alerts for sync failures or performance degradation.
- Monitor sync success rates to ensure system health.

## PRD Alignment

- Support key PRD sections, including user journey stages (e.g., discovery, purchase), security, and
  performance requirements.
- Prioritize PRD guidance, adapting these guidelines to avoid conflicts and meet evolving needs.

## Development Principles

- **Security**: Prioritize robust authentication and data protection.
- **Reliability**: Ensure consistent and fault-tolerant sync operations.
- **Efficiency**: Optimize performance and resource usage.
- **Flexibility**: Design for adaptability to support future PRD updates.

---

**Created**: June 19, 2025 **Version**: 1.0.0
