## Classes

<dl>
<dt><a href="#AIChatBot">AIChatBot</a></dt>
<dd><p>Uttori AI Chat Bot
Search a UttoriWiki database using LLMs.</p>
<p>The chat bot owns only the chat interface: HTTP/SSE and WebSocket transports, the tool-call
orchestration loop, prompt construction, and the rolling conversation summary. All data access
(retrieval, search, document listing, history) is delegated to the registered storage / search
providers through the Uttori hook system, so the chat bot no longer owns a database of its own.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#wss">wss</a> : <code>module:ws~WebSocketServer</code> | <code>undefined</code></dt>
<dd></dd>
</dl>

## Constants

<dl>
<dt><a href="#memStore">memStore</a></dt>
<dd><p>Setup the memory store.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ChatBotMessage">ChatBotMessage</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#OllamaChatToolCallFunction">OllamaChatToolCallFunction</a> : <code>object</code></dt>
<dd><p>Function payload inside an Ollama <code>/api/chat</code> tool call.</p>
</dd>
<dt><a href="#OllamaChatToolCall">OllamaChatToolCall</a> : <code>object</code></dt>
<dd><p>A tool call entry returned by Ollama&#39;s <code>/api/chat</code> endpoint.</p>
</dd>
<dt><a href="#OllamaChatMessage">OllamaChatMessage</a> : <code>object</code></dt>
<dd><p>Message payload in an Ollama <code>/api/chat</code> response.</p>
</dd>
<dt><a href="#OllamaChatResponse">OllamaChatResponse</a> : <code>object</code></dt>
<dd><p>A single Ollama <code>/api/chat</code> response (non-streaming body or one NDJSON stream line).</p>
</dd>
<dt><a href="#AIChatBotConfig">AIChatBotConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AIChatBotApiRequestBody">AIChatBotApiRequestBody</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AIChatBotSSEStreamSend">AIChatBotSSEStreamSend</a> ⇒ <code>void</code></dt>
<dd><p>Sends a JSON-stringified event payload through the SSE bridge.</p>
</dd>
<dt><a href="#AIChatBotSSEStream">AIChatBotSSEStream</a> : <code>object</code></dt>
<dd><p>A duck-typed WebSocket-like send interface used to bridge the POST/SSE path
into the same <code>runChatPass</code> logic that the real WebSocket connection uses.</p>
</dd>
<dt><a href="#AIChatBotSSEEvent">AIChatBotSSEEvent</a> : <code>object</code></dt>
<dd><p>A parsed SSE event payload forwarded from <code>runChatPass</code> to the SSE bridge.</p>
</dd>
<dt><a href="#AIChatBotContext">AIChatBotContext</a> : <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code></dt>
<dd><p>Uttori context narrowed to this plugin&#39;s config shape.</p>
</dd>
<dt><a href="#AIChatBotInterfaceRequestHandler">AIChatBotInterfaceRequestHandler</a> ⇒ <code>module:express~RequestHandler</code></dt>
<dd><p>Builds the Express handler for the chat bot interface route.</p>
</dd>
</dl>

<a name="AIChatBot"></a>

## AIChatBot
Uttori AI Chat Bot
Search a UttoriWiki database using LLMs.

The chat bot owns only the chat interface: HTTP/SSE and WebSocket transports, the tool-call
orchestration loop, prompt construction, and the rolling conversation summary. All data access
(retrieval, search, document listing, history) is delegated to the registered storage / search
providers through the Uttori hook system, so the chat bot no longer owns a database of its own.

**Kind**: global class  

