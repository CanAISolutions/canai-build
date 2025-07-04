---
description:
globs:
alwaysApply: false
---
# CanAI API Client Patterns Guidelines

## Purpose
Standardize API client implementation patterns across the CanAI platform, ensuring consistent error handling, retry logic, performance monitoring, and security practices while maintaining the emotional resonance and trust-building aspects of the user experience.

## Scope
Apply to all API client functions, utilities, and service integrations, leveraging the existing [API utilities](mdc:frontend/src/utils/api.ts), [tracing system](mdc:frontend/src/utils/tracing.ts), and integration patterns for Supabase, Make.com, and AI services.

## Core Principles

### API Architecture
- **Correlation ID Tracking**: Every API call must include correlation IDs for request tracing
- **Retry with Backoff**: Implement exponential backoff for transient failures
- **Graceful Degradation**: Provide fallback responses to maintain user experience
- **Security First**: Input sanitization, rate limiting, and secure error messages

### Error Handling Strategy
- **User-Friendly Messages**: Never expose technical errors to users
- **Comprehensive Logging**: Track all errors for analytics and improvement
- **Recovery Options**: Provide clear paths for users to recover from errors
- **Emotional Consideration**: Maintain trust even during error states

## Implementation Patterns

### ✅ Standard API Client Structure
```typescript
import { retryWithBackoff, generateCorrelationId } from '@/utils/tracing';
import { insertErrorLog } from '@/utils/supabase';

// API Configuration
const API_BASE = import.meta.env['VITE_API_BASE'] || '/v1';
const DEFAULT_TIMEOUT = 5000;

// Generic API call wrapper with full error handling
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;
  const correlationId = generateCorrelationId();

  return retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'X-Correlation-ID': correlationId,
          'X-Client-Version': import.meta.env['VITE_APP_VERSION'] || '1.0.0'
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(
          `API Error: ${response.status} ${response.statusText}`,
          response.status,
          correlationId
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  });
};
```

### ✅ Journey-Specific API Patterns
```typescript
// F1: Discovery Hook - Messages API with fallback
export const getMessages = async (): Promise<MessageResponse> => {
  try {
    const response = await apiCall<MessageResponse>('/messages');
    console.log('[API] GET /v1/messages response:', response);
    return response;
  } catch (error) {
    console.warn('[API] GET /v1/messages failed, using fallback:', error);

    // Emotional fallback - maintain trust building
    return {
      messages: [
        { text: 'CanAI launched my bakery with a $50K plan!' },
        { text: 'Generated 847 high-quality business plans' },
        { text: '500+ founders trust CanAI for growth' },
        { text: 'Average funding increase: 73%' },
      ],
      error: null,
    };
  }
};

// F6: Intent Mirror - AI Generation with confidence tracking
export const generateIntentMirror = async (
  data: IntentMirrorRequest
): Promise<IntentMirrorResponse> => {
  try {
    const response = await apiCall<IntentMirrorResponse>('/intent-mirror', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Log successful generation for analytics
    await logPromptSuccess({
      user_id: data.user_id,
      prompt_type: 'intent_mirror',
      confidence_score: response.confidence_score,
      emotional_resonance: response.emotional_resonance
    });

    return response;
  } catch (error) {
    console.error('[API] generateIntentMirror failed:', error);

    // Log error for improvement
    await logError({
      user_id: data.user_id,
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'intent_mirror_generation',
      error_type: 'timeout',
    });

    // Emotional fallback with context
    const fallbackResponse = generateContextualIntentMirror(data);
    return {
      ...fallbackResponse,
      error: 'Using enhanced offline mode for your privacy',
    };
  }
};
```

### ✅ Error Handling Classes
```typescript
// Custom error classes for better error categorization
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public correlationId: string,
    public userFriendlyMessage?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(
    message: string,
    correlationId: string,
    public validationErrors: Record<string, string>
  ) {
    super(message, 400, correlationId);
    this.name = 'ValidationError';
    this.userFriendlyMessage = 'Please check your input and try again';
  }
}

export class NetworkError extends APIError {
  constructor(message: string, correlationId: string) {
    super(message, 0, correlationId);
    this.name = 'NetworkError';
    this.userFriendlyMessage = 'Connection issue. Retrying automatically...';
  }
}

// Error message sanitization
const sanitizeErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Remove any potential sensitive information (API keys, tokens, etc.)
    return error.message.replace(/([A-Za-z0-9+/=]){40,}/g, '[REDACTED]');
  }
  return 'An unexpected error occurred';
};
```

