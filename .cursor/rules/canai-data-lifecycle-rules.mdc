---
description:
globs: databases/migrations/*.sql, databases/cron/*.sql, backend/routes/
alwaysApply: false
---
---
description: Enforces GDPR/CCPA-compliant data handling
globs: databases/migrations/*.sql, databases/cron/*.sql, backend/routes/purge.js, frontend/src/components/*/DangerZone.tsx
alwaysApply: true
---

# CanAI Data Lifecycle Guidelines

## Purpose
Guide data management to ensure privacy, compliance, and user trust across the 9-stage user journey (F1-F9), aligning with GDPR/CCPA and PRD goals (Sections 7.3, 9.4, 14.1).

## Scope
Provide flexible, high-level guidance for managing data collection, storage, retention, and user rights, prioritizing PRD alignment, user privacy, and adaptability to project needs.

## Guiding Principles

### User Privacy
- Protect sensitive data, including emotional inputs, with robust security measures.
- Ensure transparency in data handling and user consent processes.

### Minimal Data
- Collect only data essential to support the user journey and PRD objectives.
- Avoid unnecessary storage of sensitive information.

### Compliance
- Support user rights under GDPR/CCPA, including access, erasure, and consent.
- Maintain audit trails for compliance monitoring.

### Efficiency
- Streamline data lifecycle processes to minimize performance impact.
- Automate retention and purge workflows where possible.

## Data Lifecycle Stages

### Data Collection (F1-F5)
- Validate and sanitize inputs to ensure security and integrity.
- Log user consent explicitly for data processing (e.g., via consent endpoint).
- Align collection with PRD-defined inputs for each journey stage.

### Data Storage
- Store data securely with access controls (e.g., row-level security).
- Define retention periods based on PRD and compliance requirements (e.g., 24 months for user inputs).
- Use encryption for sensitive data where applicable.

### Lifecycle Management
- Automatically purge data after retention periods expire.
- Anonymize personally identifiable information (PII) as needed to reduce privacy risks.
- Schedule regular cleanup tasks to maintain compliance.

### User Rights
- Provide mechanisms for users to access their data (e.g., data export endpoint).
- Enable data erasure requests to comply with GDPR/CCPA (e.g., purge endpoint).
- Communicate outcomes of user requests clearly.

### Compliance Monitoring
- Regularly audit data retention and access to ensure compliance.
- Track lifecycle events (e.g., purges, consent logs) for transparency.
- Set alerts for potential compliance issues.

## Implementation Guidance

### Integrations
- Use Supabase for secure storage with row-level security and encryption.
- Leverage PostHog to track lifecycle events anonymously.
- Integrate Make.com for automated compliance workflows.
- Manage payment data securely via Stripe.

### Validation
- Test data lifecycle operations (e.g., purge, anonymization) in CI/CD pipelines.
- Verify compliance through automated checks and audits.
- Monitor performance of data access and erasure requests.

### Monitoring
- Track lifecycle events and compliance status with analytics tools.
- Use error tracking (e.g., Sentry) to detect issues in data processes.
- Maintain dashboards for retention and compliance metrics.

### Documentation
- Document data schemas, retention policies, and user rights processes.
- Map lifecycle practices to PRD sections for traceability.
- Update documentation as compliance or PRD requirements evolve.

## Success Metrics
- **Compliance**: Zero violations of GDPR/CCPA requirements.
- **Privacy**: Full protection of PII with no unauthorized access.
- **Performance**: Fast response times for data access and erasure requests.
- **User Trust**: High satisfaction with data handling transparency.

## Ownership
- **Backend Team**: Implements and maintains data lifecycle processes.
- **Compliance Team**: Oversees GDPR/CCPA adherence.
- **QA Team**: Validates lifecycle operations and compliance.
- **DevOps Team**: Monitors performance and automation.

## References
- **PRD Sections**: 7.3 (Data Lifecycle), 9.4 (Error Handling), 14.1 (Security).
- **Standards**: Prioritize PRD, privacy compliance, and user trust.

---

**Created**: June 19, 2025
**Version**: 1.0.0
**Alignment**: PRD Sections 7.3, 9.4, 14.1
