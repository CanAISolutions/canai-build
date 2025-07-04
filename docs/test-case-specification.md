# Test Case Specification - CanAI Emotional Sovereignty Platform

## Purpose

Defines comprehensive tests to validate CanAI's functionality, performance, and quality per PRD
Section 13. Prevents bugs and regressions by enforcing >80% test coverage, 99.9% uptime, TrustDelta
≥4.2, and emotional resonance >0.7 across all 25+ API endpoints and the complete 9-stage user
journey.

## Structure

- **Test Types**: Unit, integration, accessibility, emotional resonance, load, scenario testing.
- **Test Coverage**: All 25+ APIs, AI services, and user journey stages with TaskMaster alignment.
- **Tools & Framework**: Jest, Vitest, Supatest, axe-core, Locust, Hume AI validation.
- **Performance Targets**: PRD-aligned metrics with automated validation and CI/CD integration.

## Test Pyramid and Coverage Requirements

### Testing Strategy (PRD Section 13.1)

- **70% Unit Tests**: Backend business logic (`backend/tests/*.test.js`), AI service validation,
  frontend components
- **20% Integration Tests**: API endpoint validation, database operations, external service
  integrations
- **10% End-to-End Tests**: Complete user journey validation (F1-F9), cross-browser compatibility

### Coverage Requirements

- **Minimum Coverage**: ≥80% branch coverage across all test types
- **Critical Path Coverage**: 100% coverage for:
  - TrustDelta calculation and SparkSplit comparison
  - Emotional resonance validation with Hume AI
  - Payment processing and Stripe integration
  - AI output generation and quality validation
  - Error handling and security measures
- **Reporting**: Coverage reports in `backend/coverage/` and `frontend/coverage/`

## Complete Test Suite Organization

### Backend Tests (`backend/tests/`)

```
backend/tests/
├── routes/                    # API endpoint tests (F1-F9)
│   ├── messages.test.js      # F1: GET /v1/messages
│   ├── funnel.test.js        # F2: POST /v1/validate-input
│   ├── sparks.test.js        # F3: POST /v1/generate-sparks
│   ├── stripe.test.js        # F4: Payment processing
│   ├── inputs.test.js        # F5: Detailed input collection
│   ├── intent.test.js        # F6: POST /v1/intent-mirror
│   ├── deliverables.test.js  # F7: POST /v1/deliverable
│   ├── sparkSplit.test.js    # F8: POST /v1/spark-split
│   └── feedback.test.js      # F9: POST /v1/feedback
├── services/                 # Business logic and AI services
│   ├── gpt4o.test.js        # GPT-4o integration and prompts
│   ├── hume.test.js         # Hume AI emotional resonance
│   ├── supabase.test.js     # Database operations
│   ├── stripe.test.js       # Payment processing
│   ├── memberstack.test.js  # Authentication
│   └── posthog.test.js      # Analytics tracking
├── middleware/               # Cross-cutting concerns
│   ├── auth.test.js         # JWT validation
│   ├── rateLimit.test.js    # Rate limiting (100 req/min)
│   ├── validation.test.js   # Input sanitization (DOMPurify + Joi)
│   └── error.test.js        # Error handling (<100ms responses)
├── ai/                      # AI-specific testing
│   ├── hallucination.test.js # AI hallucination detection
│   ├── quality.test.js      # Output quality validation
│   ├── performance.test.js  # AI service performance
│   └── prompts.test.js      # Prompt engineering validation
└── integration/             # Integration tests
    ├── api.test.js          # Complete API workflow tests
    ├── database.test.js     # Supabase RLS and operations
    └── webhooks.test.js     # Make.com webhook processing
```

### Frontend Tests (`frontend/src/tests/`)

