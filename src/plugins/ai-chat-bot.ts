import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import url from 'node:url';
import { WebSocketServer } from 'ws';
import { extractAttachmentText } from './chat-bot/attachment-extractor.js';
import { MemoryStore } from './chat-bot/memory.js';
import OllamaEmbedder from './chat-bot/ollama-embedder.js';
import { buildPromptMessages } from './chat-bot/prompts.js';
import { buildChatTools, executeChatTool } from './chat-bot/tools.js';
import type {
  ChatBotMessage, OllamaChatToolCall, OllamaChatResponse, AIChatBotConfig, AIChatBotApiRequestBody,
  AIChatBotSSEStream, AIChatBotSSEEvent, AIChatBotContext,
} from '../types/plugins/ai-chat-bot.js';

export type {
  ChatBotMessage, OllamaChatToolCallFunction, OllamaChatToolCall, OllamaChatMessage, OllamaChatResponse,
  AIChatBotConfig, AIChatBotApiRequestBody, AIChatBotSSEStreamSend, AIChatBotSSEStream,
  AIChatBotSSEEvent, AIChatBotContext, AIChatBotInterfaceRequestHandler,
} from '../types/plugins/ai-chat-bot.js';

export { extractAttachmentText };

/**
 * Setup
 * ollama pull qwen3.5:9b
 * ollama pull qwen3-embedding:8b
 */

/** Setup the memory store. */
const memStore = new MemoryStore(60 * 60 * 1000, 5); // 1h TTL, last 5 turns

const debug = createDebug('Uttori.Plugin.AIChatBot');

