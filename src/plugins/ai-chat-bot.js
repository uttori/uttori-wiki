import path from 'node:path';
import fs from 'node:fs';
import url from 'node:url';
import { WebSocketServer } from 'ws';

import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';

import { extractAttachmentText } from './chat-bot/attachment-extractor.js';
import { MemoryStore } from './chat-bot/memory.js';
import OllamaEmbedder from './chat-bot/ollama-embedder.js';
import { indexAllDocuments } from './chat-bot/index-documents.js';
import { buildPromptMessages } from './chat-bot/prompts.js';
import { retrieve } from './chat-bot/retrieval.js';

export { extractAttachmentText };

// TODO: Setup hooks to index documents

/**
 * Setup
 * ollama pull qwen3:8b
 * ollama pull bge-m3
 */

/**
 * @typedef {object} RetrievedChunk
 * @property {number} rowid The rowid of the chunk.
 * @property {string} source_id The source id of the chunk.
 * @property {number} idx The index of the chunk.
 * @property {string} text The text of the chunk.
 * @property {number} token_count The token count of the chunk.
 * @property {string[]} sectionPath The section path of the chunk.
 * @property {object} source The source of the chunk.
 * @property {string} source.id The id of the source.
 * @property {string} [source.title] The title of the source.
 * @property {string} [source.slug] The slug of the source.
 * @property {number} score The score of the chunk.
 */

/**
 * @typedef {object} RetrieveResponse
 * @property {string} query The query.
 * @property {RetrievedChunk[]} chunks The chunks.
 * @property {any[]} citations The citations.
 */

/**
 * @typedef {object} FtsRow
 * @property {number} rowid The rowid of the chunk.
 * @property {string} source_id The source id of the chunk.
 * @property {number} idx The index of the chunk.
 * @property {string} text The text of the chunk.
 * @property {number} token_count The token count of the chunk.
 * @property {string} meta_json The meta JSON of the chunk.
 * @property {string} source_title The title of the source.
 * @property {string} source_slug The slug of the source.
 * @property {number} rank The rank of the chunk.
 */

/**
 * @typedef {object} Block
 * @property {"heading" | "paragraph"} [type] The type of block.
 * @property {number} [idx] The index of the block.
 * @property {number} [level] The level of the heading.
 * @property {string} text The text of the block.
 * @property {string[]} sectionPath The section path of the block.
 * @property {number} [tokenCount] The token count of the block.
 * @property {string[]} [tags] The tags of the block.
 * @property {string} [slug] The slug of the block.
 */

/**
 * @typedef {object} ChunkWithMeta
 * @property {string} text The text of the chunk.
 * @property {number} idx The index of the chunk.
 * @property {number} token_count The token count of the chunk.
 * @property {string[]} sectionPath The section path of the chunk.
 * @property {string} [source_id] The source id of the chunk.
 * @property {number[]} [embedding] The embedding of the chunk.
 * @property {object} [meta] The meta JSON of the chunk.
 */

/**
 * @typedef {object} BlendedChunk
 * @property {number} rowid The rowid of the chunk.
 * @property {number} score The score of the chunk.
 * @property {number} titleBoost The title boost of the chunk.
 * @property {number} textBoost The text boost of the chunk.
 */

