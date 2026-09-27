import type { OllamaTool, ChatToolResult, ChatToolExecutionContext } from '../../types/plugins/chat-bot/tools.js';
export type { OllamaToolFunction, OllamaTool, ChatToolResult, ChatToolExecutionContext, } from '../../types/plugins/chat-bot/tools.js';
/**
 * Built-in Ollama tool schema for `vectorSearch`.
 * Derived from the shared registry so the chat bot and MCP provider stay in sync.
 *
 */
export declare const vectorSearchTool: OllamaTool;
/**
 * Map of all built-in chat tools indexed by their name.
 * Built from the shared wiki tool registry.
 *
 */
export declare const BUILT_IN_TOOLS: Map<string, OllamaTool>;
/**
 * Build the array of Ollama tool schemas to include in an `/api/chat` request.
 * When `config.tools` is a non-empty array it is used as-is, so callers retain
 * full control. When it is empty or absent the built-in wiki tools are used.
 * Pass `config.tools = null` (or any non-array) to disable tools entirely.
 * @param config The chat bot configuration.
 * @returns The tool schemas for Ollama.
 */
export declare function buildChatTools(config: import('../ai-chat-bot.js').AIChatBotConfig): OllamaTool[];
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
 * @param result The retrieval result.
 * @returns The formatted context block.
 */
export declare function formatRetrievalResult(result: import('../search-provider-sqlite.js').RetrieveResponse): string;
/**
 * Execute a named chat tool and return its result.
 * Tools are resolved through the shared wiki tool registry, which dispatches to the
 * registered storage / search providers via the Uttori hook system. The `vectorSearch`
 * tool result is post-formatted into the compact context block expected by the model;
 * all other tools return their structured result JSON-serialized.
 * Unknown tool names and missing providers return an error object.
 * @param name The tool name as returned by the model.
 * @param args The arguments object from the model's tool call.
 * @param config The chat bot configuration.
 * @param context A Uttori-like context exposing `hooks`.
 * @returns The formatted/serialized result string, or an error object.
 */
export declare function executeChatTool(name: string, args: Record<string, unknown>, config: import('../ai-chat-bot.js').AIChatBotConfig, context: ChatToolExecutionContext): Promise<string | ChatToolResult>;
//# sourceMappingURL=tools.d.ts.map