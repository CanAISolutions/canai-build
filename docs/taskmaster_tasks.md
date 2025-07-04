# TaskMaster-Compatible Task Breakdowns

This document outlines TaskMaster-compatible tasks for backend development, organized by section
(6.1 to 18.3). Each task is formatted for Cursor AI to identify gaps and enable TaskMaster to
generate supplemental tasks not explicitly defined in the PRD.

## Section 6.1: Backend Development - Messages and Interactions

```yaml
tasks:
  - id: T6.1.1-messages-api
    description: Implement GET /v1/messages API to fetch trust indicators with caching and stats
    inputs:
      - backend/routes/messages.js
      - backend/services/cache.js
      - databases/migrations/trust_indicators.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - API response with trust indicators and stats
      - Cached trust indicators (5-minute TTL)
      - Supabase trust_indicators table
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for GET /v1/messages
      - Integrate Supabase client to query trust_indicators
      - Calculate stats (SELECT COUNT(*) FROM comparisons WHERE created_at IS NOT NULL)
      - Implement caching with node-cache
      - Log funnel_step event with PostHog

  - id: T6.1.2-log-interaction
    description: Implement POST /v1/log-interaction API and Make.com webhook for interaction logging
    inputs:
      - backend/routes/interactions.js
      - backend/webhooks/log_interaction.js
      - databases/migrations/session_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - API response with logged interactions
      - Webhook handler for interaction logging
      - Supabase session_logs table
    dependencies:
      - T6.1.1-messages-api
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Create Express route for POST /v1/log-interaction
      - Validate request with Joi (interaction_type, details)
      - Store logs in Supabase session_logs
      - Set up Make.com webhook handler
      - Log pricing_modal_viewed event with PostHog

  - id: T6.1.3-preview-spark
    description:
      Implement POST /v1/generate-preview-spark API for free spark generation with sample PDF
      serving
    inputs:
      - backend/routes/sparks.js
      - backend/services/gpt4o.js
      - backend/prompts/preview_spark.js
      - .env (OPENAI_API_KEY, SUPABASE_URL)
    outputs:
      - API response with single spark
      - Sample PDFs served from Supabase storage
    dependencies:
      - T6.1.1-messages-api
      - T8.4.1-ai-integration
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for POST /v1/generate-preview-spark
      - Implement GPT-4o prompt
      - Validate inputs (businessType, tone) with Joi
      - Serve sample PDFs via Supabase storage
      - Log preview_viewed event with PostHog

  - id: T6.1.4-error-handling
    description: Implement retry middleware for API failures and localStorage fallback
    inputs:
      - backend/middleware/retry.js
      - backend/services/cache.js
    outputs:
      - Express middleware for retry logic (3 attempts, 500ms)
      - localStorage fallback cache for trust indicators
    dependencies:
      - T6.1.1-messages-api
    cursor-ai-instructions:
      - Create Express middleware for retry logic
      - Implement localStorage fallback
      - Log errors to Supabase error_logs

  - id: T6.1.5-pricing-api
    description: Implement GET /v1/pricing API to fetch pricing data from Supabase or CMS
    inputs:
      - backend/routes/pricing.js
      - backend/services/cache.js
      - databases/migrations/pricing.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - API response with pricing data
      - Cached pricing data (1-hour TTL)
      - Supabase pricing table
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for GET /v1/pricing
      - Integrate Supabase client to query pricing table
      - Implement caching with node-cache
      - Log pricing_modal_viewed event with PostHog

  - id: T6.1.6-standardize-error-handling
    description: Standardize retry and error handling for messages APIs with input sanitization.
    inputs:
      - backend/middleware/retry.js
      - backend/middleware/validation.js
      - backend/services/supabase.js
      - backend/services/sentry.js
      - .env (SENTRY_DSN, SUPABASE_URL, PROJECT_ID)
    outputs:
      - Standardized retry middleware with 3 attempts and exponential backoff (500ms base)
      - Sanitized inputs using DOMPurify for GET /v1/messages
      - Error logs in Supabase error_logs with retry_count and error_type
    dependencies:
      - T6.1.1-messages-api
      - T9.3.1-error-logs-schema
    cursor-ai-instructions:
      - Update retry.js with exponential backoff (2^i * 500ms, max 5s)
      - Integrate DOMPurify in validation.js for all input fields
      - Log retries and errors to error_logs with fields error_type, retry_count
      - Send critical errors to Sentry
      - Write Jest tests for retry and sanitization (backend/tests/retry.test.js)
```

## Section 6.2: Backend Development - Funnel Input Validation

```yaml
tasks:
  - id: T6.2.1-validate-input-api
    description:
      Implement POST /v1/validate-input API for funnel input validation, trust score, and quiz
      mapping
    inputs:
      - backend/routes/funnel.js
      - backend/middleware/validation.js
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - backend/config/quizRules.json
      - databases/migrations/initial_prompt_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY)
    outputs:
      - API response with validated inputs and trust score
      - Supabase initial_prompt_logs table
      - Webhook handler for funnel input storage
    dependencies:
      - T8.2.1-supabase-schema
      - T6.1.1-messages-api
    cursor-ai-instructions:
      - Create Express route for POST /v1/validate-input
      - Implement Joi validation with regex patterns
      - Map quiz responses using quizRules.json
      - Integrate GPT-4o for trust score
      - Use Hume AI for emotional resonance
      - Log hume_fallback_triggered event if circuit breaker activates
      - Store inputs in Supabase initial_prompt_logs
      - Log funnel_step event with PostHog

  - id: T6.2.2-generate-tooltip
    description: Implement POST /v1/generate-tooltip API for dynamic tooltips
    inputs:
      - backend/routes/tooltip.js
      - backend/services/gpt4o.js
      - backend/services/cache.js
      - .env (OPENAI_API_KEY)
    outputs:
      - API response with tooltip text
      - Cached tooltip response (1-hour TTL)
    dependencies:
      - T6.2.1-validate-input-api
    cursor-ai-instructions:
      - Create Express route for POST /v1/generate-tooltip
      - Generate tooltips with GPT-4o
      - Cache responses with node-cache
      - Validate field input with Joi

  - id: T6.2.3-detect-contradiction
    description: Implement POST /v1/detect-contradiction API for tone/outcome mismatches
    inputs:
      - backend/routes/contradiction.js
      - backend/services/contradiction.js
      - backend/services/gpt4o.js
      - .env (OPENAI_API_KEY)
    outputs:
      - API response with contradiction flags
    dependencies:
      - T6.2.1-validate-input-api
    cursor-ai-instructions:
      - Create Express route for POST /v1/detect-contradiction
      - Implement contradiction logic with GPT-4o
      - Log contradiction_flagged event with PostHog
      - Validate inputs with Joi

  - id: T6.2.4-error-handling
    description: Enhance retry middleware for funnel API failures and localStorage fallback
    inputs:
      - backend/middleware/retry.js
      - backend/services/cache.js
      - backend/services/supabase.js
    outputs:
      - Express middleware for funnel API retries (3 attempts, 500ms)
      - localStorage fallback cache for funnel inputs
    dependencies:
      - T6.2.1-validate-input-api
    cursor-ai-instructions:
      - Update retry middleware for funnel APIs
      - Implement localStorage fallback
      - Log errors to Supabase error_logs with PostHog
  - id: T6.2.5-optimize-input-validation
    description: Enhance input validation with standardized caching and sanitization.
    inputs:
      - backend/routes/funnel.js
      - backend/middleware/validation.js
      - backend/services/cache.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Sanitized inputs for POST /v1/validate-input using DOMPurify
      - Standardized 5-minute TTL cache for trust scores
      - Validation latency under 500ms
    dependencies:
      - T6.2.1-validate-input-api
    cursor-ai-instructions:
      - Integrate DOMPurify in validation.js for all funnel inputs
      - Set 5-minute TTL in cache.js for trust scores
      - Optimize Joi validation to minimize regex complexity
      - Log validation latency to PostHog (funnel_validation)
      - Write Jest tests for sanitization and caching (backend/tests/funnel.test.js)
```

## Section 6.3: Backend Development - Spark Generation

```yaml
tasks:
  - id: T6.3.1-generate-sparks-api
    description:
      Implement POST /v1/generate-sparks API for initial spark generation with generic preview
    inputs:
      - backend/routes/sparks.js
      - backend/services/gpt4o.js
      - backend/services/cache.js
      - databases/migrations/spark_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY)
    outputs:
      - API response with three sparks
      - Supabase spark_logs table with genericPreview data
      - Cached sparks
      - Webhook handler for generating sparks
    dependencies:
      - T6.2.1-validate-input-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for POST /v1/generate-sparks
      - Implement GPT-4o prompt
      - Store genericPreview in spark_logs
      - Cache sparks with node-cache
      - Log funnel_step and spark_selected events with PostHog

  - id: T6.3.2-regenerate-sparks-api
    description: Implement POST /v1/regenerate-sparks API with attempt limits
    inputs:
      - backend/routes/sparks.js
      - backend/middleware/rateLimit.js
      - backend/services/gpt4o.js
      - .env (OPENAI_API_KEY)
    outputs:
      - API response with regenerated sparks
      - Rate limiting middleware (3 or 4 attempts)
    dependencies:
      - T6.3.1-generate-sparks-api
    cursor-ai-instructions:
      - Update Express route for POST /v1/regenerate-sparks
      - Implement rate limiting middleware
      - Log sparks_regenerated event with PostHog
      - Validate inputs with Joi

  - id: T6.3.3-error-handling
    description: Enhance retry middleware for spark API failures and localStorage fallback
    inputs:
      - backend/middleware/retry.js
      - backend/services/cache.js
      - backend/services/supabase.js
    outputs:
      - Express middleware for spark API retries (3 attempts, 500ms)
      - localStorage fallback cache for sparks
    dependencies:
      - T6.3.1-generate-sparks-api
    cursor-ai-instructions:
      - Update retry middleware for spark APIs
      - Implement localStorage fallback
      - Log errors to Supabase error_logs with PostHog

  - id: T6.3.4-spark-scalability
    description: Optimize spark generation for scalability and edge case handling.
    inputs:
      - backend/routes/sparks.js
      - backend/services/cache.js
      - backend/services/gpt4o.js
      - databases/migrations/spark_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY)
    outputs:
      - POST /v1/generate-sparks API with latency under 1.5s for 10,000 users
      - Handling for empty GPT-4o responses with cached fallback
      - Composite index on spark_logs (user_id, created_at)
    dependencies:
      - T6.3.1-generate-sparks-api
      - T7.4.1-scalability
    cursor-ai-instructions:
      - Optimize GPT-4o prompts for efficiency in sparks.js
      - Implement cached fallback for empty responses in cache.js
      - Add composite index idx_spark_logs_user_id_created_at
      - Test scalability with Locust for 10,000 users
      - Log spark_generation_latency to PostHog
      - Write Jest tests for edge cases (backend/tests/sparks.test.js)
```