```
frontend/src/tests/
├── components/              # Component testing by feature
│   ├── DiscoveryHook.test.tsx    # F1 component tests
│   ├── DiscoveryFunnel.test.tsx  # F2 component tests
│   ├── SparkLayer.test.tsx       # F3 component tests
│   ├── PurchaseFlow.test.tsx     # F4 component tests
│   ├── DetailedInput.test.tsx    # F5 component tests
│   ├── IntentMirror.test.tsx     # F6 component tests
│   ├── DeliverableGen.test.tsx   # F7 component tests
│   ├── SparkSplit.test.tsx       # F8 component tests
│   └── FeedbackCapture.test.tsx  # F9 component tests
├── hooks/                   # Custom hooks testing
│   ├── useSparkGeneration.test.ts
│   ├── usePaymentFlow.test.ts
│   └── useUserJourney.test.ts
├── utils/                   # Utility function tests
│   ├── api.test.ts          # API client functions
│   ├── validation.test.ts   # Frontend validation
│   └── analytics.test.ts    # PostHog integration
└── e2e/                     # End-to-end tests
    ├── user-journey.test.ts # Complete F1-F9 flow
    ├── payment-flow.test.ts # Stripe integration E2E
    └── accessibility.test.ts # WCAG 2.2 AA compliance
```

## Detailed Test Cases by Stage

### F1: Discovery Hook Tests

#### GET /v1/messages (Test ID: F1-messages)

```javascript
describe('GET /v1/messages', () => {
  test('should return trust indicators with proper caching', async () => {
    const response = await request(app).get('/v1/messages').expect(200);

    expect(response.body).toMatchObject({
      data: {
        messages: expect.arrayContaining([
          expect.objectContaining({
            text: expect.stringMatching(/\d+\+ (plans|users|businesses)/),
            type: 'trust_indicator',
          }),
        ]),
        total_plans_created: expect.any(Number),
      },
      error: null,
      metadata: expect.objectContaining({
        cache_hit: expect.any(Boolean),
        cache_ttl: 300,
      }),
    });

    // Verify response time <200ms
    expect(response.header['x-response-time']).toBeLessThan('200');
  });

  test('should handle rate limiting properly', async () => {
    // Send 101 requests to test rate limiting
    const requests = Array(101)
      .fill()
      .map(() => request(app).get('/v1/messages'));

    const responses = await Promise.all(requests);
    const rateLimitedResponses = responses.filter(r => r.status === 429);

    expect(rateLimitedResponses.length).toBeGreaterThan(0);
    expect(rateLimitedResponses[0].body.error.message).toContain('Rate limit exceeded');
  });
});
```

#### POST /v1/log-interaction (Test ID: F1-interaction)

```javascript
describe('POST /v1/log-interaction', () => {
  test('should log user interactions with proper validation', async () => {
    const interactionData = {
      session_id: 'sess_test_123',
      interaction_type: 'modal_open',
      interaction_details: {
        element_id: 'pricing-modal',
        product_viewed: 'business_builder',
      },
    };

    const response = await request(app)
      .post('/v1/log-interaction')
      .send(interactionData)
      .expect(200);

    // Verify interaction was logged to Supabase
    const loggedInteraction = await supabase
      .from('session_logs')
      .select('*')
      .eq('session_id', 'sess_test_123')
      .single();

    expect(loggedInteraction.data).toBeTruthy();
    expect(loggedInteraction.data.interaction_type).toBe('modal_open');

    // Verify response time <100ms
    expect(response.header['x-response-time']).toBeLessThan('100');
  });
});
```

### F2: 2-Step Discovery Funnel Tests

#### POST /v1/validate-input (Test ID: F2-validation)

