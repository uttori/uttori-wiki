export default MCPProvider;
export type MCPProviderConfig = {
    /**
     * Events to bind to.
     */
    events?: Record<string, string[]> | undefined;
    /**
     * The MCP server name advertised to clients.
     */
    name: string;
    /**
     * The MCP server version advertised to clients.
     */
    version: string;
    /**
     * The Express route the Streamable HTTP transport is mounted on.
     */
    httpRoute: string;
    /**
     * Whether to expose the Streamable HTTP transport via `bindRoutes`.
     */
    enableHttp: boolean;
    /**
     * Whether to start a stdio transport via `bindServer` (for CLI / child-process integrations).
     */
    enableStdio: boolean;
    /**
     * Whether to expose wiki tools.
     */
    tools: boolean;
    /**
     * Whether to expose wiki documents as resources.
     */
    resources: boolean;
    /**
     * Whether to expose wiki prompts.
     */
    prompts: boolean;
    /**
     * Custom middleware for the HTTP route.
     */
    middleware: import("express").RequestHandler[];
};
/**
 * Uttori context narrowed to this plugin's config shape.
 */
export type MCPProviderContext = import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-mcp-provider", MCPProviderConfig>;
export type McpSdkServer = import("@modelcontextprotocol/sdk/server/index.js").Server;
export type McpStdioServerTransport = import("@modelcontextprotocol/sdk/server/stdio.js").StdioServerTransport;
export type McpStreamableHttpServerTransport = import("@modelcontextprotocol/sdk/server/streamableHttp.js").StreamableHTTPServerTransport;
/**
 * MCP SDK request schema constants used by {@link MCPProvider.buildServer}.
 */
export type McpSdkSchemas = {
    /**
     * The list-tools request schema.
     */
    ListToolsRequestSchema: object;
    /**
     * The call-tool request schema.
     */
    CallToolRequestSchema: object;
    /**
     * The list-resources request schema.
     */
    ListResourcesRequestSchema: object;
    /**
     * The read-resource request schema.
     */
    ReadResourceRequestSchema: object;
    /**
     * The list-prompts request schema.
     */
    ListPromptsRequestSchema: object;
    /**
     * The get-prompt request schema.
     */
    GetPromptRequestSchema: object;
};
export type McpCallToolRequest = import("@modelcontextprotocol/sdk/types.js").CallToolRequest;
export type McpReadResourceRequest = import("@modelcontextprotocol/sdk/types.js").ReadResourceRequest;
export type McpGetPromptRequest = import("@modelcontextprotocol/sdk/types.js").GetPromptRequest;
export type McpServerCapabilities = import("@modelcontextprotocol/sdk/types.js").ServerCapabilities;
/**
 * MCP server metadata passed to the SDK constructor.
 */
export type McpSdkServerInfo = {
    /**
     * The server name.
     */
    name: string;
    /**
     * The server version.
     */
    version: string;
};
/**
 * Options passed when constructing an MCP server instance.
 */
export type McpSdkServerOptions = {
    /**
     * Advertised server capabilities.
     */
    capabilities?: {
        experimental?: {
            [x: string]: object;
        } | undefined;
        logging?: object | undefined;
        completions?: object | undefined;
        prompts?: {
            listChanged?: boolean | undefined;
        } | undefined;
        resources?: {
            subscribe?: boolean | undefined;
            listChanged?: boolean | undefined;
        } | undefined;
        tools?: {
            listChanged?: boolean | undefined;
        } | undefined;
        tasks?: {
            [x: string]: unknown;
            list?: object | undefined;
            cancel?: object | undefined;
            requests?: {
                [x: string]: unknown;
                tools?: {
                    [x: string]: unknown;
                    call?: object | undefined;
                } | undefined;
            } | undefined;
        } | undefined;
        extensions?: {
            [x: string]: object;
        } | undefined;
    } | undefined;
};
/**
 * Lazily loaded MCP SDK modules used by the provider transports.
 */
export type McpSdkModule = {
    /**
     * MCP Server constructor loaded from the SDK.
     */
    Server: Function;
    /**
     * Stdio transport constructor loaded from the SDK.
     */
    StdioServerTransport: Function;
    /**
     * HTTP transport constructor loaded from the SDK.
     */
    StreamableHTTPServerTransport: Function;
    /**
     * The MCP request schema constants.
     */
    schemas: McpSdkSchemas;
};
/**
 * MCP tool call payload returned by {@link MCPProvider.callTool}.
 */
export type McpToolResultContent = {
    /**
     * The content block type.
     */
    type: "text";
    /**
     * The text payload.
     */
    text: string;
};
/**
 * MCP tool call payload returned by {@link MCPProvider.callTool}.
 */
export type McpToolResult = {
    /**
     * The tool result content blocks.
     */
    content: McpToolResultContent[];
    /**
     * Whether the tool call failed.
     */
    isError: boolean;
};
/**
 * Document summary returned by the `search-documents` hook.
 */
export type McpWikiDocumentSummary = {
    /**
     * The document id.
     */
    id: string;
    /**
     * The document slug.
     */
    slug: string;
    /**
     * The document title.
     */
    title: string;
    /**
     * The last update timestamp.
     */
    update_date: number;
};
/**
 * Arguments accepted by the bundled wiki assistant prompt.
 */
