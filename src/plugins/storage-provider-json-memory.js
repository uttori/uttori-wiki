import StorageProvider from './storeage-provider-json/storage-provider-memory.js';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.StorageProvider.JSON.Memory'); } catch {}

/**
 * Uttori Storage Provider - JSON Memory
 * @example <caption>StorageProviderJsonMemoryPlugin</caption>
 * const storage = StorageProviderJsonMemoryPlugin.callback(viewModel, context);
 * @class
 */
class StorageProviderJsonMemoryPlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * In this case the key is `uttori-plugin-storage-provider-json-memory`.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>StorageProviderJsonMemoryPlugin.configKey</caption>
   * const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-storage-provider-json-memory';
  }

  /**
   * The default configuration.
   * @returns {import('./storeage-provider-json/storage-provider-memory.js').StorageProviderConfig} The configuration.
   * @example <caption>Plugin.defaultConfig()</caption>
   * const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      events: {
        add: ['storage-add'],
        delete: ['storage-delete'],
        get: ['storage-get'],
        getHistory: ['storage-get-history'],
        getRevision: ['storage-get-revision'],
        getQuery: ['storage-query'],
        update: ['storage-update'],
      },
    };
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-storage-provider-json-memory', import('../plugins/storeage-provider-json/storage-provider-memory.js').StorageProviderConfig>} context A Uttori-like context.
   * @example <caption>StorageProviderJsonMemoryPlugin.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [StorageProviderJsonMemoryPlugin.configKey]: {
   *       ...,
   *       events: {
   *         add: ['storage-add'],
   *         delete: ['storage-delete'],
   *         get: ['storage-get'],
   *         getHistory: ['storage-get-history'],
   *         getRevision: ['storage-get-revision'],
   *         getQuery: ['storage-query'],
   *         update: ['storage-update'],
   *       },
   *     },
   *   },
   * };
   * StorageProviderJsonMemoryPlugin.register(context);
   * @static
   */
  static register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {import('./storeage-provider-json/storage-provider-memory.js').StorageProviderConfig} */
    const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
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

export default StorageProviderJsonMemoryPlugin;
