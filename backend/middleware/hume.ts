// backend/middleware/hume.js
import posthog from '../services/posthog.js';

// Add type for circuit breaker state
export type CircuitBreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class HumeCircuitBreaker {
  failures: number;
  lastFailureTime: number;
  state: CircuitBreakerState;
  FAILURE_THRESHOLD: number;
  RESET_TIMEOUT: number;

  constructor() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
    this.FAILURE_THRESHOLD = 5;
    this.RESET_TIMEOUT = 60000; // 1 minute
  }

  isOpen(): boolean {
    return this.state === 'OPEN';
  }

  shouldAttemptReset(): boolean {
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

  onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures = 0;
      posthog.capture('circuit_breaker_reset', { state: this.state });
    }
  }

  onFailure(): void {
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