* [AIChatBot](#AIChatBot)
    * [new AIChatBot()](#new_AIChatBot_new)
    * [.configKey](#AIChatBot.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#AIChatBot.defaultConfig) ⇒ [<code>AIChatBotConfig</code>](#AIChatBotConfig)
    * [.mergeConfig(context)](#AIChatBot.mergeConfig) ⇒ [<code>AIChatBotConfig</code>](#AIChatBotConfig)
    * [.validateConfig(config, [_context])](#AIChatBot.validateConfig)
    * [.register(context)](#AIChatBot.register)
    * [.bindRoutes(server, context)](#AIChatBot.bindRoutes)
    * [.apiRequestHandler(context)](#AIChatBot.apiRequestHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.bindWebSocket(server, context)](#AIChatBot.bindWebSocket)
    * [.chatQuery(payload, context)](#AIChatBot.chatQuery) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.runChatPass(ws, messages, config, context)](#AIChatBot.runChatPass) ⇒ <code>Promise.&lt;{messages: Array.&lt;ChatBotMessage&gt;, finished: boolean}&gt;</code>
    * [.documentsHandler(context)](#AIChatBot.documentsHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.summarizeTurn(baseUrl, model, prevSummary, lastTurns, newUser, newAssistant)](#AIChatBot.summarizeTurn) ⇒ <code>Promise.&lt;string&gt;</code>

<a name="new_AIChatBot_new"></a>

### new AIChatBot()
**Example** *(AIChatBot)*  
```js
const content = AIChatBot.chat(context);
```
<a name="AIChatBot.configKey"></a>

### AIChatBot.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(AIChatBot.configKey)*  
```js
const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
```
<a name="AIChatBot.defaultConfig"></a>

### AIChatBot.defaultConfig() ⇒ [<code>AIChatBotConfig</code>](#AIChatBotConfig)
The default configuration.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: [<code>AIChatBotConfig</code>](#AIChatBotConfig) - The configuration.  
**Example** *(AIChatBot.defaultConfig())*  
```js
const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
```
<a name="AIChatBot.mergeConfig"></a>

### AIChatBot.mergeConfig(context) ⇒ [<code>AIChatBotConfig</code>](#AIChatBotConfig)
Merge the default configuration with the provided context configuration.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: [<code>AIChatBotConfig</code>](#AIChatBotConfig) - The merged configuration.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context. |

<a name="AIChatBot.validateConfig"></a>

### AIChatBot.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, AIChatBotConfig&gt;</code> | A provided configuration to use. |
| [_context] | [<code>AIChatBotContext</code>](#AIChatBotContext) | Unused. |

**Example** *(AIChatBot.validateConfig(config, _context))*  
```js
AIChatBot.validateConfig({ ... });
```
<a name="AIChatBot.register"></a>

### AIChatBot.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context. |

**Example** *(AIChatBot.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [AIChatBot.configKey]: {
      ...,
      events: {
        bindRoutes: ['bind-routes'],
      },
    },
  },
};
AIChatBot.register(context);
```
<a name="AIChatBot.bindRoutes"></a>

### AIChatBot.bindRoutes(server, context)
Add the chat routes to the server object.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | An Express server instance. |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context. |

**Example** *(AIChatBot.bindRoutes(server, context))*  
```js
const context = {
  config: {
    [AIChatBot.configKey]: {
      middlewarePublicRoute: [],
    },
  },
};
AIChatBot.bindRoutes(server, context);
```
<a name="AIChatBot.apiRequestHandler"></a>

### AIChatBot.apiRequestHandler(context) ⇒ <code>module:express~RequestHandler</code>
Handle POST requests to stream chat responses as server-sent events.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context. |

**Example** *(AIChatBot.apiRequestHandler(context))*  
```js
server.post('/chat-api', AIChatBot.apiRequestHandler(context));
```
<a name="AIChatBot.bindWebSocket"></a>

### AIChatBot.bindWebSocket(server, context)
Bind the WebSocket server to the server object.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:http~Server</code> | An Express server instance. |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context. |

**Example** *(AIChatBot.bindWebSocket(server, context))*  
```js
AIChatBot.bindWebSocket(server, context);
```
<a name="AIChatBot.chatQuery"></a>

### AIChatBot.chatQuery(payload, context) ⇒ <code>Promise.&lt;string&gt;</code>
Run a single non-streaming chat turn and return the final assistant message.
Exposed via the `chat-query` hook so other plugins (such as the MCP provider) can ask the
chat bot a question programmatically.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>Promise.&lt;string&gt;</code> - The final assistant message content.  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> | The chat request. |
| payload.query | <code>string</code> | The user question. |
| [payload.slugs] | <code>Array.&lt;string&gt;</code> | Optional document slugs to focus retrieval on. |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context. |

<a name="AIChatBot.runChatPass"></a>

### AIChatBot.runChatPass(ws, messages, config, context) ⇒ <code>Promise.&lt;{messages: Array.&lt;ChatBotMessage&gt;, finished: boolean}&gt;</code>
Helper: stream one /api/chat call and forward chunks to client,
intercepting tool calls. Returns {messages, finished}
messages: updated transcript to continue if tool used
finished: true once an assistant final turn is produced

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>Promise.&lt;{messages: Array.&lt;ChatBotMessage&gt;, finished: boolean}&gt;</code> - The messages and finished status.  

| Param | Type | Description |
| --- | --- | --- |
| ws | <code>module:ws~WebSocket</code> | The WebSocket instance. |
| messages | [<code>Array.&lt;ChatBotMessage&gt;</code>](#ChatBotMessage) | The messages. |
| config | [<code>AIChatBotConfig</code>](#AIChatBotConfig) | The configuration. |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context exposing `context.hooks` for tool execution. |

<a name="AIChatBot.documentsHandler"></a>

### AIChatBot.documentsHandler(context) ⇒ <code>module:express~RequestHandler</code>
Handle requests to fetch available documents for the document selector.
Delegates to the registered search provider via the `search-documents` hook.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context. |

<a name="AIChatBot.summarizeTurn"></a>

### AIChatBot.summarizeTurn(baseUrl, model, prevSummary, lastTurns, newUser, newAssistant) ⇒ <code>Promise.&lt;string&gt;</code>
Summarize the conversation between the user and the assistant.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)  
**Returns**: <code>Promise.&lt;string&gt;</code> - The new summary of the conversation.  

| Param | Type | Description |
| --- | --- | --- |
| baseUrl | <code>string</code> | The base URL of the API. |
| model | <code>string</code> | The model to use for the summarizer. |
| prevSummary | <code>string</code> | The previous summary of the conversation. |
| lastTurns | <code>Array.&lt;object&gt;</code> | The last turns of the conversation. |
| newUser | <code>string</code> | The new user message. |
| newAssistant | <code>string</code> | The new assistant message. |

<a name="wss"></a>

## wss : <code>module:ws~WebSocketServer</code> \| <code>undefined</code>
**Kind**: global variable  
<a name="memStore"></a>

## memStore
Setup the memory store.

**Kind**: global constant  
<a name="ChatBotMessage"></a>

## ChatBotMessage : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| role | <code>&quot;system&quot;</code> \| <code>&quot;user&quot;</code> \| <code>&quot;assistant&quot;</code> \| <code>&quot;tool&quot;</code> | The role of the message. |
| content | <code>string</code> | The content of the message. |
| [name] | <code>string</code> | The name of the tool. |
| [slugs] | <code>Array.&lt;string&gt;</code> | The slugs of the sources to use as context. |

<a name="OllamaChatToolCallFunction"></a>

## OllamaChatToolCallFunction : <code>object</code>
Function payload inside an Ollama `/api/chat` tool call.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The function name. |
| [arguments] | <code>Record.&lt;string, unknown&gt;</code> | Parsed arguments object. |

<a name="OllamaChatToolCall"></a>

## OllamaChatToolCall : <code>object</code>
A tool call entry returned by Ollama's `/api/chat` endpoint.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| function | [<code>OllamaChatToolCallFunction</code>](#OllamaChatToolCallFunction) | The invoked function. |

<a name="OllamaChatMessage"></a>

## OllamaChatMessage : <code>object</code>
Message payload in an Ollama `/api/chat` response.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [role] | <code>&quot;assistant&quot;</code> \| <code>&quot;tool&quot;</code> | The message role. |
| [content] | <code>string</code> | Assistant text content. |
| [thinking] | <code>string</code> | Reasoning text for thinking-capable models. |
| [tool_calls] | [<code>Array.&lt;OllamaChatToolCall&gt;</code>](#OllamaChatToolCall) | Tool calls requested by the model. |

<a name="OllamaChatResponse"></a>

## OllamaChatResponse : <code>object</code>
A single Ollama `/api/chat` response (non-streaming body or one NDJSON stream line).

**Kind**: global typedef  
**See**: [https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion](https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion) Ollama API documentation.  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [model] | <code>string</code> | The model that produced the response. |
| [created_at] | <code>string</code> | ISO timestamp of the response. |
| [message] | [<code>OllamaChatMessage</code>](#OllamaChatMessage) | The assistant message payload. |
| [done] | <code>boolean</code> | Whether generation has finished. |
| [done_reason] | <code>string</code> | Why generation stopped. |

<a name="AIChatBotConfig"></a>

## AIChatBotConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | Events to bind to. |
| websocketRoute | <code>string</code> | The WebSocket route for streaming to and from the chat bot interface. |
| publicRoute | <code>string</code> | Server route to show the chat bot interface. |
| documentsRoute | <code>string</code> | Server route to fetch available documents for the document selector. |
| [interfaceRequestHandler] | [<code>AIChatBotInterfaceRequestHandler</code>](#AIChatBotInterfaceRequestHandler) | A request handler for the interface route. |
| middlewarePublicRoute | <code>Array.&lt;module:express~RequestHandler&gt;</code> | Custom Middleware for the public route. |
| ollamaBaseUrl | <code>string</code> | The base URL for the Ollama server. |
| tools | <code>Array.&lt;OllamaTool&gt;</code> \| <code>null</code> | Override tool schemas sent to Ollama. Empty array uses the built-in wiki tools. Null/undefined disables tools entirely. |
| chatModel | <code>string</code> | The model to use for the chat. |
| maxTokens | <code>number</code> | The maximum number of tokens to generate. The default value for `num_predict` is typically 128 tokens, though it can also be set to -1 for infinite generation (no limit) or -2 to fill the entire context window. |
| temperature | <code>number</code> | The temperature for the model. |
| [retrieveLimit] | <code>number</code> | Default chunk limit injected into the `vectorSearch` tool when the model does not provide one. |
| summary | <code>object</code> | The summary configuration. |
| summary.enabled | <code>boolean</code> | Whether to use the summary. |
| summary.baseUrl | <code>string</code> | The base URL for the summary. |
| summary.model | <code>string</code> | The model to use for the summary. |

<a name="AIChatBotApiRequestBody"></a>

## AIChatBotApiRequestBody : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| sessionId | <code>string</code> | The session ID. |
| query | <code>string</code> | The query. |
| slugs | <code>Array.&lt;string&gt;</code> | The slugs. |

<a name="AIChatBotSSEStreamSend"></a>

## AIChatBotSSEStreamSend ⇒ <code>void</code>
Sends a JSON-stringified event payload through the SSE bridge.

**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | JSON-stringified event payload. |

<a name="AIChatBotSSEStream"></a>

## AIChatBotSSEStream : <code>object</code>
A duck-typed WebSocket-like send interface used to bridge the POST/SSE path
into the same `runChatPass` logic that the real WebSocket connection uses.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| send | [<code>AIChatBotSSEStreamSend</code>](#AIChatBotSSEStreamSend) | Sends a JSON-stringified event payload. |

<a name="AIChatBotSSEEvent"></a>

## AIChatBotSSEEvent : <code>object</code>
A parsed SSE event payload forwarded from `runChatPass` to the SSE bridge.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [type] | <code>string</code> | Event type: `"token"`, `"thinking"`, `"done"`, or `"error"`. |
| [data] | <code>unknown</code> | Token or thinking text for `"token"` and `"thinking"` events. |
| [error] | <code>unknown</code> | Error description for `"error"` events. |

<a name="AIChatBotContext"></a>

## AIChatBotContext : <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code>
Uttori context narrowed to this plugin's config shape.

**Kind**: global typedef  
<a name="AIChatBotInterfaceRequestHandler"></a>

## AIChatBotInterfaceRequestHandler ⇒ <code>module:express~RequestHandler</code>
Builds the Express handler for the chat bot interface route.

**Kind**: global typedef  
**Returns**: <code>module:express~RequestHandler</code> - The Express request handler.  

| Param | Type | Description |
| --- | --- | --- |
| context | [<code>AIChatBotContext</code>](#AIChatBotContext) | A Uttori-like context. |

