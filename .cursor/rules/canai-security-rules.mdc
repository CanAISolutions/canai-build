---
description:
globs: backend/middleware/*.js, backend/server.js, databases/migrations/*.sql, .github/workflows/security.yml
alwaysApply: false
---
---
description: Enforces robust security practices
globs: backend/middleware/*.js, backend/server.js, databases/migrations/*.sql, .github/workflows/security.yml
alwaysApply: true
---

# CanAI Security Guidelines

## Purpose
Promote robust security for the CanAI Emotional Sovereignty Platform, ensuring data protection, regulatory compliance, and alignment with the 9-stage user journey and Product Requirements Document (PRD).

## Guidelines

### Authentication and Authorization
- Implement secure authentication, such as JWT-based solutions, for protected routes.
- Safeguard user-specific endpoints with consistent authorization checks.
- Monitor and log unauthorized access attempts to enhance security.

### Data Access Control
- Enforce user-specific data access through mechanisms like row-level security.
- Regularly validate access controls to prevent unauthorized data exposure.
- Optimize access policies to balance security and performance.

### Encryption
- Protect sensitive data at rest using secure encryption methods.
- Ensure all communications use HTTPS with valid, up-to-date certificates.
- Manage encryption keys securely, with periodic rotation.

### Content Security
- Apply Content Security Policies (CSP) to reduce risks like XSS attacks.
- Validate and monitor third-party integrations for security compliance.
- Track CSP violations to identify and address potential threats.

### Rate Limiting
- Use rate limiting to prevent abuse of APIs and authentication endpoints.
- Customize limits for sensitive operations to enhance protection.
- Monitor and alert on rate limit violations for quick response.

### Input Validation
- Sanitize user inputs to mitigate risks of injection or XSS attacks.
- Enforce data schemas to ensure input integrity.
- Log validation failures to support security analysis.

### Compliance
- Manage user consent for data processing, tracking choices for transparency.
- Automate data retention and deletion to meet GDPR/CCPA requirements.
- Provide mechanisms for users to request data deletion, per PRD.

### Secrets Management
- Store sensitive credentials securely, avoiding hardcoding in source code.
- Rotate API keys and secrets regularly to minimize exposure risks.
- Scan for exposed secrets during development and deployment.

### Vulnerability Management
- Conduct regular security scans to identify and address vulnerabilities.
- Monitor and update dependencies to patch known security issues.
- Perform periodic security reviews to strengthen defenses.

### Monitoring and Response
- Log security events, such as access violations, for auditing purposes.
- Track security-related errors using tools like Sentry for real-time insights.
- Maintain audit trails to support compliance and incident analysis.

### API Security
- Secure webhooks with signature verification to prevent unauthorized access.
- Handle payment data securely, adhering to PCI DSS standards.
- Protect third-party API keys and monitor their usage for anomalies.

## Validation

### Testing
- Verify authentication and data access controls for robustness.
- Run automated security scans to detect vulnerabilities.
- Test input validation and sanitization to ensure protection.
- Confirm compliance with data handling and regulatory standards.

### Acceptance Criteria
- Only authorized users access protected resources.
- HTTPS is enforced across all communications.
- Consent and data lifecycle processes are fully functional.
- Security scans report no critical vulnerabilities.
- Rate limiting effectively mitigates abuse risks.
- Sensitive data remains encrypted and secure.

### Monitoring
- Track authentication issues, rate limit violations, and scan outcomes.
- Monitor compliance and data breach incidents, aiming for zero incidents.
- Ensure timely execution of key rotation schedules.

## PRD Alignment
- Support PRD requirements for security, data protection, and compliance.
- Align with monitoring and incident response strategies in the PRD.
- Prioritize PRD guidance, adapting these guidelines to avoid conflicts.

## Development Principles
- **Security First**: Integrate protection across all platform components.
- **Compliance**: Meet GDPR, CCPA, and other regulatory standards.
- **Proactivity**: Anticipate and address vulnerabilities early.
- **Flexibility**: Adapt security measures to evolving PRD needs.

---

**Created**: June 19, 2025
**Version**: 1.0.0
