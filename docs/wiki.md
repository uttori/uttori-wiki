<a name="UttoriWiki"></a>

## UttoriWiki
UttoriWiki is a fast, simple, wiki knowledge base.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | The configuration object. |
| hooks | <code>EventDispatcher</code> | The hook / event dispatching object. |
| server | <code>object</code> | The Express server instance (only exposed when testing). |


* [UttoriWiki](#UttoriWiki)
    * [new UttoriWiki(config, server)](#new_UttoriWiki_new)
    * [.registerPlugins(config)](#UttoriWiki+registerPlugins)
    * [.validateConfig(config)](#UttoriWiki+validateConfig)
    * [.buildMetadata([document], [path], [robots])](#UttoriWiki+buildMetadata) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.bindRoutes(server)](#UttoriWiki+bindRoutes)
    * [.home(request, response, next)](#UttoriWiki+home)
    * [.homepageRedirect(request, response, _next)](#UttoriWiki+homepageRedirect)
    * [.tagIndex(request, response, _next)](#UttoriWiki+tagIndex)
    * [.tag(request, response, next)](#UttoriWiki+tag)
    * [.search(request, response, _next)](#UttoriWiki+search)
    * [.edit(request, response, next)](#UttoriWiki+edit)
    * [.delete(request, response, next)](#UttoriWiki+delete)
    * [.save(request, response, next)](#UttoriWiki+save)
    * [.new(request, response, _next)](#UttoriWiki+new)
    * [.detail(request, response, next)](#UttoriWiki+detail)
    * [.historyIndex(request, response, next)](#UttoriWiki+historyIndex)
    * [.historyDetail(request, response, next)](#UttoriWiki+historyDetail)
    * [.historyRestore(request, response, next)](#UttoriWiki+historyRestore)
    * [.notFound(request, response, _next)](#UttoriWiki+notFound)
    * [.saveValid(request, response, _next)](#UttoriWiki+saveValid)
    * [.getTaggedDocuments(tag, limit)](#UttoriWiki+getTaggedDocuments) ⇒ <code>Promise.&lt;Array&gt;</code>

<a name="new_UttoriWiki_new"></a>

### new UttoriWiki(config, server)
Creates an instance of UttoriWiki.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | A configuration object. |
| server | <code>object</code> | The Express server instance. |

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
| config | <code>object</code> | A configuration object. |
| config.plugins | <code>Array.&lt;object&gt;</code> | A collection of plugins to register. |

<a name="UttoriWiki+validateConfig"></a>

### uttoriWiki.validateConfig(config)
Validates the config.

Hooks:
- `dispatch` - `validate-config` - Passes in the config object.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>object</code> | A configuration object. |
| config.theme_dir | <code>string</code> | The path to the theme directory. |
| config.public_dir | <code>string</code> | The path to the public facing directory. |

<a name="UttoriWiki+buildMetadata"></a>

### uttoriWiki.buildMetadata([document], [path], [robots]) ⇒ <code>Promise.&lt;object&gt;</code>
Builds the metadata for the view model.

Hooks:
- `filter` - `render-content` - Passes in the meta description.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: <code>Promise.&lt;object&gt;</code> - Metadata object.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [document] | <code>object</code> | <code>{}</code> | A configuration object. |
| [document.excerpt] | <code>string</code> |  | The meta description to be used. |
| [document.content] | <code>string</code> |  | The document content to be used as a backup meta description when excerpt is not provided. |
| [document.updateDate] | <code>number</code> |  | The Unix timestamp of the last update date to the document. |
| [document.createDate] | <code>number</code> |  | The Unix timestamp of the creation date of the document. |
| [document.title] | <code>string</code> |  | The document title to be used in meta data. |
| [path] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | The URL path to build meta data for. |
| [robots] | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | A meta robots tag value. |

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
| server | <code>object</code> | The Express server instance. |

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
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+tagIndex"></a>

### uttoriWiki.tagIndex(request, response, _next)
Renders the tag index page with the `tags` template.

Hooks:
- `filter` - `view-model-tag-index` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+tag"></a>

### uttoriWiki.tag(request, response, next)
Renders the tag detail page with `tag` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-tag` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
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
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+edit"></a>

### uttoriWiki.edit(request, response, next)
Renders the edit page using the `edit` template.

Hooks:
- `filter` - `view-model-edit` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
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
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
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
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
| next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+new"></a>

### uttoriWiki.new(request, response, _next)
Renders the new page using the `edit` template.

Hooks:
- `filter` - `view-model-new` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+detail"></a>

### uttoriWiki.detail(request, response, next)
Renders the detail page using the `detail` template.

Hooks:
- `render-content` - `render-content` - Passes in the document content.
- `filter` - `view-model-detail` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
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
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
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
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
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
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
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
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+saveValid"></a>

### uttoriWiki.saveValid(request, response, _next)
Handles saving documents, and changing the slug of documents, then redirecting to the document.

Hooks:
- `filter` - `document-save` - Passes in the document.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>object</code> | The Express Request object. |
| response | <code>object</code> | The Express Response object. |
| _next | <code>function</code> | The Express Next function. |

<a name="UttoriWiki+getTaggedDocuments"></a>

### uttoriWiki.getTaggedDocuments(tag, limit) ⇒ <code>Promise.&lt;Array&gt;</code>
Returns the documents with the provided tag, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignore_slugs` array.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - Promise object that resolves to the array of the documents.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tag | <code>string</code> |  | The tag to look for in documents. |
| limit | <code>number</code> | <code>1024</code> | The maximum number of documents to be returned. |

**Example**  
```js
wiki.getTaggedDocuments('example', 10);
➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
```
