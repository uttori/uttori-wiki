import SearchProvider from './utilities/search-lunr.js';

let debug = (..._) => {};
/* c8 ignore next 2 */

try { const { default: d } = await import('debug'); debug = d('Uttori.SearchProvider.Lunr.Plugin'); } catch {}

/**
 * @typedef {Function} LunrLocale
 * @param {lunr} lunr The Lunr instance.
 */

/**
 * @typedef {object} SearchLunrConfig
 * @property {string[]} [lunr_locales] A list of locales to add support for from lunr-languages.
 * @property {LunrLocale[]} [lunrLocaleFunctions] A list of locales to add support for from lunr-languages.
 * @property {string[]} [ignoreSlugs] A list of slugs to not consider when indexing documents.
 * @property {Record<string, string[]>} [events] The events to listen for.
 */

/**
 * Uttori Search Provider - Lunr, Uttori Plugin Adapter
 * @example
 * ```js
 * const search = Plugin.callback(viewModel, context);
 * ```
 * @class
 */
class SearchLunrPlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example
   * ```js
   * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
   * ```
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-search-provider-lunr';
  }

  /**
   * The default configuration.
   * @returns {SearchLunrConfig} The configuration.
   * @example
   * ```js
   * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
   * ```
   * @static
   */
  static defaultConfig() {
    return {
      ignoreSlugs: [],
      lunr_locales: [],
      events: {
        search: ['search-query'],
        buildIndex: ['search-rebuild'],
        indexAdd: ['search-add'],
        indexUpdate: ['search-update'],
        indexRemove: ['search-remove'],
        getPopularSearchTerms: ['popular-search-terms'],
        validateConfig: ['validate-config'],
      },
    };
  }

  /**
   * Validates the provided configuration for required entries and types.
   * @param {Record<string, SearchLunrConfig>} config A provided configuration to use.
   */
  static validateConfig(config) {
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
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', SearchLunrConfig>} context A Uttori-like context.
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
   *         getPopularSearchTerms: ['popular-search-terms'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * Plugin.register(context);
   * ```
   * @static
   */
  static async register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {SearchLunrConfig} */
    const config = { ...SearchLunrPlugin.defaultConfig(), ...context.config[SearchLunrPlugin.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    const search = new SearchProvider(config);
    await search.buildIndex(context);

    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof search[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = search[method];
          context.hooks.on(event, callback);
        }
      } else if (typeof SearchLunrPlugin[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = SearchLunrPlugin[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }
}

export default SearchLunrPlugin;
