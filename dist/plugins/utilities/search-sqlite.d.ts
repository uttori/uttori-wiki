import type { SqlWhereParserAst } from '../../custom.js';
import type { SearchSQLiteConfig, SearchSQLiteContext, SearchSQLiteDocumentRow, SearchSQLiteIndexUpdate, SearchSQLiteConfigSearchOptions } from '../../types/plugins/utilities/search-sqlite.js';
export type { SearchSQLiteConfig, SearchSQLiteContext, SearchSQLiteDocumentRow, SearchSQLiteSlugRow, SearchSQLiteCountRow, SearchSQLiteRevisionRow, SearchSQLiteIndexUpdate, SearchSQLiteConfigSearchOptions, } from '../../types/plugins/utilities/search-sqlite.js';
/**
 * Storage and search provider powered by SQLite, sqlite-vec, and FTS5.
 *
 */
declare class SearchProviderSQLite {
    /** The collection of search terms and their counts. */
    searchTerms: Record<string, number>;
    /** The provider configuration. */
    config: SearchSQLiteConfig;
    /**
     * Creates an instance of SearchProviderSQLite.
     *
     * @param [config] Configuration object for the class.
     */
    constructor(config?: Partial<SearchSQLiteConfig>);
    /**
     * Open the SQLite database and create core tables.
     *
     * @returns The database.
     */
    openDatabase: () => import('better-sqlite3').Database;
    /**
     * Normalize a SQLite row into an Uttori Wiki document.
     *
     * @param row The database row.
     * @returns The document.
     */
    rowToDocument: (row: SearchSQLiteDocumentRow | undefined) => import('../../wiki.js').UttoriWikiDocument | undefined;
    /**
     * Persist a document row.
     *
     * @param document The document to persist.
     * @param [database] An optional existing database connection.
     */
    saveDocument: (document: import('../../wiki.js').UttoriWikiDocument, database?: import('better-sqlite3').Database) => void;
    /**
     * Escapes a SQLite LIKE value.
     *
     * @param value The value to escape.
     * @returns The escaped value.
     */
    escapeLike: (value: string) => string;
    /**
     * Returns a safe JSON path expression for a document field.
     *
     * @param field The field.
     * @returns The JSON path.
     */
    jsonPath: (field: string) => string;
    /**
     * Returns the SQL expression for a document field.
     *
     * @param field The field.
     * @returns The SQL expression.
     */
    fieldExpression: (field: string) => string;
    /**
     * Converts a value into a SQLite value.
     *
     * @param value The value.
     * @returns The SQLite value.
     */
    toSqlValue: (value: unknown) => unknown;
    /**
     * Converts a parsed WHERE AST into SQLite SQL.
     *
     * @param ast The parsed WHERE AST.
     * @param values The values to bind.
     * @returns The SQL WHERE clause.
     */
    astToSql: (ast: SqlWhereParserAst, values: unknown[]) => string;
    /**
     * Build a SQLite query from the storage-provider SQL-like query syntax.
     *
     * @param query The SQL-like storage query.
     * @returns The SQLite query data.
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
     * @param params The params object.
     * @param params.slug The slug of the document to update history for.
     * @param params.content The revision of the document to be saved.
     * @param [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
     * @param [database] An optional existing database connection.
     */
    updateHistory: ({ slug, content, originalSlug }: {
        slug: string;
        content: import('../../wiki.js').UttoriWikiDocument;
        originalSlug?: string;
    }, database?: import('better-sqlite3').Database) => Promise<void>;
    /**
     * Returns all documents.
     *
     * @returns All documents.
     */
    all: () => Promise<Record<string, import('../../wiki.js').UttoriWikiDocument>>;
    /**
     * Returns all documents matching a given query using SQLite directly.
     *
     * @param query The conditions on which documents should be returned.
     * @returns The items matching the supplied query.
     */
    getQuery: (query: string) => Promise<import('../../wiki.js').UttoriWikiDocument[] | number>;
    /**
     * Returns a document for a given slug.
     *
     * @param slug The slug of the document to be returned.
     * @returns The returned UttoriDocument.
     */
    get: (slug: string) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Returns the history of edits for a given slug.
     *
     * @param slug The slug of the document to get history for.
     * @returns The returned history object.
     */
    getHistory: (slug: string) => Promise<string[]>;
    /**
     * Returns a specific revision from the history of edits for a given slug and revision timestamp.
     *
     * @param params The params object.
     * @param params.slug The slug of the document to be returned.
     * @param params.revision The revision to be returned.
     * @returns The returned revision of the document.
     */
    getRevision: ({ slug, revision }: {
        slug: string;
        revision: string | number;
    }) => Promise<import('../../wiki.js').UttoriWikiDocument | undefined>;
    /**
     * Saves a document to SQLite.
     *
     * @param document The document to be added to the collection.
     * @param [context] A Uttori-like context.
     */
    add: (document: import('../../wiki.js').UttoriWikiDocument, context?: SearchSQLiteContext) => Promise<void>;
    /**
     * Updates a document and saves it to SQLite.
     *
     * @param params The params object.
     * @param params.document The document to be updated in the collection.
     * @param [params.originalSlug] The original slug identifying the document, or the slug if it has not changed.
     * @param [context] A Uttori-like context.
     */
    update: ({ document, originalSlug }: {
        document: import('../../wiki.js').UttoriWikiDocument;
        originalSlug?: string;
    }, context?: SearchSQLiteContext) => Promise<void>;
    /**
     * Removes a document from SQLite.
     *
     * @param slug The slug identifying the document.
     */
    delete: (slug: string | import('../../wiki.js').UttoriWikiDocument) => Promise<void>;
    /**
     * Resets to the initial state.
     *
     */
    reset: () => void;
    /**
     * Bootstrap the search index at startup when configured.
     *
     * @param _data Unused.
     * @param context A Uttori-like context.
     */
    bootstrapIndex: (_data: unknown, context: SearchSQLiteContext) => Promise<void>;
    /**
     * Rebuild the search index of documents.
     *
     * @param _data Unused.
     * @param context A Uttori-like context.
     */
    buildIndex: (_data: unknown, context: SearchSQLiteContext) => Promise<void>;
    /**
     * Load all documents that should be indexed.
     *
     * @param context A Uttori-like context.
     * @returns The documents.
     */
    loadIndexableDocuments: (context: SearchSQLiteContext) => Promise<import('../../wiki.js').UttoriWikiDocument[]>;
    /**
     * Filter documents using configured ignore lists.
     *
     * @param documents The documents.
     * @returns The filtered documents.
     */
    filterIndexableDocuments: (documents: import('../../wiki.js').UttoriWikiDocument[]) => import('../../wiki.js').UttoriWikiDocument[];
    /**
     * Index one document.
     *
     * @param document The document to index.
     * @param [_context] A Uttori-like context.
     * @param [database] An optional existing database connection.
     */
    indexDocument: (document: import('../../wiki.js').UttoriWikiDocument, _context?: SearchSQLiteContext, database?: import('better-sqlite3').Database) => Promise<void>;
    /**
     * Adds documents to the index.
     *
     * @param documents An array of documents to be indexed.
     * @param context A Uttori-like context.
     */
    indexAdd: (documents: import('../../wiki.js').UttoriWikiDocument | import('../../wiki.js').UttoriWikiDocument[], context: SearchSQLiteContext) => Promise<void>;
    /**
     * Updates documents in the index.
     *
     * @param payload An array of documents to be indexed or update payloads.
     * @param context A Uttori-like context.
     */
    indexUpdate: (payload: SearchSQLiteIndexUpdate | import('../../wiki.js').UttoriWikiDocument | (SearchSQLiteIndexUpdate | import('../../wiki.js').UttoriWikiDocument)[], context: SearchSQLiteContext) => Promise<void>;
    /**
     * Removes documents from the index.
     *
     * @param documents An array of documents to be removed.
     * @param [_context] A Uttori-like context.
     */
    indexRemove: (documents: string | import('../../wiki.js').UttoriWikiDocument | string[] | import('../../wiki.js').UttoriWikiDocument[], _context?: SearchSQLiteContext) => Promise<void>;
    /**
     * Retrieve scored search chunks for RAG consumers.
     *
     * @param options The search options or query.
     * @returns The retrieval result.
     */
    retrieve: (options: SearchSQLiteConfigSearchOptions | string) => Promise<import('../search-provider-sqlite.js').RetrieveResponse>;
    /**
     * Searches for documents matching the provided query with SQLite FTS first,
     * then falls back to LIKE matching when the vector / FTS index is unavailable.
     *
     * @param options The passed in options.
     * @param [_context] A Uttori-like context.
     * @returns Returns an array of search results no longer than limit.
     */
    internalSearch: ({ query, limit, slugs }: SearchSQLiteConfigSearchOptions, _context?: SearchSQLiteContext) => Promise<import('../../wiki.js').UttoriWikiDocument[]>;
    /**
     * External method for searching documents matching the provided query and updates the count for the query used.
     *
     * @param options The passed in options.
     * @param context A Uttori-like context.
     * @returns Returns an array of search results no longer than limit.
     */
    search: ({ query, limit, slugs }: SearchSQLiteConfigSearchOptions, context: SearchSQLiteContext) => Promise<import('../../wiki.js').UttoriWikiDocument[]>;
    /**
     * Handle requests to fetch available documents for document selectors.
     *
     * @returns The documents.
     */
    listDocuments: () => Promise<{
        id: string;
        slug: string;
        title: string;
        update_date: number;
    }[]>;
    /**
     * Updates the search query in the query counts.
     *
     * @param query The query to increment.
     */
    updateTermCount: (query: string) => void;
    /**
     * Returns the most popular search terms.
     *
     * @param options The passed in options.
     * @returns Returns an array of search results no longer than limit.
     */
    getPopularSearchTerms: ({ limit }: SearchSQLiteConfigSearchOptions) => string[];
}
export default SearchProviderSQLite;
//# sourceMappingURL=search-sqlite.d.ts.map