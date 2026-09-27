import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import StorageProvider from './storeage-provider-json/storage-provider-file.js';

const debug = createDebug('Uttori.Plugin.StorageProvider.JSON');

/**
 * Uttori Storage Provider - JSON File
 * @example <caption>Plugin</caption>
 * const storage = StorageProviderJsonFile.callback(viewModel, context);
 */
class StorageProviderJsonFilePlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * In this case the key is `uttori-plugin-storage-provider-json-file`.
   *
   * @returns The configuration key.
   * @example <caption>Plugin.configKey</caption>
   * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
   */
  static get configKey(): 'uttori-plugin-storage-provider-json-file' {
    return 'uttori-plugin-storage-provider-json-file';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example <caption>Plugin.defaultConfig()</caption>
   * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig, 'contentDirectory' | 'historyDirectory' | 'extension' | 'updateTimestamps' | 'useHistory' | 'useCache' | 'events'> {
    return {
      contentDirectory: '',
      historyDirectory: '',
      extension: 'json',
      sidecarContentExtension: undefined,
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
   * @param context A Uttori-like context.
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
   */
  static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-storage-provider-json-file', import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig>) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config: import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    const storage = new StorageProvider(config);
    for (const [method, eventNames] of Object.entries(config.events)) {
      // Git-owned sidecar documents have no paired-write or history contract.
      if (config.sidecarContentExtension && ['add', 'update', 'delete', 'getHistory', 'getRevision'].includes(method)) {
        continue;
      }
      const storageMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(storage, method);
      if (storageMethod) {
        for (const event of eventNames) {

          const callback = storageMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }
}

export default StorageProviderJsonFilePlugin;
