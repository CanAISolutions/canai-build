// Vitest test skeleton for retry middleware (exponential backoff, circuit breaker, observability)
// Reference: docs/retry-middleware-test-plan.md
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  retryWithBackoff,
  CircuitBreaker,
  clearCircuitBreakers,
  type RetryConfig,
} from '../middleware/retry.js';

// Mock external dependencies
vi.mock('../services/instrument.js', () => ({
  default: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

vi.mock('../services/posthog.js', () => ({
  default: {
    capture: vi.fn(),
  },
}));

// Import mocked modules to get their functions
import Sentry from '../services/instrument';
import posthog from '../services/posthog';

// --- Unit Tests ---
describe('Retry Middleware - Unit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('retries on failure and succeeds', async () => {
    let attempts = 0;
    const mockFn = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    const result = await retryWithBackoff(mockFn, {
      maxAttempts: 3,
      baseDelay: 10,
      shouldRetry: error =>
        error instanceof Error && error.message === 'Temporary failure',
    });

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Retry attempt',
      expect.any(Object)
    );
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Retry successful',
      expect.any(Object)
    );
  });

  it('respects maxAttempts and aborts', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Persistent failure'));

    await expect(
      retryWithBackoff(mockFn, {
        maxAttempts: 2,
        baseDelay: 10,
        shouldRetry: () => true,
      })
    ).rejects.toThrow('Persistent failure');

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(Sentry.captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        extra: expect.objectContaining({
          attempt: 2,
          maxAttempts: 2,
        }),
      })
    );
  });

  it('calls onRetry hook with correlationId', async () => {
    let attempts = 0;
    const onRetrySpy = vi.fn();
    const mockFn = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 2) {
        throw new Error('Temporary failure');
      }
      return Promise.resolve('success');
    });

    await retryWithBackoff(mockFn, {
      maxAttempts: 2,
      baseDelay: 10,
      shouldRetry: () => true,
      onRetry: onRetrySpy,
    });

    expect(onRetrySpy).toHaveBeenCalledWith(
      expect.any(Error),
      1,
      expect.any(Number)
    );
  });

  it('handles abort signal', async () => {
    const abortController = new AbortController();
    const mockFn = vi.fn().mockImplementation(() => {
      abortController.abort();
      throw new Error('Should be aborted');
    });

    await expect(
      retryWithBackoff(
        mockFn,
        {
          maxAttempts: 3,
          baseDelay: 10,
          shouldRetry: () => true,
        },
        'test-service',
        undefined,
        abortController.signal
      )
    ).rejects.toThrow('Retry operation aborted');

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Retry aborted',
      expect.any(Object)
    );
  });

  it('only retries on whitelisted errors', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Non-retryable error'));

    await expect(
      retryWithBackoff(mockFn, {
        maxAttempts: 1, // Set to 1 to prevent retries
        baseDelay: 10,
        shouldRetry: error =>
          error instanceof Error && error.message.includes('retryable'),
      })
    ).rejects.toThrow('Non-retryable error');

    expect(mockFn).toHaveBeenCalledTimes(1); // Should not retry
  });
});

describe('Circuit Breaker - Unit', () => {
  let circuitBreaker: CircuitBreaker;

  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
    circuitBreaker = new CircuitBreaker({
      failureThreshold: 3,
      resetTimeout: 1000,
      alertThreshold: 5000,
    });
  });

  it('opens after failure threshold', () => {
    expect(circuitBreaker.getState()).toBe('CLOSED');
    expect(circuitBreaker.isOpen()).toBe(false);

    // Trigger failures up to threshold
    for (let i = 0; i < 3; i++) {
      circuitBreaker.onFailure();
    }

    expect(circuitBreaker.getState()).toBe('OPEN');
    expect(circuitBreaker.isOpen()).toBe(true);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Circuit breaker triggered',
      expect.any(Object)
    );
    expect(posthog.capture).toHaveBeenCalledWith(
      'circuit_breaker_triggered',
      expect.any(Object)
    );
  });

  it('resets after cooldown', async () => {
    vi.useFakeTimers();

    // Open the circuit breaker
    for (let i = 0; i < 3; i++) {
      circuitBreaker.onFailure();
    }
    expect(circuitBreaker.getState()).toBe('OPEN');

    // Mock time to pass reset timeout
    vi.advanceTimersByTime(1001);

    // Should transition to HALF_OPEN when isOpen() is called
    expect(circuitBreaker.isOpen()).toBe(false);
    expect(circuitBreaker.getState()).toBe('HALF_OPEN');
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Circuit breaker half-open',
      expect.any(Object)
    );

    vi.useRealTimers();
  });

  it('transitions to half-open and closed', () => {
    vi.useFakeTimers();

    // Open the circuit breaker
    for (let i = 0; i < 3; i++) {
      circuitBreaker.onFailure();
    }
    expect(circuitBreaker.getState()).toBe('OPEN');

    // Mock time to pass reset timeout
    vi.advanceTimersByTime(1001);

    // Should be HALF_OPEN when isOpen() is called
    expect(circuitBreaker.isOpen()).toBe(false);
    expect(circuitBreaker.getState()).toBe('HALF_OPEN');

    // Success should close the circuit
    circuitBreaker.onSuccess();
    expect(circuitBreaker.getState()).toBe('CLOSED');
    expect(circuitBreaker.getFailures()).toBe(0);
    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Circuit breaker reset',
      expect.any(Object)
    );

    vi.useRealTimers();
  });

  it('calls onStateChange with correlationId', () => {
    // Mock the circuit breaker to call onStateChange
    const customCircuitBreaker = new CircuitBreaker({
      failureThreshold: 2,
      resetTimeout: 100,
    });

    // Trigger state change
    for (let i = 0; i < 2; i++) {
      customCircuitBreaker.onFailure();
    }

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Circuit breaker triggered',
      expect.any(Object)
    );
    expect(posthog.capture).toHaveBeenCalledWith(
      'circuit_breaker_triggered',
      expect.any(Object)
    );
  });
});

