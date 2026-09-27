import OllamaEmbedder from './ollama-embedder.js';
import type { ChatIndexSchemaOptions } from '../../types/plugins/chat-bot/index-documents.js';
export type { ChatIndexSchemaOptions } from '../../types/plugins/chat-bot/index-documents.js';
/**
 * Build blocks from a document.
 * @param document The document to build blocks from.
 * @param config The options.
 * @returns The blocks.
 */
export declare function buildBlocks(document: import('../../wiki.js').UttoriWikiDocument, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig): Promise<import('../search-provider-sqlite.js').IndexedBlock[]>;
/**
 * Ensure the chat index tables exist.
 * @param db The database.
 * @param config The options.
 * @param [options] Schema options.
 * @returns The embedder and vector dimension.
 */
export declare function ensureChatIndexSchema(db: import('better-sqlite3').Database, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig, options?: ChatIndexSchemaOptions): Promise<{
    embedder: OllamaEmbedder;
    dim: number;
}>;
/**
 * Remove a document and all of its chunks from the chat index.
 * @param db The database.
 * @param slug The source slug to remove.
 */
export declare function removeIndexedDocumentFromDatabase(db: import('better-sqlite3').Database, slug: string): void;
/**
 * Index one document using an already-open database.
 * @param db The database.
 * @param config The options.
 * @param embedder The embedder.
 * @param document The document to index.
 * @returns Indexing stats.
 */
export declare function indexDocumentInDatabase(db: import('better-sqlite3').Database, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig, embedder: OllamaEmbedder, document: import('../../wiki.js').UttoriWikiDocument): Promise<{
    chunks: number;
    skipped: boolean;
    errored: number;
}>;
//# sourceMappingURL=index-documents.d.ts.map