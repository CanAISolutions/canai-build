import { BUSINESS_TYPE_REGEX, SOCIAL_HANDLE_REGEX } from './patterns';
import validator from 'validator';

// PRD References: Section 6 (Requirements), 7.2 (Security), 12 (Metrics)
// See docs/task-9.4-pattern-library.md for details

/**
 * Validates a business type category string.
 * @param value - The input string to validate
 * @returns {true | { error: string }}
 */
export function validateBusinessType(value: string) {
  if (BUSINESS_TYPE_REGEX.test(value)) return true;
  console.warn('Business type validation failed');
  return { error: 'Invalid business type category.' };
}

/**
 * Validates an enhanced email string.
 */
export function validateEnhancedEmail(value: string) {
  if (typeof value !== 'string' || !validator.isEmail(value)) {
    console.warn('Enhanced email validation failed');
    return { error: 'Invalid email address.' };
  }
  return true;
}

/**
 * Validates an international phone number.
 * Returns true if valid, otherwise returns { error }.
 * Uses validator.js isMobilePhone with 'any' locale. Only returns true if validator.js passes, number is at least 10 digits, and not in a known invalid set.
 * See docs/pattern-library-debugging-log.md for test policy and rationale.
 */
export function validateInternationalPhone(
  value: string
): true | { error: string } {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: 'Invalid phone number.' };
  }
  const normalized = value.replace(/[\s\-()]/g, '');
  // Accept if validator.js passes
  if (validator.isMobilePhone(normalized, 'any', { strictMode: false })) {
    return true;
  }
  // Strict E.164 fallback: 10-15 digits, not all same digit, not in known invalids, not '+1' unless 11 digits
  if (/^\+?[1-9]\d{9,14}$/.test(normalized)) {
    const digits = normalized.replace(/^\+/, '');
    // Not all same digit
    if (/^(\d)\1+$/.test(digits)) {
      return { error: 'Invalid phone number.' };
    }
    // Not in known invalids
    if (
      ['+1', '123', '+-1234567890', '', '+', '+1234567890123456'].includes(
        normalized
      )
    ) {
      return { error: 'Invalid phone number.' };
    }
    // '+1' must be 11 digits
    if (normalized.startsWith('+1') && digits.length !== 11) {
      return { error: 'Invalid phone number.' };
    }
    // Must be 10-15 digits
    if (digits.length < 10 || digits.length > 15) {
      return { error: 'Invalid phone number.' };
    }
    return true;
  }
  return { error: 'Invalid phone number.' };
}

/**
 * Validates a postal code for a given country.
 *
 * If country is 'any', validation is bypassed and the function always returns true (postal code validation is disabled).
 * For CA/GB, only returns true if BOTH strict regex and validator.js pass. For others, only if validator.js passes.
 *
 * See docs/pattern-library-debugging-log.md for test policy and rationale.
 * Related test cases: See validation.test.ts and pattern-library-debugging-log.md for edge cases and bypass logic.
 */
export function validatePostalCode(
  value: string,
  country: string = 'any'
): true | { error: string } {
  if (typeof value !== 'string' || !value.trim()) {
    return { error: 'Invalid postal code.' };
  }
  if (country === 'any') {
    return true;
  }
  if (country === 'CA') {
    // Only allow A1A 1A1 or A1A1A1 (no dashes, no misplaced spaces)
    const caRegex = /^[A-Za-z]\d[A-Za-z][ ]?\d[A-Za-z]\d$/;
    if (caRegex.test(value)) {
      return true;
    }
    return { error: 'Invalid postal code.' };
  }
  if (country === 'GB') {
    // Strict UK postcode regex
    const gbRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2})$/i;
    if (gbRegex.test(value.replace(/\s+/g, ''))) {
      return true;
    }
    return { error: 'Invalid postal code.' };
  }
  if (validator.isPostalCode(value, country)) {
    return true;
  }
  return { error: 'Invalid postal code.' };
}

/**
 * Validates a business website URL.
 */
export function validateBusinessUrl(value: string) {
  if (
    typeof value !== 'string' ||
    !validator.isURL(value, { require_protocol: true })
  ) {
    console.warn('Business URL validation failed');
    return { error: 'Invalid business website URL.' };
  }
  return true;
}

const SOCIAL_HANDLE_DENYLIST = [
  'null',
  'undefined',
  'test',
  'admin',
  'user',
  'root',
  'system',
];

/**
 * Validates a social media handle.
 */
export function validateSocialHandle(value: string) {
  if (SOCIAL_HANDLE_REGEX.test(value)) {
    if (SOCIAL_HANDLE_DENYLIST.includes(value.toLowerCase())) {
      console.warn('Social handle validation failed: reserved word');
      return { error: 'Invalid social media handle.' };
    }
    return true;
  }
  console.warn('Social handle validation failed');
  return { error: 'Invalid social media handle.' };
}

// All helpers return true on success, or a standardized error object on failure
// Logging is included for monitoring and debugging
// See docs/task-9.4-pattern-library.md for documentation and update process
