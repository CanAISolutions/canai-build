import { PostHog } from 'posthog-node';
import Sentry from './instrument.js';

// Validate required environment variables
const validatePostHogConfig = () => {
  const apiKey = process.env.POSTHOG_API_KEY;
  const host = process.env.POSTHOG_HOST || 'https://app.posthog.com';

  if (!apiKey) {
    throw new Error(
      'POSTHOG_API_KEY environment variable is required for analytics tracking'
    );
  }

  if (typeof apiKey !== 'string' || apiKey.trim() === '') {
    throw new Error('POSTHOG_API_KEY must be a non-empty string');
  }

  // Validate host URL format
  try {
    new URL(host);
  } catch (error) {
    throw new Error(`Invalid POSTHOG_HOST URL: ${host}`);
  }

  return { apiKey, host };
};

// Initialize PostHog client with error handling
let client: PostHog | null = null;

try {
  const config = validatePostHogConfig();
  client = new PostHog(config.apiKey, {
    host: config.host,
  });
} catch (error) {
  console.error('[analytics] Failed to initialize PostHog client:', error);
  // In production, you might want to throw here, but for development/testing we'll continue
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}

export const analytics = {
  track: (
    event: string,
    properties: Record<string, unknown> = {},
    userId?: string
  ) => {
    if (process.env.NODE_ENV === 'test') {
      console.log('[analytics]', event, properties);
    }

    // Handle case where PostHog client failed to initialize
    if (!client) {
      console.warn(
        '[analytics] PostHog client not available, skipping event:',
        event
      );
      return;
    }

    try {
      client.capture({
        event,
        distinctId: userId || 'anonymous',
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        },
      });
    } catch (error) {
      console.error('[analytics] Failed to track event:', event, error);
      // Capture error in Sentry for proper logging and monitoring
      Sentry.captureException(error, {
        tags: {
          service: 'analytics',
          event: event,
          userId: userId || 'anonymous',
        },
        extra: {
          event,
          properties,
          userId: userId || 'anonymous',
          environment: process.env.NODE_ENV,
        },
      });
      // Don't throw - analytics failures shouldn't break the application
    }
  },

  // PRD: funnel_step event tracking for user journey
  trackFunnelStep: (
    stepName: string,
    properties: Record<string, unknown> = {},
    userId?: string
  ) => {
    analytics.track(
      'funnel_step',
      {
        stepName,
        completed: properties.completed !== false, // PRD: completed boolean
        dropoffReason: properties.dropoffReason || null, // PRD: dropoff tracking
        ...properties,
      },
      userId
    );
  },

  // PRD: Specific funnel step for discovery_hook
  trackDiscoveryHook: (
    properties: Record<string, unknown> = {},
    userId?: string
  ) => {
    analytics.trackFunnelStep('discovery_hook', properties, userId);
  },
};
