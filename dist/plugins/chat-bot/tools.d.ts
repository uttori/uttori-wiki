/**
 * Build the array of Ollama tool schemas to include in an `/api/chat` request.
 * When `config.tools` is a non-empty array it is used as-is, so callers retain
 * full control. When it is empty or absent the built-in wiki tools are used.
 * Pass `config.tools = null` (or any non-array) to disable tools entirely.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The chat bot configuration.
 * @returns {OllamaTool[]} The tool schemas for Ollama.
 */
export function buildChatTools(config: import("../ai-chat-bot.js").AIChatBotConfig): OllamaTool[];
/**
 * Format a {@link import('../search-provider-sqlite.js').RetrieveResponse} into the compact context
 * block string that is sent back to the model as a tool result.
 * Each chunk becomes a block:
 * ```
 * SOURCE: <title>[ - <section path>]
 * SLUG: <slug>
 * ---
 * <text (truncated to MAX_CHUNK_CHARS)>
 * ```
 * Blocks are joined with `\n\n====\n\n`.
 * @param {import('../search-provider-sqlite.js').RetrieveResponse} result The retrieval result.
 * @returns {string} The formatted context block.
 */
export function formatRetrievalResult(result: import("../search-provider-sqlite.js").RetrieveResponse): string;
/**
 * @typedef {object} ChatToolExecutionContext
 * @property {import('@uttori/event-dispatcher').EventDispatcher} [hooks] The Uttori event dispatcher.
 * @property {object} [context] The full Uttori context.
 * @property {import('../ai-chat-bot.js').AIChatBotConfig} [config] The chat bot configuration.
 */
/**
 * Execute a named chat tool and return its result.
 * Tools are resolved through the shared wiki tool registry, which dispatches to the
 * registered storage / search providers via the Uttori hook system. The `vectorSearch`
 * tool result is post-formatted into the compact context block expected by the model;
 * all other tools return their structured result JSON-serialized.
 * Unknown tool names and missing providers return an error object.
 * @param {string} name The tool name as returned by the model.
 * @param {Record<string, any>} args The arguments object from the model's tool call.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The chat bot configuration.
 * @param {ChatToolExecutionContext} context A Uttori-like context exposing `hooks`.
 * @returns {Promise<string | ChatToolResult>} The formatted/serialized result string, or an error object.
 */
export function executeChatTool(name: string, args: Record<string, any>, config: import("../ai-chat-bot.js").AIChatBotConfig, context: ChatToolExecutionContext): Promise<string | ChatToolResult>;
/**
 * Built-in Ollama tool schema for `vectorSearch`.
 * Derived from the shared registry so the chat bot and MCP provider stay in sync.
 * @type {OllamaTool}
 */
export const vectorSearchTool: OllamaTool;
/**
 * Map of all built-in chat tools indexed by their name.
 * Built from the shared wiki tool registry.
 * @type {Map<string, OllamaTool>}
 */
export const BUILT_IN_TOOLS: Map<string, OllamaTool>;
export type ChatToolExecutionContext = {
    /**
     * The Uttori event dispatcher.
     */
    hooks?: import("@uttori/event-dispatcher").EventDispatcher | undefined;
    /**
     * The full Uttori context.
     */
    context?: object | undefined;
    /**
     * The chat bot configuration.
     */
    config?: import("../ai-chat-bot.js").AIChatBotConfig | undefined;
};
export type OllamaToolFunction = {
    /**
     * The function name.
     */
    name: string;
    /**
     * The function description.
     */
    description: string;
    /**
     * The JSON Schema for the function parameters.
     */
    parameters: object;
};
export type OllamaTool = {
    /**
     * The type of tool.
     */
    type: "function";
    /**
     * The function definition.
     */
    function: OllamaToolFunction;
};
export type ChatToolResult = {
    /**
     * Set when the tool name is unknown or no provider handled it.
     */
    error?: string | undefined;
};
//# sourceMappingURL=tools.d.ts.map