## Section 6.4: Backend Development - Payment Processing

```yaml
tasks:
  - id: T6.4.1-stripe-session-api
    description: Implement POST /v1/stripe-session API for Stripe checkout with email confirmation
    inputs:
      - backend/routes/stripe.js
      - backend/services/stripe.js
      - backend/middleware/auth.js
      - backend/middleware/validation.js
      - backend/templates/email/confirmation.html
      - backend/webhooks/send_email.js
      - databases/migrations/payment_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, STRIPE_SECRET_KEY)
    outputs:
      - API for creating Stripe session
      - Supabase payment_logs table
      - Webhook for project creation
      - Confirmation email
    dependencies:
      - T6.3.1-generate-sparks-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for POST /v1/stripe-session
      - Integrate Stripe SDK
      - Validate inputs with Joi
      - Authenticate with Memberstack
      - Store session in Supabase payment_logs
      - Send confirmation email
      - Log funnel_step and price_viewed events with PostHog

  - id: T6.4.2-refund-api
    description: Implement POST /v1/refund API for processing refunds
    inputs:
      - backend/routes/stripe.js
      - backend/services/stripe.js
      - backend/middleware/auth.js
    outputs:
      - API for processing refunds
      - Updated Supabase payment_logs with refunded status
    dependencies:
      - T6.4.1-stripe-session-api
    cursor-ai-instructions:
      - Create Express route for POST /v1/refund
      - Implement Stripe refund logic
      - Authenticate with Memberstack
      - Update payment_logs
      - Log refund event with PostHog

  - id: T6.4.3-switch-product-api
    description: Implement POST /v1/switch-product API for product switching
    inputs:
      - backend/routes/stripe.js
      - backend/services/stripe.js
      - backend/middleware/auth.js
      - backend/webhooks/add_project.js
    outputs:
      - API for refunding and creating new session
      - Updated Supabase payment_logs
      - New webhook for project addition
    dependencies:
      - T6.4.1-stripe-session-api
    cursor-ai-instructions:
      - Create Express route for POST /v1/switch-product
      - Implement Stripe refund and new session logic
      - Authenticate with Memberstack
      - Update payment_logs
      - Trigger add_project webhook
      - Log product_switched event with PostHog

  - id: T6.4.4-error-handling
    description: Enhance retry middleware for authentication failures in purchase APIs
    inputs:
      - backend/middleware/retry.js
      - backend/services/supabase.js
    outputs:
      - Middleware for auth retries (3 attempts, exponential backoff)
      - Error logs in Supabase error_logs
    dependencies:
      - T6.4.1-stripe-session-api
    cursor-ai-instructions:
      - Update retry middleware for Stripe APIs
      - Implement exponential backoff
      - Log errors to Supabase error_logs with PostHog

  - id: T6.4.5-auth-webhook-reliability
    description: Enhance Stripe APIs with JWT refresh and webhook idempotency.
    inputs:
      - backend/middleware/auth.js
      - backend/webhooks/add_project.js
      - backend/services/stripe.js
      - .env (SUPABASE_URL, PROJECT_ID, STRIPE_SECRET_KEY)
    outputs:
      - JWT refresh logic for Memberstack authentication
      - Idempotent webhook handler with unique request IDs
      - Webhook failure alerts to Sentry
    dependencies:
      - T6.4.1-stripe-session-api
      - T9.4.1-dlq-webhook
    cursor-ai-instructions:
      - Implement JWT refresh in auth.js with 1-hour expiry
      - Add request_id to add_project.js for idempotency
      - Send webhook failure alerts to Sentry after 3 retries
      - Log webhook_idempotency to PostHog
      - Write Jest tests for refresh and idempotency (backend/tests/stripe.test.js)
```

## Section 6.5: Backend Development - Input Collection

```yaml
tasks:
  - id: T6.5.1-save-progress-api
    description: Implement POST /v1/save-progress API for input collection with industry guidance
    inputs:
      - backend/routes/inputs.js
      - backend/middleware/validation.js
      - backend/middleware/auth.js
      - backend/services/supabase.js
      - backend/services/gpt4o.js
      - backend/prompts/inputs.js
      - databases/migrations/prompt_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY)
    outputs:
      - API response with saved 12-field inputs
      - Supabase prompt_logs table
      - Webhook handler for input storage
    dependencies:
      - T6.4.1-stripe-session-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for POST /v1/save-progress
      - Implement Joi validation
      - Authenticate with Memberstack
      - Generate industry-specific guidance with GPT-4o
      - Store inputs in Supabase prompt_logs
      - Log funnel_step and input_saved events with PostHog

  - id: T6.5.2-generate-tooltip
    description: Reuse POST /v1/generate-tooltip API for input field tooltips
    inputs:
      - backend/routes/tooltip.js
      - backend/services/gpt4o.js
      - backend/services/cache.js
      - .env (OPENAI_API_KEY)
    outputs:
      - API response with tooltip text for input fields
      - Cached tooltip response (1-hour TTL)
    dependencies:
      - T6.5.1-save-progress-api
      - T6.2.2-generate-tooltip
    cursor-ai-instructions:
      - Extend /v1/generate-tooltip route for businessType
      - Generate tooltips with GPT-4o
      - Cache responses with node-cache
      - Log tooltip_viewed event with PostHog

  - id: T6.5.3-error-handling
    description: Enhance retry middleware for input API failures and localStorage fallback
    inputs:
      - backend/middleware/retry.js
      - backend/services/cache.js
      - backend/services/supabase.js
    outputs:
      - Express middleware for input API retries (3 attempts, 500ms)
      - localStorage fallback cache for input progress
    dependencies:
      - T6.5.1-save-progress-api
    cursor-ai-instructions:
      - Update retry middleware for input APIs
      - Implement localStorage fallback
      - Log errors to Supabase error_logs with PostHog

  - id: T6.5.4-resume-api
    description: Implement GET /v1/resume API for resuming input collection
    inputs:
      - backend/routes/inputs.js
      - backend/middleware/auth.js
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - API response with saved inputs
      - Supabase prompt_logs data retrieval
    dependencies:
      - T6.5.1-save-progress-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for GET /v1/resume
      - Authenticate with Memberstack
      - Fetch inputs from Supabase prompt_logs
      - Log input_saved event with PostHog

  - id: T6.5.5-accessible-inputs
    description: Ensure WCAG 2.2 AA compliance for input collection APIs.
    inputs:
      - frontend/public/inputs.html
      - backend/routes/inputs.js
      - backend/tests/accessibility.test.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - ARIA labels and ≥48px tap targets in inputs.html
      - Keyboard navigation and VoiceOver support
      - Accessibility tests with 0 critical issues
    dependencies:
      - T6.5.1-save-progress-api
      - T7.5.1-accessibility
    cursor-ai-instructions:
      - Add ARIA labels to input fields in inputs.html
      - Ensure ≥48px tap targets for mobile inputs
      - Test keyboard navigation and VoiceOver with axe-core
      - Log accessibility_error to PostHog
      - Write accessibility tests (backend/tests/accessibility.test.js)
```

## Section 6.6: Backend Development - Intent Mirroring

