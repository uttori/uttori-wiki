import type { StaticSiteRoute, StaticSiteBuildOptions } from '../types/plugins/static-site-generator.js';
export type { StaticSiteRoute, StaticSiteAsset, StaticSiteBuildOptions, } from '../types/plugins/static-site-generator.js';
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
     * @param route Public route.
     * @returns Relative output file path.
     */
    static outputPath(route: StaticSiteRoute): string;
    /**
     * Keep output destinations below staging even when supplied by a caller.
     * @param destination Relative artifact path.
     * @returns Normalized safe path.
     */
    static safeRelative(destination: string): string;
    /**
     * Fetch a page through the configured renderer, rejecting redirects and
     * mismatched status/content types before writing it to the artifact.
     * @param origin Temporary loopback origin.
     * @param route Route to render.
     * @returns Rendered HTML.
     */
    static capture(origin: string, route: StaticSiteRoute): Promise<string>;
    /**
     * Validate root-relative links, assets, and same-page fragments in emitted
     * HTML. External URLs remain the responsibility of their original source.
     * @param pages URL-to-HTML map.
     * @param staging Staging artifact directory.
     */
    static validateLinks(pages: Map<string, string>, staging: string): Promise<void>;
    /**
     * Build a complete static artifact and atomically promote it on success.
     * @param options Build inputs.
     * @returns Output summary.
     */
    static build({ app, routes, outputDirectory, assets, searchDocuments, canonicalOrigin }: StaticSiteBuildOptions): Promise<{
        pages: number;
        assets: number;
    }>;
}
export default StaticSiteGenerator;
//# sourceMappingURL=static-site-generator.d.ts.map