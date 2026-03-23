/**
 * Security utilities for input validation and sanitization.
 */

/**
 * Sanitizes a search query to prevent XSS and other attacks.
 * @param {string} query The search query to sanitize.
 * @param {number} [maxLength=500] Maximum length of the query.
 * @returns {string} The sanitized query.
 */
export const sanitizeSearchQuery = (query, maxLength = 500) => {
  if (!query || typeof query !== 'string') {
    return '';
  }
  // Remove null bytes and control characters
  let sanitized = query.replace(/[\x00-\x1f\x7f-\x9f]/g, '');
  // Limit length
  sanitized = sanitized.slice(0, maxLength);
  // Trim whitespace
  sanitized = sanitized.trim();
  return sanitized;
};

/**
 * Sanitizes a category path to prevent path traversal and other attacks.
 * @param {string} categoryPath The category path to sanitize.
 * @param {string} [separator='/'] The separator used in category paths.
 * @returns {string} The sanitized category path.
 */
export const sanitizeCategoryPath = (categoryPath, separator = '/') => {
  if (!categoryPath || typeof categoryPath !== 'string') {
    return '';
  }
  // Check if this looks like a path traversal attempt (../ or ..\)
  const hasPathTraversal = /\.\.(\/|\\)/.test(categoryPath);
  // Remove path traversal patterns and backslashes
  let sanitized = categoryPath.replace(/\.\.(\/|\\)/g, '').replace(/\\/g, '');
  // Remove dangerous characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f-\x9f]/g, '');

  // If path traversal was detected, remove all path separators for extra security
  if (hasPathTraversal) {
    sanitized = sanitized.replace(/\//g, '');
    // Return sanitized string without separator (all separators removed)
    return sanitized.trim().replace(/[.\s\-]+$/, '').replace(/^[.\s\-]+/, '').slice(0, 500);
  }

  // Escape separator for use in regex
  const escapedSeparator = separator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Split by separator and sanitize each part
  const parts = sanitized.split(new RegExp(escapedSeparator));
  const sanitizedParts = parts
    .map((part) => {
      // Remove leading/trailing dots, spaces, and hyphens
      let cleaned = part.trim();
      // Remove all leading dots, spaces, and hyphens
      cleaned = cleaned.replace(/^[.\s\-]+/, '');
      // Remove all trailing dots, spaces, and hyphens
      cleaned = cleaned.replace(/[.\s\-]+$/, '');
      return cleaned;
    })
    .filter(Boolean)
    .slice(0, 20); // Limit depth
  sanitized = sanitizedParts.join(separator);
  // Limit total length
  return sanitized.slice(0, 500);
};

/**
 * Sanitizes a slug to prevent path traversal and other attacks.
 * @param {string} slug The slug to sanitize.
 * @returns {string} The sanitized slug.
 */
export const sanitizeSlug = (slug) => {
  if (!slug || typeof slug !== 'string') {
    return '';
  }
  // Remove path separators, dangerous characters, and normalize
  let sanitized = slug.replace(/[\/\\\x00-\x1f\x7f-\x9f]/g, '');
  // Remove leading/trailing dots, spaces, and hyphens
  sanitized = sanitized.replace(/^[.\s\-]+/, '').replace(/[.\s\-]+$/, '');
  // Limit length
  sanitized = sanitized.slice(0, 255);
  return sanitized;
};

/**
 * Validates and sanitizes a URL to prevent command injection.
 * Only allows http:// and https:// protocols.
 * @param {string} url The URL to validate.
 * @returns {string|null} The sanitized URL or null if invalid.
 */
export const validateAndSanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    // Return the normalized URL
    return parsed.href;
  } catch {
    return null;
  }
};

/**
 * Sanitizes a filename to prevent path traversal and other security issues.
 * Removes path separators and dangerous characters.
 * @param {string} filename The filename to sanitize.
 * @param {string} [defaultName='file'] Default name to use if sanitization results in empty string.
 * @returns {string} The sanitized filename.
 */
export const sanitizeFilename = (filename, defaultName = 'file') => {
  if (!filename || typeof filename !== 'string') {
    return defaultName;
  }
  // Remove path separators and dangerous characters
  let sanitized = filename.replace(/[\/\\\x00-\x1f\x7f-\x9f]/g, '');
  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[.\s]+/, '').replace(/[.\s]+$/, '');
  // Limit length
  sanitized = sanitized.slice(0, 255);
  // If empty after sanitization, use default
  if (!sanitized) {
    sanitized = defaultName;
  }
  return sanitized;
};

/**
 * Validates file MIME type against allowed types.
 * @param {string} mimetype The MIME type to validate.
 * @param {string[]} [allowedTypes] Array of allowed MIME types (e.g., ['image/jpeg', 'image/png']).
 * @returns {boolean} True if MIME type is allowed.
 */
export const validateMimeType = (mimetype, allowedTypes = []) => {
  if (!allowedTypes || allowedTypes.length === 0) {
    // If no restrictions, allow all
    return true;
  }
  return allowedTypes.includes(mimetype);
};
