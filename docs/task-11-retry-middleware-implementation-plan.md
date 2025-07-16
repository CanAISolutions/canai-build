# Task 11: Retry Middleware with Exponential Backoff — Defensive, Evidence-Based Implementation Plan

---

## Purpose & PRD Alignment

This document provides a concrete, actionable, and defensive implementation plan for Task 11:
**Create Retry Middleware with Exponential Backoff**. It is designed to:

- Align with PRD requirements for API reliability, resilience, and observability (see PRD Sections
  6, 7, 8, 12, 16)
- Support current and future needs for robust error handling and external API reliability
- Ensure security, compliance, and extensibility
- Serve as a living reference for TaskMaster Task 11 and all related reliability work
- **Reference PRD metrics:** e.g., “<1% failed requests due to transient errors”, “Mean time to
  recovery < 1 min”
- **Map to user journey stages:** F4 (Purchase Flow), F7 (Deliverable), F9 (Feedback)

---

## TaskMaster Tasks & Deliverables

### **Current Tasks**

- **Task 11:** Create Retry Middleware (exponential backoff, circuit breaker, logging)
  - **11.1:** Implement retry logic with exponential backoff
  - **11.2:** Add circuit breaker pattern for persistent failures
  - **11.3:** Integrate logging and analytics (Sentry, PostHog)
  - **11.4:** **Create and maintain `retry-middleware-test-plan.md` and test skeleton subtask**

### **Future-Proofing**

- Design for easy extension to other endpoints/services
- Modularize for per-endpoint and per-external-service strategies
- Integrate with observability (Sentry, PostHog)

---

## Goals & Success Criteria

- Prevent cascading failures and improve API reliability
- Implement retry logic with exponential backoff (configurable attempts, intervals)
- Add circuit breaker to halt retries on persistent failures
- Log all retry, failure, and circuit breaker events to Sentry/PostHog
- Achieve 100% test coverage for retry, backoff, and circuit breaker logic
- **All retry/circuit breaker events must be observable in Sentry/PostHog within 30s**
- **No sensitive data (PII, tokens) may appear in logs or error messages**
- **<1% of requests should fail due to transient errors after retries (target SLO)**

---

## Architecture & Structure

- **Middleware Module:** `backend/middleware/retry.ts` (TypeScript for type safety)
  - Encapsulate all retry and circuit breaker logic
  - Configurable max attempts, initial delay, backoff factor, and circuit breaker thresholds
  - **All config must be injectable for testability and future multi-tenant support**
  - **Separation of concerns:** retry logic, circuit breaker, and logging must be independently
    testable
- **Integration:** Apply middleware to routes/services that call external APIs
- **Observability:** Log all retry/circuit breaker events to Sentry/PostHog
- **Error Handling:** Provide user-friendly error messages and status codes

---

## Implementation Phases & Phase Gates

### 1. Retry Logic with Exponential Backoff

> **Phase Gate:** Middleware exposes retry logic with configurable attempts, delay, and backoff.

**Success Criteria:**

- Can wrap async functions and retry on failure
- Delay increases exponentially between attempts
- Respects max attempts and aborts on success
- **All retry delays must include random jitter to prevent synchronized retries**
- **Support for abort/cancellation tokens in all async retry logic**
- **Classify errors and only retry on whitelisted error types (network, HTTP, etc.)**

**Example:**

```ts
// middleware/retry.ts
export async function retryWithBackoff(fn, options = {}) {
  const {
    maxAttempts = 3,
    initialDelay = 500,
    backoffFactor = 2,
    jitter = 0.2, // 20% jitter
    abortSignal,
    shouldRetry = err => true, // error classifier
    onRetry = () => {},
  } = options;
  let attempt = 0;
  let delay = initialDelay;
  while (attempt < maxAttempts) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts || !shouldRetry(err)) throw err;
      onRetry(err, attempt);
      // Add jitter
      const jitterValue = delay * jitter * (Math.random() * 2 - 1);
      const finalDelay = delay + jitterValue;
      if (abortSignal?.aborted) throw new Error('Retry aborted');
      await new Promise((res, rej) => {
        const timeout = setTimeout(res, finalDelay);
        if (abortSignal)
          abortSignal.addEventListener('abort', () => {
            clearTimeout(timeout);
            rej(new Error('Retry aborted'));
          });
      });
      delay *= backoffFactor;
    }
  }
}
```

---

### 2. Circuit Breaker Pattern

> **Phase Gate:** Circuit breaker logic is implemented to halt retries on persistent failures.

