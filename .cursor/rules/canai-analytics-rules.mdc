---
description:
globs: backend/services/posthog.js, frontend/src/utils/analytics.ts
alwaysApply: false
---
---
description: Enforces privacy-compliant event tracking
globs: backend/services/posthog.js, frontend/src/utils/analytics.ts
alwaysApply: false
---

  ---
  description: Clear, one-line description of what the rule enforces
  globs: path/to/files/*.ext, other/path/**/*
  alwaysApply: boolean
  ---

# CanAI Analytics Guidelines

## Purpose
Enable privacy-compliant analytics to deliver actionable insights across the CanAI Emotional Sovereignty Platform’s user journey (F1-F9), guided by PRD Sections 3, 8.6, and 12. Optimize user experience, trust, and business outcomes while prioritizing flexibility and adaptability.

## Scope
Provide high-level guidance for analytics implementation, focusing on event tracking, privacy, and monitoring. Align with PRD objectives, allowing teams to adapt to project needs and evolving requirements.

## Guiding Principles

### Event Tracking
- Capture key user interactions and system performance to support journey insights.
- Examples: Track funnel progression, engagement (e.g., spark selections), and conversions.
- Ensure events align with PRD-defined goals.

### Privacy Compliance
- Anonymize personally identifiable information (PII) before tracking or storage.
- Adhere to privacy regulations (e.g., GDPR, CCPA) as outlined in PRD.
- Avoid storing sensitive data unless explicitly required.

### Success Metrics
- Focus on outcomes like trust (e.g., TrustDelta), emotional resonance, journey completion, and advocacy (e.g., referrals).
- Adapt metrics to reflect PRD priorities and user feedback.

### Data Validation
- Ensure event data is consistent and reliable.
- Log validation issues securely for review and resolution.

### Monitoring
- Track performance and engagement through dashboards.
- Set alerts for anomalies, such as funnel drop-offs or latency spikes.

## User Journey Analytics
Apply analytics thoughtfully across the 9-stage journey, guided by PRD:

- **F1: Discovery Hook** – Track initial engagement (e.g., landing page views, pricing interactions).
- **F2: 2-Step Discovery Funnel** – Monitor form completions and input preferences.
- **F3: Spark Layer** – Capture spark selections and regenerations.
- **F4: Purchase Flow** – Track checkout initiations and completions.
- **F5: Detailed Input Collection** – Log input submissions and validation outcomes.
- **F6: Intent Mirror** – Monitor summary interactions and clarification requests.
- **F7: Deliverable Generation** – Track output generation and quality metrics.
- **F8: SparkSplit** – Capture comparison views and user preferences.
- **F9: Feedback Capture** – Monitor feedback submissions and sentiment.

## Implementation Guidance

### Event Design
- Use clear, consistent naming (e.g., snake_case for events, camelCase for properties).
- Document event purposes and align with PRD objectives.
- Leverage tools like PostHog for reliable capture.

### Emotional Metrics
- Measure trust and resonance as defined in PRD (e.g., TrustDelta, resonance scores).
- Incorporate AI-driven insights where relevant.

### Data Management
- Store analytics data securely with access controls.
- Apply retention policies consistent with PRD and privacy requirements.
- Purge outdated or sensitive data responsibly.

### Validation & Testing
- Test event tracking in development and CI/CD pipelines.
- Verify privacy compliance and data accuracy.
- Monitor metrics for relevance and consistency.

### Monitoring & Dashboards
- Build dashboards for key metrics (e.g., trust, conversion rates).
- Enable alerts for critical issues, such as performance degradation.

## Documentation
- Maintain clear documentation of events, metrics, and dashboards.
- Update documentation as PRD or project needs evolve.
- Map analytics to PRD sections for traceability.

## Ownership
- **Backend Team**: Implements and maintains tracking systems.
- **Product Team**: Defines and prioritizes metrics.
- **QA Team**: Validates data quality and compliance.
- **DevOps Team**: Monitors system performance and alerts.

## References
- **PRD Sections**: 3 (Objectives), 5 (User Journey), 8.6 (Monitoring), 12 (Metrics).
- **Standards**: Prioritize PRD, privacy compliance, and user trust.

---

**Created**: June 19, 2025
**Version**: 1.0.0
**Alignment**: PRD Sections 3, 5, 8.6, 12