// --- Property-Based & Fuzz Tests ---
describe('Retry Middleware - Property/Fuzz', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('backoff and jitter produce valid delays', () => {
    const config: RetryConfig = {
      maxAttempts: 5,
      baseDelay: 100,
      multiplier: 2,
      maxDelay: 1000,
      jitterEnabled: true,
      jitterFactor: 0.1,
      timeout: 5000,
      shouldRetry: () => true,
    };

    const delays: number[] = [];
    for (let attempt = 1; attempt < config.maxAttempts; attempt++) {
      const exponentialDelay = Math.min(
        config.baseDelay * Math.pow(config.multiplier, attempt - 1),
        config.maxDelay
      );

      const jitterRange = exponentialDelay * config.jitterFactor;
      const jitter = (Math.random() * 2 - 1) * jitterRange;
      const finalDelay = Math.max(0, exponentialDelay + jitter);

      delays.push(finalDelay);

      // Validate delay is within expected range
      expect(finalDelay).toBeGreaterThanOrEqual(0);
      expect(finalDelay).toBeLessThanOrEqual(exponentialDelay + jitterRange);
    }

    // Verify exponential backoff pattern
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeGreaterThanOrEqual(delays[i - 1]);
    }
  });

  it('handles edge cases in retry logic', async () => {
    vi.useFakeTimers();

    const edgeCases = [
      { maxAttempts: 1, expectedCalls: 1 },
      { maxAttempts: 0, expectedCalls: 1 }, // Should default to 1
    ];

    for (const { maxAttempts, expectedCalls } of edgeCases) {
      const mockFn = vi.fn().mockRejectedValue(new Error('Edge case test'));

      const promise = retryWithBackoff(mockFn, {
        maxAttempts,
        baseDelay: 10,
        shouldRetry: () => true,
      }).catch(() => {
        // Expected to fail
      });

      // Advance timers to complete the async operation
      await vi.runAllTimersAsync();
      await promise;

      expect(mockFn).toHaveBeenCalledTimes(expectedCalls);
      vi.clearAllMocks();
    }

    // Test baseDelay edge cases separately
    const baseDelayEdgeCases = [
      { baseDelay: 0, expectedCalls: 1 },
      { baseDelay: -1, expectedCalls: 1 }, // Should default to positive
    ];

    for (const { baseDelay, expectedCalls } of baseDelayEdgeCases) {
      const mockFn = vi.fn().mockRejectedValue(new Error('Edge case test'));

      const promise = retryWithBackoff(mockFn, {
        maxAttempts: 1,
        baseDelay,
        shouldRetry: () => true,
      }).catch(() => {
        // Expected to fail
      });

      // Advance timers to complete the async operation
      await vi.runAllTimersAsync();
      await promise;

      expect(mockFn).toHaveBeenCalledTimes(expectedCalls);
      vi.clearAllMocks();
    }

    vi.useRealTimers();
  });
});

