import StorageProvider from './storeage-provider-json/storage-provider-file.js';

let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.StorageProvider.JSON'); } catch {}

/**
 * Uttori Storage Provider - JSON File
 * @example <caption>Plugin</caption>
 * const storage = StorageProviderJsonFile.callback(viewModel, context);
 * @class
 */
class StorageProviderJsonFilePlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * In this case the key is `uttori-plugin-storage-provider-json-file`.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>Plugin.configKey</caption>
   * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-storage-provider-json-file';
  }

  /**
   * The default configuration.
   * @returns {import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig} The configuration.
   * @example <caption>Plugin.defaultConfig()</caption>
   * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      contentDirectory: '',
      historyDirectory: '',
      extension: 'json',
      updateTimestamps: true,
      useHistory: true,
      useCache: true,
      spacesDocument: undefined,
      spacesHistory: undefined,
      events: {
        add: ['storage-add'],
        delete: ['storage-delete'],
        get: ['storage-get'],
        getHistory: ['storage-get-history'],
        getRevision: ['storage-get-revision'],
        getQuery: ['storage-query'],
        update: ['storage-update'],
        validateConfig: ['validate-config'],
      },
    };
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-storage-provider-json-file', import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig>} context A Uttori-like context.
   * @example <caption>StorageProviderJsonFilePlugin.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [StorageProviderJsonFilePlugin.configKey]: {
   *       ...,
   *       events: {
   *         add: ['storage-add'],
   *         delete: ['storage-delete'],
   *         get: ['storage-get'],
   *         getHistory: ['storage-get-history'],
   *         getRevision: ['storage-get-revision'],
   *         getQuery: ['storage-query'],
   *         update: ['storage-update'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * StorageProviderJsonFilePlugin.register(context);
   * @static
   */
  static register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig} */
    const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    const storage = new StorageProvider(config);
    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof storage[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = storage[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }
}

export default StorageProviderJsonFilePlugin;
