/**
 * TypeScript extensions for CategoryRoutesPlugin.
 * This file extends the base UttoriWikiDocument type with category-specific fields.
 */

declare module '../../custom.d.ts' {
  interface UttoriWikiDocumentExtensions {
    /**
     * Array of category strings for hierarchical categorization.
     * Used by CategoryRoutesPlugin to organize documents into categories.
     *
     * @example
     * ```typescript
     * const document: UttoriWikiDocumentExtended = {
     *   slug: 'my-document',
     *   title: 'My Document',
     *   content: 'Content here',
     *   categories: ['technology', 'javascript', 'tutorials']
     * };
     * ```
     */
    categories?: string[];
  }
}

/**
 * Re-export the extended document type for convenience.
 * Plugin users can import this type to get documents with category fields.
 */
export type UttoriWikiDocumentWithCategories = import('../custom.d.ts').UttoriWikiDocumentExtended;
