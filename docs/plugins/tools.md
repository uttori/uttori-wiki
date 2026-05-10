## Constants

<dl>
<dt><a href="#MAX_CHUNK_CHARS">MAX_CHUNK_CHARS</a> : <code>number</code></dt>
<dd><p>Maximum characters to include per retrieved chunk in the context block.
Chunks longer than this are truncated with an ellipsis.</p>
</dd>
<dt><a href="#vectorSearchTool">vectorSearchTool</a> : <code><a href="#OllamaTool">OllamaTool</a></code></dt>
<dd><p>Built-in Ollama tool schema for <code>vectorSearch</code>.
Passed verbatim in the <code>tools</code> array of every <code>/api/chat</code> request.</p>
</dd>
<dt><a href="#BUILT_IN_TOOLS">BUILT_IN_TOOLS</a> : <code>Map.&lt;string, OllamaTool&gt;</code></dt>
<dd><p>Map of all built-in chat tools indexed by their name.
Extend this map to register additional tools without changing <code>runChatPass</code>.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#buildChatTools">buildChatTools(config)</a> ⇒ <code><a href="#OllamaTool">Array.&lt;OllamaTool&gt;</a></code></dt>
<dd><p>Build the array of Ollama tool schemas to include in an <code>/api/chat</code> request.
When <code>config.tools</code> is a non-empty array it is used as-is, so callers retain
full control. When it is empty or absent the built-in wiki tools are used.
Pass <code>config.tools = null</code> (or any non-array) to disable tools entirely.</p>
</dd>
<dt><a href="#formatRetrievalResult">formatRetrievalResult(result)</a> ⇒ <code>string</code></dt>
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
<dt><a href="#executeChatTool">executeChatTool(name, args, config, [retrieveFn])</a> ⇒ <code>Promise.&lt;(string|ChatToolResult)&gt;</code></dt>
<dd><p>Execute a named chat tool and return its formatted result.
Unknown tool names return an error object consistent with the original behaviour.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#OllamaToolFunction">OllamaToolFunction</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#OllamaTool">OllamaTool</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ChatToolResult">ChatToolResult</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#RetrieveFn">RetrieveFn</a> ⇒ <code>Promise.&lt;RetrieveResponse&gt;</code></dt>
<dd><p>Signature of the retrieval function accepted by <a href="#executeChatTool">executeChatTool</a>.
Matches the signature of <code>retrieve</code> from <code>./retrieval.js</code>.</p>
</dd>
</dl>

<a name="MAX_CHUNK_CHARS"></a>

## MAX\_CHUNK\_CHARS : <code>number</code>
Maximum characters to include per retrieved chunk in the context block.Chunks longer than this are truncated with an ellipsis.

**Kind**: global constant  
<a name="vectorSearchTool"></a>

## vectorSearchTool : [<code>OllamaTool</code>](#OllamaTool)
Built-in Ollama tool schema for `vectorSearch`.Passed verbatim in the `tools` array of every `/api/chat` request.

**Kind**: global constant  
<a name="BUILT_IN_TOOLS"></a>

## BUILT\_IN\_TOOLS : <code>Map.&lt;string, OllamaTool&gt;</code>
Map of all built-in chat tools indexed by their name.Extend this map to register additional tools without changing `runChatPass`.

**Kind**: global constant  
<a name="buildChatTools"></a>

## buildChatTools(config) ⇒ [<code>Array.&lt;OllamaTool&gt;</code>](#OllamaTool)
Build the array of Ollama tool schemas to include in an `/api/chat` request.When `config.tools` is a non-empty array it is used as-is, so callers retainfull control. When it is empty or absent the built-in wiki tools are used.Pass `config.tools = null` (or any non-array) to disable tools entirely.

**Kind**: global function  
**Returns**: [<code>Array.&lt;OllamaTool&gt;</code>](#OllamaTool) - The tool schemas for Ollama.  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>AIChatBotConfig</code> | The chat bot configuration. |

<a name="formatRetrievalResult"></a>

## formatRetrievalResult(result) ⇒ <code>string</code>
Format a [RetrieveResponse](RetrieveResponse) into the compact contextblock string that is sent back to the model as a tool result.Each chunk becomes a block:```SOURCE: <title>[ - <section path>]SLUG: <slug>---<text (truncated to MAX_CHUNK_CHARS)>```Blocks are joined with `\n\n====\n\n`.

**Kind**: global function  
**Returns**: <code>string</code> - The formatted context block.  

| Param | Type | Description |
| --- | --- | --- |
| result | <code>RetrieveResponse</code> | The retrieval result. |

<a name="formatRetrievalResult..blocks"></a>

### formatRetrievalResult~blocks : <code>Array.&lt;string&gt;</code>
**Kind**: inner constant of [<code>formatRetrievalResult</code>](#formatRetrievalResult)  
<a name="executeChatTool"></a>

## executeChatTool(name, args, config, [retrieveFn]) ⇒ <code>Promise.&lt;(string\|ChatToolResult)&gt;</code>
Execute a named chat tool and return its formatted result.Unknown tool names return an error object consistent with the original behaviour.

**Kind**: global function  
**Returns**: <code>Promise.&lt;(string\|ChatToolResult)&gt;</code> - The formatted result string, or an error object.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The tool name as returned by the model. |
| args | <code>Record.&lt;string, any&gt;</code> | The arguments object from the model's tool call. |
| config | <code>AIChatBotConfig</code> | The chat bot configuration. |
| [retrieveFn] | [<code>RetrieveFn</code>](#RetrieveFn) | Optional retrieval function override, primarily for testing. |

<a name="OllamaToolFunction"></a>

## OllamaToolFunction : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The function name. |
| description | <code>string</code> | The function description. |
| parameters | <code>object</code> | The JSON Schema for the function parameters. |

<a name="OllamaTool"></a>

## OllamaTool : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>&quot;function&quot;</code> | The type of tool. |
| function | [<code>OllamaToolFunction</code>](#OllamaToolFunction) | The function definition. |

<a name="ChatToolResult"></a>

## ChatToolResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [error] | <code>string</code> | Set when the tool name is unknown. |

<a name="RetrieveFn"></a>

## RetrieveFn ⇒ <code>Promise.&lt;RetrieveResponse&gt;</code>
Signature of the retrieval function accepted by [executeChatTool](#executeChatTool).Matches the signature of `retrieve` from `./retrieval.js`.

**Kind**: global typedef  
**Returns**: <code>Promise.&lt;RetrieveResponse&gt;</code> - The retrieval result.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The search query. |
| config | <code>AIChatBotConfig</code> | The chat bot configuration. |
| slugs | <code>Array.&lt;string&gt;</code> | Optional slugs to restrict the search to. |

