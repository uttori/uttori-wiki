export default SearchProviderSQLite;
export type SearchSQLiteConfig = import("../search-provider-sqlite.js").SearchSQLiteConfig;
export type SearchSQLiteContext = import("../../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-sqlite", SearchSQLiteConfig>;
export type SearchSQLiteDocumentRow = {
    /**
     * The document slug when selected explicitly.
     */
    slug?: string | undefined;
    /**
     * The serialized document payload.
     */
    data_json: string;
};
export type SearchSQLiteSlugRow = {
    /**
     * The document slug.
     */
    slug: string;
    /**
     * The serialized document payload.
     */
    data_json: string;
};
export type SearchSQLiteCountRow = {
    /**
     * The aggregate count result.
     */
    count: number;
};
export type SearchSQLiteRevisionRow = {
    /**
     * The revision identifier.
     */
    revision: string;
};
export type SearchSQLiteIndexUpdate = {
    /**
     * The updated document.
     */
    document: import("../../wiki.js").UttoriWikiDocument;
    /**
     * The previous slug when the document was renamed.
     */
    originalSlug?: string | undefined;
};
export type SearchSQLiteConfigSearchOptions = {
    /**
     * The value to search for.
     */
    query: string;
    /**
     * Limit for the number of returned documents.
     */
    limit?: number | undefined;
    /**
     * Optional slugs to restrict search to.
     */
    slugs?: string[] | undefined;
};
/**
 * @typedef {object} SearchSQLiteConfigSearchOptions
 * @property {string} query The value to search for.
 * @property {number} [limit] Limit for the number of returned documents.
 * @property {string[]} [slugs] Optional slugs to restrict search to.
 */
/**
 * Storage and search provider powered by SQLite, sqlite-vec, and FTS5.
 *
 * @class
 * @property {object} searchTerms The collection of search terms and their counts.
 * @property {SearchSQLiteConfig} config The provider configuration.
 */
declare class SearchProviderSQLite {
    /**
     * Creates an instance of SearchProviderSQLite.
     *
     * @param {Partial<SearchSQLiteConfig>} [config] Configuration object for the class.
     * @class
     */
    constructor(config?: Partial<SearchSQLiteConfig>);
    searchTerms: {};
    config: {
        /**
         * The events to listen for.
         */
        events?: Record<string, string[]> | undefined;
        /**
         * The path to the SQLite database.
         */
        databasePath: string;
        /**
         * The options for the database.
         */
        databaseOptions: import("better-sqlite3").Options;
        /**
         * Deprecated misspelled alias for `databaseOptions`.
         */
        databseOptions: Database.Options | undefined;
        /**
         * Should update times be marked at the time of edit.
         */
        updateTimestamps: boolean;
        /**
         * Should history entries be created.
         */
        useHistory: boolean;
        /**
         * The base URL for the Ollama server.
         */
        ollamaBaseUrl: string;
        /**
         * The model to use for embeddings.
         */
        embedModel: string;
        /**
         * The prompt to use for embeddings.
         */
        embedPrompt: import("../search-provider-sqlite.js").SearchSQLiteEmbedPrompt;
        /**
         * The limit for the number of chunks to return.
         */
        chunkLimit: number;
        /**
         * Whether to use the hybrid approach of vector & FTS.
         */
        hybrid: boolean;
        /**
         * Whether to use the FTS index.
         */
        fts: boolean;
        /**
         * The weight for the FTS index.
         */
        ftsWeight: number;
        /**
         * The title boost for query terms.
         */
        titleBoost: number;
        /**
         * The text boost for query terms.
         */
        textBoost: number;
        /**
         * The FTS weight bump for query terms.
         */
        ftsWeightBump: number;
        /**
         * The maximum number of tokens to use for context.
         */
        maxContextTokens: number;
        /**
         * The maximum number of chunks to use per source.
         */
        maxPerSource: number;
        /**
         * The embedding batch size.
         */
        batch: number;
        /**
         * Slugs to ignore.
         */
        ignoreSlugs: string[];
        /**
         * Tags to ignore.
         */
        ignoreTags: string[];
        /**
         * Whether to create the search index when index tables are missing on startup.
         */
        bootstrapIndexOnStartup: boolean;
        /**
         * Whether to rebuild the search index on startup.
         */
        rebuildIndexOnStartup: boolean;
        /**
         * The root path to the attachments.
         */
        attachmentsRoot: string;
        /**
         * Whether to include attachments.
         */
        includeAttachments: boolean;
        /**
         * The function to use to extract text from an attachment.
         */
        extractAttachmentText?: import("../search-provider-sqlite.js").SearchSQLiteExtractAttachmentText | undefined;
        /**
         * The markdown-it plugin configuration.
         */
        markdownItPluginConfig?: import("../renderer-markdown-it.js").MarkdownItRendererConfig | undefined;
        /**
         * Whether to convert tables to CSV format.
         */
        tableToCSV: boolean;
        /**
         * Maximum number of rows per table chunk for embedding.
         */
        tableMaxRowsPerChunk: number;
        /**
         * Maximum estimated tokens per table chunk for embedding.
         */
        tableMaxTokensPerChunk: number;
    };
    /**
     * Open the SQLite database and create core tables.
     *
     * @returns {import('better-sqlite3').Database} The database.
     */
    openDatabase: () => import("better-sqlite3").Database;
    /**
     * Normalize a SQLite row into an Uttori Wiki document.
     *
     * @param {SearchSQLiteDocumentRow | undefined} row The database row.
     * @returns {import('../../wiki.js').UttoriWikiDocument | undefined} The document.
     */
    rowToDocument: (row: SearchSQLiteDocumentRow | undefined) => import("../../wiki.js").UttoriWikiDocument | undefined;
    /**
     * Persist a document row.
     *
     * @param {import('../../wiki.js').UttoriWikiDocument} document The document to persist.
     * @param {import('better-sqlite3').Database} [database] An optional existing database connection.
     * @returns {void}
     */
    saveDocument: (document: import("../../wiki.js").UttoriWikiDocument, database?: import("better-sqlite3").Database) => void;
    /**
     * Escapes a SQLite LIKE value.
     *
     * @param {string} value The value to escape.
     * @returns {string} The escaped value.
     */
    escapeLike: (value: string) => string;
    /**
     * Returns a safe JSON path expression for a document field.
     *
     * @param {string} field The field.
     * @returns {string} The JSON path.
     */
    jsonPath: (field: string) => string;
    /**
     * Returns the SQL expression for a document field.
     *
     * @param {string} field The field.
     * @returns {string} The SQL expression.
     */
    fieldExpression: (field: string) => string;
    /**
     * Converts a value into a SQLite value.
     *
     * @param {unknown} value The value.
     * @returns {unknown} The SQLite value.
     */
    toSqlValue: (value: unknown) => unknown;
    /**
     * Converts a parsed WHERE AST into SQLite SQL.
     *
     * @param {SqlWhereParserAst} ast The parsed WHERE AST.
     * @param {unknown[]} values The values to bind.
     * @returns {string} The SQL WHERE clause.
     */
    astToSql: (ast: SqlWhereParserAst, values: unknown[]) => string;
    /**
     * Build a SQLite query from the storage-provider SQL-like query syntax.
     *
     * @param {string} query The SQL-like storage query.
     * @returns {{ sql: string, values: unknown[], countOnly: boolean, fields: string[] }} The SQLite query data.
     */
    buildStorageQuery: (query: string) => {
        sql: string;
        values: unknown[];
        countOnly: boolean;
        fields: string[];
    };
    /**
     * Adds a history entry for a document.
     *
     * @param {object} params The params object.
     * @param {string} params.slug The slug of the document to update history for.
     * @param {import('../../wiki.js').UttoriWikiDocument} params.content The revision of the document to be saved.
     * @param {string} [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
     * @param {import('better-sqlite3').Database} [database] An optional existing database connection.
     * @returns {Promise<void>}
     */
    updateHistory: ({ slug, content, originalSlug }: {
        slug: string;
        content: import("../../wiki.js").UttoriWikiDocument;
        originalSlug?: string | undefined;
    }, database?: import("better-sqlite3").Database) => Promise<void>;
    /**
     * Returns all documents.
     *
     * @returns {Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>} All documents.
     */
    all: () => Promise<Record<string, import("../../wiki.js").UttoriWikiDocument>>;
    /**
     * Returns all documents matching a given query using SQLite directly.
     *
     * @param {string} query The conditions on which documents should be returned.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]|number>} The items matching the supplied query.
     */
    getQuery: (query: string) => Promise<import("../../wiki.js").UttoriWikiDocument[] | number>;
    /**
     * Returns a document for a given slug.
     *
     * @param {string} slug The slug of the document to be returned.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument | undefined>} The returned UttoriDocument.
     */
    get: (slug: string) => Promise<import("../../wiki.js").UttoriWikiDocument | undefined>;
    /**
     * Returns the history of edits for a given slug.
     *
     * @param {string} slug The slug of the document to get history for.
     * @returns {Promise<string[]>} The returned history object.
     */
    getHistory: (slug: string) => Promise<string[]>;
    /**
     * Returns a specific revision from the history of edits for a given slug and revision timestamp.
     *
     * @param {object} params The params object.
     * @param {string} params.slug The slug of the document to be returned.
     * @param {string|number} params.revision The revision to be returned.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument | undefined>} The returned revision of the document.
     */
    getRevision: ({ slug, revision }: {
        slug: string;
        revision: string | number;
    }) => Promise<import("../../wiki.js").UttoriWikiDocument | undefined>;
    /**
     * Saves a document to SQLite.
     *
     * @param {import('../../wiki.js').UttoriWikiDocument} document The document to be added to the collection.
     * @param {SearchSQLiteContext} [context] A Uttori-like context.
     * @returns {Promise<void>}
     */
    add: (document: import("../../wiki.js").UttoriWikiDocument, context?: SearchSQLiteContext) => Promise<void>;
    /**
     * Updates a document and saves it to SQLite.
     *
     * @param {object} params The params object.
     * @param {import('../../wiki.js').UttoriWikiDocument} params.document The document to be updated in the collection.
     * @param {string} [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
     * @param {SearchSQLiteContext} [context] A Uttori-like context.
     * @returns {Promise<void>}
     */
    update: ({ document, originalSlug }: {
        document: import("../../wiki.js").UttoriWikiDocument;
        originalSlug?: string | undefined;
    }, context?: SearchSQLiteContext) => Promise<void>;
    /**
     * Removes a document from SQLite.
     *
     * @param {string|import('../../wiki.js').UttoriWikiDocument} slug The slug identifying the document.
     * @returns {Promise<void>}
     */
    delete: (slug: string | import("../../wiki.js").UttoriWikiDocument) => Promise<void>;
    /**
     * Resets to the initial state.
     *
     * @returns {void}
     */
    reset: () => void;
    /**
     * Bootstrap the search index at startup when configured.
     *
     * @param {unknown} _data Unused.
     * @param {SearchSQLiteContext} context A Uttori-like context.
     * @returns {Promise<void>}
     */
    bootstrapIndex: (_data: unknown, context: SearchSQLiteContext) => Promise<void>;
    /**
     * Rebuild the search index of documents.
     *
     * @param {unknown} _data Unused.
     * @param {SearchSQLiteContext} context A Uttori-like context.
     * @returns {Promise<void>}
     */
    buildIndex: (_data: unknown, context: SearchSQLiteContext) => Promise<void>;
    /**
     * Load all documents that should be indexed.
     *
     * @param {SearchSQLiteContext} context A Uttori-like context.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} The documents.
     */
    loadIndexableDocuments: (context: SearchSQLiteContext) => Promise<import("../../wiki.js").UttoriWikiDocument[]>;
    /**
     * Filter documents using configured ignore lists.
     *
     * @param {import('../../wiki.js').UttoriWikiDocument[]} documents The documents.
     * @returns {import('../../wiki.js').UttoriWikiDocument[]} The filtered documents.
     */
    filterIndexableDocuments: (documents: import("../../wiki.js").UttoriWikiDocument[]) => import("../../wiki.js").UttoriWikiDocument[];
    /**
     * Index one document.
     *
     * @param {import('../../wiki.js').UttoriWikiDocument} document The document to index.
     * @param {SearchSQLiteContext} [_context] A Uttori-like context.
     * @param {import('better-sqlite3').Database} [database] An optional existing database connection.
     * @returns {Promise<void>}
     */
    indexDocument: (document: import("../../wiki.js").UttoriWikiDocument, _context?: SearchSQLiteContext, database?: import("better-sqlite3").Database) => Promise<void>;
    /**
     * Adds documents to the index.
     *
     * @param {import('../../wiki.js').UttoriWikiDocument|import('../../wiki.js').UttoriWikiDocument[]} documents An array of documents to be indexed.
     * @param {SearchSQLiteContext} context A Uttori-like context.
     * @returns {Promise<void>}
     */
    indexAdd: (documents: import("../../wiki.js").UttoriWikiDocument | import("../../wiki.js").UttoriWikiDocument[], context: SearchSQLiteContext) => Promise<void>;
    /**
     * Updates documents in the index.
     *
     * @param {SearchSQLiteIndexUpdate | import('../../wiki.js').UttoriWikiDocument | Array<SearchSQLiteIndexUpdate | import('../../wiki.js').UttoriWikiDocument>} payload An array of documents to be indexed or update payloads.
     * @param {SearchSQLiteContext} context A Uttori-like context.
     * @returns {Promise<void>}
     */
    indexUpdate: (payload: SearchSQLiteIndexUpdate | import("../../wiki.js").UttoriWikiDocument | Array<SearchSQLiteIndexUpdate | import("../../wiki.js").UttoriWikiDocument>, context: SearchSQLiteContext) => Promise<void>;
    /**
     * Removes documents from the index.
     *
     * @param {string|import('../../wiki.js').UttoriWikiDocument|string[]|import('../../wiki.js').UttoriWikiDocument[]} documents An array of documents to be removed.
     * @param {SearchSQLiteContext} [_context] A Uttori-like context.
     * @returns {Promise<void>}
     */
    indexRemove: (documents: string | import("../../wiki.js").UttoriWikiDocument | string[] | import("../../wiki.js").UttoriWikiDocument[], _context?: SearchSQLiteContext) => Promise<void>;
    /**
     * Retrieve scored search chunks for RAG consumers.
     *
     * @param {SearchSQLiteConfigSearchOptions|string} options The search options or query.
     * @returns {Promise<import('../search-provider-sqlite.js').RetrieveResponse>} The retrieval result.
     */
    retrieve: (options: SearchSQLiteConfigSearchOptions | string) => Promise<import("../search-provider-sqlite.js").RetrieveResponse>;
    /**
     * Searches for documents matching the provided query with SQLite FTS first,
     * then falls back to LIKE matching when the vector / FTS index is unavailable.
     *
     * @param {SearchSQLiteConfigSearchOptions} options The passed in options.
     * @param {SearchSQLiteContext} [_context] A Uttori-like context.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} Returns an array of search results no longer than limit.
     */
    internalSearch: ({ query, limit, slugs }: SearchSQLiteConfigSearchOptions, _context?: SearchSQLiteContext) => Promise<import("../../wiki.js").UttoriWikiDocument[]>;
    /**
     * External method for searching documents matching the provided query and updates the count for the query used.
     *
     * @param {SearchSQLiteConfigSearchOptions} options The passed in options.
     * @param {SearchSQLiteContext} context A Uttori-like context.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} Returns an array of search results no longer than limit.
     */
    search: ({ query, limit, slugs }: SearchSQLiteConfigSearchOptions, context: SearchSQLiteContext) => Promise<import("../../wiki.js").UttoriWikiDocument[]>;
    /**
     * Handle requests to fetch available documents for document selectors.
     *
     * @returns {Promise<Array<{id: string, slug: string, title: string, update_date: number}>>} The documents.
     */
    listDocuments: () => Promise<Array<{
        id: string;
        slug: string;
        title: string;
        update_date: number;
    }>>;
    /**
     * Updates the search query in the query counts.
     *
     * @param {string} query The query to increment.
     * @returns {void}
     */
    updateTermCount: (query: string) => void;
    /**
     * Returns the most popular search terms.
     *
     * @param {SearchSQLiteConfigSearchOptions} options The passed in options.
     * @returns {string[]} Returns an array of search results no longer than limit.
     */
    getPopularSearchTerms: ({ limit }: SearchSQLiteConfigSearchOptions) => string[];
}
import Database from 'better-sqlite3';
import type { SqlWhereParserAst } from '../../../dist/custom.d.ts';
//# sourceMappingURL=search-sqlite.d.ts.map