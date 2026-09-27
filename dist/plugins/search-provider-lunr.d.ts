import type { SearchLunrConfig } from '../types/plugins/search-provider-lunr.js';
export type { LunrLocale, SearchLunrConfig } from '../types/plugins/search-provider-lunr.js';
/**
 * Uttori Search Provider - Lunr, Uttori Plugin Adapter
 * @example
 * ```js
 * const search = Plugin.callback(viewModel, context);
 * ```
 */
declare class SearchLunrPlugin {
    /**
     * Export the provider's actual indexing logic for a static browser search.
     * @param documents Public documents.
     * @returns A serialized Lunr index.
     */
    static exportIndex(documents: import('../wiki.js').UttoriWikiDocument[]): object;
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example
     * ```js
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * ```
     */
    static get configKey(): 'uttori-plugin-search-provider-lunr';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example
     * ```js
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * ```
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<SearchLunrConfig, 'ignoreSlugs' | 'lunr_locales' | 'events'>;
    /**
     * Validates the provided configuration for required entries and types.
     * @param config A provided configuration to use.
     */
    static validateConfig(config: Record<string, SearchLunrConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
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
     *         getPopularSearchTerms: ['search-popular-terms'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * Plugin.register(context);
     * ```
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', SearchLunrConfig>): Promise<void>;
}
export default SearchLunrPlugin;
//# sourceMappingURL=search-provider-lunr.d.ts.map