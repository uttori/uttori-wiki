/** Security utilities for input validation and sanitization. */
/**
 * Sanitizes a search query to prevent XSS and other attacks.
 * @param query The search query to sanitize.
 * @param [maxLength] Maximum length of the query (default 500).
 * @returns The sanitized query.
 */
export declare const sanitizeSearchQuery: (query: string, maxLength?: number) => string;
/**
 * Sanitizes a category path to prevent path traversal and other attacks.
 * @param categoryPath The category path to sanitize.
 * @param [separator] The separator used in category paths (default '/').
 * @returns The sanitized category path.
 */
export declare const sanitizeCategoryPath: (categoryPath: string, separator?: string) => string;
/**
 * Sanitizes a slug to prevent path traversal and other attacks.
 * @param slug The slug to sanitize.
 * @returns The sanitized slug.
 */
export declare const sanitizeSlug: (slug: string) => string;
/**
 * Validates and sanitizes a URL to prevent command injection.
 * Only allows http:// and https:// protocols.
 * @param url The URL to validate.
 * @returns The sanitized URL or null if invalid.
 */
export declare const validateAndSanitizeUrl: (url: string) => string | null;
/**
 * Sanitizes a filename to prevent path traversal and other security issues.
 * Removes path separators and dangerous characters.
 * @param filename The filename to sanitize.
 * @param [defaultName] Default name to use if sanitization results in empty string (default 'file').
 * @returns The sanitized filename.
 */
export declare const sanitizeFilename: (filename: string, defaultName?: string) => string;
/**
 * Validates file MIME type against allowed types.
 * @param mimetype The MIME type to validate.
 * @param [allowedTypes] Array of allowed MIME types (e.g., ['image/jpeg', 'image/png']).
 * @returns True if MIME type is allowed.
 */
export declare const validateMimeType: (mimetype: string, allowedTypes?: string[]) => boolean;
//# sourceMappingURL=security.d.ts.map