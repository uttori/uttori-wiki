export type UttoriWikiDocument = import('../wiki.js').UttoriWikiDocument;

export interface UttoriWikiConfig {
  /** Plugin configuration is stored under each plugin's configKey. */
  [key: string]: unknown;
  /** Categories omitted from category listings. Defaults to an empty list. */
  ignoreCategories?: string[];
  /** Useful for development environments. */
  production?: boolean;
  /** Slug of the root `/` page document. */
  homePage?: string;
  /** Slugs to ignore in search & filtered documents, default is 'home-page'; */
  ignoreSlugs: string[];
  /** Tags to ignore when generating the tags page, default is an empty array; */
  ignoreTags: string[];
  /** Excerpt length, used in search result previews. */
  excerptLength?: number;
  /** Application base URL. Used for canonical URLs and redirects, do not include a trailing slash. */
  publicUrl?: string;
  /** Optional mounted path for canonical URLs; unlike publicUrl it contains no origin. */
  canonicalPathPrefix?: string;
  /** Append a slash to canonical document, search, and home paths. */
  canonicalTrailingSlash?: boolean;
  /** The object containing the route strings for search. */
  routes: Record<string, string>;
  /** The object containing the default titles for search. */
  titles: Record<string, string>;
  /** Specify the path to the theme directory, no trailing slash. */
  themePath?: string;
  /** Path to the static file directory for themes, no trailing slash */
  publicPath: string;
  /** Enable creation, deletion and editing routes. */
  allowCRUDRoutes?: boolean;
  /** Enable hiding document deletion behind a private key. */
  useDeleteKey?: boolean;
  /** Key used for verifying document deletion. */
  deleteKey: string | undefined;
  /** Enable hiding document modification behind a private key. */
  useEditKey?: boolean;
  /** Key used for verifying document modification. */
  editKey?: string | undefined;
  /** Allow access to history URLs. */
  publicHistory?: boolean;
  /** Allows the middleware to capture fall through routes as a `404 not found` handler when enabled. */
  handleNotFound?: boolean;
  /**
   * List of allowed custom values to set on a document. `title`, `excerpt`, `content`, `slug`, and `tags` are always allowed.
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
  /** Used as the max-age for Cache-control'headers on seldom updated routes: history details, history restore */
  cacheLong?: number;
  /** A replacement route handler for the home route. */
  homeRoute?: import('express').RequestHandler;
  /** A replacement route handler for the search route. */
  searchRoute?: import('express').RequestHandler;
  /** A replacement route handler for the edit route. */
  editRoute?: import('express').RequestHandler;
  /** A replacement route handler for the delete route. */
  deleteRoute?: import('express').RequestHandler;
  /** A replacement route handler for the save route. */
  saveRoute?: import('express').RequestHandler<import('../custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>;
  /** A replacement route handler for the save new handler. */
  saveNewRoute?: import('express').RequestHandler<import('../custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>;
  /** A replacement route handler for the create route. */
  newRoute?: import('express').RequestHandler;
  /** A replacement route handler for the detail route. */
  detailRoute?: import('express').RequestHandler;
  /** A replacement route handler for the preview route. */
  previewRoute?: import('express').RequestHandler;
  /** A replacement route handler for the history index route. */
  historyIndexRoute?: import('express').RequestHandler;
  /** A replacement route handler for the history detail route. */
  historyDetailRoute?: import('express').RequestHandler;
  /** A replacement route handler for the history restore route. */
  historyRestoreRoute?: import('express').RequestHandler;
  /** A replacement route handler for the 404 not found route. */
  notFoundRoute?: import('express').RequestHandler;
  /** A replacement route handler for the save valid route. */
  saveValidRoute?: import('express').RequestHandler<import('../custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>;
  /** A collection of middleware for each route. */
  routeMiddleware: Record<string, import('express').RequestHandler[]>;
  /** Collection of Uttori Plugins. Storage Plugins should come before other plugins. */
  plugins: import('../custom.js').UttoriWikiPlugin[];
  /**
   * Middleware Configuration to be passed along to Express in the format of ['use', layouts], ['set', 'layout extractScripts', true], ['engine', 'html', ejs.renderFile].
   */
  middleware?: import('../custom.js').UttoriMiddleware[];
  /** Redirect Configuration to redirect old routes to new routes. */
  redirects?: import('../custom.js').UttoriRedirect[];
}