```yaml
tasks:
  - id: T6.6.1-intent-mirror-api
    description:
      Implement POST /v1/intent-mirror API for summary, confidence scoring, and question logging
    inputs:
      - backend/routes/intent.js
      - backend/middleware/auth.js
      - backend/middleware/validation.js
      - backend/services/gpt4o.js
      - backend/services/supabase.js
      - backend/services/cache.js
      - backend/prompts/intent.js
      - databases/migrations/prompt_logs.sql
      - databases/migrations/error_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY)
    outputs:
      - API response with summary, confidence score, and questions
      - Updated Supabase prompt_logs and error_logs
      - Cached intent summary
      - Webhook handler for intent data
    dependencies:
      - T6.5.1-save-progress-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for POST /v1/intent-mirror
      - Implement Joi validation
      - Authenticate with Memberstack
      - Generate summary and score with GPT-4o
      - Log questions in prompt_logs
      - Cache response with node-cache
      - Log funnel_step and field_edited events with PostHog

  - id: T6.6.2-support-request
    description: Implement support request logging with support_requests table
    inputs:
      - backend/webhooks/support_request.js
      - backend/services/supabase.js
      - databases/migrations/support_requests.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Webhook handler for support requests
      - Supabase support_requests table with RLS
    dependencies:
      - T6.6.1-intent-mirror-api
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Create Make.com webhook handler
      - Create support_requests table with RLS
      - Log support requests to Supabase
      - Log support_requested event with PostHog

  - id: T6.6.3-error-handling
    description: Enhance retry middleware for intent API failures and support link trigger
    inputs:
      - backend/middleware/retry.js
      - backend/services/cache.js
      - backend/services/supabase.js
    outputs:
      - Express middleware for intent API retries (3 attempts, 500ms)
      - localStorage fallback cache
    dependencies:
      - T6.6.1-intent-mirror-api
    cursor-ai-instructions:
      - Update retry middleware for intent APIs
      - Implement localStorage fallback
      - Trigger support link after 2 low-confidence tries
      - Log errors to Supabase error_logs with PostHog

  - id: T6.6.4-emotional-driver-mapping
    description: Define and validate emotional driver mappings for intent mirroring.
    inputs:
      - backend/prompts/intent.js
      - backend/services/gpt4o.js
      - backend/config/driverRules.json
      - .env (OPENAI_API_KEY)
    outputs:
      - driverRules.json mapping 12 fields to drivers (e.g., community, trust)
      - Validated mappings with >90% accuracy
      - Updated intent.js prompts with driver inference
    dependencies:
      - T6.6.1-intent-mirror-api
      - T8.6.3-emotional-drivers
    cursor-ai-instructions:
      - Create driverRules.json (e.g., businessType: "local retail" → community)
      - Update intent.js prompts to use driverRules.json
      - Validate mappings with user feedback from feedback_logs
      - Log driver_inference_accuracy to PostHog
      - Write Jest tests for driver inference (backend/tests/intent.test.js)
```

## Section 6.7: Backend Development - Deliverable Generation

```yaml
tasks:
  - id: T6.7.1-deliverable-api
    description: Implement POST /v1/deliverable API for generating tailored outputs
    inputs:
      - backend/routes/deliverables.js
      - backend/middleware/auth.js
      - backend/middleware/validation.js
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - backend/services/cache.js
      - databases/migrations/comparisons.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY, HUME_API_KEY)
    outputs:
      - API response with CanAI/generic outputs, PDF URL, and resonance data
      - Supabase comparisons table
      - Cached deliverable
      - Webhook handler for PDF generation
    dependencies:
      - T6.6.1-intent-mirror-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for POST /v1/deliverable
      - Implement Joi validation
      - Authenticate with Memberstack
      - Generate outputs with GPT-4o
      - Validate resonance with Hume AI
      - Store in Supabase comparisons
      - Log funnel_step and deliverable_generated events with PostHog

  - id: T6.7.2-generation-status-api
    description: Implement GET /v1/generation-status API for checking deliverable status
    inputs:
      - backend/routes/deliverables.js
      - backend/middleware/auth.js
      - backend/services/supabase.js
    outputs:
      - API response with status and PDF URL
    dependencies:
      - T6.7.1-deliverable-api
    cursor-ai-instructions:
      - Create Express route for GET /v1/generation-status
      - Authenticate with Memberstack
      - Query Supabase comparisons for status
      - Log status check event with PostHog

  - id: T6.7.3-revision-regeneration-api
    description: Implement POST /v1/request-revision and /v1/regenerate-deliverable APIs
    inputs:
      - backend/routes/deliverables.js
      - backend/middleware/auth.js
      - backend/middleware/rateLimit.js
      - backend/services/gpt4o.js
    outputs:
      - API response with revised/regenerated deliverable
      - Rate limiting middleware (2 attempts)
    dependencies:
      - T6.7.1-deliverable-api
    cursor-ai-instructions:
      - Create Express routes for revision and regeneration
      - Implement rate limiting
      - Authenticate with Memberstack
      - Generate revised outputs with GPT-4o
      - Log revision_requested event with PostHog

  - id: T6.7.4-error-handling
    description: Enhance retry middleware for deliverable API failures and timeout handling
    inputs:
      - backend/middleware/retry.js
      - backend/services/cache.js
      - backend/services/supabase.js
    outputs:
      - Express middleware for retries (3 attempts, 500ms)
      - localStorage fallback for partial outputs
    dependencies:
      - T6.7.1-deliverable-api
    cursor-ai-instructions:
      - Update retry middleware
      - Implement localStorage fallback
      - Handle 15s timeout with partial output
      - Log errors to Supabase error_logs with PostHog

  - id: T6.7.5-ai-edge-case-handling
    description: Handle AI edge cases for deliverable generation.
    inputs:
      - backend/routes/deliverables.js
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - backend/services/cache.js
      - .env (OPENAI_API_KEY, HUME_API_KEY)
    outputs:
      - Handling for empty GPT-4o responses and Hume AI failures
      - Cached fallback for failed API calls
      - Error logs with edge_case_type
    dependencies:
      - T6.7.1-deliverable-api
      - T8.6.1-output-quality-validation
    cursor-ai-instructions:
      - Implement fallback to cached outputs in cache.js for empty responses
      - Retry Hume AI calls (max 2 attempts) on failure
      - Log edge cases (e.g., empty_response, hume_failure) to error_logs
      - Log edge_case_handled to PostHog
      - Write Jest tests for edge cases (backend/tests/deliverables.test.js)
```

## Section 6.8: Backend Development - SparkSplit Comparisons

```yaml
tasks:
  - id: T6.8.1-spark-split-api
    description: Implement POST /v1/spark-split API for comparing CanAI and generic outputs
    inputs:
      - backend/routes/sparkSplit.js
      - backend/middleware/auth.js
      - backend/middleware/validation.js
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - backend/services/trustDelta.js
      - backend/services/diff.js
      - backend/services/cache.js
      - backend/prompts/trustDelta.js
      - databases/migrations/comparisons.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY, HUME_API_KEY)
    outputs:
      - API response with comparison, TrustDelta, and resonance data
      - Supabase comparisons table with encrypted fields
      - Cached spark split
      - Webhook handler for comparison data
    dependencies:
      - T6.7.1-deliverable-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for POST /v1/spark-split
      - Implement Joi validation
      - Authenticate with Memberstack
      - Generate generic output with GPT-4o
      - Compute differences using diff package
      - Validate resonance with Hume AI
      - Compute TrustDelta
      - Store in Supabase with encryption
      - Log funnel_step, plan_compared, trustdelta_viewed events with PostHog

  - id: T6.8.2-feedback-logging
    description: Implement feedback logging for SparkSplit preferences
    inputs:
      - backend/webhooks/save_comparison.js
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Webhook logging feedback to Supabase comparisons
    dependencies:
      - T6.8.1-spark-split-api
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Create Make.com webhook handler
      - Update Supabase comparisons with feedback
      - Log generic_preferred event with PostHog

  - id: T6.8.3-error-handling
    description: Enhance retry middleware for SparkSplit API failures and encryption
    inputs:
      - backend/middleware/retry.js
      - backend/services/cache.js
      - backend/services/supabase.js
    outputs:
      - Retry middleware (3 attempts)
      - localStorage fallback cache
      - Encrypted fields in Supabase
    dependencies:
      - T6.8.1-spark-split-api
    cursor-ai-instructions:
      - Update retry middleware
      - Implement localStorage fallback
      - Enable Supabase vault encryption
      - Log errors to Supabase error_logs with PostHog
  - id: T6.8.4-webhook-reliability
    description: Enhance SparkSplit webhook reliability with alerts and idempotency.
    inputs:
      - backend/webhooks/save_comparison.js
      - backend/services/supabase.js
      - backend/services/sentry.js
      - .env (SUPABASE_URL, PROJECT_ID, SENTRY_DSN)
    outputs:
      - Idempotent webhook with request_id
      - Admin alerts for webhook failures after 3 retries
      - Error logs with webhook_failure_reason
    dependencies:
      - T6.8.1-spark-split-api
      - T9.4.1-dlq-webhook
    cursor-ai-instructions:
      - Add request_id to save_comparison.js for idempotency
      - Send Sentry alerts for webhook failures after 3 retries
      - Log failures to error_logs with webhook_failure_reason
      - Log webhook_idempotency to PostHog
      - Write Jest tests for webhook reliability (backend/tests/webhooks.test.js)
```

## Section 6.9: Backend Development - Feedback and Referrals

