export default StorageProviderJsonMemoryPlugin;
/**
 * Uttori Storage Provider - JSON Memory
 * @example <caption>StorageProviderJsonMemoryPlugin</caption>
 * const storage = StorageProviderJsonMemoryPlugin.callback(viewModel, context);
 * @class
 */
declare class StorageProviderJsonMemoryPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * In this case the key is `uttori-plugin-storage-provider-json-memory`.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>StorageProviderJsonMemoryPlugin.configKey</caption>
     * const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {import('./storeage-provider-json/storage-provider-memory.js').StorageProviderConfig} The configuration.
     * @example <caption>Plugin.defaultConfig()</caption>
     * const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
     * @static
     */
    static defaultConfig(): import("./storeage-provider-json/storage-provider-memory.js").StorageProviderConfig;
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
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-storage-provider-json-memory", import("../plugins/storeage-provider-json/storage-provider-memory.js").StorageProviderConfig>): void;
}
//# sourceMappingURL=storage-provider-json-memory.d.ts.map