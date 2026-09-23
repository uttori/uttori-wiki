/**
 * Security utilities for input validation and sanitization.
 */
/**
 * Sanitizes a search query to prevent XSS and other attacks.
 * @param {string} query The search query to sanitize.
 * @param {number} [maxLength=500] Maximum length of the query.
 * @returns {string} The sanitized query.
 */
export declare const sanitizeSearchQuery: (query: string, maxLength?: number) => string;
/**
 * Sanitizes a category path to prevent path traversal and other attacks.
 * @param {string} categoryPath The category path to sanitize.
 * @param {string} [separator='/'] The separator used in category paths.
 * @returns {string} The sanitized category path.
 */
export declare const sanitizeCategoryPath: (categoryPath: string, separator?: string) => string;
/**
 * Sanitizes a slug to prevent path traversal and other attacks.
 * @param {string} slug The slug to sanitize.
 * @returns {string} The sanitized slug.
 */
export declare const sanitizeSlug: (slug: string) => string;
/**
 * Validates and sanitizes a URL to prevent command injection.
 * Only allows http:// and https:// protocols.
 * @param {string} url The URL to validate.
 * @returns {string|null} The sanitized URL or null if invalid.
 */
export declare const validateAndSanitizeUrl: (url: string) => string | null;
/**
 * Sanitizes a filename to prevent path traversal and other security issues.
 * Removes path separators and dangerous characters.
 * @param {string} filename The filename to sanitize.
 * @param {string} [defaultName='file'] Default name to use if sanitization results in empty string.
 * @returns {string} The sanitized filename.
 */
export declare const sanitizeFilename: (filename: string, defaultName?: string) => string;
/**
 * Validates file MIME type against allowed types.
 * @param {string} mimetype The MIME type to validate.
 * @param {string[]} [allowedTypes] Array of allowed MIME types (e.g., ['image/jpeg', 'image/png']).
 * @returns {boolean} True if MIME type is allowed.
 */
export declare const validateMimeType: (mimetype: string, allowedTypes?: string[]) => boolean;
//# sourceMappingURL=security.d.ts.map