export type McpPromptArguments = {
    /**
     * The user question.
     */
    query?: string | undefined;
    /**
     * Optional document slugs to focus on.
     */
    slugs?: string | string[] | undefined;
};
/**
 * Uttori MCP Provider.
 *
 * Runs a Model Context Protocol server that exposes the wiki's capabilities (search/retrieval,
 * document access, history) as MCP tools and resources, plus a wiki assistant prompt. The tools
 * share the same registry the chat bot uses, so every capability is implemented exactly once and
 * dispatched through the Uttori hook system to the registered storage / search providers.
 *
 * The `@modelcontextprotocol/sdk` package is loaded lazily and is an optional dependency: when it
 * is not installed the transports simply do not start, while the pure handler methods
 * ({@link MCPProvider.listTools}, {@link MCPProvider.callTool}, etc.) remain usable.
 * @example <caption>MCPProvider</caption>
 * MCPProvider.register(context);
 * @class
 */
declare class MCPProvider {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {MCPProviderConfig} The configuration.
     * @static
     */
    static defaultConfig(): MCPProviderConfig;
    /**
     * Merge the default configuration with the provided context configuration.
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {MCPProviderConfig} The merged configuration.
     * @static
     */
    static mergeConfig(context: MCPProviderContext): MCPProviderConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, MCPProviderConfig>} config A provided configuration to use.
     * @param {MCPProviderContext} [_context] Unused.
     * @static
     */
    static validateConfig(config: Record<string, MCPProviderConfig>, _context?: MCPProviderContext): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {Promise<void>}
     * @static
     */
    static register(context: MCPProviderContext): Promise<void>;
    /**
     * Lazily load the optional `@modelcontextprotocol/sdk` package.
     * @returns {Promise<McpSdkModule | undefined>} The SDK pieces, or undefined when the SDK is not installed.
     * @static
     */
    static loadSdk(): Promise<McpSdkModule | undefined>;
    /**
     * Build an MCP `Server` instance wired to the wiki capabilities.
     * Returns undefined when the SDK is not installed.
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {Promise<McpSdkServer | undefined>} The connected-ready MCP server, or undefined.
     * @static
     */
    static buildServer(context: MCPProviderContext): Promise<McpSdkServer | undefined>;
    /**
     * List the wiki tools in MCP `Tool` shape.
     * @returns {import('./chat-bot/tool-registry.js').McpTool[]} The MCP tool descriptors.
     * @static
     */
    static listTools(): import("./chat-bot/tool-registry.js").McpTool[];
    /**
     * Execute a wiki tool and wrap the result in an MCP `CallToolResult`.
     * @param {string} name The tool name.
     * @param {Record<string, unknown>} args The tool arguments.
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {Promise<McpToolResult>} The MCP tool result.
     * @static
     */
    static callTool(name: string, args: Record<string, unknown>, context: MCPProviderContext): Promise<McpToolResult>;
    /**
     * List wiki documents as MCP resources.
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {Promise<{ resources: Array<{ uri: string, name: string, description: string, mimeType: string }> }>} The MCP resource list.
     * @static
     */
    static listResources(context: MCPProviderContext): Promise<{
        resources: Array<{
            uri: string;
            name: string;
            description: string;
            mimeType: string;
        }>;
    }>;
    /**
     * Read a single wiki document resource by its `wiki://doc/<slug>` URI.
     * @param {string} uri The resource URI.
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {Promise<{ contents: Array<{ uri: string, mimeType: string, text: string }> }>} The MCP resource contents.
     * @static
     */
    static readResource(uri: string, context: MCPProviderContext): Promise<{
        contents: Array<{
            uri: string;
            mimeType: string;
            text: string;
        }>;
    }>;
    /**
     * List the available MCP prompts.
     * @returns {Array<{ name: string, description: string, arguments: Array<{ name: string, description: string, required: boolean }> }>} The MCP prompt list.
     * @static
     */
    static listPrompts(): Array<{
        name: string;
        description: string;
        arguments: Array<{
            name: string;
            description: string;
            required: boolean;
        }>;
    }>;
    /**
     * Build a named MCP prompt.
     * @param {string} name The prompt name.
     * @param {McpPromptArguments} args The prompt arguments.
     * @returns {Promise<{ messages: Array<{ role: string, content: { type: string, text: string } }> }>} The MCP prompt result.
     * @static
     */
    static getPrompt(name: string, args: McpPromptArguments): Promise<{
        messages: Array<{
            role: string;
            content: {
                type: string;
                text: string;
            };
        }>;
    }>;
    /**
     * Mount the Streamable HTTP transport on the configured Express route.
     * Uses a stateless transport: a fresh server + transport is created per request.
     * @param {import('express').Application} server An Express server instance.
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {void}
     * @static
     */
    static bindRoutes(server: import("express").Application, context: MCPProviderContext): void;
    /**
     * Build the Express handler for the Streamable HTTP transport (stateless mode).
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The Express request handler.
     * @static
     */
    static httpHandler(context: MCPProviderContext): import("express").RequestHandler;
    /**
     * Build an Express handler that rejects unsupported HTTP methods for the stateless transport.
     * @returns {import('express').RequestHandler} The Express request handler.
     * @static
     */
    static methodNotAllowedHandler(): import("express").RequestHandler;
    /**
     * Start the stdio transport when enabled (for CLI / child-process integrations).
     * @param {import('http').Server} _server An Express server instance (unused).
     * @param {MCPProviderContext} context A Uttori-like context.
     * @returns {Promise<void>}
     * @static
     */
    static bindServer(_server: import("http").Server, context: MCPProviderContext): Promise<void>;
}
//# sourceMappingURL=mcp-provider.d.ts.map