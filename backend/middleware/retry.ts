import Sentry from '../services/instrument.js';
import posthog from '../services/posthog.js';

// Types and interfaces
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  multiplier: number;
  maxDelay: number;
  jitterEnabled: boolean;
  jitterFactor: number;
  timeout: number;
  shouldRetry: (error: unknown) => boolean;
  onRetry?: (error: unknown, attempt: number, delay: number) => void;
  onSuccess?: (result: unknown, attempt: number) => void;
  onFailure?: (error: unknown, attempts: number) => void;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  alertThreshold: number;
}

// Express types
interface ExpressRequest {
  path?: string;
  retryContext?: {
    attempts: number;
    startTime: number;
    serviceName: string;
    abortController?: AbortController;
    config?: RetryConfig;
  };
  on?: (event: string, handler: () => void) => void;
}

interface ExpressResponse {
  send: (data: unknown) => ExpressResponse;
  json: (data: unknown) => ExpressResponse;
}

interface ExpressNext {
  (): void;
}

export class CircuitBreaker {
  private failures: number = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private lastFailureTime: number = 0;
  private lastStateChange: number = Date.now();
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      alertThreshold: 300000, // 5 minutes
      ...config,
    };
  }

  isOpen(): boolean {
    // Check if we should transition from OPEN to HALF_OPEN
    if (
      this.state === 'OPEN' &&
      Date.now() - this.lastFailureTime > this.config.resetTimeout
    ) {
      this.state = 'HALF_OPEN';
      this.lastStateChange = Date.now();

      // Log state transition
      Sentry.captureMessage('Circuit breaker half-open', {
        level: 'info',
        extra: {
          service: 'retry-middleware',
          state: this.state,
          failures: this.failures,
        },
      });

      posthog.capture('circuit_breaker_half_open', {
        state: this.state,
        failures: this.failures,
        timeOpen: Date.now() - this.lastFailureTime,
      });
    }

    // Alert if circuit has been open too long
    if (
      this.state === 'OPEN' &&
      Date.now() - this.lastStateChange > this.config.alertThreshold
    ) {
      Sentry.captureMessage('Circuit breaker open too long', {
        level: 'warning',
        extra: {
          service: 'retry-middleware',
          state: this.state,
          timeOpen: Date.now() - this.lastStateChange,
          alertThreshold: this.config.alertThreshold,
        },
      });
    }

    return this.state === 'OPEN';
  }

  onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures = 0;
      this.lastStateChange = Date.now();

      Sentry.captureMessage('Circuit breaker reset', {
        level: 'info',
        extra: {
          service: 'retry-middleware',
          state: this.state,
          failures: this.failures,
        },
      });

      posthog.capture('circuit_breaker_reset', {
        state: this.state,
        failures: this.failures,
      });
    }
  }

  onFailure(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.lastFailureTime = Date.now();
      this.lastStateChange = Date.now();

      Sentry.captureMessage('Circuit breaker triggered from half-open', {
        level: 'warning',
        extra: {
          service: 'retry-middleware',
          state: this.state,
          failures: this.failures,
          reason: 'HALF_OPEN failure',
        },
      });

      posthog.capture('circuit_breaker_triggered', {
        failures: this.failures,
        state: this.state,
        reason: 'HALF_OPEN failure',
      });
      return;
    }

    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.config.failureThreshold) {
      this.state = 'OPEN';
      this.lastStateChange = Date.now();

      Sentry.captureMessage('Circuit breaker triggered', {
        level: 'warning',
        extra: {
          service: 'retry-middleware',
          state: this.state,
          failures: this.failures,
          threshold: this.config.failureThreshold,
        },
      });

      posthog.capture('circuit_breaker_triggered', {
        failures: this.failures,
        state: this.state,
        threshold: this.config.failureThreshold,
      });
    }
  }

  getState(): string {
    return this.state;
  }

  getFailures(): number {
    return this.failures;
  }

  // Test helper to reset state
  reset(): void {
    this.failures = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
    this.lastStateChange = Date.now();
  }
}

// Default retry configuration
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 500,
  multiplier: 2,
  maxDelay: 5000,
  jitterEnabled: true,
  jitterFactor: 0.2,
  timeout: 10000,
  shouldRetry: (error: unknown) => {
    // Retry on network errors, 5xx server errors, and rate limits
    const err = error as { code?: string; status?: number; message?: string };

    if (
      err.code === 'ECONNRESET' ||
      err.code === 'ENOTFOUND' ||
      err.code === 'ETIMEDOUT'
    ) {
      return true;
    }

    if (err.status && err.status >= 500 && err.status < 600) {
      return true;
    }

    if (err.status === 429) {
      return true;
    }

    // Check error message for network-related errors
    if (err.message && typeof err.message === 'string') {
      const message = err.message.toLowerCase();
      if (
        message.includes('econnreset') ||
        message.includes('enotfound') ||
        message.includes('etimedout')
      ) {
        return true;
      }
    }

    return false;
  },
};

// Circuit breaker instances per service
const circuitBreakers = new Map<string, CircuitBreaker>();

export function getCircuitBreaker(
  serviceName: string,
  config?: Partial<CircuitBreakerConfig>
): CircuitBreaker {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, new CircuitBreaker(config));
  }
  return circuitBreakers.get(serviceName)!;
}

// Test helper to clear circuit breakers
export function clearCircuitBreakers(): void {
  circuitBreakers.clear();
}

