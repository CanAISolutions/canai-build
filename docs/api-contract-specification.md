# API Contract Specification - CanAI Emotional Sovereignty Platform

## Purpose

Exhaustively documents all 25+ CanAI API endpoints per PRD Section 8.7, ensuring Cursor AI
implements consistent, error-free integrations. Prevents integration failures by specifying
endpoints, schemas, error codes, and dependencies aligned with the 9-stage user journey and
achieving TrustDelta ≥4.2.

## Structure

- **API Overview**: Base URL, versioning, authentication, and security per PRD specifications.
- **Endpoints**: Complete list of all 25+ APIs (F1–F9, security, admin, future) from PRD Section
  8.7.
- **Schemas**: Request/response formats, error codes aligned with PRD requirements.
- **Integration Details**: Dependencies and behaviors for TaskMaster compatibility.
- **Examples**: PRD-aligned request/response pairs with scenario validation.

## API Overview

- **Base URL**: `https://canai-router.onrender.com/v1` (internal: `canai-router:10000`)
- **Server IPs**: 52.41.36.82, 54.191.253.12, 44.226.122.3
- **Versioning**: SemVer (`v1.0.0`) with backward compatibility support.
- **Authentication Levels**:
  - **None**: F1–F2 endpoints, `/v1/consent`, `/v1/log-interaction`, `/v1/pricing`,
    `/v1/generate-preview-spark`
  - **Memberstack JWT**: F3–F9 endpoints, user-specific operations requiring `auth.uid()` validation
  - **Admin JWT**: `/v1/admin-metrics` only with enhanced privileges
- **Rate Limiting**: 100 req/min/IP (`backend/middleware/rateLimit.js`) with exponential backoff
- **Input Sanitization**: DOMPurify + Joi validation on all inputs
  (`backend/middleware/validation.js`)
- **Error Handling**: <100ms empathetic responses with PostHog logging
  (`backend/middleware/error.js`)
- **Caching**: Node-cache for responses with optimized TTL (5min for static, 1hr for pricing)

## Complete API Endpoints (PRD Section 8.7)

| Stage    | Method | Path                       | Auth      | Description                                  | Performance Target |
| -------- | ------ | -------------------------- | --------- | -------------------------------------------- | ------------------ |
| F1       | GET    | /v1/messages               | None      | Fetches trust indicators and testimonials    | <200ms             |
| F1       | GET    | /v1/pricing                | None      | Retrieves transparent pricing data           | <200ms, 1hr cache  |
| F1       | POST   | /v1/log-interaction        | None      | Logs UI interactions for analytics           | <100ms             |
| F1       | POST   | /v1/generate-preview-spark | None      | Generates free spark preview for engagement  | <1s                |
| F2       | POST   | /v1/validate-input         | None      | Validates funnel inputs, returns trust score | <500ms             |
| F2       | POST   | /v1/generate-tooltip       | None      | Generates dynamic contextual tooltips        | <300ms             |
| F2       | POST   | /v1/detect-contradiction   | None      | Flags tone/outcome mismatches                | <400ms             |
| F2       | POST   | /v1/filter-input           | None      | Filters inappropriate/NSFW inputs            | <200ms             |
| F3       | POST   | /v1/generate-sparks        | JWT       | Generates three spark concepts               | <1.5s              |
| F3       | POST   | /v1/regenerate-sparks      | JWT       | Regenerates sparks (max 3/4 attempts)        | <1.5s              |
| F4       | POST   | /v1/stripe-session         | JWT       | Initiates Stripe checkout session            | <1s                |
| F4       | POST   | /v1/refund                 | JWT       | Processes refund requests                    | <2s                |
| F4       | POST   | /v1/switch-product         | JWT       | Switches between product tracks              | <1s                |
| F5       | POST   | /v1/save-progress          | JWT       | Auto-saves detailed input progress           | <200ms             |
| F5       | GET    | /v1/resume                 | JWT       | Resumes input collection or generation       | <300ms             |
| F5       | POST   | /v1/generate-tooltip       | JWT       | Context-aware tooltips for 12-field form     | <300ms             |
| F6       | POST   | /v1/intent-mirror          | JWT       | Generates input summary with confidence      | <400ms             |
| F7       | POST   | /v1/deliverable            | JWT       | Generates deliverables (700-800 words)       | <2s                |
| F7       | GET    | /v1/generation-status      | JWT       | Checks deliverable generation status         | <100ms             |
| F7       | POST   | /v1/request-revision       | JWT       | Requests deliverable revisions               | <1s                |
| F7       | POST   | /v1/regenerate-deliverable | JWT       | Regenerates deliverables (max 2 attempts)    | <2s                |
| F8       | POST   | /v1/spark-split            | JWT       | Compares CanAI vs. generic output            | <1s                |
| F9       | POST   | /v1/feedback               | JWT       | Captures user feedback and ratings           | <100ms             |
| F9       | POST   | /v1/refer                  | JWT       | Generates referral links for social sharing  | <200ms             |
| Security | POST   | /v1/consent                | None      | Logs GDPR/CCPA consent                       | <100ms             |
| Security | POST   | /v1/purge-data             | JWT       | Deletes user data (GDPR right to erasure)    | <1s                |
| Admin    | GET    | /v1/admin-metrics          | Admin JWT | Provides admin analytics and metrics         | <500ms             |
| Future   | POST   | /v1/export                 | JWT       | Exports deliverables to CRM systems          | <3s                |

