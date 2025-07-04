/**
 * Analytics Integration with PostHog
 */

import { generateCorrelationId } from './tracing';
import posthog from 'posthog-js';

// TypeScript interfaces for analytics properties
interface BaseAnalyticsProperties {
  timestamp?: string;
  correlation_id?: string;
  user_id?: string;
  session_id?: string;
}

interface PageViewProperties extends BaseAnalyticsProperties {
  page?: string;
  referrer?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

interface FunnelStepProperties extends BaseAnalyticsProperties {
  step: string;
  source?: string;
  product?: string;
  spark_id?: string;
  completed?: boolean;
  duration_ms?: number;
  previous_step?: string;
}

interface TrustScoreProperties extends BaseAnalyticsProperties {
  score?: number;
  meets_target?: boolean;
  previous_score?: number;
  journey_stage?: string;
}

interface SparkProperties extends BaseAnalyticsProperties {
  spark_id?: string;
  selection_time?: number;
  attempt_count?: number;
  max_attempts_reached?: boolean;
  view_type?: string;
}

interface FeedbackProperties extends BaseAnalyticsProperties {
  source?: string;
  rating?: number;
  positive_feedback?: boolean;
  comments?: string;
}

interface ProductProperties extends BaseAnalyticsProperties {
  product_id?: string;
  product_name?: string;
  source?: string;
}

interface PerformanceProperties extends BaseAnalyticsProperties {
  action?: string;
  duration?: number;
  success?: boolean;
  error_message?: string;
}

interface ErrorProperties extends BaseAnalyticsProperties {
  error_name?: string;
  error_message?: string;
  stack_trace?: string;
  component?: string;
  user_action?: string;
}

// Generic analytics properties type
type AnalyticsProperties =
  | BaseAnalyticsProperties
  | PageViewProperties
  | FunnelStepProperties
  | TrustScoreProperties
  | SparkProperties
  | FeedbackProperties
  | ProductProperties
  | PerformanceProperties
  | ErrorProperties
  | Record<string, string | number | boolean | undefined>;

// PostHog Event Constants
export const POSTHOG_EVENTS = {
  FUNNEL_STEP: 'funnel_step',
  TRUST_SCORE_UPDATE: 'trust_score_update',
  SPARK_SELECTED: 'spark_selected',
  SPARKS_REGENERATED: 'sparks_regenerated',
  SPARK_SPLIT_VIEW: 'spark_split_view',
  FEEDBACK_SUBMISSION: 'feedback_submission',
  FORM_STEP: 'form_step',
  CTA_CLICKED: 'cta_clicked',
  RESET_PASSWORD_CLICKED: 'reset_password_clicked',
  PRODUCT_CLICKED: 'product_clicked',
  PRICING_VIEW: 'pricing_view',
  PREVIEW_VIEW: 'preview_view',
  INTENT_MIRROR_CONFIRMED: 'intent_mirror_confirmed',
  INTENT_MIRROR_EDITED: 'intent_mirror_edited',
  INTENT_MIRROR_LOADED: 'intent_mirror_loaded',
  SUPPORT_REQUESTED: 'support_requested',
  DELIVERABLE_GENERATED: 'deliverable_generated',
  REVISION_REQUESTED: 'revision_requested',
  DELIVERABLE_REGENERATED: 'deliverable_regenerated',
  PDF_DOWNLOAD: 'pdf_download',
  EMOTIONAL_RESONANCE: 'emotional_resonance',
} as const;

// Mock PostHog implementation for development
const mockPostHog = {
  capture: (event: string, properties?: AnalyticsProperties) => {
    console.log(`[PostHog] ${event}:`, properties);
  },
  identify: (userId: string, properties?: AnalyticsProperties) => {
    console.log(`[PostHog] Identify ${userId}:`, properties);
  },
};

// --- Analytics enrichment constants ---
const APP_VERSION = import.meta.env['VITE_APP_VERSION'] || '0.0.0';
const APP_ENV = import.meta.env.MODE || 'development';
const DEPLOYMENT_ID = import.meta.env['VITE_DEPLOYMENT_ID'] || 'unknown';

// --- PostHog Initialization ---
// Privacy: Do not send PII. See canai-analytics-rules.
// Use VITE_POSTHOG_API_KEY for frontend analytics. Backend uses POSTHOG_API_KEY.
const POSTHOG_API_KEY = import.meta.env['VITE_POSTHOG_API_KEY'];
const POSTHOG_HOST =
  import.meta.env['VITE_POSTHOG_HOST'] || 'https://app.posthog.com';

let analyticsClient;
if (POSTHOG_API_KEY) {
  // Real PostHog client
  posthog.init(POSTHOG_API_KEY, { api_host: POSTHOG_HOST });
  analyticsClient = posthog;
  console.log('[Analytics] Using real PostHog client');
} else {
  // Fallback mock
  analyticsClient = mockPostHog;
  console.log(
    '[Analytics] Using mock analytics client (no VITE_POSTHOG_API_KEY)'
  );
}

// Page view tracking
export const trackPageView = (
  page: string,
  properties?: PageViewProperties
) => {
  try {
    trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
      stepName: 'page_view',
      page,
      timestamp: new Date().toISOString(),
      correlation_id: generateCorrelationId(),
      ...properties,
    });
  } catch (error) {
    console.error('[Analytics] Page view tracking failed:', error);
  }
};

