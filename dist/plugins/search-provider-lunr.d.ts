export default SearchLunrPlugin;
export type LunrLocale = Function;
export type SearchLunrConfig = {
    /**
     * A list of locales to add support for from lunr-languages.
     */
    lunr_locales?: string[];
    /**
     * A list of locales to add support for from lunr-languages.
     */
    lunrLocaleFunctions?: LunrLocale[];
    /**
     * A list of slugs to not consider when indexing documents.
     */
    ignoreSlugs?: string[];
    /**
     * The events to listen for.
     */
    events?: Record<string, string[]>;
};
/**
 * @typedef {Function} LunrLocale
 * @param {lunr} lunr The Lunr instance.
 */
/**
 * @typedef {object} SearchLunrConfig
 * @property {string[]} [lunr_locales] A list of locales to add support for from lunr-languages.
 * @property {LunrLocale[]} [lunrLocaleFunctions] A list of locales to add support for from lunr-languages.
 * @property {string[]} [ignoreSlugs] A list of slugs to not consider when indexing documents.
 * @property {Record<string, string[]>} [events] The events to listen for.
 */
/**
 * Uttori Search Provider - Lunr, Uttori Plugin Adapter
 * @example
 * ```js
 * const search = Plugin.callback(viewModel, context);
 * ```
 * @class
 */
declare class SearchLunrPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example
     * ```js
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * ```
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {SearchLunrConfig} The configuration.
     * @example
     * ```js
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * ```
     * @static
     */
    static defaultConfig(): SearchLunrConfig;
    /**
     * Validates the provided configuration for required entries and types.
     * @param {Record<string, SearchLunrConfig>} config A provided configuration to use.
     */
    static validateConfig(config: Record<string, SearchLunrConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', SearchLunrConfig>} context A Uttori-like context.
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
     *         getPopularSearchTerms: ['popular-search-terms'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * Plugin.register(context);
     * ```
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-lunr", SearchLunrConfig>): Promise<void>;
}
//# sourceMappingURL=search-provider-lunr.d.ts.map