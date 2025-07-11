// Pattern library for business field validation
// PRD References: Section 5 (User Journey), 6 (Requirements), 7.2 (Security), 12 (Metrics)
// See docs/task-9.4-pattern-library.md for details

/**
 * Regex: Business Type Category
 * Accepts: retail, service, tech, creative, other (case-insensitive)
 * PRD: Section 6, docs/task-9.4-pattern-library.md
 */
export const BUSINESS_TYPE_REGEX = /^(retail|service|tech|creative|other)$/i;

/**
 * Regex: Enhanced Email (RFC 5322 Official Standard, simplified)
 * NOTE: Validation is now handled by validator.js isEmail(). This regex is for reference only.
 * PRD: Section 6, docs/task-9.4-pattern-library.md
 */
export const ENHANCED_EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

/**
 * Regex: International Phone (E.164, allows +, 10-15 digits, spaces, dashes, parentheses)
 * PRD: Section 6, docs/task-9.4-pattern-library.md
 * Updated 2024-07-01: Now allows spaces, dashes, and parentheses for real-world formats. See debugging log.
 */
export const INTERNATIONAL_PHONE_REGEX = /^\+?[0-9\s\-()]{10,20}$/;

/**
 * Regex: Postal Code (US, CA, UK, EU)
 * NOTE: Validation is now handled by validator.js isPostalCode(). This regex is for reference only.
 * PRD: Section 6, docs/task-9.4-pattern-library.md
 */
export const POSTAL_CODE_REGEX =
  /^(\d{5}(-\d{4})?|[A-Z]\d[A-Z] ?\d[A-Z]\d|[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|\d{3,5})$/i;

/**
 * Regex: Business Website URL (RFC 3986, simplified)
 * NOTE: Validation is now handled by validator.js isURL(). This regex is for reference only.
 * PRD: Section 6, docs/task-9.4-pattern-library.md
 */
export const BUSINESS_URL_REGEX =
  /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i;

/**
 * Regex: Social Media Handle (alphanumeric, underscores, dots, 3-30 chars, no spaces)
 * PRD: Section 6, docs/task-9.4-pattern-library.md
 * Accepts: @optional, but not required. Dots allowed per business policy. See debugging log.
 */
export const SOCIAL_HANDLE_REGEX = /^@?[A-Za-z0-9_.]{3,30}$/;

// All patterns are exported for use in validation helpers and schemas
// Update this file as new patterns are added or refined
// See docs/task-9.4-pattern-library.md for documentation and update process
