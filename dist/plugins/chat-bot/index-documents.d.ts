/**
 * Build blocks from a document.
 * @param {import('../../wiki.js').UttoriWikiDocument} document The document to build blocks from.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options.
 * @returns {Promise<import('../ai-chat-bot.js').Block[]>} The blocks.
 */
export function buildBlocks(document: import("../../wiki.js").UttoriWikiDocument, config: import("../ai-chat-bot.js").AIChatBotConfig): Promise<import("../ai-chat-bot.js").Block[]>;
/**
 * Index all documents in the database.
 * @param {Record<string, import('../ai-chat-bot.js').AIChatBotConfig>} fullConfig The configuration.
 * @param {import('../../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', import('../ai-chat-bot.js').AIChatBotConfig>} context The context.
 * @returns {Promise<void>} The indexed documents.
 */
export function indexAllDocuments(fullConfig: Record<string, import("../ai-chat-bot.js").AIChatBotConfig>, context: import("../../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", import("../ai-chat-bot.js").AIChatBotConfig>): Promise<void>;
//# sourceMappingURL=index-documents.d.ts.map