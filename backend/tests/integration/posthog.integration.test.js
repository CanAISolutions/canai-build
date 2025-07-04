require('../../../testEnvSetup');
require('dotenv').config();
console.debug('POSTHOG_API_KEY:', process.env.POSTHOG_API_KEY);

import { describe, it, beforeAll } from 'vitest';
import {
  initPosthog,
  trackFunnelStep,
  startSession,
} from '../../services/posthog.js';

describe('PostHog Integration', () => {
  beforeAll(() => {
    initPosthog();
  });

  it('sends funnel_step event to PostHog dashboard (placeholder)', async () => {
    const session = startSession({ id: 'test-user' });
    trackFunnelStep('F1', session, { prop: 'value' });
    // TODO: Add logic to verify event in dashboard (e.g., API query or mock)
    // Example: expect(dashboardApi.getEvents()).toContain({ event: 'funnel_step', ... });
  });
});
