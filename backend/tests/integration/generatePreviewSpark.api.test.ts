// Integration test for /v1/generate-preview-spark API
// Follows docs/generate-preview-spark-test-plan.md and defensive implementation plan

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock analytics service
vi.mock('../../services/posthog', () => ({
  default: {
    capture: vi.fn(),
  },
  safeCapture: vi.fn(),
}));

// Mock Sentry service
vi.mock('../../services/instrument', () => ({
  captureException: vi.fn(),
  default: {
    captureException: vi.fn(),
  },
}));

// Mock GPT4o service
vi.mock('../../services/gpt4o', () => ({
  GPT4Service: class MockGPT4Service {
    async generatePreviewSpark() {
      return {
        content: 'Mock preview spark content',
        id: 'mock-spark-id',
        metadata: {
          businessType: 'tech',
          tone: 'bold',
          targetAudience: 'startups',
        },
      };
    }
  },
  gpt4oGenerate: vi.fn().mockResolvedValue({
    content: 'Mocked GPT-4o content',
    raw: 'Mocked raw output',
  }),
}));

import { createApp } from '../../server';
import { default as posthog } from '../../services/posthog';

let app;

beforeEach(async () => {
  vi.clearAllMocks();

  // Create app instance for each test
  app = createApp();

  // Mock console methods for logging tests
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
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
    const analyticsSpy = vi.spyOn(posthog, 'capture');
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
    const analyticsSpy = vi.spyOn(posthog, 'capture');
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
  });

  it('should handle edge cases gracefully', async () => {
    // Test each edge case
    for (const edgeCase of edgeCases) {
      const analyticsSpy = vi.spyOn(posthog, 'capture');
      const logInfoSpy = vi.spyOn(console, 'info');
      const logErrorSpy = vi.spyOn(console, 'error');

      const response = await request(app)
        .post('/v1/generate-preview-spark')
        .send(edgeCase)
        .set('Accept', 'application/json');

      // Should handle gracefully (either 200 or 400 with proper error)
      expect([200, 400]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('previewSpark');
        expect(analyticsSpy).toHaveBeenCalled();
        expect(logInfoSpy).toHaveBeenCalled();
      } else {
        expect(response.body).toHaveProperty('error');
        expect(logErrorSpy).toHaveBeenCalled();
      }
    }
  });
});