## Enhanced Schemas and Examples

### GET /v1/messages (F1)

**Purpose**: Fetch trust indicators, testimonials, and social proof for emotional engagement

**Request**:

```http
GET /v1/messages HTTP/1.1
Host: canai-router.onrender.com
```

**Response Schema**:

```typescript
interface MessagesResponse {
  data: {
    messages: Array<{
      id: string;
      text: string;
      author?: string;
      type: 'testimonial' | 'trust_indicator' | 'sample_preview' | 'success_story';
      created_at: string;
      emotional_tone?: 'warm' | 'bold' | 'optimistic' | 'inspirational';
      trust_score_context?: number; // 0-100
      location?: string; // For local social proof
    }>;
    personalized: boolean;
    trust_score_context?: number;
    total_plans_created?: number; // e.g., "500+ plans created"
  };
  error: null;
  metadata: {
    timestamp: string;
    request_id: string;
    cache_hit: boolean;
    cache_ttl: number; // 300 seconds (5min)
  };
}
```

**Example Response**:

```json
{
  "data": {
    "messages": [
      {
        "id": "msg_001",
        "text": "CanAI helped me secure $75,000 funding for my Denver bakery!",
        "author": "Sarah M., Sprinkle Haven Bakery",
        "type": "testimonial",
        "emotional_tone": "warm",
        "location": "Denver, CO",
        "created_at": "2024-12-15T10:30:00Z"
      },
      {
        "id": "msg_002",
        "text": "500+ business plans created this month",
        "type": "trust_indicator",
        "trust_score_context": 95,
        "created_at": "2024-12-15T10:30:00Z"
      }
    ],
    "personalized": false,
    "total_plans_created": 1247
  },
  "error": null,
  "metadata": {
    "timestamp": "2024-12-15T10:30:00Z",
    "request_id": "req_abc123",
    "cache_hit": true,
    "cache_ttl": 300
  }
}
```

**Error Responses**:

```json
[
  { "error": { "code": 429, "message": "Rate limit exceeded. Please wait 60 seconds." } },
  { "error": { "code": 500, "message": "We're updating our trust indicators. Please refresh." } }
]
```

### POST /v1/validate-input (F2)

**Purpose**: Validate 2-step discovery funnel inputs with GPT-4o trust scoring and Hume AI emotional
resonance

**Request Schema**:

