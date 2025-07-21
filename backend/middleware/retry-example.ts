import { 
  retryWithBackoff, 
  createRetryWrapper, 
  DEFAULT_RETRY_CONFIG,
  type RetryConfig,
  type CircuitBreakerConfig
} from './retry.js';

// Example 1: Basic usage with default configuration
async function basicExample() {
  console.log('=== Basic Retry Example ===');
  
  const mockApiCall = async () => {
    // Simulate a flaky API that sometimes fails
    if (Math.random() < 0.7) {
      throw new Error('ECONNRESET');
    }
    return 'API Response';
  };

  try {
    const result = await retryWithBackoff(mockApiCall, {}, 'api-service');
    console.log('Success:', result);
  } catch (error) {
    console.log('Failed after retries:', error.message);
  }
}

// Example 2: Custom retry configuration
async function customConfigExample() {
  console.log('\n=== Custom Configuration Example ===');
  
  const config: Partial<RetryConfig> = {
    maxAttempts: 5,
    baseDelay: 1000,
    multiplier: 1.5,
    maxDelay: 10000,
    jitterEnabled: false,
    timeout: 5000,
    onRetry: (error, attempt, delay) => {
      console.log(`Retry attempt ${attempt} after ${delay}ms delay. Error: ${error.message}`);
    },
    onSuccess: (result, attempt) => {
      console.log(`Success on attempt ${attempt}: ${result}`);
    },
    onFailure: (error, attempts) => {
      console.log(`Failed after ${attempts} attempts: ${error.message}`);
    }
  };

  const mockService = async () => {
    if (Math.random() < 0.8) {
      throw new Error('Service temporarily unavailable');
    }
    return 'Service Response';
  };

  try {
    const result = await retryWithBackoff(mockService, config, 'custom-service');
    console.log('Final result:', result);
  } catch (error) {
    console.log('Final failure:', error.message);
  }
}

// Example 3: Circuit breaker with custom thresholds
async function circuitBreakerExample() {
  console.log('\n=== Circuit Breaker Example ===');
  
  const circuitConfig: Partial<CircuitBreakerConfig> = {
    failureThreshold: 2,
    resetTimeout: 30000, // 30 seconds
    alertThreshold: 120000 // 2 minutes
  };

  const retryConfig: Partial<RetryConfig> = {
    maxAttempts: 1, // Only try once to demonstrate circuit breaker
    shouldRetry: (error) => {
      // Only retry on network errors
      return error.message.includes('ECONNRESET') || error.message.includes('ENOTFOUND');
    }
  };

  const mockFailingService = async () => {
    throw new Error('ECONNRESET');
  };

  // First call - should fail and increment circuit breaker
  try {
    await retryWithBackoff(mockFailingService, retryConfig, 'circuit-service', circuitConfig);
  } catch (error) {
    console.log('First call failed:', error.message);
  }

  // Second call - should fail and open circuit breaker
  try {
    await retryWithBackoff(mockFailingService, retryConfig, 'circuit-service', circuitConfig);
  } catch (error) {
    console.log('Second call failed:', error.message);
  }

  // Third call - should fail immediately due to open circuit breaker
  try {
    await retryWithBackoff(mockFailingService, retryConfig, 'circuit-service', circuitConfig);
  } catch (error) {
    console.log('Third call failed:', error.message);
  }
}

// Example 4: Service-specific retry wrapper
async function serviceWrapperExample() {
  console.log('\n=== Service Wrapper Example ===');
  
  // Create a retry wrapper for a specific service
  const gpt4oRetry = createRetryWrapper('gpt4o-service', {
    maxAttempts: 3,
    baseDelay: 2000,
    timeout: 30000,
    shouldRetry: (error) => {
      // Retry on rate limits and server errors
      return error.status === 429 || (error.status >= 500 && error.status < 600);
    }
  });

  const mockGPT4oCall = async () => {
    // Simulate GPT-4o API call
    if (Math.random() < 0.6) {
      const error: any = new Error('Rate limit exceeded');
      error.status = 429;
      throw error;
    }
    return 'AI Response';
  };

  try {
    const result = await gpt4oRetry(mockGPT4oCall);
    console.log('GPT-4o response:', result);
  } catch (error) {
    console.log('GPT-4o failed:', error.message);
  }
}

// Example 5: Error classification demonstration
async function errorClassificationExample() {
  console.log('\n=== Error Classification Example ===');
  
  const testErrors = [
    { error: { code: 'ECONNRESET' }, description: 'Network connection reset' },
    { error: { status: 500 }, description: 'Server error' },
    { error: { status: 429 }, description: 'Rate limit' },
    { error: { status: 400 }, description: 'Bad request' },
    { error: new Error('Validation failed'), description: 'Validation error' }
  ];

  for (const testCase of testErrors) {
    const shouldRetry = DEFAULT_RETRY_CONFIG.shouldRetry(testCase.error);
    console.log(`${testCase.description}: ${shouldRetry ? 'Will retry' : 'Will not retry'}`);
  }
}

// Example 6: Performance monitoring
async function performanceExample() {
  console.log('\n=== Performance Example ===');
  
  const config: Partial<RetryConfig> = {
    onRetry: (error, attempt, delay) => {
      console.log(`Performance: Retry ${attempt} with ${delay}ms delay`);
    },
    onSuccess: (result, attempt) => {
      console.log(`Performance: Success on attempt ${attempt}`);
    },
    onFailure: (error, attempts) => {
      console.log(`Performance: Failed after ${attempts} attempts`);
    }
  };

  const mockPerformanceTest = async () => {
    // Simulate varying response times
    const delay = Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    if (Math.random() < 0.3) {
      throw new Error('Timeout');
    }
    
    return 'Performance test result';
  };

  try {
    const result = await retryWithBackoff(mockPerformanceTest, config, 'performance-service');
    console.log('Performance test completed:', result);
  } catch (error) {
    console.log('Performance test failed:', error.message);
  }
}

// Run all examples
async function runExamples() {
  console.log('Retry Middleware Examples\n');
  
  await basicExample();
  await customConfigExample();
  await circuitBreakerExample();
  await serviceWrapperExample();
  await errorClassificationExample();
  await performanceExample();
  
  console.log('\n=== Examples Complete ===');
}

// Export for use in other modules
export {
  basicExample,
  customConfigExample,
  circuitBreakerExample,
  serviceWrapperExample,
  errorClassificationExample,
  performanceExample,
  runExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
} 