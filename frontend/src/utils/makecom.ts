/**
 * Make.com workflow integration for CanAI Platform
 * Handles Webflow → Make.com → Supabase data flow
 */

export interface MakecomWebhookPayload {
  correlation_id: string;
  timestamp: string;
  source: string;
  event_type: string;
  data: Record<string, unknown>;
}

// Make.com webhook URLs
const MAKECOM_WEBHOOKS = {
  SESSION_LOG: import.meta.env['VITE_MAKECOM_SESSION_WEBHOOK'],
  USER_INTERACTION: import.meta.env['VITE_MAKECOM_INTERACTION_WEBHOOK'],
  ERROR_LOG: import.meta.env['VITE_MAKECOM_ERROR_WEBHOOK'],
  SPARK_GENERATION: import.meta.env['VITE_MAKECOM_SPARK_WEBHOOK'],
  SPARK_REGENERATION: import.meta.env['VITE_MAKECOM_SPARK_REGEN_WEBHOOK'],
  PROJECT_CREATION: import.meta.env['VITE_MAKECOM_PROJECT_WEBHOOK'],
  DELIVERABLE_GENERATION: import.meta.env['VITE_MAKECOM_DELIVERABLE_WEBHOOK'],
  PDF_GENERATION: import.meta.env['VITE_MAKECOM_PDF_WEBHOOK'],
  PROJECT_STATUS_UPDATE: import.meta.env['VITE_MAKECOM_STATUS_WEBHOOK'],
} as const;

// Validate webhook URLs
const validateWebhookUrl = (url: string | undefined): string => {
  if (!url) {
    throw new Error('Missing webhook URL');
  }

  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname.endsWith('make.com')) {
      throw new Error('Invalid webhook domain');
    }
    return url;
  } catch (error) {
    throw new Error('Invalid webhook URL format');
  }
};

// Rate limiting
const rateLimiter = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute in milliseconds

