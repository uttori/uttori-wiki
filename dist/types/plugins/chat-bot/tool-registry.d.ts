export interface WikiToolExecuteContext {
    /** The Uttori event dispatcher used to reach storage and search providers. */
    hooks?: import('@uttori/event-dispatcher').EventDispatcher;
    /** The full Uttori context passed through to the hook callbacks. */
    context?: object;
    /** The calling plugin's configuration, available to tool implementations. */
    config?: object;
}
/** Executes a wiki tool against the shared hook registry. */
export type WikiToolExecuteFunction = (args: Record<string, unknown>, executeContext: WikiToolExecuteContext) => Promise<unknown>;
/** A single wiki capability exposed identically to the chat orchestrator and the MCP server. */
export interface WikiToolDefinition {
    /** The unique tool name. */
    name: string;
    /** A human readable description of the tool. */
    description: string;
    /** The JSON Schema describing the tool arguments. */
    inputSchema: object;
    /** The Uttori hook label the tool dispatches to. */
    hook: string;
    /** Runs the tool and returns the raw structured result. */
    execute: WikiToolExecuteFunction;
}
/** Ollama tool schema shape. */
export type OllamaTool = import('../../../plugins/chat-bot/tools.js').OllamaTool;
/** MCP tool schema shape (a subset of the MCP `Tool` type). */
export interface McpTool {
    /** The tool name. */
    name: string;
    /** The tool description. */
    description: string;
    /** The JSON Schema for the tool arguments. */
    inputSchema: object;
}
export type FetchOneResult = {
    ok: true;
    value: unknown;
} | {
    ok: false;
    error: string;
};
//# sourceMappingURL=tool-registry.d.ts.map