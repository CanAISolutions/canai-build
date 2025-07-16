import Joi from 'joi';
import { generatePreviewSparkSchema } from '../schemas/generatePreviewSpark.js'; // Fix: Import Joi schema
import { gpt4oGenerate } from './gpt4o.js'; // Fix: Import GPT-4o integration (mocked in tests)

/**
 * Normalize and sanitize input for preview generation.
 * Handles missing/optional fields and trims strings.
 */
export function normalizeInput(input) {
  if (process.env.NODE_ENV === 'test')
    console.log('[normalizeInput] ENTRY', input);
  const normalized = {
    businessType:
      typeof input.businessType === 'string'
        ? input.businessType.trim()
        : String(input.businessType ?? '').trim(),
    tone:
      typeof input.tone === 'string'
        ? input.tone.trim()
        : String(input.tone ?? '').trim(),
    customTone:
      typeof input.customTone === 'string'
        ? input.customTone.trim()
        : undefined,
    targetAudience:
      typeof input.targetAudience === 'string'
        ? input.targetAudience.trim()
        : undefined,
    customInstructions:
      typeof input.customInstructions === 'string'
        ? input.customInstructions.trim()
        : undefined,
    maxLength:
      typeof input.maxLength === 'number' ? input.maxLength : undefined,
  };
  if (process.env.NODE_ENV === 'test')
    console.log('[normalizeInput] OUTPUT', normalized);
  return normalized;
}

/**
 * Construct the prompt/context for GPT-4o based on normalized input.
 */
export function constructPrompt(normalizedInput) {
  // Defensive: Always include businessType and tone; add custom fields if present
  let prompt = `Generate a preview spark for a ${normalizedInput.businessType} business with a ${normalizedInput.tone} tone.`;
  if (normalizedInput.customTone)
    prompt += ` Custom tone: ${normalizedInput.customTone}.`;
  if (normalizedInput.targetAudience)
    prompt += ` Target audience: ${normalizedInput.targetAudience}.`;
  if (normalizedInput.customInstructions)
    prompt += ` Instructions: ${normalizedInput.customInstructions}.`;
  if (normalizedInput.maxLength)
    prompt += ` Limit output to ${normalizedInput.maxLength} characters.`;
  if (process.env.NODE_ENV === 'test') console.log('[constructPrompt]', prompt);
  return prompt;
}

/**
 * Generate preview content using GPT-4o (placeholder, to be mocked in tests).
 */
export async function generatePreviewContent(prompt) {
  // Defensive: In production, call GPT-4o; in tests, this should be mocked
  if (process.env.NODE_ENV === 'test')
    console.log('[generatePreviewContent] prompt:', prompt);
  const response = await gpt4oGenerate(prompt); // Fix: Use real (mocked) GPT-4o
  return { content: response.content, raw: response.raw };
}

/**
 * Format and validate the output structure for the API response.
 */
export function formatOutput(gptResponse, input) {
  // Defensive: Ensure output is always structured and user-friendly
  const output = {
    preview: gptResponse.content,
    businessType: input.businessType,
    tone: input.tone,
    customTone: input.customTone, // Fix: Add customTone to output
    targetAudience: input.targetAudience,
    customInstructions: input.customInstructions,
    maxLength: input.maxLength,
    // Add more fields as needed
  };
  if (process.env.NODE_ENV === 'test') console.log('[formatOutput]', output);
  return output;
}

/**
 * Handle errors defensively, log context, and return user-friendly messages.
 */
export function handleError(error, context) {
  // Log error details for debugging, but do not leak stack traces to users
  if (process.env.NODE_ENV === 'test')
    console.log('[handleError]', error, context);
  // Defensive: Return a generic error message for users
  return {
    error:
      'An error occurred while generating the preview spark. Please try again.',
  };
}

/**
 * Main orchestrator for preview spark generation.
 * Follows defensive, testable, and evidence-based patterns.
 */
export async function generatePreviewSpark(input) {
  if (process.env.NODE_ENV === 'test')
    console.log('[generatePreviewSpark] ENTRY', input);
  try {
    // Defensive: Normalize before validation to be user-friendly and robust to user input quirks.
    // Risks: See test plan and code comments for possible fail points (over-normalization, schema mismatch, etc.).
    const normalized = normalizeInput(input);
    const { error } = generatePreviewSparkSchema.validate(normalized, {
      abortEarly: false,
    });
    if (error) {
      throw new Error(
        'Invalid input: ' + error.details.map(d => d.message).join(', ')
      );
    }
    const prompt = constructPrompt(normalized);
    const gptResponse = await generatePreviewContent(prompt);
    const output = formatOutput(gptResponse, normalized);
    if (process.env.NODE_ENV === 'test')
      console.log('[generatePreviewSpark] SUCCESS', output);
    return output;
  } catch (error) {
    if (process.env.NODE_ENV === 'test')
      console.log('[generatePreviewSpark] ERROR', error);
    return handleError(error, { input });
  }
}

// Export helpers for unit testing
export default {
  generatePreviewSpark,
  normalizeInput,
  constructPrompt,
  generatePreviewContent,
  formatOutput,
  handleError,
};