```javascript
describe('POST /v1/validate-input', () => {
  test('should validate Sprinkle Haven Bakery scenario', async () => {
    const inputData = {
      businessType: 'retail',
      primaryChallenge: 'Need to secure $75,000 funding to launch my artisanal bakery in Denver',
      preferredTone: 'warm',
      desiredOutcome: 'secure_funding',
      session_id: 'sess_sprinkle_haven',
      context: {
        location: 'Denver, CO',
        industry_experience: 3,
        budget_range: '$50k-$100k',
      },
    };

    const response = await request(app).post('/v1/validate-input').send(inputData).expect(200);

    expect(response.body.data).toMatchObject({
      valid: true,
      trust_score: expect.any(Number),
      emotional_resonance: {
        arousal: expect.any(Number),
        valence: expect.any(Number),
        confidence: expect.any(Number),
      },
    });

    // Verify trust score ≥85 per PRD
    expect(response.body.data.trust_score).toBeGreaterThanOrEqual(85);

    // Verify emotional resonance targets
    expect(response.body.data.emotional_resonance.arousal).toBeGreaterThan(0.5);
    expect(response.body.data.emotional_resonance.valence).toBeGreaterThan(0.6);

    // Verify response time <500ms
    expect(response.header['x-response-time']).toBeLessThan('500');

    // Verify data stored in Supabase
    const storedData = await supabase
      .from('initial_prompt_logs')
      .select('*')
      .eq('session_id', 'sess_sprinkle_haven')
      .single();

    expect(storedData.data.trust_score).toBe(response.body.data.trust_score);
  });

  test('should handle Hume AI circuit breaker fallback', async () => {
    // Mock Hume AI rate limit exceeded
    jest
      .spyOn(humeService, 'validateResonance')
      .mockRejectedValue(new Error('Rate limit exceeded'));

    const response = await request(app).post('/v1/validate-input').send(validInputData).expect(200);

    expect(response.body.metadata.fallback_used).toBe(true);
    expect(response.body.data.trust_score).toBeLessThan(100); // Penalty applied
  });
});
```

### F3: Spark Layer Tests

#### POST /v1/generate-sparks (Test ID: F3-generation)

```javascript
describe('POST /v1/generate-sparks', () => {
  test('should generate three emotionally resonant sparks', async () => {
    const sparkRequest = {
      initial_prompt_id: 'prompt_uuid_123',
      user_id: 'user_uuid_456',
      regeneration_count: 0,
    };

    const response = await request(app)
      .post('/v1/generate-sparks')
      .set('Authorization', `Bearer ${validJWT}`)
      .send(sparkRequest)
      .expect(200);

    expect(response.body.data.sparks).toHaveLength(3);

    // Verify each spark has required fields
    response.body.data.sparks.forEach(spark => {
      expect(spark).toMatchObject({
        id: expect.any(String),
        title: expect.stringMatching(/.*Spark$/),
        tagline: expect.any(String),
        description: expect.any(String),
        emotional_appeal: expect.any(String),
        business_focus: expect.any(String),
        resonance_score: expect.any(Number),
      });

      // Verify emotional resonance >0.6 per PRD
      expect(spark.resonance_score).toBeGreaterThan(0.6);
    });

    // Verify response time <1.5s
    expect(response.header['x-response-time']).toBeLessThan('1500');

    // Verify data logged to Supabase
    const sparkLog = await supabase
      .from('spark_logs')
      .select('*')
      .eq('initial_prompt_id', 'prompt_uuid_123')
      .single();

    expect(sparkLog.data.generated_sparks).toHaveLength(3);
  });

  test('should enforce regeneration limits', async () => {
    const sparkRequest = {
      initial_prompt_id: 'prompt_uuid_limit_test',
      user_id: 'user_uuid_456',
      regeneration_count: 4, // Exceeds max of 3
    };

    const response = await request(app)
      .post('/v1/regenerate-sparks')
      .set('Authorization', `Bearer ${validJWT}`)
      .send(sparkRequest)
      .expect(400);

    expect(response.body.error.message).toContain('regeneration limit');
  });
});
```

### F4: Purchase Flow Tests

#### POST /v1/stripe-session (Test ID: F4-payment)

