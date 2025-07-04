/**
 * Intent Mirror Integration - Make.com & GPT-4o Integration
 * Handles the data flow: Business Data → GPT-4o → Make.com → Supabase → Analytics
 */

import {
  POSTHOG_EVENTS,
  trackIntentMirrorLoaded,
  trackSupportRequested,
} from './analytics';
import { triggerMakecomWorkflow } from './makecom';
import { type ErrorLog } from './supabase';
import { generateCorrelationId } from './tracing';

interface BusinessData {
  businessName: string;
  primaryGoal: string;
  targetAudience: string;
  businessDescription: string;
}

export interface IntentMirrorWorkflowPayload {
  correlation_id: string;
  business_data: BusinessData;
  user_context?: {
    user_id?: string;
    session_id: string;
    timestamp: string;
  };
}

// Trigger complete intent mirror workflow
export const triggerIntentMirrorWorkflow = async (
  businessData: BusinessData
) => {
  const correlationId = generateCorrelationId();

  try {
    console.log('[IntentMirror] Starting workflow:', businessData);

    // Step 1: Trigger Make.com scenario for GPT-4o processing
    await triggerMakecomWorkflow('USER_INTERACTION', {
      action: 'generate_intent_mirror',
      correlation_id: correlationId,
      gpt4o_request: {
        business_data: businessData,
        prompt_template: 'intent_mirror_summary',
        max_tokens: 200,
        temperature: 0.3,
        performance_target: '300ms',
      },
      supabase_logging: true,
      analytics_tracking: true,
    });

    // Step 2: Track workflow initiation
    trackIntentMirrorLoaded({
      confidence_score: 0,
      response_time: 0,
      clarifying_questions_count: 0,
      correlation_id: correlationId,
    });

    console.log('[IntentMirror] Workflow initiated successfully');
    return { success: true, correlation_id: correlationId };
  } catch (error) {
    console.error('[IntentMirror] Workflow failed:', error);

    // Track workflow failure
    import('./analytics').then(({ trackEvent }) => {
      trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
        stepName: 'intent_mirror_workflow_failed',
        completed: false,
        correlation_id: correlationId,
        error_message: error instanceof Error ? error.message : 'Unknown error',
        dropoffReason: 'workflow_integration_failure',
      });
    });

    throw error;
  }
};

// GPT-4o intent mirror generation
export const generateGPT4oIntentMirror = async (businessData: BusinessData) => {
  try {
    const correlationId = generateCorrelationId();

    // Trigger Make.com scenario for GPT-4o intent mirror generation
    await triggerMakecomWorkflow('USER_INTERACTION', {
      action: 'gpt4o_intent_mirror',
      correlation_id: correlationId,
      gpt4o_request: {
        business_data: businessData,
        prompt_template: `
          Generate a 15-25 word business intent summary and confidence score (0-1) for:
          Business: ${businessData.businessName}
          Goal: ${businessData.primaryGoal}
          Audience: ${businessData.targetAudience}
          Description: ${businessData.businessDescription}

          Return JSON: {"summary": "string", "confidenceScore": number, "clarifyingQuestions": ["string"]}
        `,
        max_tokens: 300,
        temperature: 0.2,
        performance_target: '300ms',
      },
      fallback_enabled: true,
    });

    return {
      success: true,
      correlation_id: correlationId,
      source: 'gpt4o',
    };
  } catch (error) {
    console.error('[IntentMirror] GPT-4o generation failed:', error);

    return {
      success: false,
      source: 'fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Handle low confidence support requests
export const handleLowConfidenceSupport = async (data: {
  confidence_score: number;
  business_data: BusinessData;
  attempt_count: number;
}) => {
  try {
    // Log support request to Supabase
    const { insertErrorLog } = await import('./supabase');
    await insertErrorLog({
      user_id: '',
      error_message: `Low confidence intent mirror: ${data.confidence_score}`,
      action: 'intent_mirror_support_request',
      error_type: 'low_confidence',
      support_request: true,
    } as ErrorLog);

    // Trigger Make.com workflow for support queue
    await triggerMakecomWorkflow('USER_INTERACTION', {
      action: 'queue_support_request',
      correlation_id: generateCorrelationId(),
      support_request: {
        type: 'intent_mirror_low_confidence',
        confidence_score: data.confidence_score,
        business_data: data.business_data,
        attempt_count: data.attempt_count,
        priority: data.confidence_score < 0.6 ? 'high' : 'medium',
      },
    });

    // Track support request
    trackSupportRequested({
      reason: 'low_confidence',
      confidence_score: data.confidence_score,
      attempt_count: data.attempt_count,
      correlation_id: generateCorrelationId(),
    });

    console.log('[IntentMirror] Support request queued successfully');
    return { success: true };
  } catch (error) {
    console.error('[IntentMirror] Support request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// TODO: Configure Make.com scenarios for Intent Mirror
/*
Scenario: intent_mirror_processor.json
Trigger: Webhook from intent mirror generation
Actions:
1. Receive business data payload
2. Generate intent summary via GPT-4o (15-25 words)
3. Calculate confidence score based on data completeness
4. Generate clarifying questions if confidence < 0.8
5. Save to Supabase prompt_logs with intent_mirror step
6. Send analytics events to PostHog
7. Handle error states and retries
8. Queue support requests for confidence < 0.6

Scenario: intent_mirror_support.json
Trigger: Webhook from low confidence detection
Actions:
1. Receive support request data
2. Queue in support system (Zendesk/Intercom)
3. Send notification to support team
4. Log support request in Supabase error_logs
5. Track support analytics

Performance Targets:
- Intent mirror generation: <300ms end-to-end
- Support request queueing: <100ms
- Confidence calculation: <50ms
- Error rate: <1% for all workflows
*/
