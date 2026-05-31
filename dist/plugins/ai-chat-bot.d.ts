export { extractAttachmentText };
export default AIChatBot;
export type ChatBotMessage = {
    /**
     * The role of the message.
     */
    role: "system" | "user" | "assistant" | "tool";
    /**
     * The content of the message.
     */
    content: string;
    /**
     * The name of the tool.
     */
    name?: string | undefined;
    /**
     * The slugs of the sources to use as context.
     */
    slugs?: string[] | undefined;
};
/**
 * Function payload inside an Ollama `/api/chat` tool call.
 */
export type OllamaChatToolCallFunction = {
    /**
     * The function name.
     */
    name: string;
    /**
     * Parsed arguments object.
     */
    arguments?: Record<string, unknown> | undefined;
};
/**
 * A tool call entry returned by Ollama's `/api/chat` endpoint.
 */
export type OllamaChatToolCall = {
    /**
     * The invoked function.
     */
    function: OllamaChatToolCallFunction;
};
/**
 * Message payload in an Ollama `/api/chat` response.
 */
export type OllamaChatMessage = {
    /**
     * The message role.
     */
    role?: "assistant" | "tool" | undefined;
    /**
     * Assistant text content.
     */
    content?: string | undefined;
    /**
     * Reasoning text for thinking-capable models.
     */
    thinking?: string | undefined;
    /**
     * Tool calls requested by the model.
     */
    tool_calls?: OllamaChatToolCall[] | undefined;
};
/**
 * A single Ollama `/api/chat` response (non-streaming body or one NDJSON stream line).
 */
export type OllamaChatResponse = {
    /**
     * The model that produced the response.
     */
    model?: string | undefined;
    /**
     * ISO timestamp of the response.
     */
    created_at?: string | undefined;
    /**
     * The assistant message payload.
     */
    message?: OllamaChatMessage | undefined;
    /**
     * Whether generation has finished.
     */
    done?: boolean | undefined;
    /**
     * Why generation stopped.
     */
    done_reason?: string | undefined;
};
export type AIChatBotConfig = {
    /**
     * Events to bind to.
     */
    events?: Record<string, string[]> | undefined;
    /**
     * The WebSocket route for streaming to and from the chat bot interface.
     */
    websocketRoute: string;
    /**
     * Server route to show the chat bot interface.
     */
    publicRoute: string;
    /**
     * Server route to fetch available documents for the document selector.
     */
    documentsRoute: string;
    /**
     * A request handler for the interface route.
     */
    interfaceRequestHandler?: AIChatBotInterfaceRequestHandler | undefined;
    /**
     * Custom Middleware for the public route.
     */
    middlewarePublicRoute: import("express").RequestHandler[];
    /**
     * The base URL for the Ollama server.
     */
    ollamaBaseUrl: string;
    /**
     * Override tool schemas sent to Ollama. Empty array uses the built-in wiki tools. Null/undefined disables tools entirely.
     */
    tools: import("./chat-bot/tools.js").OllamaTool[] | null;
    /**
     * The model to use for the chat.
     */
    chatModel: string;
    /**
     * The maximum number of tokens to generate. The default value for `num_predict` is typically 128 tokens, though it can also be set to -1 for infinite generation (no limit) or -2 to fill the entire context window.
     */
    maxTokens: number;
    /**
     * The temperature for the model.
     */
    temperature: number;
    /**
     * Default chunk limit injected into the `vectorSearch` tool when the model does not provide one.
     */
    retrieveLimit?: number | undefined;
    /**
     * The summary configuration.
     */
    summary: {
        enabled: boolean;
        baseUrl: string;
        model: string;
    };
};
export type AIChatBotApiRequestBody = {
    /**
     * The session ID.
     */
    sessionId: string;
    /**
     * The query.
     */
    query: string;
    /**
     * The slugs.
     */
    slugs: string[];
};
/**
 * Sends a JSON-stringified event payload through the SSE bridge.
 */
export type AIChatBotSSEStreamSend = (message: string) => void;
/**
 * A duck-typed WebSocket-like send interface used to bridge the POST/SSE path
 * into the same `runChatPass` logic that the real WebSocket connection uses.
 */
export type AIChatBotSSEStream = {
    /**
     * Sends a JSON-stringified event payload.
     */
    send: AIChatBotSSEStreamSend;
};
/**
 * A parsed SSE event payload forwarded from `runChatPass` to the SSE bridge.
 */
export type AIChatBotSSEEvent = {
    /**
     * Event type: `"token"`, `"thinking"`, `"done"`, or `"error"`.
     */
    type?: string | undefined;
    /**
     * Token or thinking text for `"token"` and `"thinking"` events.
     */
    data?: unknown;
    /**
     * Error description for `"error"` events.
     */
    error?: unknown;
};
/**
 * Uttori context narrowed to this plugin's config shape.
 */
