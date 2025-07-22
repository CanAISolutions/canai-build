require('../../testEnvSetup');
/* eslint-disable no-undef */
import { describe, test, expect, beforeEach, vi } from 'vitest';
// import { createHume } from '@ai-sdk/hume';
// import { hume } from '../services/hume.js';

// mockHumeAnalyze must be the first thing in the file
const mockHumeAnalyze = vi.fn();

// Now all vi.mock calls and variable declarations
vi.mock('@ai-sdk/hume', () => ({
  createHume: vi.fn(() => ({
    analyze: mockHumeAnalyze,
  })),
  hume: { language: { analyzeText: mockHumeAnalyze } },
}));

// Mock the hume.js module that exports humeClient
vi.mock('../services/hume.js', () => ({
  default: vi.fn(),
  humeClient: {
    language: {
      analyzeText: mockHumeAnalyze,
    },
  },
}));

const mockPostHogCapture = vi.fn();
const mockPostHogInstance = { capture: mockPostHogCapture };
const mockEncode = vi.fn((text: string) => {
  console.log('mockEncode called with:', text);
  return Array.from(text).map((c: string) => c.charCodeAt(0));
});
const mockDecode = vi.fn(tokens => {
  console.log('mockDecode called with:', tokens);
  return String.fromCharCode(...tokens);
});
const mockFree = vi.fn();
const mockSupabaseInsert = vi.fn().mockResolvedValue({});
const mockSupabaseSelect = vi.fn().mockReturnValue({
  data: [],
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
});
const mockSupabaseFrom = vi.fn(() => ({
  insert: mockSupabaseInsert,
  select: mockSupabaseSelect,
}));
const mockSupabaseRpc = vi
  .fn()
  .mockResolvedValue({ data: 'test_openai_key', error: null });

// Define Sentry mocks inline to avoid hoisting issues
vi.mock('posthog-node', () => ({
  PostHog: vi.fn(() => {
    console.log('PostHog mock instantiated');
    return mockPostHogInstance;
  }),
}));
vi.mock('@dqbd/tiktoken', () => ({
  encoding_for_model: vi.fn(() => {
    console.log('tiktoken encoding_for_model mocked');
    return { encode: mockEncode, decode: mockDecode, free: mockFree };
  }),
}));
vi.mock('../supabase/client.js', () => ({
  default: {
    from: function () {
      return {
        insert: vi.fn().mockResolvedValue({}),
        select: vi.fn().mockReturnValue({
          data: [],
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
        }),
      };
    },
    rpc: vi.fn().mockResolvedValue({ data: 'test_openai_key', error: null }),
  },
}));
vi.mock('@sentry/node', () => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
  init: vi.fn(),
}));

// Set environment variables
process.env.OPENAI_API_KEY = 'test_openai_key';
process.env.HUME_API_KEY = 'test_hume_key';

