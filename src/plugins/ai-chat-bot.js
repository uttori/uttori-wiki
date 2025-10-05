import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';

import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import { PdfReader } from 'pdfreader';


import { MemoryStore } from './chat-bot/memory.js';
import OllamaEmbedder from './chat-bot/ollama-embedder.js';
import { indexAllDocuments } from './chat-bot/index-documents.js';

// TODO: Setup hooks to index documents

/**
 * Setup
 * ollama pull qwen3:8b
 * ollama pull bge-m3
 */

/**
 * @typedef {object} StreamHandlers
 * @property {function(string): void | Promise<void>} onToken The function to call when a token is received.
 * @property {function(): void | Promise<void>} onDone The function to call when the stream is done.
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
 * @property {string} apiRoute The API route for streaming to and from the chat bot interface.
 * @property {string} publicRoute Server route to show the chat bot interface.
 * @property {string} documentsRoute Server route to fetch available documents for the document selector.
 * @property {string[]} allowedReferrers When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an rmpty array don't check at all.
 * @property {function(import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>): import('express').RequestHandler} [interfaceRequestHandler] A request handler for the interface route.
 * @property {import('express').RequestHandler[]} middlewareApiRoute Custom Middleware for the API route.
 * @property {import('express').RequestHandler[]} middlewarePublicRoute Custom Middleware for the public route.
 * @property {string} databasePath The path to the database.
 * @property {Database.Options} databseOptions The options for the database.
 * @property {string} ollamaBaseUrl The base URL for the Ollama server.
 * @property {string} embedModel The model to use for the embedder.
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
 * @property {number} chunkTokens Used during indexing, the number of tokens per chunk.
 * @property {number} overlapTokens Used during indexing, the number of tokens to overlap between chunks.
 * @property {import('./renderer-markdown-it.js').MarkdownItRendererConfig} markdownItPluginConfig The markdown-it plugin configuration.
 * @property {object} entities The entities configuration.
 * @property {boolean} entities.enabled Whether to use the entities.
 * @property {string} entities.baseUrl The base URL for the entities server.
 * @property {string} entities.model The model to use for the entities.
 * @property {number} entities.max The maximum number of entities to return.
 * @property {object} rewriter The rewriter configuration.
 * @property {boolean} rewriter.enabled Whether to use the rewriter.
 * @property {string} rewriter.baseUrl The base URL for the rewriter.
 * @property {string} rewriter.model The model to use for the rewriter.
 * @property {number} rewriter.numberOfQueries The number of queries to use for the rewriter.
 * @property {boolean} rewriter.includeOriginal Whether to include the original query in the rewriter.
 * @property {number} rewriter.temperature The temperature for the rewriter.
 * @property {object} rerank The rerank configuration.
 * @property {boolean} rerank.enabled Whether to use the rerank.
 * @property {string} rerank.baseUrl The base URL for the rerank.
 * @property {string} rerank.model The model to use for the rerank.
 * @property {number} rerank.topN The top N to use for the rerank.
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
 * Extract text from an attachment.
 * For PDFs, this now preserves page boundaries to help with chunking.
 * @param {AIChatBotConfig} config The configuration.
 * @param {import('../wiki.js').UttoriWikiDocumentAttachment} attachment The attachment.
 * @returns {Promise<string>} The text of the attachment.
 */
export async function extractAttachmentText(config, attachment) {
  const absolutePath = path.resolve(config.attachmentsRoot, attachment.path);
  if (!fs.existsSync(absolutePath)) {
    debug('extractAttachmentText: file not found:', absolutePath);
    return '';
  }
  if (attachment.skip) {
    debug('extractAttachmentText: skipping attachment:', absolutePath);
    return '';
  }
  const fileExtension = path.extname(absolutePath).toLowerCase();
  const buffer = await fsp.readFile(absolutePath);
  debug('extractAttachmentText: absolutePath:', absolutePath);
  debug('extractAttachmentText: type:', attachment.type);
  debug('extractAttachmentText: file extension:', fileExtension);
  if (attachment.type?.includes('pdf') || fileExtension === '.pdf') {
    try {
      /** @type {string} */
      const text = await new Promise((resolve, reject) => {
        const reader = new PdfReader();
        const textChunks = [];
        let currentPage = 0;
        /** @type {string[]} */
        let pageTexts = [];

        reader.parseBuffer(buffer, (err, item) => {
          if (err) {
            debug('extractAttachmentText: error parsing pdf:', err);
            reject(new Error(String(err)));
            return;
          }
          if (!item) {
            // End of parsing, resolve with page-separated text
            debug('extractAttachmentText: end of parsing pdf:', textChunks.length, 'pages:', pageTexts.length);
            // Join pages with clear separators to help with chunking
            const pageSeparatedText = pageTexts.map((pageText, idx) =>
              `[Page ${idx + 1}]\n${pageText.trim()}`,
            ).join('\n\n---\n\n');
            resolve(pageSeparatedText);
            return;
          }
          if (item.text) {
            textChunks.push(item.text);
          }
          // Detect page breaks - PdfReader emits page items
          if (item.page !== undefined && item.page !== currentPage) {
            if (currentPage > 0 && textChunks.length > 0) {
              // Save the previous page's text
              const pageText = textChunks.join(' ');
              debug('extractAttachmentText: page', currentPage, 'text length:', pageText.length);
              pageTexts.push(pageText);
              textChunks.length = 0; // Clear for next page
            }
            currentPage = item.page;
            debug('extractAttachmentText: new page:', currentPage);
          }
        });
      });
      return text || '';
    } catch (error) {
      debug('extractAttachmentText: error parsing pdf:', error);
      return '';
    }
  }
  // Parse text files
  if (attachment.type?.startsWith('text/') || ['.txt', '.md', '.csv', '.log'].includes(fileExtension)) {
    return buffer.toString('utf8');
  }
  debug(`extractAttachmentText: mime type ${attachment.type} / file type ${fileExtension} is not yet supported: ${absolutePath}`);
  return '';
}