// Generic event tracking
export const trackEvent = (
  eventName: string,
  properties?: AnalyticsProperties
) => {
  try {
    analyticsClient.capture(eventName, {
      timestamp: new Date().toISOString(),
      correlation_id: generateCorrelationId(),
      ...properties,
      // --- Analytics enrichment ---
      appVersion: APP_VERSION,
      environment: APP_ENV,
      deploymentId: DEPLOYMENT_ID,
    });
  } catch (error) {
    console.error('[Analytics] Event tracking failed:', error);
  }
};

// Funnel step tracking
export const trackFunnelStep = (
  stepName: string,
  properties?: FunnelStepProperties
) => {
  trackEvent(POSTHOG_EVENTS.FUNNEL_STEP, {
    stepName,
    completed: true,
    ...properties,
  });
};

// Trust score updates
export const trackTrustScoreUpdate = (
  score: number,
  context?: TrustScoreProperties
) => {
  trackEvent(POSTHOG_EVENTS.TRUST_SCORE_UPDATE, {
    score,
    meets_target: score >= 65,
    ...context,
  });
};

// Spark selection tracking
export const trackSparkSelected = (
  sparkId: string,
  properties?: SparkProperties
) => {
  trackEvent(POSTHOG_EVENTS.SPARK_SELECTED, {
    spark_id: sparkId,
    selection_time: Date.now(),
    ...properties,
  });
};

// Spark regeneration tracking
export const trackSparksRegenerated = (
  attemptCount: number,
  properties?: SparkProperties
) => {
  trackEvent(POSTHOG_EVENTS.SPARKS_REGENERATED, {
    attempt_count: attemptCount,
    max_attempts_reached: attemptCount >= 3,
    ...properties,
  });
};

// SparkSplit view tracking
export const trackSparkSplitView = (properties?: SparkProperties) => {
  trackEvent(POSTHOG_EVENTS.SPARK_SPLIT_VIEW, {
    view_type: 'comparison_displayed',
    ...properties,
  });
};

// Feedback submission tracking
export const trackFeedbackSubmission = (
  source: string,
  rating: number,
  properties?: FeedbackProperties
) => {
  trackEvent(POSTHOG_EVENTS.FEEDBACK_SUBMISSION, {
    source,
    rating,
    positive_feedback: rating >= 4,
    ...properties,
  });
};

// Form step tracking
export const trackFormStep = (
  stepName: string,
  properties?: FunnelStepProperties
) => {
  trackEvent(POSTHOG_EVENTS.FORM_STEP, {
    stepName,
    completed: true,
    ...properties,
  });
};

// Product click tracking
export const trackProductClick = (
  productId: string,
  productName: string,
  properties?: ProductProperties
) => {
  trackEvent(POSTHOG_EVENTS.PRODUCT_CLICKED, {
    product_id: productId,
    product_name: productName,
    ...properties,
  });
};

