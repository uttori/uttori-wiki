import url from 'node:url';
import { WebSocketServer } from 'ws';

import { extractAttachmentText } from './chat-bot/attachment-extractor.js';
import { MemoryStore } from './chat-bot/memory.js';
import OllamaEmbedder from './chat-bot/ollama-embedder.js';
import { buildPromptMessages } from './chat-bot/prompts.js';
import { buildChatTools, executeChatTool } from './chat-bot/tools.js';

export { extractAttachmentText };

/**
 * Setup
 * ollama pull qwen3.5:9b
 * ollama pull qwen3-embedding:8b
 */

/**
 * @typedef {object} ChatBotMessage
 * @property {"system" | "user" | "assistant" | "tool"} role The role of the message.
 * @property {string} content The content of the message.
 * @property {string} [name] The name of the tool.
 * @property {string[]} [slugs] The slugs of the sources to use as context.
 */

/**
 * Function payload inside an Ollama `/api/chat` tool call.
 * @typedef {object} OllamaChatToolCallFunction
 * @property {string} name The function name.
 * @property {Record<string, unknown>} [arguments] Parsed arguments object.
 */

/**
 * A tool call entry returned by Ollama's `/api/chat` endpoint.
 * @typedef {object} OllamaChatToolCall
 * @property {OllamaChatToolCallFunction} function The invoked function.
 */

/**
 * Message payload in an Ollama `/api/chat` response.
 * @typedef {object} OllamaChatMessage
 * @property {"assistant" | "tool"} [role] The message role.
 * @property {string} [content] Assistant text content.
 * @property {string} [thinking] Reasoning text for thinking-capable models.
 * @property {OllamaChatToolCall[]} [tool_calls] Tool calls requested by the model.
 */

/**
 * A single Ollama `/api/chat` response (non-streaming body or one NDJSON stream line).
 * @see {@link https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-chat-completion} Ollama API documentation.
 * @typedef {object} OllamaChatResponse
 * @property {string} [model] The model that produced the response.
 * @property {string} [created_at] ISO timestamp of the response.
 * @property {OllamaChatMessage} [message] The assistant message payload.
 * @property {boolean} [done] Whether generation has finished.
 * @property {string} [done_reason] Why generation stopped.
 */

/**
 * Setup the memory store.
 */
const memStore = new MemoryStore(60 * 60 * 1000, 5); // 1h TTL, last 5 turns

let debug = (..._) => {};
/* c8 ignore next 1 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.AIChatBot'); } catch {}

/**
 * @typedef {object} AIChatBotConfig
 * @property {Record<string, string[]>} [events] Events to bind to.
 * @property {string} websocketRoute The WebSocket route for streaming to and from the chat bot interface.
 * @property {string} publicRoute Server route to show the chat bot interface.
 * @property {string} documentsRoute Server route to fetch available documents for the document selector.
 * @property {AIChatBotInterfaceRequestHandler} [interfaceRequestHandler] A request handler for the interface route.
 * @property {import('express').RequestHandler[]} middlewarePublicRoute Custom Middleware for the public route.
 * @property {string} ollamaBaseUrl The base URL for the Ollama server.
 * @property {import('./chat-bot/tools.js').OllamaTool[] | null} tools Override tool schemas sent to Ollama. Empty array uses the built-in wiki tools. Null/undefined disables tools entirely.
 * @property {string} chatModel The model to use for the chat.
 * @property {number} maxTokens The maximum number of tokens to generate. The default value for `num_predict` is typically 128 tokens, though it can also be set to -1 for infinite generation (no limit) or -2 to fill the entire context window.
 * @property {number} temperature The temperature for the model.
 * @property {number} [retrieveLimit] Default chunk limit injected into the `vectorSearch` tool when the model does not provide one.
 * @property {object} summary The summary configuration.
 * @property {boolean} summary.enabled Whether to use the summary.
 * @property {string} summary.baseUrl The base URL for the summary.
 * @property {string} summary.model The model to use for the summary.
 */

/**
 * @typedef {object} AIChatBotApiRequestBody
 * @property {string} sessionId The session ID.
 * @property {string} query The query.
 * @property {string[]} slugs The slugs.
 */

/**
 * Sends a JSON-stringified event payload through the SSE bridge.
 * @callback AIChatBotSSEStreamSend
 * @param {string} message JSON-stringified event payload.
 * @returns {void}
 */

/**
 * A duck-typed WebSocket-like send interface used to bridge the POST/SSE path
 * into the same `runChatPass` logic that the real WebSocket connection uses.
 * @typedef {object} AIChatBotSSEStream
 * @property {AIChatBotSSEStreamSend} send Sends a JSON-stringified event payload.
 */

