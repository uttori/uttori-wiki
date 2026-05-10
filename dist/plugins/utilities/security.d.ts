export function sanitizeSearchQuery(query: string, maxLength?: number): string;
export function sanitizeCategoryPath(categoryPath: string, separator?: string): string;
export function sanitizeSlug(slug: string): string;
export function validateAndSanitizeUrl(url: string): string | null;
export function sanitizeFilename(filename: string, defaultName?: string): string;
export function validateMimeType(mimetype: string, allowedTypes?: string[]): boolean;
//# sourceMappingURL=security.d.ts.map