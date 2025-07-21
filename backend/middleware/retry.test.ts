import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  retryWithBackoff, 
  CircuitBreaker, 
  getCircuitBreaker, 
  createRetryWrapper,
  clearCircuitBreakers,
  DEFAULT_RETRY_CONFIG,
  retryMiddleware,
  type RetryConfig,
  type CircuitBreakerConfig
} from './retry.js';

// Mock Express types for testing
interface MockRequest {
  path?: string;
  retryContext?: {
    attempts: number;
    startTime: number;
    serviceName: string;
    abortController?: AbortController;
    config?: RetryConfig;
  };
  emit?: (event: string) => void;
  on?: (event: string, handler: () => void) => void;
}

interface MockResponse {
  send: (data: unknown) => MockResponse;
  json: (data: unknown) => MockResponse;
}

// Helper function to create proper mock request with event emitter
function createMockRequest(path: string = '/test'): MockRequest {
  const handlers: { [key: string]: (() => void)[] } = {};
  
  return {
    path,
    on: (event: string, handler: () => void) => {
      if (!handlers[event]) {
        handlers[event] = [];
      }
      handlers[event].push(handler);
    },
    emit: (event: string) => {
      if (handlers[event]) {
        handlers[event].forEach(handler => handler());
      }
    }
  };
}

// Mock external dependencies
vi.mock('../services/instrument.js', () => ({
  default: {
    captureMessage: vi.fn(),
    captureException: vi.fn()
  }
}));

vi.mock('../services/posthog.js', () => ({
  default: {
    capture: vi.fn()
  }
}));

