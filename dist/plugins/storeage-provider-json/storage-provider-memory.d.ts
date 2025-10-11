export default StorageProvider;
/**
 * The configuration object for the StorageProvider.
 */
export type StorageProviderConfig = {
    /**
     * Should update times be marked at the time of edit.
     */
    updateTimestamps?: boolean;
    /**
     * Should history entries be created.
     */
    useHistory?: boolean;
    /**
     * The events to listen for.
     */
    events?: Record<string, string[]>;
};
/**
 * @typedef StorageProviderConfig The configuration object for the StorageProvider.
 * @property {boolean} [updateTimestamps] Should update times be marked at the time of edit.
 * @property {boolean} [useHistory] Should history entries be created.
 * @property {Record<string, string[]>} [events] The events to listen for.
 */
/**
 * Storage for Uttori documents using JSON objects in memory.
 * @property {import('../../wiki.js').UttoriWikiDocument[]} documents The collection of documents.
 * @property {object} history The collection of document histories indexes.
 * @property {object} histories The collection of document revisions by index.
 * @example <caption>Init StorageProvider</caption>
 * const storageProvider = new StorageProvider();
 * @class
 */
declare class StorageProvider {
    /**
     * Creates an instance of StorageProvider.
     * @param {StorageProviderConfig} [config] A configuration object.
     * @class
     */
    constructor(config?: StorageProviderConfig);
    config: {
        /**
         * Should update times be marked at the time of edit.
         */
        updateTimestamps: boolean;
        /**
         * Should history entries be created.
         */
        useHistory: boolean;
        /**
         * The events to listen for.
         */
        events?: Record<string, string[]>;
    };
    /** @type {Record<string, import('../../wiki.js').UttoriWikiDocument>} The collection of documents where the slug is the key and the value is the document. */
    documents: Record<string, import("../../wiki.js").UttoriWikiDocument>;
    /** @type {Record<string, string[]>} The collection of document histories indexes. */
    history: Record<string, string[]>;
    /** @type {Record<string, import('../../wiki.js').UttoriWikiDocument>} The collection of document revisions by timestamp. */
    histories: Record<string, import("../../wiki.js").UttoriWikiDocument>;
    /**
     * Returns all documents.
     * @returns {Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>} All documents.
     * @example
     * ```js
     * storageProvider.all();
     * ➜ { 'first-document': { slug: 'first-document', ... }, ... }
     * ```
     */
    all: () => Promise<Record<string, import("../../wiki.js").UttoriWikiDocument>>;
    /**
     * Returns all documents matching a given query.
     * @param {string} query The conditions on which documents should be returned.
     * @returns {Promise<number | import('../../wiki.js').UttoriWikiDocument[] | Partial<import('../../wiki.js').UttoriWikiDocument>[]>} The items matching the supplied query.
     */
    getQuery: (query: string) => Promise<number | import("../../wiki.js").UttoriWikiDocument[] | Partial<import("../../wiki.js").UttoriWikiDocument>[]>;
    /**
     * Returns a document for a given slug.
     * @param {string} slug The slug of the document to be returned.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument|undefined>} The returned UttoriDocument.
     */
    get: (slug: string) => Promise<import("../../wiki.js").UttoriWikiDocument | undefined>;
    /**
     * Returns the history of edits for a given slug.
     * @param {string} slug The slug of the document to get history for.
     * @returns {Promise<string[]>} The returned history object.
     */
    getHistory: (slug: string) => Promise<string[]>;
    /**
     * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
     * @param {object} params The params object.
     * @param {string} params.slug The slug of the document to be returned.
     * @param {string|number} params.revision The unix timestamp of the history to be returned.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument|undefined>} The returned revision of the document.
     */
    getRevision: ({ slug, revision }: {
        slug: string;
        revision: string | number;
    }) => Promise<import("../../wiki.js").UttoriWikiDocument | undefined>;
    /**
     * Saves a document to internal array.
     * @param {import('../../wiki.js').UttoriWikiDocument} document The document to be added to the collection.
     */
    add: (document: import("../../wiki.js").UttoriWikiDocument) => Promise<void>;
    /**
     * Updates a document and saves to memory.
     * @private
     * @param {object} params The params object.
     * @param {import('../../wiki.js').UttoriWikiDocument} params.document - The document to be updated in the collection.
     * @param {string} params.originalSlug - The original slug identifying the document, or the slug if it has not changed.
     */
    private updateValid;
    /**
     * Updates a document and figures out how to save to memory.
     * Calling with a new document will add that document.
     * @param {object} params The params object.
     * @param {import('../../wiki.js').UttoriWikiDocument} params.document The document to be updated in the collection.
     * @param {string} params.originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    update: ({ document, originalSlug }: {
        document: import("../../wiki.js").UttoriWikiDocument;
        originalSlug: string;
    }) => Promise<void>;
    /**
     * Removes a document from memory.
     * @param {string} slug The slug identifying the document.
     */
    delete: (slug: string) => Promise<void>;
    /**
     * Resets to the initial state.
     */
    reset(): void;
    /**
     * Updates History for a given slug, renaming the key and history key as needed.
     * @param {object} params The params object.
     * @param {string} params.slug The slug of the document to update history for.
     * @param {import('../../wiki.js').UttoriWikiDocument} params.content The revision of the document to be saved.
     * @param {string} [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
     */
    updateHistory: ({ slug, content, originalSlug }: {
        slug: string;
        content: import("../../wiki.js").UttoriWikiDocument;
        originalSlug?: string;
    }) => Promise<void>;
}
//# sourceMappingURL=storage-provider-memory.d.ts.map