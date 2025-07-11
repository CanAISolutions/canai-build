// Malicious payloads for security validation tests
// Do not modify existing code or tests. For use in parameterized test scaffolding only.

export interface MaliciousPayload {
  attackType: string;
  payload: string;
  description: string;
  expectedOutcome: string;
  source: string;
}

export const maliciousPayloads: MaliciousPayload[] = [
  {
    attackType: 'XSS',
    payload: '<script>alert(1)</script>',
    description: 'Basic script injection',
    expectedOutcome: 'Blocked or sanitized',
    source: 'OWASP XSS Cheat Sheet',
  },
  {
    attackType: 'XSS',
    payload: '"><img src=x onerror=alert(1)>',
    description: 'Attribute-based XSS',
    expectedOutcome: 'Blocked or sanitized',
    source: 'OWASP XSS Cheat Sheet',
  },
  {
    attackType: 'XSS',
    payload: '\u003cscript\u003ealert(1)\u003c/script\u003e',
    description: 'Encoded script tag',
    expectedOutcome: 'Blocked or sanitized',
    source: 'OWASP XSS Cheat Sheet',
  },
  {
    attackType: 'SQLi',
    payload: "'; DROP TABLE users; --",
    description: 'Classic SQL injection',
    expectedOutcome: 'Blocked or error',
    source: 'OWASP SQLi Cheat Sheet',
  },
  {
    attackType: 'SQLi',
    payload: '" OR 1=1 --',
    description: 'Boolean-based SQLi',
    expectedOutcome: 'Blocked or error',
    source: 'OWASP SQLi Cheat Sheet',
  },
  {
    attackType: 'SQLi',
    payload: "admin' --",
    description: 'Authentication bypass',
    expectedOutcome: 'Blocked or error',
    source: 'OWASP SQLi Cheat Sheet',
  },
  {
    attackType: 'Buffer Overflow',
    payload: 'A'.repeat(10000),
    description: 'Oversized input',
    expectedOutcome: 'Blocked or error',
    source: 'Security best practices',
  },
  {
    attackType: 'Buffer Overflow',
    payload: '\x90'.repeat(4096),
    description: 'NOP sled',
    expectedOutcome: 'Blocked or error',
    source: 'Security best practices',
  },
  {
    attackType: 'Unicode',
    payload: '\u202Eevil.exe',
    description: 'RTL override',
    expectedOutcome: 'Blocked or sanitized',
    source: 'Unicode attacks',
  },
  {
    attackType: 'Unicode',
    payload: '\uFFFD',
    description: 'Invalid Unicode replacement',
    expectedOutcome: 'Blocked or sanitized',
    source: 'Unicode attacks',
  },
  {
    attackType: 'Malformed',
    payload: 'null',
    description: 'Null value',
    expectedOutcome: 'Blocked or error',
    source: 'Edge case',
  },
  {
    attackType: 'Malformed',
    payload: 'undefined',
    description: 'Undefined value',
    expectedOutcome: 'Blocked or error',
    source: 'Edge case',
  },
  {
    attackType: 'Malformed',
    payload: '',
    description: 'Empty string',
    expectedOutcome: 'Blocked or error',
    source: 'Edge case',
  },
  {
    attackType: 'Malformed',
    payload: '{"nested": {"a": [1,2,3]}}',
    description: 'Nested object',
    expectedOutcome: 'Blocked or error',
    source: 'Edge case',
  },
  {
    attackType: 'Malformed',
    payload: '["a", "b", "c"]',
    description: 'Array input',
    expectedOutcome: 'Blocked or error',
    source: 'Edge case',
  },
  {
    attackType: 'Malformed',
    payload: '😈',
    description: 'Emoji/special char',
    expectedOutcome: 'Blocked or sanitized',
    source: 'Edge case',
  },
  {
    attackType: 'Malformed',
    payload: '\u0000',
    description: 'Null byte',
    expectedOutcome: 'Blocked or sanitized',
    source: 'Edge case',
  },
];
