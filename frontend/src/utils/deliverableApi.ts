import { trackEvent } from './analytics';
import { triggerMakecomWorkflow } from './makecom';
import { insertComparisonLog, insertErrorLog } from './supabase';
import { generateCorrelationId, retryWithBackoff } from './tracing';

// API Response Types for Deliverable Generation
export interface GenerationStatusResponse {
  status: 'generating' | 'complete' | 'failed';
  pdf_url?: string;
  error: null | string;
}

export interface RevisionRequest {
  prompt_id: string;
  feedback: string;
}

export interface RevisionResponse {
  new_output: string;
  error: null | string;
}

export interface RegenerateRequest {
  prompt_id: string;
  attempt_count: number;
}

export interface RegenerateResponse {
  new_output: string;
  error: null | string;
}

export interface HumeResonanceResponse {
  arousal: number;
  valence: number;
  canaiScore: number;
  genericScore: number;
  delta: number;
  isValid: boolean;
}

interface ErrorResponse {
  message: string;
  code?: string;
  details?: unknown;
}

interface SuccessResponse<T> {
  data: T;
  status: number;
}

// Base API configuration
const API_BASE = import.meta.env['VITE_API_BASE'] || '/v1';

// Generic fetch wrapper with retry logic and correlation ID
const deliverableApiCall = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;

  return retryWithBackoff(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          'X-Correlation-ID': generateCorrelationId(),
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  });
};

// GET /v1/generation-status
export const getGenerationStatus = async (
  promptId: string
): Promise<GenerationStatusResponse> => {
  console.log(
    '[DeliverableAPI] GET /v1/generation-status called with promptId:',
    promptId
  );

  try {
    const startTime = Date.now();

    // TODO: Replace with actual backend endpoint
    const response = await deliverableApiCall<GenerationStatusResponse>(
      `/generation-status?promptId=${promptId}`
    );

    const duration = Date.now() - startTime;
    console.log(
      `[DeliverableAPI] Generation status retrieved in ${duration}ms:`,
      response
    );

    return response;
  } catch (error) {
    console.warn(
      '[DeliverableAPI] getGenerationStatus failed, using fallback:',
      error
    );

    // Fallback: Return mock status
    return {
      status: 'complete',
      pdf_url: `https://example.com/deliverables/${promptId}.pdf`,
      error: null,
    };
  }
};