/**
 * @typedef {object} ChatBotMessage
 * @property {"system" | "user" | "assistant" | "tool"} role The role of the message.
 * @property {string} content The content of the message.
 * @property {string} [name] The name of the tool.
 * @property {string[]} [slugs] The slugs of the sources to use as context.
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
 * @property {function(import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>): import('express').RequestHandler} [interfaceRequestHandler] A request handler for the interface route.
 * @property {import('express').RequestHandler[]} middlewarePublicRoute Custom Middleware for the public route.
 * @property {string} databasePath The path to the database.
 * @property {Database.Options} databseOptions The options for the database.
 * @property {string} ollamaBaseUrl The base URL for the Ollama server.
 * @property {string} embedModel The model to use for the embedder.
 * @property {function(string, string): string} [embedPrompt] The prompt to use for the embedder.
 * @property {object[]} tools The tools to use for the chat.
 * @property {string} chatModel The model to use for the chat.
 * @property {number} maxTokens The maximum number of tokens to generate. The default value for `num_predict` is typically 128 tokens, though it can also be set to -1 for infinite generation (no limit) or -2 to fill the entire context window.
 * @property {number} temperature The temperature for the model.
 * @property {number} chunkLimit The limit for the number of chunks to return.
 * @property {boolean} hybrid Whether to use the hybrid approach of vector & FTS.
 * @property {boolean} fts Whether to use the FTS index.
 * @property {number} ftsWeight The weight for the FTS index.
 * @property {number} titleBoost The title boost for the entities.
 * @property {number} textBoost The text boost for the entities.
 * @property {number} ftsWeightBump The FTS weight bump for the entities.
 * @property {number} maxContextTokens The maximum number of tokens to use for the context.
 * @property {number} maxPerSource The maximum number of sources to use per source.
 * @property {number} batch The batch size for the embedder.
 * @property {string[]} ignoreSlugs Slugs to ignore.
 * @property {string[]} ignoreTags Tags to ignore.
 * @property {string} attachmentsRoot The root path to the attachments.
 * @property {boolean} includeAttachments Whether to include attachments.
 * @property {function(AIChatBotConfig, import('../wiki.js').UttoriWikiDocumentAttachment): Promise<string>} [extractAttachmentText] The function to use to extract text from an attachment.
 * @property {import('./renderer-markdown-it.js').MarkdownItRendererConfig} markdownItPluginConfig The markdown-it plugin configuration.
 * @property {boolean} [tableToCSV] Whether to convert tables to CSV format. If false, converts to Markdown format instead. Defaults to false.
 * @property {number} [tableMaxRowsPerChunk] Maximum number of rows per table chunk for embedding.
 * @property {number} [tableMaxTokensPerChunk] Maximum estimated tokens per table chunk for embedding.
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

/** @type {import('ws').WebSocketServer | undefined} */
let wss = new WebSocketServer({ noServer: true });

