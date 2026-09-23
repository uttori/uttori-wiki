export type StaticSiteRoute = {
    /**
     * Public root-relative URL. HTML routes end in `/`.
     */
    url: string;
    /**
     * Expected response status; use 404 for the not-found page.
     */
    status?: number;
    /**
     * Explicit relative output path, used for `404.html`.
     */
    output?: string;
    /**
     * Last content change in Unix milliseconds.
     */
    updateDate?: number;
};
export type StaticSiteAsset = {
    /**
     * Source file or directory to copy.
     */
    source: string;
    /**
     * Root-relative destination within the artifact.
     */
    target: string;
};
export type StaticSiteBuildOptions = {
    /**
     * Configured wiki Express application.
     */
    app: import('express').Application;
    /**
     * Finite public route list, including the search shell and 404 page.
     */
    routes: StaticSiteRoute[];
    /**
     * Directory to replace only after a complete build.
     */
    outputDirectory: string;
    /**
     * Explicit public assets to copy.
     */
    assets?: StaticSiteAsset[];
    /**
     * Public documents used by the existing Lunr indexer.
     */
    searchDocuments?: import('../wiki.js').UttoriWikiDocument[];
    /**
     * HTTP(S) origin for the sitemap. Omit only for local builds.
     */
    canonicalOrigin?: string;
};
/**
 * @typedef {object} StaticSiteRoute
 * @property {string} url Public root-relative URL. HTML routes end in `/`.
 * @property {number} [status=200] Expected response status; use 404 for the not-found page.
 * @property {string} [output] Explicit relative output path, used for `404.html`.
 * @property {number} [updateDate] Last content change in Unix milliseconds.
 */
/**
 * @typedef {object} StaticSiteAsset
 * @property {string} source Source file or directory to copy.
 * @property {string} target Root-relative destination within the artifact.
 */
/**
 * @typedef {object} StaticSiteBuildOptions
 * @property {import('express').Application} app Configured wiki Express application.
 * @property {StaticSiteRoute[]} routes Finite public route list, including the search shell and 404 page.
 * @property {string} outputDirectory Directory to replace only after a complete build.
 * @property {StaticSiteAsset[]} [assets] Explicit public assets to copy.
 * @property {import('../wiki.js').UttoriWikiDocument[]} [searchDocuments] Public documents used by the existing Lunr indexer.
 * @property {string} [canonicalOrigin] HTTP(S) origin for the sitemap. Omit only for local builds.
 */
/**
 * Export a configured Uttori Wiki app through its real HTTP routes and templates.
 * The temporary listener is loopback-only and is always closed, including on
 * render failures. The deployed artifact contains only the requested routes.
 */
declare class StaticSiteGenerator {
    static get configKey(): string;
    /** Plugin registration is intentionally inert; export is an explicit build operation. */
    static register(): void;
    /**
     * Map a URL to a safe directory-index path inside the staging tree.
     * @param {StaticSiteRoute} route Public route.
     * @returns {string} Relative output file path.
     */
    static outputPath(route: StaticSiteRoute): string;
    /**
     * Keep output destinations below staging even when supplied by a caller.
     * @param {string} destination Relative artifact path.
     * @returns {string} Normalized safe path.
     */
    static safeRelative(destination: string): string;
    /**
     * Fetch a page through the configured renderer, rejecting redirects and
     * mismatched status/content types before writing it to the artifact.
     * @param {string} origin Temporary loopback origin.
     * @param {StaticSiteRoute} route Route to render.
     * @returns {Promise<string>} Rendered HTML.
     */
    static capture(origin: string, route: StaticSiteRoute): Promise<string>;
    /**
     * Validate root-relative links, assets, and same-page fragments in emitted
     * HTML. External URLs remain the responsibility of their original source.
     * @param {Map<string, string>} pages URL-to-HTML map.
     * @param {string} staging Staging artifact directory.
     */
    static validateLinks(pages: Map<string, string>, staging: string): Promise<void>;
    /**
     * Build a complete static artifact and atomically promote it on success.
     * @param {StaticSiteBuildOptions} options Build inputs.
     * @returns {Promise<{ pages: number, assets: number }>} Output summary.
     */
    static build({ app, routes, outputDirectory, assets, searchDocuments, canonicalOrigin }: StaticSiteBuildOptions): Promise<{
        pages: number;
        assets: number;
    }>;
}
export default StaticSiteGenerator;
//# sourceMappingURL=static-site-generator.d.ts.map