```javascript
describe('POST /v1/stripe-session', () => {
  test('should create Stripe session for business plan purchase', async () => {
    const paymentRequest = {
      spark_id: 'spark_uuid_123',
      user_id: 'user_uuid_456',
      product_track: 'business_builder',
      pricing_tier: 'standard',
    };

    const response = await request(app)
      .post('/v1/stripe-session')
      .set('Authorization', `Bearer ${validJWT}`)
      .send(paymentRequest)
      .expect(200);

    expect(response.body.data.session).toMatchObject({
      id: expect.stringMatching(/^cs_/),
      url: expect.stringMatching(/^https:\/\/checkout\.stripe\.com/),
      expires_at: expect.any(Number),
    });

    expect(response.body.data.product_details).toMatchObject({
      name: expect.any(String),
      price: 9900, // $99.00 in cents
      currency: 'USD',
      features: expect.arrayContaining([expect.stringContaining('700-800 word business plan')]),
    });

    // Verify response time <1s
    expect(response.header['x-response-time']).toBeLessThan('1000');

    // Verify payment log created
    const paymentLog = await supabase
      .from('payment_logs')
      .select('*')
      .eq('user_id', 'user_uuid_456')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    expect(paymentLog.data.product_track).toBe('business_builder');
    expect(paymentLog.data.amount).toBe(99.0);
  });

  test('should handle Stripe webhook processing', async () => {
    const webhookPayload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_webhook_123',
          payment_status: 'paid',
          customer_details: { email: 'test@example.com' },
        },
      },
    };

    const response = await request(app).post('/webhooks/stripe').send(webhookPayload).expect(200);

    // Verify Make.com webhook was triggered
    expect(mockMakeWebhook).toHaveBeenCalledWith(
      expect.objectContaining({
        scenario: 'add_project.json',
        data: expect.any(Object),
      })
    );
  });
});
```

### F7: Deliverable Generation Tests

#### POST /v1/deliverable (Test ID: F7-generation)

```javascript
describe('POST /v1/deliverable', () => {
  test('should generate 700-800 word business plan with emotional resonance', async () => {
    const deliverableRequest = {
      spark_log_id: 'spark_log_uuid_123',
      user_id: 'user_uuid_456',
      product_track: 'business_builder',
      detailed_inputs: {
        businessDescription:
          'Artisanal bakery specializing in organic, locally-sourced pastries and breads in Denver',
        targetMarket: 'Health-conscious families and young professionals in LoHi neighborhood',
        revenueModel: 'Direct sales, catering, and wholesale to local cafes',
        competitors: 'Allegro Coffee, Humble Pie, local grocery bakeries',
        uniqueValue: 'Community-focused approach with organic ingredients and warm atmosphere',
        location: 'Denver, CO - LoHi neighborhood',
        fundingGoal: 75000,
        timeline: '6 months to launch',
      },
    };

    const response = await request(app)
      .post('/v1/deliverable')
      .set('Authorization', `Bearer ${validJWT}`)
      .send(deliverableRequest)
      .expect(200);

    // Verify output quality
    const { canai_output, deliverable_metadata } = response.body.data;

    expect(deliverable_metadata.word_count).toBeGreaterThanOrEqual(700);
    expect(deliverable_metadata.word_count).toBeLessThanOrEqual(800);

    // Verify emotional resonance targets per PRD
    expect(deliverable_metadata.emotional_resonance.arousal).toBeGreaterThan(0.5);
    expect(deliverable_metadata.emotional_resonance.valence).toBeGreaterThan(0.7);

    // Verify TrustDelta ≥4.2
    expect(deliverable_metadata.trust_delta).toBeGreaterThanOrEqual(4.2);

    // Verify response time <2s
    expect(response.header['x-response-time']).toBeLessThan('2000');

    // Verify business plan contains required sections
    expect(canai_output).toMatch(/executive summary|business overview/i);
    expect(canai_output).toMatch(/market analysis|target market/i);
    expect(canai_output).toMatch(/financial projections|revenue model/i);
    expect(canai_output).toMatch(/\$75,000|\$75k/); // Funding goal mentioned

    // Verify PDF export generated
    expect(response.body.data.file_exports.pdf_url).toMatch(/^https:\/\/.*\.pdf$/);
  });

  test('should handle revision requests', async () => {
    const revisionRequest = {
      deliverable_id: 'deliverable_uuid_123',
      revision_type: 'tone_adjustment',
      feedback: 'Make it more professional and less casual',
      specific_sections: ['executive_summary', 'market_analysis'],
    };

    const response = await request(app)
      .post('/v1/request-revision')
      .set('Authorization', `Bearer ${validJWT}`)
      .send(revisionRequest)
      .expect(200);

    expect(response.body.data.revision_accepted).toBe(true);
    expect(response.body.data.estimated_completion).toMatch(/\d+\s*(minutes?|hours?)/);

    // Verify revision logged
    const comparison = await supabase
      .from('comparisons')
      .select('revision_count')
      .eq('id', 'deliverable_uuid_123')
      .single();

    expect(comparison.data.revision_count).toBeGreaterThan(0);
  });
});
```

