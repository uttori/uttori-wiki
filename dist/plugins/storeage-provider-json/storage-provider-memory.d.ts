import type { StorageProviderConfig } from '../../types/plugins/storeage-provider-json/storage-provider-memory.js';
export type { StorageProviderConfig } from '../../types/plugins/storeage-provider-json/storage-provider-memory.js';
/**
 * Storage for Uttori documents using JSON objects in memory.
 * @example <caption>Init StorageProvider</caption>
 * const storageProvider = new StorageProvider();
 */
declare class StorageProvider {
    config: {
        events?: Record<string, string[]>;
        updateTimestamps: boolean;
        useHistory: boolean;
    };
    /** The collection of documents where the slug is the key and the value is the document. */
    documents: Record<string, import('../../wiki.js').UttoriWikiDocument>;
    /** The collection of document histories indexes. */
    history: Record<string, string[]>;
    /** The collection of document revisions by timestamp. */
    histories: Record<string, import('../../wiki.js').UttoriWikiDocument>;
    /**
     * Creates an instance of StorageProvider.
     * @param [config] A configuration object.
     */
    constructor(config?: StorageProviderConfig);
    /**
     * Returns all documents.
     * @returns All documents.
     * @example
     * ```js
     * storageProvider.all();
     * ➜ { 'first-document': { slug: 'first-document', ... }, ... }
     * ```
     */
    all: () => Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>;
    /**
     * Returns all documents matching a given query.
     * @param query The conditions on which documents should be returned.
     * @returns The items matching the supplied query.
     */
    getQuery: (query: string) => Promise<number | import('../../wiki.js').UttoriWikiDocument[]>;
    /**
     * Returns a document for a given slug.
     * @param slug The slug of the document to be returned.
     * @returns The returned UttoriDocument.
     */
    get: (slug: string) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Returns the history of edits for a given slug.
     * @param slug The slug of the document to get history for.
     * @returns The returned history object.
     */
    getHistory: (slug: string) => Promise<string[]>;
    /**
     * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
     * @param params The params object.
     * @param params.slug The slug of the document to be returned.
     * @param params.revision The unix timestamp of the history to be returned.
     * @returns The returned revision of the document.
     */
    getRevision: ({ slug, revision }: {
        slug: string;
        revision: string | number;
    }) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Saves a document to internal array.
     * @param document The document to be added to the collection.
     */
    add: (document: import('../../wiki.js').UttoriWikiDocument) => Promise<void>;
    /**
     * Updates a document and saves to memory.
     * @private
     * @param params The params object.
     * @param params.document - The document to be updated in the collection.
     * @param params.originalSlug - The original slug identifying the document, or the slug if it has not changed.
     */
    updateValid: ({ document, originalSlug }: {
        document: import('../../wiki.js').UttoriWikiDocument;
        originalSlug: string;
    }) => Promise<void>;
    /**
     * Updates a document and figures out how to save to memory.
     * Calling with a new document will add that document.
     * @param params The params object.
     * @param params.document The document to be updated in the collection.
     * @param params.originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    update: ({ document, originalSlug }: {
        document: import('../../wiki.js').UttoriWikiDocument;
        originalSlug: string;
    }) => Promise<void>;
    /**
     * Removes a document from memory.
     * @param slug The slug identifying the document.
     */
    delete: (slug: string) => Promise<void>;
    /** Resets to the initial state. */
    reset(): void;
    /**
     * Updates History for a given slug, renaming the key and history key as needed.
     * @param params The params object.
     * @param params.slug The slug of the document to update history for.
     * @param params.content The revision of the document to be saved.
     * @param [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
     */
    updateHistory: ({ slug, content, originalSlug }: {
        slug: string;
        content: import('../../wiki.js').UttoriWikiDocument;
        originalSlug?: string;
    }) => Promise<void>;
}
export default StorageProvider;
//# sourceMappingURL=storage-provider-memory.d.ts.map