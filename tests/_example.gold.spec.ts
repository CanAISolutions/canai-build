import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Gold-standard Vitest template for CanAI.
 * Replace `sampleFunction` with your real import and adjust scenarios.
 */
// TODO: Replace with actual import when implementing real tests
// import { sampleFunction } from '../backend/Shared/Constants';

// Mock function for example purposes
const sampleFunction = (input: string): string => {
  if (!input) throw new Error('empty input');
  return input.toUpperCase();
};

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