```typescript
interface ValidateInputRequest {
  businessType:
    | 'retail'
    | 'service'
    | 'tech'
    | 'creative'
    | 'healthcare'
    | 'food_beverage'
    | 'consulting'
    | 'other';
  otherType?: string; // Required if businessType === 'other', max 100 chars
  primaryChallenge: string; // 5-500 characters, core business challenge
  preferredTone:
    | 'warm'
    | 'bold'
    | 'optimistic'
    | 'professional'
    | 'playful'
    | 'inspirational'
    | 'custom';
  customTone?: string; // Required if preferredTone === 'custom', max 50 chars
  desiredOutcome:
    | 'secure_funding'
    | 'grow_customers'
    | 'improve_operations'
    | 'boost_online_presence'
    | 'launch_product'
    | 'scale_business';
  session_id: string; // UUID for tracking user session
  context?: {
    location?: string;
    industry_experience?: number; // Years of experience
    budget_range?: string;
  };
}
```

**Response Schema**:

```typescript
interface ValidateInputResponse {
  data: {
    valid: boolean;
    trust_score: number; // 0-100, target ≥85 per PRD
    feedback: string; // GPT-4o generated feedback
    emotional_resonance: {
      arousal: number; // Hume AI, target >0.5
      valence: number; // Hume AI, target >0.6
      confidence: number; // 0.0-1.0
      emotional_drivers?: string[]; // Detected emotional motivations
    };
    clarifying_questions?: string[]; // If confidence <0.8
    next_step_recommendation: string;
    validation_details: {
      challenge_clarity: number; // 0-100
      tone_alignment: number; // 0-100
      outcome_specificity: number; // 0-100
    };
  };
  error: null;
  metadata: {
    processing_time_ms: number;
    ai_model_version: string;
    fallback_used?: boolean; // True if Hume AI circuit breaker triggered
  };
}
```

**Example Request**:

```json
{
  "businessType": "retail",
  "primaryChallenge": "Need to secure $75,000 funding to launch my artisanal bakery in Denver",
  "preferredTone": "warm",
  "desiredOutcome": "secure_funding",
  "session_id": "sess_abc123",
  "context": {
    "location": "Denver, CO",
    "industry_experience": 3,
    "budget_range": "$50k-$100k"
  }
}
```

**Example Response**:

```json
{
  "data": {
    "valid": true,
    "trust_score": 87,
    "feedback": "Your funding goal is clear and specific! Denver's artisanal food scene is thriving.",
    "emotional_resonance": {
      "arousal": 0.72,
      "valence": 0.81,
      "confidence": 0.93,
      "emotional_drivers": ["community_connection", "creative_fulfillment", "financial_security"]
    },
    "next_step_recommendation": "You're ready to generate your spark concepts!",
    "validation_details": {
      "challenge_clarity": 92,
      "tone_alignment": 88,
      "outcome_specificity": 95
    }
  },
  "error": null,
  "metadata": {
    "processing_time_ms": 487,
    "ai_model_version": "gpt-4o-2024-08-06",
    "fallback_used": false
  }
}
```

### POST /v1/generate-sparks (F3)

**Purpose**: Generate three emotionally resonant spark concepts with GPT-4o using validated inputs

**Request Schema**:

```typescript
interface GenerateSparksRequest {
  initial_prompt_id: string; // UUID from successful validation
  user_id: string; // Memberstack user ID
  regeneration_count?: number; // 0 for first generation, max 3/4
  spark_preferences?: {
    emphasis?: 'community' | 'growth' | 'innovation' | 'stability';
    avoid_themes?: string[];
  };
}
```

**Response Schema**:

```typescript
interface GenerateSparksResponse {
  data: {
    sparks: Array<{
      id: string;
      title: string; // e.g., "Community Spark"
      tagline: string; // e.g., "Unite Denver families with artisanal warmth"
      description: string; // 2-3 sentences explaining the concept
      emotional_appeal: string; // Core emotional hook
      business_focus: string; // Primary business driver
      resonance_score: number; // 0.0-1.0 from Hume AI
    }>;
    generation_metadata: {
      attempt_number: number;
      emotional_consistency: number; // 0.0-1.0
      uniqueness_score: number; // 0.0-1.0
      user_tone_match: number; // 0.0-1.0
    };
    next_steps: {
      can_regenerate: boolean;
      regenerations_remaining: number;
      selection_required: boolean;
    };
  };
  error: null;
  metadata: {
    generation_time_ms: number;
    tokens_used: number;
    model_version: string;
    prompt_version: string;
  };
}
```