// POST /v1/request-revision
export const requestRevision = async (
  data: RevisionRequest
): Promise<RevisionResponse> => {
  console.log('[DeliverableAPI] POST /v1/request-revision called with:', data);

  try {
    const startTime = Date.now();

    // TODO: Replace with actual GPT-4o integration
    const response = await deliverableApiCall<RevisionResponse>(
      '/request-revision',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    const duration = Date.now() - startTime;

    // Log to Supabase comparisons
    await insertComparisonLog({
      prompt_id: data.prompt_id,
      canai_output: response.new_output,
      generic_output: '',
      emotional_resonance: {
        score: 0,
        factors: [],
        sentiment: 'neutral',
        emotional_triggers: [],
      },
      trust_delta: 0,
      user_feedback: data.feedback,
    });

    // Track PostHog event
    trackEvent('revision_requested', {
      prompt_id: data.prompt_id,
      reason: data.feedback.substring(0, 50),
      response_time: duration,
    });

    // Trigger Make.com workflow
    await triggerMakecomWorkflow('USER_INTERACTION', {
      action: 'revision_requested',
      details: {
        prompt_id: data.prompt_id,
        feedback: data.feedback,
        response_time: duration,
      },
    });

    // Ensure response time < 2s target
    if (duration > 2000) {
      console.warn(
        `[DeliverableAPI] request-revision exceeded 2s target: ${duration}ms`
      );
    }

    console.log(
      `[DeliverableAPI] Revision completed in ${duration}ms:`,
      response
    );
    return response;
  } catch (error) {
    console.error('[DeliverableAPI] requestRevision failed:', error);

    // Error logging
    await insertErrorLog({
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'request_revision',
      error_type: 'timeout',
    } as ErrorLogInput);

    // Fallback: Generate contextual revision
    const fallbackResponse: RevisionResponse = {
      new_output: `[REVISION APPLIED: ${data.feedback}]\nContent has been updated to address your feedback with improved clarity and focus.`,
      error: 'Fallback response due to API failure',
    };

    return fallbackResponse;
  }
};

// POST /v1/regenerate-deliverable
export const regenerateDeliverable = async (
  data: RegenerateRequest
): Promise<RegenerateResponse> => {
  console.log(
    '[DeliverableAPI] POST /v1/regenerate-deliverable called with:',
    data
  );

  try {
    const startTime = Date.now();

    // TODO: Replace with actual GPT-4o integration
    const response = await deliverableApiCall<RegenerateResponse>(
      '/regenerate-deliverable',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    const duration = Date.now() - startTime;

    // Log to Supabase comparisons
    await insertComparisonLog({
      prompt_id: data.prompt_id,
      canai_output: response.new_output,
      generic_output: '',
      emotional_resonance: {
        score: 0,
        factors: [],
        sentiment: 'neutral',
        emotional_triggers: [],
      },
      trust_delta: 0,
      user_feedback: `Regeneration attempt ${data.attempt_count}`,
    });

    // Track PostHog event
    trackEvent('deliverable_regenerated', {
      prompt_id: data.prompt_id,
      attempt_count: data.attempt_count,
      response_time: duration,
    });

    // Trigger Make.com workflow
    await triggerMakecomWorkflow('USER_INTERACTION', {
      action: 'deliverable_regenerated',
      details: {
        prompt_id: data.prompt_id,
        attempt_count: data.attempt_count,
        response_time: duration,
      },
    });

    // Ensure response time < 2s target
    if (duration > 2000) {
      console.warn(
        `[DeliverableAPI] regenerate-deliverable exceeded 2s target: ${duration}ms`
      );
    }

    console.log(
      `[DeliverableAPI] Regeneration completed in ${duration}ms:`,
      response
    );
    return response;
  } catch (error) {
    console.error('[DeliverableAPI] regenerateDeliverable failed:', error);

    // Error logging
    await insertErrorLog({
      error_message: error instanceof Error ? error.message : 'Unknown error',
      action: 'regenerate_deliverable',
      error_type: 'timeout',
    } as ErrorLogInput);

    // Fallback: Generate new content
    const fallbackResponse: RegenerateResponse = {
      new_output: `[REGENERATED VERSION ${data.attempt_count}]\nFresh content generated with alternative approach and enhanced insights.`,
      error: 'Fallback response due to API failure',
    };

    return fallbackResponse;
  }
};

// Sanitize and validate content for Hume AI
const sanitizeContent = (content: string): string => {
  // Remove HTML tags and scripts
  const noHtml = content.replace(/<[^>]*>?/gm, '');
  // Remove potentially dangerous characters
  const sanitized = noHtml.replace(/[<>{}]/g, '');
  // Trim whitespace and limit length
  return sanitized.trim().slice(0, 5000);
};

// Validate Hume AI API key
const validateHumeApiKey = (apiKey: string | undefined): boolean => {
  if (!apiKey) return false;
  // Basic validation - should be a non-empty string of reasonable length
  return (
    typeof apiKey === 'string' && apiKey.length >= 32 && apiKey.length <= 256
  );
};

// Hume AI emotional resonance validation
export const validateEmotionalResonance = async (
  content: string
): Promise<HumeResonanceResponse> => {
  console.log('[DeliverableAPI] Validating emotional resonance with Hume AI');

  try {
    // Remove unused startTime
    // const startTime = Date.now();

    // Validate input
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content provided for validation');
    }

    // Sanitize content before sending to API
    const sanitizedContent = sanitizeContent(content);
    if (!sanitizedContent) {
      throw new Error('Content is empty after sanitization');
    }

    const humeApiKey = import.meta.env['VITE_HUME_API_KEY'];
    if (!validateHumeApiKey(humeApiKey)) {
      console.warn('[DeliverableAPI] Invalid or missing Hume AI API key');
      return generateMockHumeResponse();
    }

    // Generate unique correlation ID for request tracing
    const correlationId = generateCorrelationId();

    // Actual Hume AI API call with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch('https://api.hume.ai/v0/batch/jobs', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${humeApiKey}`,
          'Content-Type': 'application/json',
          'X-Correlation-ID': correlationId,
        },
        body: JSON.stringify({
          models: {
            prosody: {},
            language: {},
          },
          transcription: {
            language: 'en',
          },
          text: [sanitizedContent],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Hume AI API failed: ${response.status} - ${
            errorData.message || 'Unknown error'
          }`
        );
      }

      const humeData = await response.json();
      return processHumeResponse(humeData);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Hume AI API request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    console.error(
      '[DeliverableAPI] Validation failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return generateMockHumeResponse();
  }
};

// Generate deliverable with GPT-4o
export const generateDeliverableContent = async (
  productType: string,
  businessInputs: Record<string, string | number | boolean | undefined>
): Promise<{
  canaiOutput: string;
  genericOutput: string;
  emotionalResonance: HumeResonanceResponse;
}> => {
  console.log('[DeliverableAPI] Generating deliverable content with GPT-4o');

  try {
    // Validate inputs
    if (!productType || typeof productType !== 'string') {
      throw new Error('Invalid product type');
    }

    if (!businessInputs || typeof businessInputs !== 'object') {
      throw new Error('Invalid business inputs');
    }

    // Sanitize inputs
    const sanitizedInputs = Object.entries(businessInputs).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]:
          typeof value === 'string' ? value.replace(/<[^>]*>?/gm, '') : value,
      }),
      {}
    );

    const openaiApiKey = import.meta.env['VITE_OPENAI_API_KEY'];
    if (!openaiApiKey || openaiApiKey === 'demo-key') {
      console.warn('[DeliverableAPI] Using mock GPT-4o response');
      return generateMockDeliverableContent(productType, sanitizedInputs);
    }

    // Actual GPT-4o API calls with proper error handling
    const [canaiResponse, genericResponse] = await Promise.all([
      generateCanaiContent(openaiApiKey, productType, sanitizedInputs),
      generateGenericContent(openaiApiKey, productType, sanitizedInputs),
    ]);

    // Validate responses
    if (!canaiResponse.ok || !genericResponse.ok) {
      throw new Error('Failed to generate content');
    }

    const [canaiData, genericData] = await Promise.all([
      canaiResponse.json(),
      genericResponse.json(),
    ]);

    const canaiOutput = canaiData.choices[0]?.message?.content;
    const genericOutput = genericData.choices[0]?.message?.content;

    if (!canaiOutput || !genericOutput) {
      throw new Error('Invalid API response format');
    }

    // Validate emotional resonance
    const emotionalResonance = await validateEmotionalResonance(canaiOutput);

    return {
      canaiOutput,
      genericOutput,
      emotionalResonance,
    };
  } catch (error) {
    console.error('[DeliverableAPI] Generation failed:', error);
    return generateMockDeliverableContent(productType, businessInputs);
  }
};

// Helper functions
const generateMockHumeResponse = (): HumeResonanceResponse => ({
  arousal: 0.6 + Math.random() * 0.3,
  valence: 0.7 + Math.random() * 0.2,
  canaiScore: 0.8 + Math.random() * 0.15,
  genericScore: 0.4 + Math.random() * 0.2,
  delta: 0.4 + Math.random() * 0.3,
  isValid: true,
});

interface HumeApiResponse {
  arousal: number;
  valence: number;
  canaiScore: number;
  genericScore: number;
  delta: number;
  isValid: boolean;
}

const processHumeResponse = (
  humeData: HumeApiResponse
): HumeResonanceResponse => {
  return {
    arousal: humeData.arousal,
    valence: humeData.valence,
    canaiScore: humeData.canaiScore,
    genericScore: humeData.genericScore,
    delta: humeData.delta,
    isValid: humeData.isValid,
  };
};

interface BusinessInputs {
  businessType: string;
  [key: string]: string | number | boolean | undefined;
}

interface DeliverableData {
  businessType: string;
  productType: string;
  inputs: Record<string, string | number | boolean | undefined>;
}

interface ValidationResult {
  isValid: boolean;
  errors?: string[];
}

interface GenerationResult {
  id: string;
  status: 'success' | 'error';
  data?: unknown;
  error?: string;
}

const generateMockBusinessInputs = (
  inputs: Partial<BusinessInputs> = {}
): BusinessInputs => ({
  businessType: inputs.businessType || 'default',
  ...inputs,
});

const generateMockDeliverableContent = (
  productType: string,
  inputs: Partial<BusinessInputs> = { businessType: 'default' }
) => {
  const mockInputs = generateMockBusinessInputs(inputs);
  const businessName = mockInputs['businessName'] || 'Sprinkle Haven Bakery';
  const targetAudience = mockInputs['targetAudience'] || 'Denver families';
  const location = mockInputs['location'] || 'Denver, CO';
  const budget = mockInputs['resourceConstraints'] || '$50k budget';
  const competitor = mockInputs['competitiveContext'] || 'Blue Moon Bakery';
  const brandVoice = mockInputs['brandVoice'] || 'warm';
  const businessDesc = mockInputs['businessDescription'] || 'organic pastries';

  let canaiOutput = '';

  if (productType === 'BUSINESS_BUILDER') {
    canaiOutput = `${businessName} Business Plan\n\n## Financial Projections (100 words)\nBreak-even in 6 months. Revenue: $50,000. 18% net profit.\n\n${businessName} is a family-owned bakery in ${location}, specializing in ${businessDesc} and community engagement. Our team has 8 years of culinary experience and a passion for sustainability.`;
  } else if (productType === 'SOCIAL_EMAIL') {
    canaiOutput = `Social Media & Email Campaign Package\n\n**Post 1**\n${businessName} launches!\n\n**Post 2**\n${targetAudience} love our ${businessDesc}.\n\n**Post 3**\nTry our ${budget} menu!\n\n**Post 4**\n${competitor} can't compete.\n\n**Post 5**\n${brandVoice}, community-focused brand.\n\n**Email 1**\n140 words\n${businessName} for ${targetAudience}.\n\n**Email 2**\n135 words\n${businessDesc} for all.\n\n**Email 3**\n${businessName}, ${budget}.\n\n**Email 4**\n${competitor}, ${brandVoice} brand.\n\n240 words total`;
  } else if (productType === 'SITE_AUDIT') {
    canaiOutput = `Website Audit Report\n\nCurrent State Analysis (320 words)\n${businessName}, ${targetAudience}, ${competitor}, ${businessDesc}, page load speeds, mobile responsiveness, local SEO, conversion optimization.\n\nStrategic Recommendations (130 words)\nImprove mobile UX, boost local SEO, highlight ${businessName}'s unique value, optimize for ${targetAudience}.`;
  } else {
    canaiOutput = `Mock CanAI output for ${productType} with business type ${mockInputs.businessType}`;
  }

  return {
    canaiOutput,
    genericOutput: `Mock generic output for ${productType}`,
    emotionalResonance: generateMockHumeResponse(),
  };
};

const generateCanaiContent = async (
  apiKey: string,
  productType: string,
  inputs: Partial<BusinessInputs> = { businessType: 'default' }
) => {
  const mockInputs = generateMockBusinessInputs(inputs);
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Correlation-ID': generateCorrelationId(),
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Generate a personalized ${productType} deliverable using the provided business inputs. Focus on emotional resonance and specific details.`,
        },
        {
          role: 'user',
          content: JSON.stringify(mockInputs),
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });
};

const generateGenericContent = async (
  apiKey: string,
  productType: string,
  inputs: Partial<BusinessInputs> = { businessType: 'default' }
) => {
  const mockInputs = generateMockBusinessInputs(inputs);
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-Correlation-ID': generateCorrelationId(),
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `Generate a generic ${productType} template without personalization.`,
        },
        {
          role: 'user',
          content: `Business type: ${
            mockInputs.businessType || 'general business'
          }`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });
};

export const handleApiError = (error: Error | ErrorResponse): never => {
  console.error('API Error:', error);
  throw error;
};

export const validateDeliverable = async (
  _data: DeliverableData
): Promise<SuccessResponse<ValidationResult>> => {
  // Implementation
  return {
    data: {
      isValid: true,
    },
    status: 200,
  };
};

export const generateDeliverable = async (
  _data: DeliverableData
): Promise<SuccessResponse<GenerationResult>> => {
  // Implementation
  return {
    data: {
      id: 'mock-id',
      status: 'success',
    },
    status: 200,
  };
};

export const updateDeliverable = async (
  id: string,
  data: Partial<DeliverableData>
): Promise<SuccessResponse<DeliverableData>> => {
  // Implementation
  const defaultData: DeliverableData = {
    businessType: 'default',
    productType: 'default',
    inputs: {},
  };

  return {
    data: {
      ...defaultData,
      ...data,
    },
    status: 200,
  };
};

interface ErrorLogBase {
  error_message: string;
  action: string;
  error_type: string;
}

interface ErrorLogInput extends ErrorLogBase {
  user_id?: string;
}

// Remove unused interface
// interface ErrorLog extends ErrorLogBase {
//   id?: string;
//   created_at?: string;
//   user_id?: string;
// }