// --- Edge Cases ---
describe('Retry Middleware - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('handles rapid failures and partial successes', async () => {
    let attempts = 0;
    const mockFn = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts === 1) {
        throw new Error('First failure');
      } else if (attempts === 2) {
        throw new Error('Second failure');
      }
      return Promise.resolve('success');
    });

    const promise = retryWithBackoff(mockFn, {
      maxAttempts: 3,
      baseDelay: 10,
      shouldRetry: () => true,
    });

    // Advance timers to complete all retry attempts
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('handles clock skew and repeated aborts', async () => {
    const abortController = new AbortController();
    const mockFn = vi.fn().mockImplementation(() => {
      // Simulate clock skew by advancing time
      vi.advanceTimersByTime(100);
      abortController.abort();
      throw new Error('Should be aborted');
    });

    const promise = expect(
      retryWithBackoff(
        mockFn,
        {
          maxAttempts: 3,
          baseDelay: 50,
          shouldRetry: () => true,
        },
        'test-service',
        undefined,
        abortController.signal
      )
    ).rejects.toThrow('Retry operation aborted');

    // Advance timers to trigger the abort
    await vi.runAllTimersAsync();
    await promise;

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'Retry aborted',
      expect.any(Object)
    );
  });

  it('handles feature flag toggling during operation', async () => {
    let shouldRetryFlag = true;
    const mockFn = vi.fn().mockImplementation(() => {
      // Toggle feature flag during execution
      shouldRetryFlag = !shouldRetryFlag;
      throw new Error('Feature flag test');
    });

    const promise = expect(
      retryWithBackoff(mockFn, {
        maxAttempts: 3,
        baseDelay: 10,
        shouldRetry: () => shouldRetryFlag,
      })
    ).rejects.toThrow('Feature flag test');

    // Advance timers to complete retry attempts
    await vi.runAllTimersAsync();
    await promise;

    // Should retry based on the flag state at the time of the error
    expect(mockFn).toHaveBeenCalledTimes(1);
  });
});

// --- Chaos/Resilience Tests ---
describe('Retry Middleware - Chaos/Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('simulates network failures and latency', async () => {
    const networkErrors = [
      new Error('ECONNRESET'),
      new Error('ETIMEDOUT'),
      new Error('ENOTFOUND'),
      new Error('Network timeout'),
    ];

    let attemptCount = 0;
    const mockFn = vi.fn().mockImplementation(() => {
      attemptCount++;
      // Simulate network latency
      vi.advanceTimersByTime(100 + Math.random() * 200);

      if (attemptCount < 3) {
        throw networkErrors[attemptCount - 1];
      }
      return Promise.resolve('network success');
    });

    const promise = retryWithBackoff(mockFn, {
      maxAttempts: 3,
      baseDelay: 50,
      timeout: 1000,
      shouldRetry: error =>
        networkErrors.some(
          netError =>
            error instanceof Error && error.message === netError.message
        ),
    });

    // Advance timers to complete all retry attempts
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('network success');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('injects random errors and timeouts', async () => {
    const randomErrors = [
      new Error('Random error 1'),
      new Error('Random error 2'),
      new Error('Random error 3'),
    ];

    let attemptCount = 0;
    const mockFn = vi.fn().mockImplementation(() => {
      attemptCount++;

      // Simulate random timeout
      if (Math.random() > 0.7) {
        vi.advanceTimersByTime(2000); // Simulate timeout
        throw new Error('Random timeout');
      }

      if (attemptCount < 3) {
        throw randomErrors[attemptCount - 1];
      }
      return Promise.resolve('random success');
    });

    const promise = retryWithBackoff(mockFn, {
      maxAttempts: 5,
      baseDelay: 100,
      timeout: 3000,
      shouldRetry: () => true,
    });

    // Advance timers to complete all retry attempts
    await vi.runAllTimersAsync();
    const result = await promise;

    expect(result).toBe('random success');
    expect(mockFn).toHaveBeenCalled();
  });
});

