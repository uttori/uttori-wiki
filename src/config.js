/**
 * @typedef UttoriWikiConfig
 * @type {object}
 * @property {boolean} [production=false] Useful for development environments.
 * @property {string} [homePage='home-page'] Slug of the root `/` page document.
 * @property {string[]} ignoreSlugs Slugs to ignore in search & filtered documents, default is 'home-page';
 * @property {string[]} ignoreTags Tags to ignore when generating the tags page, default is an empty array;
 * @property {number} [excerptLength=400] Excerpt length, used in search result previews.
 * @property {string} [publicUrl=''] Application base URL. Used for canonical URLs and redirects, do not include a trailing slash.
 * @property {Record<string, string>} routes The object containing the route strings for search.
 * @property {Record<string, string>} titles The object containing the default titles for search.
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
 * @property {import("../dist/custom.js").UttoriWikiPlugin[]} plugins Collection of Uttori Plugins. Storage Plugins should come before other plugins.
 * @property {import("../dist/custom.js").UttoriMiddleware[]} [middleware] Middleware Configuration to be passed along to Express in the format of ['use', layouts], ['set', 'layout extractScripts', true], ['engine', 'html', ejs.renderFile].
 * @property {import("../dist/custom.js").UttoriRedirect[]} [redirects] Redirect Configuration to redirect old routes to new routes.
 */

/** @type {UttoriWikiConfig} */
const config = {
  production: false,
  homePage: 'home-page',
  ignoreSlugs: ['home-page'],
  ignoreTags: [],
  excerptLength: 400,
  publicUrl: '',
  routes: {
    search: 'search',
  },
  titles: {
    search: 'Search',
  },
  themePath: '',
  publicPath: '',
  allowCRUDRoutes: true,
  useDeleteKey: false,
  deleteKey: undefined,
  useEditKey: false,
  editKey: undefined,
  publicHistory: true,
  handleNotFound: true,
  allowedDocumentKeys: [],
  useCache: true,
  cacheShort: 60 * 60,
  cacheLong: 60 * 60 * 24,
  routeMiddleware: {
    home: [],
    search: [],
    notFound: [],
    create: [],
    saveNew: [],
    preview: [],
    edit: [],
    delete: [],
    historyIndex: [],
    historyDetail: [],
    historyRestore: [],
    save: [],
    detail: [],
  },
  plugins: [],
  middleware: [],
  redirects: [],
};

export default config;