**Example Response**:

```json
{
  "data": {
    "sparks": [
      {
        "id": "spark_001",
        "title": "Community Spark",
        "tagline": "Unite Denver families with artisanal warmth",
        "description": "Transform your neighborhood into a gathering place where handcrafted pastries bring people together. Focus on building lasting relationships through shared moments of joy.",
        "emotional_appeal": "Belonging and community connection",
        "business_focus": "Local market penetration and customer loyalty",
        "resonance_score": 0.87
      },
      {
        "id": "spark_002",
        "title": "Growth Spark",
        "tagline": "Scale your passion into Denver's premier bakery",
        "description": "Build a sustainable business that grows with your ambitions. Strategic expansion plans that honor your artisanal roots while achieving financial success.",
        "emotional_appeal": "Achievement and professional fulfillment",
        "business_focus": "Revenue growth and market expansion",
        "resonance_score": 0.82
      },
      {
        "id": "spark_003",
        "title": "Innovation Spark",
        "tagline": "Reimagine artisanal baking for modern Denver",
        "description": "Blend traditional techniques with contemporary flavors and sustainable practices. Lead the artisanal food movement in your community.",
        "emotional_appeal": "Creativity and industry leadership",
        "business_focus": "Product differentiation and brand positioning",
        "resonance_score": 0.79
      }
    ],
    "generation_metadata": {
      "attempt_number": 1,
      "emotional_consistency": 0.91,
      "uniqueness_score": 0.84,
      "user_tone_match": 0.89
    },
    "next_steps": {
      "can_regenerate": true,
      "regenerations_remaining": 3,
      "selection_required": true
    }
  },
  "error": null,
  "metadata": {
    "generation_time_ms": 1247,
    "tokens_used": 856,
    "model_version": "gpt-4o-2024-08-06",
    "prompt_version": "sparks-v2.1"
  }
}
```

### POST /v1/stripe-session (F4)

**Purpose**: Create Stripe checkout session for selected spark and product track

**Request Schema**:

```typescript
interface StripeSessionRequest {
  spark_id: string; // Selected spark ID from F3
  user_id: string; // Memberstack user ID
  product_track: 'business_builder' | 'social_email' | 'site_audit';
  pricing_tier?: 'standard' | 'premium'; // Default: standard
  promotional_code?: string;
  success_url?: string;
  cancel_url?: string;
}
```

**Response Schema**:

```typescript
interface StripeSessionResponse {
  data: {
    session: {
      id: string; // Stripe session ID
      url: string; // Checkout URL
      expires_at: number; // Unix timestamp
    };
    product_details: {
      name: string;
      price: number; // In cents
      currency: 'USD';
      description: string;
      features: string[];
    };
    estimated_delivery: string; // e.g., "2-3 business days"
  };
  error: null;
  metadata: {
    session_created_at: string;
    webhook_configured: boolean;
  };
}
```

### POST /v1/deliverable (F7)

**Purpose**: Generate final deliverable (700-800 word business plan, social media campaign, etc.)

**Request Schema**:

```typescript
interface DeliverableRequest {
  spark_log_id: string; // From completed purchase
  user_id: string;
  product_track: 'business_builder' | 'social_email' | 'site_audit';
  detailed_inputs: {
    businessDescription: string; // 100-500 words
    targetMarket?: string;
    revenueModel?: string;
    competitors?: string;
    uniqueValue?: string;
    location?: string;
    fundingGoal?: number;
    timeline?: string;
    // Additional fields based on product track
    [key: string]: any;
  };
  generation_preferences?: {
    focus_areas?: string[];
    tone_adjustments?: string;
    length_preference?: 'concise' | 'standard' | 'detailed';
  };
}
```

