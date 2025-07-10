// Dedicated DOMPurify-based sanitization utility for server-side use
// Uses jsdom to provide a DOM environment for DOMPurify
// Supports plain text (strip all HTML) and rich text (allow minimal safe tags)

import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { createRequire } from 'module';
let _logger;
try {
  const require = createRequire(import.meta.url);
  _logger =
    require('../api/src/Shared/Logger').default ||
    require('../api/src/Shared/Logger');
} catch (err) {
  _logger = console;
}

function logDebug(msg, meta) {
  if (_logger && typeof _logger.debug === 'function') {
    _logger.debug(meta || {}, msg);
  } else if (_logger && typeof _logger.log === 'function') {
    _logger.log(msg, meta);
  }
}

// Helper: create a short, redacted snapshot so we never log full user payloads
function snapshot(value) {
  if (value === null || value === undefined) return value;
  try {
    const str = JSON.stringify(value);
    return str.length > 150 ? str.slice(0, 140) + '…' : str;
  } catch (_) {
    return '[unserialisable]';
  }
}

// Minimal safe tags for rich text (customize as needed)
export const RICH_TEXT_ALLOWED_TAGS = [
  'b',
  'i',
  'em',
  'strong',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'p',
  'br',
  'span',
  'blockquote',
  'code',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
];
export const RICH_TEXT_ALLOWED_ATTR = [
  'href',
  'title',
  'target',
  'rel',
  'class',
  'style',
];

