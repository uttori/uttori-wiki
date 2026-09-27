<a name="MulterUpload"></a>

## MulterUpload
Uttori Multer Upload

**Kind**: global class\

* [MulterUpload](#MulterUpload)
    * [new MulterUpload()](#new_MulterUpload_new)
    * [.configKey](#MulterUpload.configKey) ⇒
    * [.defaultConfig()](#MulterUpload.defaultConfig) ⇒
    * [.validateConfig(config, _context)](#MulterUpload.validateConfig)
    * [.register(context)](#MulterUpload.register)
    * [.bindRoutes(server, context)](#MulterUpload.bindRoutes)
    * [.upload(context)](#MulterUpload.upload) ⇒

<a name="new_MulterUpload_new"></a>

### new MulterUpload()
**Example** *(MulterUpload)*\
```js
const content = MulterUpload.storeFile(request);
```
<a name="MulterUpload.configKey"></a>

### MulterUpload.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>MulterUpload</code>](#MulterUpload)\
**Returns**: The configuration key.\
**Example** *(MulterUpload.configKey)*\
```js
const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
```
<a name="MulterUpload.defaultConfig"></a>

### MulterUpload.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)\
**Returns**: The configuration.\
**Example** *(MulterUpload.defaultConfig())*\
```js
const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
```
<a name="MulterUpload.validateConfig"></a>

### MulterUpload.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)\

| Param | Description |
| --- | --- |
| config | A configuration object. |
| _context | Unused. |

**Example** *(MulterUpload.validateConfig(config, _context))*\
```js
MulterUpload.validateConfig({ ... });
```
<a name="MulterUpload.register"></a>

### MulterUpload.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(MulterUpload.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [MulterUpload.configKey]: {
      ...,
      events: {
        bindRoutes: ['bind-routes'],
      },
    },
  },
};
MulterUpload.register(context);
```
<a name="MulterUpload.bindRoutes"></a>

### MulterUpload.bindRoutes(server, context)
Add the upload route to the server object.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| context | A Uttori-like context. |

**Example** *(MulterUpload.bindRoutes(server, context))*\
```js
const context = {
  config: {
    [MulterUpload.configKey]: {
      directory: 'uploads',
      route: '/upload',
    },
  },
};
MulterUpload.bindRoutes(server, context);
```
<a name="MulterUpload.upload"></a>

### MulterUpload.upload(context) ⇒
The Express route method to process the upload request and provide a response.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(MulterUpload.upload(context)(request, response, _next))*\
```js
server.post('/upload', MulterUpload.upload);
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { MulterUploadConfig } from '../types/plugins/upload-multer.js';
export type { MulterUploadConfig } from '../types/plugins/upload-multer.js';
/**
 * Uttori Multer Upload
 * @example <caption>MulterUpload</caption>
 * const content = MulterUpload.storeFile(request);
 */
declare class MulterUpload {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>MulterUpload.configKey</caption>
     * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
     */
    static get configKey(): 'uttori-plugin-upload-multer';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>MulterUpload.defaultConfig()</caption>
     * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<MulterUploadConfig, 'directory' | 'route' | 'publicRoute' | 'middleware' | 'allowedMimeTypes' | 'maxFileSize'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context Unused.
     * @example <caption>MulterUpload.validateConfig(config, _context)</caption>
     * MulterUpload.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, MulterUploadConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>MulterUpload.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [MulterUpload.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * MulterUpload.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>): void;
    /**
     * Add the upload route to the server object.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>MulterUpload.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [MulterUpload.configKey]: {
     *       directory: 'uploads',
     *       route: '/upload',
     *     },
     *   },
     * };
     * MulterUpload.bindRoutes(server, context);
     */
    static bindRoutes(server: import('express').Application, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>): void;
    /**
     * The Express route method to process the upload request and provide a response.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>MulterUpload.upload(context)(request, response, _next)</caption>
     * server.post('/upload', MulterUpload.upload);
     */
    static upload(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>): import('express').RequestHandler<Record<string, never>, string, {
        fullPath: string;
    }>;
}
export default MulterUpload;

export interface MulterUploadConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** Directory files will be uploaded to. The default is 'uploads'. */
    directory?: string;
    /** Server route to POST uploads to. The default is '/upload'. */
    route?: string;
    /** Server route to GET uploads from. The default is '/uploads'. */
    publicRoute?: string;
    /** Custom Middleware for the Upload route */
    middleware?: import('express').RequestHandler[];
    /** Array of allowed MIME types (e.g., ['image/jpeg', 'image/png']). Empty array allows all. */
    allowedMimeTypes?: string[];
    /** Maximum file size in bytes. Default: 10MB (10485760). */
    maxFileSize?: number;
}
```

</details>
