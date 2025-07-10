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

// --- Task 9.2: Schema-driven, field-level sanitization utility ---

const DEFAULT_URI_REGEXP =
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;

/**
 * Sanitize an object based on a schema definition
 * @param {object} data - The object to sanitize
 * @param {object} schema - Schema: { fieldName: { sanitize: true, mode: 'plain'|'rich' } }
 * @returns {object} - Sanitized object
 */
export function sanitizeWithSchema(data, schema = {}) {
  logDebug('[sanitize] entry', {
    schemaKeys: Object.keys(schema || {}),
    sample: snapshot(data),
  });
  if (!data || typeof data !== 'object') return data;
  const sanitized = { ...data };
  for (const key in schema) {
    if (!Object.prototype.hasOwnProperty.call(schema, key)) continue;
    const fieldRule = schema[key];
    if (!fieldRule.sanitize) continue;
    const mode = fieldRule.mode || 'plain';
    if (sanitized[key] !== undefined) {
      sanitized[key] = sanitize(sanitized[key], {
        mode,
        uriRegexp: fieldRule.uriRegexp || DEFAULT_URI_REGEXP,
        allowedTags: fieldRule.allowedTags,
        allowedAttr: fieldRule.allowedAttr,
        forbidTags: fieldRule.forbidTags,
        forbidAttr: fieldRule.forbidAttr,
      });
    }
  }
  logDebug('[sanitize] exit', { sample: snapshot(sanitized) });
  return sanitized;
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
