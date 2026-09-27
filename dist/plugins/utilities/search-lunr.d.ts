import lunr from 'lunr';
import type { SearchLunrConfigSearchOptions } from '../../types/plugins/utilities/search-lunr.js';
export type { SearchLunrConfigSearchOptions } from '../../types/plugins/utilities/search-lunr.js';
/**
 * Uttori Search Provider powered by Lunr.js.
 * @example
 * ```js
 * const searchProvider = new SearchProvider();
 * const searchProvider = new SearchProvider({ lunr_locales: ['de', 'fr', 'jp'], lunrLocaleFunctions: [localeDe, localeFr, localeJp] });
 * ```
 */
declare class SearchProvider {
    /** The collection of search terms and their counts. */
    searchTerms: Record<string, number>;
    /** The Lunr instance. */
    index: lunr.Index | undefined;
    config: {
        ignoreSlugs: string[];
        lunr_locales: string[];
        lunrLocaleFunctions: ((lunrModule: typeof import('lunr')) => void)[];
        events?: Record<string, string[]>;
    };
    /**
     * Creates an instance of SearchProvider.
     * @param [config] - Configuration object for the class.
     */
    constructor(config?: import('../search-provider-lunr.js').SearchLunrConfig);
    /** Sets up the search provider with any `lunr_locales` supplied. */
    setup: () => void;
    /**
     * Rebuild the search index of documents.
     * @param _data Unused.
     * @param context A Uttori-like context.
     * @example
     * ```js
     * await searchProvider.buildIndex(_data, context);
     * ```
     */
    buildIndex: (_data: unknown, context: import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>) => Promise<void>;
    /**
     * Build the same Lunr index for server queries and offline static search.
     * @param documents Complete documents to index.
     * @returns A JSON-safe Lunr index for browser loading.
     */
    indexDocuments: (documents: import('../../wiki.js').UttoriWikiDocument[]) => object;
    /**
     * Searches for documents matching the provided query with Lunr.
     * @param options The passed in options.
     * @param context A Uttori-like context.
     * @returns Returns an array of search results no longer than limit.
     * @async
     */
    internalSearch: ({ query, limit }: SearchLunrConfigSearchOptions, context: import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>) => Promise<import('../../wiki.js').UttoriWikiDocument[]>;
    /**
     * External method for searching documents matching the provided query and updates the count for the query used.
     * Uses the `internalSearch` method internally.
     * @param options The passed in options.
     * @param context A Uttori-like context.
     * @returns Returns an array of search results no longer than limit.
     * @async
     * @example
     * ```js
     * searchProvider.search('matching');
     * ➜ [{ ref: 'first-matching-document', ... }, { ref: 'another-matching-document', ... }, ...]
     * ```
     */
    search: ({ query, limit }: SearchLunrConfigSearchOptions, context: import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>) => Promise<import('../../wiki.js').UttoriWikiDocument[]>;
    /**
     * Adds documents to the index.
     * For this implementation, it is rebuilding the index.
     * @param documents Unused. An array of documents to be indexed.
     * @param context A Uttori-like context.
     */
    indexAdd: (documents: import('../../wiki.js').UttoriWikiDocument[], context: import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>) => Promise<void>;
    /**
     * Updates documents in the index.
     * For this implementation, it is rebuilding the index.
     * @param documents Unused. An array of documents to be indexed.
     * @param context A Uttori-like context.
     */
    indexUpdate: (documents: import('../../wiki.js').UttoriWikiDocument[], context: import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>) => Promise<void>;
    /**
     * Removes documents from the index.
     * For this implementation, it is rebuilding the index.
     * @param documents Unused. An array of documents to be indexed.
     * @param context A Uttori-like context.
     */
    indexRemove: (documents: import('../../wiki.js').UttoriWikiDocument[], context: import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>) => Promise<void>;
    /**
     * Updates the search query in the query counts.
     * @param query The query to increment.
     */
    updateTermCount: (query: string) => void;
    /**
     * Returns the most popular search terms.
     * @param options The passed in options.
     * @returns Returns an array of search results no longer than limit.
     * @example
     * ```js
     * searchProvider.getPopularSearchTerms();
     * ➜ ['popular', 'cool', 'helpful']
     * ```
     */
    getPopularSearchTerms: ({ limit }: SearchLunrConfigSearchOptions) => string[];
}
export default SearchProvider;
//# sourceMappingURL=search-lunr.d.ts.map