import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import StorageProvider from './storeage-provider-json/storage-provider-memory.js';
const debug = createDebug('Uttori.Plugin.StorageProvider.JSON.Memory');
/**
 * Uttori Storage Provider - JSON Memory
 * @example <caption>StorageProviderJsonMemoryPlugin</caption>
 * const storage = StorageProviderJsonMemoryPlugin.callback(viewModel, context);
 */
class StorageProviderJsonMemoryPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * In this case the key is `uttori-plugin-storage-provider-json-memory`.
     *
     * @returns The configuration key.
     * @example <caption>StorageProviderJsonMemoryPlugin.configKey</caption>
     * const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
     */
    static get configKey() {
        return 'uttori-plugin-storage-provider-json-memory';
    }
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>Plugin.defaultConfig()</caption>
     * const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
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
     * @param context A Uttori-like context.
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
     */
    static register(context) {
        debug('register');
        if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
            throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
        }
        const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
        if (!config.events) {
            throw new Error('Missing events to listen to for in \'config.events\'.');
        }
        const storage = new StorageProvider(config);
        for (const [method, eventNames] of Object.entries(config.events)) {
            const storageMethod = getPluginMethod(storage, method);
            if (storageMethod) {
                for (const event of eventNames) {
                    const callback = storageMethod;
                    context.hooks.on(event, callback);
                }
            }
            else {
                debug(`Missing function "${method}"`);
            }
        }
    }
}
export default StorageProviderJsonMemoryPlugin;
//# sourceMappingURL=storage-provider-json-memory.js.map