/**
 * Uttori AI Chat Bot
 * Search a UttoriWiki database using LLMs.
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
      websocketRoute: '/chat-api',
      publicRoute: '/chat',
      documentsRoute: '/chat-documents',
      middlewarePublicRoute: [],
      interfaceRequestHandler: undefined,

      ignoreSlugs: [],
      ignoreTags: [],

      databasePath: './site/data/uttori-chat.db',
      databseOptions: {
        // readonly: true,
        // verbose: debug,
      },

      chatModel: 'qwen3:8b',
      ollamaBaseUrl: 'http://127.0.0.1:11434',
      embedModel: 'bge-m3:latest', // bge-m3
      embedPrompt: (task, query) => query,
      tools: [],
      maxTokens: -2,
      temperature: 0.6,

      chunkLimit: 12,
      hybrid: true,
      fts: true,
      ftsWeight: 0.35,
      titleBoost: 0.25,
      textBoost: 0.10,
      ftsWeightBump: 0.15,
      maxContextTokens: 4096,
      maxPerSource: Infinity,
      batch: 8,

      attachmentsRoot: './site/uploads',
      includeAttachments: true,
      extractAttachmentText,

      markdownItPluginConfig: {
        events: {},

        // Uttori Specific Configuration
        markdownIt: {
          uttori: {
            // Prefix for relative URLs, useful when the Express app is not at root.
            baseUrl: '',

            // Safe List, if a domain is not in this list, it is set to 'external nofollow noreferrer'.
            allowedExternalDomains: [
              'eludevisibility.org',
              'sfc.fm',
              'snes.in',
              'satellaview.org',
              'superfamicom.org',
              'wiki.superfamicom.org',
              'mondaybear.com',
            ],

            // Disable validation
            disableValidation: false,

            // Open external domains in a new window.
            openNewWindow: true,

            // Add lazy loading params to image tags.
            lazyImages: true,

            // Table of Contents
            toc: {
              // Extract the table of contents out for better document layout control.
              extract: false,

              // The opening DOM tag for the TOC container.
              openingTag: '<nav class="table-of-contents">',

              // The closing DOM tag for the TOC container.
              closingTag: '</nav>',

              // Slugify options for convering content to anchor links.
              slugify: {
                lower: true,
              },
            },
          },
        },
      },
      tableToCSV: false,
      tableMaxRowsPerChunk: Infinity,
      tableMaxTokensPerChunk: 1000,

      summary: {
        enabled: false,
        baseUrl: 'http://127.0.0.1:11434',
        model: 'qwen3:8b',
      },
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, AIChatBotConfig>} config - A provided configuration to use.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} [_context] Unused.
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
    if (typeof config[AIChatBot.configKey].websocketRoute !== 'string') {
      const error = 'Config Error: `websocketRoute` should be a string server route to where files should be API will be reached from.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[AIChatBot.configKey].publicRoute !== 'string') {
      const error = 'Config Error: `publicRoute` should be a string server route to show the chat bot interface.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(config[AIChatBot.configKey].middlewarePublicRoute)) {
      const error = 'Config Error: `middlewarePublicRoute` should be an array of middleware.';
      debug(error);
      throw new Error(error);
    }
    if (!config[AIChatBot.configKey].ignoreSlugs || !Array.isArray(config[AIChatBot.configKey].ignoreSlugs)) {
      const error = 'Config Error: `ignoreSlugs` should be an array of strings.';
      debug(error);
      throw new Error(error);
    }
    if (!config[AIChatBot.configKey].ignoreTags || !Array.isArray(config[AIChatBot.configKey].ignoreTags)) {
      const error = 'Config Error: `ignoreTags` should be an array of strings.';
      debug(error);
      throw new Error(error);
    }
    if (!config[AIChatBot.configKey].interfaceRequestHandler || typeof config[AIChatBot.configKey].interfaceRequestHandler !== 'function') {
      const error = 'Config Error: `interfaceRequestHandler` should be a function.';
      debug(error);
      throw new Error(error);
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
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
    const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
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

    // If we have not already indexed the documents, do so now
    const db = AIChatBot.openDatabase(config);
    const rows = db.prepare('SELECT id FROM uttori_sources').all();
    if (rows.length === 0) {
      // Pass the full config to indexAllDocuments to ensure the same shape as event handlers
      // TODO Refactor indexAllDocuments to actually just index a single document, and bring the logic into static methods here to bind
      debug('Indexing documents...', config.embedModel);
      await indexAllDocuments({ [AIChatBot.configKey]: config }, context);
    }
    db.close();
  }

  /**
   * Add the upload route to the server object.
   * @param {import('express').Application} server An Express server instance.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
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
    const { publicRoute, documentsRoute, middlewarePublicRoute, interfaceRequestHandler } = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
    debug('bindRoutes:', { publicRoute, documentsRoute });

    // Endpoint to fetch available documents for the document selector
    server.get(`${documentsRoute}`, AIChatBot.documentsHandler(context));

    // Endpoint to show the chat bot interface
    if (interfaceRequestHandler) {
      server.get(`${publicRoute}`, ...middlewarePublicRoute, interfaceRequestHandler(context));
    } else {
      debug('No interfaceRequestHandler set.');
    }
  }

  /**
   * Bind the WebSocket server to the server object.
   * @param {import('http').Server} server An Express server instance.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
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
              const { messages: nextMessages, finished } = await AIChatBot.runChatPass(ws, messages, config);
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
   * Helper: stream one /api/chat call and forward chunks to client,
   * intercepting tool calls. Returns {messages, finished}
   * messages: updated transcript to continue if tool used
   * finished: true once an assistant final turn is produced
   * @param {import('ws').WebSocket} ws The WebSocket instance.
   * @param {ChatBotMessage[]} messages The messages.
   * @param {AIChatBotConfig} config The configuration.
   * @returns {Promise<{messages: ChatBotMessage[], finished: boolean}>} The messages and finished status.
   */
  static async runChatPass(ws, messages, config) {
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
        tools: config.tools,
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
    /** @type {Array<Record<string, any>>} */
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
        /** @type {Record<string, Record<string, any>>} */
        let obj;
        try {
          obj = JSON.parse(line);
        } catch {
          continue;
        }

        // Forward assistant tokens to WebSocket right away
        if (obj?.message?.content) {
          assistantAccumulated += obj.message.content;
          ws.send(JSON.stringify({ type: 'token', data: obj.message.content }));
        }

        // tool calls may appear in-stream
        /** @type {Array<Record<string, any>>} */
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

        let toolResult;
        if (name === 'vectorSearch') {
          debug('vectorSearch:', args);
          toolResult = await retrieve(args?.query, config, args.slugs);
          // Compose a compact context block with separators + local citations
          /** @type {string[]} */
          const blocks = [];
          for (const chunk of toolResult.chunks) {
            const srcTitle = chunk.source.title || chunk.source.id;
            const section = chunk.sectionPath?.length ? ` - ${chunk.sectionPath.join(' > ')}` : '';
            const text = chunk.text.length <= 1500 ? chunk.text : chunk.text.slice(0, 1500 - 1) + '…';
            blocks.push(`SOURCE: ${srcTitle}${section}\nSLUG: ${chunk.source.slug ?? ''}\n---\n${text}`);
          }
          toolResult = blocks.join('\n\n====\n\n');
        } else {
          toolResult = { error: `Unknown Tool: ${name}` };
        }

        // Append the tool response as a new message for the next pass
        messages.push({
          role: 'tool',
          content: JSON.stringify(toolResult),
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
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @static
   */
  static documentsHandler(context) {
    debug('documentsHandler');
    return (_request, response) => {
      try {
        // Get all documents from the database
        /** @type {AIChatBotConfig} */
        const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
        /** @type {import('better-sqlite3/index.js').Database} */
        const db = new Database(config.databasePath, config.databseOptions);
        const documents = db.prepare(`
          SELECT id, slug, title, update_date
          FROM uttori_sources
          ORDER BY title COLLATE NOCASE ASC, slug ASC
        `).all();

        db.close();

        // Return the documents as JSON
        response.json(documents);
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
      /** @type {Record<string, Record<string, string | any>>} */
      const data = await response.json();
      text = data?.message?.content || data?.choices?.[0]?.message?.content || '[]';
      // Remove the <think> and </think> tags from the user and assistant messages
      text = text.replace(/<think>[\S\s]*?<\/think>/g, '').trim();
    } catch (error) {
      debug('summarizeTurn parse error:', error);
    }
    return text.trim();
  }

  /**
   * Open the database and create the necessary tables if they don't exist.
   * @param {Partial<AIChatBotConfig>} config The configuration.
   * @returns {import('better-sqlite3').Database} The database.
   */
  static openDatabase(config) {
    debug('openDatabase', config.databasePath, config.databseOptions);
    fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });

    /** @type {import('better-sqlite3/index.js').Database} */
    const db = new Database(config.databasePath, config.databseOptions);
    sqliteVec.load(db);
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.exec(`
      CREATE TABLE IF NOT EXISTS uttori_sources(
        id TEXT PRIMARY KEY,
        slug TEXT,
        title TEXT,
        update_date INTEGER,
        meta_json TEXT,
        content_hash TEXT
      );

      CREATE TABLE IF NOT EXISTS uttori_chunks(
        source_id TEXT NOT NULL,
        idx INTEGER NOT NULL,
        text TEXT NOT NULL,
        token_count INTEGER NOT NULL,
        meta_json TEXT,
        FOREIGN KEY(source_id) REFERENCES uttori_sources(id)
      );
    `);

    return db;
  }

}

export default AIChatBot;
