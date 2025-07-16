// Integration test for /v1/generate-preview-spark API
// Follows docs/generate-preview-spark-test-plan.md and defensive implementation plan

import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../backend/server';

// --- Defensive: Mock all external dependencies at the top ---
vi.mock('../../services/gpt4o.js', () => ({
  gpt4oGenerate: vi.fn().mockResolvedValue({
    content: 'Mocked GPT-4o content',
    raw: 'Mocked raw output',
  }),
}));
// Defensive analytics event spy setup for validation error (see docs/generate-preview-spark-test-plan.md, task-15-defensive-implementation-plan.md)
vi.mock('../../services/posthog.js', () => ({
  __esModule: true,
  capture: vi.fn(),
  safeCapture: vi.fn(),
  default: { capture: vi.fn() },
}));
vi.mock('../../services/supabase/client.js', () => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('../../services/instrument.js', () => ({
  __esModule: true,
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  },
  default: {
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  },
}));

let Sentry, analytics, app;

beforeEach(async () => {
  vi.resetModules();
  // Dynamically import after mocks
  Sentry = await import('../../services/instrument.js');
  analytics = await import('../../services/posthog.js');
  const mod = await import('../../../backend/server');
  app = mod.createApp();
  vi.clearAllMocks();
});
afterEach(() => {
  vi.clearAllMocks();
});

const validInput = {
  businessType: 'tech',
  tone: 'bold',
  customTone: 'edgy',
  targetAudience: 'startups',
  customInstructions: 'Focus on innovation.',
  maxLength: 150,
};

const minimalInput = {
  businessType: 'retail',
  tone: 'warm',
};

const edgeCases = [
  { businessType: '', tone: '' }, // empty
  { businessType: '🚀', tone: '🔥' }, // emojis
  { businessType: '<script>alert(1)</script>', tone: 'bold' }, // injection
  { businessType: 'a'.repeat(1000), tone: 'b'.repeat(1000) }, // max length
  // Add more as needed
];

// --- Tests ---
describe('/v1/generate-preview-spark API (Integration, Defensive)', () => {
  it('should generate preview with all valid fields', async () => {
    // Arrange
    const analyticsSpy = vi.spyOn(analytics.default, 'capture');
    const logInfoSpy = vi.spyOn(Sentry.default.logger, 'info');
    const logErrorSpy = vi.spyOn(Sentry.default.logger, 'error');

    // Act
    const response = await request(app)
      .post('/v1/generate-preview-spark')
      .send(validInput)
      .set('Accept', 'application/json');

    // Defensive: Temporary log for test path (remove before merge)
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log('DEBUG: Response body:', response.body);
      // Removed throw statement for normal test execution
    }

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('previewSpark');
    expect(response.body.previewSpark).toHaveProperty('content');
    expect(response.body.previewSpark).toHaveProperty('id');
    expect(response.body.previewSpark).toHaveProperty('metadata');
    // Analytics event
    expect(analyticsSpy).toHaveBeenCalledWith(
      'preview_viewed',
      expect.any(Object)
    );
    // Logging at entry/exit
    expect(logInfoSpy).toHaveBeenCalled();
    // No error logs for happy path
    expect(logErrorSpy).not.toHaveBeenCalled();
    // No stack trace or sensitive info in response
    expect(response.body).not.toHaveProperty('stack');
    // Defensive: Temporary log for test path (remove before merge)
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log('Test: valid input, response:', response.body);
    }
  });

  it('should handle minimal valid input', async () => {
    // Arrange
    const analyticsSpy = vi.spyOn(analytics.default, 'capture');
    const logInfoSpy = vi.spyOn(Sentry.default.logger, 'info');
    const logErrorSpy = vi.spyOn(Sentry.default.logger, 'error');

    // Act
    const response = await request(app)
      .post('/v1/generate-preview-spark')
      .send(minimalInput)
      .set('Accept', 'application/json');

    // Defensive: Temporary log for test path (remove before merge)
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log('Test: minimal input, response:', response.body);
    }

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('previewSpark');
    expect(response.body.previewSpark).toHaveProperty('content');
    expect(response.body.previewSpark).toHaveProperty('id');
    expect(response.body.previewSpark).toHaveProperty('metadata');
    // Analytics event
    expect(analyticsSpy).toHaveBeenCalledWith(
      'preview_viewed',
      expect.any(Object)
    );
    // Logging at entry/exit
    expect(logInfoSpy).toHaveBeenCalled();
    // No error logs for happy path
    expect(logErrorSpy).not.toHaveBeenCalled();
    // No stack trace or sensitive info in response
    expect(response.body).not.toHaveProperty('stack');
  });

  it('should handle missing optional fields gracefully', async () => {
    // Arrange
    const analyticsSpy = vi.spyOn(analytics.default, 'capture');
    const logInfoSpy = vi.spyOn(Sentry.default.logger, 'info');
    const logErrorSpy = vi.spyOn(Sentry.default.logger, 'error');
    // Only required fields
    const requiredOnlyInput = {
      businessType: 'retail',
      tone: 'warm',
    };

    // Act
    const response = await request(app)
      .post('/v1/generate-preview-spark')
      .send(requiredOnlyInput)
      .set('Accept', 'application/json');

    // Defensive: Temporary log for test path (remove before merge)
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log('Test: missing optional fields, response:', response.body);
    }

    // Assert
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('previewSpark');
    expect(response.body.previewSpark).toHaveProperty('content');
    expect(response.body.previewSpark).toHaveProperty('id');
    expect(response.body.previewSpark).toHaveProperty('metadata');
    // Analytics event
    expect(analyticsSpy).toHaveBeenCalledWith(
      'preview_viewed',
      expect.any(Object)
    );
    // Logging at entry/exit
    expect(logInfoSpy).toHaveBeenCalled();
    // No error logs for happy path
    expect(logErrorSpy).not.toHaveBeenCalled();
    // No stack trace or sensitive info in response
    expect(response.body).not.toHaveProperty('stack');
  });

  it('should return user-friendly error on malformed input', async () => {
    // Arrange
    const analyticsSpy = vi.spyOn(analytics, 'safeCapture');
    const logInfoSpy = vi.spyOn(Sentry.default.logger, 'info');
    const logErrorSpy = vi.spyOn(Sentry.default.logger, 'error');
    // Malformed input: missing required fields
    const malformedInput = {
      businessType: 123, // wrong type
      // tone missing
    };

    // Act
    const response = await request(app)
      .post('/v1/generate-preview-spark')
      .send(malformedInput)
      .set('Accept', 'application/json');

    // Defensive: Temporary log for test path (remove before merge)
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log('Test: malformed input, response:', response.body);
    }

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/user-friendly/i);
    expect(response.body).not.toHaveProperty('stack');
    // Analytics event
    expect(analyticsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'preview_error' })
    );
    // Logging
    expect(logErrorSpy).toHaveBeenCalled();
  });

  it('should handle edge-case inputs (Unicode, emojis, injection)', async () => {
    for (const input of edgeCases) {
      // TODO: Send POST, assert 200 or 400, output or error, analytics/logging
    }
  });

  it('should log at each major step (entry, exit, error)', async () => {
    // TODO: Spy on logger, send request, assert logs
  });

  it('should trigger analytics events for both success and error', async () => {
    // TODO: Spy on analytics, send success and error requests, assert events
  });

  it('should mock all external dependencies and reset state', async () => {
    // TODO: Assert mocks called, no real API calls, state reset in beforeEach/afterEach
  });

  it('should enforce type safety and output structure', async () => {
    // TODO: Use expectTypeOf/assertType if available, check output shape
  });

  // Add more as needed per test plan
});
