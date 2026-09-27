export type McpServerCapabilities = import('@modelcontextprotocol/sdk/types.js').ServerCapabilities;
export type McpGetPromptRequest = import('@modelcontextprotocol/sdk/types.js').GetPromptRequest;
export type McpReadResourceRequest = import('@modelcontextprotocol/sdk/types.js').ReadResourceRequest;
export type McpStreamableHttpServerTransport = import('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport;
export type McpStdioServerTransport = import('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport;
export interface MCPProviderConfig {
    /** Events to bind to. */
    events?: Record<string, string[]>;
    /** The MCP server name advertised to clients. */
    name: string;
    /** The MCP server version advertised to clients. */
    version: string;
    /** The Express route the Streamable HTTP transport is mounted on. */
    httpRoute: string;
    /** Whether to expose the Streamable HTTP transport via `bindRoutes`. */
    enableHttp: boolean;
    /** Whether to start a stdio transport via `bindServer` (for CLI / child-process integrations). */
    enableStdio: boolean;
    /** Whether to expose wiki tools. */
    tools: boolean;
    /** Whether to expose wiki documents as resources. */
    resources: boolean;
    /** Whether to expose wiki prompts. */
    prompts: boolean;
    /** Custom middleware for the HTTP route. */
    middleware: import('express').RequestHandler[];
}
/** Uttori context narrowed to this plugin's config shape. */
export type MCPProviderContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-mcp-provider', MCPProviderConfig>;
export type McpSdkServer = import('@modelcontextprotocol/sdk/server/index.js').Server;
/** MCP SDK request schema constants used by . */
export type McpSdkSchemas = Pick<typeof import('@modelcontextprotocol/sdk/types.js'), 'ListToolsRequestSchema' | 'CallToolRequestSchema' | 'ListResourcesRequestSchema' | 'ReadResourceRequestSchema' | 'ListPromptsRequestSchema' | 'GetPromptRequestSchema'>;
export type McpCallToolRequest = import('@modelcontextprotocol/sdk/types.js').CallToolRequest;
/** MCP server metadata passed to the SDK constructor. */
export interface McpSdkServerInfo {
    /** The server name. */
    name: string;
    /** The server version. */
    version: string;
}
/** Options passed when constructing an MCP server instance. */
export interface McpSdkServerOptions {
    /** Advertised server capabilities. */
    capabilities?: McpServerCapabilities;
}
/** Lazily loaded MCP SDK modules used by the provider transports. */
export interface McpSdkModule {
    /** MCP Server constructor loaded from the SDK. */
    Server: typeof import('@modelcontextprotocol/sdk/server/index.js').Server;
    /** Stdio transport constructor loaded from the SDK. */
    StdioServerTransport: typeof import('@modelcontextprotocol/sdk/server/stdio.js').StdioServerTransport;
    /** HTTP transport constructor loaded from the SDK. */
    StreamableHTTPServerTransport: typeof import('@modelcontextprotocol/sdk/server/streamableHttp.js').StreamableHTTPServerTransport;
    /** The MCP request schema constants. */
    schemas: McpSdkSchemas;
}
/** MCP tool call payload returned by . */
export type McpToolResult = import('@modelcontextprotocol/sdk/types.js').CallToolResult;
/** MCP tool call payload returned by . */
/** Document summary returned by the `search-documents` hook. */
export interface McpWikiDocumentSummary {
    /** The document id. */
    id: string;
    /** The document slug. */
    slug: string;
    /** The document title. */
    title: string;
    /** The last update timestamp. */
    update_date: number;
}
/** Arguments accepted by the bundled wiki assistant prompt. */
export interface McpPromptArguments {
    /** The user question. */
    query?: string;
    /** Optional document slugs to focus on. */
    slugs?: string | string[];
}
//# sourceMappingURL=mcp-provider.d.ts.map