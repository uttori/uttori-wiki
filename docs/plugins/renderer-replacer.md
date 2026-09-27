<a name="ReplacerRenderer"></a>

## ReplacerRenderer
Uttori Replacer Renderer

**Kind**: global class\

* [ReplacerRenderer](#ReplacerRenderer)
    * [new ReplacerRenderer()](#new_ReplacerRenderer_new)
    * [.configKey](#ReplacerRenderer.configKey) ⇒
    * [.defaultConfig()](#ReplacerRenderer.defaultConfig) ⇒
    * [.validateConfig(config, [_context])](#ReplacerRenderer.validateConfig)
    * [.register(context)](#ReplacerRenderer.register)
    * [.renderContent(content, context)](#ReplacerRenderer.renderContent) ⇒
    * [.renderCollection(collection, context)](#ReplacerRenderer.renderCollection) ⇒
    * [.render(content, config)](#ReplacerRenderer.render) ⇒

<a name="new_ReplacerRenderer_new"></a>

### new ReplacerRenderer()
**Example** *(ReplacerRenderer)*\
```js
const content = ReplacerRenderer.render("...");
```
<a name="ReplacerRenderer.configKey"></a>

### ReplacerRenderer.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>ReplacerRenderer</code>](#ReplacerRenderer)\
**Returns**: The configuration key.\
**Example** *(ReplacerRenderer.configKey)*\
```js
const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
```
<a name="ReplacerRenderer.defaultConfig"></a>

### ReplacerRenderer.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)\
**Returns**: The configuration.\
**Example** *(ReplacerRenderer.defaultConfig())*\
```js
const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
```
<a name="ReplacerRenderer.validateConfig"></a>

### ReplacerRenderer.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)\

| Param | Description |
| --- | --- |
| config | A configuration object. |
| [_context] | Unused. |

**Example** *(ReplacerRenderer.validateConfig(config, _context))*\
```js
ReplacerRenderer.validateConfig({ ... });
```
<a name="ReplacerRenderer.register"></a>

### ReplacerRenderer.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(ReplacerRenderer.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [ReplacerRenderer.configKey]: {
      ...,
      events: {
        renderContent: ['render-content', 'render-meta-description'],
        renderCollection: ['render-search-results'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
ReplacerRenderer.register(context);
```
<a name="ReplacerRenderer.renderContent"></a>

### ReplacerRenderer.renderContent(content, context) ⇒
Replace content in a provided string with a provided context.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)\
**Returns**: The rendered content.\

| Param | Description |
| --- | --- |
| content | Content to be converted to HTML. |
| context | A Uttori-like context. |

**Example** *(ReplacerRenderer.renderContent(content, context))*\
```js
const context = {
  config: {
    [ReplacerRenderer.configKey]: {
      ...,
    },
  },
};
ReplacerRenderer.renderContent(content, context);
```
<a name="ReplacerRenderer.renderCollection"></a>

### ReplacerRenderer.renderCollection(collection, context) ⇒
Replace content in a collection of Uttori documents with a provided context.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)\
**Returns**: The rendered documents.\

| Param | Description |
| --- | --- |
| collection | A collection of Uttori documents. |
| context | A Uttori-like context. |

**Example** *(ReplacerRenderer.renderCollection(collection, context))*\
```js
const context = {
  config: {
    [ReplacerRenderer.configKey]: {
      ...,
    },
  },
};
ReplacerRenderer.renderCollection(collection, context);
```
<a name="ReplacerRenderer.render"></a>

### ReplacerRenderer.render(content, config) ⇒
Replace content in a provided string with a provided set of rules.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)\
**Returns**: The rendered content.\

| Param | Description |
| --- | --- |
| content | Content to be searched through to make replacements. |
| config | A provided configuration to use. |

**Example** *(ReplacerRenderer.render(content, config))*\
```js
const html = ReplacerRenderer.render(content, config);
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { ReplacerRendererConfig } from '../types/plugins/renderer-replacer.js';
export type { ReplacerRendererRule, ReplacerRendererConfig } from '../types/plugins/renderer-replacer.js';
/**
 * Uttori Replacer Renderer
 * @example <caption>ReplacerRenderer</caption>
 * const content = ReplacerRenderer.render("...");
 */
declare class ReplacerRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>ReplacerRenderer.configKey</caption>
     * const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
     */
    static get configKey(): 'uttori-plugin-renderer-replacer';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>ReplacerRenderer.defaultConfig()</caption>
     * const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<ReplacerRendererConfig, 'rules'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param [_context] Unused.
     * @example <caption>ReplacerRenderer.validateConfig(config, _context)</caption>
     * ReplacerRenderer.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, ReplacerRendererConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>ReplacerRenderer.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *       events: {
     *         renderContent: ['render-content', 'render-meta-description'],
     *         renderCollection: ['render-search-results'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * ReplacerRenderer.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>): void;
    /**
     * Replace content in a provided string with a provided context.
     * @param content Content to be converted to HTML.
     * @param context A Uttori-like context.
     * @returns The rendered content.
     * @example <caption>ReplacerRenderer.renderContent(content, context)</caption>
     * const context = {
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * ReplacerRenderer.renderContent(content, context);
     */
    static renderContent(content: string, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>): string;
    /**
     * Replace content in a collection of Uttori documents with a provided context.
     * @param collection A collection of Uttori documents.
     * @param context A Uttori-like context.
     * @returns The rendered documents.
     * @example <caption>ReplacerRenderer.renderCollection(collection, context)</caption>
     * const context = {
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * ReplacerRenderer.renderCollection(collection, context);
     */
    static renderCollection(collection: import('../wiki.js').UttoriWikiDocument[], context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>): import('../wiki.js').UttoriWikiDocument[];
    /**
     * Replace content in a provided string with a provided set of rules.
     * @param content Content to be searched through to make replacements.
     * @param config A provided configuration to use.
     * @returns The rendered content.
     * @example <caption>ReplacerRenderer.render(content, config)</caption>
     * const html = ReplacerRenderer.render(content, config);
     */
    static render(content: string, config: ReplacerRendererConfig): string;
}
export default ReplacerRenderer;

export interface ReplacerRendererRule {
    /** The test to use for replacing content. */
    test: string | RegExp;
    /** The output to use for replacing content. */
    output: string;
}
export interface ReplacerRendererConfig {
    /** The rules to use for replacing content. */
    rules: ReplacerRendererRule[];
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
}
```

</details>
