// Vitest skeleton for sanitize.js
import { describe, it, expect } from 'vitest';
import { sanitize, sanitizeWithSchema, ValidationError } from './sanitize.js';

// Arrange-Act-Assert (AAA) pattern

describe('sanitize.js', () => {
  // TODO: Unit - plain text mode strips all HTML
  it('should strip all HTML in plain text mode', () => {
    // Arrange
    const input = '<div>Hello <b>world</b><script>alert(1)</script></div>';
    // Act
    const result = sanitize(input, { mode: 'plain' });
    // Assert
    expect(result).toBe('Hello world');
  });

  // TODO: Unit - rich text mode allows minimal safe tags
  it('should allow minimal safe tags in rich text mode', () => {
    // Arrange
    const input =
      '<b>Bold</b> <i>Italic</i> <script>alert(1)</script> <a href="http://x.com" onclick="evil()">link</a>';
    // Act
    const result = sanitize(input, { mode: 'rich' });
    // Assert
    expect(result).toContain('<b>Bold</b>');
    expect(result).toContain('<i>Italic</i>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('<a href="http://x.com"');
    expect(result).not.toContain('onclick');
  });

  // TODO: Recursion - nested objects/arrays
  it('should recursively sanitize nested objects and arrays', () => {
    // Arrange
    const input = {
      a: '<b>Safe</b><img src=x onerror=evil()>',
      b: ['<script>bad()</script>', '<i>ok</i>'],
      c: { d: '<svg/onload=evil()>', e: 'plain' },
    };
    // Act
    const result = sanitize(input, { mode: 'rich' });
    // Assert
    expect(result.a).toContain('<b>Safe</b>');
    expect(result.a).not.toContain('<img');
    expect(result.b[0]).not.toContain('<script>');
    expect(result.b[1]).toContain('<i>ok</i>');
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
      a: { sanitize: true, mode: 'rich' },
      b: {
        sanitize: true,
        schema: {
          0: { sanitize: true, mode: 'plain' },
          1: {
            sanitize: true,
            schema: {
              c: { sanitize: true, mode: 'rich' },
              d: { sanitize: true, mode: 'plain' },
            },
          },
        },
      },
      e: {
        sanitize: true,
        schema: {
          f: { sanitize: true, mode: 'plain' },
          g: { sanitize: true, mode: 'rich' },
        },
      },
      h: { sanitize: false },
    };
    const result = sanitizeWithSchema(input, schema);
    expect((result as any).a).toContain('<b>Safe</b>');
    expect((result as any).a).not.toContain('<img');
    expect((result as any).b[0]).toBe('');
    expect((result as any).b[1].c).toContain('<i>ok</i>');
    expect((result as any).b[1].d).toBe('evil()');
    expect((result as any).e.f).toBe('plain');
    expect((result as any).e.g).toContain('<b>rich</b>');
    expect((result as any).h).toBe('should skip');
  });

  it('should throw ValidationError for missing or null fields', () => {
    const input = { a: null };
    const schema = { a: { sanitize: true, mode: 'plain' } };
    expect(() => sanitizeWithSchema(input, schema)).toThrow(ValidationError);
  });

  it('should throw ValidationError for non-string fields', () => {
    const input = { a: 123 };
    const schema = { a: { sanitize: true, mode: 'plain' } };
    expect(() => sanitizeWithSchema(input, schema)).toThrow(ValidationError);
  });

  it('should handle empty, long, and unicode fields', () => {
    const input = {
      a: '',
      b: 'a'.repeat(10000) + '<script>bad()</script>',
      c: '\ud835\udcaf\ud835\udc52\ud835\udcc8\ud835\udcc9 <b>\ud835\udccd\ud835\udcc8\ud835\udcc8</b>\u200B',
    };
    const schema = {
      a: { sanitize: true, mode: 'plain' },
      b: { sanitize: true, mode: 'plain' },
      c: { sanitize: true, mode: 'rich' },
    };
    const result = sanitizeWithSchema(input, schema);
    expect((result as any).a).toBe('');
    expect((result as any).b).not.toContain('<script>');
    expect((result as any).c).toContain('<b>𝓍𝓈𝓈</b>');
    expect((result as any).c).not.toContain('\u200B');
  });

  it('should neutralize malicious payloads in nested fields', () => {
    const input = {
      a: '<img src=x onerror=alert(1)>',
      b: {
        c: '<svg/onload=evil()>',
        d: '<a href="javascript:alert(1)">bad</a>',
      },
    };
    const schema = {
      a: { sanitize: true, mode: 'rich' },
      b: {
        sanitize: true,
        schema: {
          c: { sanitize: true, mode: 'plain' },
          d: { sanitize: true, mode: 'rich' },
        },
      },
    };
    const result = sanitizeWithSchema(input, schema);
    expect((result as any).a).not.toMatch(/onerror|<img/i);
    expect(((result as any).b as any).c).not.toMatch(/<svg/i);
    expect(((result as any).b as any).d).not.toMatch(/javascript:/i);
  });

  it('should log and handle errors for nested validation errors', () => {
    const input = { a: { b: null } };
    const schema = {
      a: { sanitize: true, schema: { b: { sanitize: true, mode: 'plain' } } },
    };
    expect(() => sanitizeWithSchema(input, schema)).toThrow(ValidationError);
  });
});