/**
 * A parsed SSE event payload forwarded from `runChatPass` to the SSE bridge.
 * @typedef {object} AIChatBotSSEEvent
 * @property {string} [type] Event type: `"token"`, `"thinking"`, `"done"`, or `"error"`.
 * @property {unknown} [data] Token or thinking text for `"token"` and `"thinking"` events.
 * @property {unknown} [error] Error description for `"error"` events.
 */

/**
 * Uttori context narrowed to this plugin's config shape.
 * @typedef {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} AIChatBotContext
 */

/**
 * Builds the Express handler for the chat bot interface route.
 * @callback AIChatBotInterfaceRequestHandler
 * @param {AIChatBotContext} context A Uttori-like context.
 * @returns {import('express').RequestHandler} The Express request handler.
 */

/** @type {import('ws').WebSocketServer | undefined} */
let wss = new WebSocketServer({ noServer: true });

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
class AIChatBot {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>AIChatBot.configKey</caption>
   * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-ai-chat-bot';
  }

  /**
   * The default configuration.
   * @returns {AIChatBotConfig} The configuration.
   * @example <caption>AIChatBot.defaultConfig()</caption>
   * const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
   * @static
   */
  static defaultConfig() {
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
   * @param {AIChatBotContext} context A Uttori-like context.
   * @returns {AIChatBotConfig} The merged configuration.
   * @static
   */
  static mergeConfig(context) {
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
   * @param {Record<string, AIChatBotConfig>} config A provided configuration to use.
   * @param {AIChatBotContext} [_context] Unused.
   * @example <caption>AIChatBot.validateConfig(config, _context)</caption>
   * AIChatBot.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
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
  static async register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {AIChatBotConfig} */
    const config = AIChatBot.mergeConfig(context);
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    /** @type {Record<string, string[]>} */
    const events = config.events ?? {};
    const eventEntries = Object.entries(events);
    for (const [method, eventNames] of eventEntries) {
      if (typeof AIChatBot[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = AIChatBot[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

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
  static bindRoutes(server, context) {
    debug('bindRoutes');
    /** @type {AIChatBotConfig} */
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
   * @param {AIChatBotContext} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @example <caption>AIChatBot.apiRequestHandler(context)</caption>
   * server.post('/chat-api', AIChatBot.apiRequestHandler(context));
   * @static
   */
  static apiRequestHandler(context) {
    debug('apiRequestHandler');
    return async (request, response) => {
      /** @type {AIChatBotConfig} */
      const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
      /** @type {unknown} */
      const rawBody = request.body ?? {};
      /** @type {Partial<AIChatBotApiRequestBody>} */
      const body = typeof rawBody === 'object' && rawBody !== null ? rawBody : {};
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
       * @param {unknown} payload The payload to send.
       * @returns {void}
       */
      const writeEvent = (payload) => {
        response.write(`data: ${JSON.stringify(payload)}\n\n`);
      };

      /** @type {AIChatBotSSEStream} */
      const stream = {
        send(message) {
          try {
            /** @type {unknown} */
            const parsed = JSON.parse(message);
            if (typeof parsed !== 'object' || parsed === null) {
              writeEvent({ token: message });
              return;
            }
            const event = /** @type {AIChatBotSSEEvent} */ (parsed);
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

      const memoryNote = config.summary.enabled && memStore.get(`${uniqueId}`)?.summary ? `Conversation Summary for added context:\n${memStore.get(`${uniqueId}`).summary}` : '';
      /** @type {ChatBotMessage[]} */
      let messages = buildPromptMessages(query, slugs, { maxContextCharacters: 20000 });
      if (config.summary.enabled && memoryNote) {
        messages = messages.map(msg => ({
          ...msg,
          content: `${msg.content}\n\n${memoryNote}`,
        }));
      }

      try {
        for (;;) {
          const { messages: nextMessages, finished } = await AIChatBot.runChatPass(/** @type {import('ws').WebSocket} */ (stream), messages, config, context);
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
   * @param {import('http').Server} server An Express server instance.
   * @param {AIChatBotContext} context A Uttori-like context.
   * @example <caption>AIChatBot.bindWebSocket(server, context)</caption>
   * AIChatBot.bindWebSocket(server, context);
   * @static
   */
  static bindWebSocket(server, context) {
    debug('bindWebSocket');
    /** @type {AIChatBotConfig} */
    const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };

    if (typeof WebSocketServer === 'function') {
      debug('WebSocket supported');
      debug('Creating WebSocket server with HTTP server');

      // Create WebSocket server with manual upgrade handling
      wss = new WebSocketServer({ noServer: true });

      // Handle upgrade requests manually
      server.on('upgrade', (request, socket, head) => {
        debug('🔌 HTTP upgrade request received:', request.url);

        const { pathname } = new URL(request.url, `http://${request.headers.host}`);

        debug('Checking pathname:', pathname);
        if (pathname === `${config.websocketRoute}`) {
          debug(`✅ Upgrading to WebSocket for ${config.websocketRoute}`);
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        } else {
          debug('❌ Rejecting upgrade for path:', pathname);
          socket.destroy();
        }
      });

      debug('🔌 WebSocket upgrade handler registered');
      wss.on('connection', (ws, request) => {
        debug('WebSocket connection');
        const parameters = url.parse(request.url, true);
        ws['uniqueId'] = parameters.query.uniqueId || 'no-unique-id';

        let firstMessage = true;

        // Maintains a rolling summary of the conversation
        /** @type {string | string[]} */
        if (config.summary.enabled && ws['uniqueId']) {
          debug('🍜 Getting memory for', ws['uniqueId']);
          if (!memStore.get(`${ws['uniqueId']}`)) {
            debug('🍜 No memory found for', ws['uniqueId']);
            memStore.set(`${ws['uniqueId']}`, { summary: '', last: [] });
          }
          memStore.touch(`${ws['uniqueId']}`);
        }

        ws.on('message', async (raw) => {
          debug('WebSocket message', raw.toString());
          // Expect: { messages: [{role, content}, ...] }
          /** @type {Record<string, ChatBotMessage[]>} */
          let payload;
          try {
            payload = JSON.parse(raw.toString());
          } catch {
            debug('WebSocket message parse error', raw.toString());
            return;
          }

          // Build prompt with a short memory preface
          const memoryNote = config.summary.enabled && memStore.get(`${ws['uniqueId']}`)?.summary ? `Conversation Summary for added context:\n${memStore.get(`${ws['uniqueId']}`).summary}` : '';
          debug('🍜 Memory note:', memoryNote);

          /** @type {ChatBotMessage[]} */
          let messages = payload.messages ?? [];
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
                ...memStore.get(`${ws['uniqueId']}`).last,
                {
                  user: payload.messages[0].content,
                  assistant: messages[messages.length - 1].content,
                  ts: Date.now(),
                },
              ];
              const newSummary = await AIChatBot.summarizeTurn(
                config.summary.baseUrl,
                config.summary.model,
                memStore.get(`${ws['uniqueId']}`).summary,
                memStore.get(`${ws['uniqueId']}`).last,
                payload.messages[0].content,
                messages[messages.length - 1].content,
              );
              debug('New Summary:', newSummary);
              memStore.set(`${ws['uniqueId']}`, { summary: newSummary, last: newTurns });
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
   * @param {object} payload The chat request.
   * @param {string} payload.query The user question.
   * @param {string[]} [payload.slugs] Optional document slugs to focus retrieval on.
   * @param {AIChatBotContext} context A Uttori-like context.
   * @returns {Promise<string>} The final assistant message content.
   * @static
   */
  static async chatQuery(payload, context) {
    debug('chatQuery:', payload?.query);
    /** @type {AIChatBotConfig} */
    const config = AIChatBot.mergeConfig(context);
    const query = typeof payload?.query === 'string' ? payload.query.trim() : '';
    if (!query) {
      return '';
    }
    const slugs = Array.isArray(payload?.slugs) ? payload.slugs.filter(slug => typeof slug === 'string') : [];

    /** @type {AIChatBotSSEStream} */
    const sink = { send() {} };

    /** @type {ChatBotMessage[]} */
    let messages = buildPromptMessages(query, slugs, { maxContextCharacters: 20000 });
    for (;;) {
      const { messages: nextMessages, finished } = await AIChatBot.runChatPass(/** @type {import('ws').WebSocket} */ (sink), messages, config, context);
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
   * @param {import('ws').WebSocket} ws The WebSocket instance.
   * @param {ChatBotMessage[]} messages The messages.
   * @param {AIChatBotConfig} config The configuration.
   * @param {AIChatBotContext} context A Uttori-like context exposing `context.hooks` for tool execution.
   * @returns {Promise<{messages: ChatBotMessage[], finished: boolean}>} The messages and finished status.
   */
  static async runChatPass(ws, messages, config, context) {
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

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    /** The assistant content this pass */
    let assistantAccumulated = '';
    /** @type {OllamaChatToolCall[]} */
    let pendingToolCalls = []; // collect tool calls observed in this pass

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
        /** @type {OllamaChatResponse} */
        let obj;
        try {
          obj = /** @type {OllamaChatResponse} */ (JSON.parse(line));
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
   * @param {AIChatBotContext} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @static
   */
  static documentsHandler(context) {
    debug('documentsHandler');
    return async (_request, response) => {
      try {
        /** @type {Array<Array<{id: string, slug: string, title: string, update_date: number}>>} */
        const results = await context.hooks.fetch('search-documents', {}, context);
        response.json(results?.[0] ?? []);
      } catch (error) {
        debug('documentsHandler error:', error);
        response.status(500).json({ error: 'Failed to fetch documents' });
      }
    };
  }

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
  static async summarizeTurn(baseUrl, model, prevSummary, lastTurns, newUser, newAssistant) {
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
      /** @type {OllamaChatResponse} */
      const data = await response.json();
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