### F8: SparkSplit Tests

#### POST /v1/spark-split (Test ID: F8-comparison)

```javascript
describe('POST /v1/spark-split', () => {
  test('should demonstrate CanAI superiority with TrustDelta ≥4.2', async () => {
    const sparkSplitRequest = {
      deliverable_id: 'deliverable_uuid_123',
      user_id: 'user_uuid_456',
      comparison_type: 'full_comparison',
    };

    const response = await request(app)
      .post('/v1/spark-split')
      .set('Authorization', `Bearer ${validJWT}`)
      .send(sparkSplitRequest)
      .expect(200);

    const { comparison, trust_delta, preference_indicators } = response.body.data;

    // Verify TrustDelta ≥4.2 per PRD
    expect(trust_delta).toBeGreaterThanOrEqual(4.2);

    // Verify CanAI output superiority
    expect(comparison.canai_output.emotional_resonance).toBeGreaterThan(
      comparison.generic_output.emotional_resonance
    );
    expect(comparison.canai_output.personalization_level).toBeGreaterThan(
      comparison.generic_output.personalization_level
    );

    // Verify preference indicators
    expect(preference_indicators.emotional_connection).toBeGreaterThan(0.7);
    expect(preference_indicators.practical_value).toBeGreaterThan(0.8);
    expect(preference_indicators.uniqueness).toBeGreaterThan(0.75);

    // Verify response time <1s
    expect(response.header['x-response-time']).toBeLessThan('1000');

    // Verify comparison logged
    const comparisonLog = await supabase
      .from('comparisons')
      .select('trust_delta')
      .eq('id', 'deliverable_uuid_123')
      .single();

    expect(comparisonLog.data.trust_delta).toBe(trust_delta);
  });
});
```

## AI Output Quality Testing

### Hallucination Detection Tests

```javascript
describe('AI Hallucination Detection', () => {
  test('should detect and prevent factual inaccuracies', async () => {
    const inputWithFacts = {
      businessDescription: 'Tech startup in Silicon Valley with 50 employees',
      location: 'Palo Alto, CA',
      fundingGoal: 2000000,
    };

    const response = await request(app)
      .post('/v1/deliverable')
      .set('Authorization', `Bearer ${validJWT}`)
      .send({ detailed_inputs: inputWithFacts })
      .expect(200);

    const output = response.body.data.canai_output;

    // Verify no hallucinated facts
    expect(output).not.toMatch(/100 employees|1000 employees/); // Shouldn't inflate numbers
    expect(output).not.toMatch(/New York|Los Angeles/); // Shouldn't change location
    expect(output).toMatch(/Palo Alto|Silicon Valley/); // Should maintain location accuracy
  });

  test('should maintain consistency between input and output', async () => {
    const consistencyCheck = await aiQualityService.validateConsistency(inputData, generatedOutput);

    expect(consistencyCheck.consistency_score).toBeGreaterThan(0.8);
    expect(consistencyCheck.contradictions).toHaveLength(0);
  });
});
```