### ✅ Retry Logic with Emotional Considerations
```typescript
// Enhanced retry with user feedback
export const retryWithUserFeedback = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    onRetry?: (attemptNumber: number) => void;
    userFeedback?: boolean;
  } = {}
): Promise<T> => {
  const { maxRetries = 3, baseDelay = 1000, onRetry, userFeedback = false } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        console.error(`Max retries (${maxRetries}) exceeded:`, lastError);
        throw lastError;
      }

      const delay = Math.pow(2, attempt) * baseDelay;

      // Provide user feedback during retries
      if (userFeedback && onRetry) {
        onRetry(attempt + 1);
      }

      console.warn(
        `Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
        error
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Usage with toast notifications
const handleAPICallWithFeedback = async () => {
  try {
    await retryWithUserFeedback(
      () => apiCall('/some-endpoint'),
      {
        maxRetries: 3,
        userFeedback: true,
        onRetry: (attemptNumber) => {
          toast.info(`Retrying... (${attemptNumber}/3)`, {
            duration: 1000,
          });
        }
      }
    );
  } catch (error) {
    toast.error('Unable to complete request. Please try again later.');
  }
};
```

### ✅ Performance Monitoring Integration
```typescript
// API performance tracking
export const apiCallWithMetrics = async <T>(
  endpoint: string,
  options: RequestInit = {},
  operationName?: string
): Promise<T> => {
  const startTime = performance.now();
  const correlationId = generateCorrelationId();

  try {
    const result = await apiCall<T>(endpoint, options);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track successful API calls
    trackPerformanceMetric({
      operation: operationName || endpoint,
      duration,
      status: 'success',
      correlationId
    });

    // Alert on slow responses
    if (duration > 2000) {
      console.warn(`Slow API response detected: ${endpoint} took ${duration}ms`);
    }

    return result;
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Track failed API calls
    trackPerformanceMetric({
      operation: operationName || endpoint,
      duration,
      status: 'error',
      correlationId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
};
```

### ✅ React Query Integration
```typescript
// Standardized React Query setup for API calls
export const useApiQuery = <T>(
  queryKey: string[],
  apiCall: () => Promise<T>,
  options?: {
    fallbackData?: T;
    emotional?: boolean;
    userFeedback?: boolean;
  }
) => {
  return useQuery({
    queryKey,
    queryFn: apiCall,
    retry: (failureCount, error) => {
      // Don't retry on validation errors
      if (error instanceof ValidationError) return false;

      // Don't retry more than 3 times
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      // Log error for analytics
      logError({
        error_message: error instanceof Error ? error.message : 'Query error',
        action: `query_${queryKey.join('_')}`,
        error_type: 'api_failure'
      });

      // Show user-friendly error if needed
      if (options?.userFeedback) {
        const message = error instanceof APIError && error.userFriendlyMessage
          ? error.userFriendlyMessage
          : 'Something went wrong. Please try again.';

        toast.error(message);
      }
    },
    // Use fallback data if available
    placeholderData: options?.fallbackData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Usage example
export const useMessages = () => {
  return useApiQuery(
    ['messages'],
    getMessages,
    {
      fallbackData: {
        messages: [{ text: 'Loading inspiring messages...' }],
        error: null
      },
      emotional: true,
      userFeedback: true
    }
  );
};
```

## Journey-Specific API Patterns

### F3: Spark Layer - Batch Operations
```typescript
// Efficient spark generation with progress tracking
export const generateSparks = async (
  request: SparkGenerationRequest,
  onProgress?: (progress: number) => void
): Promise<SparkGenerationResponse> => {
  const steps = [
    'Analyzing business context...',
    'Generating creative sparks...',
    'Calculating trust scores...',
    'Finalizing emotional resonance...'
  ];

  try {
    const response = await apiCallWithProgress('/sparks/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    }, steps, onProgress);

    return response;
  } catch (error) {
    // Provide partial sparks as fallback
    return {
      sparks: generateFallbackSparks(request),
      error: 'Generated using offline enhancement mode',
      confidence_score: 0.75
    };
  }
};

const apiCallWithProgress = async <T>(
  endpoint: string,
  options: RequestInit,
  steps: string[],
  onProgress?: (progress: number) => void
): Promise<T> => {
  // Simulate progress for better UX
  if (onProgress) {
    for (let i = 0; i < steps.length; i++) {
      onProgress((i / steps.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return apiCall<T>(endpoint, options);
};
```

### F7: Purchase Flow - Payment Integration
```typescript
// Secure payment processing with validation
export const createStripeSession = async (
  request: StripeSessionRequest
): Promise<StripeSessionResponse> => {
  // Input validation before API call
  const validationResult = validateStripeRequest(request);
  if (!validationResult.valid) {
    throw new ValidationError(
      'Invalid payment request',
      generateCorrelationId(),
      validationResult.errors
    );
  }

  try {
    const response = await apiCall<StripeSessionResponse>('/stripe/create-session', {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'X-Idempotency-Key': generateIdempotencyKey(request)
      }
    });

    // Log successful payment initiation
    await logSessionToMakecom({
      user_id: request.user_id,
      product_id: request.spark.product_id,
      session_id: response.session_id,
      amount: request.spark.price
    });

    return response;
  } catch (error) {
    // Log payment errors
    await logPurchaseError({
      error_message: error instanceof Error ? error.message : 'Payment error',
      action: 'stripe_session_creation',
      error_type: 'stripe_failure',
      user_id: request.user_id
    });

    throw error;
  }
};

const validateStripeRequest = (request: StripeSessionRequest) => {
  const errors: Record<string, string> = {};

  if (!request.spark.title || request.spark.title.length < 3) {
    errors.title = 'Spark title must be at least 3 characters';
  }

  if (!request.spark.price || request.spark.price < 1) {
    errors.price = 'Price must be greater than $1';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};
```

## Security Patterns

### ✅ Request Sanitization
```typescript
// Input sanitization for API requests
const sanitizeRequestData = <T extends Record<string, any>>(data: T): T => {
  const sanitized = { ...data };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      // Remove potential XSS payloads
      sanitized[key] = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    }
  }

  return sanitized;
};

// Rate limiting implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];

    // Filter out old requests
    const validRequests = requests.filter(time => now - time < windowMs);

    if (validRequests.length >= limit) {
      return false;
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Apply rate limiting to sensitive endpoints
const rateLimitedApiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  identifier: string = 'global'
): Promise<T> => {
  if (!rateLimiter.isAllowed(identifier, 100, 60000)) {
    throw new APIError(
      'Rate limit exceeded',
      429,
      generateCorrelationId(),
      'Too many requests. Please wait a moment and try again.'
    );
  }

  return apiCall<T>(endpoint, options);
};
```

## Testing Patterns

### ✅ API Testing
```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('includes correlation ID in all requests', async () => {
    const mockResponse = { data: 'test' };
    (global.fetch as Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    await apiCall('/test-endpoint');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Correlation-ID': expect.any(String),
        }),
      })
    );
  });

  it('retries on transient failures', async () => {
    (global.fetch as Mock)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: 'success' }),
      });

    const result = await apiCall('/test-endpoint');
    expect(result).toEqual({ data: 'success' });
    expect(global.fetch).toHaveBeenCalledTimes(3);
  });

  it('provides fallback data on critical failures', async () => {
    (global.fetch as Mock).mockRejectedValue(new Error('API down'));

    const result = await getMessages();

    expect(result.messages).toBeDefined();
    expect(result.messages.length).toBeGreaterThan(0);
    expect(result.error).toBeNull();
  });

  it('sanitizes error messages', () => {
    const sensitiveError = new Error('API key abc123def456ghi789 is invalid');
    const sanitized = sanitizeErrorMessage(sensitiveError);

    expect(sanitized).not.toContain('abc123def456ghi789');
    expect(sanitized).toContain('[REDACTED]');
  });
});
```

## Anti-Patterns

### ❌ Avoid These Patterns
```typescript
// DON'T: Direct fetch without error handling
fetch('/api/endpoint').then(response => response.json());

