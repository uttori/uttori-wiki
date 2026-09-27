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
//# sourceMappingURL=ai-chat-bot.d.ts.map