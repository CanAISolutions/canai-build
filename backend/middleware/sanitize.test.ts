// Vitest skeleton for sanitize.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sanitize, sanitizeWithSchema, ValidationError } from './sanitize.js';

// 🟢 Arrange – shared setup
beforeEach(() => {
  vi.resetModules(); // Ensure clean state between tests
});

describe('sanitize', () => {
  it('should strip all HTML in plain mode', () => {
    // Arrange
    const input =
      '<b>Safe</b><script>evil()</script><img src=x onerror=alert(1)>';
    // Act
    const result = sanitize(input, { mode: 'plain' });
    // Assert
    expect(result).toBe('Safe');
  });

  it('should allow safe HTML in rich mode', () => {
    // Arrange
    const input =
      '<b>Safe</b><script>evil()</script><img src=x onerror=alert(1)>';
    // Act
    const result = sanitize(input, { mode: 'rich' });
    // Assert
    expect(result).toContain('<b>Safe</b>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('<img');
  });

  it('should handle complex nested objects/arrays', () => {
    // Arrange
    const input = {
      a: '<b>Safe</b><img src=x onerror=evil()>',
      b: [
        '<script>bad()</script>',
        { c: '<i>ok</i>', d: '<svg/onload=evil()>' },
      ],
      c: { d: '<svg>bad</svg>', e: 'plain' },
    };
    // Act
    const result = sanitize(input, { mode: 'rich' }) as {
      a: string;
      b: [string, { c: string; d: string }];
      c: { d: string; e: string };
    };
    // Assert
    expect(result.a).toContain('<b>Safe</b>');
    expect(result.a).not.toContain('<img');
    expect(result.b[0]).not.toContain('<script>');
    expect(result.b[1].c).toContain('<i>ok</i>');
    expect(result.c.d).not.toContain('<svg');
    expect(result.c.e).toBe('plain');
  });

  // TODO: Edge cases - empty, long, unicode, malformed
  it('should handle edge cases (empty, long, unicode, malformed)', () => {
    // Arrange
    const long = 'a'.repeat(10000) + '<script>bad()</script>';
    const unicode = '𝒯𝑒𝓈𝓉 <b>𝓍𝓈𝓈</b>\u200B';
    // Act
    const empty = sanitize('', { mode: 'plain' });
    const longResult = sanitize(long, { mode: 'plain' });
    const unicodeResult = sanitize(unicode, { mode: 'rich' });
    // Assert
    expect(empty).toBe('');
    expect(longResult).not.toContain('<script>');
    expect(unicodeResult).toContain('<b>𝓍𝓈𝓈</b>');
    expect(unicodeResult).not.toContain('\u200B');
  });

  // TODO: Attack vectors - script, SVG, JS URLs, polyglots
  it('should neutralize all major XSS attack vectors', () => {
    // Arrange
    const vectors = [
      '<img src=x onerror=alert(1)>',
      '<svg/onload=evil()>',
      '<a href="javascript:alert(1)">bad</a>',
      '<math><mi//xlink:href="data:x,<script>alert(1)</script>"></math>',
      '<div style="background:url(javascript:evil())">',
      '<iframe src="http://evil.com"></iframe>',
    ];
    // Act
    const results = vectors.map(v => sanitize(v, { mode: 'rich' }));
    // Assert
    results.forEach(r => {
      expect(r).not.toMatch(
        /onerror|onload|javascript:|<script|<svg|<iframe|xlink:href|style=/i
      );
    });
  });

  // TODO: Logging - logs all sanitization events
  it('should log all sanitization events (success/failure)', () => {
    // This test expects sanitize() to log via logDebug. Logging is now instrumented in sanitize.js.
    // Arrange
    const logged: string[] = [];
    const origLog = console.log;
    const origDebug = console.debug;
    console.log = (...args) => logged.push(args.join(' '));
    console.debug = (...args) => logged.push(args.join(' '));
    const input = '<b>log</b><script>bad()</script>';
    // Act
    sanitize(input, { mode: 'rich' });
    // Assert
    expect(logged.join(' ')).toMatch(/sanitize/i);
    // Cleanup
    console.log = origLog;
    console.debug = origDebug;
  });
});

describe('sanitizeWithSchema', () => {
  it('should recursively sanitize deeply nested objects/arrays with mixed plain/rich/skip fields', () => {
    const input = {
      a: '<b>Safe</b><img src=x onerror=evil()>',
      b: [
        '<script>bad()</script>',
        { c: '<i>ok</i>', d: '<svg/onload=evil()>' },
      ],
      e: { f: 'plain', g: '<b>rich</b>' },
      h: 'should skip',
    };
    const schema = {
      a: { sanitize: true, mode: 'rich' as const },
      b: {
        sanitize: true,
        schema: {
          0: { sanitize: true, mode: 'plain' as const },
          1: {
            sanitize: true,
            schema: {
              c: { sanitize: true, mode: 'rich' as const },
              d: { sanitize: true, mode: 'plain' as const },
            },
          },
        },
      },
      e: {
        sanitize: true,
        schema: {
          f: { sanitize: true, mode: 'plain' as const },
          g: { sanitize: true, mode: 'rich' as const },
        },
      },
      h: { sanitize: false },
    };
    const result = sanitizeWithSchema(input, schema) as {
      a: string;
      b: [string, { c: string; d: string }];
      e: { f: string; g: string };
      h: string;
    };
    expect(result.a).toContain('<b>Safe</b>');
    expect(result.a).not.toContain('<img');
    expect(result.b[0]).toBe('');
    expect(result.b[1].c).toContain('<i>ok</i>');
    expect(result.b[1].d).toBe('evil()');
    expect(result.e.f).toBe('plain');
    expect(result.e.g).toContain('<b>rich</b>');
    expect(result.h).toBe('should skip');
  });

  it('should throw ValidationError for invalid schema', () => {
    const input = { a: 'test' };
    const schema = { a: { sanitize: true, mode: 'invalid' as never } };
    expect(() => sanitizeWithSchema(input, schema)).toThrow(ValidationError);
  });

  it('should skip fields not in schema', () => {
    const input = { b: 'test' }; // Field 'a' not in schema
    const schema = { a: { sanitize: true } };
    const result = sanitizeWithSchema(input, schema) as {
      b: string;
      a?: undefined;
    };
    expect(result.b).toBe('test'); // Should preserve field not in schema
    expect(result.a).toBeUndefined(); // Field 'a' should not be present
  });

  it('should handle arrays with mixed content types', () => {
    const input = {
      a: '<b>Safe</b><img src=x onerror=evil()>',
      b: [
        '<script>bad()</script>',
        { c: '<i>ok</i>', d: '<svg/onload=evil()>' },
      ],
      c: '<script>bad()</script>',
    };
    const schema = {
      a: { sanitize: true, mode: 'rich' as const },
      b: {
        sanitize: true,
        schema: {
          0: { sanitize: true, mode: 'plain' as const },
          1: {
            sanitize: true,
            schema: {
              c: { sanitize: true, mode: 'rich' as const },
              d: { sanitize: true, mode: 'plain' as const },
            },
          },
        },
      },
      c: { sanitize: true, mode: 'plain' as const },
    };
    const result = sanitizeWithSchema(input, schema) as {
      a: string;
      b: [string, { c: string; d: string }];
      c: string;
    };
    expect(result.a).toContain('<b>Safe</b>');
    expect(result.b[1].c).toContain('<i>ok</i>');
    expect(result.b[1].d).not.toMatch(/<svg/i);
    expect(result.c).not.toContain('<script>');
  });

  it('should handle nested objects with complex schemas', () => {
    const input = {
      a: '<img src=x onerror=evil()>',
      b: {
        c: '<svg/onload=evil()>',
        d: 'javascript:evil()',
      },
    };
    const schema = {
      a: { sanitize: true, mode: 'rich' as const },
      b: {
        sanitize: true,
        schema: {
          c: { sanitize: true, mode: 'rich' as const },
          d: { sanitize: true, mode: 'plain' as const },
        },
      },
    };
    const result = sanitizeWithSchema(input, schema) as {
      a: string;
      b: { c: string; d: string };
    };
    expect(result.a).not.toMatch(/onerror|<img/i);
    expect(result.b.c).not.toMatch(/<svg/i);
    expect(result.b.d).not.toMatch(/javascript:/i);
  });

  it('should throw ValidationError for invalid nested schema', () => {
    const input = { a: { b: 'test' } };
    const schema = {
      a: {
        sanitize: true,
        schema: {
          b: { sanitize: true, mode: 'invalid' as never },
        },
      },
    };
    expect(() => sanitizeWithSchema(input, schema)).toThrow(ValidationError);
  });
});
