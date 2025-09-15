import AnalyticsProvider from './utilities/analytics-provider.js';

let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.AnalyticsPlugin'); } catch {}

/**
 * @typedef {object} AnalyticsPluginPopularDocument
 * @property {string} slug The slug of the document.
 * @property {number} count The count of the document.
 */

/**
 * @typedef {object} AnalyticsPluginConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [name] The name of the analytics file. The default is 'visits'.
 * @property {string} [extension] The extension of the analytics file. The default is 'json'.
 * @property {string} directory The path to the location you want the JSON file to be writtent to.
 * @property {number} [limit] The limit of documents to return. The default is 10.
 */

/**
 * Page view analytics for Uttori documents using JSON files stored on the local file system.
 * @property {AnalyticsPluginConfig} config The configuration object.
 * @example <caption>Init AnalyticsProvider</caption>
 * const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
 * @class
 */
class AnalyticsPlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>AnalyticsPlugin.configKey</caption>
   * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-analytics-json-file';
  }

  /**
   * The default configuration.
   * @returns {AnalyticsPluginConfig} The configuration.
   * @example <caption>AnalyticsPlugin.defaultConfig()</caption>
   * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      name: 'visits',
      extension: 'json',
      limit: 10,
      events: {},
      directory: './',
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, AnalyticsPluginConfig>} config A configuration object.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>} _context - A Uttori-like context (unused).
   * @example <caption>AnalyticsPlugin.validateConfig(config, _context)</caption>
   * AnalyticsPlugin.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config[AnalyticsPlugin.configKey]) {
      debug(`Config Error: '${AnalyticsPlugin.configKey}' configuration key is missing.`);
      throw new Error(`Config Error: '${AnalyticsPlugin.configKey}' configuration key is missing.`);
    }
    if (!config[AnalyticsPlugin.configKey].directory || typeof config[AnalyticsPlugin.configKey].directory !== 'string') {
      debug('Config Error: `directory` is required should be the path to the location you want the JSON file to be writtent to.');
      throw new Error('directory is required should be the path to the location you want the JSON file to be writtent to.');
    }
    if (!config[AnalyticsPlugin.configKey].limit || typeof config[AnalyticsPlugin.configKey].limit !== 'number') {
      debug('Config Error: `limit` is required should be the number of documents to return.');
      throw new Error('limit is required should be the number of documents to return.');
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>} context A Uttori-like context.
   * @example <caption>AnalyticsPlugin.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [AnalyticsPlugin.configKey]: {
   *       ...,
   *       events: {
   *         updateDocument: ['document-save', 'document-delete'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * AnalyticsPlugin.register(context);
   * @static
   */
  static register(context) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {AnalyticsPluginConfig} */
    const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }
    const analytics = new AnalyticsProvider(config);
    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof AnalyticsPlugin[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = AnalyticsPlugin[method](analytics);
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Wrapper function for calling update.
   * @param {import('./utilities/analytics-provider.js').default} analytics An AnalyticsProvider instance.
   * @returns {function(import('../wiki.js').UttoriWikiDocument, import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>): import('../wiki.js').UttoriWikiDocument} The provided document.
   * @example <caption>AnalyticsPlugin.updateDocument(analytics)</caption>
   * const context = {
   *   config: {
   *     [AnalyticsPlugin.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * AnalyticsPlugin.updateDocument(document, null);
   * @static
   */
  static updateDocument(analytics) {
    return (document, _context) => {
      debug('updateDocument');
      if (document && document.slug) {
        analytics.update(document.slug);
      }
      return document;
    };
  }

  /**
   * Wrapper function for calling update.
   * @param {import('./utilities/analytics-provider.js').default} analytics An AnalyticsProvider instance.
   * @returns {function(import('../wiki.js').UttoriWikiDocument, import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>): number} The provided document.
   * @example <caption>AnalyticsPlugin.getCount(analytics, slug)</caption>
   * const context = {
   *   config: {
   *     [AnalyticsPlugin.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * AnalyticsPlugin.getCount(analytics, slug);
   * @static
   */
  static getCount(analytics) {
    return (document, _context) => {
      debug('getCount');
      let count = 0;
      if (document && document.slug) {
        count = analytics.get(document.slug);
      }
      return count;
    };
  }

  /**
   * Wrapper function for calling update.
   * @param {import('./utilities/analytics-provider.js').default} analytics An AnalyticsProvider instance.
   * @returns {function(Record<string, AnalyticsPluginConfig>, import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>): Array<AnalyticsPluginPopularDocument>} The provided document.
   * @example <caption>AnalyticsPlugin.getPopularDocuments(analytics)</caption>
   * const context = {
   *   config: {
   *     [AnalyticsPlugin.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * AnalyticsPlugin.getPopularDocuments(analytics);
   * @static
   */
  static getPopularDocuments(analytics) {
    return (config, _context) => {
      debug('getPopularDocuments');
      /** @type {AnalyticsPluginPopularDocument[]} */
      let documents = [];
      const limit = (config && config[AnalyticsPlugin.configKey]?.limit) || 10;
      documents = analytics.getPopularDocuments(limit);
      return documents;
    };
  }
}

export default AnalyticsPlugin;
