export interface AnalyticsProviderConfig {
    /** The directory to store the JSON file containing the page view analytics. */
    directory: string;
    /** The file name of the file containing the page view analytics. */
    name?: string;
    /** The file extension of the file containing the page view analytics. */
    extension?: string;
}
export type AnalyticsProviderPageVisits = Record<string, number>;
//# sourceMappingURL=analytics-provider.d.ts.map