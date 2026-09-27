import type { MCPProviderConfig, MCPProviderContext, McpSdkServer, McpSdkModule, McpToolResult, McpPromptArguments } from '../types/plugins/mcp-provider.js';
export type { McpServerCapabilities, McpGetPromptRequest, McpReadResourceRequest, McpStreamableHttpServerTransport, McpStdioServerTransport, MCPProviderConfig, MCPProviderContext, McpSdkServer, McpSdkSchemas, McpCallToolRequest, McpSdkServerInfo, McpSdkServerOptions, McpSdkModule, McpToolResult, McpWikiDocumentSummary, McpPromptArguments, } from '../types/plugins/mcp-provider.js';
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
 */
declare class MCPProvider {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     */
    static get configKey(): 'uttori-plugin-mcp-provider';
    /**
     * The default configuration.
     * @returns The configuration.
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<MCPProviderConfig, 'events' | 'name' | 'version' | 'httpRoute' | 'enableHttp' | 'enableStdio' | 'tools' | 'resources' | 'prompts' | 'middleware'>;
    /**
     * Merge the default configuration with the provided context configuration.
     * @param context A Uttori-like context.
     * @returns The merged configuration.
     */
    static mergeConfig(context: MCPProviderContext): {
        name: string;
        version: string;
        httpRoute: string;
        enableHttp: boolean;
        enableStdio: boolean;
        tools: boolean;
        resources: boolean;
        prompts: boolean;
        middleware: import('express').RequestHandler[];
        events: {
            [x: string]: string[];
        };
    };
    /**
     * Validates the provided configuration for required entries.
     * @param config A provided configuration to use.
     * @param [_context] Unused.
     */
    static validateConfig(config: Record<string, MCPProviderConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     */
    static register(context: MCPProviderContext): Promise<void>;
    /**
     * Lazily load the optional `@modelcontextprotocol/sdk` package.
     * @returns The SDK pieces, or undefined when the SDK is not installed.
     */
    static loadSdk(): Promise<McpSdkModule | undefined>;
    /**
     * Build an MCP `Server` instance wired to the wiki capabilities.
     * Returns undefined when the SDK is not installed.
     * @param context A Uttori-like context.
     * @returns The connected-ready MCP server, or undefined.
     */
    static buildServer(context: MCPProviderContext): Promise<McpSdkServer | undefined>;
    /**
     * List the wiki tools in MCP `Tool` shape.
     * @returns The MCP tool descriptors.
     */
    static listTools(): import('./chat-bot/tool-registry.js').McpTool[];
    /**
     * Execute a wiki tool and wrap the result in an MCP `CallToolResult`.
     * @param name The tool name.
     * @param args The tool arguments.
     * @param context A Uttori-like context.
     * @returns The MCP tool result.
     */
    static callTool(name: string, args: Record<string, unknown>, context: MCPProviderContext): Promise<McpToolResult>;
    /**
     * List wiki documents as MCP resources.
     * @param context A Uttori-like context.
     * @returns The MCP resource list.
     */
    static listResources(context: MCPProviderContext): Promise<{
        resources: {
            uri: string;
            name: string;
            description: string;
            mimeType: string;
        }[];
    }>;
    /**
     * Read a single wiki document resource by its `wiki://doc/<slug>` URI.
     * @param uri The resource URI.
     * @param context A Uttori-like context.
     * @returns The MCP resource contents.
     */
    static readResource(uri: string, context: MCPProviderContext): Promise<{
        contents: {
            uri: string;
            mimeType: string;
            text: string;
        }[];
    }>;
    /**
     * List the available MCP prompts.
     * @returns The MCP prompt list.
     */
    static listPrompts(): {
        name: string;
        description: string;
        arguments: ({
            name: string;
            description: string;
            required: boolean;
        })[];
    }[];
    /**
     * Build a named MCP prompt.
     * @param name The prompt name.
     * @param args The prompt arguments.
     * @returns The MCP prompt result.
     */
    static getPrompt(name: string, args: McpPromptArguments): Promise<{
        messages: {
            role: string;
            content: {
                type: string;
                text: string;
            };
        }[];
    }>;
    /**
     * Mount the Streamable HTTP transport on the configured Express route.
     * Uses a stateless transport: a fresh server + transport is created per request.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     */
    static bindRoutes(server: import('express').Application, context: MCPProviderContext): void;
    /**
     * Build the Express handler for the Streamable HTTP transport (stateless mode).
     * @param context A Uttori-like context.
     * @returns The Express request handler.
     */
    static httpHandler(context: MCPProviderContext): import('express').RequestHandler;
    /**
     * Build an Express handler that rejects unsupported HTTP methods for the stateless transport.
     * @returns The Express request handler.
     */
    static methodNotAllowedHandler(): import('express').RequestHandler;
    /**
     * Start the stdio transport when enabled (for CLI / child-process integrations).
     * @param _server An Express server instance (unused).
     * @param context A Uttori-like context.
     */
    static bindServer(_server: import('http').Server, context: MCPProviderContext): Promise<void>;
}
export default MCPProvider;
//# sourceMappingURL=mcp-provider.d.ts.map