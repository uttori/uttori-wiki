import type { AnalyticsProviderConfig, AnalyticsProviderPageVisits } from '../../types/plugins/utilities/analytics-provider.js';
export type { AnalyticsProviderConfig, AnalyticsProviderPageVisits, } from '../../types/plugins/utilities/analytics-provider.js';
/**
 * Page view analytics for Uttori documents using JSON files stored on the local file system.
 * @example <caption>Init AnalyticsProvider</caption>
 * const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
 */
declare class AnalyticsProvider {
    /** The configuration object. */
    config: Required<AnalyticsProviderConfig>;
    /** The page visits object. */
    pageVisits: AnalyticsProviderPageVisits;
    /**
     * Creates an instance of AnalyticsProvider.
     * @param config A configuration object.
     */
    constructor(config: AnalyticsProviderConfig);
    /**
     * Updates the view count for a given document slug.
     * @param slug The slug of the document to be updated.
     * @param [value] An optional value to set the count to exactly.
     * @returns The number of hits for a given slug after updating.
     */
    update(slug: string, value?: string): number;
    /**
     * Returns the view count for a given document slug.
     * @param slug The slug of the document to be looked up.
     * @returns View count for the given slug.
     * @example
     * analyticsProvider.get('faq');
     * ➜ 10
     */
    get(slug: string): number;
    /**
     * Returns the most popular documents.
     * @param limit The number of documents to return.
     * @returns View count for the given slug.
     * @example
     * analyticsProvider.getPopularDocuments(10);
     * ➜ [ { slug: 'faq', count: 10 } ]
     */
    getPopularDocuments(limit: number): {
        slug: string;
        count: number;
    }[];
}
export default AnalyticsProvider;
//# sourceMappingURL=analytics-provider.d.ts.map