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
//# sourceMappingURL=ai-chat-bot.d.ts.map