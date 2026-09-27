<a name="TagRoutesPlugin"></a>

## TagRoutesPlugin
Tag routes plugin for Uttori Wiki.
Provides tag index and individual tag pages functionality.

**Kind**: global class\

* [TagRoutesPlugin](#TagRoutesPlugin)
    * [new TagRoutesPlugin()](#new_TagRoutesPlugin_new)
    * [.configKey](#TagRoutesPlugin.configKey) ⇒
    * [.defaultConfig()](#TagRoutesPlugin.defaultConfig) ⇒
    * [.extendConfig(config)](#TagRoutesPlugin.extendConfig) ⇒
    * [.validateConfig(config, _context)](#TagRoutesPlugin.validateConfig)
    * [.register(context)](#TagRoutesPlugin.register)
    * [.bindRoutes(server, context)](#TagRoutesPlugin.bindRoutes)
    * [.normalizeDocumentTags(document, _context)](#TagRoutesPlugin.normalizeDocumentTags) ⇒
    * [.getTaggedDocuments(context, tag)](#TagRoutesPlugin.getTaggedDocuments) ⇒
    * [.tagIndexRequestHandler(context)](#TagRoutesPlugin.tagIndexRequestHandler) ⇒
    * [.tagRequestHandler(context)](#TagRoutesPlugin.tagRequestHandler) ⇒

<a name="new_TagRoutesPlugin_new"></a>

### new TagRoutesPlugin()
**Example** *(Init TagRoutesPlugin)*\
```js
const tagPlugin = new TagRoutesPlugin();
```
<a name="TagRoutesPlugin.configKey"></a>

### TagRoutesPlugin.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\
**Returns**: The configuration key.\
**Example** *(TagRoutesPlugin.configKey)*\
```js
const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
```
<a name="TagRoutesPlugin.defaultConfig"></a>

### TagRoutesPlugin.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\
**Returns**: The configuration.\
**Example** *(TagRoutesPlugin.defaultConfig())*\
```js
const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
```
<a name="TagRoutesPlugin.extendConfig"></a>

### TagRoutesPlugin.extendConfig(config) ⇒
Create a config that is extended from the default config.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\
**Returns**: The new configration.\

| Param | Description |
| --- | --- |
| config | The user provided configuration. |

<a name="TagRoutesPlugin.validateConfig"></a>

### TagRoutesPlugin.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\

| Param | Description |
| --- | --- |
| config | A configuration object. |
| _context | A Uttori-like context (unused). |

**Example** *(TagRoutesPlugin.validateConfig(config, _context))*\
```js
TagRoutesPlugin.validateConfig({ ... });
```
<a name="TagRoutesPlugin.register"></a>

### TagRoutesPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(TagRoutesPlugin.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [TagRoutesPlugin.configKey]: {
      ...,
    },
  },
};
TagRoutesPlugin.register(context);
```
<a name="TagRoutesPlugin.bindRoutes"></a>

### TagRoutesPlugin.bindRoutes(server, context)
Wrapper function for binding tag routes.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| context | A Uttori-like context. |

**Example** *(TagRoutesPlugin.bindRoutes(plugin))*\
```js
const context = {
  config: {
    [TagRoutesPlugin.configKey]: {
      ...,
    },
  },
};
TagRoutesPlugin.bindRoutes(plugin);
```
<a name="TagRoutesPlugin.normalizeDocumentTags"></a>

### TagRoutesPlugin.normalizeDocumentTags(document, _context) ⇒
Normalize document tags before the document is saved.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\
**Returns**: The document with normalized tags.\

| Param | Description |
| --- | --- |
| document | The document being saved. |
| _context | A Uttori-like context. |

<a name="TagRoutesPlugin.getTaggedDocuments"></a>

### TagRoutesPlugin.getTaggedDocuments(context, tag) ⇒
Returns the documents with the provided tag, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignoreSlugs` array.

Hooks:
- `fetch` - `storage-query` - Searched for the tagged documents.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\
**Returns**: Promise object that resolves to the array of the documents.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |
| tag | The tag to look for in documents. |

**Example**\
```js
plugin.getTaggedDocuments('example', 10);
➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
```
<a name="TagRoutesPlugin.tagIndexRequestHandler"></a>

### TagRoutesPlugin.tagIndexRequestHandler(context) ⇒
Renders the tag index page with the `tags` template.

Hooks:
- `filter` - `view-model-tag-index` - Passes in the viewModel.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="TagRoutesPlugin.tagRequestHandler"></a>

### TagRoutesPlugin.tagRequestHandler(context) ⇒
Renders the tag detail page with `tag` template.
Sets the `X-Robots-Tag` header to `noindex`.
Attempts to pull in the relevant site section for the tag if defined in the config site sections.

Hooks:
- `filter` - `view-model-tag` - Passes in the viewModel.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { TagRoutesPluginConfig, TagRoutesContext } from '../types/plugins/tag-routes.js';
export type { TagRoutesPluginConfig, TagRoutesContext, TagRoutesRequestHandler } from '../types/plugins/tag-routes.js';
/**
 * Tag routes plugin for Uttori Wiki.
 * Provides tag index and individual tag pages functionality.
 * @example <caption>Init TagRoutesPlugin</caption>
 * const tagPlugin = new TagRoutesPlugin();
 */
declare class TagRoutesPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>TagRoutesPlugin.configKey</caption>
     * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
     */
    static get configKey(): 'uttori-plugin-tag-routes';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>TagRoutesPlugin.defaultConfig()</caption>
     * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<TagRoutesPluginConfig, 'title' | 'limit' | 'tagIndexRoute' | 'tagRoute' | 'apiRoute' | 'middleware' | 'events' | 'tagIndexRequestHandler' | 'tagRequestHandler' | 'apiRequestHandler'>;
    /**
     * Create a config that is extended from the default config.
     * @param config The user provided configuration.
     * @returns The new configration.
     */
    static extendConfig(config?: TagRoutesPluginConfig): {
        title: string;
        limit: number;
        tagIndexRoute: string;
        tagRoute: string;
        apiRoute: string;
        tagIndexRequestHandler: import("../types/plugins/tag-routes.js").TagRoutesRequestHandler;
        tagRequestHandler: import("../types/plugins/tag-routes.js").TagRoutesRequestHandler;
        apiRequestHandler: import("../types/plugins/tag-routes.js").TagRoutesRequestHandler;
        events: {
            [x: string]: string[];
        };
        middleware: {
            [x: string]: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
        };
    };
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context - A Uttori-like context (unused).
     * @example <caption>TagRoutesPlugin.validateConfig(config, _context)</caption>
     * TagRoutesPlugin.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, TagRoutesPluginConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>TagRoutesPlugin.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [TagRoutesPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * TagRoutesPlugin.register(context);
     */
    static register(context: TagRoutesContext): void;
    /**
     * Wrapper function for binding tag routes.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>TagRoutesPlugin.bindRoutes(plugin)</caption>
     * const context = {
     *   config: {
     *     [TagRoutesPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * TagRoutesPlugin.bindRoutes(plugin);
     */
    static bindRoutes(server: import('express').Application, context: TagRoutesContext): void;
    /**
     * Normalize document tags before the document is saved.
     * @param document The document being saved.
     * @param _context A Uttori-like context.
     * @returns The document with normalized tags.
     */
    static normalizeDocumentTags(document: import('../wiki.js').UttoriWikiDocument, _context: TagRoutesContext): import('../wiki.js').UttoriWikiDocument;
    /**
     * Returns the documents with the provided tag, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
     *
     * Hooks:
     * - `fetch` - `storage-query` - Searched for the tagged documents.
     * @async
     * @param context A Uttori-like context.
     * @param tag The tag to look for in documents.
     * @returns Promise object that resolves to the array of the documents.
     * @example
     * plugin.getTaggedDocuments('example', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
     */
    static getTaggedDocuments(context: TagRoutesContext, tag: string): Promise<import('../wiki.js').UttoriWikiDocument[]>;
    /**
     * Renders the tag index page with the `tags` template.
     *
     * Hooks:
     * - `filter` - `view-model-tag-index` - Passes in the viewModel.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static tagIndexRequestHandler(context: TagRoutesContext): import('express').RequestHandler;
    /**
     * Renders the tag detail page with `tag` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     * Attempts to pull in the relevant site section for the tag if defined in the config site sections.
     *
     * Hooks:
     * - `filter` - `view-model-tag` - Passes in the viewModel.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static tagRequestHandler(context: TagRoutesContext): import('express').RequestHandler;
}
export default TagRoutesPlugin;

export interface TagRoutesPluginConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** The default title for tag pages. */
    title?: string;
    /** The maximum number of documents to return for a tag. */
    limit?: number;
    /** Middleware for tag routes. */
    middleware?: Record<string, import('express').RequestHandler[]>;
    /** A replacement route for the tag index route. */
    tagIndexRoute?: string;
    /** A replacement route for the tag show route. */
    tagRoute?: string;
    /** A replacement route for the tag index route. */
    apiRoute?: string;
    /** A replacement route handler for the tag index route. */
    tagIndexRequestHandler?: TagRoutesRequestHandler;
    /** A replacement route handler for the tag show route. */
    tagRequestHandler?: TagRoutesRequestHandler;
    /** A request handler for the API route. */
    apiRequestHandler?: TagRoutesRequestHandler;
}
/** Uttori context narrowed to this plugin's config shape. */
export type TagRoutesContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>;
/** Builds an Express handler for a tag route. */
export type TagRoutesRequestHandler = (context: TagRoutesContext) => import('express').RequestHandler;
```

</details>
