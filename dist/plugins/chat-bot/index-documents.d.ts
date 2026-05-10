/**
 * Build blocks from a document.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to build blocks from.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options.
 * @returns {Promise<import('../ai-chat-bot.js').Block[]>} The blocks.
 */
export function buildBlocks(document: import("../../wiki.js").UttoriWikiDocument, config: import("../ai-chat-bot.js").AIChatBotConfig): Promise<import("../ai-chat-bot.js").Block[]>;
/**
 * @typedef {object} ChatIndexSchemaOptions
 * @property {boolean} [rebuild] Whether to rebuild index tables.
 */
/**
 * Ensure the chat index tables exist.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options.
 * @param {ChatIndexSchemaOptions} [options] Schema options.
 * @returns {Promise<{ embedder: OllamaEmbedder, dim: number }>} The embedder and vector dimension.
 */
export function ensureChatIndexSchema(db: import("better-sqlite3/index.js").Database, config: import("../ai-chat-bot.js").AIChatBotConfig, options?: ChatIndexSchemaOptions): Promise<{
    embedder: OllamaEmbedder;
    dim: number;
}>;
/**
 * Remove a document and all of its chunks from the chat index.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {string} slug The source slug to remove.
 */
export function removeIndexedDocumentFromDatabase(db: import("better-sqlite3/index.js").Database, slug: string): void;
/**
 * Remove a document from the chat index.
 * @param {Record<string, import('../ai-chat-bot.js').AIChatBotConfig>} fullConfig The configuration.
 * @param {string} slug The source slug to remove.
 */
export function removeIndexedDocument(fullConfig: Record<string, import("../ai-chat-bot.js").AIChatBotConfig>, slug: string): void;
/**
 * Index one document using an already-open database.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options.
 * @param {OllamaEmbedder} embedder The embedder.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to index.
 * @returns {Promise<{ chunks: number, skipped: boolean, errored: number }>} Indexing stats.
 */
export function indexDocumentInDatabase(db: import("better-sqlite3/index.js").Database, config: import("../ai-chat-bot.js").AIChatBotConfig, embedder: OllamaEmbedder, document: import("../../wiki.js").UttoriWikiDocument): Promise<{
    chunks: number;
    skipped: boolean;
    errored: number;
}>;
/**
 * Index one document in the database.
 * @param {Record<string, import('../ai-chat-bot.js').AIChatBotConfig>} fullConfig The configuration.
 * @param {import('../../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', import('../ai-chat-bot.js').AIChatBotConfig>} _context The context.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to index.
 * @returns {Promise<void>} The indexed document.
 */
export function indexDocument(fullConfig: Record<string, import("../ai-chat-bot.js").AIChatBotConfig>, _context: import("../../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", import("../ai-chat-bot.js").AIChatBotConfig>, document: import("../../wiki.js").UttoriWikiDocument): Promise<void>;
/**
 * Index all documents in the database.
 * @param {Record<string, import('../ai-chat-bot.js').AIChatBotConfig>} fullConfig The configuration.
 * @param {import('../../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', import('../ai-chat-bot.js').AIChatBotConfig>} context The context.
 * @returns {Promise<void>} The indexed documents.
 */
export function indexAllDocuments(fullConfig: Record<string, import("../ai-chat-bot.js").AIChatBotConfig>, context: import("../../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", import("../ai-chat-bot.js").AIChatBotConfig>): Promise<void>;
export type ChatIndexSchemaOptions = {
    /**
     * Whether to rebuild index tables.
     */
    rebuild?: boolean;
};
import OllamaEmbedder from './ollama-embedder.js';
//# sourceMappingURL=index-documents.d.ts.map