const checkRateLimit = (
  webhookType: keyof typeof MAKECOM_WEBHOOKS
): boolean => {
  const now = Date.now();
  const key = webhookType;
  const limit = rateLimiter.get(key);

  if (!limit) {
    rateLimiter.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (now - limit.timestamp > RATE_WINDOW) {
    rateLimiter.set(key, { count: 1, timestamp: now });
    return true;
  }

  if (limit.count >= RATE_LIMIT) {
    return false;
  }

  limit.count++;
  return true;
};

// Sanitize payload to prevent injection
const sanitizePayload = (payload: unknown): Record<string, unknown> => {
  if (typeof payload !== 'object' || !payload) {
    return {};
  }

  return Object.entries(payload as Record<string, unknown>).reduce(
    (acc, [key, value]) => {
      // Remove any potentially dangerous values
      if (
        typeof value === 'string' &&
        (value.includes('<script') || value.includes('javascript:'))
      ) {
        return acc;
      }

      // Recursively sanitize nested objects
      if (typeof value === 'object' && value !== null) {
        acc[key] = sanitizePayload(value);
      } else {
        acc[key] = value;
      }

      return acc;
    },
    {} as Record<string, unknown>
  );
};

// Send data to Make.com webhook with enhanced security
const sendToMakeWebhook = async (
  webhookType: keyof typeof MAKECOM_WEBHOOKS,
  payload: Record<string, unknown>
): Promise<void> => {
  try {
    // Check rate limit
    if (!checkRateLimit(webhookType)) {
      throw new Error('Rate limit exceeded');
    }

    // Get and validate webhook URL
    const webhookUrl = validateWebhookUrl(MAKECOM_WEBHOOKS[webhookType]);

    // Sanitize payload
    const sanitizedPayload = sanitizePayload(payload);

    // Add security headers and metadata
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Timestamp': Date.now().toString(),
        'X-Request-ID': crypto.randomUUID(),
      },
      body: JSON.stringify({
        ...sanitizedPayload,
        _metadata: {
          timestamp: new Date().toISOString(),
          environment: import.meta.env['MODE'],
          version: import.meta.env['VITE_APP_VERSION'] || '1.0.0',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook request failed: ${response.status}`);
    }
  } catch (error) {
    console.error('[Make.com] Webhook request failed:', error);
    throw error;
  }
};

export const logSessionToMakecom = async (
  data: Record<string, unknown>
): Promise<void> => {
  return sendToMakeWebhook('SESSION_LOG', data);
};

export const logErrorToMakecom = async (
  data: Record<string, unknown>
): Promise<void> => {
  return sendToMakeWebhook('ERROR_LOG', data);
};

// Specific workflow triggers
export const logInteractionToMakecom = (interactionData: {
  user_id?: string;
  action: string;
  details: Record<string, unknown>;
}) => {
  return sendToMakeWebhook('USER_INTERACTION', interactionData);
};

// Spark-specific workflow triggers
export const triggerSparkGeneration = (sparkData: {
  business_type: string;
  tone: string;
  outcome: string;
  prompt_id: string;
}) => {
  return sendToMakeWebhook('SPARK_GENERATION', {
    action: 'generate_sparks',
    spark_request: sparkData,
    gpt4o_integration: true,
  });
};

export const triggerSparkRegeneration = (sparkData: {
  business_type: string;
  tone: string;
  outcome: string;
  attempt_count: number;
  prompt_id: string;
}) => {
  return sendToMakeWebhook('SPARK_REGENERATION', {
    action: 'regenerate_sparks',
    spark_request: sparkData,
    gpt4o_integration: true,
  });
};

// SparkSplit specific workflow triggers
export const triggerSparkSplitWorkflow = (sparkSplitData: {
  canai_output: string;
  generic_output: string;
  trust_delta: number;
  emotional_resonance: {
    score: number;
    factors: string[];
    sentiment: 'positive' | 'negative' | 'neutral';
    emotional_triggers?: string[];
  };
  prompt_id: string;
}) => {
  return sendToMakeWebhook('DELIVERABLE_GENERATION', {
    action: 'spark_split_comparison',
    comparison_data: sparkSplitData,
    gpt4o_integration: true,
    hume_validation: true,
    supabase_logging: true,
  });
};

export const triggerSparkSplitFeedback = (feedbackData: {
  prompt_id: string;
  selection: string;
  feedback: string;
  trust_delta: number;
}) => {
  return sendToMakeWebhook('USER_INTERACTION', {
    action: 'sparksplit_feedback',
    feedback_data: feedbackData,
    supabase_logging: true,
  });
};

// Purchase Flow specific workflow triggers
export const triggerProjectCreation = (projectData: {
  stripe_session_id: string;
  product: string;
  user_id?: string;
  spark_title?: string;
}) => {
  return sendToMakeWebhook('PROJECT_CREATION', {
    action: 'create_project',
    project_request: projectData,
    webflow_integration: true,
    memberstack_sync: true,
  });
};

// Deliverable generation specific workflow triggers
export const triggerDeliverableGeneration = (deliverableData: {
  prompt_id: string;
  product_type: string;
  business_inputs: Record<string, unknown>;
  user_id?: string;
}) => {
  return sendToMakeWebhook('DELIVERABLE_GENERATION', {
    action: 'generate_deliverable',
    deliverable_request: deliverableData,
    gpt4o_integration: true,
    hume_validation: true,
    supabase_logging: true,
  });
};

export const triggerPDFGeneration = (pdfData: {
  prompt_id: string;
  product_type: string;
  canai_output: string;
  user_id?: string;
}) => {
  return sendToMakeWebhook('PDF_GENERATION', {
    action: 'generate_pdf',
    pdf_request: pdfData,
    storage_integration: true,
    delivery_method: 'download_link',
  });
};

export const triggerProjectStatusUpdate = (statusData: {
  prompt_id: string;
  project_id?: string;
  status: 'generating' | 'complete' | 'failed';
  user_id?: string;
}) => {
  return sendToMakeWebhook('PROJECT_STATUS_UPDATE', {
    action: 'update_project_status',
    status_update: statusData,
    saap_integration: true, // SAAP Update Project Blueprint.json
    webflow_sync: true,
  });
};

export const triggerRevisionWorkflow = (revisionData: {
  prompt_id: string;
  feedback: string;
  attempt_count: number;
  user_id?: string;
}) => {
  return sendToMakeWebhook('USER_INTERACTION', {
    action: 'process_revision',
    revision_request: revisionData,
    gpt4o_integration: true,
    supabase_logging: true,
  });
};

export const triggerRegenerationWorkflow = (regenData: {
  prompt_id: string;
  attempt_count: number;
  user_id?: string;
}) => {
  return sendToMakeWebhook('USER_INTERACTION', {
    action: 'process_regeneration',
    regeneration_request: regenData,
    gpt4o_integration: true,
    supabase_logging: true,
  });
};

export const triggerMakecomWorkflow = async (
  type: string,
  data: Record<string, unknown>
): Promise<void> => {
  // Implementation
  console.log('Triggering Make.com workflow:', type, data);
};

// TODO: Configure Make.com scenarios
/*
Scenario 1: add_project.json
- Webhook trigger → Filter → Supabase insert to session_logs
- Include error handling and retry logic

Scenario 2: admin_add_project.json
- Admin webhook → Validation → Admin-specific logging

Scenario 3: SAAP Update Project Blueprint.json
- Project update webhook → Status update → Notification

Scenario 4: add_client.json
- New client webhook → Memberstack sync → Supabase user creation

Scenario 5: spark_generation.json (NEW)
- Spark webhook → GPT-4o API call → Response formatting → Supabase spark_logs insert
- Include error handling for GPT-4o timeout/failures
- Performance target: <1.5s end-to-end

Scenario 6: spark_regeneration.json (NEW)
- Regeneration webhook → GPT-4o API call with attempt_count → Response formatting → Supabase update
- Include logic for max attempts (3 + 1 extra if trust_score < 50%)

Scenario 7: add_project.json (PURCHASE FLOW)
- Purchase webhook → Stripe session validation → Webflow project creation → Memberstack sync
- Include Supabase session_logs update with stripe_payment_id
- Performance target: <2s project creation
- Error handling for Stripe failures, Webflow timeouts, Memberstack sync issues

NEW Scenario: deliverable_generation.json
- Webhook trigger → GPT-4o content generation → Hume AI validation → Supabase comparisons insert → PDF generation → Status update
- Include error handling for GPT-4o timeout/failures and Hume AI validation failures
- Performance target: <2s end-to-end for content generation
- Include fallback logic for API failures

NEW Scenario: pdf_generation.json
- PDF webhook → Content formatting → PDF creation → Cloud storage → Download URL generation
- Include error handling for PDF generation failures
- Performance target: <1s PDF creation and storage
- Support multiple product types (business_builder, social_email, site_audit)

UPDATED Scenario: SAAP Update Project Blueprint.json
- Enhanced with deliverable completion status updates
- Project status webhook → Webflow project update → Memberstack notification → Status logging
- Include logic for project completion tracking and user notifications

NEW Scenario: revision_processing.json
- Revision webhook → GPT-4o revision generation → Hume AI re-validation → Supabase update
- Include feedback analysis and improvement suggestions
- Performance target: <2s revision processing

NEW Scenario: regeneration_processing.json
- Regeneration webhook → GPT-4o alternative generation → Quality scoring → Supabase update
- Include attempt counting and max limit enforcement (2 attempts)
- Performance target: <2s regeneration processing

NEW Scenario: spark_split_comparison.json
- Webhook trigger → GPT-4o generic generation → Hume AI validation → TrustDelta calculation → Supabase comparisons insert
- Include error handling for GPT-4o timeout/failures and Hume AI validation failures
- Performance target: <500ms end-to-end for comparison generation
- Include fallback logic for API failures

UPDATED Scenario: user_interaction.json
- Enhanced with SparkSplit feedback processing
- Feedback webhook → Sentiment analysis → Supabase feedback update → Analytics logging
- Include logic for feedback categorization and user preference tracking
*/
