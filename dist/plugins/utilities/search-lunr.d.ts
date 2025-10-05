export default SearchProvider;
export type SearchLunrConfigSearchOptions = {
    /**
     * The value to search for.
     */
    query: string;
    /**
     * Limit for the number of returned documents.
     */
    limit?: number;
};
/**
 * @typedef {object} SearchLunrConfigSearchOptions
 * @property {string} query The value to search for.
 * @property {number} [limit] Limit for the number of returned documents.
 */
/**
 * Uttori Search Provider powered by Lunr.js.
 * @class
 * @property {object} searchTerms - The collection of search terms and their counts.
 * @property {lunr.Index} index - The Lunr instance.
 * @example
 * ```js
 * const searchProvider = new SearchProvider();
 * const searchProvider = new SearchProvider({ lunr_locales: ['de', 'fr', 'jp'], lunrLocaleFunctions: [localeDe, localeFr, localeJp] });
 * ```
 */
declare class SearchProvider {
    /**
     * Creates an instance of SearchProvider.
     * @class
     * @param {import('../search-provider-lunr.js').SearchLunrConfig} [config] - Configuration object for the class.
     */
    constructor(config?: import("../search-provider-lunr.js").SearchLunrConfig);
    searchTerms: {};
    /** @type {lunr.Index} */
    index: lunr.Index;
    config: {
        /**
         * A list of locales to add support for from lunr-languages.
         */
        lunr_locales: string[];
        /**
         * A list of locales to add support for from lunr-languages.
         */
        lunrLocaleFunctions: import("../search-provider-lunr.js").LunrLocale[];
        /**
         * A list of slugs to not consider when indexing documents.
         */
        ignoreSlugs: string[];
        /**
         * The events to listen for.
         */
        events?: Record<string, string[]>;
    };
    /**
     * Sets up the search provider with any `lunr_locales` supplied.
     */
    setup: () => void;
    /**
     * Rebuild the search index of documents.
     * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
     * @example
     * ```js
     * await searchProvider.buildIndex(context);
     * ```
     */
    buildIndex: (context: import("../../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-lunr", import("../search-provider-lunr.js").SearchLunrConfig>) => Promise<void>;
    /**
     * Searches for documents matching the provided query with Lunr.
     * @param {SearchLunrConfigSearchOptions} options The passed in options.
     * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} Returns an array of search results no longer than limit.
     * @async
     */
    internalSearch: ({ query, limit }: SearchLunrConfigSearchOptions, context: import("../../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-lunr", import("../search-provider-lunr.js").SearchLunrConfig>) => Promise<import("../../wiki.js").UttoriWikiDocument[]>;
    /**
     * External method for searching documents matching the provided query and updates the count for the query used.
     * Uses the `internalSearch` method internally.
     * @param {SearchLunrConfigSearchOptions} options The passed in options.
     * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
     * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} Returns an array of search results no longer than limit.
     * @async
     * @example
     * ```js
     * searchProvider.search('matching');
     * ➜ [{ ref: 'first-matching-document', ... }, { ref: 'another-matching-document', ... }, ...]
     * ```
     */
    search: ({ query, limit }: SearchLunrConfigSearchOptions, context: import("../../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-lunr", import("../search-provider-lunr.js").SearchLunrConfig>) => Promise<import("../../wiki.js").UttoriWikiDocument[]>;
    /**
     * Adds documents to the index.
     * For this implementation, it is rebuilding the index.
     * @param {import('../../wiki.js').UttoriWikiDocument[]} documents Unused. An array of documents to be indexed.
     * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
     */
    indexAdd: (documents: import("../../wiki.js").UttoriWikiDocument[], context: import("../../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-lunr", import("../search-provider-lunr.js").SearchLunrConfig>) => Promise<void>;
    /**
     * Updates documents in the index.
     * For this implementation, it is rebuilding the index.
     * @param {import('../../wiki.js').UttoriWikiDocument[]} documents Unused. An array of documents to be indexed.
     * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
     */
    indexUpdate: (documents: import("../../wiki.js").UttoriWikiDocument[], context: import("../../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-lunr", import("../search-provider-lunr.js").SearchLunrConfig>) => Promise<void>;
    /**
     * Removes documents from the index.
     * For this implementation, it is rebuilding the index.
     * @param {import('../../wiki.js').UttoriWikiDocument[]} documents Unused. An array of documents to be indexed.
     * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
     */
    indexRemove: (documents: import("../../wiki.js").UttoriWikiDocument[], context: import("../../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-lunr", import("../search-provider-lunr.js").SearchLunrConfig>) => Promise<void>;
    /**
     * Updates the search query in the query counts.
     * @param {string} query The query to increment.
     */
    updateTermCount: (query: string) => void;
    /**
     * Returns the most popular search terms.
     * @param {SearchLunrConfigSearchOptions} options The passed in options.
     * @returns {string[]} Returns an array of search results no longer than limit.
     * @example
     * ```js
     * searchProvider.getPopularSearchTerms();
     * ➜ ['popular', 'cool', 'helpful']
     * ```
     */
    getPopularSearchTerms: ({ limit }: SearchLunrConfigSearchOptions) => string[];
}
import lunr from 'lunr';
//# sourceMappingURL=search-lunr.d.ts.map