```yaml
tasks:
  - id: T6.9.1-feedback-api
    description: Implement POST /v1/feedback API for feedback submission and sentiment analysis
    inputs:
      - backend/routes/feedback.js
      - backend/middleware/validation.js
      - backend/services/gpt4o.js
      - backend/services/supabase.js
      - backend/prompts/feedback.js
      - backend/webhooks/save_feedback.js
      - databases/migrations/feedback_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY)
    outputs:
      - API response with logged feedback and sentiment
      - Supabase feedback_logs table
      - Webhook handler for feedback storage
    dependencies:
      - T6.8.1-spark-split-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create Express route for POST /v1/feedback
      - Implement Joi validation
      - Analyze sentiment with GPT-4o
      - Store feedback in Supabase
      - Trigger Make.com webhook
      - Log funnel_step and feedback_submitted events with PostHog

  - id: T6.9.2-refer-api
    description: Implement POST /v1/refer API for referral link generation
    inputs:
      - backend/routes/refer.js
      - backend/middleware/auth.js
      - backend/middleware/validation.js
      - backend/services/supabase.js
      - backend/services/cache.js
      - backend/webhooks/save_referral.js
      - databases/migrations/session_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - API response with referral link
      - Supabase session_logs table
      - Webhook handler for referral storage
    dependencies:
      - T6.9.1-feedback-api
    cursor-ai-instructions:
      - Create Express route for POST /v1/refer
      - Implement Joi validation
      - Authenticate with Memberstack
      - Generate unique referral link
      - Store referral in Supabase
      - Log referral_shared event with PostHog

  - id: T6.9.3-followup-email
    description: Implement follow-up email automation with purge confirmation
    inputs:
      - backend/webhooks/send_followup.js
      - backend/templates/email/purge.html
      - backend/services/supabase.js
      - databases/migrations/error_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Webhook handler for follow-up emails
      - Supabase error_logs with poor rating logs
      - Purge confirmation email
    dependencies:
      - T6.9.1-feedback-api
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Create Make.com webhook handler
      - Log poor ratings (<3/5) to Supabase
      - Send purge confirmation email
      - Log poor_rating_followup, followup_viewed events with PostHog

  - id: T6.9.4-data-purge
    description: Implement POST /v1/purge-data API for GDPR/CCPA-compliant data deletion
    inputs:
      - backend/routes/purge.js
      - backend/middleware/auth.js
      - backend/services/supabase.js
      - backend/webhooks/purge_data.js
    outputs:
      - API response confirming data purge
      - Webhook handler for purge logging
      - localStorage cache for purge status
    dependencies:
      - T6.9.1-feedback-api
    cursor-ai-instructions:
      - Create Express route for POST /v1/purge-data
      - Authenticate with Memberstack
      - Implement RLS-based data purge
      - Trigger Make.com webhook
      - Cache purge status
      - Log purge event with PostHog

  - id: T6.9.5-api-docs-maintenance
    description: Maintain and validate feedback API documentation.
    inputs:
      - backend/docs/api.yaml
      - backend/routes/feedback.js
      - backend/tests/api.test.js
      - .env
    outputs:
      - Updated OpenAPI spec for /v1/feedback and /v1/refer
      - CI/CD validation for API schema
      - Documentation tests with 0 errors
    dependencies:
      - T6.9.1-feedback-api
      - T8.6.6-api-documentation
    cursor-ai-instructions:
      - Update api.yaml with feedback and refer endpoints
      - Add CI/CD step to validate spec with swagger-cli
      - Test schema accuracy with Jest
      - Log api_docs_updated to PostHog
      - Write Jest tests for API docs (backend/tests/api.test.js)
```

## Section 7.7: Backend Development - Optimization and Security

```yaml
tasks:
  - id: T7.1.1-performance-optimization
    description: Optimize API and page load performance with caching and indexing
    inputs:
      - backend/routes/sparks.js
      - backend/routes/deliverables.js
      - backend/services/cache.js
      - backend/services/gpt4o.js
      - databases/migrations/spark_cache.sql
      - frontend/vite.config.ts
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Optimized APIs (latency <1.5s for sparks, <2s for revision)
      - Supabase spark_cache table
      - Minified Webflow assets
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Implement node-cache for API responses
      - Create spark_cache table with index
      - Optimize Supabase queries
      - Minify assets using Vite
      - Log api_latency and page_load events with PostHog

  - id: T7.2.1-security-implementation
    description: Implement security measures (RLS, rate limiting, CSP, consent modal)
    inputs:
      - backend/middleware/auth.js
      - backend/middleware/rateLimit.js
      - backend/middleware/validation.js
      - backend/server.js
      - backend/routes/consent.js
      - databases/migrations/feedback_logs.sql
      - frontend/public/consent.html
      - supabase/vault/config.yaml
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - RLS policies
      - Rate limiting middleware
      - CSP headers
      - Consent modal and /v1/consent API
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Configure Memberstack JWT
      - Implement express-rate-limit
      - Add CSP headers
      - Create /v1/consent API
      - Define RLS policies
      - Enable Supabase vault
      - Log rate_limit_exceeded events with PostHog

  - id: T7.3.1-data-lifecycle
    description: Implement data purge and anonymization with pg_cron jobs
    inputs:
      - backend/routes/purge.js
      - databases/cron/purge.sql
      - databases/cron/anonymize.sql
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - /v1/purge-data API
      - pg_cron jobs for purge and anonymization
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create /v1/purge-data API
      - Write pg_cron scripts
      - Log data_purged and data_anonymized events with PostHog

  - id: T7.4.1-scalability
    description: Configure scalable backend and caching for 10k users
    inputs:
      - backend/server.js
      - backend/services/cache.js
      - databases/migrations/spark_cache.sql
      - docker-compose.yml
      - backend/health.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Scalable Render backend
      - spark_cache table
      - Health check endpoint
    dependencies:
      - T7.1.1-performance-optimization
    cursor-ai-instructions:
      - Configure Render auto-scaling
      - Implement cache-first strategy
      - Create spark_cache table
      - Add health check endpoint
      - Log user_load events with PostHog

  - id: T7.5.1-accessibility
    description: Ensure WCAG 2.2 AA compliance with ARIA labels and tap targets
    inputs:
      - frontend/public/
      - frontend/src/cms/
      - backend/tests/accessibility.test.js
      - backend/tests/contrast.test.js
      - backend/tests/voiceover.test.js
    outputs:
      - ARIA labels
      - WCAG-compliant UI
      - Accessibility tests
    dependencies:
      - Webflow setup
    cursor-ai-instructions:
      - Add ARIA labels to Webflow elements
      - Ensure ≥48px tap targets
      - Write axe-core tests
      - Run pa11y-ci for contrast
      - Log accessibility_error events with PostHog
  - id: T7.6.1-cost-controls
    description: Implement Hume AI circuit breaker and cost tracking
    inputs:
      - backend/middleware/hume.js
      - backend/services/hume.js
      - backend/services/gpt4o.js
      - databases/migrations/usage_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY)
    outputs:
      - Circuit breaker for Hume AI
      - usage_logs table
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Implement Hume AI circuit breaker
      - Create usage_logs table
      - Track Hume AI and GPT-4o usage
      - Log hume_fallback_triggered events with PostHog

  - id: T7.7.1-query-optimization
    description: Optimize Supabase queries for high-traffic tables.
    inputs:
      - databases/migrations/prompt_logs.sql
      - databases/migrations/spark_logs.sql
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Composite indexes for prompt_logs and spark_logs
      - Query plans with <100ms execution time
      - Test results for 10,000 users
    dependencies:
      - T8.2.1-supabase-schema
      - T7.4.1-scalability
    cursor-ai-instructions:
      - Add composite indexes (e.g., idx_prompt_logs_user_id_created_at)
      - Analyze query plans with EXPLAIN ANALYZE
      - Test queries with Locust for 10,000 users
      - Log query_latency to PostHog
      - Write Supatest tests for queries (backend/tests/supabase.test.js)
  - id: T7.7.2-comprehensive-monitoring
    description: Implement comprehensive API and error monitoring.
    inputs:
      - backend/services/posthog.js
      - backend/services/sentry.js
      - databases/migrations/error_logs.sql
      - .env (POSTHOG_API_KEY, SENTRY_DSN, SUPABASE_URL, PROJECT_ID)
    outputs:
      - Standardized logging for API latency and success/failure rates
      - Error aggregation view in Supabase
      - Alerts for outages >5 minutes
    dependencies:
      - T8.5.1-monitoring-setup
      - T9.3.1-error-logs-schema
    cursor-ai-instructions:
      - Log latency and status for all APIs in posthog.js
      - Create Supabase view for error aggregation by error_type
      - Set up Sentry alerts for outages >5 minutes
      - Log monitoring_alert to PostHog
      - Write Jest tests for monitoring (backend/tests/monitoring.test.js)
  - id: T7.7.3-continuous-accessibility
    description: Implement continuous accessibility monitoring.
    inputs:
      - frontend/public/
      - backend/tests/accessibility.test.js
      - .github/workflows/accessibility.yml
      - .env
    outputs:
      - CI/CD step for pa11y-ci accessibility tests
      - Tests for keyboard navigation and screen readers
      - Accessibility report with 0 critical issues
    dependencies:
      - T7.5.1-accessibility
      - T13.1.3-accessibility-tests
    cursor-ai-instructions:
      - Add pa11y-ci to CI/CD for frontend/public/
      - Test keyboard navigation and NVDA/JAWS compatibility
      - Generate accessibility report in accessibility-report.md
      - Log accessibility_error to PostHog
      - Write accessibility tests (backend/tests/accessibility.test.js)
```

## Section 8.8: Backend Development - Quality and Integration

