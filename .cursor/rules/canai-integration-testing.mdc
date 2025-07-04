---
description:
globs:
alwaysApply: false
---
# CanAI Integration Testing Patterns Guidelines

## Purpose
Standardize integration testing patterns across the CanAI platform's 9-stage user journey (F1-F9), ensuring comprehensive coverage of external service integrations (Supabase, Make.com, AI services, Stripe) while maintaining emotional resonance validation and trust score verification.

## Scope
Apply to all integration tests covering the user journey flow, API integrations, database operations, and third-party service interactions, based on the [test case specification](mdc:docs/test-case-specification.md) and existing [testing patterns](mdc:frontend/src/tests/IntentMirror.test.tsx).

## Core Principles

### Testing Architecture
- **Journey-Based Testing**: Test complete user flows through F1-F9 stages
- **Service Integration**: Validate all external service interactions
- **Emotional Validation**: Test trust scores and emotional resonance metrics
- **Performance Testing**: Ensure response times meet PRD requirements (<200ms API, <1.5s generation)

### Test Environment Strategy
- **Isolated Test Environment**: Use dedicated test database and service mocks
- **Realistic Data**: Test with scenario-based, consistent test data
- **Cleanup Automation**: Ensure proper test data cleanup after each run
- **CI/CD Integration**: Automated execution with quality gates

## Implementation Patterns

### ✅ Journey Flow Testing
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Test wrapper with all required providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <JourneyProvider initialStage="F1">
          {children}
        </JourneyProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('F1 to F3 Journey Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupJourneyMocks();
  });

  it('completes discovery hook to spark layer progression', async () => {
    // F1: Discovery Hook
    render(
      <TestWrapper>
        <DiscoveryHook />
      </TestWrapper>
    );

    // Verify trust indicators are displayed
    expect(screen.getByText(/500\+ founders trust CanAI/)).toBeInTheDocument();

    // Click primary CTA
    const ctaButton = screen.getByText(/Start Your Journey/);
    fireEvent.click(ctaButton);

    // F2: Should navigate to discovery funnel
    await waitFor(() => {
      expect(window.location.pathname).toBe('/discovery-funnel');
    });

    // F3: Complete funnel and verify spark generation
    const businessTypeSelect = screen.getByLabelText(/Business Type/);
    fireEvent.change(businessTypeSelect, { target: { value: 'service' } });

    const generateButton = screen.getByText(/Generate Sparks/);
    fireEvent.click(generateButton);

    // Verify spark generation with trust scores
    await waitFor(() => {
      expect(screen.getByText(/Trust Score:/)).toBeInTheDocument();
      expect(screen.getByText(/Emotional Resonance:/)).toBeInTheDocument();
    }, { timeout: 10000 });

    // Validate trust metrics
    const trustScoreElements = screen.getAllByText(/\d+\.\d+/);
    const trustScores = trustScoreElements.map(el => parseFloat(el.textContent || '0'));

    expect(trustScores.some(score => score >= 0.7)).toBe(true);
  });
});
```

### ✅ API Integration Testing
```typescript
describe('API Integration Tests', () => {
  const apiMock = {
    generateSparks: vi.fn(),
    generateIntentMirror: vi.fn(),
    createStripeSession: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('handles API retry logic with correlation tracking', async () => {
    const correlationId = 'test-correlation-123';

    // Mock initial failures then success
    (global.fetch as Mock)
      .mockRejectedValueOnce(new Error('Network timeout'))
      .mockRejectedValueOnce(new Error('Server unavailable'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          sparks: mockSparks,
          correlation_id: correlationId
        }),
      });

    const result = await generateSparks({
      businessType: 'service',
      primaryChallenge: 'Need marketing strategy'
    });

    // Verify retry attempts
    expect(global.fetch).toHaveBeenCalledTimes(3);

    // Verify correlation ID tracking
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Correlation-ID': expect.any(String),
        }),
      })
    );

    expect(result.sparks).toBeDefined();
    expect(result.sparks.length).toBeGreaterThan(0);
  });

  it('provides emotional fallback on service failures', async () => {
    // Mock complete API failure
    (global.fetch as Mock).mockRejectedValue(new Error('Service unavailable'));

    const result = await generateIntentMirror({
      businessName: 'Test Business',
      targetMarket: 'Small businesses'
    });

    // Should receive fallback response with emotional consideration
    expect(result.error).toContain('offline mode');
    expect(result.summary).toBeDefined();
    expect(result.confidence_score).toBeGreaterThan(0.5);
  });
});
```

### ✅ Database Integration Testing
```typescript
describe('Supabase Integration', () => {
  let testClient: SupabaseClient;

  beforeAll(async () => {
    testClient = createClient(
      process.env.VITE_TEST_SUPABASE_URL!,
      process.env.VITE_TEST_SUPABASE_ANON_KEY!
    );

    // Setup test schema
    await setupTestSchema(testClient);
  });

  afterEach(async () => {
    // Clean up test data
    await cleanupTestData(testClient);
  });

  it('logs user journey progression with analytics', async () => {
    const testUserId = 'test-user-123';
    const journeyData = {
      user_id: testUserId,
      stage: 'F3',
      business_type: 'service',
      trust_score: 0.85,
      emotional_resonance: 0.92
    };

    // Insert journey log
    const { error } = await insertSessionLog(journeyData);
    expect(error).toBeNull();

    // Verify data was stored correctly
    const { data: sessions, error: fetchError } = await testClient
      .from('user_sessions')
      .select('*')
      .eq('user_id', testUserId);

    expect(fetchError).toBeNull();
    expect(sessions).toHaveLength(1);
    expect(sessions![0].trust_score).toBe(0.85);
    expect(sessions![0].emotional_resonance).toBe(0.92);
  });

  it('handles error logging with proper categorization', async () => {
    const errorData = {
      user_id: 'test-user-456',
      error_message: 'API timeout during spark generation',
      action: 'spark_generation',
      error_type: 'timeout' as const,
      error_details: {
        endpoint: '/v1/sparks/generate',
        duration: 5000,
        retry_count: 3
      }
    };

    const result = await insertErrorLog(errorData);
    expect(result.error).toBeNull();

    // Verify error categorization
    const { data: errors } = await testClient
      .from('error_logs')
      .select('*')
      .eq('user_id', 'test-user-456');

    expect(errors![0].error_type).toBe('timeout');
    expect(errors![0].error_details.retry_count).toBe(3);
  });
});
```

### ✅ External Service Integration Testing
```typescript
describe('Make.com Integration', () => {
  beforeEach(() => {
    // Mock Make.com webhook endpoints
    global.fetch = vi.fn();
  });

  it('triggers workflow on user milestone completion', async () => {
    const milestoneData = {
      user_id: 'test-user-789',
      milestone: 'spark_selection',
      business_data: {
        name: 'Test Business',
        type: 'service',
        selected_spark_id: 'spark-123'
      },
      trust_metrics: {
        trust_score: 0.88,
        emotional_resonance: 0.94,
        confidence_level: 0.91
      }
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true, workflow_id: 'wf-456' })
    });

    const result = await triggerMakecomWorkflow('milestone_completed', milestoneData);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('make.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Correlation-ID': expect.any(String),
        }),
        body: JSON.stringify(milestoneData)
      })
    );

    expect(result.success).toBe(true);
  });
});

