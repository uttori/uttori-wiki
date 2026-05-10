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
 * Format a {@link import('../ai-chat-bot.js').RetrieveResponse} into the compact context
 * block string that is sent back to the model as a tool result.
 * Each chunk becomes a block:
 * ```
 * SOURCE: <title>[ - <section path>]
 * SLUG: <slug>
 * ---
 * <text (truncated to MAX_CHUNK_CHARS)>
 * ```
 * Blocks are joined with `\n\n====\n\n`.
 * @param {import('../ai-chat-bot.js').RetrieveResponse} result The retrieval result.
 * @returns {string} The formatted context block.
 */
export function formatRetrievalResult(result: import("../ai-chat-bot.js").RetrieveResponse): string;
/**
 * Execute a named chat tool and return its formatted result.
 * Unknown tool names return an error object consistent with the original behaviour.
 * @param {string} name The tool name as returned by the model.
 * @param {Record<string, any>} args The arguments object from the model's tool call.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The chat bot configuration.
 * @param {RetrieveFn} [retrieveFn] Optional retrieval function override, primarily for testing.
 * @returns {Promise<string | ChatToolResult>} The formatted result string, or an error object.
 */
export function executeChatTool(name: string, args: Record<string, any>, config: import("../ai-chat-bot.js").AIChatBotConfig, retrieveFn?: RetrieveFn): Promise<string | ChatToolResult>;
/**
 * Built-in Ollama tool schema for `vectorSearch`.
 * Passed verbatim in the `tools` array of every `/api/chat` request.
 * @type {OllamaTool}
 */
export const vectorSearchTool: OllamaTool;
/**
 * Map of all built-in chat tools indexed by their name.
 * Extend this map to register additional tools without changing `runChatPass`.
 * @type {Map<string, OllamaTool>}
 */
export const BUILT_IN_TOOLS: Map<string, OllamaTool>;
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
     * Set when the tool name is unknown.
     */
    error?: string;
};
/**
 * Signature of the retrieval function accepted by {@link executeChatTool}.
 * Matches the signature of `retrieve` from `./retrieval.js`.
 */
export type RetrieveFn = (query: string, config: import("../ai-chat-bot.js").AIChatBotConfig, slugs: string[]) => Promise<import("../ai-chat-bot.js").RetrieveResponse>;
//# sourceMappingURL=tools.d.ts.map