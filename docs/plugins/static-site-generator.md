## Classes

<dl>
<dt><a href="#StaticSiteGenerator">StaticSiteGenerator</a></dt>
<dd><p>Export a configured Uttori Wiki app through its real HTTP routes and templates.
The temporary listener is loopback-only and is always closed, including on
render failures. The deployed artifact contains only the requested routes.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#StaticSiteRoute">StaticSiteRoute</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#StaticSiteAsset">StaticSiteAsset</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#StaticSiteBuildOptions">StaticSiteBuildOptions</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="StaticSiteGenerator"></a>

## StaticSiteGenerator
Export a configured Uttori Wiki app through its real HTTP routes and templates.
The temporary listener is loopback-only and is always closed, including on
render failures. The deployed artifact contains only the requested routes.

**Kind**: global class  

* [StaticSiteGenerator](#StaticSiteGenerator)
    * [.register()](#StaticSiteGenerator.register)
    * [.outputPath(route)](#StaticSiteGenerator.outputPath) ⇒ <code>string</code>
    * [.safeRelative(destination)](#StaticSiteGenerator.safeRelative) ⇒ <code>string</code>
    * [.capture(origin, route)](#StaticSiteGenerator.capture) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.validateLinks(pages, staging)](#StaticSiteGenerator.validateLinks)
    * [.build(options)](#StaticSiteGenerator.build) ⇒ <code>Promise.&lt;{pages: number, assets: number}&gt;</code>

<a name="StaticSiteGenerator.register"></a>

### StaticSiteGenerator.register()
Plugin registration is intentionally inert; export is an explicit build operation.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)  
<a name="StaticSiteGenerator.outputPath"></a>

### StaticSiteGenerator.outputPath(route) ⇒ <code>string</code>
Map a URL to a safe directory-index path inside the staging tree.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)  
**Returns**: <code>string</code> - Relative output file path.  

| Param | Type | Description |
| --- | --- | --- |
| route | [<code>StaticSiteRoute</code>](#StaticSiteRoute) | Public route. |

<a name="StaticSiteGenerator.safeRelative"></a>

### StaticSiteGenerator.safeRelative(destination) ⇒ <code>string</code>
Keep output destinations below staging even when supplied by a caller.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)  
**Returns**: <code>string</code> - Normalized safe path.  

| Param | Type | Description |
| --- | --- | --- |
| destination | <code>string</code> | Relative artifact path. |

<a name="StaticSiteGenerator.capture"></a>

### StaticSiteGenerator.capture(origin, route) ⇒ <code>Promise.&lt;string&gt;</code>
Fetch a page through the configured renderer, rejecting redirects and
mismatched status/content types before writing it to the artifact.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)  
**Returns**: <code>Promise.&lt;string&gt;</code> - Rendered HTML.  

| Param | Type | Description |
| --- | --- | --- |
| origin | <code>string</code> | Temporary loopback origin. |
| route | [<code>StaticSiteRoute</code>](#StaticSiteRoute) | Route to render. |

<a name="StaticSiteGenerator.validateLinks"></a>

### StaticSiteGenerator.validateLinks(pages, staging)
Validate root-relative links, assets, and same-page fragments in emitted
HTML. External URLs remain the responsibility of their original source.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)  

| Param | Type | Description |
| --- | --- | --- |
| pages | <code>Map.&lt;string, string&gt;</code> | URL-to-HTML map. |
| staging | <code>string</code> | Staging artifact directory. |

<a name="StaticSiteGenerator.build"></a>

### StaticSiteGenerator.build(options) ⇒ <code>Promise.&lt;{pages: number, assets: number}&gt;</code>
Build a complete static artifact and atomically promote it on success.

**Kind**: static method of [<code>StaticSiteGenerator</code>](#StaticSiteGenerator)  
**Returns**: <code>Promise.&lt;{pages: number, assets: number}&gt;</code> - Output summary.  

| Param | Type | Description |
| --- | --- | --- |
| options | [<code>StaticSiteBuildOptions</code>](#StaticSiteBuildOptions) | Build inputs. |

<a name="StaticSiteRoute"></a>

## StaticSiteRoute : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | Public root-relative URL. HTML routes end in `/`. |
| [status] | <code>number</code> | <code>200</code> | Expected response status; use 404 for the not-found page. |
| [output] | <code>string</code> |  | Explicit relative output path, used for `404.html`. |
| [updateDate] | <code>number</code> |  | Last content change in Unix milliseconds. |

<a name="StaticSiteAsset"></a>

## StaticSiteAsset : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| source | <code>string</code> | Source file or directory to copy. |
| target | <code>string</code> | Root-relative destination within the artifact. |

<a name="StaticSiteBuildOptions"></a>

## StaticSiteBuildOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| app | <code>module:express~Application</code> | Configured wiki Express application. |
| routes | [<code>Array.&lt;StaticSiteRoute&gt;</code>](#StaticSiteRoute) | Finite public route list, including the search shell and 404 page. |
| outputDirectory | <code>string</code> | Directory to replace only after a complete build. |
| [assets] | [<code>Array.&lt;StaticSiteAsset&gt;</code>](#StaticSiteAsset) | Explicit public assets to copy. |
| [searchDocuments] | <code>Array.&lt;UttoriWikiDocument&gt;</code> | Public documents used by the existing Lunr indexer. |
| [canonicalOrigin] | <code>string</code> | HTTP(S) origin for the sitemap. Omit only for local builds. |

