# Task 15 Test Plan Skeleton: POST /v1/generate-preview-spark API

---

## 1. Scope
- Strictly covers POST /v1/generate-preview-spark API
- Includes: input validation, sanitization, analytics logging (PostHog), error handling (Sentry), rate limiting, and comprehensive testing
- Excludes: PDF serving (future consideration), frontend UI, paid spark generation

## 2. Test Types
- **Unit Tests:**
  - Joi schema validation (businessType, tone)
  - DOMPurify sanitization
  - Service logic (spark generation, error handling)
- **Integration Tests:**
  - End-to-end API flow (valid/invalid/malicious payloads)
  - Analytics event delivery (PostHog)
  - Error event delivery (Sentry)
  - Rate limiting enforcement
- **Malicious Payload Tests:**
  - XSS, SQLi, malformed data, edge cases
  - Ensure all are blocked and logged

## 3. Edge Cases
- Empty, missing, or malformed fields
- Unsupported businessType/tone values
- Oversized payloads
- Rapid repeated requests (rate limit)
- Analytics/logging failures

## 4. Logging & Analytics Validation
- Confirm PostHog events for preview_viewed and errors
- Confirm Sentry captures all exceptions with context
- Ensure all logs include requestId and actionable context

## 5. Evidence-Based Debugging
- All failures must be logged with requestId and context
- Use logging-first, iterative debugging as per project rules

## 6. References
- docs/test-advice.md
- docs/test-case-specification.md
- docs/test-debugging-best-practices.md
- .cursor/rules/canai-test-debugging-best-practices.mdc
- .cursor/rules/canai-test-plan-skeleton-rule.mdc
- .cursor/rules/canai-testing-rules.mdc

## 7. Future Considerations
- PDF serving from Supabase (to be addressed in a future issue/iteration)