export type AIChatBotContext = import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-ai-chat-bot", AIChatBotConfig>;
/**
 * Builds the Express handler for the chat bot interface route.
 */
export type AIChatBotInterfaceRequestHandler = (context: AIChatBotContext) => import("express").RequestHandler;
import { extractAttachmentText } from './chat-bot/attachment-extractor.js';
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
 * @class
 */
declare class AIChatBot {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>AIChatBot.configKey</caption>
     * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {AIChatBotConfig} The configuration.
     * @example <caption>AIChatBot.defaultConfig()</caption>
     * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
     * @static
     */
    static defaultConfig(): AIChatBotConfig;
    /**
     * Merge the default configuration with the provided context configuration.
     * @param {AIChatBotContext} context A Uttori-like context.
     * @returns {AIChatBotConfig} The merged configuration.
     * @static
     */
    static mergeConfig(context: AIChatBotContext): AIChatBotConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, AIChatBotConfig>} config A provided configuration to use.
     * @param {AIChatBotContext} [_context] Unused.
     * @example <caption>AIChatBot.validateConfig(config, _context)</caption>
     * AIChatBot.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, AIChatBotConfig>, _context?: AIChatBotContext): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {AIChatBotContext} context A Uttori-like context.
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
     * @static
     */
    static register(context: AIChatBotContext): Promise<void>;
    /**
     * Add the chat routes to the server object.
     * @param {import('express').Application} server An Express server instance.
     * @param {AIChatBotContext} context A Uttori-like context.
     * @example <caption>AIChatBot.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [AIChatBot.configKey]: {
     *       middlewarePublicRoute: [],
     *     },
     *   },
     * };
     * AIChatBot.bindRoutes(server, context);
     * @static
     */
    static bindRoutes(server: import("express").Application, context: AIChatBotContext): void;
    /**
     * Handle POST requests to stream chat responses as server-sent events.
     * @param {AIChatBotContext} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @example <caption>AIChatBot.apiRequestHandler(context)</caption>
     * server.post('/chat-api', AIChatBot.apiRequestHandler(context));
     * @static
     */
    static apiRequestHandler(context: AIChatBotContext): import("express").RequestHandler;
    /**
     * Bind the WebSocket server to the server object.
     * @param {import('http').Server} server An Express server instance.
     * @param {AIChatBotContext} context A Uttori-like context.
     * @example <caption>AIChatBot.bindWebSocket(server, context)</caption>
     * AIChatBot.bindWebSocket(server, context);
     * @static
     */
    static bindWebSocket(server: import("http").Server, context: AIChatBotContext): void;
    /**
     * Run a single non-streaming chat turn and return the final assistant message.
     * Exposed via the `chat-query` hook so other plugins (such as the MCP provider) can ask the
     * chat bot a question programmatically.
     * @param {object} payload The chat request.
     * @param {string} payload.query The user question.
     * @param {string[]} [payload.slugs] Optional document slugs to focus retrieval on.
     * @param {AIChatBotContext} context A Uttori-like context.
     * @returns {Promise<string>} The final assistant message content.
     * @static
     */
    static chatQuery(payload: {
        query: string;
        slugs?: string[] | undefined;
    }, context: AIChatBotContext): Promise<string>;
    /**
     * Helper: stream one /api/chat call and forward chunks to client,
     * intercepting tool calls. Returns {messages, finished}
     * messages: updated transcript to continue if tool used
     * finished: true once an assistant final turn is produced
     * @param {import('ws').WebSocket} ws The WebSocket instance.
     * @param {ChatBotMessage[]} messages The messages.
     * @param {AIChatBotConfig} config The configuration.
     * @param {AIChatBotContext} context A Uttori-like context exposing `context.hooks` for tool execution.
     * @returns {Promise<{messages: ChatBotMessage[], finished: boolean}>} The messages and finished status.
     */
    static runChatPass(ws: import("ws").WebSocket, messages: ChatBotMessage[], config: AIChatBotConfig, context: AIChatBotContext): Promise<{
        messages: ChatBotMessage[];
        finished: boolean;
    }>;
    /**
     * Handle requests to fetch available documents for the document selector.
     * Delegates to the registered search provider via the `search-documents` hook.
     * @param {AIChatBotContext} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static documentsHandler(context: AIChatBotContext): import("express").RequestHandler;
    /**
     * Summarize the conversation between the user and the assistant.
     * @param {string} baseUrl The base URL of the API.
     * @param {string} model The model to use for the summarizer.
     * @param {string} prevSummary The previous summary of the conversation.
     * @param {object[]} lastTurns The last turns of the conversation.
     * @param {string} newUser The new user message.
     * @param {string} newAssistant The new assistant message.
     * @returns {Promise<string>} The new summary of the conversation.
     */
    static summarizeTurn(baseUrl: string, model: string, prevSummary: string, lastTurns: object[], newUser: string, newAssistant: string): Promise<string>;
}
//# sourceMappingURL=ai-chat-bot.d.ts.map