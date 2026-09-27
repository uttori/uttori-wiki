import type { WikiToolExecuteContext, WikiToolDefinition, OllamaTool, McpTool } from '../../types/plugins/chat-bot/tool-registry.js';
export type { WikiToolExecuteContext, WikiToolExecuteFunction, WikiToolDefinition, OllamaTool, McpTool, FetchOneResult, } from '../../types/plugins/chat-bot/tool-registry.js';
/**
 * The canonical set of wiki tools shared by the chat bot and the MCP provider.
 * Each tool maps a structured request onto an existing Uttori hook so there is a single
 * implementation surface regardless of whether the caller is the LLM orchestrator or an
 * external MCP client.
 *
 */
export declare const WIKI_TOOLS: WikiToolDefinition[];
/**
 * Map of wiki tool definitions indexed by their name.
 *
 */
export declare const WIKI_TOOLS_BY_NAME: Map<string, WikiToolDefinition>;
/**
 * Look up a wiki tool by name.
 * @param name The tool name.
 * @returns The matching definition, if any.
 */
export declare function getWikiTool(name: string): WikiToolDefinition | undefined;
/**
 * Convert a wiki tool definition into the Ollama `tools` array shape.
 * @param definition The wiki tool definition.
 * @returns The Ollama tool schema.
 */
export declare function toOllamaTool(definition: WikiToolDefinition): OllamaTool;
/**
 * Convert a wiki tool definition into the MCP `Tool` shape.
 * @param definition The wiki tool definition.
 * @returns The MCP tool descriptor.
 */
export declare function toMcpTool(definition: WikiToolDefinition): McpTool;
/**
 * Execute a wiki tool by name through the shared hook-backed implementation.
 * @param name The tool name.
 * @param args The tool arguments.
 * @param executeContext The execution context with hooks and config.
 * @returns The raw structured result, or an `{ error }` object for unknown tools / missing handlers.
 */
export declare function executeWikiTool(name: string, args: Record<string, unknown>, executeContext: WikiToolExecuteContext): Promise<unknown>;
//# sourceMappingURL=tool-registry.d.ts.map