// Pricing view tracking
export const trackPricingView = (
  source: string,
  properties?: ProductProperties
) => {
  trackEvent(POSTHOG_EVENTS.PRICING_VIEW, {
    source,
    ...properties,
  });
};

// Preview view tracking
export const trackPreviewView = (
  source: string,
  properties?: BaseAnalyticsProperties
) => {
  trackEvent(POSTHOG_EVENTS.PREVIEW_VIEW, {
    source,
    ...properties,
  });
};

// Intent mirror tracking
export const trackIntentMirrorConfirmed = (
  properties?: BaseAnalyticsProperties
) => {
  trackEvent(POSTHOG_EVENTS.INTENT_MIRROR_CONFIRMED, properties);
};

export const trackIntentMirrorEdited = (
  properties?: BaseAnalyticsProperties
) => {
  trackEvent(POSTHOG_EVENTS.INTENT_MIRROR_EDITED, properties);
};

export const trackIntentMirrorLoaded = (
  properties?: BaseAnalyticsProperties
) => {
  trackEvent(POSTHOG_EVENTS.INTENT_MIRROR_LOADED, properties);
};

// Support request tracking
export const trackSupportRequested = (properties?: BaseAnalyticsProperties) => {
  trackEvent(POSTHOG_EVENTS.SUPPORT_REQUESTED, properties);
};

// Deliverable tracking
export const trackDeliverableGenerated = (
  properties?: BaseAnalyticsProperties
) => {
  trackEvent(POSTHOG_EVENTS.DELIVERABLE_GENERATED, properties);
};

export const trackRevisionRequested = (
  properties?: BaseAnalyticsProperties
) => {
  trackEvent(POSTHOG_EVENTS.REVISION_REQUESTED, properties);
};

export const trackDeliverableRegenerated = (
  properties?: BaseAnalyticsProperties
) => {
  trackEvent(POSTHOG_EVENTS.DELIVERABLE_REGENERATED, properties);
};

export const trackPDFDownload = (properties?: BaseAnalyticsProperties) => {
  trackEvent(POSTHOG_EVENTS.PDF_DOWNLOAD, properties);
};

export const trackEmotionalResonance = (
  properties?: BaseAnalyticsProperties
) => {
  trackEvent(POSTHOG_EVENTS.EMOTIONAL_RESONANCE, properties);
};

export const trackPerformance = (
  action: string,
  duration: number,
  properties?: PerformanceProperties
) => {
  trackEvent('performance_metric', {
    action,
    duration,
    success: duration < 2000, // Consider <2s as success
    ...properties,
  });
};

export const trackError = (error: Error, context?: ErrorProperties) => {
  trackEvent('error_occurred', {
    error_name: error.name,
    error_message: error.message,
    stack_trace: error.stack,
    ...context,
  });
};

// Log interaction to backend /v1/log-interaction endpoint
export async function logInteraction({
  interaction_type,
  interaction_details,
}: {
  interaction_type: string;
  interaction_details?: Record<string, string | number | boolean | null>;
}) {
  try {
    const res = await fetch('/v1/log-interaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        interaction_type,
        interaction_details,
        timestamp: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      throw new Error(`Failed to log interaction: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('[Analytics] logInteraction failed:', error);
  }
}

export default {
  trackPageView,
  trackEvent,
  trackFunnelStep,
  trackTrustScoreUpdate,
  trackSparkSelected,
  trackSparksRegenerated,
  trackSparkSplitView,
  trackFeedbackSubmission,
  trackFormStep,
  trackProductClick,
  trackPricingView,
  trackPreviewView,
  trackIntentMirrorConfirmed,
  trackIntentMirrorEdited,
  trackIntentMirrorLoaded,
  trackSupportRequested,
  trackDeliverableGenerated,
  trackRevisionRequested,
  trackDeliverableRegenerated,
  trackPDFDownload,
  trackEmotionalResonance,
  trackPerformance,
  trackError,
  logInteraction,
};
