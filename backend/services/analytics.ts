import { PostHog } from 'posthog-node';

const client = new PostHog(process.env.POSTHOG_API_KEY!, {
  host: process.env.POSTHOG_HOST || 'https://app.posthog.com',
});

export const analytics = {
  track: (
    event: string,
    properties: Record<string, unknown> = {},
    userId?: string
  ) => {
    if (process.env.NODE_ENV === 'test') {
      console.log('[analytics]', event, properties);
    }

    client.capture({
      event,
      distinctId: userId || 'anonymous',
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      },
    });
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
