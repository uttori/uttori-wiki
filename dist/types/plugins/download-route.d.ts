export interface DownloadRouterConfig {
    /** Events to bind to. */
    events?: Record<string, string[]>;
    /** Directory files will be downloaded from. */
    basePath: string;
    /** Server route to GET uploads from. */
    publicRoute: string;
    /**
     * When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an rmpty array don't check at all.
     */
    allowedReferrers: string[];
    /** Custom Middleware for the Upload route */
    middleware: import('express').RequestHandler[];
}
//# sourceMappingURL=download-route.d.ts.map