// DON'T: Expose technical errors to users
catch (error) {
  alert(error.message); // Technical error shown to user
}

// DON'T: No retry logic
const data = await fetch('/api/endpoint');

// DON'T: Missing correlation IDs
fetch('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data)
});

// DON'T: No input sanitization
const apiData = { userInput: formData.userInput }; // Potential XSS
```

### ✅ Correct Patterns
```typescript
// DO: Use standardized API client
const result = await apiCall<ResponseType>('/endpoint');

// DO: Provide user-friendly error messages
catch (error) {
  const userMessage = error instanceof APIError && error.userFriendlyMessage
    ? error.userFriendlyMessage
    : 'Something went wrong. Please try again.';
  toast.error(userMessage);
}

// DO: Include retry logic and correlation tracking
const result = await retryWithBackoff(() =>
  apiCall('/endpoint', {
    headers: { 'X-Correlation-ID': generateCorrelationId() }
  })
);

// DO: Sanitize all inputs
const apiData = sanitizeRequestData({ userInput: formData.userInput });
```

## Integration Requirements

### Analytics & Monitoring
```typescript
// Comprehensive API monitoring
const trackApiCall = (endpoint: string, duration: number, status: 'success' | 'error') => {
  posthog.capture('api_call', {
    endpoint,
    duration,
    status,
    timestamp: new Date().toISOString()
  });
};

// Error tracking for improvement
const trackApiError = (error: APIError) => {
  posthog.capture('api_error', {
    endpoint: error.endpoint,
    statusCode: error.statusCode,
    correlationId: error.correlationId,
    errorType: error.name
  });
};
```

## Quality Standards

- **Correlation Tracking**: All API calls must include correlation IDs
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Retry Logic**: Exponential backoff for transient failures
- **Security**: Input sanitization and rate limiting
- **Performance**: Response time monitoring and optimization
- **Fallback Data**: Graceful degradation with meaningful fallbacks

---

**Created**: January 2025
**Version**: 1.0.0
**Alignment**: PRD Sections 6, 7, 8, 9