```yaml
tasks:
  - id: T8.1.1-backend-setup
    description: Configure Render backend with Express and health check
    inputs:
      - backend/server.js
      - backend/health.js
      - docker-compose.yml
      - .env (PORT=10000, SUPABASE_URL, PROJECT_ID)
    outputs:
      - Running backend
      - /health endpoint
    dependencies: []
    cursor-ai-instructions:
      - Initialize Express server
      - Add /health endpoint
      - Configure Render port and SSL
      - Log server start event with PostHog

  - id: T8.2.1-supabase-schema
    description: Implement Supabase schema with RLS and indexes, including share_logs
    inputs:
      - databases/migrations/prompt_logs.sql
      - databases/migrations/comparisons.sql
      - databases/migrations/share_logs.sql
      - databases/migrations/spark_cache.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Supabase tables with RLS and indexes
    dependencies: []
    cursor-ai-instructions:
      - Create schema migrations
      - Define RLS policies
      - Add indexes
      - Write Supatest tests

  - id: T8.3.1-makecom-add-project
    description: Implement Make.com scenario for project creation on Stripe checkout
    inputs:
      - backend/webhooks/add_project.js
      - backend/services/stripe.js
      - backend/webhooks/make_scenarios/add_project.json
      - .env (SUPABASE_URL, PROJECT_ID, STRIPE_SECRET_KEY)
    outputs:
      - Project created in Supabase
      - Confirmation email
    dependencies:
      - T6.4.1-stripe-session-api
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create webhook handler
      - Validate Stripe event
      - Insert project data into Supabase
      - Trigger email webhook
      - Log webhook_triggered event with PostHog

  - id: T8.3.2-makecom-other-scenarios
    description: Implement remaining Make.com scenarios (admin, payment, support, etc.)
    inputs:
      - backend/webhooks/admin_add_project.js
      - backend/webhooks/log_payment.js
      - backend/webhooks/log_interaction.js
      - backend/webhooks/save_funnel.js
      - backend/webhooks/save_inputs.js
      - backend/webhooks/send_email.js
      - backend/webhooks/support.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Webhook handlers for multiple scenarios
      - Make.com scenarios
    dependencies:
      - T8.3.1-makecom-add-project
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Implement webhook handlers
      - Update scenarios for Supabase
      - Log webhook_triggered events with PostHog

  - id: T8.3.3-makecom-validation
    description: Validate and update existing Make.com scenarios
    inputs:
      - backend/webhooks/
      - backend/webhooks/make_scenarios/
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Updated scenarios
      - Validation report
    dependencies:
      - T8.3.1-makecom-add-project
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Validate scenarios
      - Update JSON configs
      - Test with Supatest
      - Log validation_complete event with PostHog

  - id: T8.4.1-ai-integration
    description: Integrate GPT-4o and Hume AI with circuit breaker and emotional driver inference
    inputs:
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - backend/middleware/hume.js
      - backend/prompts/business_plan.js
      - .env (OPENAI_API_KEY, HUME_API_KEY)
    outputs:
      - GPT-4o and Hume AI services
      - Circuit breaker
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Implement GPT-4o client
      - Configure Hume AI for resonance
      - Add circuit breaker
      - Infer emotional drivers
      - Log hume_fallback_triggered event with PostHog

  - id: T8.5.1-monitoring-setup
    description: Configure Sentry and PostHog for error and event tracking
    inputs:
      - backend/services/sentry.js
      - backend/services/posthog.js
      - .env (SENTRY_DSN, POSTHOG_API_KEY)
    outputs:
      - Error tracking
      - Event tracking
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Initialize Sentry client
      - Configure PostHog for events
      - Log errors to Supabase
      - Write Jest tests

  - id: T8.6.1-output-quality-validation
    description: Implement quality validation for GPT-4o outputs
    inputs:
      - backend/routes/deliverables.js
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - backend/services/sparkSplit.js
      - backend/prompts/business_plan.js
      - .env (OPENAI_API_KEY, HUME_API_KEY)
    outputs:
      - Validation logic
      - Quality score (TrustDelta ≥4.2)
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Validate outputs (650–850 words)
      - Score quality
      - Retry if TrustDelta <4.2
      - Log output_quality event with PostHog

  - id: T8.6.2-support-feedback
    description: Enhance support queue and feedback analysis
    inputs:
      - backend/webhooks/support.js
      - backend/routes/feedback.js
      - backend/prompts/feedback.js
      - backend/templates/email/support.html
      - .env (SUPABASE_URL, PROJECT_ID, OPENAI_API_KEY)
    outputs:
      - Support webhook handler
      - GPT-4o sentiment analysis
    dependencies:
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Queue critical errors
      - Analyze feedback sentiment
      - Send support emails
      - Log support_request event with PostHog

  - id: T8.6.3-emotional-drivers
    description: Enhance GPT-4o prompts for emotional drivers
    inputs:
      - backend/prompts/business_plan.js
      - backend/prompts/social_media.js
      - backend/prompts/website_audit.js
      - backend/services/gpt4o.js
      - .env (OPENAI_API_KEY)
    outputs:
      - Updated prompts
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Update prompts for emotional drivers
      - Emphasize local context
      - Log driver_inference event with PostHog

  - id: T8.6.4-interactive-delivery
    description: Implement milestone visualizations and shareable snippets
    inputs:
      - frontend/public/deliverables.html
      - frontend/src/cms/summary.js
    outputs:
      - Webflow page with timelines
      - Shareable snippets
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Add milestone timeline
      - Enable snippet sharing
      - Write Jest tests

  - id: T8.6.5-social-website-prompts
    description: Update Social Media and Website Audit prompts
    inputs:
      - backend/prompts/social_media.js
      - backend/prompts/website_audit.js
      - backend/services/gpt4o.js
      - .env (OPENAI_API_KEY)
    outputs:
      - Updated prompts
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Enhance prompts for resonance
      - Use 12 fields for personalization
      - Log output_quality event with PostHog

  - id: T8.6.6-api-documentation
    description: Document API Catalog in OpenAPI format
    inputs:
      - backend/docs/api.yaml
      - backend/routes/
    outputs:
      - OpenAPI spec
      - Swagger UI at /docs
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Create OpenAPI spec
      - Generate Swagger UI
      - Validate with Swagger tools
      - Write Jest tests

  - id: T8.6.7-gpt4o-finetuning
    description: Fine-tune GPT-4o for contradiction/NSFW detection
    inputs:
      - backend/services/gpt4o.js
      - databases/feedback_logs.sql
      - backend/tests/filter.test.js
      - .env (OPENAI_API_KEY)
    outputs:
      - Fine-tuned GPT-4o model
      - Test suite (>95% accuracy)
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Collect feedback for fine-tuning
      - Create test cases
      - Fine-tune GPT-4o
      - Log finetuning_complete event with PostHog

  - id: T8.6.8-modular-architecture
    description: Design modular architecture for integrations
    inputs:
      - backend/server.js
      - backend/services/
    outputs:
      - Plugin system
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Create plugin system
      - Define integration interfaces
      - Write Jest tests

  - id: T8.8.2-dependency-validation
    description: Validate TaskMaster dependency graph for circular dependencies.
    inputs:
      - .github/workflows/taskmaster.yml
      - backend/tests/taskmaster.test.js
      - .env
    outputs:
      - Validated acyclic dependency graph
      - CI/CD step for dependency validation
      - Error logs for circular dependencies
    dependencies:
      - T8.1.1-backend-setup
      - T16.1.3-taskmaster-validation
    cursor-ai-instructions:
      - Use dependency-cruiser to detect circular dependencies
      - Add CI/CD step to validate TaskMaster tasks
      - Log circular dependencies to error_logs
      - Log task_validation_success to PostHog
      - Write Jest tests for dependencies (backend/tests/taskmaster.test.js)
  - id: T8.8.3-finetuning-dataset
    description: Ensure high-quality dataset for GPT-4o fine-tuning.
    inputs:
      - backend/services/gpt4o.js
      - databases/feedback_logs.sql
      - backend/tests/filter.test.js
      - .env (OPENAI_API_KEY)
    outputs:
      - Dataset with ≥10,000 anonymized samples
      - Cross-validation for >95% accuracy
      - Test suite for contradiction/NSFW detection
    dependencies:
      - T8.6.7-gpt4o-finetuning
    cursor-ai-instructions:
      - Collect ≥10,000 samples from feedback_logs
      - Implement 5-fold cross-validation for fine-tuning
      - Test contradiction/NSFW detection with Jest
      - Log finetuning_dataset_validated to PostHog
      - Write Jest tests for dataset quality (backend/tests/filter.test.js)
```

## Section 9.6: Backend Development - Error Handling and Recovery

```yaml
tasks:
  - id: T9.1.1-error-middleware
    description: Implement retry and error handling middleware for empathetic responses
    inputs:
      - backend/middleware/retry.js
      - backend/middleware/error.js
      - backend/services/sentry.js
      - .env (SENTRY_DSN)
    outputs:
      - Retry middleware (3 attempts, 500ms)
      - Error middleware (<100ms prompts)
    dependencies:
      - T8.5.1-monitoring-setup
    cursor-ai-instructions:
      - Create retry middleware with backoff
      - Implement empathetic error messages
      - Log errors to Sentry
      - Write Jest tests

  - id: T9.2.1-filter-contradiction-api
    description: Implement /v1/filter-input and /v1/detect-contradiction APIs
    inputs:
      - backend/routes/filter.js
      - backend/routes/contradiction.js
      - backend/middleware/validation.js
      - backend/services/gpt4o.js
      - backend/webhooks/filter_input.js
      - .env (OPENAI_API_KEY)
    outputs:
      - APIs for NSFW/contradiction detection
      - Webhook for filtering
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Create Express routes
      - Implement GPT-4o validation (>95% accuracy)
      - Log input_filtered event with PostHog
      - Write Jest tests

  - id: T9.3.1-error-logs-schema
    description: Update error_logs schema with error_type and indexes
    inputs:
      - databases/migrations/error_logs.sql
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Updated error_logs table
      - Indexes for performance
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Add error_type, retry_count
      - Create indexes
      - Define RLS policy
      - Write Supatest tests

  - id: T9.4.1-dlq-webhook
    description: Implement DLQ for failed Make.com webhooks
    inputs:
      - backend/webhooks/dlq.js
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - DLQ webhook handler
      - Failed events logged
    dependencies:
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Create DLQ handler (3 retries, 1hr intervals)
      - Log webhook_failure
      - Write Jest tests

  - id: T9.5.1-support-queue
    description: Implement support request queue for critical errors
    inputs:
      - backend/webhooks/support.js
      - backend/webhooks/send_email.js
      - backend/templates/email/support.html
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Support webhook handler
      - Support email template
    dependencies:
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Create support webhook
      - Send personalized emails
      - Log support_request event with PostHog
      - Write Jest tests

  - id: T9.6.1-resume-api
    description: Implement /v1/resume API for deliverable timeout recovery
    inputs:
      - backend/routes/deliverables.js
      - backend/services/supabase.js
      - backend/webhooks/send_email.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - /v1/resume API
      - Resume link email
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Create /v1/resume for partial outputs
      - Send resume link via email
      - Log timeout_recovery event with PostHog
      - Write Jest tests

  - id: T9.6.2-error-handling-standardization
    description: Standardize error handling across all APIs with empathetic responses.
    inputs:
      - backend/middleware/error.js
      - backend/services/sentry.js
      - backend/services/posthog.js
      - .env (SENTRY_DSN, POSTHOG_API_KEY)
    outputs:
      - Centralized error middleware with empathetic messages
      - Standardized logging for all API errors
      - Error aggregation for trend analysis
    dependencies:
      - T9.1.1-error-middleware
      - T9.3.1-error-logs-schema
    cursor-ai-instructions:
      - Centralize error handling in error.js with user-friendly messages
      - Log all errors to error_logs with endpoint, status, error_type
      - Create Supabase view for error trends by endpoint
      - Log error_trend_analyzed to PostHog
      - Write Jest tests for error handling (backend/tests/error.test.js)
```

