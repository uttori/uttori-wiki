## Constants

<dl>
<dt><a href="#WIKI_TOOLS">WIKI_TOOLS</a> : <code><a href="#WikiToolDefinition">Array.&lt;WikiToolDefinition&gt;</a></code></dt>
<dd><p>The canonical set of wiki tools shared by the chat bot and the MCP provider.
Each tool maps a structured request onto an existing Uttori hook so there is a single
implementation surface regardless of whether the caller is the LLM orchestrator or an
external MCP client.</p>
</dd>
<dt><a href="#WIKI_TOOLS_BY_NAME">WIKI_TOOLS_BY_NAME</a> : <code>Map.&lt;string, WikiToolDefinition&gt;</code></dt>
<dd><p>Map of wiki tool definitions indexed by their name.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#readStringArg">readStringArg(args, key)</a> ⇒ <code>string</code> | <code>undefined</code></dt>
<dd><p>Read a string tool argument when present.</p>
</dd>
<dt><a href="#readStringArrayArg">readStringArrayArg(args, key)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Read a string array tool argument when present.</p>
</dd>
<dt><a href="#readNumberArg">readNumberArg(args, key)</a> ⇒ <code>number</code> | <code>undefined</code></dt>
<dd><p>Read a numeric tool argument when present.</p>
</dd>
<dt><a href="#fetchOne">fetchOne(hooks, label, data, [context])</a> ⇒ <code><a href="#FetchOneResult">Promise.&lt;FetchOneResult&gt;</a></code></dt>
<dd><p>Fetch from a hook and return the first registered handler&#39;s result.
<code>EventDispatcher.fetch</code> returns an array of results (one per registered callback); the
wiki only ever registers a single provider per data hook, so we unwrap the first entry.</p>
</dd>
<dt><a href="#getWikiTool">getWikiTool(name)</a> ⇒ <code><a href="#WikiToolDefinition">WikiToolDefinition</a></code> | <code>undefined</code></dt>
<dd><p>Look up a wiki tool by name.</p>
</dd>
<dt><a href="#toOllamaTool">toOllamaTool(definition)</a> ⇒ <code><a href="#OllamaTool">OllamaTool</a></code></dt>
<dd><p>Convert a wiki tool definition into the Ollama <code>tools</code> array shape.</p>
</dd>
<dt><a href="#toMcpTool">toMcpTool(definition)</a> ⇒ <code><a href="#McpTool">McpTool</a></code></dt>
<dd><p>Convert a wiki tool definition into the MCP <code>Tool</code> shape.</p>
</dd>
<dt><a href="#executeWikiTool">executeWikiTool(name, args, executeContext)</a> ⇒ <code>Promise.&lt;unknown&gt;</code></dt>
<dd><p>Execute a wiki tool by name through the shared hook-backed implementation.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#WikiToolExecuteContext">WikiToolExecuteContext</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#WikiToolExecuteFunction">WikiToolExecuteFunction</a> ⇒ <code>Promise.&lt;unknown&gt;</code></dt>
<dd><p>Executes a wiki tool against the shared hook registry.</p>
</dd>
<dt><a href="#WikiToolDefinition">WikiToolDefinition</a> : <code>object</code></dt>
<dd><p>A single wiki capability exposed identically to the chat orchestrator and the MCP server.</p>
</dd>
<dt><a href="#OllamaTool">OllamaTool</a> : <code><a href="#OllamaTool">OllamaTool</a></code></dt>
<dd><p>Ollama tool schema shape.</p>
</dd>
<dt><a href="#McpTool">McpTool</a> : <code>object</code></dt>
<dd><p>MCP tool schema shape (a subset of the MCP <code>Tool</code> type).</p>
</dd>
<dt><a href="#FetchOneResult">FetchOneResult</a> : <code>Object</code> | <code>Object</code></dt>
<dd></dd>
</dl>

<a name="WIKI_TOOLS"></a>

## WIKI\_TOOLS : [<code>Array.&lt;WikiToolDefinition&gt;</code>](#WikiToolDefinition)
The canonical set of wiki tools shared by the chat bot and the MCP provider.Each tool maps a structured request onto an existing Uttori hook so there is a singleimplementation surface regardless of whether the caller is the LLM orchestrator or anexternal MCP client.

**Kind**: global constant  
<a name="WIKI_TOOLS_BY_NAME"></a>

## WIKI\_TOOLS\_BY\_NAME : <code>Map.&lt;string, WikiToolDefinition&gt;</code>
Map of wiki tool definitions indexed by their name.

**Kind**: global constant  
<a name="readStringArg"></a>

## readStringArg(args, key) ⇒ <code>string</code> \| <code>undefined</code>
Read a string tool argument when present.

**Kind**: global function  
**Returns**: <code>string</code> \| <code>undefined</code> - The string value, if any.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Record.&lt;string, unknown&gt;</code> | The tool arguments. |
| key | <code>string</code> | The argument key. |

<a name="readStringArrayArg"></a>

## readStringArrayArg(args, key) ⇒ <code>Array.&lt;string&gt;</code>
Read a string array tool argument when present.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - The string values.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Record.&lt;string, unknown&gt;</code> | The tool arguments. |
| key | <code>string</code> | The argument key. |

<a name="readNumberArg"></a>

## readNumberArg(args, key) ⇒ <code>number</code> \| <code>undefined</code>
Read a numeric tool argument when present.

