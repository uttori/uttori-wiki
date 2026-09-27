## Constants

<dl>
<dt><a href="#WIKI_TOOLS">WIKI_TOOLS</a></dt>
<dd><p>The canonical set of wiki tools shared by the chat bot and the MCP provider.
Each tool maps a structured request onto an existing Uttori hook so there is a single
implementation surface regardless of whether the caller is the LLM orchestrator or an
external MCP client.</p>
</dd>
<dt><a href="#WIKI_TOOLS_BY_NAME">WIKI_TOOLS_BY_NAME</a></dt>
<dd><p>Map of wiki tool definitions indexed by their name.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#readStringArg">readStringArg(args, key)</a> ⇒</dt>
<dd><p>Read a string tool argument when present.</p>
</dd>
<dt><a href="#readStringArrayArg">readStringArrayArg(args, key)</a> ⇒</dt>
<dd><p>Read a string array tool argument when present.</p>
</dd>
<dt><a href="#readNumberArg">readNumberArg(args, key)</a> ⇒</dt>
<dd><p>Read a numeric tool argument when present.</p>
</dd>
<dt><a href="#fetchOne">fetchOne(hooks, label, data, [context])</a> ⇒</dt>
<dd><p>Fetch from a hook and return the first registered handler&#39;s result.
<code>EventDispatcher.fetch</code> returns an array of results (one per registered callback); the
wiki only ever registers a single provider per data hook, so we unwrap the first entry.</p>
</dd>
<dt><a href="#getWikiTool">getWikiTool(name)</a> ⇒</dt>
<dd><p>Look up a wiki tool by name.</p>
</dd>
<dt><a href="#toOllamaTool">toOllamaTool(definition)</a> ⇒</dt>
<dd><p>Convert a wiki tool definition into the Ollama <code>tools</code> array shape.</p>
</dd>
<dt><a href="#toMcpTool">toMcpTool(definition)</a> ⇒</dt>
<dd><p>Convert a wiki tool definition into the MCP <code>Tool</code> shape.</p>
</dd>
<dt><a href="#executeWikiTool">executeWikiTool(name, args, executeContext)</a> ⇒ <code>error</code></dt>
<dd><p>Execute a wiki tool by name through the shared hook-backed implementation.</p>
</dd>
</dl>

<a name="WIKI_TOOLS"></a>

## WIKI\_TOOLS
The canonical set of wiki tools shared by the chat bot and the MCP provider.
Each tool maps a structured request onto an existing Uttori hook so there is a single
implementation surface regardless of whether the caller is the LLM orchestrator or an
external MCP client.

**Kind**: global constant\
<a name="WIKI_TOOLS_BY_NAME"></a>

## WIKI\_TOOLS\_BY\_NAME
Map of wiki tool definitions indexed by their name.

**Kind**: global constant\
<a name="readStringArg"></a>

## readStringArg(args, key) ⇒
Read a string tool argument when present.

**Kind**: global function\
**Returns**: The string value, if any.\

| Param | Description |
| --- | --- |
| args | The tool arguments. |
| key | The argument key. |

<a name="readStringArrayArg"></a>

## readStringArrayArg(args, key) ⇒
Read a string array tool argument when present.

**Kind**: global function\
**Returns**: The string values.\

| Param | Description |
| --- | --- |
| args | The tool arguments. |
| key | The argument key. |

<a name="readNumberArg"></a>

## readNumberArg(args, key) ⇒
Read a numeric tool argument when present.

**Kind**: global function\
**Returns**: The numeric value, if any.\

| Param | Description |
| --- | --- |
| args | The tool arguments. |
| key | The argument key. |

<a name="fetchOne"></a>

## fetchOne(hooks, label, data, [context]) ⇒
Fetch from a hook and return the first registered handler's result.
`EventDispatcher.fetch` returns an array of results (one per registered callback); the
wiki only ever registers a single provider per data hook, so we unwrap the first entry.

**Kind**: global function\
**Returns**: The unwrapped result or an error.\

| Param | Description |
| --- | --- |
| hooks | The event dispatcher. |
| label | The hook label. |
| data | The data to pass to the hook callbacks. |
| [context] | The Uttori context. |

<a name="getWikiTool"></a>

## getWikiTool(name) ⇒
Look up a wiki tool by name.

**Kind**: global function\
**Returns**: The matching definition, if any.\

| Param | Description |
| --- | --- |
| name | The tool name. |

<a name="toOllamaTool"></a>

## toOllamaTool(definition) ⇒
Convert a wiki tool definition into the Ollama `tools` array shape.

**Kind**: global function\
**Returns**: The Ollama tool schema.\

| Param | Description |
| --- | --- |
| definition | The wiki tool definition. |

<a name="toMcpTool"></a>

## toMcpTool(definition) ⇒
Convert a wiki tool definition into the MCP `Tool` shape.

**Kind**: global function\
**Returns**: The MCP tool descriptor.\

| Param | Description |
| --- | --- |
| definition | The wiki tool definition. |

<a name="executeWikiTool"></a>

## executeWikiTool(name, args, executeContext) ⇒ <code>error</code>
Execute a wiki tool by name through the shared hook-backed implementation.

**Kind**: global function\
**Returns**: <code>error</code> - The raw structured result, or an `` object for unknown tools / missing handlers.\

| Param | Description |
| --- | --- |
| name | The tool name. |
| args | The tool arguments. |
| executeContext | The execution context with hooks and config. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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
```

</details>
