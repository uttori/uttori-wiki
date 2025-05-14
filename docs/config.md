## Constants

<dl>
<dt><a href="#config">config</a> : <code><a href="#UttoriWikiConfig">UttoriWikiConfig</a></code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UttoriWikiConfig">UttoriWikiConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="config"></a>

## config : [<code>UttoriWikiConfig</code>](#UttoriWikiConfig)
**Kind**: global constant  
<a name="UttoriWikiConfig"></a>

## UttoriWikiConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [production] | <code>boolean</code> | <code>false</code> | Useful for development environments. |
| [homePage] | <code>string</code> | <code>&quot;&#x27;home-page&#x27;&quot;</code> | Slug of the root `/` page document. |
| ignoreSlugs | <code>Array.&lt;string&gt;</code> |  | Slugs to ignore in search & filtered documents, default is 'home-page'; |
| ignoreTags | <code>Array.&lt;string&gt;</code> |  | Tags to ignore when generating the tags page, default is an empty array; |
| [excerptLength] | <code>number</code> | <code>400</code> | Excerpt length, used in search result previews. |
| [publicUrl] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Application base URL. Used for canonical URLs and redirects, do not include a trailing slash. |
| routes | <code>Record.&lt;string, string&gt;</code> |  | The object containing the route strings for search & tags. |
| titles | <code>Record.&lt;string, string&gt;</code> |  | The object containing the default titles for search & tags. |
| [themePath] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Specify the path to the theme directory, no trailing slash. |
| publicPath | <code>string</code> |  | Path to the static file directory for themes, no trailing slash |
| [allowCRUDRoutes] | <code>boolean</code> | <code>true</code> | Enable creation, deletion and editing routes. |
| [useDeleteKey] | <code>boolean</code> | <code>false</code> | Enable hiding document deletion behind a private key. |
| deleteKey | <code>string</code> \| <code>undefined</code> |  | Key used for verifying document deletion. |
| [useEditKey] | <code>boolean</code> | <code>false</code> | Enable hiding document modification behind a private key. |
| [editKey] | <code>string</code> \| <code>undefined</code> |  | Key used for verifying document modification. |
| [publicHistory] | <code>boolean</code> | <code>true</code> | Allow access to history URLs. |
| [handleNotFound] | <code>boolean</code> | <code>true</code> | Allows the middleware to capture fall through routes as a `404 not found` handler when enabled. |
| allowedDocumentKeys | <code>Array.&lt;string&gt;</code> | <code>[</code> | List of allowed custom values to set on a document. `title`, `excerpt`, `content`, `slug`, and `tags` are always allowed. |
| [useCache] | <code>boolean</code> | <code>true</code> | Enables `Cache-control` headers reducing server load, but breaks sessions. Cache is disabled always on the `/edit` and `/new` routes. |
| [cacheShort] | <code>number</code> | <code>(60 * 60)</code> | Used as the max-age for Cache-control'headers on frequently updated routes: home, tag index, tag details, details & history index |
| [cacheLong] | <code>number</code> | <code>(60 * 60 * 24)</code> | Used as the max-age for Cache-control'headers on seldom updated routes: history details, history restore |
| [homeRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the home route. |
| [tagIndexRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the tag inded route. |
| [tagRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the tag show route. |
| [searchRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the search route. |
| [editRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the edit route. |
| [deleteRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the delete route. |
| [saveRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the save route. |
| [saveNewRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the save new handler. |
| [newRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the create route. |
| [detailRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the detail route. |
| [previewRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the preview route. |
| [historyIndexRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the history index route. |
| [historyDetailRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the history detail route. |
| [historyRestoreRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the history restore route. |
| [notFoundRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the 404 not found route. |
| [saveValidRoute] | <code>module:express~RequestHandler</code> |  | A replacement route handler for the save valid route. |
| routeMiddleware | <code>Record.&lt;string, Array.&lt;module:express~RequestHandler&gt;&gt;</code> |  | A collection of middleware for each route. |
| plugins | <code>Array.&lt;UttoriWikiPlugin&gt;</code> |  | Collection of Uttori Plugins. Storage Plugins should come before other plugins. |
| [middleware] | <code>Array.&lt;UttoriMiddleware&gt;</code> |  | Middleware Configuration to be passed along to Express in the format of ['use', layouts], ['set', 'layout extractScripts', true], ['engine', 'html', ejs.renderFile]. |
| [redirects] | <code>Array.&lt;UttoriRedirect&gt;</code> |  | Redirect Configuration to redirect old routes to new routes. |

