import type { SearchSQLiteConfig } from '../types/plugins/search-provider-sqlite.js';
export type { SearchSQLiteEmbedPrompt, SearchSQLiteExtractAttachmentText, SearchSQLiteConfig, RetrievedChunk, RetrieveResponse, FtsRow, Block, IndexedBlock, ChunkWithMeta, BlendedChunk, ResolvedSearchSQLiteConfig, } from '../types/plugins/search-provider-sqlite.js';
/**
 * Uttori Search Provider - SQLite, Uttori Plugin Adapter.
 *
 * @example
 * ```js
 * const search = SearchSQLitePlugin.callback(viewModel, context);
 * ```
 */
declare class SearchSQLitePlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     *
     * @returns The configuration key.
     * @example
     * ```js
     * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
     * ```
     */
    static get configKey(): 'uttori-plugin-search-provider-sqlite';
    /**
     * The default configuration.
     *
     * @returns The configuration.
     * @example
     * ```js
     * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
     * ```
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<SearchSQLiteConfig, 'events' | 'databasePath' | 'databaseOptions' | 'updateTimestamps' | 'useHistory' | 'ollamaBaseUrl' | 'embedModel' | 'embedPrompt' | 'chunkLimit' | 'hybrid' | 'fts' | 'ftsWeight' | 'titleBoost' | 'textBoost' | 'ftsWeightBump' | 'maxContextTokens' | 'maxPerSource' | 'batch' | 'ignoreSlugs' | 'ignoreTags' | 'bootstrapIndexOnStartup' | 'rebuildIndexOnStartup' | 'attachmentsRoot' | 'includeAttachments' | 'markdownItPluginConfig' | 'tableToCSV' | 'tableMaxRowsPerChunk' | 'tableMaxTokensPerChunk'>;
    /**
     * Validates the provided configuration for required entries and types.
     *
     * @param config A provided configuration to use.
     * @example
     * ```js
     * SearchSQLitePlugin.validateConfig({ ... });
     * ```
     */
    static validateConfig(config: Record<string, SearchSQLiteConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     *
     * @param context A Uttori-like context.
     * @example
     * ```js
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [SearchSQLitePlugin.configKey]: {
     *       events: {
     *         search: ['search-query'],
     *         buildIndex: ['search-rebuild'],
     *         indexAdd: ['search-add'],
     *         indexUpdate: ['search-update'],
     *         indexRemove: ['search-remove'],
     *         retrieve: ['search-retrieve'],
     *         listDocuments: ['search-documents'],
     *         getPopularSearchTerms: ['search-popular-terms'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * SearchSQLitePlugin.register(context);
     * ```
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-sqlite', SearchSQLiteConfig>): Promise<void>;
}
export default SearchSQLitePlugin;
//# sourceMappingURL=search-provider-sqlite.d.ts.map