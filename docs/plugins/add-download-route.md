## Classes

<dl>
<dt><a href="#DownloadRouter">DownloadRouter</a></dt>
<dd><p>Uttori Download Router</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#DownloadRouterConfig">DownloadRouterConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="DownloadRouter"></a>

## DownloadRouter
Uttori Download Router

**Kind**: global class  

* [DownloadRouter](#DownloadRouter)
    * [.configKey](#DownloadRouter.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#DownloadRouter.defaultConfig) ⇒ [<code>DownloadRouterConfig</code>](#DownloadRouterConfig)
    * [.validateConfig(config, [_context])](#DownloadRouter.validateConfig)
    * [.register(context)](#DownloadRouter.register)
    * [.bindRoutes(server, context)](#DownloadRouter.bindRoutes)
    * [.download(context)](#DownloadRouter.download) ⇒ <code>module:express~RequestHandler</code>

<a name="DownloadRouter.configKey"></a>

### DownloadRouter.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>DownloadRouter</code>](#DownloadRouter)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(DownloadRouter.configKey)*  
```js
const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
```
<a name="DownloadRouter.defaultConfig"></a>

### DownloadRouter.defaultConfig() ⇒ [<code>DownloadRouterConfig</code>](#DownloadRouterConfig)
The default configuration.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)  
**Returns**: [<code>DownloadRouterConfig</code>](#DownloadRouterConfig) - The configuration.  
**Example** *(DownloadRouter.defaultConfig())*  
```js
const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
```
<a name="DownloadRouter.validateConfig"></a>

### DownloadRouter.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, DownloadRouterConfig&gt;</code> | A provided configuration to use. |
| [_context] | <code>object</code> | Unused. |

**Example** *(DownloadRouter.validateConfig(config, _context))*  
```js
DownloadRouter.validateConfig({ ... });
```
<a name="DownloadRouter.register"></a>

### DownloadRouter.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | A Uttori-like context. |
| context.hooks | <code>object</code> | An event system / hook system to use. |
| context.hooks.on | <code>function</code> | An event registration function. |
| context.config | <code>Record.&lt;string, DownloadRouterConfig&gt;</code> | A provided configuration to use. |

**Example** *(DownloadRouter.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [DownloadRouter.configKey]: {
      ...,
      events: {
        bindRoutes: ['bind-routes'],
      },
    },
  },
};
DownloadRouter.register(context);
```
<a name="DownloadRouter.bindRoutes"></a>

### DownloadRouter.bindRoutes(server, context)
Add the upload route to the server object.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>object</code> | An Express server instance. |
| server.get | <code>function</code> | Function to register route. |
| context | <code>object</code> | A Uttori-like context. |
| context.config | <code>Record.&lt;string, DownloadRouterConfig&gt;</code> | A provided configuration to use. |

**Example** *(DownloadRouter.bindRoutes(server, context))*  
```js
const context = {
  config: {
    [DownloadRouter.configKey]: {
      middleware: [],
      publicRoute: '/download',
    },
  },
};
DownloadRouter.bindRoutes(server, context);
```
<a name="DownloadRouter.download"></a>

### DownloadRouter.download(context) ⇒ <code>module:express~RequestHandler</code>
The Express route method to process the upload request and provide a response.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | A Uttori-like context. |
| context.config | <code>Record.&lt;string, DownloadRouterConfig&gt;</code> | A provided configuration to use. |

**Example** *(DownloadRouter.download(context)(request, response, _next))*  
```js
server.post('/upload', DownloadRouter.download);
```
<a name="DownloadRouterConfig"></a>

## DownloadRouterConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | Events to bind to. |
| basePath | <code>string</code> | Directory files will be downloaded from. |
| publicRoute | <code>string</code> | Server route to GET uploads from. |
| allowedReferrers | <code>Array.&lt;string&gt;</code> | When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an rmpty array don't check at all. |
| middleware | <code>Array.&lt;module:express~RequestHandler&gt;</code> | Custom Middleware for the Upload route |