describe('Retry Middleware with Exponential Backoff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearCircuitBreakers(); // Clear circuit breakers between tests
  });

  describe('CircuitBreaker', () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker();
    });

    it('should start in CLOSED state', () => {
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailures()).toBe(0);
    });

    it('should transition to OPEN after failure threshold', () => {
      // Trigger failures up to threshold
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }

      expect(circuitBreaker.getState()).toBe('OPEN');
      expect(circuitBreaker.getFailures()).toBe(5);
    });

    it('should transition to HALF_OPEN after reset timeout', () => {
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }
      expect(circuitBreaker.getState()).toBe('OPEN');

      // Advance time past reset timeout
      vi.useFakeTimers();
      vi.advanceTimersByTime(60001);

      // Call isOpen to trigger state transition
      circuitBreaker.isOpen();
      expect(circuitBreaker.getState()).toBe('HALF_OPEN');
      vi.useRealTimers();
    });

    it('should reset to CLOSED on success in HALF_OPEN state', () => {
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }

      // Advance time to trigger HALF_OPEN
      vi.useFakeTimers();
      vi.advanceTimersByTime(60001);
      circuitBreaker.isOpen(); // Trigger state transition

      // Success should reset the circuit
      circuitBreaker.onSuccess();

      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailures()).toBe(0);
      vi.useRealTimers();
    });

    it('should return to OPEN on failure in HALF_OPEN state', () => {
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }

      // Advance time to trigger HALF_OPEN
      vi.useFakeTimers();
      vi.advanceTimersByTime(60001);
      circuitBreaker.isOpen(); // Trigger state transition

      // Failure should return to OPEN
      circuitBreaker.onFailure();

      expect(circuitBreaker.getState()).toBe('OPEN');
      vi.useRealTimers();
    });

    it('should not change state on success in CLOSED state', () => {
      circuitBreaker.onSuccess();
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailures()).toBe(0);
    });

    it('should handle custom configuration', () => {
      const customConfig: CircuitBreakerConfig = {
        failureThreshold: 3,
        resetTimeout: 30000,
        alertThreshold: 120000
      };

      const customBreaker = new CircuitBreaker(customConfig);

      // Should open after 3 failures
      for (let i = 0; i < 3; i++) {
        customBreaker.onFailure();
      }

      expect(customBreaker.getState()).toBe('OPEN');

      // Should transition to HALF_OPEN after 30 seconds
      vi.useFakeTimers();
      vi.advanceTimersByTime(30001);
      customBreaker.isOpen(); // Trigger state transition
      expect(customBreaker.getState()).toBe('HALF_OPEN');
      vi.useRealTimers();
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const result = await retryWithBackoff(mockFn, {}, 'test-success');
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should not retry on non-retriable errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Validation failed'));
      
      await expect(retryWithBackoff(mockFn, {}, 'test-non-retriable')).rejects.toThrow('Validation failed');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call onSuccess callback', async () => {
      const onSuccess = vi.fn();
      const config: Partial<RetryConfig> = { onSuccess };

      const mockFn = vi.fn().mockResolvedValue('success');

      await retryWithBackoff(mockFn, config, 'test-on-success');
      
      expect(onSuccess).toHaveBeenCalledWith('success', 1);
    });

    it('should call onFailure callback', async () => {
      const onFailure = vi.fn();
      const config: Partial<RetryConfig> = { onFailure };

      const mockFn = vi.fn().mockRejectedValue(new Error('Validation failed'));

      await expect(retryWithBackoff(mockFn, config, 'test-on-failure')).rejects.toThrow('Validation failed');
      
      expect(onFailure).toHaveBeenCalledWith(
        expect.any(Error),
        1
      );
    });

    it('should handle circuit breaker integration', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
      
      // Use custom config with lower failure threshold to trigger circuit breaker quickly
      const config: Partial<RetryConfig> = {
        maxAttempts: 1 // Only try once to avoid multiple retries
      };
      
      const circuitConfig: Partial<CircuitBreakerConfig> = {
        failureThreshold: 1 // Open circuit after 1 failure
      };
      
      // First call should fail and open circuit
      await expect(retryWithBackoff(mockFn, config, 'test-circuit', circuitConfig)).rejects.toThrow('ECONNRESET');
      
      // Second call should fail immediately due to open circuit
      await expect(retryWithBackoff(mockFn, config, 'test-circuit', circuitConfig)).rejects.toThrow('Circuit breaker is open');
    });

    it('should handle different error types correctly', () => {
      const testCases = [
        { error: { code: 'ECONNRESET' }, shouldRetry: true },
        { error: { code: 'ENOTFOUND' }, shouldRetry: true },
        { error: { code: 'ETIMEDOUT' }, shouldRetry: true },
        { error: { status: 500 }, shouldRetry: true },
        { error: { status: 502 }, shouldRetry: true },
        { error: { status: 429 }, shouldRetry: true },
        { error: { status: 400 }, shouldRetry: false },
        { error: { status: 404 }, shouldRetry: false },
        { error: new Error('Random error'), shouldRetry: false }
      ];

      for (const testCase of testCases) {
        const shouldRetry = DEFAULT_RETRY_CONFIG.shouldRetry;
        expect(shouldRetry(testCase.error)).toBe(testCase.shouldRetry);
      }
    });
  });

  describe('getCircuitBreaker', () => {
    it('should return same instance for same service name', () => {
      const breaker1 = getCircuitBreaker('test-service');
      const breaker2 = getCircuitBreaker('test-service');
      
      expect(breaker1).toBe(breaker2);
    });

    it('should return different instances for different service names', () => {
      const breaker1 = getCircuitBreaker('service-1');
      const breaker2 = getCircuitBreaker('service-2');
      
      expect(breaker1).not.toBe(breaker2);
    });

    it('should apply custom configuration', () => {
      const config: Partial<CircuitBreakerConfig> = {
        failureThreshold: 2
      };

      const breaker = getCircuitBreaker('test-service', config);
      
      // Should open after 2 failures instead of 5
      breaker.onFailure();
      breaker.onFailure();
      
      expect(breaker.getState()).toBe('OPEN');
    });
  });

  describe('createRetryWrapper', () => {
    it('should create wrapper with service name', async () => {
      const wrapper = createRetryWrapper('test-service');
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const result = await wrapper(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('DEFAULT_RETRY_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_RETRY_CONFIG.maxAttempts).toBe(3);
      expect(DEFAULT_RETRY_CONFIG.baseDelay).toBe(500);
      expect(DEFAULT_RETRY_CONFIG.multiplier).toBe(2);
      expect(DEFAULT_RETRY_CONFIG.maxDelay).toBe(5000);
      expect(DEFAULT_RETRY_CONFIG.jitterEnabled).toBe(true);
      expect(DEFAULT_RETRY_CONFIG.jitterFactor).toBe(0.2);
      expect(DEFAULT_RETRY_CONFIG.timeout).toBe(10000);
      expect(typeof DEFAULT_RETRY_CONFIG.shouldRetry).toBe('function');
    });

    it('should have working shouldRetry function', () => {
      const shouldRetry = DEFAULT_RETRY_CONFIG.shouldRetry;
      
      expect(shouldRetry({ code: 'ECONNRESET' })).toBe(true);
      expect(shouldRetry({ status: 500 })).toBe(true);
      expect(shouldRetry({ status: 429 })).toBe(true);
      expect(shouldRetry({ status: 400 })).toBe(false);
      expect(shouldRetry(new Error('Random error'))).toBe(false);
    });
  });

  describe('Edge cases and error scenarios', () => {
    it('should handle memory pressure scenarios', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');
      
      // Create many retry operations to test memory usage
      const promises = Array.from({ length: 100 }, (_, i) => 
        retryWithBackoff(mockFn, {}, `service-${i}`)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(100);
      expect(results.every(r => r === 'success')).toBe(true);
    });
  });

  describe('Performance and memory tests', () => {
    it('should handle concurrent retry operations', async () => {
      const mockFn = vi.fn().mockResolvedValue('success');

      const promises = Array.from({ length: 10 }, (_, i) => 
        retryWithBackoff(mockFn, {}, `concurrent-${i}`)
      );
      
      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(10);
      expect(results.every(r => r === 'success')).toBe(true);
      expect(mockFn).toHaveBeenCalledTimes(10);
    });
  });

  describe('Edge cases and uncovered scenarios', () => {
    it('should handle timeout scenarios', async () => {
      const mockFn = vi.fn().mockImplementation(() => 
        new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 100))
      );

      const config: Partial<RetryConfig> = {
        timeout: 50,
        maxAttempts: 1
      };

      await expect(retryWithBackoff(mockFn, config, 'timeout-test')).rejects.toThrow('Request timeout');
    });

    it('should handle jitter calculation edge cases', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
      
      const config: Partial<RetryConfig> = {
        maxAttempts: 2,
        baseDelay: 100,
        jitterEnabled: true,
        jitterFactor: 0.5
      };

      // Mock Math.random to test jitter calculation
      const originalRandom = Math.random;
      Math.random = vi.fn().mockReturnValue(0.5);

      try {
        await expect(retryWithBackoff(mockFn, config, 'jitter-test')).rejects.toThrow('ECONNRESET');
      } finally {
        Math.random = originalRandom;
      }
    });

    it('should handle disabled jitter', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
      
      const config: Partial<RetryConfig> = {
        maxAttempts: 2,
        baseDelay: 100,
        jitterEnabled: false
      };

      await expect(retryWithBackoff(mockFn, config, 'no-jitter-test')).rejects.toThrow('ECONNRESET');
    });

    it('should handle max delay enforcement', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
      
      const config: Partial<RetryConfig> = {
        maxAttempts: 3,
        baseDelay: 1000,
        multiplier: 10,
        maxDelay: 1500
      };

      await expect(retryWithBackoff(mockFn, config, 'max-delay-test')).rejects.toThrow('ECONNRESET');
    });

    it('should handle onRetry callback', async () => {
      const onRetry = vi.fn();
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
      
      const config: Partial<RetryConfig> = {
        maxAttempts: 2,
        onRetry
      };

      await expect(retryWithBackoff(mockFn, config, 'onretry-test')).rejects.toThrow('ECONNRESET');
      expect(onRetry).toHaveBeenCalledWith(expect.any(Error), 1, expect.any(Number));
    });

    it('should handle success after retry with onSuccess callback', async () => {
      const onSuccess = vi.fn();
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('ECONNRESET'))
        .mockResolvedValue('success');
      
      const config: Partial<RetryConfig> = {
        maxAttempts: 2,
        onSuccess
      };

      const result = await retryWithBackoff(mockFn, config, 'onsuccess-test');
      expect(result).toBe('success');
      expect(onSuccess).toHaveBeenCalledWith('success', 2);
    });

    it('should handle error message classification', () => {
      const shouldRetry = DEFAULT_RETRY_CONFIG.shouldRetry;
      
      // Test error message classification
      expect(shouldRetry({ message: 'ECONNRESET' })).toBe(true);
      expect(shouldRetry({ message: 'ENOTFOUND' })).toBe(true);
      expect(shouldRetry({ message: 'ETIMEDOUT' })).toBe(true);
      expect(shouldRetry({ message: 'Random error' })).toBe(false);
    });

    it('should handle non-string error messages', () => {
      const shouldRetry = DEFAULT_RETRY_CONFIG.shouldRetry;
      
      expect(shouldRetry({ message: 123 })).toBe(false);
      expect(shouldRetry({ message: null })).toBe(false);
      expect(shouldRetry({ message: undefined })).toBe(false);
    });

    it('should handle circuit breaker alert threshold', () => {
      const circuitBreaker = new CircuitBreaker({ alertThreshold: 1000 });
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }
      
      // Advance time past alert threshold
      vi.useFakeTimers();
      vi.advanceTimersByTime(1001);
      
      // This should trigger alert logic (though we can't easily test the alert itself)
      circuitBreaker.isOpen();
      
      vi.useRealTimers();
    });

    it('should handle circuit breaker reset', () => {
      const circuitBreaker = new CircuitBreaker();
      
      // Open the circuit
      for (let i = 0; i < 5; i++) {
        circuitBreaker.onFailure();
      }
      
      // Reset the circuit
      circuitBreaker.reset();
      
      expect(circuitBreaker.getState()).toBe('CLOSED');
      expect(circuitBreaker.getFailures()).toBe(0);
    });

    it('should handle retry middleware context', () => {
      const middleware = retryMiddleware();
      const req: MockRequest = { path: '/api/test' };
      const res: MockResponse = {
        send: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      const next = vi.fn();

      middleware(req, res, next);

      expect(req.retryContext).toBeDefined();
      expect(req.retryContext!.serviceName).toBe('/api/test');
      expect(req.retryContext!.attempts).toBe(0);
      expect(next).toHaveBeenCalled();
    });

    it('should handle retry middleware with unknown path', () => {
      const middleware = retryMiddleware();
      const req: MockRequest = {};
      const res: MockResponse = {
        send: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      const next = vi.fn();

      middleware(req, res, next);

      expect(req.retryContext!.serviceName).toBe('unknown');
    });

    it('should handle retry middleware response tracking', () => {
      const middleware = retryMiddleware();
      const req: MockRequest = { path: '/api/test' };
      const originalSend = vi.fn().mockReturnThis();
      const originalJson = vi.fn().mockReturnThis();
      const res: MockResponse = {
        send: originalSend,
        json: originalJson
      };
      const next = vi.fn();

      middleware(req, res, next);

      // Test send tracking
      res.send('test data');
      expect(req.retryContext!.attempts).toBe(1);

      // Test json tracking
      res.json({ test: 'data' });
      expect(req.retryContext!.attempts).toBe(2);
    });

    it('should handle createRetryWrapper with custom config', async () => {
      const config: Partial<RetryConfig> = {
        maxAttempts: 2,
        baseDelay: 100
      };

      const wrapper = createRetryWrapper('test-service', config);
      const mockFn = vi.fn().mockResolvedValue('success');
      
      const result = await wrapper(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should handle exponential backoff calculation edge cases', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
      
      const config: Partial<RetryConfig> = {
        maxAttempts: 3,
        baseDelay: 100,
        multiplier: 1.5
      };

      await expect(retryWithBackoff(mockFn, config, 'backoff-test')).rejects.toThrow('ECONNRESET');
    });

    it('should handle zero base delay', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
      
      const config: Partial<RetryConfig> = {
        maxAttempts: 2,
        baseDelay: 0
      };

      await expect(retryWithBackoff(mockFn, config, 'zero-delay-test')).rejects.toThrow('ECONNRESET');
    });

    it('should handle edge case where lastError is thrown', async () => {
      // This test covers the final throw lastError statement
      // by creating a scenario where the loop exits without throwing
      const mockFn = vi.fn().mockRejectedValue(new Error('ECONNRESET'));
      
      const config: Partial<RetryConfig> = {
        maxAttempts: 0, // This will cause the loop to exit immediately
        shouldRetry: () => false // Don't retry any errors
      };

      await expect(retryWithBackoff(mockFn, config, 'edge-case-test')).rejects.toThrow('ECONNRESET');
    });
  });

  describe('AbortController Support', () => {
    it('should abort retry operation when AbortSignal is triggered', async () => {
      const abortController = new AbortController();
      let attemptCount = 0;
      
      const failingFn = async () => {
        attemptCount++;
        // Simulate a delay to allow abort to be triggered
        await new Promise(resolve => setTimeout(resolve, 10));
        throw new Error('Network error');
      };

      // Start retry operation
      const retryPromise = retryWithBackoff(failingFn, {
        maxAttempts: 5,
        baseDelay: 100
      }, 'test-service', undefined, abortController.signal);

      // Abort after a short delay to allow the function to start
      setTimeout(() => abortController.abort(), 5);

      await expect(retryPromise).rejects.toThrow('Retry operation aborted');
      expect(attemptCount).toBe(1); // Should attempt once before being aborted
    });

    it('should handle timeout with abort signal', async () => {
      const abortController = new AbortController();
      
      const slowFn = async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'success';
      };

      const retryPromise = retryWithBackoff(slowFn, {
        timeout: 100
      }, 'test-service', undefined, abortController.signal);

      // Abort before timeout
      setTimeout(() => abortController.abort(), 50);

      await expect(retryPromise).rejects.toThrow('Retry operation aborted');
    });
  });

  describe('Express Middleware', () => {
    it('should add retry context to request', () => {
      const req = createMockRequest('/test');
      const res: MockResponse = {
        send: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      const next = vi.fn();

      const middleware = retryMiddleware();
      middleware(req, res, next);

      expect(req.retryContext).toBeDefined();
      expect(req.retryContext?.attempts).toBe(0);
      expect(req.retryContext?.startTime).toBeDefined();
      expect(req.retryContext?.serviceName).toBe('/test');
      expect(req.retryContext?.abortController).toBeDefined();
      expect(req.retryContext?.config).toBeDefined();
      expect(next).toHaveBeenCalled();
    });

    it('should track response attempts', () => {
      const req = createMockRequest('/test');
      const originalSend = vi.fn().mockReturnThis();
      const originalJson = vi.fn().mockReturnThis();
      const res: MockResponse = {
        send: originalSend,
        json: originalJson
      };
      const next = vi.fn();

      const middleware = retryMiddleware();
      middleware(req, res, next);

      expect(req.retryContext?.attempts).toBe(0);
      
      // Call the overridden methods
      res.send('test');
      expect(req.retryContext?.attempts).toBe(1);
      
      res.json({ test: 'data' });
      expect(req.retryContext?.attempts).toBe(2);
    });

    it('should handle request close events', () => {
      const req = createMockRequest('/test');
      const res: MockResponse = {
        send: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      const next = vi.fn();

      const middleware = retryMiddleware();
      middleware(req, res, next);

      const abortController = req.retryContext?.abortController;
      const abortSpy = vi.spyOn(abortController!, 'abort');

      // Simulate request close
      req.emit!('close');

      expect(abortSpy).toHaveBeenCalled();
    });

    it('should use custom configuration', () => {
      const customConfig = {
        maxAttempts: 5,
        baseDelay: 1000,
        timeout: 15000
      };

      const req = createMockRequest('/test');
      const res: MockResponse = {
        send: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis()
      };
      const next = vi.fn();

      const middleware = retryMiddleware(customConfig);
      middleware(req, res, next);

      expect(req.retryContext?.config?.maxAttempts).toBe(5);
      expect(req.retryContext?.config?.baseDelay).toBe(1000);
      expect(req.retryContext?.config?.timeout).toBe(15000);
    });
  });
}); 