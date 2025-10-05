## Classes

<dl>
<dt><a href="#ImportDocument">ImportDocument</a></dt>
<dd><p>Uttori Import Document
Imports documents from a variety of sources, including markdown, PDF, and image files.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ImportDocumentConfigPage">ImportDocumentConfigPage</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ImportDocumentDownload">ImportDocumentDownload</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ImportDocumentProcessPage">ImportDocumentProcessPage</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ImportDocumentApiPayload">ImportDocumentApiPayload</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ImportDocumentConfig">ImportDocumentConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="ImportDocument"></a>

## ImportDocument
Uttori Import Document
Imports documents from a variety of sources, including markdown, PDF, and image files.

**Kind**: global class  

* [ImportDocument](#ImportDocument)
    * [.configKey](#ImportDocument.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#ImportDocument.defaultConfig) ⇒ [<code>ImportDocumentConfig</code>](#ImportDocumentConfig)
    * [.validateConfig(config, [_context])](#ImportDocument.validateConfig)
    * [.register(context)](#ImportDocument.register)
    * [.bindRoutes(server, context)](#ImportDocument.bindRoutes)
    * [.apiRequestHandler(context)](#ImportDocument.apiRequestHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.interfaceRequestHandler(context)](#ImportDocument.interfaceRequestHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.downloadFile(options)](#ImportDocument.downloadFile) ⇒ <code>Promise.&lt;void&gt;</code>
    * [.processPage(config, slug, page)](#ImportDocument.processPage) ⇒ [<code>Promise.&lt;ImportDocumentProcessPage&gt;</code>](#ImportDocumentProcessPage)

<a name="ImportDocument.configKey"></a>

### ImportDocument.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>ImportDocument</code>](#ImportDocument)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(ImportDocument.configKey)*  
```js
const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
```
<a name="ImportDocument.defaultConfig"></a>

### ImportDocument.defaultConfig() ⇒ [<code>ImportDocumentConfig</code>](#ImportDocumentConfig)
The default configuration.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)  
**Returns**: [<code>ImportDocumentConfig</code>](#ImportDocumentConfig) - The configuration.  
**Example** *(ImportDocument.defaultConfig())*  
```js
const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
```
<a name="ImportDocument.validateConfig"></a>

### ImportDocument.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, ImportDocumentConfig&gt;</code> | A provided configuration to use. |
| [_context] | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-import-document&#x27;, ImportDocumentConfig&gt;</code> | Unused. |

**Example** *(ImportDocument.validateConfig(config, _context))*  
```js
ImportDocument.validateConfig({ ... });
```
<a name="ImportDocument.register"></a>

### ImportDocument.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-import-document&#x27;, ImportDocumentConfig&gt;</code> | A Uttori-like context. |

**Example** *(ImportDocument.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [ImportDocument.configKey]: {
      ...,
      events: {
        bindRoutes: ['bind-routes'],
      },
    },
  },
};
ImportDocument.register(context);
```
<a name="ImportDocument.bindRoutes"></a>

### ImportDocument.bindRoutes(server, context)
Add the upload route to the server object.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | An Express server instance. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-import-document&#x27;, ImportDocumentConfig&gt;</code> | A Uttori-like context. |

**Example** *(ImportDocument.bindRoutes(server, context))*  
```js
const context = {
  config: {
    [ImportDocument.configKey]: {
      middleware: [],
      publicRoute: '/download',
    },
  },
};
ImportDocument.bindRoutes(server, context);
```
<a name="ImportDocument.apiRequestHandler"></a>

### ImportDocument.apiRequestHandler(context) ⇒ <code>module:express~RequestHandler</code>
The Express route method to process the upload request and provide a response.
Supports both file imports and URL scraping through the pages array.

File handling (detected by file extension in page.name):
- Markdown files (.md/.markdown): Used directly as content (supports URLs and local paths)
- PDF files (.pdf): Stored as attachments (supports URLs and local paths, stub articles only when PDF is the only page)
- Image files (.jpg/.jpeg/.png/.gif/.webp/.svg): Stored as attachments (supports URLs and local paths)
- Other files: Treated as URLs for web scraping

File processing:
- All file types support both URLs and local file paths
- URLs are downloaded using wget, local files are copied
- Provided 'image' parameter (URL) is downloaded to uploads directory
- Document image priority: downloaded image > first image page > provided image URL

Request body structure:
- pages: Array of page objects (files or URLs)
- title, image, excerpt, tags, slug, redirects: Document metadata

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-import-document&#x27;, ImportDocumentConfig&gt;</code> | A Uttori-like context. |

**Example** *(ImportDocument.apiRequestHandler(context)(request, response, _next))*  
```js
server.post('/chat-api', ImportDocument.apiRequestHandler(context));
```
<a name="ImportDocument.interfaceRequestHandler"></a>

### ImportDocument.interfaceRequestHandler(context) ⇒ <code>module:express~RequestHandler</code>
The Express request handler for the interface route.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-import-document&#x27;, ImportDocumentConfig&gt;</code> | A Uttori-like context. |

**Example** *(ImportDocument.interfaceRequestHandler(context)(request, response, _next))*  
```js
server.get('/import', ImportDocument.interfaceRequestHandler(context));
```
<a name="ImportDocument.downloadFile"></a>

### ImportDocument.downloadFile(options) ⇒ <code>Promise.&lt;void&gt;</code>
Downloads a file from a URL and saves it to the uploads directory.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>object</code> | The options for the download, represents a page |
| options.url | <code>string</code> | The URL of the file to download. |
| options.fileName | <code>string</code> | The name of the file to save the file to. |
| options.type | <code>string</code> | The type of the file to download. |

<a name="ImportDocument.processPage"></a>

### ImportDocument.processPage(config, slug, page) ⇒ [<code>Promise.&lt;ImportDocumentProcessPage&gt;</code>](#ImportDocumentProcessPage)
Processes a page and returns the content and attachment.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)  
**Returns**: [<code>Promise.&lt;ImportDocumentProcessPage&gt;</code>](#ImportDocumentProcessPage) - The content and attachments.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>ImportDocumentConfig</code>](#ImportDocumentConfig) | The configuration object. |
| slug | <code>string</code> | The slug of the document. |
| page | [<code>ImportDocumentConfigPage</code>](#ImportDocumentConfigPage) | The page to process. |

<a name="ImportDocumentConfigPage"></a>

## ImportDocumentConfigPage : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL of the page. |
| name | <code>string</code> | The name of the page. |
| type | <code>string</code> | The type of the page. |

<a name="ImportDocumentDownload"></a>

## ImportDocumentDownload : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL of the page. |
| fileName | <code>string</code> | The name of the file. |
| type | <code>string</code> | The type of the page. |

<a name="ImportDocumentProcessPage"></a>

## ImportDocumentProcessPage : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | The content of the page. |
| attachments | <code>Array.&lt;UttoriWikiDocumentAttachment&gt;</code> | The attachments of the page. |

<a name="ImportDocumentApiPayload"></a>

## ImportDocumentApiPayload : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The title of the document. |
| image | <code>string</code> | The image of the document. |
| excerpt | <code>string</code> | The excerpt of the document. |
| pages | [<code>Array.&lt;ImportDocumentConfigPage&gt;</code>](#ImportDocumentConfigPage) | The pages of the document. |
| tags | <code>Array.&lt;string&gt;</code> | The tags of the document. |
| slug | <code>string</code> | The slug of the document. |
| redirects | <code>Array.&lt;string&gt;</code> | The redirects of the document. |

<a name="ImportDocumentConfig"></a>

## ImportDocumentConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspond to methods, and contents are events to listen for. |
| [apiRoute] | <code>string</code> | The API route for importing documents. |
| [publicRoute] | <code>string</code> | Server route to show the import interface. |
| [uploadPath] | <code>string</code> | The path to reference uploaded files by. |
| [uploadDirectory] | <code>string</code> | The directory to upload files to. |
| [allowedReferrers] | <code>Array.&lt;string&gt;</code> | When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an empty array don't check at all. |
| [interfaceRequestHandler] | <code>function</code> | A request handler for the interface route. |
| [apiRequestHandler] | <code>function</code> | A request handler for the API route. |
| [middlewareApi] | <code>Array.&lt;module:express~RequestHandler&gt;</code> | Custom Middleware for the API route. |
| [middlewarePublic] | <code>Array.&lt;module:express~RequestHandler&gt;</code> | Custom Middleware for the public route. |
| [downloadFile] | <code>function</code> | A function to handle the download. |
| [processPage] | <code>function</code> | A function to handle the imported page processing. |

**Example** *(ImportDocumentConfig)*  
```js
const config = {
  events: {
    bindRoutes: ['bind-routes'],
    validateConfig: ['validate-config'],
  },
  middleware: {
    apiRoute: [],
    publicRoute: [],
  },
  apiRoute: '/import-api',
  publicRoute: '/import',
  uploadPath: 'uploads',
  uploadDirectory: path.join(__dirname, 'uploads'),
  allowedReferrers: [],
  apiRequestHandler: (context) => async (request, response, next) => {
    debug('apiRequestHandler');
    const { title, image, excerpt, pages, tags, slug, redirects } = request.body;
    const uploadDir = path.join(config.uploadDirectory, slug);
    await fs.promises.mkdir(uploadDir, { recursive: true });
    response.status(200).send({ ...document, error: null });
  },
  interfaceRequestHandler: (context) => async (request, response, next) => {
    debug('interfaceRequestHandler');
    let viewModel = {
      title: 'Import Document',
      config: context.config,
      session: request.session || {},
      slug: 'import-document',
      meta: {},
      basePath: request.baseUrl,
      flash: request.wikiFlash(),
    };
    viewModel = await context.hooks.filter('view-model-import-document', viewModel, this);
    response.set('X-Robots-Tag', 'noindex');
    response.render('import', viewModel);
  },
  middlewareApi: [],
  middlewarePublic: [],
};
```
