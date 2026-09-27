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

## Constants

<dl>
<dt><a href="#memStore">memStore</a></dt>
<dd><p>Setup the memory store.</p>
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

**Kind**: global class\

* [AIChatBot](#AIChatBot)
    * [new AIChatBot()](#new_AIChatBot_new)
    * [.configKey](#AIChatBot.configKey) ⇒
    * [.defaultConfig()](#AIChatBot.defaultConfig) ⇒
    * [.mergeConfig(context)](#AIChatBot.mergeConfig) ⇒
    * [.validateConfig(config, [_context])](#AIChatBot.validateConfig)
    * [.register(context)](#AIChatBot.register)
    * [.bindRoutes(server, context)](#AIChatBot.bindRoutes)
    * [.apiRequestHandler(context)](#AIChatBot.apiRequestHandler) ⇒
    * [.bindWebSocket(server, context)](#AIChatBot.bindWebSocket)
    * [.chatQuery(payload, context)](#AIChatBot.chatQuery) ⇒
    * [.runChatPass(ws, messages, config, context)](#AIChatBot.runChatPass) ⇒
    * [.documentsHandler(context)](#AIChatBot.documentsHandler) ⇒
    * [.summarizeTurn(baseUrl, model, prevSummary, lastTurns, newUser, newAssistant)](#AIChatBot.summarizeTurn) ⇒

<a name="new_AIChatBot_new"></a>

### new AIChatBot()
**Example** *(AIChatBot)*\
```js
const content = AIChatBot.chat(context);
```
<a name="AIChatBot.configKey"></a>

### AIChatBot.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AIChatBot</code>](#AIChatBot)\
**Returns**: The configuration key.\
**Example** *(AIChatBot.configKey)*\
```js
const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
```
<a name="AIChatBot.defaultConfig"></a>

### AIChatBot.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\
**Returns**: The configuration.\
**Example** *(AIChatBot.defaultConfig())*\
```js
const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
```
<a name="AIChatBot.mergeConfig"></a>

### AIChatBot.mergeConfig(context) ⇒
Merge the default configuration with the provided context configuration.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\
**Returns**: The merged configuration.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="AIChatBot.validateConfig"></a>

### AIChatBot.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |
| [_context] | Unused. |

**Example** *(AIChatBot.validateConfig(config, _context))*\
```js
AIChatBot.validateConfig({ ... });
```
<a name="AIChatBot.register"></a>

### AIChatBot.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(AIChatBot.register(context))*\
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

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| context | A Uttori-like context. |

**Example** *(AIChatBot.bindRoutes(server, context))*\
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

### AIChatBot.apiRequestHandler(context) ⇒
Handle POST requests to stream chat responses as server-sent events.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(AIChatBot.apiRequestHandler(context))*\
```js
server.post('/chat-api', AIChatBot.apiRequestHandler(context));
```
<a name="AIChatBot.bindWebSocket"></a>

### AIChatBot.bindWebSocket(server, context)
Bind the WebSocket server to the server object.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| context | A Uttori-like context. |

**Example** *(AIChatBot.bindWebSocket(server, context))*\
```js
AIChatBot.bindWebSocket(server, context);
```
<a name="AIChatBot.chatQuery"></a>

### AIChatBot.chatQuery(payload, context) ⇒
Run a single non-streaming chat turn and return the final assistant message.
Exposed via the `chat-query` hook so other plugins (such as the MCP provider) can ask the
chat bot a question programmatically.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\
**Returns**: The final assistant message content.\

| Param | Description |
| --- | --- |
| payload | The chat request. |
| payload.query | The user question. |
| [payload.slugs] | Optional document slugs to focus retrieval on. |
| context | A Uttori-like context. |

<a name="AIChatBot.runChatPass"></a>

### AIChatBot.runChatPass(ws, messages, config, context) ⇒
Helper: stream one /api/chat call and forward chunks to client,
intercepting tool calls. Returns {messages, finished}
messages: updated transcript to continue if tool used
finished: true once an assistant final turn is produced

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\
**Returns**: The messages and finished status.\

| Param | Description |
| --- | --- |
| ws | Destination for serialized events: a WebSocket, SSE adapter, or silent sink. |
| messages | The messages. |
| config | The configuration. |
| context | A Uttori-like context exposing `context.hooks` for tool execution. |

<a name="AIChatBot.documentsHandler"></a>

### AIChatBot.documentsHandler(context) ⇒
Handle requests to fetch available documents for the document selector.
Delegates to the registered search provider via the `search-documents` hook.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="AIChatBot.summarizeTurn"></a>

### AIChatBot.summarizeTurn(baseUrl, model, prevSummary, lastTurns, newUser, newAssistant) ⇒
Summarize the conversation between the user and the assistant.

**Kind**: static method of [<code>AIChatBot</code>](#AIChatBot)\
**Returns**: The new summary of the conversation.\

| Param | Description |
| --- | --- |
| baseUrl | The base URL of the API. |
| model | The model to use for the summarizer. |
| prevSummary | The previous summary of the conversation. |
| lastTurns | The last turns of the conversation. |
| newUser | The new user message. |
| newAssistant | The new assistant message. |

<a name="memStore"></a>

## memStore
Setup the memory store.

**Kind**: global constant\

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import { extractAttachmentText } from './chat-bot/attachment-extractor.js';
import type { ChatBotMessage, AIChatBotConfig, AIChatBotSSEStream, AIChatBotContext } from '../types/plugins/ai-chat-bot.js';
export type { ChatBotMessage, OllamaChatToolCallFunction, OllamaChatToolCall, OllamaChatMessage, OllamaChatResponse, AIChatBotConfig, AIChatBotApiRequestBody, AIChatBotSSEStreamSend, AIChatBotSSEStream, AIChatBotSSEEvent, AIChatBotContext, AIChatBotInterfaceRequestHandler, } from '../types/plugins/ai-chat-bot.js';
export { extractAttachmentText };
/**
 * Uttori AI Chat Bot
 * Search a UttoriWiki database using LLMs.
 *
 * The chat bot owns only the chat interface: HTTP/SSE and WebSocket transports, the tool-call
 * orchestration loop, prompt construction, and the rolling conversation summary. All data access
 * (retrieval, search, document listing, history) is delegated to the registered storage / search
 * providers through the Uttori hook system, so the chat bot no longer owns a database of its own.
 * @example <caption>AIChatBot</caption>
 * const content = AIChatBot.chat(context);
 */
declare class AIChatBot {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>AIChatBot.configKey</caption>
     * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
     */
    static get configKey(): 'uttori-plugin-ai-chat-bot';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>AIChatBot.defaultConfig()</caption>
     * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<AIChatBotConfig, 'events' | 'websocketRoute' | 'publicRoute' | 'documentsRoute' | 'middlewarePublicRoute' | 'chatModel' | 'ollamaBaseUrl' | 'tools' | 'maxTokens' | 'temperature' | 'retrieveLimit' | 'summary'>;
    /**
     * Merge the default configuration with the provided context configuration.
     * @param context A Uttori-like context.
     * @returns The merged configuration.
     */
    static mergeConfig(context: AIChatBotContext): {
        websocketRoute: string;
        publicRoute: string;
        documentsRoute: string;
        interfaceRequestHandler?: import("../types/plugins/ai-chat-bot.js").AIChatBotInterfaceRequestHandler;
        middlewarePublicRoute: import('express').RequestHandler[];
        ollamaBaseUrl: string;
        tools: import("./chat-bot/tools.js").OllamaTool[] | null;
        chatModel: string;
        maxTokens: number;
        temperature: number;
        retrieveLimit: number;
        summary: {
            enabled: boolean;
            baseUrl: string;
            model: string;
        };
        events: {
            [x: string]: string[];
        };
    };
    /**
     * Validates the provided configuration for required entries.
     * @param config A provided configuration to use.
     * @param [_context] Unused.
     * @example <caption>AIChatBot.validateConfig(config, _context)</caption>
     * AIChatBot.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, AIChatBotConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>AIChatBot.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [AIChatBot.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * AIChatBot.register(context);
     */
    static register(context: AIChatBotContext): Promise<void>;
    /**
     * Add the chat routes to the server object.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>AIChatBot.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [AIChatBot.configKey]: {
     *       middlewarePublicRoute: [],
     *     },
     *   },
     * };
     * AIChatBot.bindRoutes(server, context);
     */
    static bindRoutes(server: import('express').Application, context: AIChatBotContext): void;
    /**
     * Handle POST requests to stream chat responses as server-sent events.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>AIChatBot.apiRequestHandler(context)</caption>
     * server.post('/chat-api', AIChatBot.apiRequestHandler(context));
     */
    static apiRequestHandler(context: AIChatBotContext): import('express').RequestHandler;
    /**
     * Bind the WebSocket server to the server object.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>AIChatBot.bindWebSocket(server, context)</caption>
     * AIChatBot.bindWebSocket(server, context);
     */
    static bindWebSocket(server: import('http').Server, context: AIChatBotContext): void;
    /**
     * Run a single non-streaming chat turn and return the final assistant message.
     * Exposed via the `chat-query` hook so other plugins (such as the MCP provider) can ask the
     * chat bot a question programmatically.
     * @param payload The chat request.
     * @param payload.query The user question.
     * @param [payload.slugs] Optional document slugs to focus retrieval on.
     * @param context A Uttori-like context.
     * @returns The final assistant message content.
     */
    static chatQuery(payload: {
        query: string;
        slugs?: string[];
    }, context: AIChatBotContext): Promise<string>;
    /**
     * Helper: stream one /api/chat call and forward chunks to client,
     * intercepting tool calls. Returns {messages, finished}
     * messages: updated transcript to continue if tool used
     * finished: true once an assistant final turn is produced
     * @param ws Destination for serialized events: a WebSocket, SSE adapter, or silent sink.
     * @param messages The messages.
     * @param config The configuration.
     * @param context A Uttori-like context exposing `context.hooks` for tool execution.
     * @returns The messages and finished status.
     */
    static runChatPass(ws: AIChatBotSSEStream, messages: ChatBotMessage[], config: AIChatBotConfig, context: AIChatBotContext): Promise<{
        messages: ChatBotMessage[];
        finished: boolean;
    }>;
    /**
     * Handle requests to fetch available documents for the document selector.
     * Delegates to the registered search provider via the `search-documents` hook.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static documentsHandler(context: AIChatBotContext): import('express').RequestHandler;
    /**
     * Summarize the conversation between the user and the assistant.
     * @param baseUrl The base URL of the API.
     * @param model The model to use for the summarizer.
     * @param prevSummary The previous summary of the conversation.
     * @param lastTurns The last turns of the conversation.
     * @param newUser The new user message.
     * @param newAssistant The new assistant message.
     * @returns The new summary of the conversation.
     */
    static summarizeTurn(baseUrl: string, model: string, prevSummary: string, lastTurns: import('./chat-bot/memory.js').Turn[], newUser: string, newAssistant: string): Promise<string>;
}
export default AIChatBot;

export interface ChatBotMessage {
    /** The role of the message. */
    role: 'system' | 'user' | 'assistant' | 'tool';
    /** The content of the message. */
    content: string;
    /** The name of the tool. */
    name?: string;
    /** The slugs of the sources to use as context. */
    slugs?: string[];
}
/** Function payload inside an Ollama `/api/chat` tool call. */
export interface OllamaChatToolCallFunction {
    /** The function name. */
    name: string;
    /** Parsed arguments object. */
    arguments?: Record<string, unknown>;
}
/** A tool call entry returned by Ollama's `/api/chat` endpoint. */
export interface OllamaChatToolCall {
    /** The invoked function. */
    function: OllamaChatToolCallFunction;
}
/** Message payload in an Ollama `/api/chat` response. */
export interface OllamaChatMessage {
    /** The message role. */
    role?: 'assistant' | 'tool';
    /** Assistant text content. */
    content?: string;
    /** Reasoning text for thinking-capable models. */
    thinking?: string;
    /** Tool calls requested by the model. */
    tool_calls?: OllamaChatToolCall[];
}
/** A single Ollama `/api/chat` response (non-streaming body or one NDJSON stream line). */
export interface OllamaChatResponse {
    /** The model that produced the response. */
    model?: string;
    /** ISO timestamp of the response. */
    created_at?: string;
    /** The assistant message payload. */
    message?: OllamaChatMessage;
    /** Whether generation has finished. */
    done?: boolean;
    /** Why generation stopped. */
    done_reason?: string;
}
export interface AIChatBotConfig {
    /** Events to bind to. */
    events?: Record<string, string[]>;
    /** The WebSocket route for streaming to and from the chat bot interface. */
    websocketRoute: string;
    /** Server route to show the chat bot interface. */
    publicRoute: string;
    /** Server route to fetch available documents for the document selector. */
    documentsRoute: string;
    /** A request handler for the interface route. */
    interfaceRequestHandler?: AIChatBotInterfaceRequestHandler;
    /** Custom Middleware for the public route. */
    middlewarePublicRoute: import('express').RequestHandler[];
    /** The base URL for the Ollama server. */
    ollamaBaseUrl: string;
    /**
     * Override tool schemas sent to Ollama. Empty array uses the built-in wiki tools. Null/undefined disables tools entirely.
     */
    tools: import('../../plugins/chat-bot/tools.js').OllamaTool[] | null;
    /** The model to use for the chat. */
    chatModel: string;
    /**
     * The maximum number of tokens to generate. The default value for `num_predict` is typically 128 tokens, though it can also be set to -1 for infinite generation (no limit) or -2 to fill the entire context window.
     */
    maxTokens: number;
    /** The temperature for the model. */
    temperature: number;
    /** Default chunk limit injected into the `vectorSearch` tool when the model does not provide one. */
    retrieveLimit?: number;
    /** The summary configuration. */
    summary: {
        enabled: boolean;
        baseUrl: string;
        model: string;
    };
}
export interface AIChatBotApiRequestBody {
    /** The session ID. */
    sessionId: string;
    /** The query. */
    query: string;
    /** The slugs. */
    slugs: string[];
}
/** Sends a JSON-stringified event payload through the SSE bridge. */
export type AIChatBotSSEStreamSend = (message: string) => void;
/** A duck-typed WebSocket-like send interface used to bridge the POST/SSE path
into the same `runChatPass` logic that the real WebSocket connection uses. */
export interface AIChatBotSSEStream {
    /** Sends a JSON-stringified event payload. */
    send: AIChatBotSSEStreamSend;
}
/** A parsed SSE event payload forwarded from `runChatPass` to the SSE bridge. */
export interface AIChatBotSSEEvent {
    /** Event type: `"token"`, `"thinking"`, `"done"`, or `"error"`. */
    type?: string;
    /** Token or thinking text for `"token"` and `"thinking"` events. */
    data?: unknown;
    /** Error description for `"error"` events. */
    error?: unknown;
}
/** Uttori context narrowed to this plugin's config shape. */
export type AIChatBotContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>;
/** Builds the Express handler for the chat bot interface route. */
export type AIChatBotInterfaceRequestHandler = (context: AIChatBotContext) => import('express').RequestHandler;
```

</details>
