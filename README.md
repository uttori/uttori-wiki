[![view on npm](https://img.shields.io/npm/v/@uttori/wiki.svg)](https://www.npmjs.com/package/@uttori/wiki)
[![npm module downloads](https://img.shields.io/npm/dt/@uttori/wiki.svg)](https://www.npmjs.com/package/@uttori/wiki)
[![Build Status](https://travis-ci.com/uttori/uttori-wiki.svg?branch=master)](https://travis-ci.com/uttori/uttori-wiki)
[![Dependency Status](https://david-dm.org/uttori/uttori-wiki.svg)](https://david-dm.org/uttori/uttori-wiki)
[![Coverage Status](https://coveralls.io/repos/github/uttori/uttori-wiki/badge.svg?branch=master)](https://coveralls.io/github/uttori/uttori-wiki?branch=master)
[![Tree-Shaking Support](https://badgen.net/bundlephobia/tree-shaking/@uttori/wiki)](https://bundlephobia.com/result?p=@uttori/wiki)
[![Dependency Count](https://badgen.net/bundlephobia/dependency-count/@uttori/wiki)](https://bundlephobia.com/result?p=@uttori/wiki)
[![Minified + GZip](https://badgen.net/bundlephobia/minzip/@uttori/wiki)](https://bundlephobia.com/result?p=@uttori/wiki)
[![Minified](https://badgen.net/bundlephobia/min/@uttori/wiki)](https://bundlephobia.com/result?p=@uttori/wiki)

# Uttori Wiki

UttoriWiki is a fast, simple, wiki / knowledge base built around Express.js using the [Uttori](https://github.com/uttori) set of components allowing single chunks of functionality be changed or swapped out to fit specific needs.

Why yet another knowledge management / note taking app? I wanted to have something that functioned as a Wiki or Blog or similar small app that I could reuse components for and keep extensible.

Because of that, UttoriWiki is plugin based. Search and Storage engines are fully configurable. The format of the data is also up to you: Markdown, Wikitext, Creole, AsciiDoc, Textile, reStructuredText, BBCode, Pendown, etc.

Nothing is prescribed. Don't want to write in Markdown? You don't need to! Don't want to store files on disk? Choose a database storage engine! Already running a bunch of external dependencies and want to plug into those? You can _most likely_ do it!

Rendering happens in a pipeline making it easy to render to Markdown, then filter words out and replace text with emojis.

If you want to test it out, check out [the demo repo](https://github.com/uttori/uttori-wiki-demo-site) to get up and going in a minutes.

## Configuration

Please see `src/config.js` or [the config doc](https://github.com/uttori/uttori-wiki/blob/master/docs/config.md) for all options. Below is an example configuration using some plugins:

- [@uttori/storage-provider-json-file](https://github.com/uttori/uttori-storage-provider-json-file)
- [@uttori/search-provider-lunr](https://github.com/uttori/uttori-search-provider-lunr)
- [@uttori/plugin-renderer-replacer](https://github.com/uttori/uttori-plugin-renderer-replacer)
- [@uttori/plugin-renderer-markdown-it](https://github.com/uttori/uttori-plugin-renderer-markdown-it)
- [@uttori/plugin-upload-multer](https://github.com/uttori/uttori-plugin-upload-multer)
- [@uttori/plugin-generator-sitemap](https://github.com/uttori/uttori-plugin-generator-sitemap)
- [@uttori/plugin-analytics-json-file](https://github.com/uttori/uttori-plugin-analytics-json-file)

```javascript
const { Plugin: StorageProvider } = require('@uttori/storage-provider-json-file');
const { Plugin: SearchProvider } = require('@uttori/search-provider-lunr');

const AnalyticsPlugin = require('@uttori/plugin-analytics-json-file');
const MarkdownItRenderer = require('@uttori/plugin-renderer-markdown-it');
const ReplacerRenderer = require('@uttori/plugin-renderer-replacer');
const MulterUpload = require('@uttori/plugin-upload-multer');
const SitemapGenerator = require('@uttori/plugin-generator-sitemap');

const config = {
  site_title: 'Uttori Wiki Demo',
  site_header: 'Uttori Wiki Demo',
  site_footer: 'Uttori Wiki Demo | ✨',
  site_sections: [
    {
      title: 'Section One',
      description: 'An example section.',
      tag: 'examples',
    },
    {
      title: 'Section Two',
      description: 'A section with something already in it.',
      tag: 'reference',
    },
    {
      title: 'Section Three',
      description: 'A third example section.',
      tag: 'tutorial',
    },
  ],
  home_page: 'home-page',
  ignore_slugs: ['home-page'],
  excerpt_length: 400,
  site_url: 'http://127.0.0.1:8000/wiki',
  theme_dir: path.join(__dirname, 'theme'),
  public_dir: path.join(__dirname, 'theme', 'public'),
  use_delete_key: false,
  delete_key: process.env.DELETE_KEY || '',
  use_edit_key: false,
  edit_key: process.env.EDIT_KEY || '',
  public_history: true,
  allowedDocumentKeys: [],
  use_meta_data: true,
  site_description: 'An example Wiki using the Uttori Wiki library.',
  site_locale: 'en_US',
  site_twitter_site: '@twitter',
  site_twitter_creator: '@twitter',

  // Plugins
  plugins: [
    StorageProvider,
    SearchProvider,
    AnalyticsPlugin,
    MarkdownItRenderer,
    ReplacerRenderer,
    MulterUpload,
    SitemapGenerator,
  ],

  // Use the JSON to Disk Storage Provider
  [StorageProvider.configKey]: {
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
  [SearchProvider.configKey]: {
    // Optional Lunr locale
    lunr_locales: [],

    // Ignore Slugs
    ignore_slugs: ['home-page'],
  },

  // Plugin: Analytics with JSON Files
  [AnalyticsPlugin.configKey]: {
    events: {
      getPopularDocuments: ['popular-documents'],
      updateDocument: ['document-save', 'document-delete'],
      validateConfig: ['validate-config'],
    },

    // Directory files will be uploaded to.
    directory: `${__dirname}/data`,

    // Name of the JSON file.
    name: 'visits',

    // File extension to use for the JSON file.
    extension: 'json',
  },

  // Plugin: Markdown rendering with MarkdownIt
  [MarkdownItRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      renderCollection: ['render-search-results'],
      validateConfig: ['validate-config'],
    },


    // Uttori Specific Configuration
    uttori: {
      // Prefix for relative URLs, useful when the Express app is not at root.
      baseUrl: '',

      // Safe List, if a domain is not in this list, it is set to 'external nofollow noreferrer'.
      allowedExternalDomains: [
        'my-site.org',
      ],

      // Open external domains in a new window.
      openNewWindow: true,

      // Table of Contents
      toc: {
        // The opening DOM tag for the TOC container.
        openingTag: '<nav class="table-of-contents">',

        // The closing DOM tag for the TOC container.
        closingTag: '</nav>',

        // Slugify options for convering content to anchor links.
        slugify: {
          lower: true,
        },
      },
    },
  },

  // Plugin: Replace text
  [ReplacerRenderer.configKey]: {
    events: {
      renderContent: ['render-content'],
      renderCollection: ['render-search-results'],
      validateConfig: ['validate-config'],
    },

    // Rules for text replace
    rules: [
      {
        test: /bunny|rabbit/gm,
        output: '🐰',
      },
    ],
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

    // URL to GET uploads from
    publicRoute: '/uploads',
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

  // Middleware Configuration in the form of ['function', 'param1', 'param2', ...]
  middleware: [
    ['disable', 'x-powered-by'],
    ['enable', 'view cache'],
    ['set', 'views', path.join(`${__dirname}/themes/`, 'default', 'templates')],

    // EJS Specific Setup
    ['use', layouts],
    ['set', 'layout extractScripts', true],
    ['set', 'layout extractStyles', true],
    // If you use the `.ejs` extension use the below:
    // ['set', 'view engine', 'ejs'],
    // I prefer using `.html` templates:
    ['set', 'view engine', 'html'],
    ['engine', 'html', ejs.renderFile],
  ],
};

module.exports = config;
```

Use in an example Express.js app:

```javascript
// Server
const express = require('express');

// Reference the Uttori Wiki middleware
const { wiki } = require('@uttori/wiki');

// Pull in our custom config, example above
const config = require('./config.js');

// Initilize Your app
const app = express();

// Setup the app
app.set('port', process.env.PORT || 8000);
app.set('ip', process.env.IP || '127.0.0.1');

// Setup Express
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Setup the wiki, could also mount under a sub directory path with other applications
app.use('/', wiki(config));

// Listen for connections
app.listen(app.get('port'), app.get('ip'), () => {
  console.log('✔ listening at %s:%d', app.get('ip'), app.get('port'));
});
```

## Events

The following events are avaliable to hook into through plugins and are used in the methods below:

| Name                         | Type       | Returns                   | Description |
|------------------------------|------------|---------------------------|-------------|
| `bind-routes`                | `dispatch` |                           | Called after the default routes are bound to the server. |
| `document-delete`            | `dispatch` |                           | Called when a document is about to be deleted. |
| `document-save`              | `filter`   | Uttori Document           | Called when a document is about to be saved. |
| `render-content`             | `filter`   | HTML Content              | Called when content is being prepared to be shown. |
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

## Classes

<dl>
<dt><a href="#UttoriWiki">UttoriWiki</a></dt>
<dd><p>UttoriWiki is a fast, simple, wiki knowledge base.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#debug">debug()</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#asyncHandler">asyncHandler()</a> : <code>function</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UttoriWikiDocument">UttoriWikiDocument</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="UttoriWiki"></a>

## UttoriWiki
UttoriWiki is a fast, simple, wiki knowledge base.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | The configuration object. |
| hooks | <code>EventDispatcher</code> | The hook / event dispatching object. |


* [UttoriWiki](#UttoriWiki)
    * [new UttoriWiki(config, server)](#new_UttoriWiki_new)
    * [.registerPlugins(config)](#UttoriWiki+registerPlugins)
    * [.validateConfig(config)](#UttoriWiki+validateConfig)
    * [.buildMetadata(document, [path], [robots])](#UttoriWiki+buildMetadata) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.bindRoutes(server)](#UttoriWiki+bindRoutes)
    * [.home(request, response, next)](#UttoriWiki+home)
    * [.homepageRedirect(request, response, _next)](#UttoriWiki+homepageRedirect)
    * [.tagIndex(request, response, _next)](#UttoriWiki+tagIndex)
    * [.tag(request, response, next)](#UttoriWiki+tag)
    * [.search(request, response, _next)](#UttoriWiki+search)
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
    * [.getTaggedDocuments(tag, [limit])](#UttoriWiki+getTaggedDocuments) ⇒ <code>Promise.&lt;Array&gt;</code>

<a name="new_UttoriWiki_new"></a>

### new UttoriWiki(config, server)
Creates an instance of UttoriWiki.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | A configuration object. |
| server | <code>Application</code> | The Express server instance. |

**Example** *(Init UttoriWiki)*  
```js
const server = express();
const wiki = new UttoriWiki(config, server);
server.listen(server.get('port'), server.get('ip'), () => { ... });
```
<a name="UttoriWiki+registerPlugins"></a>

### uttoriWiki.registerPlugins(config)
Registers plugins with the Event Dispatcher.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | A configuration object. |

<a name="UttoriWiki+validateConfig"></a>

### uttoriWiki.validateConfig(config)
Validates the config.

Hooks:
- `dispatch` - `validate-config` - Passes in the config object.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | A configuration object. |

<a name="UttoriWiki+buildMetadata"></a>

### uttoriWiki.buildMetadata(document, [path], [robots]) ⇒ <code>Promise.&lt;object&gt;</code>
Builds the metadata for the view model.

Hooks:
- `filter` - `render-content` - Passes in the meta description.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Metadata object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| document | [<code>UttoriWikiDocument</code>](#UttoriWikiDocument) \| <code>object</code> |  | A UttoriWikiDocument. |
| [path] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | The URL path to build meta data for. |
| [robots] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | A meta robots tag value. |

**Example**  
```js
const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
➜ {
  canonical,   // `${this.config.site_url}/private-document-path`
  robots,      // 'no-index'
  title,       // document.title
  description, // document.excerpt || document.content.slice(0, 160)
  modified,    // new Date(document.updateDate).toISOString()
  published,   // new Date(document.createDate).toISOString()
}
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
| server | <code>Application</code> | The Express server instance. |

<a name="UttoriWiki+home"></a>

### uttoriWiki.home(request, response, next)
Renders the homepage with the `home` template.

Hooks:
- `filter` - `render-content` - Passes in the home-page content.
- `filter` - `view-model-home` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+homepageRedirect"></a>

### uttoriWiki.homepageRedirect(request, response, _next)
Redirects to the homepage.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+tagIndex"></a>

### uttoriWiki.tagIndex(request, response, _next)
Renders the tag index page with the `tags` template.

Hooks:
- `filter` - `view-model-tag-index` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+tag"></a>

### uttoriWiki.tag(request, response, next)
Renders the tag detail page with `tag` template.
Sets the `X-Robots-Tag` header to `noindex`.
Attempts to pull in the relevant site section for the tag if defined in the config site sections.

Hooks:
- `filter` - `view-model-tag` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+search"></a>

### uttoriWiki.search(request, response, _next)
Renders the search page using the `search` template.

Hooks:
- `filter` - `render-search-results` - Passes in the search results.
- `filter` - `view-model-search` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

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
| next | <code>function</code> | The Express Next function. |

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
| next | <code>function</code> | The Express Next function. |

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
| next | <code>function</code> | The Express Next function. |

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
| next | <code>function</code> | The Express Next function. |

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
| next | <code>function</code> | The Express Next function. |

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
| next | <code>function</code> | The Express Next function. |

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
| next | <code>function</code> | The Express Next function. |

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
| next | <code>function</code> | The Express Next function. |

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
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+saveValid"></a>

### uttoriWiki.saveValid(request, response, _next)
Handles saving documents, and changing the slug of documents, then redirecting to the document.

`title`, `excerpt`, and `content` will default to a blank string
`tags` is expected to be a comma delimited string in the request body, "tag-1,tag-2"
`slug` will be converted to lowercase and will use `request.body.slug` and fall back to `request.params.slug`.

Hooks:
- `filter` - `document-save` - Passes in the document.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>Request</code> | The Express Request object. |
| response | <code>Response</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+getTaggedDocuments"></a>

### uttoriWiki.getTaggedDocuments(tag, [limit]) ⇒ <code>Promise.&lt;Array&gt;</code>
Returns the documents with the provided tag, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignore_slugs` array.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Promise object that resolves to the array of the documents.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tag | <code>string</code> |  | The tag to look for in documents. |
| [limit] | <code>number</code> | <code>1024</code> | The maximum number of documents to be returned. |

**Example**  
```js
wiki.getTaggedDocuments('example', 10);
➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
```
<a name="debug"></a>

## debug() : <code>function</code>
**Kind**: global function  
<a name="asyncHandler"></a>

## asyncHandler() : <code>function</code>
**Kind**: global function  
<a name="UttoriWikiDocument"></a>

## UttoriWikiDocument : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The document slug to be used in the URL and as a unique ID. |
| title | <code>string</code> | The document title to be used anywhere a title may be needed. |
| excerpt | <code>string</code> | A succinct deescription of the document, think meta description. |
| content | <code>string</code> | All text content for the doucment. |
| [html] | <code>string</code> | All rendered HTML content for the doucment that will be presented to the user. |
| createDate | <code>number</code> | The Unix timestamp of the creation date of the document. |
| updateDate | <code>number</code> | The Unix timestamp of the last update date to the document. |
| [redirects] | <code>Array.&lt;string&gt;</code> | An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks. |


* * *

## Tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
DEBUG=Uttori* npm test
```

## Contributors

- [Matthew Callis](https://github.com/MatthewCallis) - author of UttoriWiki

## License

[MIT](LICENSE)
