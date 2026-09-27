import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import SearchProvider from './utilities/search-sqlite.js';
import { extractAttachmentText } from './chat-bot/attachment-extractor.js';
import type { SearchSQLiteEmbedPrompt, SearchSQLiteConfig } from '../types/plugins/search-provider-sqlite.js';

export type {
  SearchSQLiteEmbedPrompt, SearchSQLiteExtractAttachmentText, SearchSQLiteConfig, RetrievedChunk,
  RetrieveResponse, FtsRow, Block, IndexedBlock, ChunkWithMeta, BlendedChunk,
  ResolvedSearchSQLiteConfig,
} from '../types/plugins/search-provider-sqlite.js';

const debug = createDebug('Uttori.SearchProvider.SQLite.Plugin');

/**
 * Uttori Search Provider - SQLite, Uttori Plugin Adapter.
 *
 * @example
 * ```js
 * const search = SearchSQLitePlugin.callback(viewModel, context);
 * ```
 */
class SearchSQLitePlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   *
   * @returns The configuration key.
   * @example
   * ```js
   * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
   * ```
   */
  static get configKey(): 'uttori-plugin-search-provider-sqlite' {
    return 'uttori-plugin-search-provider-sqlite';
  }

  /**
   * The default configuration.
   *
   * @returns The configuration.
   * @example
   * ```js
   * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
   * ```
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<SearchSQLiteConfig, 'events' | 'databasePath' | 'databaseOptions' | 'updateTimestamps' | 'useHistory' | 'ollamaBaseUrl' | 'embedModel' | 'embedPrompt' | 'chunkLimit' | 'hybrid' | 'fts' | 'ftsWeight' | 'titleBoost' | 'textBoost' | 'ftsWeightBump' | 'maxContextTokens' | 'maxPerSource' | 'batch' | 'ignoreSlugs' | 'ignoreTags' | 'bootstrapIndexOnStartup' | 'rebuildIndexOnStartup' | 'attachmentsRoot' | 'includeAttachments' | 'markdownItPluginConfig' | 'tableToCSV' | 'tableMaxRowsPerChunk' | 'tableMaxTokensPerChunk'> {

    const defaultEmbedPrompt: SearchSQLiteEmbedPrompt = (_task, query) => query;

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
   * @param config A provided configuration to use.
   * @example
   * ```js
   * SearchSQLitePlugin.validateConfig({ ... });
   * ```
   */
  static validateConfig(config: Record<string, SearchSQLiteConfig>) {
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
   * @param context A Uttori-like context.
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
   */
  static async register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-sqlite', SearchSQLiteConfig>) {
    debug('register');

    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const base: SearchSQLiteConfig = SearchSQLitePlugin.defaultConfig();

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
      const SearchSQLitePluginMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(SearchSQLitePlugin, method);
      const searchMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(search, method);
      if (searchMethod) {
        for (const event of eventNames) {

          const callback = searchMethod;
          context.hooks.on(event, callback);
        }
      } else if (SearchSQLitePluginMethod) {
        for (const event of eventNames) {

          const callback = SearchSQLitePluginMethod;
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