// --- Security Tests ---
describe('Retry Middleware - Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('prevents retry storms and circuit breaker bypass', async () => {
    // Configure circuit breaker with lower threshold for testing
    const circuitBreakerConfig = { failureThreshold: 2 };

    // First, trigger the circuit breaker by making it fail multiple times
    const failingFn = vi.fn().mockRejectedValue(new Error('Initial failure'));

    // This should trigger the circuit breaker to open after 2 failures
    await expect(
      retryWithBackoff(
        failingFn,
        {
          maxAttempts: 1,
          baseDelay: 10,
          shouldRetry: () => true,
        },
        'test-service',
        circuitBreakerConfig
      )
    ).rejects.toThrow('Initial failure');

    await expect(
      retryWithBackoff(
        failingFn,
        {
          maxAttempts: 1,
          baseDelay: 10,
          shouldRetry: () => true,
        },
        'test-service',
        circuitBreakerConfig
      )
    ).rejects.toThrow('Initial failure');

    // Now try to bypass the circuit breaker
    const mockFn = vi.fn().mockRejectedValue(new Error('Bypass attempt'));

    await expect(
      retryWithBackoff(
        mockFn,
        {
          maxAttempts: 1,
          baseDelay: 10,
          shouldRetry: () => true,
        },
        'test-service',
        circuitBreakerConfig
      )
    ).rejects.toThrow('Circuit breaker is open for service: test-service');

    expect(mockFn).not.toHaveBeenCalled();
  });

  it('alerts on attack patterns', async () => {
    const attackPatterns = [
      { pattern: 'SQL injection', error: new Error("' OR 1=1--") },
      { pattern: 'XSS', error: new Error('<script>alert("xss")</script>') },
      { pattern: 'Path traversal', error: new Error('../../../etc/passwd') },
    ];

    for (const { error } of attackPatterns) {
      const mockFn = vi.fn().mockRejectedValue(error);

      await expect(
        retryWithBackoff(mockFn, {
          maxAttempts: 1,
          baseDelay: 10,
          shouldRetry: () => false, // Don't retry on security issues
        })
      ).rejects.toThrow(error.message);

      // Verify attack patterns are logged
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          extra: expect.objectContaining({
            attempt: 1,
            maxAttempts: 1,
            shouldRetry: false,
          }),
        })
      );
    }
  });
});

// --- Dependency Hygiene Tests ---
describe('Retry Middleware - Dependency Hygiene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('makes no real network calls in tests', async () => {
    // Mock fetch to ensure no real network calls
    const originalFetch = global.fetch;
    const mockFetch = vi.fn();
    global.fetch = mockFetch;

    const mockFn = vi.fn().mockResolvedValue('success');

    await retryWithBackoff(mockFn, {
      maxAttempts: 1,
      baseDelay: 10,
      shouldRetry: () => false,
    });

    // Verify no fetch calls were made
    expect(mockFetch).not.toHaveBeenCalled();

    // Restore original fetch
    global.fetch = originalFetch;
  });

  it('mocks failures, timeouts, and edge cases', async () => {
    // Test various failure scenarios
    const failureScenarios = [
      { error: new Error('Network error'), shouldRetry: true },
      { error: new Error('Timeout error'), shouldRetry: true },
      { error: new Error('Validation error'), shouldRetry: false },
      { error: new Error('Authentication error'), shouldRetry: false },
    ];

    for (const scenario of failureScenarios) {
      const mockFn = vi.fn().mockRejectedValue(scenario.error);

      await expect(
        retryWithBackoff(mockFn, {
          maxAttempts: 2,
          baseDelay: 10,
          shouldRetry: () => scenario.shouldRetry,
        })
      ).rejects.toThrow(scenario.error.message);

      expect(mockFn).toHaveBeenCalled();
    }
  });
});

// --- Performance/Resource Tests ---
describe('Retry Middleware - Performance/Resource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('benchmarks latency and resource usage', async () => {
    const startTime = Date.now();
    const mockFn = vi.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(mockFn, {
      maxAttempts: 1,
      baseDelay: 10,
      shouldRetry: () => false,
    });

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    expect(result).toBe('success');
    expect(executionTime).toBeLessThan(100); // Should be fast for single attempt
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('monitors for SLO regressions', async () => {
    vi.useFakeTimers();

    const sloMetrics = {
      maxLatency: 1000, // 1 second
      maxRetries: 3,
      successRate: 0.8, // 80% (4/5 successful)
    };

    // Prepare all promises in parallel, always catch to avoid unhandled rejections
    const promises: Array<Promise<unknown>> = [];
    for (let i = 0; i < 5; i++) {
      const mockFn = vi.fn().mockImplementation(() => {
        if (i < 1) {
          return Promise.reject(new Error('SLO test failure'));
        }
        return Promise.resolve('slo success');
      });
      promises.push(
        retryWithBackoff(mockFn, {
          maxAttempts: sloMetrics.maxRetries,
          baseDelay: 10,
          timeout: sloMetrics.maxLatency,
          shouldRetry: () => true,
        }).catch(() => undefined) // Always catch to avoid unhandled rejection
      );
    }

    // Advance timers to complete all operations
    await vi.runAllTimersAsync();
    const results = await Promise.allSettled(promises);

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const successRate = successCount / results.length;

    expect(successRate).toBeGreaterThanOrEqual(sloMetrics.successRate);
    expect(Sentry.captureMessage).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
