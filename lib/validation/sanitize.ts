/**
 * Input sanitization utilities for XSS protection
 * Provides comprehensive HTML/XSS sanitization
 */

// Characters that need HTML entity encoding
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

// Regex to match all HTML entity characters
const HTML_ENTITY_REGEX = /[&<>"'`=/]/g;

// Regex to detect potential script injection patterns
const SCRIPT_PATTERNS = [
  /javascript:/gi,
  /vbscript:/gi,
  /data:/gi,
  /on\w+\s*=/gi, // onclick=, onerror=, etc.
  /<script/gi,
  /<\/script/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<svg.*?onload/gi,
  /expression\s*\(/gi, // CSS expression()
  /url\s*\(/gi, // CSS url() - be careful with this one
];

/**
 * Escape HTML entities to prevent XSS
 * This is the primary sanitization function for user input
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(HTML_ENTITY_REGEX, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize user-generated text content
 * - Escapes HTML entities
 * - Removes null bytes
 * - Trims whitespace
 * - Optionally enforces max length
 */
export function sanitizeText(
  input: string | null | undefined,
  options: { maxLength?: number; allowNewlines?: boolean } = {}
): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim whitespace
    .trim();

  // Remove newlines if not allowed
  if (!options.allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]+/g, ' ');
  }

  // Escape HTML entities
  sanitized = escapeHtml(sanitized);

  // Enforce max length
  if (options.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
}

/**
 * Sanitize a display name
 * Stricter than general text - no special chars that could be confusing
 */
export function sanitizeDisplayName(name: string | null | undefined, maxLength: number = 50): string {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    // Remove control characters
    .replace(/[\x00-\x1F\x7F]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    // Escape HTML
    .replace(HTML_ENTITY_REGEX, (char) => HTML_ENTITIES[char] || char)
    // Enforce length
    .substring(0, maxLength);
}

/**
 * Sanitize a chat message
 * Allows some formatting but prevents XSS
 */
export function sanitizeChatMessage(
  message: string | null | undefined,
  maxLength: number = 500
): string {
  if (!message || typeof message !== 'string') return '';

  let sanitized = message
    // Remove null bytes
    .replace(/\0/g, '')
    // Trim
    .trim()
    // Collapse multiple newlines to max 2
    .replace(/\n{3,}/g, '\n\n')
    // Remove control chars except newline
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Check for script injection patterns
  for (const pattern of SCRIPT_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[removed]');
  }

  // Escape HTML entities
  sanitized = escapeHtml(sanitized);

  // Enforce length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize a URL
 * Only allows http, https protocols
 */
export function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  const trimmed = url.trim();

  // Only allow http and https
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }

  // Check for javascript: or data: hidden in the URL
  const lower = trimmed.toLowerCase();
  if (lower.includes('javascript:') || lower.includes('data:') || lower.includes('vbscript:')) {
    return null;
  }

  return trimmed;
}

/**
 * Strip all HTML tags from a string
 * Use when you need plain text only
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input || typeof input !== 'string') return '';
  return input.replace(/<[^>]*>/g, '');
}
