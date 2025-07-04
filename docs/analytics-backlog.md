# Analytics/Observability Backlog

_Update this backlog as new improvement opportunities are identified or priorities change._

## Backlog Items

- **Persistent Anonymous ID Storage**
  - Implement proper persistence for anonymous IDs (e.g., encrypted cookies, DB, or localStorage for
    frontend) to ensure consistent user/session tracking across environments.

- **Advanced Retry Logic & Fallback Logging**
  - Upgrade retry logic to exponential backoff and persist failed events to disk or a fallback
    service to prevent analytics data loss during outages and enable recovery.

- **Expand Automated Testing**
  - As new analytics features or event types are added, expand test coverage to include integration
    and load tests.

- **Periodic Analytics Review**
  - Regularly review analytics implementation for privacy, compliance, and evolving business needs.

- **Event Schema Versioning**
  - Implement versioning for analytics event schemas to support backward compatibility and future
    changes.

- **Consent Management Integration**
  - Integrate analytics with user consent management to ensure privacy compliance (GDPR/CCPA).

- **Dashboard & Alerting Enhancements**
  - Improve analytics dashboards and set up advanced alerting for anomalies, drop-offs, or latency
    spikes.

## [Milestone] Session Tracking & Centralized Event Validation (Task 3.4)

**Date:** {{TODAY}}

### Summary

- Implemented robust session tracking in backend/services/posthog.js:
  - Session start/end logic with unique sessionId per user/session
  - Session timeout (default: 30 min inactivity, configurable via SESSION_TIMEOUT_MINUTES)
  - Session duration calculation and enrichment of all tracked events
  - Emission of `session_start` and `session_end` events to PostHog
  - In-memory session store (stateless environments should use Redis/DB)
- Centralized event validation pipeline:
  - All analytics events are now validated against their schemas before being sent
  - Validation errors are logged for review, supporting data quality and privacy compliance
- All event tracking functions (funnel, API latency, errors, user actions) now:
  - Enrich events with session metadata (start, duration, userId, isAnonymous)
  - Update session activity on each event

### PRD & Rule Alignment

- Aligns with CanAI Analytics Guidelines (privacy, validation, user journey mapping)
- Supports PRD Sections 3, 5, 8.6, 12 (objectives, journey, monitoring, metrics)
- Enables more granular, privacy-compliant analytics and observability

### Next Steps

- Monitor session events and enriched analytics in the PostHog dashboard
- Gather feedback on session tracking accuracy and event validation
- Continue with next subtask: environment variable validation and error handling for analytics

---

## Changelog

- **[{{TODAY}}]**: Added session tracking (start/end, timeout, duration) and centralized event
  validation pipeline to backend/services/posthog.js. All analytics events now include session
  metadata and are schema-validated before sending.

_Update this backlog as new improvement opportunities are identified or priorities change._
