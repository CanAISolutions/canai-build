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
    const res = await request(app)
      .post('/v1/generate-preview-spark')
      .send(malformedInput);

    // Assert
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/user-friendly/i);
    expect(res.body.stack).toBeUndefined();
    // Analytics event
    expect(analyticsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'preview_error' })
    );
    expect(logErrorSpy).toHaveBeenCalled();
    expect(logInfoSpy).not.toHaveBeenCalledWith(
      expect.stringMatching(/previewSpark/),
      expect.anything()
    );
  });

  it('should handle edge-case inputs (Unicode, emojis, injection)', async () => {
    // Defensive: See test plan and defensive implementation docs
    for (const input of edgeCases) {
      const analyticsSpy = vi.spyOn(analytics.default, 'capture');
      const logInfoSpy = vi.spyOn(Sentry.default.logger, 'info');
      const logErrorSpy = vi.spyOn(Sentry.default.logger, 'error');
      const response = await request(app)
        .post('/v1/generate-preview-spark')
        .send(input)
        .set('Accept', 'application/json');
      // Accept either 200 (if valid) or 400 (if invalid)
      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('previewSpark');
        expect(analyticsSpy).toHaveBeenCalledWith(
          'preview_viewed',
          expect.any(Object)
        );
        expect(logInfoSpy).toHaveBeenCalled();
        expect(logErrorSpy).not.toHaveBeenCalled();
      } else {
        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toMatch(/user-friendly/i);
        expect(analyticsSpy).not.toHaveBeenCalledWith(
          'preview_viewed',
          expect.any(Object)
        );
        // Defensive: error event may be fired via safeCapture, but not always in this test
        expect(logErrorSpy).toHaveBeenCalled();
      }
    }
  });

  it('should log at each major step (entry, exit, error)', async () => {
    // Defensive: See test plan and defensive implementation docs
    const logInfoSpy = vi.spyOn(Sentry.default.logger, 'info');
    const logErrorSpy = vi.spyOn(Sentry.default.logger, 'error');
    // Valid request (entry/exit)
    await request(app)
      .post('/v1/generate-preview-spark')
      .send(validInput)
      .set('Accept', 'application/json');
    expect(logInfoSpy).toHaveBeenCalled();
    // Invalid request (error)
    await request(app)
      .post('/v1/generate-preview-spark')
      .send({ businessType: '', tone: '' })
      .set('Accept', 'application/json');
    expect(logErrorSpy).toHaveBeenCalled();
  });

  it('should trigger analytics events for both success and error', async () => {
    // Defensive: See test plan and defensive implementation docs
    const analyticsSpy = vi.spyOn(analytics.default, 'capture');
    const errorAnalyticsSpy = vi.spyOn(analytics, 'safeCapture');
    // Success
    await request(app)
      .post('/v1/generate-preview-spark')
      .send(validInput)
      .set('Accept', 'application/json');
    expect(analyticsSpy).toHaveBeenCalledWith(
      'preview_viewed',
      expect.any(Object)
    );
    // Error
    await request(app)
      .post('/v1/generate-preview-spark')
      .send({ businessType: '', tone: '' })
      .set('Accept', 'application/json');
    expect(errorAnalyticsSpy).toHaveBeenCalledWith(
      expect.objectContaining({ event: 'preview_error' })
    );
  });

  it('should mock all external dependencies and reset state', async () => {
    // Defensive: See test plan and defensive implementation docs
    // Assert that all mocks are present and called
    expect(vi.isMockFunction(analytics.default.capture)).toBe(true);
    expect(vi.isMockFunction(analytics.safeCapture)).toBe(true);
    expect(vi.isMockFunction(Sentry.default.logger.info)).toBe(true);
    expect(vi.isMockFunction(Sentry.default.logger.error)).toBe(true);
    // State reset: afterEach/beforeEach should clear mocks
    const analyticsSpy = vi.spyOn(analytics.default, 'capture');
    await request(app)
      .post('/v1/generate-preview-spark')
      .send(validInput)
      .set('Accept', 'application/json');
    expect(analyticsSpy).toHaveBeenCalled();
    vi.clearAllMocks();
    expect(analyticsSpy).not.toHaveBeenCalled();
  });

  it('should enforce type safety and output structure', async () => {
    // Defensive: See test plan and defensive implementation docs
    const response = await request(app)
      .post('/v1/generate-preview-spark')
      .send(validInput)
      .set('Accept', 'application/json');
    // Type assertions (if expectTypeOf is available)
    if (typeof expectTypeOf === 'function') {
      expectTypeOf(response.body.previewSpark).toMatchTypeOf({
        id: '',
        content: '',
        metadata: {},
      });
      expectTypeOf(response.body).not.toHaveProperty('stack');
    }
    // Output structure
    expect(response.body).toHaveProperty('previewSpark');
    expect(response.body.previewSpark).toHaveProperty('id');
    expect(response.body.previewSpark).toHaveProperty('content');
    expect(response.body.previewSpark).toHaveProperty('metadata');
  });

  // Add more as needed per test plan
});