## Section 10.4: Backend Development - Deliverable Scenarios

```yaml
tasks:
  - id: T10.1.1-deliverable-generation
    description: Implement deliverable generation for all product tracks
    inputs:
      - backend/routes/deliverables.js
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - backend/prompts/business_plan.js
      - backend/prompts/social_media.js
      - backend/prompts/website_audit.js
      - databases/migrations/comparisons.sql
      - .env (OPENAI_API_KEY, HUME_API_KEY, SUPABASE_URL, PROJECT_ID)
    outputs:
      - POST /v1/request-revision API
      - Supabase comparisons table
      - Deliverables in storage
    dependencies:
      - T8.4.1-ai-integration
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Update /v1/request-revision for deliverables
      - Validate output quality (TrustDelta ≥4.2)
      - Store outputs in Supabase
      - Log deliverable_generated event with PostHog
      - Write Jest tests

  - id: T10.1.2-spark-split
    description: Enhance POST /v1/spark-split for scenario-specific comparisons
    inputs:
      - backend/routes/sparkSplit.js
      - backend/services/sparkSplit.js
      - backend/services/hume.js
      - .env (HUME_API_KEY)
    outputs:
      - API for comparing outputs
      - Supabase comparisons table
    dependencies:
      - T10.1.1-deliverable-generation
    cursor-ai-instructions:
      - Update sparkSplit.js for TrustDelta ≥4.2
      - Store results in comparisons
      - Log plan_compared event with PostHog
      - Write Jest tests

  - id: T10.1.3-feedback-sharing
    description: Implement feedback and sharing for scenarios
    inputs:
      - backend/routes/feedback.js
      - backend/routes/refer.js
      - backend/webhooks/save_feedback.js
      - backend/webhooks/save_referral.js
      - databases/migrations/feedback_logs.sql
      - databases/migrations/share_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - POST /v1/feedback, POST /v1/refer
      - Supabase feedback_logs, share_logs
      - Webhooks for feedback/referrals
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Implement feedback and referral APIs
      - Store in Supabase
      - Trigger Make.com webhooks
      - Log feedback_submitted, referral_shared events with PostHog
      - Write Jest tests

  - id: T10.1.4-error-handling
    description: Enhance error handling for scenario-specific edge cases
    inputs:
      - backend/routes/deliverables.js
      - backend/middleware/retry.js
      - backend/webhooks/send_email.js
      - databases/migrations/error_logs.sql
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - GET /v1/resume for timeout recovery
      - Updated error_logs
    dependencies:
      - T9.1.1-error-middleware
      - T9.3.1-error-logs-schema
    cursor-ai-instructions:
      - Update /v1/resume for timeouts
      - Log scenario-specific errors
      - Send resume link emails
      - Log timeout_recovery event with PostHog
      - Write Jest tests

  - id: T10.4.1-edge-case-testing
    description: Enhance test coverage for scenario-specific edge cases.
    inputs:
      - backend/tests/deliverables.test.js
      - backend/tests/sparkSplit.test.js
      - backend/routes/deliverables.js
      - backend/routes/sparkSplit.js
      - .env
    outputs:
      - Tests for invalid JWTs, timeouts, and malformed inputs
      - >90% test coverage for deliverables and sparkSplit
      - Mocked GPT-4o and Hume AI responses
    dependencies:
      - T10.1.1-deliverable-generation
      - T13.1.1-unit-tests
    cursor-ai-instructions:
      - Write Jest tests for edge cases (e.g., invalid JWT, 429 responses)
      - Use nock to mock GPT-4o and Hume AI APIs
      - Achieve >90% coverage with coverage report
      - Log test_coverage_achieved to PostHog
      - Write Jest tests for edge cases (backend/tests/deliverables.test.js)
```

## Section 11.4: Backend Development - Funnel and Compliance

```yaml
tasks:
  - id: T11.1.1-tech-stack-enforcement
    description: Restrict backend to approved tech stack
    inputs:
      - backend/server.js
      - backend/services/
      - package.json
      - .eslintrc.js
      - .env
    outputs:
      - Backend with approved services
      - ESLint rules
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Configure Express for approved services
      - Add ESLint rules
      - Validate package.json
      - Log server_start with PostHog
      - Write Jest tests

  - id: T11.1.2-makecom-scenario-reuse
    description: Enforce reuse of Make.com scenarios
    inputs:
      - backend/webhooks/
      - backend/webhooks/make_scenarios/
      - .env
    outputs:
      - Webhooks using existing scenarios
    dependencies:
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Update webhooks for scenarios
      - Block new scenario creation
      - Log webhook_triggered with PostHog
      - Write Jest tests

  - id: T11.2.1-funnel-optimization
    description: Optimize 2-Step Funnel for ≤30s
    inputs:
      - backend/routes/funnel.js
      - backend/middleware/validation.js
      - backend/services/gpt4o.js
      - databases/migrations/initial_prompt_logs.sql
      - .env
    outputs:
      - POST /v1/validate-input API (<500ms)
      - Supabase initial_prompt_logs
    dependencies:
      - T6.2.1-validate-input-api
    cursor-ai-instructions:
      - Optimize /v1/validate-input
      - Minimize Joi schema fields
      - Cache trust scores
      - Log funnel_step with PostHog
      - Write Jest tests

  - id: T11.2.2-output-alignment
    description: Ensure outputs align with brandVoice
    inputs:
      - backend/prompts/
      - backend/services/gpt4o.js
      - backend/services/hume.js
      - .env
    outputs:
      - Prompts with brandVoice
      - Resonance >0.7
    dependencies:
      - T8.6.3-emotional-drivers
    cursor-ai-instructions:
      - Update prompts for brandVoice
      - Infer emotional drivers
      - Validate resonance
      - Log output_quality with PostHog
      - Write Jest tests

  - id: T11.3.1-user-ownership
    description: Implement user ownership and purge
    inputs:
      - databases/migrations/prompt_logs.sql
      - databases/cron/purge.sql
      - backend/services/supabase.js
      - frontend/public/consent.html
      - backend/routes/consent.js
      - .env
    outputs:
      - RLS policies
      - Data purge cron
      - POST /v1/consent
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Add RLS to tables
      - Create pg_cron for purge
      - Implement POST /v1/consent
      - Log consent_granted with PostHog
      - Write Supatest tests

  - id: T11.3.2-security-accessibility
    description: Enforce security and accessibility
    inputs:
      - backend/middleware/rateLimit.js
      - backend/middleware/validation.js
      - backend/server.js
      - backend/tests/accessibility.test.js
      - .env
    outputs:
      - Rate limiting
      - CSP headers
      - WCAG compliance
    dependencies:
      - T7.2.1-security-implementation
    cursor-ai-instructions:
      - Update rateLimit.js
      - Add CSP headers
      - Run axe-core tests
      - Log security_violation with PostHog
      - Write Jest tests

  - id: T11.4.1-glossary-enforcement
    description: Enforce glossary term consistency in code and prompts.
    inputs:
      - .eslintrc.js
      - backend/prompts/
      - docs/glossary.md
      - backend/tests/docs.test.js
      - .env
    outputs:
      - ESLint rules for glossary terms
      - Consistent terminology in prompts
      - Tests for term usage
    dependencies:
      - T18.1.1-glossary-documentation
    cursor-ai-instructions:
      - Add ESLint rule to check glossary terms in code comments
      - Update prompts to use glossary terms (e.g., TrustDelta)
      - Test term consistency with Jest
      - Log glossary_enforced to PostHog
      - Write Jest tests for glossary (backend/tests/docs.test.js)
```

## Section 12.9: Backend Development - Metrics and Monitoring

```yaml
tasks:
  - id: T12.1.1-posthog-integration
    description: Implement PostHog for metric tracking
    inputs:
      - backend/services/posthog.js
      - backend/routes/
      - .env (POSTHOG_API_KEY)
    outputs:
      - PostHog events for metrics
    dependencies:
      - T8.5.1-monitoring-setup
    cursor-ai-instructions:
      - Configure PostHog client
      - Add event captures to routes
      - Validate event schemas
      - Write Jest tests

  - id: T12.1.2-sentry-uptime
    description: Monitor uptime with Sentry
    inputs:
      - backend/services/sentry.js
      - backend/server.js
      - .env (SENTRY_DSN)
    outputs:
      - Sentry uptime tracking
      - Error logs
    dependencies:
      - T8.5.1-monitoring-setup
    cursor-ai-instructions:
      - Configure Sentry for uptime
      - Log errors to error_logs
      - Write Jest tests

  - id: T12.1.3-metric-storage
    description: Store metrics in Supabase
    inputs:
      - databases/migrations/session_logs.sql
      - databases/migrations/feedback_logs.sql
      - databases/migrations/share_logs.sql
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Supabase tables for metrics
      - RLS policies
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Update schemas for logs
      - Add RLS policies
      - Log metrics
      - Write Supatest tests
```

