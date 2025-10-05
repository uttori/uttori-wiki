export default StorageProviderJsonFilePlugin;
/**
 * Uttori Storage Provider - JSON File
 * @example <caption>Plugin</caption>
 * const storage = StorageProviderJsonFile.callback(viewModel, context);
 * @class
 */
declare class StorageProviderJsonFilePlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * In this case the key is `uttori-plugin-storage-provider-json-file`.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>Plugin.configKey</caption>
     * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig} The configuration.
     * @example <caption>Plugin.defaultConfig()</caption>
     * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
     * @static
     */
    static defaultConfig(): import("../plugins/storeage-provider-json/storage-provider-file.js").StorageProviderJsonFileConfig;
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
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-storage-provider-json-file", import("../plugins/storeage-provider-json/storage-provider-file.js").StorageProviderJsonFileConfig>): void;
}
//# sourceMappingURL=storage-provider-json-file.d.ts.map