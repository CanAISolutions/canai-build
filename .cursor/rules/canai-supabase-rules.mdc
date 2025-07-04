---
description:
globs: databases/migrations/*.sql, backend/supabase/client.js, frontend/src/integrations/supabase/*.ts
alwaysApply: false
---
---
description: Enforces optimal Supabase integration practices
globs: databases/migrations/*.sql, backend/supabase/client.js, frontend/src/integrations/supabase/*.ts
alwaysApply: false
---

# CanAI Supabase Guidelines

## Purpose
Promote secure, efficient, and compliant Supabase usage for the CanAI Emotional Sovereignty Platform, supporting the 9-stage user journey and aligning with the Product Requirements Document (PRD).

## Guidelines

### Schema Management
- Store schema changes in a versioned migrations directory with clear naming.
- Maintain consistent schemas for core tables (e.g., user interactions, AI outputs, payments).
- Ensure migrations are reversible to support rollback needs.

### Row-Level Security (RLS)
- Apply user-scoped RLS policies to restrict data access for most tables.
- Allow limited public read access for specific data, such as pricing or cached content.
- Define distinct access policies for administrative and analytics roles.

### Indexing
- Create indexes for frequently queried fields to enhance performance.
- Use consistent naming conventions for indexes to maintain clarity.
- Optimize indexing to support PRD performance objectives.

### Data Lifecycle
- Automate data purging to comply with retention policies, per PRD.
- Anonymize sensitive data regularly to meet compliance requirements.
- Manage cache data expiration to maintain system efficiency.

### Client Setup
- Configure secure Supabase clients in the backend with minimal permissions.
- Set up frontend clients with environment-based configurations for safety.
- Enable real-time features selectively to optimize resource usage.

### Query Optimization
- Leverage batch operations for efficient data writes.
- Design queries to utilize indexes and reduce latency.
- Ensure queries respect user-level access controls for security.

### Storage
- Organize file storage into purpose-specific buckets (e.g., deliverables, public files).
- Apply RLS-based access controls to secure file access.
- Validate file uploads to prevent unauthorized or malicious content.

### Backups
- Schedule automated backups with defined retention periods.
- Support point-in-time recovery for critical data restoration.
- Regularly test backup and recovery processes for reliability.

### Monitoring
- Track query performance to identify and address bottlenecks.
- Monitor database errors and access violations for security.
- Log key events, such as purges and backups, for analytics.

### Development Workflow
- Use Supabase CLI for local development and testing environments.
- Test schemas, RLS, and queries thoroughly before production deployment.
- Ensure migrations align with production schemas for consistency.

## Validation

### CI/CD Checks
- Test schema migrations and rollbacks in CI/CD pipelines.
- Verify RLS policies restrict unauthorized access.
- Confirm queries meet performance targets.

### Testing
- Validate RLS policies enforce user-scoped access.
- Ensure queries are optimized and leverage indexes.
- Test data lifecycle processes for compliance.

### Monitoring
- Use dashboards to monitor query performance and error rates.
- Set up alerts for slow queries or access violations.
- Verify backup and recovery processes are reliable.

## PRD Alignment
- Support PRD requirements for database design, security, and performance.
- Align with compliance and monitoring objectives in the PRD.
- Prioritize PRD guidance, adapting these guidelines to avoid conflicts.

## Development Principles
- **Security**: Implement strict access controls and encryption.
- **Performance**: Optimize queries and indexing for efficiency.
- **Compliance**: Meet GDPR, CCPA, and other regulatory standards.
- **Flexibility**: Design schemas to adapt to evolving PRD needs.

---

**Created**: June 19, 2025
**Version**: 1.0.0
