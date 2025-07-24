import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as previewGen from '../services/previewGenerator';
import { gpt4oGenerate } from '../services/gpt4o'; // Fix: Import the mocked gpt4oGenerate

// --- Defensive: Mock all external dependencies at the top ---
// (No real GPT-4o, Supabase, or analytics calls should ever occur in tests)
vi.mock('../services/gpt4o.js', () => ({
  gpt4oGenerate: vi.fn().mockResolvedValue({
    content: 'Mocked GPT-4o content',
    raw: 'Mocked raw output',
  }),
}));
// Add more mocks as needed for analytics, Supabase, etc.

// --- Defensive: Reset mocks and state before/after each test ---
beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  // Add any additional cleanup if needed
});

// --- Test Data ---
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

// --- Tests ---
describe('previewGenerator Service (Defensive, Logging-First)', () => {
  it('should generate preview with all valid fields', async () => {
    const result = await previewGen.generatePreviewSpark(validInput);
    expect(result).toHaveProperty('preview');
    expect(result.businessType).toBe(validInput.businessType);
    expect(result.tone).toBe(validInput.tone);
    expect(result.targetAudience).toBe(validInput.targetAudience);
    expect(result.customInstructions).toBe(validInput.customInstructions);
    expect(result.maxLength).toBe(validInput.maxLength);
    // Evidence: log output for traceability (remove before merge)
    if (process.env.NODE_ENV === 'test') console.log('[test] result:', result);
  });

  it('should handle minimal valid input', async () => {
    const result = await previewGen.generatePreviewSpark(minimalInput);
    expect(result).toHaveProperty('preview');
    expect(result.businessType).toBe(minimalInput.businessType);
    expect(result.tone).toBe(minimalInput.tone);
    // Evidence: log output for traceability (remove before merge)
    if (process.env.NODE_ENV === 'test') console.log('[test] result:', result);
  });

  it('should handle missing optional fields gracefully', async () => {
    const input = { businessType: 'service', tone: 'playful' };
    const result = await previewGen.generatePreviewSpark(input);
    expect(result).toHaveProperty('preview');
    expect(result.targetAudience).toBeUndefined();
    expect(result.customInstructions).toBeUndefined();
    expect(result.maxLength).toBeUndefined();
  });

  it('should return user-friendly error on malformed input', async () => {
    const input = { businessType: '', tone: '' }; // Invalid
    const result = await previewGen.generatePreviewSpark(input);
    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/An error occurred/i);
    // Defensive: no stack trace or sensitive info in error
    expect(result.error).not.toMatch(/stack|trace/i);
  });

  it('should handle simulated GPT-4o failure defensively', async () => {
    // Simulate error in generatePreviewContent
    gpt4oGenerate.mockRejectedValueOnce(new Error('GPT-4o down'));
    const result = await previewGen.generatePreviewSpark(validInput);
    expect(result).toHaveProperty('error');
    expect(result.error).toMatch(/An error occurred/i);
  });

  it('should log at each major step (logging-first, evidence-based)', async () => {
    // Spy on console.log
    const logSpy = vi.spyOn(console, 'log');
    await previewGen.generatePreviewSpark(validInput);
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[normalizeInput\]/),
      expect.any(Object)
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[constructPrompt\]/),
      expect.any(String)
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[generatePreviewContent\]/),
      expect.anything()
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringMatching(/\[formatOutput\]/),
      expect.any(Object)
    );
    logSpy.mockRestore();
  });

  // --- Edge Cases ---
  it('should handle maxLength at boundary values', async () => {
    const input = { ...validInput, maxLength: 50 };
    const result = await previewGen.generatePreviewSpark(input);
    expect(result.maxLength).toBe(50);
    const input2 = { ...validInput, maxLength: 2000 };
    const result2 = await previewGen.generatePreviewSpark(input2);
    expect(result2.maxLength).toBe(2000);
  });

  it('should trim all string fields in normalization', async () => {
    const input = {
      businessType: ' tech ',
      tone: ' bold ',
      customTone: ' edgy ',
      targetAudience: ' startups ',
      customInstructions: ' Focus on innovation. ',
      maxLength: 150,
    };
    const result = await previewGen.generatePreviewSpark(input);
    expect(result.businessType).toBe('tech');
    expect(result.tone).toBe('bold');
    expect(result.customTone).toBe('edgy');
    expect(result.targetAudience).toBe('startups');
    expect(result.customInstructions).toBe('Focus on innovation.');
  });

  // --- Defensive: Lessons learned ---
  // - All externals are mocked
  // - Logging-first for traceability
  // - No real API calls
  // - User-friendly errors only
  // - Test state isolation
  // - Remove all temporary logs before merge
});
