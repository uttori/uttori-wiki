import OllamaEmbedder from './ollama-embedder.js';
/**
 * Build blocks from a document.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to build blocks from.
 * @param {import('../search-provider-sqlite.js').SearchSQLiteConfig} config The options.
 * @returns {Promise<import('../search-provider-sqlite.js').Block[]>} The blocks.
 */
export declare function buildBlocks(document: import('../../wiki.js').UttoriWikiDocument, config: import('../search-provider-sqlite.js').SearchSQLiteConfig): Promise<import('../search-provider-sqlite.js').Block[]>;
export type ChatIndexSchemaOptions = {
    /**
     * Whether to rebuild index tables.
     */
    rebuild?: boolean;
};
/**
 * @typedef {object} ChatIndexSchemaOptions
 * @property {boolean} [rebuild] Whether to rebuild index tables.
 */
/**
 * Ensure the chat index tables exist.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {import('../search-provider-sqlite.js').SearchSQLiteConfig} config The options.
 * @param {ChatIndexSchemaOptions} [options] Schema options.
 * @returns {Promise<{ embedder: OllamaEmbedder, dim: number }>} The embedder and vector dimension.
 */
export declare function ensureChatIndexSchema(db: import('better-sqlite3/index.js').Database, config: import('../search-provider-sqlite.js').SearchSQLiteConfig, options?: ChatIndexSchemaOptions): Promise<{
    embedder: OllamaEmbedder;
    dim: number;
}>;
/**
 * Remove a document and all of its chunks from the chat index.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {string} slug The source slug to remove.
 */
export declare function removeIndexedDocumentFromDatabase(db: import('better-sqlite3/index.js').Database, slug: string): void;
/**
 * Index one document using an already-open database.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {import('../search-provider-sqlite.js').SearchSQLiteConfig} config The options.
 * @param {OllamaEmbedder} embedder The embedder.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to index.
 * @returns {Promise<{ chunks: number, skipped: boolean, errored: number }>} Indexing stats.
 */
export declare function indexDocumentInDatabase(db: import('better-sqlite3/index.js').Database, config: import('../search-provider-sqlite.js').SearchSQLiteConfig, embedder: OllamaEmbedder, document: import('../../wiki.js').UttoriWikiDocument): Promise<{
    chunks: number;
    skipped: boolean;
    errored: number;
}>;
//# sourceMappingURL=index-documents.d.ts.map