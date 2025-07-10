import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Gold-standard Vitest template for CanAI.
 * Replace `sampleFunction` with your real import and adjust scenarios.
 */
import { sampleFunction } from '../backend/api/src/Shared/Constants';

// 🟢 Arrange – shared setup
let input: string;

beforeEach(() => {
  vi.resetModules();
  input = 'hello world';
});

// 📂 Module: sampleFunction
describe('sampleFunction', () => {
  // ➡️ Scenario: normal input
  it('returns a capitalised string – GIVEN normal input WHEN called THEN returns capitalised', () => {
    // 🟢 Act
    const result = sampleFunction(input);

    // 🔵 Assert
    expect(result).toBe('HELLO WORLD');
  });

  // ➡️ Scenario: edge-case – empty input
  it('throws on empty input – GIVEN empty string WHEN called THEN throws specific error', () => {
    // 🟢 Act + 🔵 Assert
    expect(() => sampleFunction('')).toThrowError(/empty input/i);
  });
});
