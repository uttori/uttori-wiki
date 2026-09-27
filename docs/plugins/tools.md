## Constants

<dl>
<dt><a href="#MAX_CHUNK_CHARS">MAX_CHUNK_CHARS</a></dt>
<dd><p>Maximum characters to include per retrieved chunk in the context block.
Chunks longer than this are truncated with an ellipsis.</p>
</dd>
<dt><a href="#vectorSearchTool">vectorSearchTool</a></dt>
<dd><p>Built-in Ollama tool schema for <code>vectorSearch</code>.
Derived from the shared registry so the chat bot and MCP provider stay in sync.</p>
</dd>
<dt><a href="#BUILT_IN_TOOLS">BUILT_IN_TOOLS</a></dt>
<dd><p>Map of all built-in chat tools indexed by their name.
Built from the shared wiki tool registry.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#buildChatTools">buildChatTools(config)</a> ⇒</dt>
<dd><p>Build the array of Ollama tool schemas to include in an <code>/api/chat</code> request.
When <code>config.tools</code> is a non-empty array it is used as-is, so callers retain
full control. When it is empty or absent the built-in wiki tools are used.
Pass <code>config.tools = null</code> (or any non-array) to disable tools entirely.</p>
</dd>
<dt><a href="#formatRetrievalResult">formatRetrievalResult(result)</a> ⇒</dt>
<dd><h2 id="format-a-retrieveresponse-into-the-compact-context-block-string-that-is-sent-back-to-the-model-as-a-tool-result-each-chunk-becomes-a-block--source-----slug-">Format a <a href="RetrieveResponse">RetrieveResponse</a> into the compact context
block string that is sent back to the model as a tool result.
Each chunk becomes a block:
```
SOURCE: <title>[ - <section path>]
SLUG: <slug></h2>
<p>&lt;text (truncated to MAX_CHUNK_CHARS)&gt;</p>
<pre><code>Blocks are joined with `\n\n====\n\n`.
</code></pre>
</dd>
<dt><a href="#executeChatTool">executeChatTool(name, args, config, context)</a> ⇒</dt>
<dd><p>Execute a named chat tool and return its result.
Tools are resolved through the shared wiki tool registry, which dispatches to the
registered storage / search providers via the Uttori hook system. The <code>vectorSearch</code>
tool result is post-formatted into the compact context block expected by the model;
all other tools return their structured result JSON-serialized.
Unknown tool names and missing providers return an error object.</p>
</dd>
</dl>

<a name="MAX_CHUNK_CHARS"></a>

## MAX\_CHUNK\_CHARS
Maximum characters to include per retrieved chunk in the context block.
Chunks longer than this are truncated with an ellipsis.

**Kind**: global constant\
<a name="vectorSearchTool"></a>

## vectorSearchTool
Built-in Ollama tool schema for `vectorSearch`.
Derived from the shared registry so the chat bot and MCP provider stay in sync.

**Kind**: global constant\
<a name="BUILT_IN_TOOLS"></a>

## BUILT\_IN\_TOOLS
Map of all built-in chat tools indexed by their name.
Built from the shared wiki tool registry.

**Kind**: global constant\
<a name="buildChatTools"></a>

## buildChatTools(config) ⇒
Build the array of Ollama tool schemas to include in an `/api/chat` request.
When `config.tools` is a non-empty array it is used as-is, so callers retain
full control. When it is empty or absent the built-in wiki tools are used.
Pass `config.tools = null` (or any non-array) to disable tools entirely.

**Kind**: global function\
**Returns**: The tool schemas for Ollama.\

| Param | Description |
| --- | --- |
| config | The chat bot configuration. |

<a name="formatRetrievalResult"></a>

## formatRetrievalResult(result) ⇒
Format a [RetrieveResponse](RetrieveResponse) into the compact context
block string that is sent back to the model as a tool result.
Each chunk becomes a block:
```
SOURCE: <title>[ - <section path>]
SLUG: <slug>
---
<text (truncated to MAX_CHUNK_CHARS)>
```
Blocks are joined with `\n\n====\n\n`.

**Kind**: global function\
**Returns**: The formatted context block.\

| Param | Description |
| --- | --- |
| result | The retrieval result. |

<a name="executeChatTool"></a>

## executeChatTool(name, args, config, context) ⇒
Execute a named chat tool and return its result.
Tools are resolved through the shared wiki tool registry, which dispatches to the
registered storage / search providers via the Uttori hook system. The `vectorSearch`
tool result is post-formatted into the compact context block expected by the model;
all other tools return their structured result JSON-serialized.
Unknown tool names and missing providers return an error object.

**Kind**: global function\
**Returns**: The formatted/serialized result string, or an error object.\

| Param | Description |
| --- | --- |
| name | The tool name as returned by the model. |
| args | The arguments object from the model's tool call. |
| config | The chat bot configuration. |
| context | A Uttori-like context exposing `hooks`. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { OllamaTool, ChatToolResult, ChatToolExecutionContext } from '../../types/plugins/chat-bot/tools.js';
export type { OllamaToolFunction, OllamaTool, ChatToolResult, ChatToolExecutionContext, } from '../../types/plugins/chat-bot/tools.js';
/**
 * Built-in Ollama tool schema for `vectorSearch`.
 * Derived from the shared registry so the chat bot and MCP provider stay in sync.
 *
 */
export declare const vectorSearchTool: OllamaTool;
/**
 * Map of all built-in chat tools indexed by their name.
 * Built from the shared wiki tool registry.
 *
 */
export declare const BUILT_IN_TOOLS: Map<string, OllamaTool>;
/**
 * Build the array of Ollama tool schemas to include in an `/api/chat` request.
 * When `config.tools` is a non-empty array it is used as-is, so callers retain
 * full control. When it is empty or absent the built-in wiki tools are used.
 * Pass `config.tools = null` (or any non-array) to disable tools entirely.
 * @param config The chat bot configuration.
 * @returns The tool schemas for Ollama.
 */
export declare function buildChatTools(config: import('../ai-chat-bot.js').AIChatBotConfig): OllamaTool[];
/**
 * Format a {@link import('../search-provider-sqlite.js').RetrieveResponse} into the compact context
 * block string that is sent back to the model as a tool result.
 * Each chunk becomes a block:
 * ```
 * SOURCE: <title>[ - <section path>]
 * SLUG: <slug>
 * ---
 * <text (truncated to MAX_CHUNK_CHARS)>
 * ```
 * Blocks are joined with `\n\n====\n\n`.
 * @param result The retrieval result.
 * @returns The formatted context block.
 */
export declare function formatRetrievalResult(result: import('../search-provider-sqlite.js').RetrieveResponse): string;
/**
 * Execute a named chat tool and return its result.
 * Tools are resolved through the shared wiki tool registry, which dispatches to the
 * registered storage / search providers via the Uttori hook system. The `vectorSearch`
 * tool result is post-formatted into the compact context block expected by the model;
 * all other tools return their structured result JSON-serialized.
 * Unknown tool names and missing providers return an error object.
 * @param name The tool name as returned by the model.
 * @param args The arguments object from the model's tool call.
 * @param config The chat bot configuration.
 * @param context A Uttori-like context exposing `hooks`.
 * @returns The formatted/serialized result string, or an error object.
 */
export declare function executeChatTool(name: string, args: Record<string, unknown>, config: import('../ai-chat-bot.js').AIChatBotConfig, context: ChatToolExecutionContext): Promise<string | ChatToolResult>;

export interface OllamaToolFunction {
    /** The function name. */
    name: string;
    /** The function description. */
    description: string;
    /** The JSON Schema for the function parameters. */
    parameters: object;
}
export interface OllamaTool {
    /** The type of tool. */
    type: 'function';
    /** The function definition. */
    function: OllamaToolFunction;
}
export interface ChatToolResult {
    /** Set when the tool name is unknown or no provider handled it. */
    error?: string;
}
export interface ChatToolExecutionContext {
    /** The Uttori event dispatcher. */
    hooks?: import('@uttori/event-dispatcher').EventDispatcher;
    /** The full Uttori context. */
    context?: object;
    /** The chat bot configuration. */
    config?: object;
}
```

</details>
