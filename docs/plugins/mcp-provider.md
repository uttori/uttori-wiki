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
<dt><a href="#RESOURCE_PREFIX">RESOURCE_PREFIX</a> : <code>string</code></dt>
<dd><p>The URI scheme/prefix used for document resources, e.g. <code>wiki://doc/my-slug</code>.</p>
</dd>
<dt><a href="#ASSISTANT_PROMPT_NAME">ASSISTANT_PROMPT_NAME</a> : <code>string</code></dt>
<dd><p>The name of the bundled wiki assistant prompt.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#MCPProviderConfig">MCPProviderConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#MCPProviderContext">MCPProviderContext</a> : <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-mcp-provider&#x27;, MCPProviderConfig&gt;</code></dt>
<dd><p>Uttori context narrowed to this plugin&#39;s config shape.</p>
</dd>
<dt><a href="#McpStreamableHttpServerTransport">McpStreamableHttpServerTransport</a> : <code>module:@modelcontextprotocol/sdk/server/index.js~Server</code></dt>
<dd></dd>
<dt><a href="#McpSdkSchemas">McpSdkSchemas</a> : <code>object</code></dt>
<dd><p>MCP SDK request schema constants used by <a href="#MCPProvider.buildServer">buildServer</a>.</p>
</dd>
<dt><a href="#McpServerCapabilities">McpServerCapabilities</a> : <code>module:@modelcontextprotocol/sdk/types.js~CallToolRequest</code></dt>
<dd></dd>
<dt><a href="#McpSdkServerInfo">McpSdkServerInfo</a> : <code>object</code></dt>
<dd><p>MCP server metadata passed to the SDK constructor.</p>
</dd>
<dt><a href="#McpSdkServerOptions">McpSdkServerOptions</a> : <code>object</code></dt>
<dd><p>Options passed when constructing an MCP server instance.</p>
</dd>
<dt><a href="#McpSdkModule">McpSdkModule</a> : <code>object</code></dt>
<dd><p>Lazily loaded MCP SDK modules used by the provider transports.</p>
</dd>
<dt><a href="#McpToolResultContent">McpToolResultContent</a> : <code>object</code></dt>
<dd><p>MCP tool call payload returned by <a href="#MCPProvider.callTool">callTool</a>.</p>
</dd>
<dt><a href="#McpToolResult">McpToolResult</a> : <code>object</code></dt>
<dd><p>MCP tool call payload returned by <a href="#MCPProvider.callTool">callTool</a>.</p>
</dd>
<dt><a href="#McpWikiDocumentSummary">McpWikiDocumentSummary</a> : <code>object</code></dt>
<dd><p>Document summary returned by the <code>search-documents</code> hook.</p>
</dd>
<dt><a href="#McpPromptArguments">McpPromptArguments</a> : <code>object</code></dt>
<dd><p>Arguments accepted by the bundled wiki assistant prompt.</p>
</dd>
</dl>

<a name="MCPProvider"></a>

## MCPProvider
Uttori MCP Provider.Runs a Model Context Protocol server that exposes the wiki's capabilities (search/retrieval,document access, history) as MCP tools and resources, plus a wiki assistant prompt. The toolsshare the same registry the chat bot uses, so every capability is implemented exactly once anddispatched through the Uttori hook system to the registered storage / search providers.The `@modelcontextprotocol/sdk` package is loaded lazily and is an optional dependency: when itis not installed the transports simply do not start, while the pure handler methods([listTools](#MCPProvider.listTools), [callTool](#MCPProvider.callTool), etc.) remain usable.

**Kind**: global class  

