[![view on npm](http://img.shields.io/npm/v/uttori-wiki.svg)](https://www.npmjs.org/package/uttori-wiki)
[![npm module downloads](http://img.shields.io/npm/dt/uttori-wiki.svg)](https://www.npmjs.org/package/uttori-wiki)
[![Build Status](https://travis-ci.org/uttori/uttori-wiki.svg?branch=master)](https://travis-ci.org/uttori/uttori-wiki)
[![Dependency Status](https://david-dm.org/uttori/uttori-wiki.svg)](https://david-dm.org/uttori/uttori-wiki)
[![Coverage Status](https://coveralls.io/repos/uttori/uttori-wiki/badge.svg?branch=master)](https://coveralls.io/r/uttori/uttori-wiki?branch=master)

# Uttori Wiki

UttoriWiki is a fast, simple, wiki knowledge base for Express.js & Node.js that stores data in any format (Markdown, Wikitext, Creole, AsciiDoc, Textile, reStructuredText, BBCode, Pendown, etc.), and renders to HTML.

UttoriWiki itself is a wiki module for the [Uttori](https://github.com/uttori) set of components allowing single chunks of functionality be changed or updated to fit specific needs.

Don't want to write in Markdown? You don't need to! Don't want to store files on disk? Choose a database storage module! Already running a bunch of external dependencies and want to plug into those? You can _most likely_ do it!

## Configuration

Please see `src/config.default.js` for all options. Below is an example configuration using [uttori-storage-provider-json-file](https://github.com/uttori/uttori-storage-provider-json-file) and [uttori-search-provider-lunr](https://github.com/uttori/uttori-search-provider-lunr):

```javascript
const StorageProvider = require('uttori-storage-provider-json-file');
const SearchProvider = require('uttori-search-provider-lunr');

const MarkdownItRenderer = require('uttori-plugin-renderer-markdown-it');
const MulterUpload = require('uttori-plugin-upload-multer');
const SitemapGenerator = require('uttori-plugin-generator-sitemap');

const config = {
  // Specify the theme to use, no trailing slash
  theme_dir: `${__dirname}/themes`,

  // Path to the static file directory for themes, no trailing slash
  public_dir: `${__dirname}/themes/default/public`,

  // Use the JSON to Disk Storage Provider
  StorageProvider,
  storageProviderConfig: {
    // Path in which to store content (markdown files, etc.)
    content_dir: `${__dirname}/content`,

    // Path in which to store content history (markdown files, etc.)
    history_dir: `${__dirname}/content/history`,

    // File Extension
    extension: 'json',

    // JSON stringify parameter for formatting output
    spaces_article: 2,
    spaces_history: 2,
  },

  // Use the Lunr Search Provider
  SearchProvider,
  searchProviderConfig: {
    // Optional Lunr locale
    lunr_locales: [],
  },

  // Plugins
  plugins: [
    MarkdownItRenderer,
    MulterUpload,
    SitemapGenerator,
  ],

  // Plugin: Markdown rendering with MarkdownIt
  [MarkdownItRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      renderCollection: ['render-search-results'],
      validateConfig: ['validate-config'],
    },
  },

  // Plugin: Multer Upload
  [MulterUpload.configKey]: {
    events: {
      bindRoutes: ['bind-routes'],
      validateConfig: ['validate-config'],
    },

    // Directory files will be uploaded to
    directory: `${__dirname}/uploads`,

    // URL to POST files to
    route: '/upload',
  },

  // Plugin: Sitemap Generator
  [SitemapGenerator.configKey]: {
    events: {
      callback: ['document-save', 'document-delete'],
      validateConfig: ['validate-config'],
    },

    // Sitemap URL (ie https://wiki.domain.tld)
    base_url: 'https://wiki.domain.tld',

    // Location where the XML sitemap will be written to.
    directory: `${__dirname}/themes/default/public`,

    urls: [
      {
        url: '/',
        lastmod: new Date().toISOString(),
        priority: '1.00',
      },
      {
        url: '/tags',
        lastmod: new Date().toISOString(),
        priority: '0.90',
      },
      {
        url: '/new',
        lastmod: new Date().toISOString(),
        priority: '0.70',
      },
    ],
  },
};

module.exports = config;
```

## Events

The following events are avaliable to hook into through plugins and are used in the methods below:

| Name                         | Type       | Returns                   | Description |
|------------------------------|------------|---------------------------|-------------|
| `bind-routes`                | `dispatch` |                           | Called after the default routes are bound to the server. |
| `document-delete`            | `dispatch` |                           | Called when a document is about to be deleted. |
| `document-save`              | `filter`   | Uttori Document           | Called when a document is about to be saved. |
| `render-content`             | `filter`   | HTML Content              | Called anytime content is being prepared to be shown. |
| `render-search-results`      | `filter`   | Array of Uttori Documents | Called when search results have been collected and is being prepared to be shown. |
| `validate-config`            | `dispatch` |                           | Called after initial configuration validation. |
| `validate-invalid`           | `dispatch` |                           | Called when a document is found invalid (spam?). |
| `validate-valid`             | `dispatch` |                           | Called when a document is found to be valid. |
| `validate-save`              | `validate` | Boolean                   | Called before saving a document to validate the document. |
| `view-model-detail`          | `filter`   | View Model                | Called when rendering the detail page just before being shown. |
| `view-model-edit`            | `filter`   | View Model                | Called when rendering the edit page just before being shown. |
| `view-model-error-404`       | `filter`   | View Model                | Called when rendering a 404 Not Found error page just before being shown. |
| `view-model-history-detail`  | `filter`   | View Model                | Called when rendering a history detail page just before being shown. |
| `view-model-history-index`   | `filter`   | View Model                | Called when rendering a history index page just before being shown. |
| `view-model-history-restore` | `filter`   | View Model                | Called when rendering a history restore page just before being shown. |
| `view-model-home`            | `filter`   | View Model                | Called when rendering the home page just before being shown. |
| `view-model-metadata`        | `filter`   | View Model                | Called after the initial view model metadata is setup. |
| `view-model-new`             | `filter`   | View Model                | Called when rendering the new document page just before being shown. |
| `view-model-search`          | `filter`   | View Model                | Called when rendering a search result page just before being shown. |
| `view-model-tag-index`       | `filter`   | View Model                | Called when rendering the tag index page just before being shown. |
| `view-model-tag`             | `filter`   | View Model                | Called when rendering a tag detail page just before being shown. |

* * *

## API Reference

<a name="UttoriWiki"></a>

## UttoriWiki
UttoriWiki is a fast, simple, wiki knowledge base.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | The configuration object. |
| hooks | <code>EventDispatcher</code> | The hook / event dispatching object. |
| server | <code>Express</code> | The Express server instance (only exposed when testing). |
| storageProvider | <code>StorageProvider</code> | The Storage Provider instance. |
| searchProvider | <code>SearchProvider</code> | The Search Provider instance. |


* [UttoriWiki](#UttoriWiki)
    * [new UttoriWiki(config, server)](#new_UttoriWiki_new)
    * [.setup()](#UttoriWiki+setup)
    * [.registerPlugins(config)](#UttoriWiki+registerPlugins)
    * [.validateConfig(config)](#UttoriWiki+validateConfig)
    * [.buildMetadata([document], [path], [robots])](#UttoriWiki+buildMetadata) ⇒ <code>Object</code>
    * [.bindRoutes(server)](#UttoriWiki+bindRoutes)
    * [.home(_request, response, _next)](#UttoriWiki+home)
    * [.homepageRedirect(request, response, _next)](#UttoriWiki+homepageRedirect)
    * [.tagIndex(_request, response, _next)](#UttoriWiki+tagIndex)
    * [.tag(request, response, next)](#UttoriWiki+tag)
    * [.search(request, response, next)](#UttoriWiki+search)
    * [.edit(request, response, next)](#UttoriWiki+edit)
    * [.delete(request, response, next)](#UttoriWiki+delete)
    * [.save(request, response, next)](#UttoriWiki+save)
    * [.new(request, response, next)](#UttoriWiki+new)
    * [.detail(request, response, next)](#UttoriWiki+detail)
    * [.historyIndex(request, response, next)](#UttoriWiki+historyIndex)
    * [.historyDetail(request, response, next)](#UttoriWiki+historyDetail)
    * [.historyRestore(request, response, next)](#UttoriWiki+historyRestore)
    * [.notFound(request, response, _next)](#UttoriWiki+notFound)
    * [.saveValid(request, response, _next)](#UttoriWiki+saveValid)
    * [.getSiteSections()](#UttoriWiki+getSiteSections) ⇒ <code>Promise</code>
    * [.getTaggedDocuments(tag, limit)](#UttoriWiki+getTaggedDocuments) ⇒ <code>Promise</code>
    * [.getSearchResults(query, limit)](#UttoriWiki+getSearchResults) ⇒ <code>Promise</code>

<a name="new_UttoriWiki_new"></a>

### new UttoriWiki(config, server)
Creates an instance of UttoriWiki.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | A configuration object. |
| [config.skip_setup] | <code>Boolean</code> | Skips running provider setup (used for testing). |
| server | <code>Express</code> | The Express server instance. |

**Example** *(Init UttoriWiki)*  
```js
const server = express();
// Server Setup
const wiki = new UttoriWiki(config, server);
server.listen(server.get('port'), server.get('ip'), () => { ... });
```
<a name="UttoriWiki+setup"></a>

### uttoriWiki.setup()
Setups the Storage Provider and the Search Provider.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Example**  
```js
wiki.setup();
```
<a name="UttoriWiki+registerPlugins"></a>

### uttoriWiki.registerPlugins(config)
Registers plugins with the Event Dispatcher.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | A configuration object. |
| config.plugins | <code>Array.&lt;Object&gt;</code> | A collection of plugins to register. |

**Example**  
```js
wiki.registerPlugins(config);
```
<a name="UttoriWiki+validateConfig"></a>

### uttoriWiki.validateConfig(config)
Validates the config.

Hooks:
- `dispatch` - `validate-config` - Passes in the config object.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | A configuration object. |
| config.StorageProvider | <code>StorageProvider</code> | A StorageProvider class. |
| config.SearchProvider | <code>SearchProvider</code> | A SearchProvider class. |
| config.theme_dir | <code>String</code> | The path to the theme directory. |
| config.public_dir | <code>String</code> | The path to the public facing directory. |

**Example**  
```js
wiki.validateConfig(config);
```
<a name="UttoriWiki+buildMetadata"></a>

### uttoriWiki.buildMetadata([document], [path], [robots]) ⇒ <code>Object</code>
Builds the metadata for the view model.

Hooks:
- `filter` - `render-content` - Passes in the meta description.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: <code>Object</code> - Metadata object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [document] | <code>UttoriDocument</code> | <code>{}</code> | A configuration object. |
| document.excerpt | <code>String</code> |  | The meta description to be used. |
| document.content | <code>String</code> |  | The document content to be used as a backup meta description when excerpt is not provided. |
| document.updateDate | <code>Number</code> |  | The Unix timestamp of the last update date to the document. |
| document.createDate | <code>Number</code> |  | The Unix timestamp of the creation date of the document. |
| document.title | <code>String</code> |  | The document title to be used in meta data. |
| [path] | <code>String</code> | <code>&#x27;&#x27;</code> | The URL path to build meta data for. |
| [robots] | <code>String</code> | <code>&#x27;&#x27;</code> | A meta robots tag value. |

**Example**  
```js
const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
➜ {
➜   canonical,   // `${this.config.site_url}/private-document-path`
➜   description, // document.excerpt ? `${document.content.slice(0, 160)}`
➜   image,       // '' unless augmented via Plugin
➜   modified,    // new Date(document.updateDate).toISOString()
➜   published,   // new Date(document.createDate).toISOString()
➜   robots,      // 'no-index'
➜   title,       // document.title ? this.config.site_title
➜ }
```
<a name="UttoriWiki+bindRoutes"></a>

### uttoriWiki.bindRoutes(server)
Bind the routes to the server.
Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All

Hooks:
- `dispatch` - `bind-routes` - Passes in the server instance.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>Express</code> | The Express server instance. |

**Example**  
```js
wiki.bindRoutes(server);
```
<a name="UttoriWiki+home"></a>

### uttoriWiki.home(_request, response, _next)
Renders the homepage with the `home` template.

Hooks:
- `filter` - `render-content` - Passes in the home-page content.
- `filter` - `view-model-home` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| _request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.home(_, response, _);
```
<a name="UttoriWiki+homepageRedirect"></a>

### uttoriWiki.homepageRedirect(request, response, _next)
Redirects to the homepage.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.homepageRedirect(request, response, _);
```
<a name="UttoriWiki+tagIndex"></a>

### uttoriWiki.tagIndex(_request, response, _next)
Renders the tag index page with the `tags` template.

Hooks:
- `filter` - `view-model-tag-index` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| _request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.tagIndex(_, response, _);
```
<a name="UttoriWiki+tag"></a>

### uttoriWiki.tag(request, response, next)
Renders the tag detail page with `tag` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-tag` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.tag(request, response, next);
```
<a name="UttoriWiki+search"></a>

### uttoriWiki.search(request, response, next)
Renders the search page using the `search` template.

Hooks:
- `filter` - `render-search-results` - Passes in the search results.
- `filter` - `view-model-search` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.search(request, response, next);
```
<a name="UttoriWiki+edit"></a>

### uttoriWiki.edit(request, response, next)
Renders the edit page using the `edit` template.

Hooks:
- `filter` - `view-model-edit` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.edit(request, response, next);
```
<a name="UttoriWiki+delete"></a>

### uttoriWiki.delete(request, response, next)
Attempts to delete a document and redirect to the homepage.
If the config `use_delete_key` value is true, the key is verified before deleting.

Hooks:
- `dispatch` - `document-delete` - Passes in the document beind deleted.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.delete(request, response, next);
```
<a name="UttoriWiki+save"></a>

### uttoriWiki.save(request, response, next)
Attempts to save the document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.save(request, response, next);
```
<a name="UttoriWiki+new"></a>

### uttoriWiki.new(request, response, next)
Renders the new page using the `edit` template.

Hooks:
- `filter` - `view-model-new` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.new(request, response, next);
```
<a name="UttoriWiki+detail"></a>

### uttoriWiki.detail(request, response, next)
Renders the detail page using the `detail` template.

Hooks:
- `render-content` - `render-content` - Passes in the document content.
- `filter` - `view-model-detail` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.detail(request, response, next);
```
<a name="UttoriWiki+historyIndex"></a>

### uttoriWiki.historyIndex(request, response, next)
Renders the history index page using the `history_index` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-index` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.historyIndex(request, response, next);
```
<a name="UttoriWiki+historyDetail"></a>

### uttoriWiki.historyDetail(request, response, next)
Renders the history detail page using the `detail` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `render-content` - `render-content` - Passes in the document content.
- `filter` - `view-model-history-index` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.historyDetail(request, response, next);
```
<a name="UttoriWiki+historyRestore"></a>

### uttoriWiki.historyRestore(request, response, next)
Renders the history restore page using the `edit` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-restore` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.historyRestore(request, response, next);
```
<a name="UttoriWiki+notFound"></a>

### uttoriWiki.notFound(request, response, _next)
Renders the 404 Not Found page using the `404` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-error-404` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.notFound(request, response, _);
```
<a name="UttoriWiki+saveValid"></a>

### uttoriWiki.saveValid(request, response, _next)
Handles saving documents, and changing the slug of documents, the redirecting to the document.

Hooks:
- `filter` - `document-save` - Passes in the document.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>NextFunction</code> | The Express Next function. |

**Example**  
```js
wiki.saveValid(request, response, _);
```
<a name="UttoriWiki+getSiteSections"></a>

### uttoriWiki.getSiteSections() ⇒ <code>Promise</code>
Returns the site sections from the configuration with their tagged document count.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: <code>Promise</code> - Promise object that resolves to the array of site sections.  
**Example**  
```js
wiki.getSiteSections();
➜ [{ title: 'Example', description: 'Example description text.', tag: 'example', documentCount: 10 }]
```
<a name="UttoriWiki+getTaggedDocuments"></a>

### uttoriWiki.getTaggedDocuments(tag, limit) ⇒ <code>Promise</code>
Returns the documents with the provided tag, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignore_slugs` array.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: <code>Promise</code> - Promise object that resolves to the array of the documents.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tag | <code>String</code> |  | The tag to look for in documents. |
| limit | <code>Number</code> | <code>1024</code> | The maximum number of documents to be returned. |

**Example**  
```js
wiki.getTaggedDocuments('example', 10);
➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
```
<a name="UttoriWiki+getSearchResults"></a>

### uttoriWiki.getSearchResults(query, limit) ⇒ <code>Promise</code>
Returns the documents that match the provided query string, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignore_slugs` array.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: <code>Promise</code> - Promise object that resolves to the array of the documents.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>String</code> | The query to look for in documents. |
| limit | <code>Number</code> | The maximum number of documents to be returned. |

**Example**  
```js
wiki.getSearchResults('needle', 10);
➜ [{ slug: 'example', title: 'Example', content: 'Haystack neelde haystack.', tags: ['example'] }]
```

* * *

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
DEBUG=Uttori* npm test
```

## Contributors

- [Matthew Callis](https://github.com/MatthewCallis) - author of UttoriWiki
- [Wade Kallhoff](https://github.com/wkallhof) - author of Hazel, the inspiration behind UttoriWiki
- [Egor Kuryanovich](https://github.com/Sontan) - contributions to the Hazel codebase

## License

[GPL-3.0](LICENSE)
