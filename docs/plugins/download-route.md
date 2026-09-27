<a name="DownloadRouter"></a>

## DownloadRouter
Uttori Download Router

**Kind**: global class\

* [DownloadRouter](#DownloadRouter)
    * [new DownloadRouter()](#new_DownloadRouter_new)
    * [.configKey](#DownloadRouter.configKey) ⇒
    * [.defaultConfig()](#DownloadRouter.defaultConfig) ⇒
    * [.validateConfig(config, [_context])](#DownloadRouter.validateConfig)
    * [.register(context)](#DownloadRouter.register)
    * [.bindRoutes(server, context)](#DownloadRouter.bindRoutes)
    * [.download(context)](#DownloadRouter.download) ⇒

<a name="new_DownloadRouter_new"></a>

### new DownloadRouter()
**Example** *(DownloadRouter)*\
```js
const content = DownloadRouter.download(context);
```
<a name="DownloadRouter.configKey"></a>

### DownloadRouter.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>DownloadRouter</code>](#DownloadRouter)\
**Returns**: The configuration key.\
**Example** *(DownloadRouter.configKey)*\
```js
const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
```
<a name="DownloadRouter.defaultConfig"></a>

### DownloadRouter.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)\
**Returns**: The configuration.\
**Example** *(DownloadRouter.defaultConfig())*\
```js
const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
```
<a name="DownloadRouter.validateConfig"></a>

### DownloadRouter.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |
| [_context] | Unused. |

**Example** *(DownloadRouter.validateConfig(config, _context))*\
```js
DownloadRouter.validateConfig({ ... });
```
<a name="DownloadRouter.register"></a>

### DownloadRouter.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |
| context.hooks | An event system / hook system to use. |
| context.hooks.on | An event registration function. |
| context.config | A provided configuration to use. |

**Example** *(DownloadRouter.register(context))*\
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

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| server.get | Function to register route. |
| context | A Uttori-like context. |
| context.config | A provided configuration to use. |

**Example** *(DownloadRouter.bindRoutes(server, context))*\
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

### DownloadRouter.download(context) ⇒
The Express route method to process the upload request and provide a response.

**Kind**: static method of [<code>DownloadRouter</code>](#DownloadRouter)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |
| context.config | A provided configuration to use. |

**Example** *(DownloadRouter.download(context)(request, response, _next))*\
```js
server.post('/upload', DownloadRouter.download);
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { DownloadRouterConfig } from '../types/plugins/download-route.js';
export type { DownloadRouterConfig } from '../types/plugins/download-route.js';
/**
 * Uttori Download Router
 * @example <caption>DownloadRouter</caption>
 * const content = DownloadRouter.download(context);
 */
declare class DownloadRouter {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>DownloadRouter.configKey</caption>
     * const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
     */
    static get configKey(): 'uttori-plugin-download-router';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>DownloadRouter.defaultConfig()</caption>
     * const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<DownloadRouterConfig, 'basePath' | 'publicRoute' | 'allowedReferrers' | 'middleware'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config - A provided configuration to use.
     * @param [_context] Unused.
     * @example <caption>DownloadRouter.validateConfig(config, _context)</caption>
     * DownloadRouter.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, DownloadRouterConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @param context.hooks An event system / hook system to use.
     * @param context.hooks.on An event registration function.
     * @param context.config - A provided configuration to use.
     * @example <caption>DownloadRouter.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [DownloadRouter.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * DownloadRouter.register(context);
     */
    static register(context: Pick<import('../custom.js').UttoriContext, 'hooks' | 'config'>): void;
    /**
     * Add the upload route to the server object.
     * @param server An Express server instance.
     * @param server.get Function to register route.
     * @param context A Uttori-like context.
     * @param context.config - A provided configuration to use.
     * @example <caption>DownloadRouter.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [DownloadRouter.configKey]: {
     *       middleware: [],
     *       publicRoute: '/download',
     *     },
     *   },
     * };
     * DownloadRouter.bindRoutes(server, context);
     */
    static bindRoutes(server: Pick<import('express').Application, 'get'>, context: Pick<import('../custom.js').UttoriContext, 'config'>): void;
    /**
     * The Express route method to process the upload request and provide a response.
     * @param context A Uttori-like context.
     * @param context.config - A provided configuration to use.
     * @returns The function to pass to Express.
     * @example <caption>DownloadRouter.download(context)(request, response, _next)</caption>
     * server.post('/upload', DownloadRouter.download);
     */
    static download(context: Pick<import('../custom.js').UttoriContext, 'config'>): import('express').RequestHandler;
}
export default DownloadRouter;

export interface DownloadRouterConfig {
    /** Events to bind to. */
    events?: Record<string, string[]>;
    /** Directory files will be downloaded from. */
    basePath: string;
    /** Server route to GET uploads from. */
    publicRoute: string;
    /**
     * When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an rmpty array don't check at all.
     */
    allowedReferrers: string[];
    /** Custom Middleware for the Upload route */
    middleware: import('express').RequestHandler[];
}
```

</details>
