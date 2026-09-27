## Classes

<dl>
<dt><a href="#MCPProvider">MCPProvider</a></dt>
<dd><p>Uttori MCP Provider.</p>
<p>Runs a Model Context Protocol server that exposes the wiki&#39;s capabilities (search/retrieval,
document access, history) as MCP tools and resources, plus a wiki assistant prompt. The tools
share the same registry the chat bot uses, so every capability is implemented exactly once and
dispatched through the Uttori hook system to the registered storage / search providers.</p>
<p>The <code>@modelcontextprotocol/sdk</code> package is loaded lazily and is an optional dependency: when it
is not installed the transports simply do not start, while the pure handler methods
(<a href="#MCPProvider.listTools">listTools</a>, <a href="#MCPProvider.callTool">callTool</a>, etc.) remain usable.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#RESOURCE_PREFIX">RESOURCE_PREFIX</a></dt>
<dd><p>The URI scheme/prefix used for document resources, e.g. <code>wiki://doc/my-slug</code>.</p>
</dd>
<dt><a href="#ASSISTANT_PROMPT_NAME">ASSISTANT_PROMPT_NAME</a></dt>
<dd><p>The name of the bundled wiki assistant prompt.</p>
</dd>
</dl>

<a name="MCPProvider"></a>

## MCPProvider
Uttori MCP Provider.

Runs a Model Context Protocol server that exposes the wiki's capabilities (search/retrieval,
document access, history) as MCP tools and resources, plus a wiki assistant prompt. The tools
share the same registry the chat bot uses, so every capability is implemented exactly once and
dispatched through the Uttori hook system to the registered storage / search providers.

The `@modelcontextprotocol/sdk` package is loaded lazily and is an optional dependency: when it
is not installed the transports simply do not start, while the pure handler methods
([listTools](#MCPProvider.listTools), [callTool](#MCPProvider.callTool), etc.) remain usable.

**Kind**: global class\

* [MCPProvider](#MCPProvider)
    * [new MCPProvider()](#new_MCPProvider_new)
    * [.configKey](#MCPProvider.configKey) ⇒
    * [.defaultConfig()](#MCPProvider.defaultConfig) ⇒
    * [.mergeConfig(context)](#MCPProvider.mergeConfig) ⇒
    * [.validateConfig(config, [_context])](#MCPProvider.validateConfig)
    * [.register(context)](#MCPProvider.register)
    * [.loadSdk()](#MCPProvider.loadSdk) ⇒
    * [.buildServer(context)](#MCPProvider.buildServer) ⇒
    * [.listTools()](#MCPProvider.listTools) ⇒
    * [.callTool(name, args, context)](#MCPProvider.callTool) ⇒
    * [.listResources(context)](#MCPProvider.listResources) ⇒
    * [.readResource(uri, context)](#MCPProvider.readResource) ⇒
    * [.listPrompts()](#MCPProvider.listPrompts) ⇒
    * [.getPrompt(name, args)](#MCPProvider.getPrompt) ⇒
    * [.bindRoutes(server, context)](#MCPProvider.bindRoutes)
    * [.httpHandler(context)](#MCPProvider.httpHandler) ⇒
    * [.methodNotAllowedHandler()](#MCPProvider.methodNotAllowedHandler) ⇒
    * [.bindServer(_server, context)](#MCPProvider.bindServer)

<a name="new_MCPProvider_new"></a>

### new MCPProvider()
**Example** *(MCPProvider)*\
```js
MCPProvider.register(context);
```
<a name="MCPProvider.configKey"></a>

### MCPProvider.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The configuration key.\
<a name="MCPProvider.defaultConfig"></a>

### MCPProvider.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The configuration.\
<a name="MCPProvider.mergeConfig"></a>

### MCPProvider.mergeConfig(context) ⇒
Merge the default configuration with the provided context configuration.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The merged configuration.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="MCPProvider.validateConfig"></a>

### MCPProvider.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |
| [_context] | Unused. |

<a name="MCPProvider.register"></a>

### MCPProvider.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="MCPProvider.loadSdk"></a>

### MCPProvider.loadSdk() ⇒
Lazily load the optional `@modelcontextprotocol/sdk` package.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The SDK pieces, or undefined when the SDK is not installed.\
<a name="MCPProvider.buildServer"></a>

### MCPProvider.buildServer(context) ⇒
Build an MCP `Server` instance wired to the wiki capabilities.
Returns undefined when the SDK is not installed.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The connected-ready MCP server, or undefined.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="MCPProvider.listTools"></a>

### MCPProvider.listTools() ⇒
List the wiki tools in MCP `Tool` shape.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The MCP tool descriptors.\
<a name="MCPProvider.callTool"></a>

### MCPProvider.callTool(name, args, context) ⇒
Execute a wiki tool and wrap the result in an MCP `CallToolResult`.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The MCP tool result.\

| Param | Description |
| --- | --- |
| name | The tool name. |
| args | The tool arguments. |
| context | A Uttori-like context. |

<a name="MCPProvider.listResources"></a>

### MCPProvider.listResources(context) ⇒
List wiki documents as MCP resources.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The MCP resource list.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="MCPProvider.readResource"></a>

### MCPProvider.readResource(uri, context) ⇒
Read a single wiki document resource by its `wiki://doc/<slug>` URI.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The MCP resource contents.\

| Param | Description |
| --- | --- |
| uri | The resource URI. |
| context | A Uttori-like context. |

<a name="MCPProvider.listPrompts"></a>

### MCPProvider.listPrompts() ⇒
List the available MCP prompts.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The MCP prompt list.\
<a name="MCPProvider.getPrompt"></a>

### MCPProvider.getPrompt(name, args) ⇒
Build a named MCP prompt.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The MCP prompt result.\

| Param | Description |
| --- | --- |
| name | The prompt name. |
| args | The prompt arguments. |

<a name="MCPProvider.bindRoutes"></a>

### MCPProvider.bindRoutes(server, context)
Mount the Streamable HTTP transport on the configured Express route.
Uses a stateless transport: a fresh server + transport is created per request.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| context | A Uttori-like context. |

<a name="MCPProvider.httpHandler"></a>

### MCPProvider.httpHandler(context) ⇒
Build the Express handler for the Streamable HTTP transport (stateless mode).

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The Express request handler.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="MCPProvider.methodNotAllowedHandler"></a>

### MCPProvider.methodNotAllowedHandler() ⇒
Build an Express handler that rejects unsupported HTTP methods for the stateless transport.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\
**Returns**: The Express request handler.\
<a name="MCPProvider.bindServer"></a>

### MCPProvider.bindServer(_server, context)
Start the stdio transport when enabled (for CLI / child-process integrations).

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)\

| Param | Description |
| --- | --- |
| _server | An Express server instance (unused). |
| context | A Uttori-like context. |

<a name="RESOURCE_PREFIX"></a>

## RESOURCE\_PREFIX
The URI scheme/prefix used for document resources, e.g. `wiki://doc/my-slug`.

**Kind**: global constant\
<a name="ASSISTANT_PROMPT_NAME"></a>

## ASSISTANT\_PROMPT\_NAME
The name of the bundled wiki assistant prompt.

**Kind**: global constant\

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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
```

</details>
