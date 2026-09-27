<a name="AnalyticsPlugin"></a>

## AnalyticsPlugin
Page view analytics for Uttori documents using JSON files stored on the local file system.

**Kind**: global class\

* [AnalyticsPlugin](#AnalyticsPlugin)
    * [new AnalyticsPlugin()](#new_AnalyticsPlugin_new)
    * [.configKey](#AnalyticsPlugin.configKey) ⇒
    * [.defaultConfig()](#AnalyticsPlugin.defaultConfig) ⇒
    * [.validateConfig(_analytics)](#AnalyticsPlugin.validateConfig)
    * [.register(context)](#AnalyticsPlugin.register)
    * [.updateDocument(analytics)](#AnalyticsPlugin.updateDocument) ⇒
    * [.getCount(analytics)](#AnalyticsPlugin.getCount) ⇒
    * [.getPopularDocuments(analytics)](#AnalyticsPlugin.getPopularDocuments) ⇒

<a name="new_AnalyticsPlugin_new"></a>

### new AnalyticsPlugin()
**Example** *(Init AnalyticsProvider)*\
```js
const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
```
<a name="AnalyticsPlugin.configKey"></a>

### AnalyticsPlugin.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)\
**Returns**: The configuration key.\
**Example** *(AnalyticsPlugin.configKey)*\
```js
const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
```
<a name="AnalyticsPlugin.defaultConfig"></a>

### AnalyticsPlugin.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)\
**Returns**: The configuration.\
**Example** *(AnalyticsPlugin.defaultConfig())*\
```js
const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
```
<a name="AnalyticsPlugin.validateConfig"></a>

### AnalyticsPlugin.validateConfig(_analytics)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)\

| Param | Description |
| --- | --- |
| _analytics | An AnalyticsProvider instance (unused). |

**Example** *(AnalyticsPlugin.validateConfig(config, _context))*\
```js
AnalyticsPlugin.validateConfig({ ... });
```
<a name="AnalyticsPlugin.register"></a>

### AnalyticsPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(AnalyticsPlugin.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [AnalyticsPlugin.configKey]: {
      ...,
      events: {
        updateDocument: ['document-save', 'document-delete'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
AnalyticsPlugin.register(context);
```
<a name="AnalyticsPlugin.updateDocument"></a>

### AnalyticsPlugin.updateDocument(analytics) ⇒
Wrapper function for calling update.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)\
**Returns**: The provided document.\

| Param | Description |
| --- | --- |
| analytics | An AnalyticsProvider instance. |

**Example** *(AnalyticsPlugin.updateDocument(analytics))*\
```js
const context = {
config: {
[AnalyticsPlugin.configKey]: {
...,
},
},
};
AnalyticsPlugin.updateDocument(document, null);
```
<a name="AnalyticsPlugin.getCount"></a>

### AnalyticsPlugin.getCount(analytics) ⇒
Wrapper function for calling update.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)\
**Returns**: The view count for the document.\

| Param | Description |
| --- | --- |
| analytics | An AnalyticsProvider instance. |

**Example** *(AnalyticsPlugin.getCount(analytics, slug))*\
```js
const context = {
config: {
[AnalyticsPlugin.configKey]: {
...,
},
},
};
AnalyticsPlugin.getCount(analytics, slug);
```
<a name="AnalyticsPlugin.getPopularDocuments"></a>

### AnalyticsPlugin.getPopularDocuments(analytics) ⇒
Wrapper function for calling update.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)\
**Returns**: Popular documents.\

| Param | Description |
| --- | --- |
| analytics | An AnalyticsProvider instance. |

**Example** *(AnalyticsPlugin.getPopularDocuments(analytics))*\
```js
const context = {
config: {
[AnalyticsPlugin.configKey]: {
...,
},
},
};
AnalyticsPlugin.getPopularDocuments(analytics);
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { AnalyticsPluginConfig, AnalyticsPluginDocumentHandler, AnalyticsPluginGetCountHandler, AnalyticsPluginGetPopularDocumentsHandler } from '../types/plugins/analytics-json-file.js';
export type { AnalyticsPluginPopularDocument, AnalyticsPluginConfig, AnalyticsPluginContext, AnalyticsPluginDocumentHandler, AnalyticsPluginGetCountHandler, AnalyticsPluginGetPopularDocumentsHandler, } from '../types/plugins/analytics-json-file.js';
/**
 * Page view analytics for Uttori documents using JSON files stored on the local file system.
 * @example <caption>Init AnalyticsProvider</caption>
 * const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
 */
declare class AnalyticsPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>AnalyticsPlugin.configKey</caption>
     * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
     */
    static get configKey(): 'uttori-plugin-analytics-json-file';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>AnalyticsPlugin.defaultConfig()</caption>
     * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<AnalyticsPluginConfig, 'name' | 'extension' | 'limit' | 'events' | 'directory'>;
    /**
     * Validates the provided configuration for required entries.
     * @param _analytics - An AnalyticsProvider instance (unused).
     * @example <caption>AnalyticsPlugin.validateConfig(config, _context)</caption>
     * AnalyticsPlugin.validateConfig({ ... });
     */
    static validateConfig(_analytics: AnalyticsPlugin): (config: Record<string, AnalyticsPluginConfig>, _context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>) => void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>AnalyticsPlugin.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [AnalyticsPlugin.configKey]: {
     *       ...,
     *       events: {
     *         updateDocument: ['document-save', 'document-delete'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * AnalyticsPlugin.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>): void;
    /**
     * Wrapper function for calling update.
     * @param analytics An AnalyticsProvider instance.
     * @returns The provided document.
     * @example <caption>AnalyticsPlugin.updateDocument(analytics)</caption>
     * const context = {
     * config: {
     * [AnalyticsPlugin.configKey]: {
     * ...,
     * },
     * },
     * };
     * AnalyticsPlugin.updateDocument(document, null);
     */
    static updateDocument(analytics: import('./utilities/analytics-provider.js').default): AnalyticsPluginDocumentHandler;
    /**
     * Wrapper function for calling update.
     * @param analytics An AnalyticsProvider instance.
     * @returns The view count for the document.
     * @example <caption>AnalyticsPlugin.getCount(analytics, slug)</caption>
     * const context = {
     * config: {
     * [AnalyticsPlugin.configKey]: {
     * ...,
     * },
     * },
     * };
     * AnalyticsPlugin.getCount(analytics, slug);
     */
    static getCount(analytics: import('./utilities/analytics-provider.js').default): AnalyticsPluginGetCountHandler;
    /**
     * Wrapper function for calling update.
     * @param analytics An AnalyticsProvider instance.
     * @returns Popular documents.
     * @example <caption>AnalyticsPlugin.getPopularDocuments(analytics)</caption>
     * const context = {
     * config: {
     * [AnalyticsPlugin.configKey]: {
     * ...,
     * },
     * },
     * };
     * AnalyticsPlugin.getPopularDocuments(analytics);
     */
    static getPopularDocuments(analytics: import('./utilities/analytics-provider.js').default): AnalyticsPluginGetPopularDocumentsHandler;
}
export default AnalyticsPlugin;

export interface AnalyticsPluginPopularDocument {
    /** The slug of the document. */
    slug: string;
    /** The count of the document. */
    count: number;
}
export interface AnalyticsPluginConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** The name of the analytics file. The default is 'visits'. */
    name?: string;
    /** The extension of the analytics file. The default is 'json'. */
    extension?: string;
    /** The path to the location you want the JSON file to be writtent to. */
    directory: string;
    /** The limit of documents to return. The default is 10. */
    limit?: number;
}
/** Uttori context narrowed to this plugin's config shape. */
export type AnalyticsPluginContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>;
export type AnalyticsPluginDocumentHandler = (document: import('../../wiki.js').UttoriWikiDocument, context: AnalyticsPluginContext) => import('../../wiki.js').UttoriWikiDocument;
export type AnalyticsPluginGetCountHandler = (document: import('../../wiki.js').UttoriWikiDocument, context: AnalyticsPluginContext) => number;
export type AnalyticsPluginGetPopularDocumentsHandler = (data: unknown, context: AnalyticsPluginContext) => AnalyticsPluginPopularDocument[];
```

</details>