### Emotional Resonance Validation Tests

```javascript
describe('Emotional Resonance Validation', () => {
  test('should maintain emotional tone consistency', async () => {
    const warmToneInput = {
      preferredTone: 'warm',
      businessDescription: 'Family-friendly neighborhood bakery',
    };

    const response = await humeService.validateResonance(warmToneInput, generatedOutput);

    expect(response.emotional_resonance.valence).toBeGreaterThan(0.7);
    expect(response.tone_consistency).toBeGreaterThan(0.8);
    expect(response.emotional_drivers).toContain('community_connection');
  });

  test('should validate against emotional resonance baselines', async () => {
    const baseline = await getEmotionalBaseline('business_builder', 'warm');
    const currentOutput = await generateBusinessPlan(testInputs);

    const resonanceComparison = await compareEmotionalResonance(baseline, currentOutput);

    expect(resonanceComparison.improvement_score).toBeGreaterThanOrEqual(0);
    expect(resonanceComparison.regression_detected).toBe(false);
  });
});
```

## Performance and Load Testing

### API Performance Tests

```javascript
describe('API Performance', () => {
  test('should meet response time targets for all endpoints', async () => {
    const performanceTargets = {
      '/v1/messages': 200, // <200ms
      '/v1/validate-input': 500, // <500ms
      '/v1/generate-sparks': 1500, // <1.5s
      '/v1/deliverable': 2000, // <2s
      '/v1/spark-split': 1000, // <1s
      '/v1/feedback': 100, // <100ms
    };

    for (const [endpoint, maxTime] of Object.entries(performanceTargets)) {
      const startTime = performance.now();

      await request(app)
        .post(endpoint)
        .set('Authorization', `Bearer ${validJWT}`)
        .send(validTestData[endpoint])
        .expect(200);

      const responseTime = performance.now() - startTime;
      expect(responseTime).toBeLessThan(maxTime);
    }
  });
});
```

### Load Testing (Locust Integration)

```python
# backend/tests/load_test.py
from locust import HttpUser, task, between

class CanAIUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        # Authenticate user
        self.client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "test123"
        })

    @task(3)
    def view_messages(self):
        self.client.get("/v1/messages")

    @task(2)
    def validate_input(self):
        self.client.post("/v1/validate-input", json={
            "businessType": "retail",
            "primaryChallenge": "Need funding",
            "preferredTone": "warm",
            "desiredOutcome": "secure_funding",
            "session_id": "load_test_session"
        })

    @task(1)
    def generate_sparks(self):
        self.client.post("/v1/generate-sparks", json={
            "initial_prompt_id": "test_prompt_id",
            "user_id": "test_user_id"
        })

# Performance targets: 10,000 concurrent users, <2s response, <1% errors
```

## Accessibility Testing (WCAG 2.2 AA)

### Automated Accessibility Tests

