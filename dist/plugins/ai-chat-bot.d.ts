/**
 * @typedef {object} AIChatBotConfig
 * @property {Record<string, string[]>} [events] Events to bind to.
 * @property {string} apiRoute The API route for streaming to and from the chat bot interface.
 * @property {string} publicRoute Server route to show the chat bot interface.
 * @property {string} documentsRoute Server route to fetch available documents for the document selector.
 * @property {string[]} allowedReferrers When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an rmpty array don't check at all.
 * @property {function(import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>): import('express').RequestHandler} [interfaceRequestHandler] A request handler for the interface route.
 * @property {import('express').RequestHandler[]} middlewareApiRoute Custom Middleware for the API route.
 * @property {import('express').RequestHandler[]} middlewarePublicRoute Custom Middleware for the public route.
 * @property {string} databasePath The path to the database.
 * @property {Database.Options} databseOptions The options for the database.
 * @property {string} ollamaBaseUrl The base URL for the Ollama server.
 * @property {string} embedModel The model to use for the embedder.
 * @property {string} chatModel The model to use for the chat.
 * @property {number} maxTokens The maximum number of tokens to generate. The default value for `num_predict` is typically 128 tokens, though it can also be set to -1 for infinite generation (no limit) or -2 to fill the entire context window.
 * @property {number} temperature The temperature for the model.
 * @property {number} chunkLimit The limit for the number of chunks to return.
 * @property {boolean} hybrid Whether to use the hybrid approach of vector & FTS.
 * @property {boolean} fts Whether to use the FTS index.
 * @property {number} ftsWeight The weight for the FTS index.
 * @property {number} titleBoost The title boost for the entities.
 * @property {number} textBoost The text boost for the entities.
 * @property {number} ftsWeightBump The FTS weight bump for the entities.
 * @property {number} maxContextTokens The maximum number of tokens to use for the context.
 * @property {number} maxPerSource The maximum number of sources to use per source.
 * @property {number} batch The batch size for the embedder.
 * @property {string[]} ignoreSlugs Slugs to ignore.
 * @property {string[]} ignoreTags Tags to ignore.
 * @property {string} attachmentsRoot The root path to the attachments.
 * @property {boolean} includeAttachments Whether to include attachments.
 * @property {function(AIChatBotConfig, import('../wiki.js').UttoriWikiDocumentAttachment): Promise<string>} [extractAttachmentText] The function to use to extract text from an attachment.
 * @property {number} chunkTokens Used during indexing, the number of tokens per chunk.
 * @property {number} overlapTokens Used during indexing, the number of tokens to overlap between chunks.
 * @property {import('./renderer-markdown-it.js').MarkdownItRendererConfig} markdownItPluginConfig The markdown-it plugin configuration.
 * @property {object} entities The entities configuration.
 * @property {boolean} entities.enabled Whether to use the entities.
 * @property {string} entities.baseUrl The base URL for the entities server.
 * @property {string} entities.model The model to use for the entities.
 * @property {number} entities.max The maximum number of entities to return.
 * @property {object} rewriter The rewriter configuration.
 * @property {boolean} rewriter.enabled Whether to use the rewriter.
 * @property {string} rewriter.baseUrl The base URL for the rewriter.
 * @property {string} rewriter.model The model to use for the rewriter.
 * @property {number} rewriter.numberOfQueries The number of queries to use for the rewriter.
 * @property {boolean} rewriter.includeOriginal Whether to include the original query in the rewriter.
 * @property {number} rewriter.temperature The temperature for the rewriter.
 * @property {object} rerank The rerank configuration.
 * @property {boolean} rerank.enabled Whether to use the rerank.
 * @property {string} rerank.baseUrl The base URL for the rerank.
 * @property {string} rerank.model The model to use for the rerank.
 * @property {number} rerank.topN The top N to use for the rerank.
 * @property {object} summary The summary configuration.
 * @property {boolean} summary.enabled Whether to use the summary.
 * @property {string} summary.baseUrl The base URL for the summary.
 * @property {string} summary.model The model to use for the summary.
 */
/**
 * @typedef {object} AIChatBotApiRequestBody
 * @property {string} sessionId The session ID.
 * @property {string} query The query.
 * @property {string[]} slugs The slugs.
 */
/**
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param {AIChatBotConfig} config The configuration.
 * @param {import('../wiki.js').UttoriWikiDocumentAttachment} attachment The attachment.
 * @returns {Promise<string>} The text of the attachment.
 */
