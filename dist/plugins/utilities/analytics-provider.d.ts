export default AnalyticsProvider;
export type AnalyticsProviderConfig = {
    /**
     * The directory to store the JSON file containing the page view analytics.
     */
    directory: string;
    /**
     * The file name of the file containing the page view analytics.
     */
    name?: string;
    /**
     * The file extension of the file containing the page view analytics.
     */
    extension?: string;
};
export type AnalyticsProviderPageVisits = {
    /**
     * The slug of the document to be updated.
     */
    slug: string;
    /**
     * The number of hits for a given slug.
     */
    count: number;
};
/**
 * @typedef {object} AnalyticsProviderConfig
 * @property {string} directory The directory to store the JSON file containing the page view analytics.
 * @property {string} [name] The file name of the file containing the page view analytics.
 * @property {string} [extension] The file extension of the file containing the page view analytics.
 */
/**
 * @typedef {object} AnalyticsProviderPageVisits
 * @property {string} slug The slug of the document to be updated.
 * @property {number} count The number of hits for a given slug.
 */
/**
 * Page view analytics for Uttori documents using JSON files stored on the local file system.
 * @property {AnalyticsProviderConfig} config The configuration object.
 * @property {AnalyticsProviderPageVisits} pageVisits The page visits object.
 * @example <caption>Init AnalyticsProvider</caption>
 * const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
 * @class
 */
declare class AnalyticsProvider {
    /**
     * Creates an instance of AnalyticsProvider.
     * @param {AnalyticsProviderConfig} config A configuration object.
     * @class
     */
    constructor(config: AnalyticsProviderConfig);
    config: {
        /**
         * The directory to store the JSON file containing the page view analytics.
         */
        directory: string;
        /**
         * The file name of the file containing the page view analytics.
         */
        name: string;
        /**
         * The file extension of the file containing the page view analytics.
         */
        extension: string;
    };
    /** @type {AnalyticsProviderPageVisits} */
    pageVisits: AnalyticsProviderPageVisits;
    /**
     * Updates the view count for a given document slug.
     * @param {string} slug The slug of the document to be updated.
     * @param {string} [value] An optional value to set the count to exactly.
     * @returns {number} The number of hits for a given slug after updating.
     */
    update(slug: string, value?: string): number;
    /**
     * Returns the view count for a given document slug.
     * @param {string} slug The slug of the document to be looked up.
     * @returns {number} View count for the given slug.
     * @example
     * analyticsProvider.get('faq');
     * ➜ 10
     */
    get(slug: string): number;
    /**
     * Returns the most popular documents.
     * @param {number} limit The number of documents to return.
     * @returns {{ slug: string; count: number; }[]} View count for the given slug.
     * @example
     * analyticsProvider.getPopularDocuments(10);
     * ➜ [ { slug: 'faq', count: 10 } ]
     */
    getPopularDocuments(limit: number): {
        slug: string;
        count: number;
    }[];
}
//# sourceMappingURL=analytics-provider.d.ts.map