/**
 * Uttori AI Chat Bot
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
      apiRoute: '/chat-api',
      publicRoute: '/chat',
      documentsRoute: '/chat-documents',
      middlewareApiRoute: [],
      middlewarePublicRoute: [],
      interfaceRequestHandler: undefined,

      allowedReferrers: [],
      ignoreSlugs: [],
      ignoreTags: [],

      databasePath: './site/data/uttori-chat.db',
      databseOptions: {
        // readonly: true,
        // verbose: console.log,
      },

      chatModel: 'qwen3:8b',
      ollamaBaseUrl: 'http://127.0.0.1:11434',
      embedModel: 'dengcao/Qwen3-Embedding-8B:Q8_0', // bge-m3
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
      chunkTokens: 900,
      overlapTokens: 150,

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

      entities: {
        enabled: true,
        baseUrl: 'http://127.0.0.1:11434',
        model: 'qwen3:8b',
        max: 5,
      },
      rewriter: {
        enabled: false,
        baseUrl: 'http://127.0.0.1:11434',
        model: 'qwen3:8b',
        numberOfQueries: 3,
        includeOriginal: true,
        temperature: 0.6,
      },
      rerank: {
        enabled: false,
        baseUrl: 'http://127.0.0.1:11434',
        model: 'qwen3:8b',
        topN: 24,
      },
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
    if (typeof config[AIChatBot.configKey].apiRoute !== 'string') {
      const error = 'Config Error: `apiRoute` should be a string server route to where files should be API will be reached from.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[AIChatBot.configKey].publicRoute !== 'string') {
      const error = 'Config Error: `publicRoute` should be a string server route to show the chat bot interface.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(config[AIChatBot.configKey].allowedReferrers)) {
      const error = 'Config Error: `allowedReferrers` should be an array of URLs or a blank array.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(config[AIChatBot.configKey].middlewareApiRoute)) {
      const error = 'Config Error: `middlewareApiRoute` should be an array of middleware.';
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
   *       middlewareApiRoute: [],
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
    const { apiRoute, publicRoute, documentsRoute, middlewareApiRoute, middlewarePublicRoute, interfaceRequestHandler } = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };
    debug('bindRoutes:', { apiRoute, publicRoute, documentsRoute });

    // Endpoint to stream to & from the chat bot interface
    server.post(`${apiRoute}`, ...middlewareApiRoute, AIChatBot.apiRequestHandler(context));

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
   * Handle requests to fetch available documents for the document selector.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @static
   */
  static documentsHandler(context) {
    debug('documentsHandler');
    return (request, response) => {
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
   * The Express route method to process the upload request and provide a response.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-ai-chat-bot', AIChatBotConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler<{}, { error: string }, AIChatBotApiRequestBody>} The function to pass to Express.
   * @example <caption>AIChatBot.apiRequestHandler(context)(request, response, _next)</caption>
   * server.post('/chat-api', AIChatBot.apiRequestHandler(context));
   * @static
   */
  static apiRequestHandler(context) {
    return async (request, response, next) => {
      const requestStartTime = Date.now();
      debug('apiRequestHandler');
      /** @type {AIChatBotConfig} */
      const config = { ...AIChatBot.defaultConfig(), ...context.config[AIChatBot.configKey] };

      const referrer = request.get('Referrer') || '';
      debug('referrer:', referrer);
      // referrer is an optional http header, it may not exist
      if (config.allowedReferrers.length && !referrer) {
        debug('empty referrer:', referrer);
        next();
        return;
      }

      // Check for our allowed domains
      if (config.allowedReferrers.length && !config.allowedReferrers.some((check) => referrer.startsWith(check))) {
        debug('now allowed referrer:', referrer);
        next();
        return;
      }

      // Maintains a rolling summary of the conversation
      /** @type {import('./chat-bot/memory.js').Memory }} */
      let mem = { summary: '', last: [] };
      /** @type {string} */
      let sessionId = 'anon';
      if (config.summary.enabled) {
        let sessionId = (request.headers['x-session-id'] || request.body?.sessionId || 'anon');
        sessionId = Array.isArray(sessionId) ? sessionId[0] : sessionId;
        mem = memStore.get(sessionId) ?? { summary: '', last: [] };
        memStore.touch(sessionId);
      }

      const query = request.body.query;
      const slugs = request.body.slugs || null;
      debug('apiRequestHandler:', { query, slugs });

      try {
        // Contextualized user question for rewriting, rewrite (using contextualized question)
        const rewriteStartTime = Date.now();
        const contextualQuestion = mem.summary ? `${query}\n\n[Context summary: ${mem.summary}]` : query;
        let queries = [query];
        if (config.rewriter?.enabled) {
          try {
            const rewrites = await AIChatBot.rewriteQueries(
              config.ollamaBaseUrl,
              config.rewriter.model,
              contextualQuestion,
              config.rewriter.numberOfQueries,
              config.rewriter.temperature,
            );
            queries = [...(config.rewriter.includeOriginal !== false ? [query] : []), ...rewrites];
            const rewriteTime = Date.now() - rewriteStartTime;
            debug('apiRequestHandler: rewrite time:', rewriteTime + 'ms');
          } catch (e) {
            const rewriteTime = Date.now() - rewriteStartTime;
            debug('apiRequestHandler: Rewriter failed after', rewriteTime + 'ms:', e);
          }
        }
        debug('apiRequestHandler: queries:', queries);

        // Retrieval, run retrieval for each and merge by rowid with best score
        const retrievalStartTime = Date.now();
        /** @type {RetrieveResponse[]} */
        let results = [];
        try {
          results = await Promise.all(
            queries.map(q => AIChatBot.retrieve(q, config, slugs)),
          );
          const retrievalTime = Date.now() - retrievalStartTime;
          debug('apiRequestHandler: retrieval time:', retrievalTime + 'ms');
          debug('apiRequestHandler: results:', results);
        } catch (error) {
          const retrievalTime = Date.now() - retrievalStartTime;
          debug('apiRequestHandler: retrieval failed after', retrievalTime + 'ms:', error);
        }

        // merge chunks (keep best score) and citations
        /** @type {Map<number, RetrievedChunk>} */
        const byRow = new Map();
        for (const result of results) {
          for (const chunk of result.chunks) {
            const prev = byRow.get(chunk.rowid);
            if (!prev || chunk.score < prev.score) {
              byRow.set(chunk.rowid, chunk);
            }
          }
        }
        /** @type {RetrievedChunk[]} */
        const mergedChunks = Array.from(byRow.values()).sort((a, b) => b.score - a.score);
        /** @type {RetrievedChunk[]} */
        const mergedResult = mergedChunks.slice(0, config.chunkLimit);

        // build citations from merged chunks
        const citations = mergedResult.map(c => ({
          title: c.source.title || c.source.id,
          slug: c.source.slug || '',
          sectionPath: c.sectionPath,
          source_id: c.source_id,
          idx: c.idx,
          score: c.score,
        }));
        debug('apiRequestHandler: citations:', citations);
        debug('apiRequestHandler: context chunks token breakdown:', mergedResult.map(chunk => ({
          source: chunk.source.title || chunk.source.id,
          tokens: chunk.token_count || OllamaEmbedder.approxTokenLen(chunk.text),
          textLength: chunk.text.length,
          score: chunk.score,
          // text: chunk.text,
        })));

        // Build prompt with a short memory preface
        const memoryNote = config.summary.enabled && mem.summary ? `Conversation summary:\n${mem.summary}\n\n` : '';
        const messages = AIChatBot.buildPromptMessages(
          `${query}\n\n${memoryNote}`.trim(),
          mergedResult,
          { maxContextCharacters: 20000 },
        );

        // Calculate total prompt tokens
        const totalPromptTokens = messages.reduce((total, msg) => {
          return total + OllamaEmbedder.approxTokenLen(msg.content);
        }, 0);
        const totalContextTokens = mergedResult.reduce((total, chunk) => {
          return total + (chunk.token_count || OllamaEmbedder.approxTokenLen(chunk.text));
        }, 0);
        debug('apiRequestHandler: Total prompt tokens:', totalPromptTokens);
        debug('apiRequestHandler: Total context tokens:', totalContextTokens);
        debug('apiRequestHandler: Messages breakdown:', messages.map(msg => ({
          role: msg.role,
          tokens: OllamaEmbedder.approxTokenLen(msg.content),
          contentLength: msg.content.length,
        })));

        // Keepalive ping every 15s
        const ping = setInterval(() => response.write(': ping\n\n'), 15000);

        // Stream from Ollama and capture assistant text for memory
        const streamStartTime = Date.now();
        let assistantText = '';

        await AIChatBot.stream(config.ollamaBaseUrl, config.chatModel, config.temperature, config.maxTokens, messages, {
          onToken: (t) => {
            assistantText += t;
            response.write(`data: ${JSON.stringify({ token: t })}\n\n`);
          },
          onDone: async () => {
            debug('apiRequestHandler: onDone');
            // Send citations at the end
            response.write(`data: ${JSON.stringify({ done: true, sources: citations })}\n\n`);
            clearInterval(ping);

            const streamTime = Date.now() - streamStartTime;
            debug('apiRequestHandler: stream time:', streamTime + 'ms');

            // Update memory (summarize)
            if (config.summary.enabled) {
              const newTurns = [...mem.last, { user: query, assistant: assistantText, ts: Date.now() }];
              if (mem.summary) {
                const newSummary = await AIChatBot.summarizeTurn(config.summary.baseUrl, config.summary.model, mem.summary, mem.last, query, assistantText);
                memStore.set(sessionId, { summary: newSummary, last: newTurns });
              }
            }

            // All done, end the response
            const requestEndTime = Date.now();
            const totalRequestTime = requestEndTime - requestStartTime;
            debug('apiRequestHandler: Total request time:', totalRequestTime + 'ms');
            response.end();
          },
        });
      } catch (error) {
        const requestEndTime = Date.now();
        const totalRequestTime = requestEndTime - requestStartTime;
        debug('apiRequestHandler: error after', totalRequestTime + 'ms:', error);
        response.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n\n`);
        response.end();
        // fall back if headers not sent
        // if (!response.headersSent) response.status(500).json({ error: 'chat failed' });
      }
    };
  }

  /**
   * Build messages for the AI chat bot.
   * @param {string} userQuestion The user's question.
   * @param {RetrievedChunk[]} chunks The chunks of text to use as context.
   * @param {object} opts The options for the prompt.
   * @param {number} opts.maxContextCharacters The maximum number of characters to include in the context.
   * @returns {ChatBotMessage[]} The messages for the AI chat bot.
   */
  static buildPromptMessages(userQuestion, chunks, opts) {
    // Compose a compact context block with separators + local citations
    /** @type {string[]} */
    const blocks = [];
    for (const chunk of chunks) {
      const srcTitle = chunk.source.title || chunk.source.id;
      const section = chunk.sectionPath?.length ? ` - ${chunk.sectionPath.join(' > ')}` : '';
      const text = chunk.text.length <= 1500 ? chunk.text : chunk.text.slice(0, 1500 - 1) + '…';
      blocks.push(`SOURCE: ${srcTitle}${section}\nSLUG: ${chunk.source.slug ?? ''}\n---\n${text}`);
    }

    let context = blocks.join('\n\n====\n\n');
    if (context.length > opts.maxContextCharacters) {
      context = context.slice(0, opts.maxContextCharacters);
    }

    const system = `<goal>
You are Uttori, the dedicated wiki assistant.
The user is asking a question about products and services they have and have given us context to.
Your role is to answer question on the documents in the wiki that you are an expert on.
</goal>

<format_rules>
Use Markdown for clarity and readability. Follow these style rules:

## Document Structure

### Lists and Organization
- Use bullet points for clarity
    - Primary points at first level
    - Supporting details indented
    - Limit nesting to two levels
- Use numbered lists only for sequential instructions.

### Styling
- Use capitalized words sparingly for emphasis.
- DO NOT use italics or bold formatting.
- Maintain a professional tone and friendly voice.
</format_rules>

<planning_guidance>
When drafting a response:

1. Identify the underlying type of the question (e.g., product, service, feature, etc.).
2. Ensure clarity, coherence, and a professional tone.
3. Follow <format_rules> to maintain consistency and readability.
</planning_guidance>

<session_context>
The current date is ${new Date().toLocaleDateString()}.
- User Preferences:
    - Prefers concise responses.
    - Uses American English spelling.
</session_context>

<output>
- Use the context below to help answer the question.
- Please only answer the question, do not include any other text unless the user asks for it.
- No Chitchat: Avoid conversational filler, preambles ("Okay, I will now..."), or postambles ("I have finished the changes..."). Get straight to the action or answer.
- Do not include a list of sources.
- Normalize names and model numbers before reasoning (case-insensitive).
- Treat hyphens / spaces as optional.
- Map common suffix variants.
- When searching context, consider normalized aliases of key terms.
- If multiple aliases refer to the same thing, merge evidence and cite once.
</output>`;
    // You can call tools. To call a tool, output ONLY a JSON object with this schema:
    // {"tool":"search_wiki","args":{"q":"<query>","limit":5}}
    // Available tool:
    // search_wiki(args: {q: string, limit?: number}) → {items: Array<{title, url, sectionPath, snippet}>}
    // Use ONLY by outputting a single JSON object exactly like:
    // {"tool":"search_wiki","args":{"q":"<query>","limit":5}}
    // Rules:
    // - Keep q concise.
    // - Ask once per user question unless results are empty, then you may refine and try once more.
    // - After a tool call, wait for tool output; do not answer until you see it.
    // - If tool returns nothing, say you don't know and suggest a better query.
    // - When you need facts from the wiki, call search_wiki with a focused query.
    // - Prefer exact titles/aliases and include variants (e.g., "SP-404 MKII" / "SP404MK2").
    // - Read results: prefer items whose title matches the entity.
    const user = `Question: ${userQuestion}

Context:
${context}`;

    return [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ];
  }

  /**
   * Rewrite the user's question into diverse, self-contained search queries for a documentation/wiki RAG system.
   * @param {string} baseUrl The base URL of the API.
   * @param {string} model The model to use for the rewriter.
   * @param {string} userQuery The user's question.
   * @param {number} numberOfQueries The number of queries to generate.
   * @param {number} temperature The temperature for the rewriter.
   * @returns {Promise<string[]>} The rewritten queries.
   */
  static async rewriteQueries(baseUrl, model, userQuery, numberOfQueries, temperature) {
    const prompt = [
      {
        role: 'system',
        content: `Rewrite the user's question into ${numberOfQueries} diverse, self-contained search queries for a documentation/wiki RAG system.
- Keep them concise (<= 15 words).
- Cover likely synonyms and platform variants.
- Include key entities and constraints.
- Remove punctuation/hyphens/spaces for one variant.
- Replace Roman numerals with Arabic ("MKII"→"MK2") and vice-versa.
- Include both compact and spaced forms.
- Output as a JSON array of strings.`,
      },
      {
        role: 'user',
        content: `Question: ${userQuery}`,
      },
    ];

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: false, options: { temperature }, messages: prompt }),
    });
    if (!response.ok) {
      debug('Rewriter error:', await response.text());
      throw new Error(await response.text());
    }

    let text = '';
    try {
      /** @type {Record<string, any>} */
      const data = await response.json();
      text = data?.message?.content || data?.choices?.[0]?.message?.content || '[]';
      debug('Rewriter response:', text);
    } catch (error) {
      debug('Rewriter error:', error);
    }

    try {
      // Remove think tags and content between them before parsing
      const cleanedText = text.replace(/<think>[\S\s]*?<\/think>/g, '').trim();
      const arr = JSON.parse(cleanedText);
      return Array.isArray(arr) ? arr.map(String) : [userQuery];
    } catch (error) {
      debug('Rewriter error:', error);
      // Fallback: split lines and filter think content
      const cleanedText = text.replace(/<think>[\S\s]*?<\/think>/g, '').trim();
      const lines = cleanedText.split(/\n+/).map(s => s.trim()).filter(Boolean);
      debug('Rewriter fallback:', lines);
      return lines;
    }
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
    const system = 'You maintain a very short rolling summary (1-3 sentences) of a support conversation. Keep only stable facts, user goals. Omit chit-chat.';
    const user = `Previous summary:\n${prevSummary || '(none)'}\n
Recent turns:\n${lastTurns.map(t => `U: ${t.user}\nA: ${t.assistant ?? ''}`).join('\n')}
New turn:\nU: ${newUser}\nA: ${newAssistant}\n
Write the new summary (<= 60 words).`;

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, stream: false, options: { temperature: 0.1 }, messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ]}),
    });

    if (!response.ok) {
      debug('Summarizer error:', await response.text());
      throw new Error(await response.text());
    }

    let text = '';
    try {
      /** @type {Record<string, Record<string, string | any>>} */
      const data = await response.json();
      text = data?.message?.content || data?.choices?.[0]?.message?.content || '[]';
      debug('Summarizer response:', text);
    } catch (error) {
      debug('Summarizer error:', error);
    }
    return text.trim();
  }

  /**
   * Stream the response from the AI chat bot.
   * @param {string} baseUrl The base URL of the API.
   * @param {string} model The model to use for the chat bot.
   * @param {number} temperature The temperature for the chat bot.
   * @param {number} maxTokens The maximum number of tokens to generate.
   * @param {ChatBotMessage[]} messages The messages to send to the chat bot.
   * @param {StreamHandlers} handler The handler for the chat bot.
   * @returns {Promise<void>} The response from the chat bot.
   */
  static async stream(baseUrl, model, temperature, maxTokens, messages, handler) {
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        stream: true,
        options: {
          temperature: temperature,
          num_predict: maxTokens,
        },
        messages,
      }),
    });

    if (!response.ok || !response.body) {
      throw new Error(`Ollama chat error: ${response.status} ${await response.text()}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });

      // Ollama streams newline-delimited JSON chunks
      for (const line of chunk.split('\n')) {
        const s = line.trim();
        if (!s) continue;
        try {
          /** @type {Record<string, Record<string, string>>} */
          const json = JSON.parse(s);
          // message?.content is appended token(s), or empty when only metadata
          const token = json?.message?.content ?? '';
          if (token) {
            await handler.onToken(token);
          }
          if (json?.done) {
            await handler.onDone();
            return;
          }
        } catch (_) {
          // ignore partial lines until next read
        }
      }
    }
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

  /**
   * Extract 1 to 6 short entities/concepts from the question.
   * Returns a lowercase array; strictly JSON (no prose).
   * @param {string} baseUrl The base URL of the Ollama server.
   * @param {string} model The model to use for entity extraction.
   * @param {string} question The question to extract entities from.
   * @param {number} max The maximum number of entities to extract, defaults to 5.
   * @returns {Promise<string[]>} A lowercase array of entities.
   */
  static async extractEntities (baseUrl, model, question, max = 5) {
    const sys = `Extract up to ${max} short entities or key concepts from a user question.
- Use 1-4 words per entity.
- Prefer product/model names, page titles, components, features.
- Lowercase the output.
Return ONLY a JSON array of strings.`;

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, stream: false, options: { temperature: 0.1 },
        messages: [
          { role: 'system', content: sys },
          { role: 'user', content: question },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      debug('extractEntities: entities extraction error:', text);
      return [];
    }

    /** @type {Record<string, Record<string, string>>} */
    const data = await response.json();
    /** @type {string} */
    const text = data?.message?.content ?? '[]';
    const cleanedText = text.replace(/<think>[\S\s]*?<\/think>/g, '').trim();

    try {
      const arr = JSON.parse(cleanedText);
      if (!Array.isArray(arr)) {
        debug('extractEntities error: response was not an array');
        return [];
      }
      return arr.map(x => String(x).toLowerCase().trim()).filter(Boolean);
    } catch (error) {
      debug('extractEntities error:', error);
      return [];
    }
  }

  /**
   * Embed a query using the Ollama API.
   * @param {string} baseUrl The base URL of the Ollama server.
   * @param {string} model The model to use for embedding.
   * @param {string} text The text to embed.
   * @returns {Promise<Float32Array>} The embedded query.
   */
  static async embedQuery(baseUrl, model, text) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/embeddings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, input: text, prompt: text }),
      });
      if (!response.ok) {
        const text = await response.text();
        debug('embedQuery: embedding query error:', text);
        throw new Error(text);
      }

      /** @type {Record<string, any>} */
      const data = await response.json();
      /** @type {number[]} */
      let vec;
      if (Array.isArray(data?.embedding)) {
        vec = data.embedding;
      } else if (Array.isArray(data?.data?.[0]?.embedding)) {
        vec = data.data[0].embedding;
      } else {
        throw new Error('Unexpected embedding response shape');
      }
      return new Float32Array(vec);
    } catch (e) {
      debug('embedQuery: error embedding query:', e);
      throw e;
    }
  }


  /**
   * Rerank the chunks using a local LLM (0=irrelevant..3=high)
   * @param {string} baseUrl The base URL of the Ollama server.
   * @param {string} model The model to use for reranking.
   * @param {string} query The query to rerank the chunks for.
   * @param {RetrievedChunk[]} chunks The chunks to rerank.
   * @returns {Promise<RetrievedChunk[]>} The reranked chunks.
   */
  static async localRerank(baseUrl, model, query, chunks) {
    const passages = chunks.map((c, i) =>
      `[${i}] ${c.source.title||c.source.id} - ${c.sectionPath?.join(' > ')||''}\n${c.text.slice(0,800)}`).join('\n\n');
    const prompt = [
      { role: 'system', content:
`Rate how relevant each passage is to the user's question.
Return a JSON array of numbers (0=irrelevant,1=low,2=medium,3=high), same order.`,
      },
      { role: 'user', content: `Question: ${query}
Passages:
${passages}
` },
    ];
    const response = await fetch(`${baseUrl.replace(/\/$/,'')}/api/chat`, {
      method: 'POST', headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ model, stream: false, options: { temperature: 0.1 }, messages: prompt }),
    });
    if (!response.ok) {
      const text = await response.text();
      debug('localRerank: local reranker error:', text);
      throw new Error(text);
    }
    /** @type {Record<string, Record<string, string>>} */
    const data = await response.json();

    /** @type {number[]} */
    let scores = [];
    try {
      scores = JSON.parse(data?.message?.content ?? '[]');
    } catch (error) {
      debug('Local reranker error:', error);
    }
    if (!Array.isArray(scores)) {
      debug('localRerank: scores was not an array');
      scores = [];
    }

    // Pad/clip scores to match chunks length
    scores.length = chunks.length;
    return chunks.map((c, i)=>({ ...c, score: Number(scores[i] ?? 0) }));
  }

  /**
   * Retrieve chunks from the database.
   * @param {string} query The query to retrieve chunks for.
   * @param {AIChatBotConfig} config The options for the retrieval.
   * @param {string[]} [slugs] Optional array of source slugs to restrict search to.
   * @returns {Promise<RetrieveResponse>} The retrieved chunks.
   */
  static async retrieve(query, config, slugs = null) {
    debug('retrieve:', { query, slugs });
    // Load the database
    /** @type {import('better-sqlite3/index.js').Database} */
    const db = new Database(config.databasePath, config.databseOptions);
    sqliteVec.load(db);

    // If specific slugs are provided, we will add them as a filter to the search
    let slugFilter = '';
    /** @type {string[]} */
    let slugParams = [];
    if (slugs && Array.isArray(slugs) && slugs.length > 0) {
      debug('retrieve: restricting search to slugs:', slugs);
      const slugPlaceholders = slugs.map(() => '?').join(',');
      slugFilter = `AND s.slug IN (${slugPlaceholders})`;
      slugParams = slugs.map(s => `${s.trim()}`);
    }

    // Embed the query
    query = OllamaEmbedder.removeStopWords(query.trim()).join(' ');
    const queryVectors = await AIChatBot.embedQuery(config.ollamaBaseUrl, config.embedModel, query);

    // Vector search via sqlite-vss (top K more than we need to allow blending)
    const vectorQuery = `WITH vec_matches AS (
      SELECT v.rowid, v.distance
      FROM uttori_chunks_vec v
      WHERE v.embedding MATCH ? AND v.k = ?
    )
    SELECT
      c.rowid,
      vec_matches.distance
    FROM vec_matches
    JOIN uttori_chunks c ON vec_matches.rowid = c.rowid
    JOIN uttori_sources s ON c.source_id = s.id
    WHERE 1=1 ${slugFilter}
    ORDER BY vec_matches.distance
    LIMIT ?`;
    /** @type {(string | Buffer| number)[]} */
    const vectorParams = [Buffer.from(queryVectors.buffer), config.chunkLimit * 3];
    if (slugParams.length) {
      vectorParams.push(...slugParams, config.chunkLimit * 3);
    } else {
      vectorParams.push(config.chunkLimit * 3);
    }
    // debug('retrieve: vector query:', vectorQuery);
    // debug('retrieve: vector params:', vectorParams);
    const vectorRows = /** @type {{ rowid: number; distance: number }[]} */
      (db.prepare(vectorQuery).all(...vectorParams));
    debug('retrieve: vector rows:', vectorRows.length);

    // Optional FTS search
    /** @type {FtsRow[]} */
    let ftsRows = [];
    /** @type {string[]} */
    let entities = OllamaEmbedder.removeStopWords(query);
    if (config.hybrid) {
      try {
        // Ask small local model for entities/concepts
        const entitiesStartTime = Date.now();
        /** @type {string[]} */
        if (config.entities?.enabled) {
          try {
            debug('retrieve: extracting entities...');
            entities = [
              ...entities,
              ...(await AIChatBot.extractEntities(config.entities.baseUrl, config.entities.model, query, config.entities.max)),
            ];
            const entitiesTime = Date.now() - entitiesStartTime;
            debug('retrieve: entities extraction time:', entitiesTime + 'ms');
            debug('retrieve: entities:', entities);
          } catch (e) {
            const entitiesTime = Date.now() - entitiesStartTime;
            debug('retrieve: entities extraction failed after', entitiesTime + 'ms:', e);
          }
        }

        // Setup the FTS query
        const ftsStmt = db.prepare(`
          SELECT f.rowid, bm25(uttori_chunks_fts) AS rank
          FROM uttori_chunks_fts f
          JOIN uttori_chunks c ON f.rowid = c.rowid
          JOIN uttori_sources s ON c.source_id = s.id
          WHERE uttori_chunks_fts MATCH ? ${slugFilter}
          ORDER BY rank
          LIMIT ?
        `);

        // Strong FTS Query: phrase + proximity + variants (without stopwords)
        // Join entities and parts with " OR " and make loose variants
        const items = entities.filter(Boolean).map(t => t.replace(/\?/g, '').replace(/\s+/g, ' ').trim());
        const pieces = items.map(phrase => {
          const parts = phrase.split(/\s+/).filter(Boolean);
          const loose = parts.length ? `${parts.map(t => `"${t}"*`).join(' AND ')}` : null;
          return [loose].filter(Boolean).join(' OR ');
        });
        debug('retrieve: FTS pieces:', pieces);
        const ftsQuery = pieces.join(' OR ');
        debug('retrieve: FTS query:', ftsQuery);
        ftsRows = /** @type {FtsRow[]} */
          (ftsStmt.all(ftsQuery, ...(slugParams.length ? slugParams : []), config.chunkLimit * 3));
      } catch (e) {
        debug('retrieve: FTS error:', e);
        // FTS not enabled; continue vector-only
        ftsRows = [];
      }
    }
    debug('retrieve: FTS rows:', ftsRows.length);
    debug('retrieve: FTS rows:', ftsRows.map(r => { return { rowid: r.rowid, rank: r.rank }; }));

    // Convert Okapi BM25 to Similarity via z-score.
    /** @type {number[]} Ranks: lower is better, can be negative. */
    const ranks = ftsRows.map(r => r.rank);
    // The z-score indicates how many standard deviations an observation is from the mean.
    // This transformation re-scales the raw BM25 scores,
    // centering the mean at zero with a standard deviation of one.
    // This is crucial because it makes the scores comparable across different queries,
    // even though the raw BM25 score distributions may vary significantly.
    const ftsMean = ranks.length ? ranks.reduce((sum, x) => sum + x, 0) / ranks.length : 0;
    const ftsStandardDeviation = ranks.length > 1 ? Math.sqrt(ranks.reduce((sum, x) => sum + (x - ftsMean) ** 2, 0) / (ranks.length - 1)) : 0;
    /** @type {Map<number, number>} */
    const ftsSimilarity = new Map();
    for (const r of ftsRows) {
      if (!ftsStandardDeviation) {
        ftsSimilarity.set(r.rowid, 0.5);
        continue;
      }
      // Finally, apply the logistic function (also known as the sigmoid function) to each z-score.
      // This maps the unbounded z-score to a value between 0 and 1,
      // which can be interpreted as a probability-like score of relevance.
      // A score closer to 1 indicates higher predicted relevance,
      // while a score closer to 0 indicates lower predicted relevance.
      const z = (ftsMean - r.rank) / ftsStandardDeviation;
      const similarity = 1 / (1 + Math.exp(-z));
      ftsSimilarity.set(r.rowid, similarity);
    }

    // Convert vector distance into a similarity score (1 = best)
    const vecDistances = vectorRows.map(r => Number(r.distance));
    const vMin = vecDistances.length ? Math.min(...vecDistances) : 0;
    const vMax = vecDistances.length ? Math.max(...vecDistances) : 1;
    /** @type {Map<number, number>} */
    const vecSimilarity = new Map();
    for (const r of vectorRows) {
      const similarity = vMax === vMin ? 0 : 1 - ((Number(r.distance) - vMin) / (vMax - vMin));
      vecSimilarity.set(r.rowid, similarity);
    }

    // Title Boots & Entity Boosts
    const parts = query.split(/\s+/).filter(Boolean);
    // Does the query look like a literal phrase rather than a question?
    const looksLiteral = parts.length <= 4 && /[A-Z]/.test(query) && !/\?$/.test(query);
    let wFTS = 0.0;
    if (ftsRows.length > 0) {
      const base = config.ftsWeight;
      const bump = entities.length ? config.ftsWeightBump : 0;
      wFTS = looksLiteral ? Math.min(0.8, base + bump + 0.15) : Math.min(0.8, base + bump);
    }

    // Collect candidate rowids (UNION of vector + FTS)
    const candidateRowids = Array.from(new Set([
      ...vectorRows.map(r => r.rowid),
      ...ftsRows.map(r => r.rowid),
    ]));

    // If no candidate rowids, return empty results
    if (candidateRowids.length === 0) {
      debug('retrieve: no candidate rowids');
      return { query, chunks: [], citations: [] };
    }

    // Fetch rows before blending so we can compute title / text boosts
    const candidatePlaceholders = candidateRowids.map(() => '?').join(',');
    const candidateRows = /** @type {FtsRow[]} */
      (db.prepare(`
      SELECT c.rowid, c.source_id, c.idx, c.text, c.token_count, c.meta_json,
            s.title AS source_title, s.slug AS source_slug
      FROM uttori_chunks c
      JOIN uttori_sources s ON s.id = c.source_id
      WHERE c.rowid IN (${candidatePlaceholders})
    `).all(...candidateRowids));

    /** @type {Map<number, FtsRow>} */
    const candidateRowsById = new Map();
    for (const r of candidateRows) {
      candidateRowsById.set(r.rowid, r);
    }

    // Add hard boosts for exact-phrase & title matches
    /** @type {Map<number, number>} */
    const titleMatchCount = new Map();
    /** @type {Map<number, number>} */
    const textMatchCount  = new Map();
    const termLC = entities.map(t => t.toLowerCase());
    for (const row of candidateRows) {
      const title = (row.source_title ?? '').toLowerCase();
      const text = (row.text ?? '').toLowerCase();
      let tc = 0;
      let xc = 0;
      for (const term of termLC) {
        if (term && title.includes(term)) tc++;
        if (term && text.includes(term)) xc++;
      }
      if (tc) {
        debug('retrieve: title match:', row.rowid, tc);
        titleMatchCount.set(row.rowid, tc);
      }
      if (xc) {
        debug('retrieve: text match:', row.rowid, xc);
        textMatchCount.set(row.rowid, xc);
      }
    }

    // Blend similarities & boosts (higher is better)
    /** @type {BlendedChunk[]} */
    const blended = [];
    for (const rowid of candidateRowids) {
      const v = vecSimilarity.get(rowid) ?? 0;
      const f = ftsSimilarity.get(rowid) ?? 0;
      let score = (1 - wFTS) * v + wFTS * f;

      // entity boosts (multiplicative-ish via accumulation)
      const titleBoost = (titleMatchCount.get(rowid) ?? 0) * (config.titleBoost);
      const textBoost = (textMatchCount.get(rowid) ?? 0) * (config.textBoost);
      score += titleBoost + textBoost;

      blended.push({ rowid, score, titleBoost, textBoost });
    }

    // Sort by score (higher is better)
    blended.sort((a,b) => b.score - a.score);

    // Pin the best exact title matches so later limiting and budgeting doesn't drop them
    /** @type {Set<number>} */
    const pinnedRowids = new Set();
    const firstTitleExact = blended.find(b => titleMatchCount.has(b.rowid));
    if (firstTitleExact) {
      debug('retrieve: pinned title exact match:', firstTitleExact.rowid);
      pinnedRowids.add(firstTitleExact.rowid);
    }

    // Build merged (materialize with row data) in this new order
    /** @type {RetrievedChunk[]} */
    const merged = [];
    for (const b of blended) {
      const r = candidateRowsById.get(b.rowid);
      if (r) {
        let sectionPath = [];
        try {
          /** @type {Record<string, any>} */
          const data = JSON.parse(r.meta_json || '{}');
          sectionPath = data?.sectionPath ?? [];
        } catch (e) {
          debug('retrieve: error parsing sectionPath:', e);
          sectionPath = [];
        }
        merged.push({
          rowid: r.rowid,
          source_id: r.source_id,
          idx: r.idx,
          text: r.text,
          token_count: r.token_count,
          sectionPath,
          source: { id: r.source_id, title: r.source_title, slug: r.source_slug },
          score: b.score,
        });
      }
    }
    debug('retrieve: merged chunks:', merged.length);
    debug('retrieve: merged chunks:', merged.map(m => { return { source_id: m.source_id, score: m.score }; }));

    // Select chunks per kept source under context budget
    /** @type {Map<string, number>} */
    const capBySource = new Map();
    /** @type {RetrievedChunk[]} */
    const picked = [];
    let budget = config.maxContextTokens;

    // If a pinned row exists, push it first
    if (pinnedRowids.size) {
      const pinned = merged.find(m => pinnedRowids.has(m.rowid));
      if (pinned) {
        picked.push(pinned);
        capBySource.set(pinned.source_id, 1);
        budget -= pinned.token_count || OllamaEmbedder.approxTokenLen(pinned.text);
      }
    }
    debug('retrieve: pinned row ids:', pinnedRowids);

    // Continue with your normal picking logic
    debug('retrieve: picking chunks...');
    for (const m of merged) {
      debug('retrieve: merged chunk:', m.source_id, m.score);
      // Already included?
      if (pinnedRowids.has(m.rowid)) {
        debug('retrieve: skipping pinned chunk:', m.source_id, m.score);
        continue;
      }
      // Do we have too many chunks from this source?
      const count = capBySource.get(m.source_id) || 0;
      if (count >= config.maxPerSource) {
        debug('retrieve: skipping chunk from source:', m.source_id, 'because we have too many chunks from this source:', count);
        continue;
      }
      // Do we have too many tokens?
      const t = m.token_count || OllamaEmbedder.approxTokenLen(m.text);
      if (t > budget && picked.length) {
        debug('retrieve: skipping chunk from source:', m.source_id, 'because we have too many tokens:', t, '> budget:', budget);
        continue;
      }
      // Add the chunk to the list
      picked.push(m);
      capBySource.set(m.source_id, count + 1);
      budget -= t;
      // Are we over the limit?
      if (picked.length >= config.chunkLimit || budget <= 0) {
        debug('retrieve: stopping because we have too many chunks:', picked.length);
        break;
      }
    }
    debug('retrieve: picked chunks:', picked.length);
    debug('retrieve: picked chunks:', picked.map(c => ({ source_id: c.source_id, score: c.score })));

    // Local re-ranker on the final candidate set
    if (config.rerank?.enabled) {
      const topN = config.rerank.topN ?? Math.min(30, picked.length);
      const slice = picked.slice(0, topN);

      // score with a tiny local model (0=irrelevant..3=high)
      const scored = await AIChatBot.localRerank(config.rerank.baseUrl, config.rerank.model, query, slice);

      // keep only >1, sort desc by rerank score
      const good = scored.filter((chunk) => chunk.score >= 2).sort((a, b)=> b.score - a.score);

      // fall back to original if reranker is too strict
      if (good.length >= Math.min(5, slice.length/2)) {
        picked.splice(0, slice.length, ...good);
      }
      debug('retrieve: reranked chunks:', picked.length);
      debug('retrieve: reranked chunks:', picked.map(c => c.source_id));
    }

    // Prepare citations with anchors
    const citations = picked.map(c => {
      const anchor = c.sectionPath.length ? '#' + c.sectionPath.map(encodeURIComponent).join('-') : '';
      return {
        title: c.source.title || c.source.id,
        slug: (c.source.slug || '') + anchor,
        sectionPath: c.sectionPath,
        source_id: c.source_id,
        idx: c.idx,
        score: c.score,
      };
    });
    debug('retrieve: citations:', citations.length);
    debug('retrieve: citations:', citations.map(c => { return { slug: c.slug, sectionPath: c.sectionPath, score: c.score, source_id: c.source_id }; }));

    return { query, chunks: picked, citations };
  }
}

export default AIChatBot;