describe('Stripe Integration', () => {
  it('creates payment session with proper validation', async () => {
    const paymentRequest = {
      spark: {
        title: 'Premium Business Plan',
        product_id: 'prod_test123',
        price: 97
      },
      user_id: 'test-user-payment'
    };

    (global.fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        session_id: 'cs_test_123',
        url: 'https://checkout.stripe.com/session/cs_test_123'
      })
    });

    const result = await createStripeSession(paymentRequest);

    expect(result.session_id).toBeDefined();
    expect(result.url).toContain('checkout.stripe.com');

    // Verify idempotency key was included
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Idempotency-Key': expect.any(String),
        }),
      })
    );
  });

  it('handles payment validation errors gracefully', async () => {
    const invalidRequest = {
      spark: {
        title: '', // Invalid: empty title
        product_id: 'prod_test123',
        price: 0 // Invalid: zero price
      },
      user_id: 'test-user-invalid'
    };

    await expect(createStripeSession(invalidRequest)).rejects.toThrow(ValidationError);
  });
});
```

### ✅ Performance Integration Testing
```typescript
describe('Performance Integration Tests', () => {
  it('meets PRD performance requirements across journey', async () => {
    const performanceMetrics = {
      apiResponseTime: 0,
      sparkGenerationTime: 0,
      intentMirrorTime: 0,
      deliverableGenerationTime: 0
    };

    // Test API response time (<200ms)
    const apiStart = Date.now();
    await getMessages();
    performanceMetrics.apiResponseTime = Date.now() - apiStart;

    // Test spark generation (<1.5s)
    const sparkStart = Date.now();
    await generateSparks({
      businessType: 'service',
      primaryChallenge: 'Marketing strategy'
    });
    performanceMetrics.sparkGenerationTime = Date.now() - sparkStart;

    // Test intent mirror generation (<1s)
    const intentStart = Date.now();
    await generateIntentMirror({
      businessName: 'Test Business',
      targetMarket: 'SMBs'
    });
    performanceMetrics.intentMirrorTime = Date.now() - intentStart;

    // Test deliverable generation (<2s)
    const deliverableStart = Date.now();
    await generateDeliverable({
      sparkId: 'test-spark-123',
      userPreferences: {}
    });
    performanceMetrics.deliverableGenerationTime = Date.now() - deliverableStart;

    // Assert PRD performance requirements
    expect(performanceMetrics.apiResponseTime).toBeLessThan(200);
    expect(performanceMetrics.sparkGenerationTime).toBeLessThan(1500);
    expect(performanceMetrics.intentMirrorTime).toBeLessThan(1000);
    expect(performanceMetrics.deliverableGenerationTime).toBeLessThan(2000);
  });

  it('handles concurrent user load gracefully', async () => {
    const concurrentUsers = 10;
    const sparkRequests = Array.from({ length: concurrentUsers }, (_, i) =>
      generateSparks({
        businessType: 'service',
        primaryChallenge: `Challenge ${i}`,
        userId: `concurrent-user-${i}`
      })
    );

    const startTime = Date.now();
    const results = await Promise.allSettled(sparkRequests);
    const endTime = Date.now();

    // Verify all requests completed
    const successfulResults = results.filter(r => r.status === 'fulfilled');
    expect(successfulResults.length).toBeGreaterThan(concurrentUsers * 0.9); // 90% success rate

    // Verify reasonable response time under load
    const avgResponseTime = (endTime - startTime) / concurrentUsers;
    expect(avgResponseTime).toBeLessThan(3000); // 3s max under load
  });
});
```

## Test Data Management

### ✅ Scenario-Based Test Data
```typescript
// Test scenarios based on real user personas
export const testScenarios = {
  serenityYoga: {
    businessType: 'service',
    businessName: 'Serenity Yoga Studio',
    primaryChallenge: 'Need effective social media strategy to build community',
    targetMarket: 'Health-conscious professionals aged 25-45',
    preferredTone: 'inspirational',
    desiredOutcome: 'grow_customers',
    expectedTrustScore: 0.85,
    expectedEmotionalResonance: 0.92
  },

  techStartup: {
    businessType: 'technology',
    businessName: 'InnovateTech Solutions',
    primaryChallenge: 'Need product-market fit validation',
    targetMarket: 'B2B enterprise clients',
    preferredTone: 'bold',
    desiredOutcome: 'scale_operations',
    expectedTrustScore: 0.78,
    expectedEmotionalResonance: 0.86
  },

  localBakery: {
    businessType: 'retail',
    businessName: 'Artisan Bread Co.',
    primaryChallenge: 'Expand beyond local market',
    targetMarket: 'Food enthusiasts and local families',
    preferredTone: 'warm',
    desiredOutcome: 'increase_revenue',
    expectedTrustScore: 0.91,
    expectedEmotionalResonance: 0.95
  }
};

