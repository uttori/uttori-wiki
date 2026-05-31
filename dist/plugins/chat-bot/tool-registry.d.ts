/**
 * Look up a wiki tool by name.
 * @param {string} name The tool name.
 * @returns {WikiToolDefinition | undefined} The matching definition, if any.
 */
export function getWikiTool(name: string): WikiToolDefinition | undefined;
/**
 * Convert a wiki tool definition into the Ollama `tools` array shape.
 * @param {WikiToolDefinition} definition The wiki tool definition.
 * @returns {OllamaTool} The Ollama tool schema.
 */
export function toOllamaTool(definition: WikiToolDefinition): OllamaTool;
/**
 * Convert a wiki tool definition into the MCP `Tool` shape.
 * @param {WikiToolDefinition} definition The wiki tool definition.
 * @returns {McpTool} The MCP tool descriptor.
 */
export function toMcpTool(definition: WikiToolDefinition): McpTool;
/**
 * Execute a wiki tool by name through the shared hook-backed implementation.
 * @param {string} name The tool name.
 * @param {Record<string, unknown>} args The tool arguments.
 * @param {WikiToolExecuteContext} executeContext The execution context with hooks and config.
 * @returns {Promise<unknown>} The raw structured result, or an `{ error }` object for unknown tools / missing handlers.
 */
export function executeWikiTool(name: string, args: Record<string, unknown>, executeContext: WikiToolExecuteContext): Promise<unknown>;
/**
 * The canonical set of wiki tools shared by the chat bot and the MCP provider.
 * Each tool maps a structured request onto an existing Uttori hook so there is a single
 * implementation surface regardless of whether the caller is the LLM orchestrator or an
 * external MCP client.
 * @type {WikiToolDefinition[]}
 */
export const WIKI_TOOLS: WikiToolDefinition[];
/**
 * Map of wiki tool definitions indexed by their name.
 * @type {Map<string, WikiToolDefinition>}
 */
export const WIKI_TOOLS_BY_NAME: Map<string, WikiToolDefinition>;
export type WikiToolExecuteContext = {
    /**
     * The Uttori event dispatcher used to reach storage and search providers.
     */
    hooks: import("@uttori/event-dispatcher").EventDispatcher;
    /**
     * The full Uttori context passed through to the hook callbacks.
     */
    context?: object | undefined;
    /**
     * The calling plugin's configuration, available to tool implementations.
     */
    config?: object | undefined;
};
/**
 * Executes a wiki tool against the shared hook registry.
 */
export type WikiToolExecuteFunction = (args: Record<string, unknown>, executeContext: WikiToolExecuteContext) => Promise<unknown>;
/**
 * A single wiki capability exposed identically to the chat orchestrator and the MCP server.
 */
export type WikiToolDefinition = {
    /**
     * The unique tool name.
     */
    name: string;
    /**
     * A human readable description of the tool.
     */
    description: string;
    /**
     * The JSON Schema describing the tool arguments.
     */
    inputSchema: object;
    /**
     * The Uttori hook label the tool dispatches to.
     */
    hook: string;
    /**
     * Runs the tool and returns the raw structured result.
     */
    execute: WikiToolExecuteFunction;
};
/**
 * Ollama tool schema shape.
 */
export type OllamaTool = import("./tools.js").OllamaTool;
/**
 * MCP tool schema shape (a subset of the MCP `Tool` type).
 */
export type McpTool = {
    /**
     * The tool name.
     */
    name: string;
    /**
     * The tool description.
     */
    description: string;
    /**
     * The JSON Schema for the tool arguments.
     */
    inputSchema: object;
};
export type FetchOneResult = {
    ok: true;
    value: unknown;
} | {
    ok: false;
    error: string;
};
//# sourceMappingURL=tool-registry.d.ts.map