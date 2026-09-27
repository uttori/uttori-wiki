/**
 * Uttori Storage Provider - JSON File
 * @example <caption>Plugin</caption>
 * const storage = StorageProviderJsonFile.callback(viewModel, context);
 */
declare class StorageProviderJsonFilePlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * In this case the key is `uttori-plugin-storage-provider-json-file`.
     *
     * @returns The configuration key.
     * @example <caption>Plugin.configKey</caption>
     * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
     */
    static get configKey(): 'uttori-plugin-storage-provider-json-file';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>Plugin.defaultConfig()</caption>
     * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig, 'contentDirectory' | 'historyDirectory' | 'extension' | 'updateTimestamps' | 'useHistory' | 'useCache' | 'events'>;
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
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-storage-provider-json-file', import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig>): void;
}
export default StorageProviderJsonFilePlugin;
//# sourceMappingURL=storage-provider-json-file.d.ts.map