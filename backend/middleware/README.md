# Retry Middleware with Exponential Backoff

A robust retry middleware implementation with exponential backoff, circuit breaker pattern, and comprehensive observability for the CanAI Emotional Sovereignty Platform.

## Features

- **Exponential Backoff**: Configurable retry delays with jitter to prevent thundering herd
- **Circuit Breaker Pattern**: Automatic failure detection and service protection
- **Comprehensive Logging**: Integration with Sentry and PostHog for observability
- **Flexible Configuration**: Customizable retry policies and error classification
- **TypeScript Support**: Full type safety and IntelliSense support
- **Express Middleware**: Ready-to-use Express.js middleware integration

## Installation

The retry middleware is included in the backend package. No additional installation required.

## Quick Start

### Basic Usage

```typescript
import { retryWithBackoff } from './middleware/retry.js';

// Simple retry with default configuration
const result = await retryWithBackoff(async () => {
  return await fetch('https://api.example.com/data');
}, {}, 'api-service');
```

### Custom Configuration

```typescript
import { retryWithBackoff, type RetryConfig } from './middleware/retry.js';

const config: Partial<RetryConfig> = {
  maxAttempts: 5,
  baseDelay: 1000,
  multiplier: 2,
  maxDelay: 10000,
  jitterEnabled: true,
  jitterFactor: 0.2,
  timeout: 5000,
  shouldRetry: (error) => {
    // Custom retry logic
    return error.status >= 500 || error.code === 'ECONNRESET';
  },
  onRetry: (error, attempt, delay) => {
    console.log(`Retry ${attempt} after ${delay}ms: ${error.message}`);
  }
};

const result = await retryWithBackoff(apiCall, config, 'custom-service');
```

## Configuration Options

### RetryConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `maxAttempts` | `number` | `3` | Maximum number of retry attempts |
| `baseDelay` | `number` | `500` | Base delay in milliseconds |
| `multiplier` | `number` | `2` | Exponential backoff multiplier |
| `maxDelay` | `number` | `5000` | Maximum delay in milliseconds |
| `jitterEnabled` | `boolean` | `true` | Enable random jitter |
| `jitterFactor` | `number` | `0.2` | Jitter factor (0-1) |
| `timeout` | `number` | `10000` | Request timeout in milliseconds |
| `shouldRetry` | `(error: any) => boolean` | See below | Custom retry logic |
| `onRetry` | `(error, attempt, delay) => void` | - | Retry callback |
| `onSuccess` | `(result, attempt) => void` | - | Success callback |
| `onFailure` | `(error, attempts) => void` | - | Failure callback |

### CircuitBreakerConfig

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `failureThreshold` | `number` | `5` | Failures before opening circuit |
| `resetTimeout` | `number` | `60000` | Time to wait before half-open |
| `alertThreshold` | `number` | `300000` | Alert if open too long |

## Default Error Classification

The default `shouldRetry` function retries on:

- **Network Errors**: `ECONNRESET`, `ENOTFOUND`, `ETIMEDOUT`
- **Server Errors**: HTTP 5xx status codes
- **Rate Limits**: HTTP 429 status codes

## Circuit Breaker States

1. **CLOSED**: Normal operation, requests pass through
2. **OPEN**: Circuit is open, requests fail fast
3. **HALF_OPEN**: Testing if service has recovered

## Express Middleware Integration

```typescript
import { retryMiddleware } from './middleware/retry.js';
import express from 'express';

const app = express();

// Apply retry middleware to all routes
app.use(retryMiddleware({
  maxAttempts: 3,
  baseDelay: 1000
}));

// Or apply to specific routes
app.use('/api/external', retryMiddleware({
  maxAttempts: 5,
  timeout: 15000
}));
```

## Service-Specific Wrappers

```typescript
import { createRetryWrapper } from './middleware/retry.js';

// Create a retry wrapper for GPT-4o service
const gpt4oRetry = createRetryWrapper('gpt4o-service', {
  maxAttempts: 3,
  baseDelay: 2000,
  timeout: 30000,
  shouldRetry: (error) => {
    return error.status === 429 || (error.status >= 500 && error.status < 600);
  }
});

// Use the wrapper
const result = await gpt4oRetry(async () => {
  return await callGPT4oAPI(prompt);
});
```

