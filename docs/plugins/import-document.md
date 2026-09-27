<a name="ImportDocument"></a>

## ImportDocument
Uttori Import Document
Imports documents from a variety of sources, including markdown, PDF, and image files.

**Kind**: global class\

* [ImportDocument](#ImportDocument)
    * [.configKey](#ImportDocument.configKey) ⇒
    * [.defaultConfig()](#ImportDocument.defaultConfig) ⇒
    * [.validateConfig(config, [_context])](#ImportDocument.validateConfig)
    * [.register(context)](#ImportDocument.register)
    * [.bindRoutes(server, context)](#ImportDocument.bindRoutes)
    * [.apiRequestHandler(context)](#ImportDocument.apiRequestHandler) ⇒
    * [.interfaceRequestHandler(context)](#ImportDocument.interfaceRequestHandler) ⇒
    * [.downloadFile(options)](#ImportDocument.downloadFile)
    * [.processPage(config, slug, page)](#ImportDocument.processPage) ⇒

<a name="ImportDocument.configKey"></a>

### ImportDocument.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>ImportDocument</code>](#ImportDocument)\
**Returns**: The configuration key.\
**Example** *(ImportDocument.configKey)*\
```js
const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
```
<a name="ImportDocument.defaultConfig"></a>

### ImportDocument.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)\
**Returns**: The configuration.\
**Example** *(ImportDocument.defaultConfig())*\
```js
const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
```
<a name="ImportDocument.validateConfig"></a>

### ImportDocument.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |
| [_context] | Unused. |

**Example** *(ImportDocument.validateConfig(config, _context))*\
```js
ImportDocument.validateConfig({ ... });
```
<a name="ImportDocument.register"></a>

### ImportDocument.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(ImportDocument.register(context))*\
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

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| context | A Uttori-like context. |

**Example** *(ImportDocument.bindRoutes(server, context))*\
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

### ImportDocument.apiRequestHandler(context) ⇒
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

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(ImportDocument.apiRequestHandler(context)(request, response, _next))*\
```js
server.post('/chat-api', ImportDocument.apiRequestHandler(context));
```
<a name="ImportDocument.interfaceRequestHandler"></a>

### ImportDocument.interfaceRequestHandler(context) ⇒
The Express request handler for the interface route.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(ImportDocument.interfaceRequestHandler(context)(request, response, _next))*\
```js
server.get('/import', ImportDocument.interfaceRequestHandler(context));
```
<a name="ImportDocument.downloadFile"></a>

### ImportDocument.downloadFile(options)
Downloads a file from a URL and saves it to the uploads directory.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)\

| Param | Description |
| --- | --- |
| options | The options for the download, represents a page |
| options.url | The URL of the file to download. |
| options.fileName | The name of the file to save the file to. |
| options.type | The type of the file to download. |

<a name="ImportDocument.processPage"></a>

### ImportDocument.processPage(config, slug, page) ⇒
Processes a page and returns the content and attachment.

**Kind**: static method of [<code>ImportDocument</code>](#ImportDocument)\
**Returns**: The content and attachments.\

| Param | Description |
| --- | --- |
| config | The configuration object. |
| slug | The slug of the document. |
| page | The page to process. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { ImportDocumentConfigPage, ImportDocumentProcessConfig, ImportDocumentProcessPage, ImportDocumentConfig } from '../types/plugins/import-document.js';
export type { ImportDocumentConfigPage, ImportDocumentDownload, ImportDocumentDownloadFile, ImportDocumentProcessConfig, ImportDocumentProcessPageFunction, ImportDocumentProcessPage, ImportDocumentApiPayload, ImportDocumentContext, ImportDocumentRequestHandlerFactory, ImportDocumentConfig, ImportDocumentPayload, } from '../types/plugins/import-document.js';
/**
 * Uttori Import Document
 * Imports documents from a variety of sources, including markdown, PDF, and image files.
 */
declare class ImportDocument {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>ImportDocument.configKey</caption>
     * const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
     */
    static get configKey(): 'uttori-plugin-import-document';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>ImportDocument.defaultConfig()</caption>
     * const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<ImportDocumentConfig, 'apiRoute' | 'publicRoute' | 'uploadPath' | 'uploadDirectory' | 'allowedReferrers' | 'middlewarePublic' | 'middlewareApi' | 'downloadFile' | 'processPage' | 'apiRequestHandler' | 'interfaceRequestHandler'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A provided configuration to use.
     * @param [_context] Unused.
     * @example <caption>ImportDocument.validateConfig(config, _context)</caption>
     * ImportDocument.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, ImportDocumentConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>ImportDocument.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [ImportDocument.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * ImportDocument.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): void;
    /**
     * Add the upload route to the server object.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>ImportDocument.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [ImportDocument.configKey]: {
     *       middleware: [],
     *       publicRoute: '/download',
     *     },
     *   },
     * };
     * ImportDocument.bindRoutes(server, context);
     */
    static bindRoutes(server: import('express').Application, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): void;
    /**
     * The Express route method to process the upload request and provide a response.
     * Supports both file imports and URL scraping through the pages array.
     *
     * File handling (detected by file extension in page.name):
     * - Markdown files (.md/.markdown): Used directly as content (supports URLs and local paths)
     * - PDF files (.pdf): Stored as attachments (supports URLs and local paths, stub articles only when PDF is the only page)
     * - Image files (.jpg/.jpeg/.png/.gif/.webp/.svg): Stored as attachments (supports URLs and local paths)
     * - Other files: Treated as URLs for web scraping
     *
     * File processing:
     * - All file types support both URLs and local file paths
     * - URLs are downloaded using wget, local files are copied
     * - Provided 'image' parameter (URL) is downloaded to uploads directory
     * - Document image priority: downloaded image > first image page > provided image URL
     *
     * Request body structure:
     * - pages: Array of page objects (files or URLs)
     * - title, image, excerpt, tags, slug, redirects: Document metadata
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>ImportDocument.apiRequestHandler(context)(request, response, _next)</caption>
     * server.post('/chat-api', ImportDocument.apiRequestHandler(context));
     */
    static apiRequestHandler(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): import('express').RequestHandler;
    /**
     * The Express request handler for the interface route.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>ImportDocument.interfaceRequestHandler(context)(request, response, _next)</caption>
     * server.get('/import', ImportDocument.interfaceRequestHandler(context));
     */
    static interfaceRequestHandler(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): import('express').RequestHandler;
    /**
     * Downloads a file from a URL and saves it to the uploads directory.
     * @param options The options for the download, represents a page
     * @param options.url The URL of the file to download.
     * @param options.fileName The name of the file to save the file to.
     * @param options.type The type of the file to download.
     */
    static downloadFile({ url, fileName, type }: {
        url: string;
        fileName: string;
        type: string;
    }): Promise<void>;
    /**
     * Processes a page and returns the content and attachment.
     * @param config The configuration object.
     * @param slug The slug of the document.
     * @param page The page to process.
     * @returns The content and attachments.
     */
    static processPage(config: ImportDocumentProcessConfig, slug: string, page: ImportDocumentConfigPage): Promise<ImportDocumentProcessPage>;
}
export default ImportDocument;

import type { UttoriWikiDocument as ImportDocumentFields } from '../../wiki.js';
export interface ImportDocumentConfigPage {
    /** The URL of the page. */
    url: string;
    /** The name of the page. */
    name: string;
    /** The type of the page. */
    type: string;
}
export interface ImportDocumentDownload {
    /** The URL of the page. */
    url: string;
    /** The name of the file. */
    fileName: string;
    /** The type of the page. */
    type: string;
}
/** Downloads an imported page. */
export type ImportDocumentDownloadFile = (download: ImportDocumentDownload) => Promise<void>;
/** Configuration passed to page processors after upload paths and the downloader are resolved. */
export type ImportDocumentProcessConfig = ImportDocumentConfig & Required<Pick<ImportDocumentConfig, 'uploadDirectory' | 'uploadPath' | 'downloadFile'>>;
/** Processes an imported page after download. */
export type ImportDocumentProcessPageFunction = (config: ImportDocumentProcessConfig, content: string, page: ImportDocumentConfigPage) => Promise<ImportDocumentProcessPage>;
export interface ImportDocumentProcessPage {
    /** The content of the page. */
    content: string;
    /** The attachments of the page. */
    attachments: import('../../wiki.js').UttoriWikiDocumentAttachment[];
}
export interface ImportDocumentApiPayload {
    /** The title of the document. */
    title: string;
    /** The image of the document. */
    image: string;
    /** The excerpt of the document. */
    excerpt: string;
    /** The pages of the document. */
    pages: ImportDocumentConfigPage[];
    /** The tags of the document. */
    tags: string[];
    /** The slug of the document. */
    slug: string;
    /** The redirects of the document. */
    redirects: string[];
}
export type ImportDocumentContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>;
/** Builds an Express request handler from plugin context. */
export type ImportDocumentRequestHandlerFactory = (ctx: ImportDocumentContext) => import('express').RequestHandler;
export interface ImportDocumentConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** The API route for importing documents. */
    apiRoute?: string;
    /** Server route to show the import interface. */
    publicRoute?: string;
    /** The path to reference uploaded files by. */
    uploadPath?: string;
    /** The directory to upload files to. */
    uploadDirectory?: string;
    /**
     * When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an empty array don't check at all.
     */
    allowedReferrers?: string[];
    /** A request handler for the interface route. */
    interfaceRequestHandler?: ImportDocumentRequestHandlerFactory;
    /** A request handler for the API route. */
    apiRequestHandler?: ImportDocumentRequestHandlerFactory;
    /** Custom Middleware for the API route. */
    middlewareApi?: import('express').RequestHandler[];
    /** Custom Middleware for the public route. */
    middlewarePublic?: import('express').RequestHandler[];
    /** Downloads an imported page. */
    downloadFile?: ImportDocumentDownloadFile;
    /** Processes an imported page. */
    processPage?: ImportDocumentProcessPageFunction;
}
/** JSON fields accepted by the document-import route before its existing validation runs. */
export interface ImportDocumentPayload extends Partial<ImportDocumentFields> {
    /** Tags submitted by the import form; an empty array selects no tags. */
    tags: ImportDocumentFields['tags'];
    /** Remote pages appended to the new document. */
    pages?: ImportDocumentConfigPage[];
}
```

</details>
