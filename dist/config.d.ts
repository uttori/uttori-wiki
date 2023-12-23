export default config;
export type UttoriWikiConfig = {
    /**
     * Useful for development environments.
     */
    production?: boolean;
    /**
     * Slug of the root `/` page document.
     */
    homePage?: string;
    /**
     * Slugs to ignore in search & filtered documents, default is 'home-page';
     */
    ignoreSlugs: string[];
    /**
     * Tags to ignore when generating the tags page, default is an empty array;
     */
    ignoreTags: string[];
    /**
     * Excerpt length, used in search result previews.
     */
    excerptLength?: number;
    /**
     * Application base URL. Used for canonical URLs and redirects, do not include a trailing slash.
     */
    publicUrl?: string;
    /**
     * The object containing the route strings for search & tags.
     */
    routes: Record<string, string>;
    /**
     * The object containing the default titles for search & tags.
     */
    titles: Record<string, string>;
    /**
     * Specify the path to the theme directory, no trailing slash.
     */
    themePath?: string;
    /**
     * Path to the static file directory for themes, no trailing slash
     */
    publicPath: string;
    /**
     * Enable creation, deletion and editing routes.
     */
    allowCRUDRoutes?: boolean;
    /**
     * Enable hiding document deletion behind a private key.
     */
    useDeleteKey?: boolean;
    /**
     * Key used for verifying document deletion.
     */
    deleteKey: string | undefined;
    /**
     * Enable hiding document modification behind a private key.
     */
    useEditKey?: boolean;
    /**
     * Key used for verifying document modification.
     */
    editKey?: string | undefined;
    /**
     * Allow access to history URLs.
     */
    publicHistory?: boolean;
    /**
     * Allows the middleware to capture fall through routes as a `404 not found` handler when enabled.
     */
    handleNotFound?: boolean;
    /**
     * =[] List of allowed custom values to set on a document. `title`, `excerpt`, `content`, `slug`, and `tags` are always allowed.
     */
    allowedDocumentKeys: string[];
    /**
     * Enables `Cache-control` headers reducing server load, but breaks sessions. Cache is disabled always on the `/edit` and `/new` routes.
     */
    useCache?: boolean;
    /**
     * Used as the max-age for Cache-control'headers on frequently updated routes: home, tag index, tag details, details & history index
     */
    cacheShort?: number;
    /**
     * Used as the max-age for Cache-control'headers on seldom updated routes: history details, history restore
     */
    cacheLong?: number;
    /**
     * A replacement route handler for the home route.
     */
    homeRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the tag inded route.
     */
    tagIndexRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the tag show route.
     */
    tagRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the search route.
     */
    searchRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the edit route.
     */
    editRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the delete route.
     */
    deleteRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the save route.
     */
    saveRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the save new handler.
     */
    saveNewRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the create route.
     */
    newRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the detail route.
     */
    detailRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the preview route.
     */
    previewRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the history index route.
     */
    historyIndexRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the history detail route.
     */
    historyDetailRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the history restore route.
     */
    historyRestoreRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the 404 not found route.
     */
    notFoundRoute?: import("express").RequestHandler;
    /**
     * A replacement route handler for the save valid route.
     */
    saveValidRoute?: import("express").RequestHandler;
    /**
     * A collection of middleware for each route.
     */
    routeMiddleware: Record<string, import("express").RequestHandler[]>;
    /**
     * Collection of Uttori Plugins. Storage Plugins should come before other plugins.
     */
    plugins: any[];
    /**
     * Middleware Configuration to be passed along to Express in the format of ['use', layouts], ['set', 'layout extractScripts', true], ['engine', 'html', ejs.renderFile].
     */
    middleware?: import("../dist/custom.js").UttoriMiddleware[];
};
/**
 * @typedef UttoriWikiConfig
 * @type {object}
 * @property {boolean} [production=false] Useful for development environments.
 * @property {string} [homePage='home-page'] Slug of the root `/` page document.
 * @property {string[]} ignoreSlugs Slugs to ignore in search & filtered documents, default is 'home-page';
 * @property {string[]} ignoreTags Tags to ignore when generating the tags page, default is an empty array;
 * @property {number} [excerptLength=400] Excerpt length, used in search result previews.
 * @property {string} [publicUrl=''] Application base URL. Used for canonical URLs and redirects, do not include a trailing slash.
 * @property {Record<string, string>} routes The object containing the route strings for search & tags.
 * @property {Record<string, string>} titles The object containing the default titles for search & tags.
 * @property {string} [themePath=''] Specify the path to the theme directory, no trailing slash.
 * @property {string} publicPath Path to the static file directory for themes, no trailing slash
 * @property {boolean} [allowCRUDRoutes=true] Enable creation, deletion and editing routes.
 * @property {boolean} [useDeleteKey=false] Enable hiding document deletion behind a private key.
 * @property {string|undefined} deleteKey Key used for verifying document deletion.
 * @property {boolean} [useEditKey=false] Enable hiding document modification behind a private key.
 * @property {string|undefined} [editKey] Key used for verifying document modification.
 * @property {boolean} [publicHistory=true] Allow access to history URLs.
 * @property {boolean} [handleNotFound=true] Allows the middleware to capture fall through routes as a `404 not found` handler when enabled.
 * @property {string[]} allowedDocumentKeys=[] List of allowed custom values to set on a document. `title`, `excerpt`, `content`, `slug`, and `tags` are always allowed.
 * @property {boolean} [useCache=true] Enables `Cache-control` headers reducing server load, but breaks sessions. Cache is disabled always on the `/edit` and `/new` routes.
 * @property {number} [cacheShort=(60 * 60)] Used as the max-age for Cache-control'headers on frequently updated routes: home, tag index, tag details, details & history index
 * @property {number} [cacheLong=(60 * 60 * 24)] Used as the max-age for Cache-control'headers on seldom updated routes: history details, history restore
 * @property {import("express").RequestHandler} [homeRoute] A replacement route handler for the home route.
 * @property {import("express").RequestHandler} [tagIndexRoute] A replacement route handler for the tag inded route.
 * @property {import("express").RequestHandler} [tagRoute] A replacement route handler for the tag show route.
 * @property {import("express").RequestHandler} [searchRoute] A replacement route handler for the search route.
 * @property {import("express").RequestHandler} [editRoute] A replacement route handler for the edit route.
 * @property {import("express").RequestHandler} [deleteRoute] A replacement route handler for the delete route.
 * @property {import("express").RequestHandler} [saveRoute] A replacement route handler for the save route.
 * @property {import("express").RequestHandler} [saveNewRoute] A replacement route handler for the save new handler.
 * @property {import("express").RequestHandler} [newRoute] A replacement route handler for the create route.
 * @property {import("express").RequestHandler} [detailRoute] A replacement route handler for the detail route.
 * @property {import("express").RequestHandler} [previewRoute] A replacement route handler for the preview route.
 * @property {import("express").RequestHandler} [historyIndexRoute] A replacement route handler for the history index route.
 * @property {import("express").RequestHandler} [historyDetailRoute] A replacement route handler for the history detail route.
 * @property {import("express").RequestHandler} [historyRestoreRoute] A replacement route handler for the history restore route.
 * @property {import("express").RequestHandler} [notFoundRoute] A replacement route handler for the 404 not found route.
 * @property {import("express").RequestHandler} [saveValidRoute] A replacement route handler for the save valid route.
 * @property {Record<string, import("express").RequestHandler[]>} routeMiddleware A collection of middleware for each route.
 * @property {Array} plugins Collection of Uttori Plugins. Storage Plugins should come before other plugins.
 * @property {import("../dist/custom.js").UttoriMiddleware[]} [middleware] Middleware Configuration to be passed along to Express in the format of ['use', layouts], ['set', 'layout extractScripts', true], ['engine', 'html', ejs.renderFile].
 */
/** @type {UttoriWikiConfig} */
declare const config: UttoriWikiConfig;
//# sourceMappingURL=config.d.ts.map