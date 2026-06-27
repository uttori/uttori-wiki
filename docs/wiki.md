## Classes

<dl>
<dt><a href="#UttoriWiki">UttoriWiki</a></dt>
<dd><p>UttoriWiki is a fast, simple, wiki knowledge base.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#routeParamToString">routeParamToString</a> ⇒ <code>string</code></dt>
<dd><p>Normalize an Express route parameter to a single string.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#normalizeRouteParams">normalizeRouteParams(params)</a> ⇒ <code>Record.&lt;string, string&gt;</code></dt>
<dd><p>Normalize Express route parameters to the string-only shape used by redirects.</p>
</dd>
<dt><a href="#normalizeAttachments">normalizeAttachments(rawAttachments)</a> ⇒ <code><a href="#UttoriWikiDocumentAttachment">Array.&lt;UttoriWikiDocumentAttachment&gt;</a></code></dt>
<dd><p>Normalize attachment metadata and ensure every attachment has an ID.</p>
</dd>
<dt><a href="#resolveImageAttachment">resolveImageAttachment(image, attachments)</a> ⇒ <code><a href="#UttoriWikiDocumentAttachment">UttoriWikiDocumentAttachment</a></code> | <code>undefined</code></dt>
<dd><p>Resolve an image reference against document attachments by ID, then by path.</p>
</dd>
<dt><a href="#isImageAttachment">isImageAttachment(attachment)</a> ⇒ <code>boolean</code></dt>
<dd><p>Check whether an attachment has an image MIME type.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#UttoriWikiViewModel">UttoriWikiViewModel</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#UttoriWikiBuildViewModelBaseOptions">UttoriWikiBuildViewModelBaseOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#UttoriWikiBaseViewModel">UttoriWikiBaseViewModel</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#UttoriWikiDocument">UttoriWikiDocument</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#UttoriWikiDocumentAttachment">UttoriWikiDocumentAttachment</a> : <code>object</code></dt>
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
| hooks | <code>module:@uttori/event-dispatcher~EventDispatcher</code> | The hook / event dispatching object. |