## Section 13.4: Backend Development - Testing

```yaml
tasks:
  - id: T13.1.1-unit-tests
    description: Implement Jest unit tests for backend APIs and services
    inputs:
      - backend/tests/*.test.js
      - backend/routes/
      - backend/services/
      - package.json
    outputs:
      - Unit tests (>80% coverage)
      - Coverage report
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Write Jest tests for routes and services
      - Configure coverage
      - Run tests in CI/CD
      - Log test_completion with PostHog

  - id: T13.1.2-integration-tests
    description: Implement Supatest for API and Make.com integration
    inputs:
      - backend/tests/api.test.js
      - backend/webhooks/
      - databases/seed/
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Integration tests
      - Test report
    dependencies:
      - T8.3.2-makecom-other-scenarios
    cursor-ai-instructions:
      - Write Supatest tests
      - Test Make.com flows
      - Use seed data
      - Log test_completion with PostHog

  - id: T13.1.3-accessibility-tests
    description: Implement axe-core and pa11y-ci for WCAG compliance
    inputs:
      - backend/tests/accessibility.test.js
      - frontend/public/
      - .env
    outputs:
      - Accessibility tests (0 critical issues)
      - Report
    dependencies:
      - T11.3.2-security-accessibility
    cursor-ai-instructions:
      - Run axe-core and pa11y-ci
      - Validate contrast and VoiceOver
      - Generate report
      - Log test_completion with PostHog

  - id: T13.1.4-resonance-tests
    description: Implement Hume AI tests for emotional resonance
    inputs:
      - backend/services/hume.js
      - backend/routes/deliverables.js
      - backend/tests/resonance.test.js
      - .env (HUME_API_KEY)
    outputs:
      - Resonance tests (arousal >0.5, valence >0.6)
      - Results in comparisons
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Write tests for /v1/request-revision
      - Validate resonance
      - Store results
      - Log test_completion with PostHog

  - id: T13.1.5-load-tests
    description: Implement Locust for load testing
    inputs:
      - backend/tests/load.py
      - backend/tests/load.test.js
      - .env
    outputs:
      - Load tests (10,000 users)
      - Report
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Script Locust tests
      - Validate response times
      - Generate report
      - Log test_completion with PostHog

  - id: T13.1.6-scenario-tests
    description: Implement Supatest for scenario validation
    inputs:
      - backend/tests/scenario.test.js
      - backend/routes/stripe.js
      - backend/routes/deliverables.js
      - databases/seed/
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Scenario tests (95% pass rate)
      - Report
    dependencies:
      - T10.1.1-deliverable-generation
    cursor-ai-instructions:
      - Write Supatest for scenarios
      - Validate product switch
      - Use seed data
      - Log test_completion with PostHog

  - id: T13.4.1-test-maintenance
    description: Update test suites for new features and regressions.
    inputs:
      - backend/tests/*.test.js
      - backend/routes/
      - backend/services/
      - .env
    outputs:
      - Updated test suites for voice mode, i18n, and integrations
      - Regression tests with >90% coverage
      - CI/CD step for test maintenance
    dependencies:
      - T13.1.1-unit-tests
      - T17.1.1-voice-mode
      - T17.1.2-i18n-support
    cursor-ai-instructions:
      - Update Jest tests for new endpoints and services
      - Add regression tests for existing APIs
      - Add CI/CD step to validate test coverage
      - Log test_maintenance_complete to PostHog
      - Write Jest tests for new features (backend/tests/*.test.js)
```

## Section 14.3: Backend Development - Security

```yaml
tasks:
  - id: T14.1.1-shift-left-security
    description: Integrate OWASP ZAP and Semgrep in CI/CD
    inputs:
      - backend/.github/workflows/security.yml
      - package.json
      - .env
    outputs:
      - CI/CD with security scans
      - Vulnerability report
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Configure OWASP ZAP and Semgrep
      - Scan APIs and dependencies
      - Generate report
      - Log security_scan with PostHog

  - id: T14.1.2-supabase-security
    description: Enable Supabase RLS and vault encryption
    inputs:
      - databases/migrations/prompt_logs.sql
      - databases/migrations/comparisons.sql
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - RLS policies
      - Encrypted .env keys
    dependencies:
      - T8.2.1-supabase-schema
    cursor-ai-instructions:
      - Add RLS to tables
      - Configure vault encryption
      - Test RLS with Supatest
      - Log security_config with PostHog

  - id: T14.1.3-rate-limiting
    description: Implement rate limiting middleware
    inputs:
      - backend/middleware/rateLimit.js
      - backend/server.js
      - .env
    outputs:
      - Rate limiting (100 req/min/IP)
      - Test results
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Update rateLimit.js
      - Apply to endpoints
      - Test with Locust
      - Log rate_limit_triggered with PostHog

  - id: T14.1.4-input-sanitization
    description: Implement DOMPurify for input sanitization
    inputs:
      - backend/middleware/validation.js
      - backend/routes/
      - .env
    outputs:
      - Sanitized inputs
      - Test results
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Add DOMPurify to validation
      - Validate inputs
      - Test sanitization
      - Log sanitization_error with PostHog

  - id: T14.1.5-csp-headers
    description: Apply CSP headers to responses
    inputs:
      - backend/server.js
      - backend/tests/security.test.js
      - .env
    outputs:
      - CSP headers
      - Test results
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Add CSP headers
      - Test headers
      - Log csp_violation with PostHog

  - id: T14.1.6-gdpr-ccpa-compliance
    description: Implement consent modal and data purge
    inputs:
      - frontend/public/consent.html
      - backend/routes/consent.js
      - databases/cron/purge.sql
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Consent modal and API
      - 24-month data purge
    dependencies:
      - T11.3.1-user-ownership
    cursor-ai-instructions:
      - Create consent modal and /v1/consent
      - Configure pg_cron for purge
      - Log consent_granted with PostHog

  - id: T14.3.1-early-encryption
    description: Implement early encryption for sensitive Supabase fields.
    inputs:
      - databases/migrations/prompt_logs.sql
      - databases/migrations/comparisons.sql
      - backend/services/supabase.js
      - supabase/vault/config.yaml
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Encrypted fields (e.g., canai_output, generic_output) in Supabase
      - RLS policies for encrypted data
      - Tests for encryption integrity
    dependencies:
      - T8.2.1-supabase-schema
      - T14.1.2-supabase-security
    cursor-ai-instructions:
      - Configure Supabase Vault for prompt_logs and comparisons
      - Add RLS policies for encrypted fields
      - Test encryption with Supatest
      - Log encryption_enabled to PostHog
      - Write Supatest tests for encryption (backend/tests/rls.test.js)
```

## Section 15.3: Deployment

```yaml
tasks:
  - id: T15.1.1-frontend-deployment
    description: Deploy Webflow frontend to Render
    inputs:
      - frontend/public/
      - frontend/src/
      - vite.config.ts
      - tsconfig.json
      - .github/workflows/frontend-deploy.yml
      - .env
    outputs:
      - Frontend on Render
      - Lighthouse report
    dependencies:
      - T11.3.2-security-accessibility
    cursor-ai-instructions:
      - Configure Vite for Render
      - Integrate Webflow CMS
      - Run Lighthouse tests
      - Log deploy_success with PostHog

  - id: T15.1.2-backend-deployment
    description: Deploy serverless backend to Render with Heroku fallback
    inputs:
      - backend/server.js
      - docker-compose.yml
      - backend/health.js
      - package.json
      - .github/workflows/backend-deploy.yml
      - .env
    outputs:
      - Backend on Render
      - Health check endpoint
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Configure serverless Node.js
      - Set up Heroku fallback
      - Implement health checks
      - Log deploy_success with PostHog

  - id: T15.1.3-admin-deployment
    description: Deploy admin dashboard to Render
    inputs:
      - backend/admin/
      - backend/middleware/auth.js
      - backend/routes/admin.js
      - .github/workflows/admin-deploy.yml
      - .env
    outputs:
      - Admin dashboard
      - Secured metrics endpoint
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Deploy admin dashboard
      - Secure with MemberStack
      - Test metrics
      - Log deploy_success with PostHog

  - id: T15.1.4-rollback-mechanism
    description: Implement Git-based rollback
    inputs:
      - .github/workflows/deploy.yml
      - .git/
      - package.json
      - .env
    outputs:
      - Rollback pipeline
      - Tagged releases
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Configure rollback in CI/CD
      - Create tagged releases
      - Test rollback
      - Log rollback_triggered with PostHog

  - id: T15.1.5-monitoring-setup
    description: Configure Sentry and PostHog for monitoring
    inputs:
      - backend/services/sentry.js
      - backend/services/posthog.js
      - databases/migrations/error_logs.sql
      - .env (SENTRY_DSN, POSTHOG_API_KEY)
    outputs:
      - Sentry error tracking
      - PostHog analytics
    dependencies:
      - T8.5.1-monitoring-setup
    cursor-ai-instructions:
      - Configure Sentry and PostHog
      - Log errors
      - Validate dashboards
      - Log monitoring_enabled with PostHog
```

## Section 16.3: Reliability and Scalability

