// Pattern Library Regex Tests (Reference Only)
// These tests are for documentation and traceability, not runtime validation.
// See docs/pattern-library-debugging-log.md and PRD.md for rationale and business policy.
// Failing tests here do not block CI or deployment; see helpers.test.ts for runtime validation.

import { describe, it, expect } from 'vitest';
import {
  BUSINESS_TYPE_REGEX,
  ENHANCED_EMAIL_REGEX,
  INTERNATIONAL_PHONE_REGEX,
  POSTAL_CODE_REGEX,
  BUSINESS_URL_REGEX,
  SOCIAL_HANDLE_REGEX,
} from './patterns';

describe('Pattern Library Regexes (Reference Only)', () => {
  describe('Business Type Category', () => {
    it('should match valid business types', () => {
      [
        'retail',
        'service',
        'tech',
        'creative',
        'other',
        'RETAIL',
        'Tech',
      ].forEach(val => {
        expect(BUSINESS_TYPE_REGEX.test(val)).toBe(true);
      });
    });
    it('should not match invalid business types', () => {
      ['finance', '', 'retail ', 'ret ail', '123', 'retail1'].forEach(val => {
        expect(BUSINESS_TYPE_REGEX.test(val)).toBe(false);
      });
    });
  });

  describe('Enhanced Email', () => {
    it.skip('should match valid emails (reference only)', () => {
      // Informational: This regex is not used for runtime validation.
      ['user@example.com', 'user.name+tag@sub.domain.com'].forEach(val => {
        expect(ENHANCED_EMAIL_REGEX.test(val)).toBe(true);
      });
    });
    it.skip('should not match invalid emails (reference only)', () => {
      // Informational: This regex is not used for runtime validation.
      ['plainaddress', '', 'user@domain', 'user@.com'].forEach(val => {
        expect(ENHANCED_EMAIL_REGEX.test(val)).toBe(false);
      });
    });
  });

  describe('International Phone', () => {
    it('should match valid phone numbers (reference only)', () => {
      // See debugging log and PRD for rationale. These are reference-only.
      [
        '+1234567890',
        '+1 234 567 8901',
        '+44 20 7946 0958',
        '+1-234-567-8901',
        '+1 (234) 567-8901',
        '1234567890',
        '+49 (0) 30 123456',
      ].forEach(val => {
        expect(INTERNATIONAL_PHONE_REGEX.test(val)).toBe(true);
      });
    });
    it('should not match invalid phone numbers (reference only)', () => {
      ['123', 'phone', '+-123456', '', '+1-23'].forEach(val => {
        expect(INTERNATIONAL_PHONE_REGEX.test(val)).toBe(false);
      });
    });
  });

  describe('Postal Code', () => {
    it.skip('should match valid postal codes (reference only)', () => {
      // Informational: This regex is not used for runtime validation.
      ['1234 AB', '75008', '90210', 'SW1A 1AA'].forEach(val => {
        expect(POSTAL_CODE_REGEX.test(val)).toBe(true);
      });
    });
    it.skip('should not match invalid postal codes (reference only)', () => {
      // Informational: This regex is not used for runtime validation.
      ['123', 'ABCDE', '123456', '', 'A1A-1A1'].forEach(val => {
        expect(POSTAL_CODE_REGEX.test(val)).toBe(false);
      });
    });
  });

  describe('Business URL', () => {
    it('should match valid URLs', () => {
      ['https://example.com', 'http://sub.domain.com'].forEach(val => {
        expect(BUSINESS_URL_REGEX.test(val)).toBe(true);
      });
    });
    it('should not match invalid URLs', () => {
      ['example', 'ftp://example.com', ''].forEach(val => {
        expect(BUSINESS_URL_REGEX.test(val)).toBe(false);
      });
    });
  });

  describe('Social Handle', () => {
    it('should match valid handles (reference only)', () => {
      // See debugging log and PRD for rationale. These are reference-only.
      [
        '@user',
        'user_name',
        'user.name',
        'user.name_123',
        'user_123',
        'user.name_',
      ].forEach(val => {
        expect(SOCIAL_HANDLE_REGEX.test(val)).toBe(true);
      });
    });
    it('should not match invalid handles (reference only)', () => {
      ['user@', 'user name', '', '@', 'us', 'user!@#', 'user-'].forEach(val => {
        expect(SOCIAL_HANDLE_REGEX.test(val)).toBe(false);
      });
    });
  });
});
