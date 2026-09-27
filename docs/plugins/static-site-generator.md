<a name="StaticSiteGenerator"></a>

## StaticSiteGenerator
Export a configured Uttori Wiki app through its real HTTP routes and templates.
The temporary listener is loopback-only and is always closed, including on
render failures. The deployed artifact contains only the requested routes.

**Kind**: global class\

* [StaticSiteGenerator](#StaticSiteGenerator)
    * [.register()](#StaticSiteGenerator.register)
    * [.outputPath(route)](#StaticSiteGenerator.outputPath) ⇒
    * [.safeRelative(destination)](#StaticSiteGenerator.safeRelative) ⇒
    * [.capture(origin, route)](#StaticSiteGenerator.capture) ⇒
    * [.validateLinks(pages, staging)](#StaticSiteGenerator.validateLinks)
    * [.build(options)](#StaticSiteGenerator.build) ⇒

<a name="StaticSiteGenerator.register"></a>

### StaticSiteGenerator.register()
Plugin registration is intentionally inert; export is an explicit build operation.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)\
<a name="StaticSiteGenerator.outputPath"></a>

### StaticSiteGenerator.outputPath(route) ⇒
Map a URL to a safe directory-index path inside the staging tree.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)\
**Returns**: Relative output file path.\

| Param | Description |
| --- | --- |
| route | Public route. |

<a name="StaticSiteGenerator.safeRelative"></a>

### StaticSiteGenerator.safeRelative(destination) ⇒
Keep output destinations below staging even when supplied by a caller.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)\
**Returns**: Normalized safe path.\

| Param | Description |
| --- | --- |
| destination | Relative artifact path. |

<a name="StaticSiteGenerator.capture"></a>

### StaticSiteGenerator.capture(origin, route) ⇒
Fetch a page through the configured renderer, rejecting redirects and
mismatched status/content types before writing it to the artifact.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)\
**Returns**: Rendered HTML.\

| Param | Description |
| --- | --- |
| origin | Temporary loopback origin. |
| route | Route to render. |

<a name="StaticSiteGenerator.validateLinks"></a>

### StaticSiteGenerator.validateLinks(pages, staging)
Validate root-relative links, assets, and same-page fragments in emitted
HTML. External URLs remain the responsibility of their original source.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)\

| Param | Description |
| --- | --- |
| pages | URL-to-HTML map. |
| staging | Staging artifact directory. |

<a name="StaticSiteGenerator.build"></a>

### StaticSiteGenerator.build(options) ⇒
Build a complete static artifact and atomically promote it on success.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)\
**Returns**: Output summary.\

| Param | Description |
| --- | --- |
| options | Build inputs. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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

export interface StaticSiteRoute {
    /** Public root-relative URL. HTML routes end in `/`. */
    url: string;
    /** Expected response status; use 404 for the not-found page. */
    status?: number;
    /** Explicit relative output path, used for `404.html`. */
    output?: string;
    /** Last content change in Unix milliseconds. */
    updateDate?: number;
}
export interface StaticSiteAsset {
    /** Source file or directory to copy. */
    source: string;
    /** Root-relative destination within the artifact. */
    target: string;
}
export interface StaticSiteBuildOptions {
    /** Configured wiki Express application. */
    app: import('express').Application;
    /** Finite public route list, including the search shell and 404 page. */
    routes: StaticSiteRoute[];
    /** Directory to replace only after a complete build. */
    outputDirectory: string;
    /** Explicit public assets to copy. */
    assets?: StaticSiteAsset[];
    /** Public documents used by the existing Lunr indexer. */
    searchDocuments?: import('../../wiki.js').UttoriWikiDocument[];
    /** HTTP(S) origin for the sitemap. Omit only for local builds. */
    canonicalOrigin?: string;
}
```

</details>
