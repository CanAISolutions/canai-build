// Integration test for /v1/generate-preview-spark API
// Follows docs/generate-preview-spark-test-plan.md and defensive implementation plan

import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import request from 'supertest';
// import { createApp } from '../../server.js';
import type { Application } from 'express';

// --- Defensive: Mock all external dependencies at the top ---
vi.mock('../../services/gpt4o', () => ({
  gpt4oGenerate: vi.fn().mockResolvedValue({
    content: 'Mocked GPT-4o content',
    raw: 'Mocked raw output',
  }),
}));

vi.mock('../../services/gpt4oFallback', () => ({
  default: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockResolvedValue({
      content: 'Mocked GPT-4o fallback content',
      raw: 'Mocked raw output',
    }),
  })),
}));

vi.mock('../../services/previewGenerator', () => ({
  default: {
    generatePreviewSpark: vi.fn().mockResolvedValue({
      preview: 'Mocked preview content',
      id: 'mock-preview-id',
      businessType: 'tech',
      tone: 'bold',
      customTone: 'edgy',
      targetAudience: 'startups',
      customInstructions: 'Focus on innovation.',
      maxLength: 150,
    }),
  },
}));

vi.mock('../../services/hume', () => ({
  default: vi.fn().mockImplementation(() => ({
    analyzeEmotion: vi.fn().mockResolvedValue({
      emotion: 'joy',
      confidence: 0.8,
    }),
    circuitBreaker: {
      isOpen: vi.fn().mockReturnValue(false),
      state: 'CLOSED',
    },
  })),
}));
// Defensive analytics event spy setup for validation error (see docs/generate-preview-spark-test-plan.md, task-15-defensive-implementation-plan.md)
vi.mock('../../services/posthog', () => ({
  __esModule: true,
  capture: vi.fn(),
  safeCapture: vi.fn(),
  default: { capture: vi.fn() },
}));
vi.mock('../../services/supabase/client', () => ({
  from: vi.fn(),
  rpc: vi.fn(),
}));
vi.mock('../../services/instrument', () => ({
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

type AnalyticsMockType = {
  default: { capture: (...args: unknown[]) => unknown };
  safeCapture?: (...args: unknown[]) => unknown;
};
// type SentryMockType = {
//   default: {
//     logger: {
//       info: (...args: unknown[]) => unknown;
//       error: (...args: unknown[]) => unknown;
//     };
//   };
// };

let analytics: unknown, app: Application;

// Pre-import modules once to avoid repeated imports
beforeAll(async () => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      analytics = await import('../../services/posthog');
      const mod = await import('../../server');
      app = mod.createApp() as Application;

      // If we get here, the import was successful
      console.log(`Module import successful on attempt ${attempt}`);
      return;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Module import attempt ${attempt} failed:`, error);

      if (attempt < maxRetries) {
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // If all retries failed, throw the last error
  console.error('All module import attempts failed');
  throw lastError;
}, 30000); // 30 second timeout for initial setup

beforeEach(async () => {
  vi.clearAllMocks();

  // Mock console methods for logging tests
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  // Clean up any remaining resources
  vi.clearAllMocks();
  vi.resetModules();
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
    const analyticsSpy = vi.spyOn(
      (analytics as unknown as AnalyticsMockType).default,
      'capture'
    );
    const logInfoSpy = vi.spyOn(console, 'info');
    const logErrorSpy = vi.spyOn(console, 'error');

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
    const analyticsSpy = vi.spyOn(
      (analytics as unknown as AnalyticsMockType).default,
      'capture'
    );
    const logInfoSpy = vi.spyOn(console, 'info');
    const logErrorSpy = vi.spyOn(console, 'error');

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
    const analyticsSpy = vi.spyOn(
      (analytics as unknown as AnalyticsMockType).default,
      'capture'
    );
    const logInfoSpy = vi.spyOn(console, 'info');
    const logErrorSpy = vi.spyOn(console, 'error');
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
    const analyticsSpy = vi.spyOn(
      analytics as unknown as AnalyticsMockType,
      'safeCapture'
    );
    const logInfoSpy = vi.spyOn(console, 'info');
    const logErrorSpy = vi.spyOn(console, 'error');
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
      const analyticsSpy = vi.spyOn(
        (analytics as unknown as AnalyticsMockType).default,
        'capture'
      );
      const logInfoSpy = vi.spyOn(console, 'info');
      const logErrorSpy = vi.spyOn(console, 'error');
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
    const logInfoSpy = vi.spyOn(console, 'info');
    const logErrorSpy = vi.spyOn(console, 'error');
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
    const analyticsSpy = vi.spyOn(
      (analytics as unknown as AnalyticsMockType).default,
      'capture'
    );
    const errorAnalyticsSpy = vi.spyOn(
      analytics as unknown as AnalyticsMockType,
      'safeCapture'
    );
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
    expect(
      vi.isMockFunction(
        (analytics as unknown as AnalyticsMockType).default.capture
      )
    ).toBe(true);
    expect(
      vi.isMockFunction((analytics as unknown as AnalyticsMockType).safeCapture)
    ).toBe(true);
    expect(vi.isMockFunction(console.info)).toBe(true);
    expect(vi.isMockFunction(console.error)).toBe(true);
    // State reset: afterEach/beforeEach should clear mocks
    const analyticsSpy = vi.spyOn(
      (analytics as unknown as AnalyticsMockType).default,
      'capture'
    );
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
    // Output structure
    expect(response.body).toHaveProperty('previewSpark');
    expect(response.body.previewSpark).toHaveProperty('id');
    expect(response.body.previewSpark).toHaveProperty('content');
    expect(response.body.previewSpark).toHaveProperty('metadata');
  });

  // Add more as needed per test plan
});