let wss: import('ws').WebSocketServer | undefined = new WebSocketServer({ noServer: true });

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
class AIChatBot {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>AIChatBot.configKey</caption>
   * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
   */
  static get configKey(): 'uttori-plugin-ai-chat-bot' {
    return 'uttori-plugin-ai-chat-bot';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example <caption>AIChatBot.defaultConfig()</caption>
   * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<AIChatBotConfig, 'events' | 'websocketRoute' | 'publicRoute' | 'documentsRoute' | 'middlewarePublicRoute' | 'chatModel' | 'ollamaBaseUrl' | 'tools' | 'maxTokens' | 'temperature' | 'retrieveLimit' | 'summary'> {
    return {
      events: {
        bindRoutes: ['bind-routes'],
        bindWebSocket: ['server-listening'],
        chatQuery: ['chat-query'],
      },
      websocketRoute: '/chat-api',
      publicRoute: '/chat',
      documentsRoute: '/chat-documents',
      middlewarePublicRoute: [],
      interfaceRequestHandler: undefined,

      chatModel: 'qwen3.5:9b',
      ollamaBaseUrl: 'http://127.0.0.1:11434',
      tools: [],
      maxTokens: -2,
      temperature: 0.6,
      retrieveLimit: 12,

      summary: {
        enabled: false,
        baseUrl: 'http://127.0.0.1:11434',
        model: 'qwen3.5:9b',
      },
    };
  }

  /**
   * Merge the default configuration with the provided context configuration.
   * @param context A Uttori-like context.
   * @returns The merged configuration.
   */
  static mergeConfig(context: AIChatBotContext) {
    const base = AIChatBot.defaultConfig();
    return {
      ...base,
      ...context.config[AIChatBot.configKey],
      events: {
        ...base.events,
        ...context.config[AIChatBot.configKey]?.events,
      },
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param config A provided configuration to use.
   * @param [_context] Unused.
   * @example <caption>AIChatBot.validateConfig(config, _context)</caption>
   * AIChatBot.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, AIChatBotConfig>, _context?: unknown) {
    debug('Validating config...');
    if (!config || !config[AIChatBot.configKey]) {
      const error = `Config Error: '${AIChatBot.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }
    const pluginConfig = { ...AIChatBot.defaultConfig(), ...config[AIChatBot.configKey] };
    if (typeof pluginConfig.websocketRoute !== 'string') {
      const error = 'Config Error: `websocketRoute` should be a string server route to where files should be API will be reached from.';
      debug(error);
      throw new Error(error);
    }
    if (typeof pluginConfig.publicRoute !== 'string') {
      const error = 'Config Error: `publicRoute` should be a string server route to show the chat bot interface.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(pluginConfig.middlewarePublicRoute)) {
      const error = 'Config Error: `middlewarePublicRoute` should be an array of middleware.';
      debug(error);
      throw new Error(error);
    }
    if (!pluginConfig.interfaceRequestHandler || typeof pluginConfig.interfaceRequestHandler !== 'function') {
      const error = 'Config Error: `interfaceRequestHandler` should be a function.';
      debug(error);
      throw new Error(error);
    }
    debug('Validated config.');
  }

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
  static async register(context: AIChatBotContext) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = AIChatBot.mergeConfig(context);
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events

    const events: Record<string, string[]> = config.events ?? {};
    const eventEntries = Object.entries(events);
    for (const [method, eventNames] of eventEntries) {
      const AIChatBotMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(AIChatBot, method);
      if (AIChatBotMethod) {
        for (const event of eventNames) {

          const callback = AIChatBotMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

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
  static bindRoutes(server: import('express').Application, context: AIChatBotContext) {
    debug('bindRoutes');

    const { publicRoute, documentsRoute, websocketRoute, middlewarePublicRoute, interfaceRequestHandler } = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
    debug('bindRoutes:', { publicRoute, documentsRoute, websocketRoute });

    // Endpoint to fetch available documents for the document selector
    server.get(`${documentsRoute}`, AIChatBot.documentsHandler(context));

    // Endpoint to stream chat responses for the bundled chat interface.
    server.post(`${websocketRoute}`, AIChatBot.apiRequestHandler(context));

    // Endpoint to show the chat bot interface
    if (interfaceRequestHandler) {
      server.get(`${publicRoute}`, ...middlewarePublicRoute, interfaceRequestHandler(context));
    } else {
      debug('No interfaceRequestHandler set.');
    }
  }

  /**
   * Handle POST requests to stream chat responses as server-sent events.
   * @param context A Uttori-like context.
   * @returns The function to pass to Express.
   * @example <caption>AIChatBot.apiRequestHandler(context)</caption>
   * server.post('/chat-api', AIChatBot.apiRequestHandler(context));
   */
  static apiRequestHandler(context: AIChatBotContext): import('express').RequestHandler {
    debug('apiRequestHandler');
    return async (request, response) => {

      const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };

      const rawBody: unknown = request.body ?? {};

      const body: Partial<AIChatBotApiRequestBody> = typeof rawBody === 'object' && rawBody !== null ? rawBody : {};
      const query = typeof body.query === 'string' ? body.query.trim() : '';
      if (!query) {
        response.status(400).json({ error: 'Missing query.' });
        return;
      }

      const slugs = Array.isArray(body.slugs) ? body.slugs.filter(slug => typeof slug === 'string') : [];
      const uniqueId = body.sessionId || request.sessionID || request.session?.id || request.ip || 'no-unique-id';

      response.status(200);
      response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      response.setHeader('Cache-Control', 'no-cache, no-transform');
      response.setHeader('Connection', 'keep-alive');
      response.flushHeaders?.();

      /**
       * Write a JSON payload as an SSE data frame.
       * @param payload The payload to send.
       */
      const writeEvent = (payload: unknown): void => {
        response.write(`data: ${JSON.stringify(payload)}\n\n`);
      };

      const stream: AIChatBotSSEStream = {
        send(message) {
          try {

            const parsed: unknown = JSON.parse(message);
            if (typeof parsed !== 'object' || parsed === null) {
              writeEvent({ token: message });
              return;
            }
            const event = parsed as AIChatBotSSEEvent;
            if (event.type === 'token') {
              writeEvent({ token: event.data });
              return;
            }
            if (event.type === 'thinking') {
              writeEvent({ thinking: event.data });
              return;
            }
            if (event.type === 'done') {
              writeEvent({ done: true });
              return;
            }
            if (event.type === 'error') {
              writeEvent({ error: event.error });
              return;
            }
            writeEvent(parsed);
          } catch {
            writeEvent({ token: message });
          }
        },
      };

      if (config.summary.enabled && uniqueId) {
        debug('🍜 Getting memory for', uniqueId);
        if (!memStore.get(`${uniqueId}`)) {
          debug('🍜 No memory found for', uniqueId);
          memStore.set(`${uniqueId}`, { summary: '', last: [] });
        }
        memStore.touch(`${uniqueId}`);
      }

      const memoryNote = config.summary.enabled && memStore.get(`${uniqueId}`)?.summary ? `Conversation Summary for added context:\n${(memStore.get(`${uniqueId}`)?.summary ?? '')}` : '';

      let messages: ChatBotMessage[] = buildPromptMessages(query, slugs, { maxContextCharacters: 20000 });
      if (config.summary.enabled && memoryNote) {
        messages = messages.map(msg => ({
          ...msg,
          content: `${msg.content}\n\n${memoryNote}`,
        }));
      }

      try {
        for (;;) {
          const { messages: nextMessages, finished } = await AIChatBot.runChatPass( stream, messages, config, context);
          messages = nextMessages;
          if (finished) break;
        }

        if (config.summary.enabled) {
          const memory = memStore.get(`${uniqueId}`);
          const newTurns = [
            ...(memory?.last ?? []),
            {
              user: query,
              assistant: messages[messages.length - 1]?.content ?? '',
              ts: Date.now(),
            },
          ];
          const newSummary = await AIChatBot.summarizeTurn(
            config.summary.baseUrl,
            config.summary.model,
            memory?.summary ?? '',
            memory?.last ?? [],
            query,
            messages[messages.length - 1]?.content ?? '',
          );
          debug('New Summary:', newSummary);
          memStore.set(`${uniqueId}`, { summary: newSummary, last: newTurns });
        }

        stream.send(JSON.stringify({ type: 'done' }));
      } catch (error) {
        debug('apiRequestHandler error:', error);
        stream.send(JSON.stringify({ type: 'error', error: String(error) }));
      } finally {
        response.end();
        memStore.cleanup();
      }
    };
  }

  /**
   * Bind the WebSocket server to the server object.
   * @param server An Express server instance.
   * @param context A Uttori-like context.
   * @example <caption>AIChatBot.bindWebSocket(server, context)</caption>
   * AIChatBot.bindWebSocket(server, context);
   */
  static bindWebSocket(server: import('http').Server, context: AIChatBotContext) {
    debug('bindWebSocket');

    const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };

    if (typeof WebSocketServer === 'function') {
      debug('WebSocket supported');
      debug('Creating WebSocket server with HTTP server');

      // Create WebSocket server with manual upgrade handling
      const webSocketServer = new WebSocketServer({ noServer: true });
      wss = webSocketServer;

      // Handle upgrade requests manually
      server.on('upgrade', (request, socket, head) => {
        debug('🔌 HTTP upgrade request received:', request.url);

        const { pathname } = new URL(request.url ?? '/', `http://${request.headers.host}`);

        debug('Checking pathname:', pathname);
        if (pathname === `${config.websocketRoute}`) {
          debug(`✅ Upgrading to WebSocket for ${config.websocketRoute}`);
          webSocketServer.handleUpgrade(request, socket, head, (ws) => {
            webSocketServer.emit('connection', ws, request);
          });
        } else {
          debug('❌ Rejecting upgrade for path:', pathname);
          socket.destroy();
        }
      });

      debug('🔌 WebSocket upgrade handler registered');
      webSocketServer.on('connection', (ws, request) => {
        debug('WebSocket connection');
        const parameters = url.parse(request.url ?? '/', true);
        const uniqueId = parameters.query.uniqueId || 'no-unique-id';
        // Keep the session identifier available to other connection listeners.
        Object.assign(ws, { uniqueId });

        let firstMessage = true;

        // Maintains a rolling summary of the conversation

        if (config.summary.enabled && uniqueId) {
          debug('🍜 Getting memory for', uniqueId);
          if (!memStore.get(`${String(uniqueId)}`)) {
            debug('🍜 No memory found for', uniqueId);
            memStore.set(`${String(uniqueId)}`, { summary: '', last: [] });
          }
          memStore.touch(`${String(uniqueId)}`);
        }

        ws.on('message', async (raw) => {
          debug('WebSocket message', raw.toString());
          // Expect: { messages: [{role, content}, ...] }

          let payload: Record<string, ChatBotMessage[]>;
          try {
            payload = JSON.parse(raw.toString()) as Record<string, ChatBotMessage[]>;
          } catch {
            debug('WebSocket message parse error', raw.toString());
            return;
          }

          // Build prompt with a short memory preface
          const memoryNote = config.summary.enabled && memStore.get(`${String(uniqueId)}`)?.summary ? `Conversation Summary for added context:\n${(memStore.get(`${String(uniqueId)}`)?.summary ?? '')}` : '';
          debug('🍜 Memory note:', memoryNote);

          let messages: ChatBotMessage[] = payload.messages ?? [];
          if (firstMessage && messages.length) {
            firstMessage = false;

            // Add the prompt to the message and pull it from the first message
            messages = buildPromptMessages(
              payload.messages[0].content,
              payload.messages[0].slugs ?? [],
              { maxContextCharacters: 20000 },
            );
          } else if (config.summary.enabled && memoryNote) {
            messages = messages.map(msg => ({
              ...msg,
              content: `${msg.content}\n\n${memoryNote}`,
            }));
          }

          const totalPromptTokens = messages.reduce((total, msg) => {
            return total + OllamaEmbedder.approxTokenLen(msg.content);
          }, 0);
          debug('Total Prompt Tokens:', totalPromptTokens);

          try {
            // Keep running passes until there are no more tool calls.
            for (;;) {
              const { messages: nextMessages, finished } = await AIChatBot.runChatPass(ws, messages, config, context);
              messages = nextMessages;
              if (finished) break;
            }

            // Update memory (summarize)
            if (config.summary.enabled) {
              const newTurns = [
                ...(memStore.get(`${String(uniqueId)}`)?.last ?? []),
                {
                  user: payload.messages[0].content,
                  assistant: messages[messages.length - 1].content,
                  ts: Date.now(),
                },
              ];
              const newSummary = await AIChatBot.summarizeTurn(
                config.summary.baseUrl,
                config.summary.model,
                (memStore.get(`${String(uniqueId)}`)?.summary ?? ''),
                (memStore.get(`${String(uniqueId)}`)?.last ?? []),
                payload.messages[0].content,
                messages[messages.length - 1].content,
              );
              debug('New Summary:', newSummary);
              memStore.set(`${String(uniqueId)}`, { summary: newSummary, last: newTurns });
            }

            debug('WebSocket message done:', messages.length);
            ws.send(JSON.stringify({ type: 'done' }));
          } catch (err) {
            debug('WebSocket message error', err);
            ws.send(JSON.stringify({ type: 'error', error: String(err) }));
          }
        });
        ws.on('close', () => {
          debug('WebSocket close');
        });
      });
      wss.on('error', (error) => {
        debug('WebSocket error', error);
      });
      wss.on('close', () => {
        debug('WebSocket close');
        memStore.cleanup();
      });
      debug('WebSocket server created successfully');
    } else {
      debug('WebSocket not supported');
    }
  }

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
  static async chatQuery(payload: { query: string; slugs?: string[] }, context: AIChatBotContext): Promise<string> {
    debug('chatQuery:', payload?.query);

    const config = AIChatBot.mergeConfig(context);
    const query = typeof payload?.query === 'string' ? payload.query.trim() : '';
    if (!query) {
      return '';
    }
    const slugs = Array.isArray(payload?.slugs) ? payload.slugs.filter(slug => typeof slug === 'string') : [];

    const sink: AIChatBotSSEStream = { send() {} };

    let messages: ChatBotMessage[] = buildPromptMessages(query, slugs, { maxContextCharacters: 20000 });
    for (;;) {
      const { messages: nextMessages, finished } = await AIChatBot.runChatPass( sink, messages, config, context);
      messages = nextMessages;
      if (finished) break;
    }
    return messages[messages.length - 1]?.content ?? '';
  }

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
  static async runChatPass(ws: AIChatBotSSEStream, messages: ChatBotMessage[], config: AIChatBotConfig, context: AIChatBotContext): Promise<{messages: ChatBotMessage[], finished: boolean}> {
    debug('runChatPass');
    const response = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.chatModel,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens,
        },
        messages,
        tools: buildChatTools(config),
        think: true,
        stream: true,
      }),
    });

    if (!response.ok || !response.body) {
      debug('Ollama HTTP error', response.status, response);
      throw new Error(`Ollama HTTP ${response.status}`);
    }

    const reader = response.body.getReader() as import('node:stream/web').ReadableStreamDefaultReader<Uint8Array>;
    const decoder = new TextDecoder();

    /** The assistant content this pass */
    let assistantAccumulated = '';

    const pendingToolCalls: OllamaChatToolCall[] = []; // collect tool calls observed in this pass

    for (;;) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });

      // Ollama streams newline-delimited JSON objects (NDJSON)
      for (const line of chunk.split('\n')) {
        // Skip empty lines
        if (!line.trim()) {
          continue;
        }
        // Parse the line as JSON

        let obj: OllamaChatResponse;
        try {
          obj = (JSON.parse(line) as OllamaChatResponse);
        } catch {
          continue;
        }

        // Forward thinking tokens separately (Ollama separates these for supporting models)
        if (obj?.message?.thinking) {
          ws.send(JSON.stringify({ type: 'thinking', data: obj.message.thinking }));
        }

        // Forward assistant tokens to WebSocket right away
        if (obj?.message?.content) {
          assistantAccumulated += obj.message.content;
          ws.send(JSON.stringify({ type: 'token', data: obj.message.content }));
        }

        // tool calls may appear in-stream
        const calls = obj?.message?.tool_calls;
        if (Array.isArray(calls) && calls.length) {
          // Stop forwarding (optional) and collect calls
          pendingToolCalls.push(...calls);
        }

        if (obj?.done) {
          // end of this pass
        }
      }
    }

    // If there were tool calls, run them now and return updated messages
    if (pendingToolCalls.length) {
      for (const call of pendingToolCalls) {
        const name = call.function?.name;
        const args = call.function?.arguments ?? {};
        ws.send(JSON.stringify({ type: 'tool_call', name, args }));

        debug('executeChatTool:', name, args);
        const toolResult = await executeChatTool(name, args, config, context);

        // Append the tool response as a new message for the next pass
        messages.push({
          role: 'tool',
          content: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult),
          name,
        });

        ws.send(JSON.stringify({ type: 'tool_result', name, data: toolResult }));
      }

      // Also keep the assistant "function call turn" (usually empty content) if needed
      // and return to allow caller to run another pass
      return { messages, finished: false };
    }

    // No tool calls: finalize this assistant message in the transcript
    if (assistantAccumulated) {
      messages.push({ role: 'assistant', content: assistantAccumulated });
    }
    return { messages, finished: true };

  }

  /**
   * Handle requests to fetch available documents for the document selector.
   * Delegates to the registered search provider via the `search-documents` hook.
   * @param context A Uttori-like context.
   * @returns The function to pass to Express.
   */
  static documentsHandler(context: AIChatBotContext): import('express').RequestHandler {
    debug('documentsHandler');
    return async (_request, response) => {
      try {

        const results: ({id: string, slug: string, title: string, update_date: number})[][] = await context.hooks.fetch('search-documents', {}, context);
        response.json(results?.[0] ?? []);
      } catch (error) {
        debug('documentsHandler error:', error);
        response.status(500).json({ error: 'Failed to fetch documents' });
      }
    };
  }

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
  static async summarizeTurn(baseUrl: string, model: string, prevSummary: string, lastTurns: import('./chat-bot/memory.js').Turn[], newUser: string, newAssistant: string): Promise<string> {
    debug('summarizeTurn', { prevSummary, lastTurns, newUser, newAssistant });
    const system = 'You maintain a very short rolling summary (1-3 sentences) of a support conversation. Keep only stable facts, user goals. Omit chit-chat.';
    const user = `Previous summary:\n${prevSummary || '(none)'}\n
Recent turns:\n${lastTurns.map(t => `U: ${t.user}\nA: ${t.assistant ?? ''}`).join('\n')}
New turn:\nU: ${newUser}\nA: ${newAssistant}\n
Write the new summary (<= 60 words).`;
    debug('summarizeTurn user:', user);

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: false, options: { temperature: 0.1 }, messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]}),
    });

    if (!response.ok) {
      debug('summarizeTurn error:', await response.text());
      throw new Error(await response.text());
    }

    let text = '';
    try {

      const data = await response.json() as OllamaChatResponse;
      text = data.message?.content ?? '[]';
      // Remove the <think> and </think> tags from the user and assistant messages
      text = text.replace(/<think>[\S\s]*?<\/think>/g, '').trim();
    } catch (error) {
      debug('summarizeTurn parse error:', error);
    }
    return text.trim();
  }
}

export default AIChatBot;