// Test data factory
export const createTestUser = (scenario: keyof typeof testScenarios) => {
  const baseData = testScenarios[scenario];
  return {
    ...baseData,
    userId: `test-${scenario}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sessionId: generateCorrelationId()
  };
};
```

### ✅ Environment Setup & Cleanup
```typescript
// Test environment setup
export const setupTestEnvironment = async () => {
  // Setup test database
  const testClient = createClient(
    process.env.VITE_TEST_SUPABASE_URL!,
    process.env.VITE_TEST_SUPABASE_ANON_KEY!
  );

  // Create test schema
  await testClient.rpc('create_test_schema');

  // Setup test API mocks
  setupApiMocks();

  // Initialize test analytics
  initializeTestAnalytics();

  return testClient;
};

export const cleanupTestEnvironment = async (testClient: SupabaseClient) => {
  // Clean test data
  await testClient.rpc('cleanup_test_data');

  // Reset API mocks
  vi.clearAllMocks();

  // Clear test analytics
  clearTestAnalytics();
};

// Database cleanup
export const cleanupTestData = async (testClient: SupabaseClient) => {
  const tables = [
    'user_sessions',
    'error_logs',
    'prompt_logs',
    'spark_generations',
    'deliverable_generations'
  ];

  for (const table of tables) {
    await testClient
      .from(table)
      .delete()
      .like('user_id', 'test-%');
  }
};
```

## Accessibility Integration Testing

### ✅ WCAG Compliance Testing
```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Integration', () => {
  it('maintains WCAG 2.2 AA compliance across journey', async () => {
    const journeyStages = [
      { component: DiscoveryHook, path: '/' },
      { component: SparkLayer, path: '/sparks' },
      { component: IntentMirror, path: '/intent-mirror' },
      { component: PurchaseFlow, path: '/purchase' }
    ];

    for (const stage of journeyStages) {
      const { container } = render(
        <TestWrapper>
          <stage.component />
        </TestWrapper>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }
  });

  it('supports keyboard navigation throughout journey', async () => {
    render(
      <TestWrapper>
        <DiscoveryHook />
      </TestWrapper>
    );

    // Test tab navigation
    const focusableElements = screen.getAllByRole('button');

    for (let i = 0; i < focusableElements.length; i++) {
      fireEvent.keyDown(document.body, { key: 'Tab' });
      expect(document.activeElement).toBe(focusableElements[i]);
    }

    // Test enter key activation
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });

    // Should trigger navigation or action
    await waitFor(() => {
      expect(window.location.pathname).not.toBe('/');
    });
  });
});
```

## Test Execution Patterns

### ✅ CI/CD Integration
```typescript
// Jest/Vitest configuration for CI
export default {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: [
    '<rootDir>/src/tests/**/*.integration.test.{ts,tsx}',
    '<rootDir>/src/tests/**/*.e2e.test.{ts,tsx}'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/tests/**',
    '!src/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  testTimeout: 30000, // 30 seconds for integration tests
  maxWorkers: 2, // Limit parallelism for integration tests
};

// Test runner script
export const runIntegrationTests = async () => {
  console.log('🧪 Starting integration test suite...');

  // Setup test environment
  await setupTestEnvironment();

  try {
    // Run journey flow tests
    await runJourneyTests();

    // Run API integration tests
    await runApiIntegrationTests();

    // Run database integration tests
    await runDatabaseTests();

    // Run performance tests
    await runPerformanceTests();

    // Run accessibility tests
    await runAccessibilityTests();

    console.log('✅ All integration tests passed!');
  } catch (error) {
    console.error('❌ Integration tests failed:', error);
    throw error;
  } finally {
    await cleanupTestEnvironment();
  }
};
```

## Anti-Patterns

### ❌ Avoid These Patterns
```typescript
// DON'T: Test individual functions in isolation without integration context
it('generates sparks', () => {
  const result = generateSparks(mockData);
  expect(result).toBeDefined();
});

// DON'T: Skip error scenario testing
it('happy path only', async () => {
  const result = await apiCall('/endpoint');
  expect(result.success).toBe(true);
});

// DON'T: Use production services in tests
const productionClient = createClient(PROD_URL, PROD_KEY); // Wrong!

// DON'T: Leave test data in database
it('creates user session', async () => {
  await insertSessionLog(testData);
  // Missing cleanup!
});
```

### ✅ Correct Patterns
```typescript
// DO: Test complete user flows with realistic scenarios
it('completes yoga studio journey from F1 to F7', async () => {
  const scenario = createTestUser('serenityYoga');
  // Test complete flow with cleanup
});

// DO: Test both success and failure scenarios
describe('Spark Generation', () => {
  it('succeeds with valid input', async () => { /* ... */ });
  it('handles network failures gracefully', async () => { /* ... */ });
  it('provides fallback on service unavailable', async () => { /* ... */ });
});

// DO: Use dedicated test environment
const testClient = createClient(TEST_URL, TEST_KEY);

// DO: Cleanup after every test
afterEach(async () => {
  await cleanupTestData(testClient);
});
```

## Quality Standards

- **Journey Coverage**: Test all critical paths through F1-F9 stages
- **Service Integration**: Validate all external service interactions
- **Performance Validation**: Ensure PRD performance requirements are met
- **Error Handling**: Test failure scenarios and recovery paths
- **Accessibility**: Verify WCAG 2.2 AA compliance throughout journey
- **Data Integrity**: Validate trust scores and emotional resonance calculations

---

**Created**: January 2025
**Version**: 1.0.0
**Alignment**: PRD Sections 8, 9, 10