* [MCPProvider](#MCPProvider)
    * [new MCPProvider()](#new_MCPProvider_new)
    * [.configKey](#MCPProvider.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#MCPProvider.defaultConfig) ⇒ [<code>MCPProviderConfig</code>](#MCPProviderConfig)
    * [.mergeConfig(context)](#MCPProvider.mergeConfig) ⇒ [<code>MCPProviderConfig</code>](#MCPProviderConfig)
    * [.validateConfig(config, [_context])](#MCPProvider.validateConfig)
    * [.register(context)](#MCPProvider.register) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.loadSdk()](#MCPProvider.loadSdk) ⇒ <code>Promise.&lt;(McpSdkModule\|undefined)&gt;</code>
    * [.buildServer(context)](#MCPProvider.buildServer) ⇒ <code>Promise.&lt;(McpSdkServer\|undefined)&gt;</code>
    * [.listTools()](#MCPProvider.listTools) ⇒ <code>Array.&lt;McpTool&gt;</code>
    * [.callTool(name, args, context)](#MCPProvider.callTool) ⇒ [<code>Promise.&lt;McpToolResult&gt;</code>](#McpToolResult)
    * [.listResources(context)](#MCPProvider.listResources) ⇒ <code>Promise.&lt;{resources: Array.&lt;{uri: string, name: string, description: string, mimeType: string}&gt;}&gt;</code>
    * [.readResource(uri, context)](#MCPProvider.readResource) ⇒ <code>Promise.&lt;{contents: Array.&lt;{uri: string, mimeType: string, text: string}&gt;}&gt;</code>
    * [.listPrompts()](#MCPProvider.listPrompts) ⇒ <code>Array.&lt;{name: string, description: string, arguments: Array.&lt;{name: string, description: string, required: boolean}&gt;}&gt;</code>
    * [.getPrompt(name, args)](#MCPProvider.getPrompt) ⇒ <code>Promise.&lt;{messages: Array.&lt;{role: string, content: {type: string, text: string}}&gt;}&gt;</code>
    * [.bindRoutes(server, context)](#MCPProvider.bindRoutes) ⇒ <code>void</code>
    * [.httpHandler(context)](#MCPProvider.httpHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.methodNotAllowedHandler()](#MCPProvider.methodNotAllowedHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.bindServer(_server, context)](#MCPProvider.bindServer) ⇒ <code>Promise.&lt;void&gt;</code>

<a name="new_MCPProvider_new"></a>

### new MCPProvider()
**Example** *(MCPProvider)*  
```js
MCPProvider.register(context);
```
<a name="MCPProvider.configKey"></a>

### MCPProvider.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>string</code> - The configuration key.  
<a name="MCPProvider.defaultConfig"></a>

### MCPProvider.defaultConfig() ⇒ [<code>MCPProviderConfig</code>](#MCPProviderConfig)
The default configuration.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: [<code>MCPProviderConfig</code>](#MCPProviderConfig) - The configuration.  
<a name="MCPProvider.mergeConfig"></a>

### MCPProvider.mergeConfig(context) ⇒ [<code>MCPProviderConfig</code>](#MCPProviderConfig)
Merge the default configuration with the provided context configuration.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: [<code>MCPProviderConfig</code>](#MCPProviderConfig) - The merged configuration.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="MCPProvider.validateConfig"></a>

### MCPProvider.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, MCPProviderConfig&gt;</code> | A provided configuration to use. |
| [_context] | [<code>MCPProviderContext</code>](#MCPProviderContext) | Unused. |

<a name="MCPProvider.register"></a>

### MCPProvider.register(context) ⇒ <code>Promise.&lt;void&gt;</code>
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="MCPProvider.loadSdk"></a>

### MCPProvider.loadSdk() ⇒ <code>Promise.&lt;(McpSdkModule\|undefined)&gt;</code>
Lazily load the optional `@modelcontextprotocol/sdk` package.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>Promise.&lt;(McpSdkModule\|undefined)&gt;</code> - The SDK pieces, or undefined when the SDK is not installed.  
<a name="MCPProvider.buildServer"></a>

### MCPProvider.buildServer(context) ⇒ <code>Promise.&lt;(McpSdkServer\|undefined)&gt;</code>
Build an MCP `Server` instance wired to the wiki capabilities.Returns undefined when the SDK is not installed.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>Promise.&lt;(McpSdkServer\|undefined)&gt;</code> - The connected-ready MCP server, or undefined.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="MCPProvider.listTools"></a>

### MCPProvider.listTools() ⇒ <code>Array.&lt;McpTool&gt;</code>
List the wiki tools in MCP `Tool` shape.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>Array.&lt;McpTool&gt;</code> - The MCP tool descriptors.  
<a name="MCPProvider.callTool"></a>

### MCPProvider.callTool(name, args, context) ⇒ [<code>Promise.&lt;McpToolResult&gt;</code>](#McpToolResult)
Execute a wiki tool and wrap the result in an MCP `CallToolResult`.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: [<code>Promise.&lt;McpToolResult&gt;</code>](#McpToolResult) - The MCP tool result.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The tool name. |
| args | <code>Record.&lt;string, unknown&gt;</code> | The tool arguments. |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="MCPProvider.listResources"></a>

### MCPProvider.listResources(context) ⇒ <code>Promise.&lt;{resources: Array.&lt;{uri: string, name: string, description: string, mimeType: string}&gt;}&gt;</code>
List wiki documents as MCP resources.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>Promise.&lt;{resources: Array.&lt;{uri: string, name: string, description: string, mimeType: string}&gt;}&gt;</code> - The MCP resource list.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="MCPProvider.readResource"></a>

### MCPProvider.readResource(uri, context) ⇒ <code>Promise.&lt;{contents: Array.&lt;{uri: string, mimeType: string, text: string}&gt;}&gt;</code>
Read a single wiki document resource by its `wiki://doc/<slug>` URI.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>Promise.&lt;{contents: Array.&lt;{uri: string, mimeType: string, text: string}&gt;}&gt;</code> - The MCP resource contents.  

| Param | Type | Description |
| --- | --- | --- |
| uri | <code>string</code> | The resource URI. |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="MCPProvider.listPrompts"></a>

### MCPProvider.listPrompts() ⇒ <code>Array.&lt;{name: string, description: string, arguments: Array.&lt;{name: string, description: string, required: boolean}&gt;}&gt;</code>
List the available MCP prompts.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>Array.&lt;{name: string, description: string, arguments: Array.&lt;{name: string, description: string, required: boolean}&gt;}&gt;</code> - The MCP prompt list.  
<a name="MCPProvider.getPrompt"></a>

### MCPProvider.getPrompt(name, args) ⇒ <code>Promise.&lt;{messages: Array.&lt;{role: string, content: {type: string, text: string}}&gt;}&gt;</code>
Build a named MCP prompt.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>Promise.&lt;{messages: Array.&lt;{role: string, content: {type: string, text: string}}&gt;}&gt;</code> - The MCP prompt result.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The prompt name. |
| args | [<code>McpPromptArguments</code>](#McpPromptArguments) | The prompt arguments. |

<a name="MCPProvider.bindRoutes"></a>

### MCPProvider.bindRoutes(server, context) ⇒ <code>void</code>
Mount the Streamable HTTP transport on the configured Express route.Uses a stateless transport: a fresh server + transport is created per request.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | An Express server instance. |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="MCPProvider.httpHandler"></a>

### MCPProvider.httpHandler(context) ⇒ <code>module:express~RequestHandler</code>
Build the Express handler for the Streamable HTTP transport (stateless mode).

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>module:express~RequestHandler</code> - The Express request handler.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="MCPProvider.methodNotAllowedHandler"></a>

### MCPProvider.methodNotAllowedHandler() ⇒ <code>module:express~RequestHandler</code>
Build an Express handler that rejects unsupported HTTP methods for the stateless transport.

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  
**Returns**: <code>module:express~RequestHandler</code> - The Express request handler.  
<a name="MCPProvider.bindServer"></a>

### MCPProvider.bindServer(_server, context) ⇒ <code>Promise.&lt;void&gt;</code>
Start the stdio transport when enabled (for CLI / child-process integrations).

**Kind**: static method of [<code>MCPProvider</code>](#MCPProvider)  

| Param | Type | Description |
| --- | --- | --- |
| _server | <code>module:http~Server</code> | An Express server instance (unused). |
| context | [<code>MCPProviderContext</code>](#MCPProviderContext) | A Uttori-like context. |

<a name="RESOURCE_PREFIX"></a>

## RESOURCE\_PREFIX : <code>string</code>
The URI scheme/prefix used for document resources, e.g. `wiki://doc/my-slug`.

**Kind**: global constant  
<a name="ASSISTANT_PROMPT_NAME"></a>

## ASSISTANT\_PROMPT\_NAME : <code>string</code>
The name of the bundled wiki assistant prompt.

**Kind**: global constant  
<a name="MCPProviderConfig"></a>

## MCPProviderConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | Events to bind to. |
| name | <code>string</code> | The MCP server name advertised to clients. |
| version | <code>string</code> | The MCP server version advertised to clients. |
| httpRoute | <code>string</code> | The Express route the Streamable HTTP transport is mounted on. |
| enableHttp | <code>boolean</code> | Whether to expose the Streamable HTTP transport via `bindRoutes`. |
| enableStdio | <code>boolean</code> | Whether to start a stdio transport via `bindServer` (for CLI / child-process integrations). |
| tools | <code>boolean</code> | Whether to expose wiki tools. |
| resources | <code>boolean</code> | Whether to expose wiki documents as resources. |
| prompts | <code>boolean</code> | Whether to expose wiki prompts. |
| middleware | <code>Array.&lt;module:express~RequestHandler&gt;</code> | Custom middleware for the HTTP route. |

<a name="MCPProviderContext"></a>

## MCPProviderContext : <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-mcp-provider&#x27;, MCPProviderConfig&gt;</code>
Uttori context narrowed to this plugin's config shape.

**Kind**: global typedef  
<a name="McpStreamableHttpServerTransport"></a>

## McpStreamableHttpServerTransport : <code>module:@modelcontextprotocol/sdk/server/index.js~Server</code>
**Kind**: global typedef  
<a name="McpSdkSchemas"></a>

## McpSdkSchemas : <code>object</code>
MCP SDK request schema constants used by [buildServer](#MCPProvider.buildServer).

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| ListToolsRequestSchema | <code>object</code> | The list-tools request schema. |
| CallToolRequestSchema | <code>object</code> | The call-tool request schema. |
| ListResourcesRequestSchema | <code>object</code> | The list-resources request schema. |
| ReadResourceRequestSchema | <code>object</code> | The read-resource request schema. |
| ListPromptsRequestSchema | <code>object</code> | The list-prompts request schema. |
| GetPromptRequestSchema | <code>object</code> | The get-prompt request schema. |

<a name="McpServerCapabilities"></a>

## McpServerCapabilities : <code>module:@modelcontextprotocol/sdk/types.js~CallToolRequest</code>
**Kind**: global typedef  
<a name="McpSdkServerInfo"></a>

## McpSdkServerInfo : <code>object</code>
MCP server metadata passed to the SDK constructor.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The server name. |
| version | <code>string</code> | The server version. |

<a name="McpSdkServerOptions"></a>

## McpSdkServerOptions : <code>object</code>
Options passed when constructing an MCP server instance.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [capabilities] | [<code>McpServerCapabilities</code>](#McpServerCapabilities) | Advertised server capabilities. |

<a name="McpSdkModule"></a>

## McpSdkModule : <code>object</code>
Lazily loaded MCP SDK modules used by the provider transports.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| Server | <code>function</code> | MCP Server constructor loaded from the SDK. |
| StdioServerTransport | <code>function</code> | Stdio transport constructor loaded from the SDK. |
| StreamableHTTPServerTransport | <code>function</code> | HTTP transport constructor loaded from the SDK. |
| schemas | [<code>McpSdkSchemas</code>](#McpSdkSchemas) | The MCP request schema constants. |

<a name="McpToolResultContent"></a>

## McpToolResultContent : <code>object</code>
MCP tool call payload returned by [callTool](#MCPProvider.callTool).

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>&quot;text&quot;</code> | The content block type. |
| text | <code>string</code> | The text payload. |

<a name="McpToolResult"></a>

## McpToolResult : <code>object</code>
MCP tool call payload returned by [callTool](#MCPProvider.callTool).

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| content | [<code>Array.&lt;McpToolResultContent&gt;</code>](#McpToolResultContent) | The tool result content blocks. |
| isError | <code>boolean</code> | Whether the tool call failed. |

<a name="McpWikiDocumentSummary"></a>

## McpWikiDocumentSummary : <code>object</code>
Document summary returned by the `search-documents` hook.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The document id. |
| slug | <code>string</code> | The document slug. |
| title | <code>string</code> | The document title. |
| update_date | <code>number</code> | The last update timestamp. |

<a name="McpPromptArguments"></a>

## McpPromptArguments : <code>object</code>
Arguments accepted by the bundled wiki assistant prompt.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [query] | <code>string</code> | The user question. |
| [slugs] | <code>string</code> \| <code>Array.&lt;string&gt;</code> | Optional document slugs to focus on. |