**Success Criteria:**

- Circuit breaker opens after N consecutive failures
- Remains open for a cooldown period before allowing retries
- Logs state transitions (open, half-open, closed)
- **Implements half-open state and tests for race conditions**
- **Metrics for open/close transitions and time spent in each state**
- **Alert if circuit remains open > threshold (e.g., 5 min)**

**Example:**

```ts
// middleware/circuitBreaker.ts
class CircuitBreaker {
  constructor({ failureThreshold = 5, resetTimeout = 60000, alertThreshold = 300000 } = {}) {
    this.failureThreshold = failureThreshold;
    this.resetTimeout = resetTimeout;
    this.alertThreshold = alertThreshold;
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
    this.lastStateChange = Date.now();
  }
  isOpen() {
    if (this.state === 'OPEN' && Date.now() - this.lastFailureTime > this.resetTimeout) {
      this.state = 'HALF_OPEN';
      this.lastStateChange = Date.now();
    }
    // Alert if open too long
    if (this.state === 'OPEN' && Date.now() - this.lastStateChange > this.alertThreshold) {
      // trigger alert/metric
    }
    return this.state === 'OPEN';
  }
  onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastStateChange = Date.now();
  }
  onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
      this.lastStateChange = Date.now();
    }
  }
}
```

---

### 3. Logging & Observability

> **Phase Gate:** All retry and circuit breaker events are logged to Sentry/PostHog.

**Success Criteria:**

- Retry attempts, failures, and circuit breaker state changes are logged
- Analytics events are sent for monitoring and alerting
- **All logs must include correlation IDs for traceability**
- **All logs must be redacted for sensitive data**
- **Dashboards/alerts for retry/circuit metrics must be in place**

**Example:**

```ts
// In retry/circuit breaker logic
import * as Sentry from '../services/instrument.js';
import posthog from '../services/posthog.js';
Sentry.captureMessage('Retry attempt', { extra: { attempt, error: err, correlationId } });
posthog.capture('retry_attempt', { attempt, error: err.message, correlationId });
```

---

### 4. Error Handling & User Experience

> **Phase Gate:** User-facing errors are clear, actionable, and do not leak sensitive info.

**Success Criteria:**

- On persistent failure, return a user-friendly error message
- No stack traces or sensitive info in responses
- **All user-facing errors must have error codes and be documented**
- **Fallback messaging for known external outages**

---

### 5. Testing & Validation

> **Phase Gate:** Vitest test suite covers all retry, backoff, and circuit breaker logic and edge
> cases.

**Success Criteria:**

- All retry/circuit breaker operations are tested (success, failure, open/close transitions)
- Edge cases: max attempts, cooldown, rapid failures, partial successes, clock skew
- Test logs and metrics for retry/circuit breaker events
- **Property-based/fuzz testing for backoff and circuit logic**
- **Test for race conditions in half-open state**
- **Test for log redaction and absence of sensitive data**
- **Test skeleton and `retry-middleware-test-plan.md` must be present and reviewed**

---

## Defensive Rollback & Iteration Plan

- After each change, run affected and full test suite
- If regression, revert last change and isolate issue
- Log all findings and lessons learned in TaskMaster and docs
- Remove temporary logs before merge
- **Feature flag for rollout; canary deployment and monitoring before full rollout**

---

## Acceptance Criteria & Checklist

- [ ] Retry logic implemented and tested
- [ ] Circuit breaker logic present and tested
- [ ] Logging and analytics integrated
- [ ] 100% test coverage for reliability logic
- [ ] Documentation and TaskMaster updated after each step
- [ ] **Test skeleton and retry-middleware-test-plan.md present and reviewed**
- [ ] **All logs/metrics observable in dashboards**
- [ ] **No sensitive data in logs or error messages**
- [ ] **Canary deployment and monitoring completed before full rollout**

---

## References & Best Practices

- PRD.md (Sections 6, 7, 8, 12, 16; see metrics and SLOs)
- [CanAI Structure Rules](../.cursor/rules/canai-structure-rules.mdc)
- [Task 9 Input Validation Plan](task-9-input-validation-middleware.md)
- [Task 15 Preview Spark API Plan](task-15-Create-POST-v1-generate-preview-spark-API.md)
- Sentry, PostHog docs
- [test-debugging-best-practices.md](test-debugging-best-practices.md)
- **canai-test-debugging-best-practices rule**
- **User journey docs (F4, F7, F9)**

---

**Last updated:** 2025-07-16
