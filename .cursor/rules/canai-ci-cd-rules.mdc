---
description:
globs: .github/workflows/*.yml, backend/docker-compose.yml, render.yaml
alwaysApply: false
---
---
description: Guides efficient deployment pipelines
globs: .github/workflows/*.yml, backend/docker-compose.yml, render.yaml
alwaysApply: true
---

# CanAI CI/CD Guidelines

## Purpose
Enable secure, efficient, and reliable deployments for the CanAI Emotional Sovereignty Platform across its 9-stage user journey (F1-F9), guided by PRD Sections 13, 14, and 15. Support rapid iteration, robust testing, and high availability while prioritizing flexibility.

## Scope
Provide high-level guidance for CI/CD pipelines, focusing on code quality, testing, security, and deployment. Align with PRD objectives, allowing adaptability to project needs and evolving requirements.

## Guiding Principles

### PRD Alignment
- Design pipelines to support PRD goals, such as user trust, performance, and journey completion.
- Adapt to changes in PRD or project scope.

### Reliability
- Ensure consistent, error-free deployments with minimal downtime.
- Support quick recovery through rollback mechanisms.

### Quality
- Enforce code quality, test coverage, and accessibility standards.
- Validate AI outputs for resonance and trust as per PRD.

### Security
- Integrate security checks to prevent vulnerabilities.
- Protect sensitive data and credentials.

## Pipeline Structure

### Stages
Incorporate flexible stages tailored to project needs:
- **Code Quality**: Validate syntax, formatting, and dependency safety.
- **Testing**: Run unit, integration, accessibility, and load tests.
- **Security**: Scan for vulnerabilities and secrets.
- **AI Validation**: Verify AI model performance and output quality.
- **Build**: Compile optimized assets for frontend and backend.
- **Deployment**: Apply migrations, validate integrations, and confirm health.

### Environments
- **Development**: Support feature testing and iteration.
- **Staging**: Mirror production for final validation.
- **Production**: Serve live users with full monitoring.

### Quality Gates
- **Development to Staging**: Require passing tests, code reviews, and security checks.
- **Staging to Production**: Validate performance, user journeys, and obtain approval.

## Implementation Guidance

### Code Quality
- Use linters and formatters for consistent code.
- Audit dependencies to mitigate vulnerabilities.

### Testing
- Test APIs, components, and user journeys (F1-F9).
- Ensure WCAG 2.2 AA accessibility compliance.
- Validate AI outputs for quality, resonance, and performance.

### Security
- Scan code, dependencies, and runtime for vulnerabilities.
- Secure secrets and prevent leaks.

### AI Validation
- Verify AI prompts and outputs align with PRD metrics (e.g., TrustDelta, resonance).
- Monitor AI service performance and reliability.

### Deployment
- Build and deploy optimized assets.
- Apply safe database migrations.
- Validate integrations (e.g., payment, AI services).

### Monitoring
- Track pipeline and deployment events.
- Monitor post-deployment errors, performance, and user metrics.

## Environment Setup
- Configure environments to balance testing and production needs.
- Use isolated databases and limited AI access for non-production environments.
- Enable comprehensive monitoring in production.

## Rollback
- Support automated or manual rollback using tagged releases.
- Validate system health after rollback.

## Secret Management
- Store credentials securely and rotate regularly.
- Use secret scanning to prevent leaks.

## Documentation
- Document pipeline workflows, tests, and rollback plans.
- Map tests to PRD goals and user journey stages.
- Record security and performance results.

## Ownership
- **DevOps Team**: Manages pipelines and deployments.
- **Backend Team**: Implements and tests APIs.
- **QA Team**: Validates quality and compliance.
- **Product Team**: Defines requirements and metrics.

## References
- **PRD Sections**: 13 (Testing), 14 (Security), 15 (Deployment).
- **Standards**: Emphasize PRD precedence, accessibility, and security.

---

**Created**: June 19, 2025
**Version**: 1.0.0
**Alignment**: PRD Sections 13, 14, 15