// Create a DOMPurify instance with jsdom
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Helper for plain string sanitization
function sanitizePlainString(data) {
  let sanitizedValue = data.normalize('NFC');
  sanitizedValue = sanitizedValue
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  sanitizedValue = sanitizedValue.replace(/<script.*?<\/script>/gis, ''); // extra pass for script tags
  sanitizedValue = sanitizedValue.replace(/<[^>]+>/g, '');
  sanitizedValue = sanitizedValue.replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (/^\s*$/.test(sanitizedValue)) {
    // Try to extract attribute values from the original string if nothing remains
    const attrMatches = [...data.matchAll(/\b\w+=(["']?)([^"'>\s]+)\1/g)];
    if (attrMatches.length > 0) {
      sanitizedValue = attrMatches.map(m => m[2]).join(' ');
    } else {
      sanitizedValue = '';
    }
  }
  return sanitizedValue;
}

// --- Task 9.2: Schema-driven, field-level sanitization utility ---

const DEFAULT_URI_REGEXP =
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

// Custom ValidationError for user-centric, actionable error handling
export class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.status = 400;
  }
}

/**
 * Sanitize an object based on a schema definition
 * @param {object} data - The object to sanitize
 * @param {object} schema - Schema: { fieldName: { sanitize: true, mode: 'plain'|'rich' } }
 * @returns {object} - Sanitized object
 */
export function sanitizeWithSchema(data, schema, path = '') {
  // Handle null/undefined
  if (data === null || data === undefined) return data;
  // Handle string sanitization first, before arrays/objects
  if (typeof data === 'string' && schema && schema.sanitize) {
    const mode = schema.mode || 'plain';
    console.log('[sanitizeWithSchema][string-handler]', { path, schema, mode });
    if (mode === 'plain') {
      const before = data;
      const sanitized = sanitizePlainString(data);
      console.log('[sanitizeWithSchema][plain][forced-regex]', {
        key: path,
        out: sanitized,
      });
      return sanitized;
    } else if (mode === 'rich') {
      let sanitizedValue = DOMPurify.sanitize(data, {
        ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
        ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
        FORBID_TAGS: ['script', 'style', 'iframe', 'svg', 'math', 'template'],
        FORBID_ATTR: [
          'onerror',
          'onload',
          'onclick',
          '__proto__',
          'prototype',
          'constructor',
        ],
        ALLOWED_URI_REGEXP: schema.uriRegexp || DEFAULT_URI_REGEXP,
        FORCE_BODY: true,
        WHOLE_DOCUMENT: false,
        RETURN_TRUSTED_TYPE: false,
      });
      sanitizedValue = sanitizedValue.replace(/<script.*?<\/script>/gis, '');
      sanitizedValue = sanitizedValue
        .normalize('NFC')
        .replace(/[\u200B-\u200D\uFEFF]/g, '');
      console.log('[sanitizeWithSchema][rich]', {
        key: path,
        before: data,
        after: sanitizedValue,
      });
      return sanitizedValue;
    }
    // If sanitize is true but mode is unknown, default to plain
    const sanitized = sanitizePlainString(data);
    console.log('[sanitizeWithSchema][plain][default]', {
      key: path,
      out: sanitized,
    });
    return sanitized;
  }
  // Handle arrays recursively
  if (Array.isArray(data)) {
    return data.map((item, idx) => {
      const currentPath = `${path}[${idx}]`;
      let appliedSchema = {};
      if (schema && typeof schema === 'object') {
        if (Object.prototype.hasOwnProperty.call(schema, String(idx))) {
          appliedSchema = schema[String(idx)];
        } else if (Object.prototype.hasOwnProperty.call(schema, '0')) {
          appliedSchema = schema['0'];
        } else if (schema.sanitize || schema.mode) {
          appliedSchema = schema;
        }
      }
      if (
        appliedSchema.sanitize &&
        (appliedSchema.mode || 'plain') === 'plain' &&
        typeof item === 'string'
      ) {
        const before = item;
        const sanitized = sanitizePlainString(item);
        console.log('[sanitizeWithSchema][plain][forced-regex]', {
          key: currentPath,
          out: sanitized,
        });
        return sanitized;
      }
      // If the item is an object (not array), and appliedSchema has .schema, use it for recursion
      let nestedSchema =
        appliedSchema.schema && typeof item === 'object' && !Array.isArray(item)
          ? appliedSchema.schema
          : appliedSchema;
      return sanitizeWithSchema(item, nestedSchema, currentPath);
    });
  }
  // Handle objects
  if (typeof data === 'object' && data !== null) {
    const sanitized = { ...data };
    for (const key in sanitized) {
      const value = sanitized[key];
      const fieldRule =
        schema && Object.prototype.hasOwnProperty.call(schema, key)
          ? schema[key]
          : { sanitize: false };
      if (fieldRule.sanitize && typeof value === 'string') {
        const mode = fieldRule.mode || 'plain';
        console.log('[sanitizeWithSchema][string-handler]', {
          path: `${path}.${key}`,
          schema: fieldRule,
          mode,
        });
        if (mode === 'plain') {
          const before = value;
          sanitized[key] = sanitizePlainString(value);
          console.log('[sanitizeWithSchema][plain][forced-regex]', {
            key: `${path}.${key}`,
            out: sanitized[key],
          });
        } else if (mode === 'rich') {
          const before = value;
          sanitized[key] = DOMPurify.sanitize(value, {
            ALLOWED_TAGS: RICH_TEXT_ALLOWED_TAGS,
            ALLOWED_ATTR: RICH_TEXT_ALLOWED_ATTR,
            FORBID_TAGS: [
              'script',
              'style',
              'iframe',
              'svg',
              'math',
              'template',
            ],
            FORBID_ATTR: [
              'onerror',
              'onload',
              'onclick',
              '__proto__',
              'prototype',
              'constructor',
            ],
            ALLOWED_URI_REGEXP: fieldRule.uriRegexp || DEFAULT_URI_REGEXP,
            FORCE_BODY: true,
            WHOLE_DOCUMENT: false,
            RETURN_TRUSTED_TYPE: false,
          });
          sanitized[key] = sanitized[key].replace(
            /<script.*?<\/script>/gis,
            ''
          );
          sanitized[key] = sanitized[key]
            .normalize('NFC')
            .replace(/[\u200B-\u200D\uFEFF]/g, '');
          console.log('[sanitizeWithSchema][rich]', {
            key: `${path}.${key}`,
            before,
            after: sanitized[key],
          });
        }
        logDebug(`[sanitize] sanitized field`, { key, mode });
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeWithSchema(
          value,
          fieldRule.schema || {},
          `${path}.${key}`
        );
      } else if (
        fieldRule.sanitize &&
        (value === null || value === undefined)
      ) {
        logDebug(`[sanitize] error: null/undefined field`, { key });
        throw new ValidationError(
          `Invalid input: field '${key}' is required.`,
          key
        );
      } else if (fieldRule.sanitize && typeof value !== 'string') {
        logDebug(`[sanitize] error: non-string field`, { key });
        throw new ValidationError(
          `Invalid input: field '${key}' must be a string.`,
          key
        );
      } else {
        logDebug(`[sanitize] skipped field`, { key });
      }
    }
    logDebug('[sanitize] exit', { sample: snapshot(sanitized) });
    return sanitized;
  }
  // Fallback: return as is
  return data;
}

/**
 * Enhanced sanitize function with edge case and XSS vector protection
 * @param {*} value
 * @param {object} options
 * @param {'plain'|'rich'} [options.mode]
 * @param {RegExp} [options.uriRegexp]
 * @param {string[]} [options.allowedTags]
 * @param {string[]} [options.allowedAttr]
 * @param {string[]} [options.forbidTags]
 * @param {string[]} [options.forbidAttr]
 * @returns {*}
 */
export function sanitize(value, options = {}) {
  const mode = options.mode || 'plain';
  const uriRegexp = options.uriRegexp || DEFAULT_URI_REGEXP;
  const allowedTags =
    options.allowedTags || (mode === 'rich' ? RICH_TEXT_ALLOWED_TAGS : []);
  const allowedAttr =
    options.allowedAttr || (mode === 'rich' ? RICH_TEXT_ALLOWED_ATTR : []);
  const forbidTags = options.forbidTags || [
    'script',
    'style',
    'iframe',
    'svg',
    'math',
    'template',
  ];
  const forbidAttr = options.forbidAttr || [
    'onerror',
    'onload',
    'onclick',
    '__proto__',
    'prototype',
    'constructor',
    'style',
  ];

  // Logging input (redacted)
  logDebug('[sanitize] entry', { mode, sample: snapshot(value) });

  let result;
  if (typeof value === 'string') {
    // Normalize Unicode and remove zero-width chars
    let clean = value.normalize('NFC').replace(/[\u200B-\u200D\uFEFF]/g, '');
    result = DOMPurify.sanitize(clean, {
      ALLOWED_TAGS: allowedTags,
      ALLOWED_ATTR: allowedAttr,
      FORBID_TAGS: forbidTags,
      FORBID_ATTR: forbidAttr,
      ALLOWED_URI_REGEXP: uriRegexp,
      FORCE_BODY: true,
      WHOLE_DOCUMENT: false,
      RETURN_TRUSTED_TYPE: false,
    });
  } else if (Array.isArray(value)) {
    result = value.map(item => sanitize(item, options));
  } else if (value && typeof value === 'object') {
    const sanitized = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        sanitized[key] = sanitize(value[key], options);
      }
    }
    result = sanitized;
  } else {
    result = value;
  }
  // Logging output (redacted)
  logDebug('[sanitize] exit', { mode, sample: snapshot(result) });
  return result;
}