export function extractAttachmentText(config: AIChatBotConfig, attachment: import("../wiki.js").UttoriWikiDocumentAttachment): Promise<string>;
export default AIChatBot;
export type AIChatBotConfig = {
    /**
     * Events to bind to.
     */
    events?: Record<string, string[]>;
    /**
     * The API route for streaming to and from the chat bot interface.
     */
    apiRoute: string;
    /**
     * Server route to show the chat bot interface.
     */
    publicRoute: string;
    /**
     * Server route to fetch available documents for the document selector.
     */
    documentsRoute: string;
    /**
     * When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an rmpty array don't check at all.
     */
    allowedReferrers: string[];
    /**
     * A request handler for the interface route.
     */
    interfaceRequestHandler?: (arg0: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", AIChatBotConfig>) => import("express").RequestHandler;
    /**
     * Custom Middleware for the API route.
     */
    middlewareApiRoute: import("express").RequestHandler[];
    /**
     * Custom Middleware for the public route.
     */
    middlewarePublicRoute: import("express").RequestHandler[];
    /**
     * The path to the database.
     */
    databasePath: string;
    /**
     * The options for the database.
     */
    databseOptions: Database.Options;
    /**
     * The base URL for the Ollama server.
     */
    ollamaBaseUrl: string;
    /**
     * The model to use for the embedder.
     */
    embedModel: string;
    /**
     * The model to use for the chat.
     */
    chatModel: string;
    /**
     * The maximum number of tokens to generate. The default value for `num_predict` is typically 128 tokens, though it can also be set to -1 for infinite generation (no limit) or -2 to fill the entire context window.
     */
    maxTokens: number;
    /**
     * The temperature for the model.
     */
    temperature: number;
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
     * The title boost for the entities.
     */
    titleBoost: number;
    /**
     * The text boost for the entities.
     */
    textBoost: number;
    /**
     * The FTS weight bump for the entities.
     */
    ftsWeightBump: number;
    /**
     * The maximum number of tokens to use for the context.
     */
    maxContextTokens: number;
    /**
     * The maximum number of sources to use per source.
     */
    maxPerSource: number;
    /**
     * The batch size for the embedder.
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
    extractAttachmentText?: (arg0: AIChatBotConfig, arg1: import("../wiki.js").UttoriWikiDocumentAttachment) => Promise<string>;
    /**
     * Used during indexing, the number of tokens per chunk.
     */
    chunkTokens: number;
    /**
     * Used during indexing, the number of tokens to overlap between chunks.
     */
    overlapTokens: number;
    /**
     * The markdown-it plugin configuration.
     */
    markdownItPluginConfig: import("./renderer-markdown-it.js").MarkdownItRendererConfig;
    /**
     * The entities configuration.
     */
    entities: {
        enabled: boolean;
        baseUrl: string;
        model: string;
        max: number;
    };
    /**
     * The rewriter configuration.
     */
    rewriter: {
        enabled: boolean;
        baseUrl: string;
        model: string;
        numberOfQueries: number;
        includeOriginal: boolean;
        temperature: number;
    };
    /**
     * The rerank configuration.
     */
    rerank: {
        enabled: boolean;
        baseUrl: string;
        model: string;
        topN: number;
    };
    /**
     * The summary configuration.
     */
    summary: {
        enabled: boolean;
        baseUrl: string;
        model: string;
    };
};
export type AIChatBotApiRequestBody = {
    /**
     * The session ID.
     */
    sessionId: string;
    /**
     * The query.
     */
    query: string;
    /**
     * The slugs.
     */
    slugs: string[];
};
export type StreamHandlers = {
    /**
     * The function to call when a token is received.
     */
    onToken: (arg0: string) => void | Promise<void>;
    /**
     * The function to call when the stream is done.
     */
    onDone: () => void | Promise<void>;
};
export type RetrievedChunk = {
    /**
     * The rowid of the chunk.
     */
    rowid: number;
    /**
     * The source id of the chunk.
     */
    source_id: string;
    /**
     * The index of the chunk.
     */
    idx: number;
    /**
     * The text of the chunk.
     */
    text: string;
    /**
     * The token count of the chunk.
     */
    token_count: number;
    /**
     * The section path of the chunk.
     */
    sectionPath: string[];
    /**
     * The source of the chunk.
     */
    source: {
        id: string;
        title?: string;
        slug?: string;
    };
    /**
     * The score of the chunk.
     */
    score: number;
};
export type RetrieveResponse = {
    /**
     * The query.
     */
    query: string;
    /**
     * The chunks.
     */
    chunks: RetrievedChunk[];
    /**
     * The citations.
     */
    citations: any[];
};
export type FtsRow = {
    /**
     * The rowid of the chunk.
     */
    rowid: number;
    /**
     * The source id of the chunk.
     */
    source_id: string;
    /**
     * The index of the chunk.
     */
    idx: number;
    /**
     * The text of the chunk.
     */
    text: string;
    /**
     * The token count of the chunk.
     */
    token_count: number;
    /**
     * The meta JSON of the chunk.
     */
    meta_json: string;
    /**
     * The title of the source.
     */
    source_title: string;
    /**
     * The slug of the source.
     */
    source_slug: string;
    /**
     * The rank of the chunk.
     */
    rank: number;
};
export type Block = {
    /**
     * The type of block.
     */
    type?: "heading" | "paragraph";
    /**
     * The level of the heading.
     */
    level?: number;
    /**
     * The text of the block.
     */
    text: string;
    /**
     * The section path of the block.
     */
    sectionPath: string[];
    /**
     * The token count of the block.
     */
    tokenCount?: number;
    /**
     * The tags of the block.
     */
    tags?: string[];
    /**
     * The slug of the block.
     */
    slug?: string;
};
export type ChunkWithMeta = {
    /**
     * The text of the chunk.
     */
    text: string;
    /**
     * The index of the chunk.
     */
    idx: number;
    /**
     * The token count of the chunk.
     */
    token_count: number;
    /**
     * The section path of the chunk.
     */
    sectionPath: string[];
    /**
     * The source id of the chunk.
     */
    source_id?: string;
    /**
     * The embedding of the chunk.
     */
    embedding?: number[];
    /**
     * The meta JSON of the chunk.
     */
    meta?: object;
};
export type BlendedChunk = {
    /**
     * The rowid of the chunk.
     */
    rowid: number;
    /**
     * The score of the chunk.
     */
    score: number;
    /**
     * The title boost of the chunk.
     */
    titleBoost: number;
    /**
     * The text boost of the chunk.
     */
    textBoost: number;
};
export type ChatBotMessage = {
    /**
     * The role of the message.
     */
    role: "system" | "user" | "assistant" | "tool";
    /**
     * The content of the message.
     */
    content: string;
};
/**
 * Uttori AI Chat Bot
 * @example <caption>AIChatBot</caption>
 * const content = AIChatBot.chat(context);
 * @class
 */
declare class AIChatBot {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>AIChatBot.configKey</caption>
     * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {AIChatBotConfig} The configuration.
     * @example <caption>AIChatBot.defaultConfig()</caption>
     * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
     * @static
     */
    static defaultConfig(): AIChatBotConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, AIChatBotConfig>} config - A provided configuration to use.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} [_context] Unused.
     * @example <caption>AIChatBot.validateConfig(config, _context)</caption>
     * AIChatBot.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, AIChatBotConfig>, _context?: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", AIChatBotConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
     * @example <caption>AIChatBot.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [AIChatBot.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * AIChatBot.register(context);
     * @static
     */
    static register(context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", AIChatBotConfig>): Promise<void>;
    /**
     * Add the upload route to the server object.
     * @param {import('express').Application} server An Express server instance.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
     * @example <caption>AIChatBot.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [AIChatBot.configKey]: {
     *       middlewareApiRoute: [],
     *       middlewarePublicRoute: [],
     *     },
     *   },
     * };
     * AIChatBot.bindRoutes(server, context);
     * @static
     */
    static bindRoutes(server: import("express").Application, context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", AIChatBotConfig>): void;
    /**
     * Handle requests to fetch available documents for the document selector.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static documentsHandler(context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", AIChatBotConfig>): import("express").RequestHandler;
    /**
     * The Express route method to process the upload request and provide a response.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler<{}, { error: string }, AIChatBotApiRequestBody>} The function to pass to Express.
     * @example <caption>AIChatBot.apiRequestHandler(context)(request, response, _next)</caption>
     * server.post('/chat-api', AIChatBot.apiRequestHandler(context));
     * @static
     */
    static apiRequestHandler(context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", AIChatBotConfig>): import("express").RequestHandler<{}, {
        error: string;
    }, AIChatBotApiRequestBody>;
    /**
     * Build messages for the AI chat bot.
     * @param {string} userQuestion The user's question.
     * @param {RetrievedChunk[]} chunks The chunks of text to use as context.
     * @param {object} opts The options for the prompt.
     * @param {number} opts.maxContextCharacters The maximum number of characters to include in the context.
     * @returns {ChatBotMessage[]} The messages for the AI chat bot.
     */
    static buildPromptMessages(userQuestion: string, chunks: RetrievedChunk[], opts: {
        maxContextCharacters: number;
    }): ChatBotMessage[];
    /**
     * Rewrite the user's question into diverse, self-contained search queries for a documentation/wiki RAG system.
     * @param {string} baseUrl The base URL of the API.
     * @param {string} model The model to use for the rewriter.
     * @param {string} userQuery The user's question.
     * @param {number} numberOfQueries The number of queries to generate.
     * @param {number} temperature The temperature for the rewriter.
     * @returns {Promise<string[]>} The rewritten queries.
     */
    static rewriteQueries(baseUrl: string, model: string, userQuery: string, numberOfQueries: number, temperature: number): Promise<string[]>;
    /**
     * Summarize the conversation between the user and the assistant.
     * @param {string} baseUrl The base URL of the API.
     * @param {string} model The model to use for the summarizer.
     * @param {string} prevSummary The previous summary of the conversation.
     * @param {object[]} lastTurns The last turns of the conversation.
     * @param {string} newUser The new user message.
     * @param {string} newAssistant The new assistant message.
     * @returns {Promise<string>} The new summary of the conversation.
     */
    static summarizeTurn(baseUrl: string, model: string, prevSummary: string, lastTurns: object[], newUser: string, newAssistant: string): Promise<string>;
    /**
     * Stream the response from the AI chat bot.
     * @param {string} baseUrl The base URL of the API.
     * @param {string} model The model to use for the chat bot.
     * @param {number} temperature The temperature for the chat bot.
     * @param {number} maxTokens The maximum number of tokens to generate.
     * @param {ChatBotMessage[]} messages The messages to send to the chat bot.
     * @param {StreamHandlers} handler The handler for the chat bot.
     * @returns {Promise<void>} The response from the chat bot.
     */
    static stream(baseUrl: string, model: string, temperature: number, maxTokens: number, messages: ChatBotMessage[], handler: StreamHandlers): Promise<void>;
    /**
     * Open the database and create the necessary tables if they don't exist.
     * @param {Partial<AIChatBotConfig>} config The configuration.
     * @returns {import('better-sqlite3').Database} The database.
     */
    static openDatabase(config: Partial<AIChatBotConfig>): import("better-sqlite3").Database;
    /**
     * Extract 1 to 6 short entities/concepts from the question.
     * Returns a lowercase array; strictly JSON (no prose).
     * @param {string} baseUrl The base URL of the Ollama server.
     * @param {string} model The model to use for entity extraction.
     * @param {string} question The question to extract entities from.
     * @param {number} max The maximum number of entities to extract, defaults to 5.
     * @returns {Promise<string[]>} A lowercase array of entities.
     */
    static extractEntities(baseUrl: string, model: string, question: string, max?: number): Promise<string[]>;
    /**
     * Embed a query using the Ollama API.
     * @param {string} baseUrl The base URL of the Ollama server.
     * @param {string} model The model to use for embedding.
     * @param {string} text The text to embed.
     * @returns {Promise<Float32Array>} The embedded query.
     */
    static embedQuery(baseUrl: string, model: string, text: string): Promise<Float32Array>;
    /**
     * Rerank the chunks using a local LLM (0=irrelevant..3=high)
     * @param {string} baseUrl The base URL of the Ollama server.
     * @param {string} model The model to use for reranking.
     * @param {string} query The query to rerank the chunks for.
     * @param {RetrievedChunk[]} chunks The chunks to rerank.
     * @returns {Promise<RetrievedChunk[]>} The reranked chunks.
     */
    static localRerank(baseUrl: string, model: string, query: string, chunks: RetrievedChunk[]): Promise<RetrievedChunk[]>;
    /**
     * Retrieve chunks from the database.
     * @param {string} query The query to retrieve chunks for.
     * @param {AIChatBotConfig} config The options for the retrieval.
     * @param {string[]} [slugs] Optional array of source slugs to restrict search to.
     * @returns {Promise<RetrieveResponse>} The retrieved chunks.
     */
    static retrieve(query: string, config: AIChatBotConfig, slugs?: string[]): Promise<RetrieveResponse>;
}
import Database from 'better-sqlite3';
//# sourceMappingURL=ai-chat-bot.d.ts.map