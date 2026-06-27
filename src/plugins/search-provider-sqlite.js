import { createDebug } from '../debug.js';
import SearchProvider from './utilities/search-sqlite.js';
import { extractAttachmentText } from './chat-bot/attachment-extractor.js';

const debug = createDebug('Uttori.SearchProvider.SQLite.Plugin');

/**
 * @callback SearchSQLiteEmbedPrompt
 * @param {string} task The embedding task label.
 * @param {string} query The query text to embed.
 * @returns {string} The prompt passed to the embedding model.
 */

/**
 * @callback SearchSQLiteExtractAttachmentText
 * @param {SearchSQLiteConfig} config The plugin configuration.
 * @param {import('../wiki.js').UttoriWikiDocumentAttachment} attachment The attachment to extract text from.
 * @returns {Promise<string>} The extracted attachment text.
 */

/**
 * @typedef {object} SearchSQLiteConfig
 * @property {Record<string, string[]>} [events] The events to listen for.
 * @property {string} databasePath The path to the SQLite database.
 * @property {import('better-sqlite3').Options} [databaseOptions] The options for the database.
 * @property {import('better-sqlite3').Options} [databseOptions] Deprecated misspelled alias for `databaseOptions`.
 * @property {boolean} [updateTimestamps] Should update times be marked at the time of edit.
 * @property {boolean} [useHistory] Should history entries be created.
 * @property {string} ollamaBaseUrl The base URL for the Ollama server.
 * @property {string} embedModel The model to use for embeddings.
 * @property {SearchSQLiteEmbedPrompt} [embedPrompt] The prompt to use for embeddings.
 * @property {number} [chunkLimit] The limit for the number of chunks to return.
 * @property {boolean} [hybrid] Whether to use the hybrid approach of vector & FTS.
 * @property {boolean} [fts] Whether to use the FTS index.
 * @property {number} [ftsWeight] The weight for the FTS index.
 * @property {number} [titleBoost] The title boost for query terms.
 * @property {number} [textBoost] The text boost for query terms.
 * @property {number} [ftsWeightBump] The FTS weight bump for query terms.
 * @property {number} [maxContextTokens] The maximum number of tokens to use for context.
 * @property {number} [maxPerSource] The maximum number of chunks to use per source.
 * @property {number} [batch] The embedding batch size.
 * @property {string[]} [ignoreSlugs] Slugs to ignore.
 * @property {string[]} [ignoreTags] Tags to ignore.
 * @property {boolean} [bootstrapIndexOnStartup] Whether to create the search index when index tables are missing on startup.
 * @property {boolean} [rebuildIndexOnStartup] Whether to rebuild the search index on startup.
 * @property {string} [attachmentsRoot] The root path to the attachments.
 * @property {boolean} [includeAttachments] Whether to include attachments.
 * @property {SearchSQLiteExtractAttachmentText} [extractAttachmentText] The function to use to extract text from an attachment.
 * @property {import('./renderer-markdown-it.js').MarkdownItRendererConfig} [markdownItPluginConfig] The markdown-it plugin configuration.
 * @property {boolean} [tableToCSV] Whether to convert tables to CSV format.
 * @property {number} [tableMaxRowsPerChunk] Maximum number of rows per table chunk for embedding.
 * @property {number} [tableMaxTokensPerChunk] Maximum estimated tokens per table chunk for embedding.
 */

/**
 * A scored chunk returned from a retrieval (RAG) query.
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
 * The response from a retrieval (RAG) query.
 * @typedef {object} RetrieveResponse
 * @property {string} query The query.
 * @property {RetrievedChunk[]} chunks The chunks.
 * @property {any[]} citations The citations.
 */

/**
 * A row returned from the FTS index.
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
 * A block of content parsed from a document prior to chunking/embedding.
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
 * A chunk paired with its embedding and metadata for insertion into the index.
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
 * A candidate chunk with its blended vector + FTS + boost score.
 * @typedef {object} BlendedChunk
 * @property {number} rowid The rowid of the chunk.
 * @property {number} score The score of the chunk.
 * @property {number} titleBoost The title boost of the chunk.
 * @property {number} textBoost The text boost of the chunk.
 */

/**
 * Uttori Search Provider - SQLite, Uttori Plugin Adapter.
 *
 * @example
 * ```js
 * const search = SearchSQLitePlugin.callback(viewModel, context);
 * ```
 * @class
 */
class SearchSQLitePlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @type {string}
   * @returns {string} The configuration key.
   * @example
   * ```js
   * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
   * ```
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-search-provider-sqlite';
  }

  /**
   * The default configuration.
   *
   * @returns {SearchSQLiteConfig} The configuration.
   * @example
   * ```js
   * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
   * ```
   * @static
   */
  static defaultConfig() {
    /** @type {SearchSQLiteEmbedPrompt} */
    const defaultEmbedPrompt = (_task, query) => query;

    return {
      events: {
        add: ['storage-add'],
        delete: ['storage-delete'],
        get: ['storage-get'],
        getHistory: ['storage-get-history'],
        getRevision: ['storage-get-revision'],
        getQuery: ['storage-query'],
        update: ['storage-update'],

        search: ['search-query'],
        buildIndex: ['search-rebuild'],
        indexAdd: ['search-add'],
        indexUpdate: ['search-update'],
        indexRemove: ['search-remove'],
        retrieve: ['search-retrieve'],
        listDocuments: ['search-documents'],
        getPopularSearchTerms: ['search-popular-terms'],
        validateConfig: ['validate-config'],
      },
      databasePath: './site/data/uttori-wiki.sqlite',
      databaseOptions: {},
      databseOptions: undefined,

      updateTimestamps: true,
      useHistory: true,

      ollamaBaseUrl: 'http://127.0.0.1:11434',
      embedModel: 'qwen3-embedding:8b',
      embedPrompt: defaultEmbedPrompt,

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

      ignoreSlugs: [],
      ignoreTags: [],
      bootstrapIndexOnStartup: true,
      rebuildIndexOnStartup: false,

      attachmentsRoot: './site/uploads',
      includeAttachments: true,
      extractAttachmentText,
      markdownItPluginConfig: {
        events: {},
        markdownIt: {
          uttori: {
            baseUrl: '',
            allowedExternalDomains: [],
            disableValidation: false,
            openNewWindow: true,
            lazyImages: true,
            toc: {
              extract: false,
              openingTag: '',
              closingTag: '',
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
    };
  }

  /**
   * Validates the provided configuration for required entries and types.
   *
   * @param {Record<string, SearchSQLiteConfig>} config A provided configuration to use.
   * @example
   * ```js
   * SearchSQLitePlugin.validateConfig({ ... });
   * ```
   * @static
   */
  static validateConfig(config) {
    debug('Validating config...');

    if (!config || !config[SearchSQLitePlugin.configKey]) {
      const error = `Config Error: '${SearchSQLitePlugin.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }

    const pluginConfig = {
      ...SearchSQLitePlugin.defaultConfig(),
      ...config[SearchSQLitePlugin.configKey],
    };

    if (typeof pluginConfig.databasePath !== 'string') {
      const error = 'Config Error: `databasePath` should be a string.';
      debug(error);
      throw new Error(error);
    }

    if (pluginConfig.databaseOptions && typeof pluginConfig.databaseOptions !== 'object') {
      const error = 'Config Error: `databaseOptions` should be an object.';
      debug(error);
      throw new Error(error);
    }

    if (pluginConfig.databseOptions && typeof pluginConfig.databseOptions !== 'object') {
      const error = 'Config Error: `databseOptions` should be an object.';
      debug(error);
      throw new Error(error);
    }

    if (typeof pluginConfig.ollamaBaseUrl !== 'string') {
      const error = 'Config Error: `ollamaBaseUrl` should be a string.';
      debug(error);
      throw new Error(error);
    }

    if (typeof pluginConfig.embedModel !== 'string') {
      const error = 'Config Error: `embedModel` should be a string.';
      debug(error);
      throw new Error(error);
    }

    if (pluginConfig.embedPrompt && typeof pluginConfig.embedPrompt !== 'function') {
      const error = 'Config Error: `embedPrompt` should be a function.';
      debug(error);
      throw new Error(error);
    }

    if (!Array.isArray(pluginConfig.ignoreSlugs)) {
      const error = 'Config Error: `ignoreSlugs` should be an array.';
      debug(error);
      throw new Error(error);
    }

    if (!Array.isArray(pluginConfig.ignoreTags)) {
      const error = 'Config Error: `ignoreTags` should be an array.';
      debug(error);
      throw new Error(error);
    }

    if (typeof pluginConfig.extractAttachmentText !== 'function') {
      const error = 'Config Error: `extractAttachmentText` should be a function.';
      debug(error);
      throw new Error(error);
    }

    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   *
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-sqlite', SearchSQLiteConfig>} context A Uttori-like context.
   * @example
   * ```js
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [SearchSQLitePlugin.configKey]: {
   *       events: {
   *         search: ['search-query'],
   *         buildIndex: ['search-rebuild'],
   *         indexAdd: ['search-add'],
   *         indexUpdate: ['search-update'],
   *         indexRemove: ['search-remove'],
   *         retrieve: ['search-retrieve'],
   *         listDocuments: ['search-documents'],
   *         getPopularSearchTerms: ['search-popular-terms'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * SearchSQLitePlugin.register(context);
   * ```
   * @static
   */
  static async register(context) {
    debug('register');

    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    /** @type {SearchSQLiteConfig} */
    const base = SearchSQLitePlugin.defaultConfig();
    /** @type {SearchSQLiteConfig} */
    const config = {
      ...base,
      ...context.config[SearchSQLitePlugin.configKey],
      events: {
        ...base.events,
        ...context.config[SearchSQLitePlugin.configKey]?.events,
      },
    };

    const search = new SearchProvider(config);

    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof search[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = search[method];
          context.hooks.on(event, callback);
        }
      } else if (typeof SearchSQLitePlugin[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = SearchSQLitePlugin[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }

    await search.bootstrapIndex(undefined, context);
  }
}

export default SearchSQLitePlugin;
