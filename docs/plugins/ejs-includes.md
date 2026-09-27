<a name="EJSRenderer"></a>

## EJSRenderer
Uttori Replacer Renderer

**Kind**: global class\

* [EJSRenderer](#EJSRenderer)
    * [new EJSRenderer()](#new_EJSRenderer_new)
    * [.configKey](#EJSRenderer.configKey) ⇒
    * [.defaultConfig()](#EJSRenderer.defaultConfig) ⇒
    * [.validateConfig(config, _context)](#EJSRenderer.validateConfig)
    * [.register(context)](#EJSRenderer.register)
    * [.renderContent(content, context)](#EJSRenderer.renderContent) ⇒
    * [.renderCollection(collection, context)](#EJSRenderer.renderCollection) ⇒
    * [.render(content, config)](#EJSRenderer.render) ⇒

<a name="new_EJSRenderer_new"></a>

### new EJSRenderer()
**Example** *(EJSRenderer)*\
```js
const content = EJSRenderer.render("...");
```
<a name="EJSRenderer.configKey"></a>

### EJSRenderer.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>EJSRenderer</code>](#EJSRenderer)\
**Returns**: The configuration key.\
**Example** *(EJSRenderer.configKey)*\
```js
const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
```
<a name="EJSRenderer.defaultConfig"></a>

### EJSRenderer.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)\
**Returns**: The configuration.\
**Example** *(EJSRenderer.defaultConfig())*\
```js
const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
```
<a name="EJSRenderer.validateConfig"></a>

### EJSRenderer.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |
| _context | Unused |

**Example** *(EJSRenderer.validateConfig(config, _context))*\
```js
EJSRenderer.validateConfig({ ... });
```
<a name="EJSRenderer.register"></a>

### EJSRenderer.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(EJSRenderer.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [EJSRenderer.configKey]: {
      ...,
      events: {
        renderContent: ['render-content', 'render-meta-description'],
        renderCollection: ['render-search-results'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
EJSRenderer.register(context);
```
<a name="EJSRenderer.renderContent"></a>

### EJSRenderer.renderContent(content, context) ⇒
Replace content in a provided string with a provided context.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)\
**Returns**: The rendered content.\

| Param | Description |
| --- | --- |
| content | Content to be converted to HTML. |
| context | A Uttori-like context. |

**Example** *(EJSRenderer.renderContent(content, context))*\
```js
const context = {
  config: {
    [EJSRenderer.configKey]: {
      ...,
    },
  },
};
EJSRenderer.renderContent(content, context);
```
<a name="EJSRenderer.renderCollection"></a>

### EJSRenderer.renderCollection(collection, context) ⇒
Replace content in a collection of Uttori documents with a provided context.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)\
**Returns**: The rendered documents.\

| Param | Description |
| --- | --- |
| collection | A collection of Uttori documents. |
| context | A Uttori-like context. |

**Example** *(EJSRenderer.renderCollection(collection, context))*\
```js
const context = {
  config: {
    [EJSRenderer.configKey]: {
      ...,
    },
  },
};
EJSRenderer.renderCollection(collection, context);
```
<a name="EJSRenderer.render"></a>

### EJSRenderer.render(content, config) ⇒
Render EJS content in a provided string.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)\
**Returns**: The rendered content.\

| Param | Description |
| --- | --- |
| content | Content to be searched through to make replacements. |
| config | A provided configuration to use. |

**Example** *(EJSRenderer.render(content, config))*\
```js
const html = EJSRenderer.render(content, config);
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import ejs from 'ejs';
import type { EJSRendererConfig } from '../types/plugins/ejs-includes.js';
export type { EJSRendererConfig } from '../types/plugins/ejs-includes.js';
/**
 * Uttori Replacer Renderer
 * @example <caption>EJSRenderer</caption>
 * const content = EJSRenderer.render("...");
 */
declare class EJSRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>EJSRenderer.configKey</caption>
     * const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
     */
    static get configKey(): 'uttori-plugin-renderer-ejs';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>EJSRenderer.defaultConfig()</caption>
     * const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<EJSRendererConfig, 'ejs'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A provided configuration to use.
     * @param _context Unused
     * @example <caption>EJSRenderer.validateConfig(config, _context)</caption>
     * EJSRenderer.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, EJSRendererConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>EJSRenderer.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [EJSRenderer.configKey]: {
     *       ...,
     *       events: {
     *         renderContent: ['render-content', 'render-meta-description'],
     *         renderCollection: ['render-search-results'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * EJSRenderer.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>): void;
    /**
     * Replace content in a provided string with a provided context.
     * @param content Content to be converted to HTML.
     * @param context A Uttori-like context.
     * @returns The rendered content.
     * @example <caption>EJSRenderer.renderContent(content, context)</caption>
     * const context = {
     *   config: {
     *     [EJSRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * EJSRenderer.renderContent(content, context);
     */
    static renderContent(content: string | undefined, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>): string;
    /**
     * Replace content in a collection of Uttori documents with a provided context.
     * @param collection A collection of Uttori documents.
     * @param context A Uttori-like context.
     * @returns The rendered documents.
     * @example <caption>EJSRenderer.renderCollection(collection, context)</caption>
     * const context = {
     *   config: {
     *     [EJSRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * EJSRenderer.renderCollection(collection, context);
     */
    static renderCollection(collection: import('../wiki.js').UttoriWikiDocument[], context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>): import('../wiki.js').UttoriWikiDocument[];
    /**
     * Render EJS content in a provided string.
     * @param content Content to be searched through to make replacements.
     * @param config A provided configuration to use.
     * @returns The rendered content.
     * @example <caption>EJSRenderer.render(content, config)</caption>
     * const html = EJSRenderer.render(content, config);
     */
    static render(content: string | undefined, config: ejs.Options): string;
}
export default EJSRenderer;

import type ejs from 'ejs';
export interface EJSRendererConfig {
    /** Events to bind to. */
    events?: Record<string, string[]>;
    /** EJS configuration. */
    ejs?: ejs.Options;
}
```

</details>