* [UttoriWiki](#UttoriWiki)
    * [new UttoriWiki(config, server)](#new_UttoriWiki_new)
    * [.config](#UttoriWiki+config) : <code>UttoriWikiConfig</code>
    * [.hooks](#UttoriWiki+hooks) : <code>module:@uttori/event-dispatcher~EventDispatcher</code>
    * [.home](#UttoriWiki+home)
    * [.homepageRedirect](#UttoriWiki+homepageRedirect) : <code>module:express~RequestHandler</code>
    * [.search](#UttoriWiki+search)
    * [.edit](#UttoriWiki+edit)
    * [.delete](#UttoriWiki+delete)
    * [.save](#UttoriWiki+save)
    * [.saveNew](#UttoriWiki+saveNew)
    * [.create](#UttoriWiki+create)
    * [.detail](#UttoriWiki+detail)
    * [.preview](#UttoriWiki+preview)
    * [.historyIndex](#UttoriWiki+historyIndex)
    * [.historyDetail](#UttoriWiki+historyDetail)
    * [.historyRestore](#UttoriWiki+historyRestore)
    * [.notFound](#UttoriWiki+notFound)
    * [.saveValid](#UttoriWiki+saveValid)
    * [.registerPlugins(config)](#UttoriWiki+registerPlugins)
    * [.validateConfig(config)](#UttoriWiki+validateConfig)
    * [.buildMetadata(document, [path], [robots])](#UttoriWiki+buildMetadata) ⇒ [<code>Promise.&lt;UttoriWikiDocumentMetaData&gt;</code>](#UttoriWikiDocumentMetaData)
    * [.buildViewModelBase(request, [options])](#UttoriWiki+buildViewModelBase) ⇒ [<code>UttoriWikiBaseViewModel</code>](#UttoriWikiBaseViewModel)
    * [.bindRoutes(server)](#UttoriWiki+bindRoutes)

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

### uttoriWiki.hooks : <code>module:@uttori/event-dispatcher~EventDispatcher</code>
**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  
<a name="UttoriWiki+home"></a>

### uttoriWiki.home
Renders the homepage with the `home` template.

Hooks:
- `filter` - `render-content` - Passes in the home-page content.
- `filter` - `view-model-home` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+homepageRedirect"></a>

### uttoriWiki.homepageRedirect : <code>module:express~RequestHandler</code>
Redirects to the homepage.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  
<a name="UttoriWiki+search"></a>

### uttoriWiki.search
Renders the search page using the `search` template.

Hooks:
- `filter` - `render-search-results` - Passes in the search results.
- `filter` - `view-model-search` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;{}, {}, {}, {s: string}&gt;</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+edit"></a>

### uttoriWiki.edit
Renders the edit page using the `edit` template.

Hooks:
- `filter` - `view-model-edit` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+delete"></a>

### uttoriWiki.delete
Attempts to delete a document and redirect to the homepage.
If the config `useDeleteKey` value is true, the key is verified before deleting.

Hooks:
- `dispatch` - `document-delete` - Passes in the document beind deleted.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+save"></a>

### uttoriWiki.save
Attempts to update an existing document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;SaveParams, {}, UttoriWikiDocument&gt;</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+saveNew"></a>

### uttoriWiki.saveNew
Attempts to save a new document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;SaveParams, {}, UttoriWikiDocument&gt;</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+create"></a>

### uttoriWiki.create
Renders the creation page using the `edit` template.

Hooks:
- `filter` - `view-model-new` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+detail"></a>

### uttoriWiki.detail
Renders the detail page using the `detail` template.

Hooks:
- `fetch` - `storage-get` - Get the requested content from the storage.
- `filter` - `render-content` - Passes in the document content.
- `filter` - `view-model-detail` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+preview"></a>

### uttoriWiki.preview
Renders the a preview of the passed in content.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `render-content` - Passes in the request body content.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+historyIndex"></a>

### uttoriWiki.historyIndex
Renders the history index page using the `history_index` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-index` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+historyDetail"></a>

### uttoriWiki.historyDetail
Renders the history detail page using the `detail` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `render-content` - Passes in the document content.
- `fetch` - `storage-get-revision` - Loads the requested revision (and the prior revision when diffing the newest).
- `fetch` - `storage-get` - Loads the live document for comparison when the requested revision is not the newest.
- `fetch` - `storage-get-history` - Lists revisions to detect the newest and choose a diff baseline.
- `filter` - `view-model-history-detail` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+historyRestore"></a>

### uttoriWiki.historyRestore
Renders the history restore page using the `edit` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-restore` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+notFound"></a>

### uttoriWiki.notFound
Renders the 404 Not Found page using the `404` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-error-404` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

<a name="UttoriWiki+saveValid"></a>

### uttoriWiki.saveValid
Handles saving documents, and changing the slug of documents, then redirecting to the document.

`title`, `excerpt`, and `content` will default to a blank string
`tags` is expected to be a comma delimited string in the request body, "tag-1,tag-2"
`slug` will be converted to lowercase and will use `request.body.slug` and fall back to `request.params.slug`.

Hooks:
- `filter` - `document-save` - Passes in the document.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request.&lt;SaveParams, {}, UttoriWikiDocument&gt;</code> | The Express Request object. |
| response | <code>module:express~Response</code> | The Express Response object. |
| next | <code>module:express~NextFunction</code> | The Express Next function. |

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
| document | [<code>Partial.&lt;UttoriWikiDocument&gt;</code>](#UttoriWikiDocument) | A UttoriWikiDocument. |
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
<a name="UttoriWiki+buildViewModelBase"></a>

### uttoriWiki.buildViewModelBase(request, [options]) ⇒ [<code>UttoriWikiBaseViewModel</code>](#UttoriWikiBaseViewModel)
Builds the base view model object for all routes.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)  
**Returns**: [<code>UttoriWikiBaseViewModel</code>](#UttoriWikiBaseViewModel) - Base view model.  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express Request object. |
| [options] | [<code>UttoriWikiBuildViewModelBaseOptions</code>](#UttoriWikiBuildViewModelBaseOptions) | Base view model values. |

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

<a name="routeParamToString"></a>

## routeParamToString ⇒ <code>string</code>
Normalize an Express route parameter to a single string.

**Kind**: global constant  
**Returns**: <code>string</code> - The normalized route parameter.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> \| <code>Array.&lt;string&gt;</code> \| <code>undefined</code> | The route parameter value. |

<a name="normalizeRouteParams"></a>

## normalizeRouteParams(params) ⇒ <code>Record.&lt;string, string&gt;</code>
Normalize Express route parameters to the string-only shape used by redirects.

**Kind**: global function  
**Returns**: <code>Record.&lt;string, string&gt;</code> - The normalized route parameters.  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Record.&lt;string, (string\|Array.&lt;string&gt;)&gt;</code> | The Express route parameters. |

<a name="normalizeAttachments"></a>

## normalizeAttachments(rawAttachments) ⇒ [<code>Array.&lt;UttoriWikiDocumentAttachment&gt;</code>](#UttoriWikiDocumentAttachment)
Normalize attachment metadata and ensure every attachment has an ID.

**Kind**: global function  
**Returns**: [<code>Array.&lt;UttoriWikiDocumentAttachment&gt;</code>](#UttoriWikiDocumentAttachment) - Normalized attachments.  

| Param | Type | Description |
| --- | --- | --- |
| rawAttachments | <code>unknown</code> | The request-provided attachment value. |

<a name="normalizeAttachments..attachments"></a>

### normalizeAttachments~attachments : [<code>Array.&lt;UttoriWikiDocumentAttachment&gt;</code>](#UttoriWikiDocumentAttachment)
**Kind**: inner constant of [<code>normalizeAttachments</code>](#normalizeAttachments)  
<a name="resolveImageAttachment"></a>

## resolveImageAttachment(image, attachments) ⇒ [<code>UttoriWikiDocumentAttachment</code>](#UttoriWikiDocumentAttachment) \| <code>undefined</code>
Resolve an image reference against document attachments by ID, then by path.

**Kind**: global function  
**Returns**: [<code>UttoriWikiDocumentAttachment</code>](#UttoriWikiDocumentAttachment) \| <code>undefined</code> - The matching attachment.  

| Param | Type | Description |
| --- | --- | --- |
| image | <code>string</code> | The requested image ID or path. |
| attachments | [<code>Array.&lt;UttoriWikiDocumentAttachment&gt;</code>](#UttoriWikiDocumentAttachment) | The document attachments. |

<a name="isImageAttachment"></a>

## isImageAttachment(attachment) ⇒ <code>boolean</code>
Check whether an attachment has an image MIME type.

**Kind**: global function  
**Returns**: <code>boolean</code> - Whether the attachment is an image.  

| Param | Type | Description |
| --- | --- | --- |
| attachment | [<code>UttoriWikiDocumentAttachment</code>](#UttoriWikiDocumentAttachment) \| <code>undefined</code> | The attachment to test. |

<a name="UttoriWikiViewModel"></a>

## UttoriWikiViewModel : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The document title to be used anywhere a title may be needed. |
| config | <code>UttoriWikiConfig</code> | The configuration object. |
| meta | [<code>UttoriWikiDocumentMetaData</code>](#UttoriWikiDocumentMetaData) | The metadata object. |
| basePath | <code>string</code> | The base path of the request. |
| [document] | [<code>UttoriWikiDocument</code>](#UttoriWikiDocument) | The document object. |
| [session] | <code>module:express-session~Session</code> | The Express session object. |
| [flash] | <code>boolean</code> \| <code>object</code> \| <code>Array.&lt;string&gt;</code> | The flash object. |
| [taggedDocuments] | [<code>Array.&lt;UttoriWikiDocument&gt;</code>](#UttoriWikiDocument) \| <code>Record.&lt;string, Array.&lt;UttoriWikiDocument&gt;&gt;</code> | Tag Routes Plugin: documents grouped by tag, or documents for a tag detail route. |
| [categorizedDocuments] | [<code>Array.&lt;UttoriWikiDocument&gt;</code>](#UttoriWikiDocument) \| <code>Record.&lt;string, Array.&lt;UttoriWikiDocument&gt;&gt;</code> | Category Routes Plugin: documents grouped by category, or documents for a category detail route. |
| [categoryTree] | <code>Record.&lt;string, object&gt;</code> | Category Routes Plugin: hierarchical category data for the category index. |
| [flattenedCategories] | <code>Array.&lt;object&gt;</code> | Category Routes Plugin: flattened category data for the category index. |
| [categoryPath] | <code>string</code> | Category Routes Plugin: the active category path for a category detail route. |
| [breadcrumbs] | <code>Array.&lt;object&gt;</code> | Category Routes Plugin: breadcrumb data for a category detail route. |
| [searchTerm] | <code>string</code> | The search term to be used in the search results. |
| [searchResults] | [<code>Array.&lt;UttoriWikiDocument&gt;</code>](#UttoriWikiDocument) | An array of search results. |
| [slug] | <code>string</code> | The slug of the document. |
| [action] | <code>string</code> | The action to be used in the form. |
| [revision] | <code>string</code> | The revision of the document. |
| [historyByDay] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object of history by day. |
| [currentDocument] | [<code>UttoriWikiDocument</code>](#UttoriWikiDocument) | The current version of the document for comparison. |
| [diffs] | <code>Record.&lt;string, string&gt;</code> | An object containing HTML table diffs for changed fields. |

<a name="UttoriWikiBuildViewModelBaseOptions"></a>

## UttoriWikiBuildViewModelBaseOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [title] | <code>string</code> | The title for the view model. |
| [meta] | [<code>UttoriWikiDocumentMetaData</code>](#UttoriWikiDocumentMetaData) | The metadata for the view model. |
| [slug] | <code>string</code> | The slug for the view model. |

<a name="UttoriWikiBaseViewModel"></a>

## UttoriWikiBaseViewModel : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The document title to be used anywhere a title may be needed. |
| config | <code>UttoriWikiConfig</code> | The configuration object. |
| [session] | <code>module:express-session~Session</code> | The Express session object. |
| meta | [<code>UttoriWikiDocumentMetaData</code>](#UttoriWikiDocumentMetaData) | The metadata object. |
| basePath | <code>string</code> | The base path of the request. |
| [flash] | <code>boolean</code> \| <code>object</code> \| <code>Array.&lt;string&gt;</code> | The flash object. |
| [slug] | <code>string</code> | The slug of the document. |

<a name="UttoriWikiDocument"></a>

## UttoriWikiDocument : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The document slug to be used in the URL and as a unique ID. |
| title | <code>string</code> | The document title to be used anywhere a title may be needed. |
| [image] | <code>string</code> | An ID reference to an attachment in the attachments array that represents the document in Open Graph or elsewhere. |
| [excerpt] | <code>string</code> | A succinct deescription of the document, think meta description. |
| content | <code>string</code> | All text content for the doucment. |
| [html] | <code>string</code> | All rendered HTML content for the doucment that will be presented to the user. |
| createDate | <code>number</code> | The Unix timestamp of the creation date of the document. |
| updateDate | <code>number</code> | The Unix timestamp of the last update date to the document. |
| tags | <code>string</code> \| <code>Array.&lt;string&gt;</code> | A collection of tags that represent the document. |
| [redirects] | <code>string</code> \| <code>Array.&lt;string&gt;</code> | An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks. |
| [layout] | <code>string</code> | The layout to use when rendering the document. |
| [attachments] | [<code>Array.&lt;UttoriWikiDocumentAttachment&gt;</code>](#UttoriWikiDocumentAttachment) | An array of attachments to the document with name being a display name, path being the path to the file, and type being the MIME type of the file. Useful for storing files like PDFs, images, etc. |

<a name="UttoriWikiDocumentAttachment"></a>

## UttoriWikiDocumentAttachment : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | The unique identifier of the attachment. |
| name | <code>string</code> | The display name of the attachment. |
| path | <code>string</code> | The path to the attachment. |
| type | <code>string</code> | The MIME type of the attachment. |
| size | <code>number</code> | The size of the attachment in bytes. |
| metadata | <code>object</code> | The metadata of the attachment. |
| [metadata.gps] | <code>string</code> | The GPS coordinates of the attachment. |
| [metadata.gps.lat] | <code>number</code> | The latitude of the GPS coordinates. |
| [metadata.gps.lon] | <code>number</code> | The longitude of the GPS coordinates. |
| [skip] | <code>boolean</code> | Whether to skip the attachment. Used to control whether to index the attachment. |

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

