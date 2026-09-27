import type { StorageProviderJsonFileConfig } from '../../types/plugins/storeage-provider-json/storage-provider-file.js';
export type { StorageProviderJsonFileConfig, SidecarMetadata, } from '../../types/plugins/storeage-provider-json/storage-provider-file.js';
/**
 * Storage for Uttori documents using JSON files stored on the local file system.
 * @example <caption>Init StorageProviderJsonFile</caption>
 * const storageProvider = new StorageProviderJsonFile({ contentDirectory: 'content', historyDirectory: 'history', spacesDocument: 2 });
 */
declare class StorageProviderJsonFile {
    /** The configuration object. */
    config: {
        contentDirectory: string;
        historyDirectory: string;
        events?: Record<string, string[]>;
        extension: string;
        updateTimestamps: boolean;
        useHistory: boolean;
        useCache: boolean;
        spacesDocument: number | undefined;
        spacesHistory: number | undefined;
        sidecarContentExtension: string | undefined;
    };
    refresh: boolean;
    /** The collection of documents where the slug is the key and the value is the document. */
    documents: Record<string, import('../../wiki.js').UttoriWikiDocument>;
    /**
     * Creates an instance of StorageProvider.
     * @param config - A configuration object.
     */
    constructor(config: StorageProviderJsonFileConfig);
    /**
     * Read and validate one metadata/Markdown pair. Sidecar mode is intentionally
     * strict so a partial checkout cannot silently produce an incomplete site.
     * @param name Metadata filename, relative to contentDirectory.
     * @returns The complete document.
     */
    loadSidecar: (name: string) => Promise<import('../../wiki.js').UttoriWikiDocument>;
    /**
     * Returns all documents.
     * @returns All documents.
     * @example
     * storageProvider.all();
     * ➜ { first-document: { slug: 'first-document', ... }, ...}
     */
    all: () => Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>;
    /**
     * Returns all documents matching a given query.
     * @async
     * @param query The conditions on which documents should be returned.
     * @returns Promise object represents all matching documents.
     */
    getQuery: (query: string) => Promise<import('../../wiki.js').UttoriWikiDocument[] | number>;
    /**
     * Returns a document for a given slug.
     * @async
     * @param slug The slug of the document to be returned.
     * @returns Promise object represents the returned UttoriDocument.
     */
    get: (slug: string) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Saves a document to the file system.
     * @async
     * @param document The document to be added to the collection.
     */
    add: (document: import('../../wiki.js').UttoriWikiDocument) => Promise<void>;
    /**
     * Updates a document and saves to the file system.
     * @async
     * @private
     * @param document The document to be updated in the collection.
     * @param originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    updateValid: (document: import('../../wiki.js').UttoriWikiDocument, originalSlug: string) => Promise<void>;
    /**
     * Updates a document and figures out how to save to the file system.
     * @async
     * @param params The params object.
     * @param params.document The document to be updated in the collection.
     * @param params.originalSlug The original slug identifying the document, or the slug if it has not changed.
     */
    update: ({ document, originalSlug }: {
        document: import('../../wiki.js').UttoriWikiDocument;
        originalSlug: string;
    }) => Promise<void>;
    /**
     * Removes a document from the file system.
     * @async
     * @param slug The slug identifying the document.
     */
    delete: (slug: string) => Promise<void>;
    /**
     * Returns the history of edits for a given slug.
     * @async
     * @param slug The slug of the document to get history for.
     * @returns Promise object represents the returned history.
     */
    getHistory: (slug: string) => Promise<string[]>;
    /**
     * Returns a specifc revision from the history of edits for a given slug and revision timestamp.
     * @async
     * @param params The params object.
     * @param params.slug The slug of the document to be returned.
     * @param params.revision The unix timestamp of the history to be returned.
     * @returns Promise object represents the returned revision of the document.
     */
    getRevision: ({ slug, revision }: {
        slug: string;
        revision: string | number;
    }) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Updates History for a given slug, renaming the store file and history directory as needed.
     * @async
     * @param slug The slug of the document to update history for.
     * @param content The revision of the document to be saved.
     * @param [originalSlug] The original slug identifying the document, or the slug if it has not changed.
     */
    updateHistory: (slug: string, content: string, originalSlug?: string) => Promise<void>;
    /**
     * Ensure a directory exists, and if not create it.
     * @param directory The directory to ensure exists.
     */
    static ensureDirectory(directory: string): Promise<void>;
}
export default StorageProviderJsonFile;
//# sourceMappingURL=storage-provider-file.d.ts.map