describe('GPT4Service', () => {
  let GPT4Service;
  let service;
  let mockSentryCapture;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules(); // Reset module cache to ensure fresh mocks

    // Get the mocked Sentry functions
    const Sentry = await import('@sentry/node');
    mockSentryCapture = Sentry.captureException;

    // Now import GPT4Service and hume after the mocks
    const module = await import('../services/gpt4o.js');
    GPT4Service = module.GPT4Service;
    service = new GPT4Service(
      {
        from: mockSupabaseFrom,
        rpc: mockSupabaseRpc,
      },
      mockPostHogInstance
    );
  });

  describe('Basic functionality', () => {
    test('countTokens returns correct token count for string', () => {
      const text = 'hello world';
      const result = service.countTokens(text);
      expect(mockEncode).toHaveBeenCalledWith(text);
      expect(result).toBe(11);
      expect(mockFree).toHaveBeenCalled();
    });

    test('initialization error is captured by Sentry', async () => {
      // Create a fresh service instance that hasn't been initialized
      const freshService = new GPT4Service(
        {
          from: mockSupabaseFrom,
          rpc: mockSupabaseRpc,
        },
        mockPostHogInstance
      );

      // Mock the Supabase RPC to throw an error during initialization
      const mockRpc = vi
        .fn()
        .mockRejectedValue(new Error('Vault connection failed'));
      freshService.supabase.rpc = mockRpc;

      // Attempt to initialize and expect it to throw
      await expect(freshService.initialize()).rejects.toThrow(
        'Vault connection failed'
      );

      // Verify Sentry.captureException was called
      expect(mockSentryCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Vault connection failed',
        })
      );
    });

    test('chunkInput handles small input correctly', () => {
      const input = 'small test input';
      const chunks = service.chunkInput(input);
      expect(mockDecode).toHaveBeenCalledWith(expect.any(Array));
      expect(chunks.length).toBe(1);
      expect(chunks[0]).toBe(input);
      expect(mockFree).toHaveBeenCalled();
    });

    test('chunkInput prioritizes businessDescription and revenueModel', () => {
      const input = {
        businessDescription: 'Main business description',
        revenueModel: 'Revenue model details',
        other: 'Other information',
      };
      const chunks = service.chunkInput(input, 10000);
      const combined = chunks.join('');
      expect(mockDecode).toHaveBeenCalledWith(expect.any(Array));
      expect(combined).toContain('Main business description');
      expect(combined).toContain('Revenue model details');
      expect(combined).toContain('Other information');
      expect(mockFree).toHaveBeenCalled();
    });
  });

  describe('calculateCost', () => {
    test('logs to prompt_logs and triggers support_requests when cost exceeds $50', async () => {
      const params = {
        user_id: 'test-user',
        token_usage: 11_000_000,
        prompt_version: 'v1.0',
        prompt_type: 'business_plan',
      };
      const cost = await service.calculateCost(params);
      expect(cost).toBe(55);
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        user_id: 'test-user',
        token_usage: 11_000_000,
        cost: 55,
        prompt_version: 'v1.0',
      });
      expect(mockSupabaseInsert).toHaveBeenCalledWith({
        user_id: 'test-user',
        message: expect.stringContaining('exceeded'),
      });
      expect(mockPostHogCapture).toHaveBeenCalledWith(
        'cost_threshold_exceeded',
        { cost: 55 }
      );
    });

    test('does not trigger support_requests when cost is under $50', async () => {
      const params = {
        user_id: 'test-user',
        token_usage: 10_000_000,
        prompt_version: 'v1.0',
        prompt_type: 'social_media',
      };
      const cost = await service.calculateCost(params);
      expect(cost).toBe(50);
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(1);
    });

    test('generate method error is captured by Sentry with extra context', async () => {
      // Mock the client to throw an error
      service.client = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('OpenAI API error')),
          },
        },
      } as Record<string, unknown>;

      // Attempt to generate and expect it to throw
      await expect(
        service.generate('test prompt', { prompt_type: 'business_plan' })
      ).rejects.toThrow(
        'GPT-4o generation failed after retries: OpenAI API error'
      );

      // Verify Sentry.captureException was called with extra context
      expect(mockSentryCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'OpenAI API error',
        }),
        expect.objectContaining({
          extra: {
            service: 'gpt4o',
            attempts: expect.any(Number),
            prompt_type: 'business_plan',
            prompt_length: 11,
          },
        })
      );
    });
  });

  describe('validateResponse', () => {
    beforeEach(() => {
      service.generate = vi.fn().mockResolvedValue('no');
    });

    test('validates response with high resonance and trustDelta', async () => {
      // Use the fallback pattern that's already working in other tests
      mockHumeAnalyze.mockRejectedValueOnce(new Error('Hume API down'));
      service.generate.mockImplementationOnce(async _prompt => {
        return '{ "arousal": 0.8, "valence": 0.9 }';
      });

      const response =
        'Valid response with over 100 characters to meet completeness requirement for trust scoring purposes in a business plan context.';
      const result = await service.validateResponse(response, {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(result.isValid).toBe(true);
      expect(result.trustScore).toBeGreaterThan(0);
      expect(result.issues.length).toBe(0);
    });

    test('invalidates response with low resonance', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.2, valence: 0.2 }],
      });
      const result = await service.validateResponse(
        'Low resonance response with over 100 characters.',
        {
          promptType: 'business_plan',
          userId: 'test-user',
          trustDelta: 4.5,
        }
      );
      expect(result.isValid).toBe(false);
      expect(result.trustScore).toBeLessThan(50);
      expect(result.issues).toContain('Emotional resonance below threshold');
    });

    test('invalidates response with low trustDelta', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.8, valence: 0.9 }],
      });
      const result = await service.validateResponse(
        'Low trustDelta response with over 100 characters.',
        {
          promptType: 'business_plan',
          userId: 'test-user',
          trustDelta: 3.0,
        }
      );
      expect(result.isValid).toBe(false);
      expect(result.trustScore).toBeLessThan(50);
      expect(result.issues).toContain('TrustDelta below threshold');
    });

    test('detects toxic content', async () => {
      // First call: fallback resonance, Second call: toxicity check
      service.generate = vi
        .fn()
        .mockResolvedValueOnce('{ "arousal": 0.8, "valence": 0.9 }') // fallback resonance
        .mockResolvedValueOnce('yes'); // toxicity check
      // Force fallback by making hume.language.analyzeText throw
      service.hume = {
        language: {
          analyzeText: vi.fn().mockRejectedValue(new Error('Hume API down')),
        },
      };
      const result = await service.validateResponse(
        'Toxic content with over 100 characters for testing.',
        {
          promptType: 'business_plan',
          userId: 'test-user',
          trustDelta: 4.5,
        }
      );
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Toxic content detected');
    });

    test('detects WCAG accessibility issues', async () => {
      const htmlWithIssues =
        '<img src="test.jpg"><a href="#">click here</a><div>content with over 100 characters for testing</div>';
      const result = await service.validateResponse(htmlWithIssues, {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Missing alt text for image');
      expect(result.issues).toContain(
        'Non-descriptive link text ("click here")'
      );
      expect(result.issues).toContain('Missing semantic HTML structure');
    });

    test('falls back to GPT-4o when Hume AI fails', async () => {
      mockHumeAnalyze.mockRejectedValueOnce(new Error('Hume API down'));
      service.generate.mockImplementationOnce(async prompt => {
        console.log('Fallback mock called with:', prompt);
        return '{ "arousal": 0.75, "valence": 0.8 }';
      });
      const result = await service.validateResponse(
        'Fallback test with over 100 characters.',
        {
          promptType: 'business_plan',
          userId: 'test-user',
          trustDelta: 4.5,
        }
      );
      expect(result.resonance.arousal).toBe(0.75);
      expect(result.resonance.valence).toBe(0.8);
      expect(result.isValid).toBe(true);
    });

    test('logs validation results to comparisons table', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.8, valence: 0.9 }],
      });
      const response =
        'Logging test with over 100 characters for testing purposes.';
      await service.validateResponse(response, {
        promptType: 'business_plan',
        userId: 'test-user',
        trustDelta: 4.5,
      });
      expect(mockSupabaseInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user',
          response,
          prompt_type: 'business_plan',
        })
      );
      expect(mockPostHogCapture).toHaveBeenCalledWith(
        'gpt4o_quality',
        expect.any(Object)
      );
    });

    test('fallback error is captured by Sentry', async () => {
      // Mock both Hume and generate to fail
      mockHumeAnalyze.mockRejectedValueOnce(new Error('Hume API down'));
      service.generate = vi
        .fn()
        .mockRejectedValueOnce(new Error('Fallback failed'));

      const result = await service.validateResponse(
        'Test response with over 100 characters for testing fallback error handling.',
        {
          promptType: 'business_plan',
          userId: 'test-user',
          trustDelta: 4.5,
        }
      );

      // Verify Sentry.captureException was called for fallback error
      expect(mockSentryCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Fallback failed',
        })
      );

      // Verify the validation still completes with issues
      expect(result.issues).toContain('Hume AI and fallback failed');
    });

    test('toxicity check error is captured by Sentry', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.8, valence: 0.9 }],
      });

      // Mock generate to succeed for fallback but fail for toxicity check
      service.generate = vi
        .fn()
        .mockResolvedValueOnce('{ "arousal": 0.8, "valence": 0.9 }') // fallback resonance
        .mockRejectedValueOnce(new Error('Toxicity check failed')); // toxicity check

      const result = await service.validateResponse(
        'Test response with over 100 characters for testing toxicity error handling.',
        {
          promptType: 'business_plan',
          userId: 'test-user',
          trustDelta: 4.5,
        }
      );

      // Verify Sentry.captureException was called for toxicity error
      expect(mockSentryCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Toxicity check failed',
        })
      );

      // Verify the validation still completes with issues
      expect(result.issues).toContain('Toxicity check failed');
    });

    test('logging error is captured by Sentry', async () => {
      mockHumeAnalyze.mockResolvedValueOnce({
        predictions: [{ arousal: 0.8, valence: 0.9 }],
      });

      // Mock Supabase insert to fail for logging
      mockSupabaseInsert.mockRejectedValueOnce(
        new Error('Database logging failed')
      );

      const result = await service.validateResponse(
        'Test response with over 100 characters for testing logging error handling.',
        {
          promptType: 'business_plan',
          userId: 'test-user',
          trustDelta: 4.5,
        }
      );

      // Verify Sentry.captureException was called for logging error
      expect(mockSentryCapture).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Database logging failed',
        })
      );

      // Verify the validation still completes (logging error doesn't affect validation result)
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('trustScore');
      expect(result).toHaveProperty('issues');
    });
  });
});
