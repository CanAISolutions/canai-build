---
description:
globs: backend/services/{sentry,posthog}.js, backend/health.js
alwaysApply: false
---

---

description: Enforces system health monitoring practices globs:
backend/services/{sentry,posthog}.js, backend/health.js alwaysApply: false

---

# CanAI Observability Guidelines

## Purpose

Enable effective monitoring and analytics for the CanAI Emotional Sovereignty Platform to support
high reliability, proactive issue detection, and alignment with the 9-stage user journey and Product
Requirements Document (PRD).

## Guidelines

### Logging

- Capture errors and performance issues using tools like Sentry for robust tracking.
- Log user interactions and key events with analytics platforms like PostHog to monitor engagement.
- Include essential metadata (e.g., correlation IDs, timestamps) in logs for traceability.

### Performance Monitoring

- Track API and AI task response times to meet PRD performance goals.
- Monitor error rates to maintain system reliability.
- Set up alerts for significant performance deviations to enable quick resolution.

### AI Monitoring

- Measure AI output quality (e.g., TrustDelta, resonance) to ensure alignment with PRD standards.
- Monitor AI task success and execution times for consistent performance.
- Conduct regular health checks to verify AI reliability.

### Distributed Tracing

- Implement tracing to track requests across systems for debugging.
- Propagate context (e.g., correlation IDs) to connect operations across services.

### Database Logging

- Store user interactions and system events in a database for analysis.
- Record failures with relevant context to support troubleshooting.
- Track performance and business metrics to identify trends.

### Dashboards

- Visualize critical metrics, such as funnel completion and API performance, to monitor system
  health.
- Display user engagement and journey metrics to support business goals.
- Ensure dashboards provide near real-time insights for timely decision-making.

### Alerting

- Configure alerts for performance or quality issues (e.g., high latency, low TrustDelta).
- Flag AI outputs for human review when quality thresholds are not met.
- Establish clear escalation paths for critical incidents.

### Proactive Monitoring

- Use synthetic tests to simulate user interactions and verify system health.
- Analyze trends to predict potential issues, such as cost spikes or quality degradation.
- Monitor AI usage costs to manage budgets effectively.

### Privacy and Compliance

- Protect sensitive data in logs by masking or anonymizing as needed.
- Adhere to PRD-defined data retention policies to ensure compliance.

## Validation

### CI/CD Checks

- Validate logging, tracing, and metric capture in CI/CD pipelines.
- Test alert configurations to ensure proper notifications.
- Confirm integration of observability features in deployment processes.

### Testing

- Verify coverage of logging, tracing, and AI performance monitoring.
- Conduct performance tests to ensure system reliability under load.
- Test alert triggers for accuracy and responsiveness.

### Monitoring

- Ensure dashboards accurately reflect system and user metrics.
- Confirm error tracking captures and reports issues effectively.
- Validate synthetic tests and predictive analytics for proactive issue detection.

## PRD Alignment

- Support PRD requirements for performance, reliability, and analytics.
- Align with success metrics and security standards outlined in the PRD.
- Prioritize PRD guidance, adapting these guidelines to avoid conflicts.

## Development Principles

- **Reliability**: Maintain comprehensive monitoring for consistent uptime.
- **Proactivity**: Anticipate issues through health checks and trend analysis.
- **Privacy**: Safeguard user data in all observability processes.
- **Flexibility**: Design for adaptability to meet evolving PRD needs.

---

**Created**: June 19, 2025 **Version**: 1.0.0
