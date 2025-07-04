---
description:
globs: backend/health.js, .github/workflows/deploy.yml, backend/config/production.js, databases/migrations/*.sql
alwaysApply: false
---
---
description: Comprehensive production readiness checklist and operational guidelines for CanAI deployment
globs: backend/health.js, .github/workflows/deploy.yml, backend/config/production.js, databases/migrations/*.sql
alwaysApply: true
---

# CanAI Production Readiness Guidelines

## Purpose
Ensure the CanAI Emotional Sovereignty Platform is ready for production, supporting the 9-stage user journey with robust infrastructure, security, monitoring, and operational procedures to handle real user traffic, payments, and AI-driven data processing, per PRD requirements.

## Scope
These guidelines cover infrastructure setup, security hardening, performance optimization, monitoring, backup, scaling, and incident response for the CanAI ecosystem, including AI services, payment processing, and analytics, with flexibility to adapt to project needs.

## Pre-Deployment Checklist

### Infrastructure Readiness
- Validate database connectivity, performance, and backup schedules.
- Confirm AI service quotas and fallback mechanisms are operational.
- Ensure payment processing systems are configured securely.
- Verify automation workflows and CDN/static asset delivery.
- Check SSL certificates and security configurations.

### Security Hardening
- Implement rate limiting for sensitive endpoints, tailored to usage patterns.
- Configure strict CORS policies for production domains.
- Apply security headers (e.g., CSP, X-Frame-Options) to mitigate risks.
- Validate input sanitization and API key rotation processes.

### Performance Benchmarks
- Meet PRD-defined API response time targets across journey stages.
- Achieve high availability for critical services, like payment flows.
- Ensure trust and emotional metric calculations are efficient.
- Optimize database query performance with appropriate indexing.

## Monitoring & Alerting

### Production Monitoring Setup
- Track journey-specific metrics (e.g., completion rates, trust scores).
- Monitor system health (e.g., API response times, error rates).
- Measure business metrics (e.g., revenue, user satisfaction).
- Verify external service health (e.g., Supabase, Stripe, AI providers).
- Set up alerts for critical issues (e.g., payment failures, trust score drops) with clear escalation paths.

### Health Check Endpoints
- Provide endpoints for basic, detailed, journey-specific, and service health checks.
- Validate critical journey paths and external service connectivity.
- Monitor performance indicators, like response times and error rates.

## Backup & Disaster Recovery

### Backup Strategy
- Schedule frequent database and file storage backups with encryption.
- Retain backups for defined periods, with regular verification.
- Back up configurations and AI assets with versioning.
- Test restoration processes periodically.

### Disaster Recovery
- Define recovery time (RTO) and point (RPO) objectives for critical services.
- Automate failover for database, AI, and payment systems.
- Ensure minimal data loss for financial and user data.

### Incident Response
- Categorize incidents by severity with clear response times and escalations.
- Automate service restarts, scaling, and notifications where feasible.
- Use predefined communication templates for stakeholder updates.
- Log incidents and schedule post-mortems for critical issues.

## Scaling & Capacity Planning

### Auto-Scaling Configuration
- Configure API and AI worker scaling based on CPU, memory, or queue metrics.
- Set dynamic database connection pooling for efficiency.
- Monitor user growth and service usage to adjust capacity.

### Capacity Monitoring
- Conduct daily checks on user growth, AI quotas, and storage.
- Review performance trends and scaling efficiency weekly.
- Plan infrastructure and cost optimization monthly.

## Go-Live Checklist

### Final Deployment Validation
- Confirm security measures (e.g., SSL, rate limiting, GDPR compliance).
- Validate performance under load (e.g., 1000+ concurrent users).
- Test all journey stages end-to-end, including trust and payment flows.
- Ensure external integrations (e.g., Supabase, AI services) are ready.
- Verify monitoring, alerting, and backup systems are operational.
- Establish team readiness with on-call schedules and documentation.

## Post-Deployment Monitoring

### Launch Day Procedures
- Monitor metrics intensively for the first 24 hours, transitioning to standard schedules.
- Prioritize payment success, journey completion, and error rates.
- Define automated rollback triggers for critical failures.
- Provide regular updates to stakeholders and users via status pages.

### Success Criteria Validation
- Evaluate technical (e.g., uptime, error rates), business (e.g., completion, satisfaction), and operational (e.g., incident count) metrics.
- Generate recommendations for post-launch improvements.

## Quality Standards
- **Security**: No critical vulnerabilities, with active protections.
- **Performance**: Meet PRD response time and load targets.
- **Reliability**: Achieve 99.9% uptime with failover capabilities.
- **Monitoring**: Ensure comprehensive observability and proactive alerts.
- **Recovery**: Maintain tested backup and recovery procedures.
- **Capacity**: Support scalable infrastructure with capacity planning.
- **Operations**: Document incident response with 24/7 monitoring.

---

**Created**: June 19, 2025
**Version**: 1.0.0
