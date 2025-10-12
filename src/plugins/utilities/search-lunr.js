import lunr from 'lunr';
import lunrMulti from 'lunr-languages/lunr.multi.js';
import stemmerSupport from 'lunr-languages/lunr.stemmer.support.js';

let debug = (..._) => {};
/* c8 ignore next 1 */
try { const { default: d } = await import('debug'); debug = d('Uttori.SearchProvider.Lunr'); } catch {}

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
class SearchProvider {
  /**
   * Creates an instance of SearchProvider.
   * @class
   * @param {import('../search-provider-lunr.js').SearchLunrConfig} [config] - Configuration object for the class.
   */
  constructor(config = {}) {
    debug('constructor');
    this.searchTerms = {};
    /** @type {lunr.Index} */
    this.index = undefined;

    this.config = {
      ignoreSlugs: [],
      lunr_locales: [],
      lunrLocaleFunctions: [],
      ...config,
    };

    this.setup();
  }

  /**
   * Sets up the search provider with any `lunr_locales` supplied.
   */
  setup = () => {
    // Check for additional locale support.
    if (this.config.lunrLocaleFunctions.length > 0) {
      stemmerSupport(lunr);
      lunrMulti(lunr);
      for (const locale of this.config.lunrLocaleFunctions) {
        locale(lunr);
      }
    }
  };

  /**
   * Rebuild the search index of documents.
   * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
   * @example
   * ```js
   * await searchProvider.buildIndex(context);
   * ```
   */
  buildIndex = async (context) => {
    if (!context || !context.hooks || !context.hooks.fetch) {
      debug('buildIndex: context or hooks missing');
      return;
    }
    debug('buildIndex');
    const { lunr_locales, ignoreSlugs } = this.config;
    /** @type {import('../../wiki.js').UttoriWikiDocument[]} */
    let documents = [];
    const not_in = `"${ignoreSlugs.join('", "')}"`;
    const query = `SELECT 'slug', 'title', 'tags', 'content' FROM documents WHERE slug NOT_IN (${not_in}) ORDER BY title ASC LIMIT 10000`;
    try {
      [documents] = await context.hooks.fetch('storage-query', query, context);
    } /* c8 ignore next 3 */ catch (error) {
      debug('Error:', error);
    }

    if (!Array.isArray(documents)) {
      debug('Documents Error: documents was not an array', typeof documents);
      return;
    }

    this.index = lunr(function lunrSetup() {
      // @ts-expect-error multiLanguage is not typed
      if (Array.isArray(lunr_locales) && lunr_locales.length > 0 && lunr?.multiLanguage) {
        // @ts-expect-error multiLanguage is not typed
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.use(lunr.multiLanguage(...lunr_locales));
      }

      this.field('title');
      this.field('content');
      this.field('tags', { boost: 100 });
      this.ref('slug');

      debug('buildIndex: indexing total:', documents.length);
      for (const document of documents) {
        debug('buildIndex: indexing document:', document.slug);
        this.add(document);
      }
    });
  };

  /**
   * Searches for documents matching the provided query with Lunr.
   * @param {SearchLunrConfigSearchOptions} options The passed in options.
   * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
   * @returns {Promise<import('../../wiki.js').UttoriWikiDocument[]>} Returns an array of search results no longer than limit.
   * @async
   */
  internalSearch = async ({ query, limit = 100 }, context) => {
    debug('internalSearch:', { query, limit });
    const results = this.index.search(query);
    debug('internalSearch: results:', results.length);

    const slugs = results.map((r) => r.ref).filter(Boolean).slice(0, limit);
    if (slugs.length === 0) {
      debug('internalSearch: no results found');
      return [];
    }

    // Find the full documents from the slugs returned.
    const { ignoreSlugs } = this.config;
    /** @type {import('../../wiki.js').UttoriWikiDocument[]} */
    let documents = [];
    const not_in = `"${ignoreSlugs.join('", "')}"`;
    const slug_in = `"${slugs.join('", "')}"`;
    const fetch_query = `SELECT * FROM documents WHERE slug NOT_IN (${not_in}) AND slug in (${slug_in}) ORDER BY title ASC LIMIT 10000`;
    try {
      [documents] = await context.hooks.fetch('storage-query', fetch_query, context);
      debug('internalSearch: indexable documents:', documents.length);
    } /* c8 ignore next 3 */ catch (error) {
      debug('internalSearch: error:', error);
    }

    return documents;
  };

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
  search = async ({ query, limit = 100 }, context) => {
    debug('search', query, limit);
    this.updateTermCount(query);
    return this.internalSearch({ query, limit }, context);
  };

  /**
   * Adds documents to the index.
   * For this implementation, it is rebuilding the index.
   * @param {import('../../wiki.js').UttoriWikiDocument[]} documents Unused. An array of documents to be indexed.
   * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
   */
  indexAdd = async (documents, context) => {
    debug('indexAdd');
    await this.buildIndex(context);
  };

  /**
   * Updates documents in the index.
   * For this implementation, it is rebuilding the index.
   * @param {import('../../wiki.js').UttoriWikiDocument[]} documents Unused. An array of documents to be indexed.
   * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
   */
  indexUpdate = async (documents, context) => {
    debug('indexUpdate');
    await this.buildIndex(context);
  };

  /**
   * Removes documents from the index.
   * For this implementation, it is rebuilding the index.
   * @param {import('../../wiki.js').UttoriWikiDocument[]} documents Unused. An array of documents to be indexed.
   * @param {import('../../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', import('../search-provider-lunr.js').SearchLunrConfig>} context A Uttori-like context.
   */
  indexRemove = async (documents, context) => {
    debug('indexRemove', documents);
    await this.buildIndex(context);
  };

  /**
   * Updates the search query in the query counts.
   * @param {string} query The query to increment.
   */
  updateTermCount = (query) => {
    debug('updateTermCount:', query);
    if (!query) return;
    if (this.searchTerms[query]) {
      this.searchTerms[query]++;
    } else {
      this.searchTerms[query] = 1;
    }
  };

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
  getPopularSearchTerms = ({ limit = 10 }) => {
    debug('getPopularSearchTerms:', { limit });
    const output = Object.keys(this.searchTerms).sort((a, b) => (this.searchTerms[b] - this.searchTerms[a])).slice(0, limit);
    debug('getPopularSearchTerms:', output);
    return output;
  };
}

export default SearchProvider;