**Kind**: global function  
**Returns**: <code>number</code> \| <code>undefined</code> - The numeric value, if any.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Record.&lt;string, unknown&gt;</code> | The tool arguments. |
| key | <code>string</code> | The argument key. |

<a name="fetchOne"></a>

## fetchOne(hooks, label, data, [context]) ⇒ [<code>Promise.&lt;FetchOneResult&gt;</code>](#FetchOneResult)
Fetch from a hook and return the first registered handler's result.`EventDispatcher.fetch` returns an array of results (one per registered callback); thewiki only ever registers a single provider per data hook, so we unwrap the first entry.

**Kind**: global function  
**Returns**: [<code>Promise.&lt;FetchOneResult&gt;</code>](#FetchOneResult) - The unwrapped result or an error.  

| Param | Type | Description |
| --- | --- | --- |
| hooks | <code>module:@uttori/event-dispatcher~EventDispatcher</code> | The event dispatcher. |
| label | <code>string</code> | The hook label. |
| data | <code>unknown</code> | The data to pass to the hook callbacks. |
| [context] | <code>object</code> | The Uttori context. |

<a name="fetchOne..results"></a>

### fetchOne~results : <code>Array.&lt;any&gt;</code>
**Kind**: inner constant of [<code>fetchOne</code>](#fetchOne)  
<a name="getWikiTool"></a>

## getWikiTool(name) ⇒ [<code>WikiToolDefinition</code>](#WikiToolDefinition) \| <code>undefined</code>
Look up a wiki tool by name.

**Kind**: global function  
**Returns**: [<code>WikiToolDefinition</code>](#WikiToolDefinition) \| <code>undefined</code> - The matching definition, if any.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The tool name. |

<a name="toOllamaTool"></a>

## toOllamaTool(definition) ⇒ [<code>OllamaTool</code>](#OllamaTool)
Convert a wiki tool definition into the Ollama `tools` array shape.

**Kind**: global function  
**Returns**: [<code>OllamaTool</code>](#OllamaTool) - The Ollama tool schema.  

| Param | Type | Description |
| --- | --- | --- |
| definition | [<code>WikiToolDefinition</code>](#WikiToolDefinition) | The wiki tool definition. |

<a name="toMcpTool"></a>

## toMcpTool(definition) ⇒ [<code>McpTool</code>](#McpTool)
Convert a wiki tool definition into the MCP `Tool` shape.

**Kind**: global function  
**Returns**: [<code>McpTool</code>](#McpTool) - The MCP tool descriptor.  

| Param | Type | Description |
| --- | --- | --- |
| definition | [<code>WikiToolDefinition</code>](#WikiToolDefinition) | The wiki tool definition. |

<a name="executeWikiTool"></a>

## executeWikiTool(name, args, executeContext) ⇒ <code>Promise.&lt;unknown&gt;</code>
Execute a wiki tool by name through the shared hook-backed implementation.

**Kind**: global function  
**Returns**: <code>Promise.&lt;unknown&gt;</code> - The raw structured result, or an `{ error }` object for unknown tools / missing handlers.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The tool name. |
| args | <code>Record.&lt;string, unknown&gt;</code> | The tool arguments. |
| executeContext | [<code>WikiToolExecuteContext</code>](#WikiToolExecuteContext) | The execution context with hooks and config. |

<a name="WikiToolExecuteContext"></a>

## WikiToolExecuteContext : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| hooks | <code>module:@uttori/event-dispatcher~EventDispatcher</code> | The Uttori event dispatcher used to reach storage and search providers. |
| [context] | <code>object</code> | The full Uttori context passed through to the hook callbacks. |
| [config] | <code>object</code> | The calling plugin's configuration, available to tool implementations. |

<a name="WikiToolExecuteFunction"></a>

## WikiToolExecuteFunction ⇒ <code>Promise.&lt;unknown&gt;</code>
Executes a wiki tool against the shared hook registry.

**Kind**: global typedef  
**Returns**: <code>Promise.&lt;unknown&gt;</code> - The raw structured result.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Record.&lt;string, unknown&gt;</code> | The tool arguments. |
| executeContext | [<code>WikiToolExecuteContext</code>](#WikiToolExecuteContext) | The execution context with hooks and config. |

<a name="WikiToolDefinition"></a>

## WikiToolDefinition : <code>object</code>
A single wiki capability exposed identically to the chat orchestrator and the MCP server.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The unique tool name. |
| description | <code>string</code> | A human readable description of the tool. |
| inputSchema | <code>object</code> | The JSON Schema describing the tool arguments. |
| hook | <code>string</code> | The Uttori hook label the tool dispatches to. |
| execute | [<code>WikiToolExecuteFunction</code>](#WikiToolExecuteFunction) | Runs the tool and returns the raw structured result. |

<a name="OllamaTool"></a>

## OllamaTool : [<code>OllamaTool</code>](#OllamaTool)
Ollama tool schema shape.

**Kind**: global typedef  
<a name="McpTool"></a>

## McpTool : <code>object</code>
MCP tool schema shape (a subset of the MCP `Tool` type).

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The tool name. |
| description | <code>string</code> | The tool description. |
| inputSchema | <code>object</code> | The JSON Schema for the tool arguments. |

<a name="FetchOneResult"></a>

## FetchOneResult : <code>Object</code> \| <code>Object</code>
**Kind**: global typedef  