```javascript
describe('Accessibility Compliance', () => {
  test('should pass WCAG 2.2 AA standards', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseURL}/discovery-funnel`);

    const results = await axe.analyze(page);

    expect(results.violations.filter(v => v.impact === 'critical')).toHaveLength(0);
    expect(results.violations.filter(v => v.impact === 'serious')).toHaveLength(0);
  });

  test('should support keyboard navigation', async () => {
    const page = await browser.newPage();
    await page.goto(`${baseURL}/spark-layer`);

    // Test tab navigation through all interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement.tagName);

    // Continue testing full keyboard navigation
    expect(firstFocused).toBe('BUTTON');
  });

  test('should meet color contrast requirements', async () => {
    const contrastResults = await checkColorContrast(page);

    contrastResults.forEach(result => {
      expect(result.ratio).toBeGreaterThanOrEqual(4.5); // WCAG AA requirement
    });
  });
});
```

## Scenario Testing (PRD Section 10)

### Sprinkle Haven Bakery Scenario

```javascript
describe('Sprinkle Haven Bakery Complete Journey', () => {
  test('should complete full F1-F9 journey with >95% success rate', async () => {
    // F1: Discovery Hook
    const messages = await request(app).get('/v1/messages').expect(200);
    expect(messages.body.data.messages.length).toBeGreaterThan(0);

    // F2: Discovery Funnel
    const validation = await request(app)
      .post('/v1/validate-input')
      .send(sprinkleHavenInputs)
      .expect(200);
    expect(validation.body.data.trust_score).toBeGreaterThanOrEqual(85);

    // F3: Spark Generation
    const sparks = await request(app)
      .post('/v1/generate-sparks')
      .set('Authorization', `Bearer ${validJWT}`)
      .send({ initial_prompt_id: validation.body.data.prompt_id })
      .expect(200);
    expect(sparks.body.data.sparks).toHaveLength(3);

    // F4: Payment Processing
    const payment = await request(app)
      .post('/v1/stripe-session')
      .set('Authorization', `Bearer ${validJWT}`)
      .send({
        spark_id: sparks.body.data.sparks[0].id,
        product_track: 'business_builder',
      })
      .expect(200);

    // Continue through F5-F9...
    // Each stage should complete successfully with proper data flow
  });
});
```

## CI/CD Integration and Automation

### GitHub Actions Test Configuration

```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit
        env:
          COVERAGE_THRESHOLD: 80

      - name: Run integration tests
        run: npm run test:integration
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}

      - name: Run accessibility tests
        run: npm run test:a11y

      - name: Run load tests
        run: locust --headless --users 1000 --spawn-rate 10 -t 5m

      - name: Check coverage
        run: npm run coverage:check

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

### Quality Gates and Validation

- **Coverage Gate**: Fail build if <80% coverage
- **Performance Gate**: Fail if any endpoint exceeds target response time
- **Accessibility Gate**: Fail if critical WCAG violations found
- **AI Quality Gate**: Fail if TrustDelta <4.0 or emotional resonance <0.7
- **Security Gate**: Fail if security vulnerabilities detected

## Test Data Management

### Fixtures and Mock Data

```javascript
// backend/tests/fixtures/scenarios.js
export const sprinkleHavenScenario = {
  businessType: 'retail',
  primaryChallenge: 'Need to secure $75,000 funding to launch my artisanal bakery in Denver',
  preferredTone: 'warm',
  desiredOutcome: 'secure_funding',
  detailedInputs: {
    businessDescription: 'Artisanal bakery specializing in organic, locally-sourced pastries...',
    location: 'Denver, CO - LoHi neighborhood',
    fundingGoal: 75000,
    targetMarket: 'Health-conscious families and young professionals',
  },
};

export const serenityYogaScenario = {
  businessType: 'service',
  primaryChallenge: 'Need effective social media strategy to build community',
  preferredTone: 'inspirational',
  desiredOutcome: 'grow_customers',
};
```

### Database Test Environment

```sql
-- Setup test database with proper isolation
CREATE SCHEMA test_canai;
SET search_path TO test_canai;

-- Import all table definitions with test-specific modifications
-- Ensure test data cleanup after each test run
```

## Monitoring and Reporting

### Test Metrics Dashboard

- **Coverage Trends**: Track coverage improvements over time
- **Performance Trends**: Monitor API response time evolution
- **Quality Metrics**: Track TrustDelta and emotional resonance baselines
- **Failure Analysis**: Detailed reporting on test failures and root causes

### PostHog Test Analytics

```javascript
// Track test execution metrics
posthog.capture('test_suite_completed', {
  test_type: 'integration',
  coverage_percentage: 87.3,
  tests_passed: 245,
  tests_failed: 3,
  duration_ms: 45000,
  environment: 'ci',
});
```

This comprehensive test specification ensures complete validation of the CanAI platform's
functionality, performance, and quality standards while maintaining alignment with PRD requirements
and supporting the TaskMaster build process.