// Express middleware for retry functionality
export function retryMiddleware(options: Partial<RetryConfig> = {}) {
  return async (
    req: ExpressRequest,
    res: ExpressResponse,
    next: ExpressNext
  ) => {
    // Create AbortController for this request
    const abortController = new AbortController();

    // Add retry context to request
    req.retryContext = {
      attempts: 0,
      startTime: Date.now(),
      serviceName: req.path || 'unknown',
      abortController,
      config: { ...DEFAULT_RETRY_CONFIG, ...options },
    };

    // Handle request cancellation (client disconnect, timeout, etc.)
    if (req.on) {
      req.on('close', () => {
        abortController.abort();
      });
    }

    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;

    // Override response methods to track attempts
    res.send = function (data: unknown) {
      if (req.retryContext) {
        req.retryContext.attempts++;
      }
      return originalSend.call(this, data);
    };

    res.json = function (data: unknown) {
      if (req.retryContext) {
        req.retryContext.attempts++;
      }
      return originalJson.call(this, data);
    };

    next();
  };
}

// Enhanced retry function with AbortController support
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryConfig> = {},
  serviceName: string = 'default',
  circuitBreakerConfig?: Partial<CircuitBreakerConfig>,
  abortSignal?: AbortSignal
): Promise<T> {
  const config = { ...DEFAULT_RETRY_CONFIG, ...options };
  const circuitBreaker = getCircuitBreaker(serviceName, circuitBreakerConfig);

  // Check circuit breaker first
  if (circuitBreaker.isOpen()) {
    const error = new Error(
      `Circuit breaker is open for service: ${serviceName}`
    );
    Sentry.captureException(error, {
      extra: {
        service: serviceName,
        circuitState: circuitBreaker.getState(),
        failures: circuitBreaker.getFailures(),
      },
    });
    throw error;
  }

  let attempt = 0;
  // let delay = config.baseDelay; // Unused variable - removed
  let lastError: unknown;

  while (attempt < config.maxAttempts) {
    // Check for abort signal before each attempt
    if (abortSignal?.aborted) {
      const abortError = new Error('Retry operation aborted');
      Sentry.captureMessage('Retry aborted', {
        level: 'info',
        extra: {
          service: serviceName,
          attempt: attempt,
          reason: 'AbortSignal triggered',
        },
      });
      throw abortError;
    }

    try {
      const result = await Promise.race([
        fn(),
        new Promise<never>((_, reject) => {
          const timeout = setTimeout(
            () => reject(new Error('Request timeout')),
            config.timeout
          );

          // Clean up timeout if aborted
          if (abortSignal) {
            abortSignal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('Retry operation aborted'));
            });
          }
        }),
      ]);

      // Success - reset circuit breaker
      circuitBreaker.onSuccess();

      if (config.onSuccess) {
        config.onSuccess(result, attempt + 1);
      }

      // Log successful retry if it wasn't the first attempt
      if (attempt > 0) {
        Sentry.captureMessage('Retry successful', {
          level: 'info',
          extra: {
            service: serviceName,
            attempt: attempt + 1,
            totalAttempts: attempt + 1,
          },
        });

        posthog.capture('retry_successful', {
          service: serviceName,
          attempt: attempt + 1,
          totalAttempts: attempt + 1,
        });
      }

      return result;
    } catch (error: unknown) {
      attempt++;
      lastError = error;

      // Check if we should retry
      if (attempt >= config.maxAttempts || !config.shouldRetry(error)) {
        circuitBreaker.onFailure();

        if (config.onFailure) {
          config.onFailure(error, attempt);
        }

        // Log final failure
        Sentry.captureException(error, {
          extra: {
            service: serviceName,
            attempt: attempt,
            maxAttempts: config.maxAttempts,
            shouldRetry: config.shouldRetry(error),
          },
        });

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorType =
          error instanceof Error ? error.constructor.name : 'Unknown';

        posthog.capture('retry_failed', {
          service: serviceName,
          attempt: attempt,
          maxAttempts: config.maxAttempts,
          errorType: errorType,
          errorMessage: errorMessage,
        });

        throw error;
      }

      // Calculate delay with exponential backoff
      const exponentialDelay = Math.min(
        config.baseDelay * Math.pow(config.multiplier, attempt - 1),
        config.maxDelay
      );

      // Add jitter if enabled
      let finalDelay = exponentialDelay;
      if (config.jitterEnabled) {
        const jitterRange = exponentialDelay * config.jitterFactor;
        const jitter = (Math.random() * 2 - 1) * jitterRange;
        finalDelay = Math.max(0, exponentialDelay + jitter);
      }

      // Log retry attempt
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorType =
        error instanceof Error ? error.constructor.name : 'Unknown';

      Sentry.captureMessage('Retry attempt', {
        level: 'info',
        extra: {
          service: serviceName,
          attempt: attempt,
          delay: finalDelay,
          error: errorMessage,
          errorType: errorType,
        },
      });

      posthog.capture('retry_attempt', {
        service: serviceName,
        attempt: attempt,
        delay: finalDelay,
        errorType: errorType,
        errorMessage: errorMessage,
      });

      if (config.onRetry) {
        config.onRetry(error, attempt, finalDelay);
      }

      // Wait before next attempt with abort support
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, finalDelay);

        if (abortSignal) {
          abortSignal.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new Error('Retry operation aborted'));
          });
        }
      });

      // delay = finalDelay; // Unused variable - removed
    }
  }

  throw lastError;
}

// Utility function to create retry wrapper for specific services
export function createRetryWrapper(
  serviceName: string,
  config?: Partial<RetryConfig>
) {
  return <T>(fn: () => Promise<T>): Promise<T> => {
    return retryWithBackoff(fn, config, serviceName);
  };
}

// Export default configuration for easy import
export { DEFAULT_RETRY_CONFIG };