**Response Schema**:

```typescript
interface DeliverableResponse {
  data: {
    canai_output: string; // 700-800 words for business_builder
    generic_output: string; // For SparkSplit comparison
    deliverable_metadata: {
      word_count: number;
      readability_score: number;
      emotional_resonance: {
        arousal: number;
        valence: number;
        confidence: number;
      };
      trust_delta: number; // CanAI vs generic quality score
      completion_percentage: number;
    };
    file_exports: {
      pdf_url?: string; // Supabase storage URL
      docx_url?: string;
      txt_url?: string;
    };
    revision_options: {
      can_request_revision: boolean;
      revisions_remaining: number;
      suggested_improvements?: string[];
    };
  };
  error: null;
  metadata: {
    generation_time_ms: number;
    tokens_consumed: number;
    model_versions: {
      content_generation: string;
      quality_validation: string;
    };
  };
}
```

### POST /v1/spark-split (F8)

**Purpose**: Compare CanAI vs generic AI output to demonstrate superiority

**Request Schema**:

```typescript
interface SparkSplitRequest {
  deliverable_id: string; // From F7 generation
  user_id: string;
  comparison_type: 'full_comparison' | 'key_sections' | 'quick_preview';
}
```

**Response Schema**:

```typescript
interface SparkSplitResponse {
  data: {
    comparison: {
      canai_output: {
        content: string;
        emotional_resonance: number;
        business_value_score: number;
        personalization_level: number;
      };
      generic_output: {
        content: string;
        emotional_resonance: number;
        business_value_score: number;
        personalization_level: number;
      };
    };
    trust_delta: number; // 0.0-5.0, target ≥4.2
    preference_indicators: {
      emotional_connection: number;
      practical_value: number;
      uniqueness: number;
      actionability: number;
    };
    user_choice_tracking: {
      can_select_preference: boolean;
      previous_selections?: 'canai' | 'generic' | null;
    };
  };
  error: null;
  metadata: {
    comparison_generated_at: string;
    analysis_time_ms: number;
  };
}
```

## Integration Requirements

### Supabase RLS Integration

All authenticated endpoints must enforce Row-Level Security:

```sql
-- Example RLS policy enforcement
CREATE POLICY user_data_access ON prompt_logs
FOR ALL TO authenticated
USING (auth.uid() = user_id);
```

**Frontend Integration**: For React/Vite client integration patterns, see
`docs/supabase-frontend-integration.md`.

### Make.com Webhook Integration

Key webhook triggers for existing scenarios:

- `add_project.json` - Triggered on successful payment
- `admin_add_project.json` - Admin project creation
- `SAAP Update Project Blueprint.json` - Project updates
- `add_client.json` - Client onboarding

### Error Handling Standards

All endpoints must return consistent error format:

```typescript
interface APIError {
  error: {
    code: number;
    message: string; // User-friendly, empathetic
    type: string; // Machine-readable error type
    details?: any; // Additional context for debugging
    retry_after?: number; // Seconds to wait before retry
  };
  metadata: {
    request_id: string;
    timestamp: string;
    support_reference?: string;
  };
}
```

### Performance Monitoring

Each endpoint logs performance metrics to PostHog:

```javascript
posthog.capture('api_endpoint_called', {
  endpoint: '/v1/generate-sparks',
  response_time_ms: 1247,
  user_id: userId,
  success: true,
  cache_hit: false,
});
```

## TaskMaster Compatibility

### Task ID Mapping

All endpoints map to specific TaskMaster task IDs for implementation tracking:

- F1 endpoints: T6.1.x tasks
- F2 endpoints: T6.2.x tasks
- F3 endpoints: T6.3.x tasks
- [continues for all stages]

### Quality Validation

Each endpoint includes automated quality checks:

- Response time validation against performance targets
- Schema validation for request/response formats
- Security validation for authentication and authorization
- Content quality validation for AI-generated outputs
