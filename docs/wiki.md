## Classes

<dl>
<dt><a href="#UttoriWiki">UttoriWiki</a></dt>
<dd><p>UttoriWiki is a fast, simple, wiki knowledge base.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#routeParamToString">routeParamToString</a> ⇒</dt>
<dd><p>Normalize an Express route parameter to a single string.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#normalizeRouteParams">normalizeRouteParams(params)</a> ⇒</dt>
<dd><p>Normalize Express route parameters to the string-only shape used by redirects.</p>
</dd>
<dt><a href="#normalizeAttachments">normalizeAttachments(rawAttachments)</a> ⇒</dt>
<dd><p>Normalize attachment metadata and ensure every attachment has an ID.</p>
</dd>
<dt><a href="#resolveImageAttachment">resolveImageAttachment(image, attachments)</a> ⇒</dt>
<dd><p>Resolve an image reference against document attachments by ID, then by path.</p>
</dd>
<dt><a href="#isImageAttachment">isImageAttachment(attachment)</a> ⇒</dt>
<dd><p>Check whether an attachment has an image MIME type.</p>
</dd>
</dl>

<a name="UttoriWiki"></a>

## UttoriWiki
UttoriWiki is a fast, simple, wiki knowledge base.

**Kind**: global class\

* [UttoriWiki](#UttoriWiki)
    * [new UttoriWiki(config, server)](#new_UttoriWiki_new)
    * [.home](#UttoriWiki+home)
    * [.homepageRedirect](#UttoriWiki+homepageRedirect)
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
    * [.buildMetadata(document, [path], [robots])](#UttoriWiki+buildMetadata) ⇒
    * [.buildViewModelBase(request, [options])](#UttoriWiki+buildViewModelBase) ⇒
    * [.bindRoutes(server)](#UttoriWiki+bindRoutes)

<a name="new_UttoriWiki_new"></a>

### new UttoriWiki(config, server)
Creates an instance of UttoriWiki.


| Param | Description |
| --- | --- |
| config | A configuration object. |
| server | The Express server instance. |

**Example** *(Init UttoriWiki)*\
```js
const server = express();
const wiki = new UttoriWiki(config, server);
server.listen(server.get('port'), server.get('ip'), () => { ... });
```
<a name="UttoriWiki+home"></a>

### uttoriWiki.home
Renders the homepage with the `home` template.

Hooks:
- `filter` - `render-content` - Passes in the home-page content.
- `filter` - `view-model-home` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+homepageRedirect"></a>

### uttoriWiki.homepageRedirect
Redirects to the homepage.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\
<a name="UttoriWiki+search"></a>

### uttoriWiki.search
Renders the search page using the `search` template.

Hooks:
- `filter` - `render-search-results` - Passes in the search results.
- `filter` - `view-model-search` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+edit"></a>

### uttoriWiki.edit
Renders the edit page using the `edit` template.

Hooks:
- `filter` - `view-model-edit` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+delete"></a>

### uttoriWiki.delete
Attempts to delete a document and redirect to the homepage.
If the config `useDeleteKey` value is true, the key is verified before deleting.

Hooks:
- `dispatch` - `document-delete` - Passes in the document beind deleted.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+save"></a>

### uttoriWiki.save
Attempts to update an existing document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+saveNew"></a>

### uttoriWiki.saveNew
Attempts to save a new document and redirects to the detail view of that document when successful.

Hooks:
- `validate` - `validate-save` - Passes in the request.
- `dispatch` - `validate-invalid` - Passes in the request.
- `dispatch` - `validate-valid` - Passes in the request.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+create"></a>

### uttoriWiki.create
Renders the creation page using the `edit` template.

Hooks:
- `filter` - `view-model-new` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+detail"></a>

### uttoriWiki.detail
Renders the detail page using the `detail` template.

Hooks:
- `fetch` - `storage-get` - Get the requested content from the storage.
- `filter` - `render-content` - Passes in the document content.
- `filter` - `view-model-detail` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+preview"></a>

### uttoriWiki.preview
Renders the a preview of the passed in content.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `render-content` - Passes in the request body content.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+historyIndex"></a>

### uttoriWiki.historyIndex
Renders the history index page using the `history_index` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-index` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

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

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+historyRestore"></a>

### uttoriWiki.historyRestore
Renders the history restore page using the `edit` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-history-restore` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+notFound"></a>

### uttoriWiki.notFound
Renders the 404 Not Found page using the `404` template.
Sets the `X-Robots-Tag` header to `noindex`.

Hooks:
- `filter` - `view-model-error-404` - Passes in the viewModel.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+saveValid"></a>

### uttoriWiki.saveValid
Handles saving documents, and changing the slug of documents, then redirecting to the document.

`title`, `excerpt`, and `content` will default to a blank string
`tags` is expected to be a comma delimited string in the request body, "tag-1,tag-2"
`slug` will be converted to lowercase and will use `request.body.slug` and fall back to `request.params.slug`.

Hooks:
- `filter` - `document-save` - Passes in the document.

**Kind**: instance property of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| response | The Express Response object. |
| next | The Express Next function. |

<a name="UttoriWiki+registerPlugins"></a>

### uttoriWiki.registerPlugins(config)
Registers plugins with the Event Dispatcher.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| config | A configuration object. |

<a name="UttoriWiki+validateConfig"></a>

### uttoriWiki.validateConfig(config)
Validates the config.

Hooks:
- `dispatch` - `validate-config` - Passes in the config object.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| config | A configuration object. |

<a name="UttoriWiki+buildMetadata"></a>

### uttoriWiki.buildMetadata(document, [path], [robots]) ⇒
Builds the metadata for the view model.

Hooks:
- `filter` - `render-content` - Passes in the meta description.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)\
**Returns**: Metadata object.\

| Param | Description |
| --- | --- |
| document | A UttoriWikiDocument. |
| [path] | The URL path to build meta data for with leading slash. |
| [robots] | A meta robots tag value. |

**Example**\
```js
const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
➜ {
  canonical, // `${this.config.publicUrl}/private-document-path`
  robots, // 'no-index'
  title, // document.title
  description, // document.excerpt || document.content.slice(0, 160)
  modified, // new Date(document.updateDate).toISOString()
  published, // new Date(document.createDate).toISOString()
}
```
<a name="UttoriWiki+buildViewModelBase"></a>

### uttoriWiki.buildViewModelBase(request, [options]) ⇒
Builds the base view model object for all routes.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)\
**Returns**: Base view model.\

| Param | Description |
| --- | --- |
| request | The Express Request object. |
| [options] | Base view model values. |

<a name="UttoriWiki+bindRoutes"></a>

### uttoriWiki.bindRoutes(server)
Bind the routes to the server.
Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All

Hooks:
- `dispatch` - `bind-routes` - Passes in the server instance.

**Kind**: instance method of [<code>UttoriWiki</code>](#UttoriWiki)\

| Param | Description |
| --- | --- |
| server | The Express server instance. |

<a name="routeParamToString"></a>

## routeParamToString ⇒
Normalize an Express route parameter to a single string.

**Kind**: global constant\
**Returns**: The normalized route parameter.\

| Param | Description |
| --- | --- |
| value | The route parameter value. |

<a name="normalizeRouteParams"></a>

## normalizeRouteParams(params) ⇒
Normalize Express route parameters to the string-only shape used by redirects.

**Kind**: global function\
**Returns**: The normalized route parameters.\

| Param | Description |
| --- | --- |
| params | The Express route parameters. |

<a name="normalizeAttachments"></a>

## normalizeAttachments(rawAttachments) ⇒
Normalize attachment metadata and ensure every attachment has an ID.

**Kind**: global function\
**Returns**: Normalized attachments.\

| Param | Description |
| --- | --- |
| rawAttachments | The request-provided attachment value. |

<a name="resolveImageAttachment"></a>

## resolveImageAttachment(image, attachments) ⇒
Resolve an image reference against document attachments by ID, then by path.

**Kind**: global function\
**Returns**: The matching attachment.\

| Param | Description |
| --- | --- |
| image | The requested image ID or path. |
| attachments | The document attachments. |

<a name="isImageAttachment"></a>

## isImageAttachment(attachment) ⇒
Check whether an attachment has an image MIME type.

**Kind**: global function\
**Returns**: Whether the attachment is an image.\

| Param | Description |
| --- | --- |
| attachment | The attachment to test. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { UttoriWikiBuildViewModelBaseOptions, UttoriWikiBaseViewModel, UttoriWikiDocument, UttoriWikiDocumentMetaData } from './types/wiki.js';
export type { UttoriWikiViewModel, UttoriWikiBuildViewModelBaseOptions, UttoriWikiBaseViewModel, UttoriWikiDocument, UttoriWikiDocumentAttachment, UttoriWikiDocumentMetaData, } from './types/wiki.js';
/**
 * Normalize an Express route parameter to a single string.
 * @param value The route parameter value.
 * @returns The normalized route parameter.
 */
export declare const routeParamToString: (value: string | string[] | undefined) => string;
/**
 * UttoriWiki is a fast, simple, wiki knowledge base.
 * @example <caption>Init UttoriWiki</caption>
 * const server = express();
 * const wiki = new UttoriWiki(config, server);
 * server.listen(server.get('port'), server.get('ip'), () => { ... });
 */
declare class UttoriWiki {
    /** User configuration merged with wiki defaults before plugins register. */
    config: import('./config.js').UttoriWikiConfig;
    /** Event dispatcher owned by this wiki instance and shared with its plugins. */
    hooks: import('@uttori/event-dispatcher').EventDispatcher;
    /**
     * Creates an instance of UttoriWiki.
     * @param config A configuration object.
     * @param server The Express server instance.
     */
    constructor(config: import('./config.js').UttoriWikiConfig, server: import('express').Application);
    /**
     * Registers plugins with the Event Dispatcher.
     * @param config A configuration object.
     */
    registerPlugins(config: import('./config.js').UttoriWikiConfig): void;
    /**
     * Validates the config.
     *
     * Hooks:
     * - `dispatch` - `validate-config` - Passes in the config object.
     * @param config A configuration object.
     */
    validateConfig(config: import('./config.js').UttoriWikiConfig): void;
    /**
     * Builds the metadata for the view model.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the meta description.
     * @async
     * @param document A UttoriWikiDocument.
     * @param [path] The URL path to build meta data for with leading slash.
     * @param [robots] A meta robots tag value.
     * @returns Metadata object.
     * @example
     * const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
     * ➜ {
     *   canonical, // `${this.config.publicUrl}/private-document-path`
     *   robots, // 'no-index'
     *   title, // document.title
     *   description, // document.excerpt || document.content.slice(0, 160)
     *   modified, // new Date(document.updateDate).toISOString()
     *   published, // new Date(document.createDate).toISOString()
     * }
     */
    buildMetadata(document: Partial<UttoriWikiDocument>, path?: string, robots?: string): Promise<UttoriWikiDocumentMetaData>;
    /**
     * Builds the base view model object for all routes.
     * @param request The Express Request object.
     * @param [options] Base view model values.
     * @returns Base view model.
     */
    buildViewModelBase(request: import('express').Request, options?: UttoriWikiBuildViewModelBaseOptions): UttoriWikiBaseViewModel;
    /**
     * Bind the routes to the server.
     * Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All
     *
     * Hooks:
     * - `dispatch` - `bind-routes` - Passes in the server instance.
     * @param server The Express server instance.
     */
    bindRoutes(server: import('express').Application): void;
    /**
     * Renders the homepage with the `home` template.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the home-page content.
     * - `filter` - `view-model-home` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    home: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Redirects to the homepage.
     *
     */
    homepageRedirect: import('express').RequestHandler;
    /**
     * Renders the search page using the `search` template.
     *
     * Hooks:
     * - `filter` - `render-search-results` - Passes in the search results.
     * - `filter` - `view-model-search` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    search: (request: import('express').Request<Record<string, never>, Record<string, never>, Record<string, never>, {
        s: string;
    }>, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the edit page using the `edit` template.
     *
     * Hooks:
     * - `filter` - `view-model-edit` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    edit: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Attempts to delete a document and redirect to the homepage.
     * If the config `useDeleteKey` value is true, the key is verified before deleting.
     *
     * Hooks:
     * - `dispatch` - `document-delete` - Passes in the document beind deleted.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    delete: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Attempts to update an existing document and redirects to the detail view of that document when successful.
     *
     * Hooks:
     * - `validate` - `validate-save` - Passes in the request.
     * - `dispatch` - `validate-invalid` - Passes in the request.
     * - `dispatch` - `validate-valid` - Passes in the request.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    save: (request: import('express').Request<import('./custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Attempts to save a new document and redirects to the detail view of that document when successful.
     *
     * Hooks:
     * - `validate` - `validate-save` - Passes in the request.
     * - `dispatch` - `validate-invalid` - Passes in the request.
     * - `dispatch` - `validate-valid` - Passes in the request.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    saveNew: (request: import('express').Request<import('./custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the creation page using the `edit` template.
     *
     * Hooks:
     * - `filter` - `view-model-new` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    create: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the detail page using the `detail` template.
     *
     * Hooks:
     * - `fetch` - `storage-get` - Get the requested content from the storage.
     * - `filter` - `render-content` - Passes in the document content.
     * - `filter` - `view-model-detail` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    detail: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the a preview of the passed in content.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the request body content.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    preview: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the history index page using the `history_index` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-history-index` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    historyIndex: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the history detail page using the `detail` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the document content.
     * - `fetch` - `storage-get-revision` - Loads the requested revision (and the prior revision when diffing the newest).
     * - `fetch` - `storage-get` - Loads the live document for comparison when the requested revision is not the newest.
     * - `fetch` - `storage-get-history` - Lists revisions to detect the newest and choose a diff baseline.
     * - `filter` - `view-model-history-detail` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    historyDetail: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the history restore page using the `edit` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-history-restore` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    historyRestore: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the 404 Not Found page using the `404` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-error-404` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    notFound: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Handles saving documents, and changing the slug of documents, then redirecting to the document.
     *
     * `title`, `excerpt`, and `content` will default to a blank string
     * `tags` is expected to be a comma delimited string in the request body, "tag-1,tag-2"
     * `slug` will be converted to lowercase and will use `request.body.slug` and fall back to `request.params.slug`.
     *
     * Hooks:
     * - `filter` - `document-save` - Passes in the document.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    saveValid: (request: import('express').Request<import('./custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
}
export default UttoriWiki;

export interface UttoriWikiViewModel {
    /** The document title to be used anywhere a title may be needed. */
    title: string;
    /** The configuration object. */
    config: import('../config.js').UttoriWikiConfig;
    /** The metadata object. */
    meta?: UttoriWikiDocumentMetaData;
    /** The base path of the request. */
    basePath: string;
    /** The document object. */
    document?: UttoriWikiDocument;
    /** The Express session object. */
    session?: import('express-session').Session & Partial<import('express-session').SessionData>;
    /** The flash object. */
    flash?: (boolean | object | string[]);
    /** Tag Routes Plugin: documents grouped by tag, or documents for a tag detail route. */
    taggedDocuments?: UttoriWikiDocument[] | Record<string, UttoriWikiDocument[]>;
    /** Category Routes Plugin: documents grouped by category, or documents for a category detail route. */
    categorizedDocuments?: UttoriWikiDocument[] | Record<string, UttoriWikiDocument[]>;
    /** Category Routes Plugin: hierarchical category data for the category index. */
    categoryTree?: Record<string, object>;
    /** Category Routes Plugin: flattened category data for the category index. */
    flattenedCategories?: object[];
    /** Category Routes Plugin: the active category path for a category detail route. */
    categoryPath?: string;
    /** Category Routes Plugin: breadcrumb data for a category detail route. */
    breadcrumbs?: object[];
    /** The search term to be used in the search results. */
    searchTerm?: string;
    /** An array of search results. */
    searchResults?: UttoriWikiDocument[];
    /** The slug of the document. */
    slug?: string;
    /** The action to be used in the form. */
    action?: string;
    /** The revision of the document. */
    revision?: string;
    /** An object of history by day. */
    historyByDay?: Record<string, string[]>;
    /** The current version of the document for comparison. */
    currentDocument?: UttoriWikiDocument;
    /** An object containing HTML table diffs for changed fields. */
    diffs?: Record<string, string>;
}
export interface UttoriWikiBuildViewModelBaseOptions {
    /** The title for the view model. */
    title?: string;
    /** The metadata for the view model. */
    meta?: UttoriWikiDocumentMetaData;
    /** The slug for the view model. */
    slug?: string;
}
export interface UttoriWikiBaseViewModel {
    /** The document title to be used anywhere a title may be needed. */
    title: string;
    /** The configuration object. */
    config: import('../config.js').UttoriWikiConfig;
    /** The Express session object. */
    session?: import('express-session').Session & Partial<import('express-session').SessionData>;
    /** The metadata object. */
    meta?: UttoriWikiDocumentMetaData;
    /** The base path of the request. */
    basePath: string;
    /** The flash object. */
    flash?: (boolean | object | string[]);
    /** The slug of the document. */
    slug?: string;
}
export interface UttoriWikiDocument {
    /** Plugin-defined document fields preserved by storage and allowedDocumentKeys. */
    [key: string]: unknown;
    /** The document slug to be used in the URL and as a unique ID. */
    slug: string;
    /** The document title to be used anywhere a title may be needed. */
    title: string;
    /**
     * An ID reference to an attachment in the attachments array that represents the document in Open Graph or elsewhere.
     */
    image?: string | null;
    /** A succinct deescription of the document, think meta description. */
    excerpt?: string;
    /** All text content for the doucment. */
    content: string;
    /** All rendered HTML content for the doucment that will be presented to the user. */
    html?: string;
    /** Milliseconds since the Unix epoch when the document was created. */
    createDate: number;
    /** Milliseconds since the Unix epoch when the document was last updated. */
    updateDate: number;
    /** A collection of tags that represent the document. */
    tags: string | string[];
    /**
     * An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks.
     */
    redirects?: string | string[];
    /** The layout to use when rendering the document. */
    layout?: string;
    /**
     * An array of attachments to the document with name being a display name, path being the path to the file, and type being the MIME type of the file. Useful for storing files like PDFs, images, etc.
     */
    attachments?: UttoriWikiDocumentAttachment[];
}
export interface UttoriWikiDocumentAttachment {
    /** The unique identifier of the attachment. */
    id: string;
    /** The display name of the attachment. */
    name: string;
    /** The path to the attachment. */
    path: string;
    /** The MIME type of the attachment. */
    type: string;
    /** The size of the attachment in bytes. */
    size: number;
    /** The metadata of the attachment. */
    metadata: {
        gps?: string;
    };
    /** The latitude of the GPS coordinates. */
    lat?: number;
    /** The longitude of the GPS coordinates. */
    lon?: number;
    /** Whether to skip the attachment. Used to control whether to index the attachment. */
    skip?: boolean;
}
export interface UttoriWikiDocumentMetaData {
    /** `${this.config.publicUrl}/private-document-path` */
    canonical: string;
    /** 'no-index' */
    robots: string;
    /** document.title */
    title: string;
    /** document.excerpt || document.content.slice(0, 160) */
    description: string;
    /** new Date(document.updateDate).toISOString() */
    modified: string;
    /** new Date(document.createDate).toISOString() */
    published: string;
    /** OpenGraph Image */
    image: string;
}
```

</details>
