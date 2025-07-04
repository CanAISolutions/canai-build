// backend/middleware/hume.js
import posthog from '../services/posthog.js';

class HumeCircuitBreaker {
  constructor() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
    this.FAILURE_THRESHOLD = 5;
    this.RESET_TIMEOUT = 60000; // 1 minute
  }

  isOpen() {
    return this.state === 'OPEN';
  }

  shouldAttemptReset() {
    if (
      this.state === 'OPEN' &&
      Date.now() - this.lastFailureTime > this.RESET_TIMEOUT
    ) {
      this.state = 'HALF_OPEN';
      posthog.capture('circuit_breaker_half_open', { state: this.state });
      return true;
    }
    return false;
  }

  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures = 0;
      posthog.capture('circuit_breaker_reset', { state: this.state });
    }
  }

  onFailure() {
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.lastFailureTime = Date.now();
      posthog.capture('circuit_breaker_triggered', {
        failures: this.failures,
        state: this.state,
        reason: 'HALF_OPEN failure',
      });
      return;
    }
    this.failures += 1;
    this.lastFailureTime = Date.now();
    if (this.failures >= this.FAILURE_THRESHOLD) {
      this.state = 'OPEN';
      posthog.capture('circuit_breaker_triggered', { failures: this.failures });
    }
  }
}

export default HumeCircuitBreaker;