```yaml
tasks:
  - id: T16.1.1-api-downtime-mitigation
    description: Implement caching and retry for API downtime
    inputs:
      - backend/middleware/retry.js
      - backend/services/cache.js
      - backend/services/sentry.js
      - .env (SENTRY_DSN)
    outputs:
      - Retry middleware
      - Cached outputs
    dependencies:
      - T8.5.1-monitoring-setup
    cursor-ai-instructions:
      - Add retry logic (3 attempts, 500ms)
      - Cache API responses (5min TTL)
      - Log downtime to Sentry
      - Log retry_success with PostHog

  - id: T16.1.2-data-breach-prevention
    description: Enhance Supabase RLS and encryption
    inputs:
      - databases/migrations/
      - backend/services/supabase.js
      - frontend/public/consent.html
      - backend/routes/consent.js
      - .github/workflows/security.yml
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - RLS policies
      - Encrypted keys
      - Consent modal
    dependencies:
      - T14.1.2-supabase-security
    cursor-ai-instructions:
      - Update RLS policies
      - Configure vault
      - Deploy consent modal
      - Run OWASP ZAP scans
      - Log security_config with PostHog

  - id: T16.1.3-taskmaster-validation
    description: Validate TaskMaster tasks in CI/CD
    inputs:
      - .github/workflows/taskmaster.yml
      - backend/tests/taskmaster.test.js
      - .env
    outputs:
      - Validated tasks
      - Error logs
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Configure task validation
      - Log errors
      - Test dependencies
      - Log task_validation with PostHog

  - id: T16.1.4-scalability-testing
    description: Test scalability with Locust
    inputs:
      - backend/tests/load.py
      - backend/tests/load.test.js
      - databases/migrations/
      - .env
    outputs:
      - Scalability for 10,000 users
      - Load report
    dependencies:
      - T13.1.5-load-tests
    cursor-ai-instructions:
      - Script Locust tests
      - Optimize Supabase indexes
      - Generate report
      - Log scalability_test with PostHog

  - id: T16.1.5-emotional-drift-mitigation
    description: Validate outputs for emotional resonance
    inputs:
      - backend/services/hume.js
      - backend/services/posthog.js
      - backend/prompts/
      - .env (HUME_API_KEY, POSTHOG_API_KEY)
    outputs:
      - Resonance >0.7
      - Quality logs
    dependencies:
      - T13.1.4-resonance-tests
    cursor-ai-instructions:
      - Validate outputs with Hume AI
      - Log resonance
      - Update prompts
      - Log output_quality with PostHog

  - id: T16.1.6-gpt4o-accuracy
    description: Fine-tune GPT-4o for accuracy
    inputs:
      - backend/prompts/contradiction.js
      - backend/routes/filter.js
      - backend/tests/filter.test.js
      - .env (OPENAI_API_KEY)
    outputs:
      - 95% filtering accuracy
      - Error logs
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Fine-tune contradiction prompts
      - Test filtering
      - Log inaccuracies
      - Log input_filtered with PostHog

  - id: T16.1.7-token-overflow
    description: Handle GPT-4o token overflow
    inputs:
      - backend/services/gpt4o.js
      - backend/tests/gpt4o.test.js
      - .env (OPENAI_API_KEY)
    outputs:
      - MapReduce for >128K tokens
      - Error logs
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Implement MapReduce chunking
      - Log overflows
      - Test with Jest
      - Log token_limit_handled with PostHog

  - id: T16.1.8-stripe-rate-limiting
    description: Mitigate Stripe rate limiting
    inputs:
      - backend/middleware/retry.js
      - backend/webhooks/support.js
      - backend/routes/stripe.js
      - .env (STRIPE_SECRET_KEY)
    outputs:
      - Exponential backoff
      - Support queue
    dependencies:
      - T14.1.3-rate-limiting
    cursor-ai-instructions:
      - Add backoff to stripe.js
      - Queue support for failures
      - Log retries
      - Log retry_success with PostHog

  - id: T16.1.9-webflow-downtime
    description: Mitigate Webflow CMS downtime
    inputs:
      - backend/services/cache.js
      - databases/pricing.sql
      - frontend/public/
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Cached CMS content
      - Static fallback
    dependencies:
      - T15.1.1-frontend-deployment
    cursor-ai-instructions:
      - Cache CMS in Supabase
      - Implement static fallback
      - Log downtime to Sentry
      - Log cache_hit with PostHog

  - id: T16.1.10-hume-rate-limits
    description: Mitigate Hume AI rate limits
    inputs:
      - backend/middleware/hume.js
      - backend/services/gpt4o.js
      - .env (HUME_API_KEY, OPENAI_API_KEY)
    outputs:
      - Circuit breaker
      - GPT-4o fallback
    dependencies:
      - T8.4.1-ai-integration
    cursor-ai-instructions:
      - Implement circuit breaker
      - Fallback to GPT-4o
      - Log fallbacks
      - Log hume_fallback_triggered with PostHog

  - id: T16.3.1-webhook-rate-limiting
    description: Mitigate Make.com webhook rate limits with backoff.
    inputs:
      - backend/webhooks/*
      - backend/middleware/retry.js
      - backend/services/supabase.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Exponential backoff for webhook retries
      - Error logs for rate limit failures
      - Tests for rate limit handling
    dependencies:
      - T9.4.1-dlq-webhook
      - T14.1.3-rate-limiting
    cursor-ai-instructions:
      - Add exponential backoff (2^i * 1000ms) to webhook retries
      - Log rate limit failures to error_logs
      - Test rate limit handling with Jest
      - Log webhook_rate_limit_handled to PostHog
      - Write Jest tests for webhooks (backend/tests/webhooks.test.js)
```

## Section 17.3: Frontend and AI Enhancements

```yaml
tasks:
  - id: T17.1.1-voice-mode
    description: Implement voice mode for dynamic UI
    inputs:
      - frontend/public/funnel.html
      - backend/services/websocket.js
      - backend/tests/voice.test.js
      - .env
    outputs:
      - Voice input support
      - WebSocket updates
    dependencies:
      - T15.1.1-frontend-deployment
    cursor-ai-instructions:
      - Add Web Speech API
      - Configure WebSocket
      - Test voice accuracy
      - Log voice_input with PostHog

  - id: T17.1.2-i18n-support
    description: Expand i18n for additional languages
    inputs:
      - frontend/src/i18n.js
      - frontend/public/locales/
      - databases/translations.sql
      - frontend/tests/i18n.test.js
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - i18n for ≥2 languages
      - Translation table
    dependencies:
      - T15.1.1-frontend-deployment
    cursor-ai-instructions:
      - Configure i18next
      - Store translations in Supabase
      - Test translations
      - Log i18n_enabled with PostHog

  - id: T17.1.3-feedback-training
    description: Integrate feedback for AI training
    inputs:
      - backend/services/anonymize.js
      - backend/prompts/
      - databases/feedback_logs.sql
      - .env (OPENAI_API_KEY)
    outputs:
      - Fine-tuned prompts
      - Anonymized feedback
    dependencies:
      - T10.1.3-feedback-sharing
    cursor-ai-instructions:
      - Anonymize feedback data
      - Fine-tune GPT-4o prompts
      - Test TrustDelta improvement
      - Log feedback_trained with PostHog
      - Write Jest tests (backend/tests/prompts.test.js)

  - id: T17.1.4-cultural-intelligence
    description: Enhance Hume AI for cultural context
    inputs:
      - backend/services/hume.js
      - backend/prompts/
      - backend/tests/resonance.test.js
      - .env (HUME_API_KEY)
    outputs:
      - Cultural-aware resonance
      - Updated prompts
    dependencies:
      - T13.1.4-resonance-tests
    cursor-ai-instructions:
      - Update Hume AI for cultural context
      - Revise prompts for cultural drivers
      - Test resonance improvement
      - Log cultural_intelligence with PostHog
      - Write Jest tests (backend/tests/resonance.test.js)

  - id: T17.1.5-third-party-integrations
    description: Integrate QuickBooks and Google Analytics
    inputs:
      - backend/services/quickbooks.js
      - backend/services/google-analytics.js
      - backend/tests/integrations.test.js
      - .env (QUICKBOOKS_API_KEY, GA_API_KEY)
    outputs:
      - QuickBooks and GA integrations
      - Test results
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Configure OAuth2 for APIs
      - Implement data processing
      - Test integration performance
      - Log integration_enabled with PostHog
      - Write Supatest tests (backend/tests/integrations.test.js)

  - id: T17.1.6-crm-export-guide
    description: Provide CRM export guide and API
    inputs:
      - docs/crm-export-guide.md
      - backend/routes/export.js
      - supabase/storage/exports/
      - .env (SUPABASE_URL, PROJECT_ID)
    outputs:
      - Export guide
      - POST /v1/export API
    dependencies:
      - T10.1.1-deliverable-generation
    cursor-ai-instructions:
      - Write export guide
      - Implement POST /v1/export
      - Store exports in Supabase
      - Log export_success with PostHog
      - Write Supatest tests (backend/tests/export.test.js)
```

## Section 18.3: Documentation

```yaml
tasks:
  - id: T18.1.1-glossary-documentation
    description: Document and validate glossary terms
    inputs:
      - docs/glossary.md
      - backend/tests/docs.test.js
      - .github/workflows/docs.yml
      - .env
    outputs:
      - Comprehensive glossary
      - Documentation tests
    dependencies:
      - T8.1.1-backend-setup
    cursor-ai-instructions:
      - Write glossary in docs/glossary.md
      - Map terms to project files
      - Test documentation with Jest
      - Log glossary_updated with PostHog
      - Write Jest tests (backend/tests/docs.test.js)
```