## Observability

### Sentry Integration

All retry attempts, circuit breaker state changes, and failures are automatically logged to Sentry with:

- Service name and context
- Attempt counts and delays
- Error details and stack traces
- Circuit breaker state information

### PostHog Analytics

The following events are tracked in PostHog:

- `retry_attempt`: Each retry attempt with metadata
- `retry_successful`: Successful retry with attempt count
- `retry_failed`: Final failure after all attempts
- `circuit_breaker_triggered`: Circuit breaker opens
- `circuit_breaker_reset`: Circuit breaker resets
- `circuit_breaker_half_open`: Circuit breaker transitions to half-open

## Error Handling

### Retriable Errors

By default, the following errors are considered retriable:

```typescript
// Network errors
error.code === 'ECONNRESET'
error.code === 'ENOTFOUND'
error.code === 'ETIMEDOUT'

// Server errors
error.status >= 500 && error.status < 600

// Rate limits
error.status === 429

// Error messages containing network error codes
error.message.toLowerCase().includes('econnreset')
error.message.toLowerCase().includes('enotfound')
error.message.toLowerCase().includes('etimedout')
```

### Non-Retriable Errors

The following errors are NOT retried:

- HTTP 4xx client errors (except 429)
- Validation errors
- Authentication errors
- Business logic errors

## Performance Considerations

### Memory Usage

- Circuit breaker instances are cached per service name
- No memory leaks with repeated retry operations
- Efficient cleanup of completed retry attempts

### Timing Accuracy

- Exponential backoff calculations are precise
- Jitter prevents thundering herd problems
- Timeout handling is reliable

### Concurrent Operations

- Thread-safe circuit breaker state management
- Support for high-concurrency scenarios
- Proper isolation between different services

## Testing

The retry middleware includes comprehensive tests covering:

- Circuit breaker state transitions
- Exponential backoff calculations
- Error classification logic
- Memory usage and performance
- Edge cases and error scenarios

Run tests with:

```bash
npm test middleware/retry.test.ts
```

## Examples

See `retry-example.ts` for comprehensive usage examples including:

- Basic retry usage
- Custom configurations
- Circuit breaker scenarios
- Service-specific wrappers
- Error classification
- Performance monitoring

## Integration with CanAI Services

### GPT-4o Service

```typescript
const gpt4oRetry = createRetryWrapper('gpt4o-service', {
  maxAttempts: 3,
  baseDelay: 2000,
  timeout: 30000
});

const response = await gpt4oRetry(async () => {
  return await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }]
  });
});
```

### Stripe Service

```typescript
const stripeRetry = createRetryWrapper('stripe-service', {
  maxAttempts: 2,
  baseDelay: 1000,
  shouldRetry: (error) => {
    return error.type === 'StripeCardError' && error.code === 'card_declined';
  }
});

const payment = await stripeRetry(async () => {
  return await stripe.paymentIntents.create({
    amount: 1000,
    currency: 'usd'
  });
});
```

### External APIs

```typescript
const externalApiRetry = createRetryWrapper('external-api', {
  maxAttempts: 5,
  baseDelay: 1000,
  timeout: 15000,
  shouldRetry: (error) => {
    return error.status >= 500 || error.status === 429;
  }
});

const data = await externalApiRetry(async () => {
  return await fetch('https://api.external.com/data');
});
```

## Best Practices

1. **Service Isolation**: Use different service names for different APIs
2. **Appropriate Timeouts**: Set timeouts based on service characteristics
3. **Error Classification**: Customize retry logic for specific error patterns
4. **Monitoring**: Monitor retry rates and circuit breaker states
5. **Graceful Degradation**: Handle circuit breaker failures gracefully

## Troubleshooting

### Common Issues

1. **Tests Timing Out**: Use fake timers for testing retry delays
2. **Circuit Breaker Not Opening**: Check failure threshold configuration
3. **Memory Leaks**: Ensure proper cleanup of retry operations
4. **Incorrect Retries**: Verify error classification logic

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=retry-middleware npm start
```

## Contributing

When contributing to the retry middleware:

1. Add tests for new functionality
2. Update documentation for new features
3. Follow TypeScript best practices
4. Ensure backward compatibility
5. Update examples if needed

## License

Part of the CanAI Emotional Sovereignty Platform. 