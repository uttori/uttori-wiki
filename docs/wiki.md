## Classes

<dl>
<dt><a href="#UttoriWiki">UttoriWiki</a></dt>
<dd><p>UttoriWiki is a fast, simple, wiki knowledge base.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#asyncHandler">asyncHandler()</a> : <code>AsyncRequestHandler</code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UttoriWikiDocument">UttoriWikiDocument</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#UttoriWikiDocumentMetaData">UttoriWikiDocumentMetaData</a> : <code>object</code></dt>
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
    * [.config](#UttoriWiki+config) : <code>UttoriWikiConfig</code>
    * [.hooks](#UttoriWiki+hooks) : <code>EventDispatcher</code>
    * [.registerPlugins(config)](#UttoriWiki+registerPlugins)
    * [.validateConfig(config)](#UttoriWiki+validateConfig)
    * [.buildMetadata(document, [path], [robots])](#UttoriWiki+buildMetadata) ⇒ [<code>Promise.&lt;UttoriWikiDocumentMetaData&gt;</code>](#UttoriWikiDocumentMetaData)
    * [.bindRoutes(server)](#UttoriWiki+bindRoutes)
    * [.home(request, response, next)](#UttoriWiki+home)
    * [.homepageRedirect(request, response, _next)](#UttoriWiki+homepageRedirect)
    * [.tagIndex(request, response, next)](#UttoriWiki+tagIndex)
    * [.tag(request, response, next)](#UttoriWiki+tag)
    * [.search(request, response, next)](#UttoriWiki+search)
    * [.edit(request, response, next)](#UttoriWiki+edit)
    * [.delete(request, response, next)](#UttoriWiki+delete)
    * [.save(request, response, next)](#UttoriWiki+save)
    * [.saveNew(request, response, next)](#UttoriWiki+saveNew)
    * [.create(request, response, next)](#UttoriWiki+create)
    * [.detail(request, response, next)](#UttoriWiki+detail)
    * [.preview(request, response, next)](#UttoriWiki+preview)
    * [.historyIndex(request, response, next)](#UttoriWiki+historyIndex)
    * [.historyDetail(request, response, next)](#UttoriWiki+historyDetail)
    * [.historyRestore(request, response, next)](#UttoriWiki+historyRestore)
    * [.notFound(request, response, next)](#UttoriWiki+notFound)
    * [.saveValid(request, response, next)](#UttoriWiki+saveValid)
    * [.getTaggedDocuments(tag, [limit])](#UttoriWiki+getTaggedDocuments) ⇒ <code>Promise.&lt;Array&gt;</code>

<a name="new_UttoriWiki_new"></a>

### new UttoriWiki(config, server)
Creates an instance of UttoriWiki.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>UttoriWikiConfig</code> | A configuration object. |
| server | <code>module:express~Application</code> | The Express server instance. |

**Example** *(Init UttoriWiki)*  
```js
const server = express();
const wiki = new UttoriWiki(config, server);
server.listen(server.get('port'), server.get('ip'), () => { ... });
```
<a name="UttoriWiki+config"></a>

### uttoriWiki.config : <code>UttoriWikiConfig</code>
**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  
<a name="UttoriWiki+hooks"></a>

### uttoriWiki.hooks : <code>EventDispatcher</code>
**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  
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

### uttoriWiki.buildMetadata(document, [path], [robots]) ⇒ [<code>Promise.&lt;UttoriWikiDocumentMetaData&gt;</code>](#UttoriWikiDocumentMetaData)
Builds the metadata for the view model.

Hooks:
- `filter` - `render-content` - Passes in the meta description.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: [<code>Promise.&lt;UttoriWikiDocumentMetaData&gt;</code>](#UttoriWikiDocumentMetaData) - Metadata object.  

| Param | Type | Description |
| --- | --- | --- |
| document | [<code>UttoriWikiDocument</code>](#UttoriWikiDocument) \| <code>object</code> | A UttoriWikiDocument. |
| [path] | <code>string</code> | The URL path to build meta data for with leading slash. |
| [robots] | <code>string</code> | A meta robots tag value. |

**Example**  
```js
const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
➜ {
  canonical,   // `${this.config.publicUrl}/private-document-path`
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
| server | <code>module:express~Application</code> | The Express server instance. |

<a name="UttoriWiki+home"></a>

### uttoriWiki.home(request, response, next)
Renders the homepage with the `home` template.

Hooks:
- `filter` - `render-content` - Passes in the home-page content.
- `filter` - `view-model-home` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+homepageRedirect"></a>

### uttoriWiki.homepageRedirect(request, response, _next)
Redirects to the homepage.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| _next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+tagIndex"></a>

### uttoriWiki.tagIndex(request, response, next)
Renders the tag index page with the `tags` template.

Hooks:
- `filter` - `view-model-tag-index` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

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
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+search"></a>

### uttoriWiki.search(request, response, next)
Renders the search page using the `search` template.

Hooks:
- `filter` - `render-search-results` - Passes in the search results.
- `filter` - `view-model-search` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+edit"></a>

### uttoriWiki.edit(request, response, next)
Renders the edit page using the `edit` template.

Hooks:
- `filter` - `view-model-edit` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+delete"></a>

### uttoriWiki.delete(request, response, next)
Attempts to delete a document and redirect to the homepage.
If the config `useDeleteKey` value is true, the key is verified before deleting.

Hooks:
- `dispatch` - `document-delete` - Passes in the document beind deleted.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+save"></a>

### uttoriWiki.save(request, response, next)
Attempts to update an existing document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+saveNew"></a>

### uttoriWiki.saveNew(request, response, next)
Attempts to save a new document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+create"></a>

### uttoriWiki.create(request, response, next)
Renders the creation page using the `edit` template.

Hooks:
- `filter` - `view-model-new` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+detail"></a>

### uttoriWiki.detail(request, response, next)
Renders the detail page using the `detail` template.

Hooks:
- `fetch` - `storage-get` - Get the requested content from the storage.
- `filter` - `render-content` - Passes in the document content.
- `filter` - `view-model-detail` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+preview"></a>

### uttoriWiki.preview(request, response, next)
Renders the a preview of the passed in content.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `render-content` - `render-content` - Passes in the request body content.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+historyIndex"></a>

### uttoriWiki.historyIndex(request, response, next)
Renders the history index page using the `history_index` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-index` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

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
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+historyRestore"></a>

### uttoriWiki.historyRestore(request, response, next)
Renders the history restore page using the `edit` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-restore` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+notFound"></a>

### uttoriWiki.notFound(request, response, next)
Renders the 404 Not Found page using the `404` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-error-404` - Passes in the viewModel.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+saveValid"></a>

### uttoriWiki.saveValid(request, response, next)
Handles saving documents, and changing the slug of documents, then redirecting to the document.

`title`, `excerpt`, and `content` will default to a blank string
`tags` is expected to be a comma delimited string in the request body, "tag-1,tag-2"
`slug` will be converted to lowercase and will use `request.body.slug` and fall back to `request.params.slug`.

Hooks:
- `filter` - `document-save` - Passes in the document.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+getTaggedDocuments"></a>

### uttoriWiki.getTaggedDocuments(tag, [limit]) ⇒ <code>Promise.&lt;Array&gt;</code>
Returns the documents with the provided tag, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignoreSlugs` array.

Hooks:
- `fetch` - `storage-query` - Searched for the tagged documents.

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
<a name="asyncHandler"></a>

## asyncHandler() : <code>AsyncRequestHandler</code>
**Kind**: global function  
<a name="UttoriWikiDocument"></a>

## UttoriWikiDocument : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The document slug to be used in the URL and as a unique ID. |
| title | <code>string</code> | The document title to be used anywhere a title may be needed. |
| [image] | <code>string</code> | An image to represent the document in Open Graph or elsewhere. |
| [excerpt] | <code>string</code> | A succinct deescription of the document, think meta description. |
| content | <code>string</code> | All text content for the doucment. |
| [html] | <code>string</code> | All rendered HTML content for the doucment that will be presented to the user. |
| createDate | <code>number</code> | The Unix timestamp of the creation date of the document. |
| updateDate | <code>number</code> | The Unix timestamp of the last update date to the document. |
| tags | <code>Array.&lt;string&gt;</code> | A collection of tags that represent the document. |
| [redirects] | <code>Array.&lt;string&gt;</code> | An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks. |

<a name="UttoriWikiDocumentMetaData"></a>

## UttoriWikiDocumentMetaData : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| canonical | <code>string</code> | `${this.config.publicUrl}/private-document-path` |
| robots | <code>string</code> | 'no-index' |
| title | <code>string</code> | document.title |
| description | <code>string</code> | document.excerpt || document.content.slice(0, 160) |
| modified | <code>string</code> | new Date(document.updateDate).toISOString() |
| published | <code>string</code> | new Date(document.createDate).toISOString() |
| image | <code>string</code> | OpenGraph Image |

