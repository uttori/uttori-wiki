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
| [site_title] | <code>string</code> | <code>&quot;&#x27;Wiki&#x27;&quot;</code> | The website title, HTML <title> format: page_title | site_title |
| [site_header] | <code>string</code> | <code>&quot;&#x27;Wiki&#x27;&quot;</code> | Used in the navbar as your site title. |
| [site_footer] | <code>string</code> | <code>&quot;&#x27;Wiki&#x27;&quot;</code> | Used as the footer text of your site. |
| site_sections | <code>Array.&lt;object&gt;</code> | <code>[</code> | Your site sections for homepage & tag pages. For each section, the home page & tag pages will display a section box that lists the document count for documents that have a matching tag. Clicking the section link will list the tagged documents. |
| site_sections.title | <code>string</code> |  | Your site section header text. |
| site_sections.description | <code>string</code> |  | Your site section description text. |
| site_sections.tag | <code>string</code> |  | Your site section related tag. |
| [home_page] | <code>string</code> | <code>&quot;&#x27;home-page&#x27;&quot;</code> | Slug of the root `/` page document. |
| ignore_slugs | <code>Array.&lt;string&gt;</code> |  | Slugs to ignore in search & filtered documents, default is 'home-page'; |
| [excerpt_length] | <code>number</code> | <code>400</code> | Excerpt length, used in search result previews. |
| site_url | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Application base URL. Used for canonical URLs and Open Graph, no trailing slash. |
| [theme_dir] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Specify the path to the theme directory, no trailing slash. |
| [public_dir] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Path to the static file directory for themes, no trailing slash |
| [use_delete_key] | <code>boolean</code> | <code>false</code> | Enable hiding document deletion behind a private key. |
| delete_key | <code>string</code> \| <code>undefined</code> |  | Key used for verifying document deletion. |
| [use_edit_key] | <code>boolean</code> | <code>false</code> | Enable hiding document modification behind a private key. |
| edit_key | <code>string</code> \| <code>undefined</code> |  | Key used for verifying document modification. |
| [public_history] | <code>boolean</code> | <code>true</code> | Allow access to history URLs. |
| [handle_not_found] | <code>boolean</code> | <code>true</code> | Allows the middleware to capture fall through routes as a `404 not found` handler when enabled. |
| allowedDocumentKeys | <code>Array.&lt;string&gt;</code> | <code>[</code> | List of allowed custom values to set on a document. `title`, `excerpt`, `content`, `slug`, and `tags` are always allowed. |
| [use_meta_data] | <code>boolean</code> | <code>true</code> | Theme specific, use OpenGraph and neta data. |
| [site_locale] | <code>string</code> | <code>&quot;&#x27;en_US&#x27;&quot;</code> | Theme specific, Open Graph: Locale |
| [site_twitter_site] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Theme specific, Open Graph: Twitter Site Handle |
| [site_twitter_creator] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Theme specific, Open Graph: Twitter Creator Handle |
| [site_image] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | Theme specific, Used as Open Graph: Image |
| [use_cache] | <code>boolean</code> | <code>true</code> | Enables `Cache-control` headers reducing server load, but breaks sessions. Cache is disabled always on the `/edit` and `/new` routes. |
| [cache_short] | <code>number</code> | <code>(60 * 60)</code> | Used as the max-age for Cache-control'headers on frequently updated routes: home, tag index, tag details, details & history index |
| [cache_long] | <code>number</code> | <code>(60 * 60 * 24)</code> | Used as the max-age for Cache-control'headers on seldom updated routes: history details, history restore |
| plugins | <code>Array</code> |  | Collection of Uttori Plugins. Storage Plugins should come before other plugins. |
| [middleware] | <code>Array</code> |  | Middleware Configuration to be passed along to Express in the format of ['use', layouts], ['set', 'layout extractScripts', true], ['engine', 'html', ejs.renderFile]. |

