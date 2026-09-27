import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import SearchProvider from './utilities/search-lunr.js';
import type { SearchLunrConfig } from '../types/plugins/search-provider-lunr.js';

export type { LunrLocale, SearchLunrConfig } from '../types/plugins/search-provider-lunr.js';

const debug = createDebug('Uttori.SearchProvider.Lunr.Plugin');

/**
 * Uttori Search Provider - Lunr, Uttori Plugin Adapter
 * @example
 * ```js
 * const search = Plugin.callback(viewModel, context);
 * ```
 */
class SearchLunrPlugin {
  /**
   * Export the provider's actual indexing logic for a static browser search.
   * @param documents Public documents.
   * @returns A serialized Lunr index.
   */
  static exportIndex(documents: import('../wiki.js').UttoriWikiDocument[]): object {
    return new SearchProvider().indexDocuments(documents);
  }
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example
   * ```js
   * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
   * ```
   */
  static get configKey(): 'uttori-plugin-search-provider-lunr' {
    return 'uttori-plugin-search-provider-lunr';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example
   * ```js
   * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
   * ```
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<SearchLunrConfig, 'ignoreSlugs' | 'lunr_locales' | 'events'> {
    return {
      ignoreSlugs: [],
      lunr_locales: [],
      events: {
        search: ['search-query'],
        buildIndex: ['search-rebuild'],
        indexAdd: ['search-add'],
        indexUpdate: ['search-update'],
        indexRemove: ['search-remove'],
        getPopularSearchTerms: ['search-popular-terms'],
        validateConfig: ['validate-config'],
      },
    };
  }

  /**
   * Validates the provided configuration for required entries and types.
   * @param config A provided configuration to use.
   */
  static validateConfig(config: Record<string, SearchLunrConfig>) {
    debug('Validating config...');
    if (!config[SearchLunrPlugin.configKey]) {
      const error = `Config Error: '${SearchLunrPlugin.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }
    if (config[SearchLunrPlugin.configKey].lunr_locales && !Array.isArray(config[SearchLunrPlugin.configKey].lunr_locales)) {
      const error = 'Config Error: `lunr_locales` is should be an array of strings.';
      debug(error);
      throw new Error(error);
    }
    if (config[SearchLunrPlugin.configKey].lunrLocaleFunctions && !Array.isArray(config[SearchLunrPlugin.configKey].lunrLocaleFunctions)) {
      const error = 'Config Error: `lunrLocaleFunctions` is should be an array of Lunr Language Plugins.';
      debug(error);
      throw new Error(error);
    }
    if (config[SearchLunrPlugin.configKey].ignoreSlugs && !Array.isArray(config[SearchLunrPlugin.configKey].ignoreSlugs)) {
      const error = 'Config Error: `ignoreSlugs` is should be an array.';
      debug(error);
      throw new Error(error);
    }
    debug('Validated config.');
  };

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param context A Uttori-like context.
   * @example
   * ```js
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [Plugin.configKey]: {
   *       ...,
   *       events: {
   *         search: ['search-query'],
   *         buildIndex: ['search-add', 'search-rebuild', 'search-remove', 'search-update'],
   *         getPopularSearchTerms: ['search-popular-terms'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * Plugin.register(context);
   * ```
   */
  static async register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', SearchLunrConfig>) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = { ...SearchLunrPlugin.defaultConfig(), ...context.config[SearchLunrPlugin.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    const search = new SearchProvider(config);
    for (const [method, eventNames] of Object.entries(config.events)) {
      const SearchLunrPluginMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(SearchLunrPlugin, method);
      const searchMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(search, method);
      if (searchMethod) {
        for (const event of eventNames) {

          const callback = searchMethod;
          context.hooks.on(event, callback);
        }
      } else if (SearchLunrPluginMethod) {
        for (const event of eventNames) {

          const callback = SearchLunrPluginMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }
}

export default SearchLunrPlugin;
