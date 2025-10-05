## Classes

<dl>
<dt><a href="#MulterUpload">MulterUpload</a></dt>
<dd><p>Uttori Multer Upload</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#MulterUploadConfig">MulterUploadConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="MulterUpload"></a>

## MulterUpload
Uttori Multer Upload

**Kind**: global class  

* [MulterUpload](#MulterUpload)
    * [new MulterUpload()](#new_MulterUpload_new)
    * [.configKey](#MulterUpload.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#MulterUpload.defaultConfig) ⇒ [<code>MulterUploadConfig</code>](#MulterUploadConfig)
    * [.validateConfig(config, _context)](#MulterUpload.validateConfig)
    * [.register(context)](#MulterUpload.register)
    * [.bindRoutes(server, context)](#MulterUpload.bindRoutes)
    * [.upload(context)](#MulterUpload.upload) ⇒ <code>module:express~RequestHandler.&lt;{}, string, {fullPath: string}&gt;</code>

<a name="new_MulterUpload_new"></a>

### new MulterUpload()
**Example** *(MulterUpload)*  
```js
const content = MulterUpload.storeFile(request);
```
<a name="MulterUpload.configKey"></a>

### MulterUpload.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>MulterUpload</code>](#MulterUpload)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(MulterUpload.configKey)*  
```js
const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
```
<a name="MulterUpload.defaultConfig"></a>

### MulterUpload.defaultConfig() ⇒ [<code>MulterUploadConfig</code>](#MulterUploadConfig)
The default configuration.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)  
**Returns**: [<code>MulterUploadConfig</code>](#MulterUploadConfig) - The configuration.  
**Example** *(MulterUpload.defaultConfig())*  
```js
const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
```
<a name="MulterUpload.validateConfig"></a>

### MulterUpload.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, MulterUploadConfig&gt;</code> | A configuration object. |
| _context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-upload-multer&#x27;, MulterUploadConfig&gt;</code> | Unused. |

**Example** *(MulterUpload.validateConfig(config, _context))*  
```js
MulterUpload.validateConfig({ ... });
```
<a name="MulterUpload.register"></a>

### MulterUpload.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-upload-multer&#x27;, MulterUploadConfig&gt;</code> | A Uttori-like context. |

**Example** *(MulterUpload.register(context))*  
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

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | An Express server instance. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-upload-multer&#x27;, MulterUploadConfig&gt;</code> | A Uttori-like context. |

**Example** *(MulterUpload.bindRoutes(server, context))*  
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

### MulterUpload.upload(context) ⇒ <code>module:express~RequestHandler.&lt;{}, string, {fullPath: string}&gt;</code>
The Express route method to process the upload request and provide a response.

**Kind**: static method of [<code>MulterUpload</code>](#MulterUpload)  
**Returns**: <code>module:express~RequestHandler.&lt;{}, string, {fullPath: string}&gt;</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-upload-multer&#x27;, MulterUploadConfig&gt;</code> | A Uttori-like context. |

**Example** *(MulterUpload.upload(context)(request, response, _next))*  
```js
server.post('/upload', MulterUpload.upload);
```
<a name="MulterUploadConfig"></a>

## MulterUploadConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspond to methods, and contents are events to listen for. |
| [directory] | <code>string</code> | Directory files will be uploaded to. The default is 'uploads'. |
| [route] | <code>string</code> | Server route to POST uploads to. The default is '/upload'. |
| [publicRoute] | <code>string</code> | Server route to GET uploads from. The default is '/uploads'. |
| [middleware] | <code>Array.&lt;module:express~RequestHandler&gt;</code> | Custom Middleware for the Upload route |

