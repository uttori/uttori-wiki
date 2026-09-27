## Classes

<dl>
<dt><a href="#MarkdownItRenderer">MarkdownItRenderer</a></dt>
<dd><p>Uttori MarkdownIt Renderer</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#createParser">createParser(config)</a> ⇒</dt>
<dd><p>Creates the parser shared by render and parse so both paths use the same link rules.</p>
</dd>
</dl>

<a name="MarkdownItRenderer"></a>

## MarkdownItRenderer
Uttori MarkdownIt Renderer

**Kind**: global class\

* [MarkdownItRenderer](#MarkdownItRenderer)
    * [new MarkdownItRenderer()](#new_MarkdownItRenderer_new)
    * [.configKey](#MarkdownItRenderer.configKey) ⇒
    * [.defaultConfig()](#MarkdownItRenderer.defaultConfig) ⇒
    * [.extendConfig(config)](#MarkdownItRenderer.extendConfig) ⇒
    * [.validateConfig(config, _context)](#MarkdownItRenderer.validateConfig)
    * [.register(context)](#MarkdownItRenderer.register)
    * [.renderContent(content, context)](#MarkdownItRenderer.renderContent) ⇒
    * [.renderCollection(collection, context)](#MarkdownItRenderer.renderCollection) ⇒
    * [.render(content, [config])](#MarkdownItRenderer.render) ⇒
    * [.parse(content, [config])](#MarkdownItRenderer.parse) ⇒
    * [.cleanContent(content, [md])](#MarkdownItRenderer.cleanContent) ⇒
    * [.cleanLinks(content)](#MarkdownItRenderer.cleanLinks) ⇒
    * [.viewModelDetail(viewModel, context)](#MarkdownItRenderer.viewModelDetail) ⇒

<a name="new_MarkdownItRenderer_new"></a>

### new MarkdownItRenderer()
**Example** *(MarkdownItRenderer)*\
```js
const content = MarkdownItRenderer.render("...");
```
<a name="MarkdownItRenderer.configKey"></a>

### MarkdownItRenderer.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The configuration key.\
**Example** *(MarkdownItRenderer.configKey)*\
```js
const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
```
<a name="MarkdownItRenderer.defaultConfig"></a>

### MarkdownItRenderer.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The default configuration.\
**Example** *(MarkdownItRenderer.defaultConfig())*\
```js
const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
```
<a name="MarkdownItRenderer.extendConfig"></a>

### MarkdownItRenderer.extendConfig(config) ⇒
Create a config that is extended from the default config.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The new configration.\

| Param | Description |
| --- | --- |
| config | The user provided configuration. |

<a name="MarkdownItRenderer.validateConfig"></a>

### MarkdownItRenderer.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |
| _context | Unused |

**Example** *(MarkdownItRenderer.validateConfig(config, _context))*\
```js
MarkdownItRenderer.validateConfig({ ... });
```
<a name="MarkdownItRenderer.register"></a>

### MarkdownItRenderer.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(MarkdownItRenderer.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [MarkdownItRenderer.configKey]: {
      ...,
      events: {
        renderContent: ['render-content', 'render-meta-description'],
        renderCollection: ['render-search-results'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
MarkdownItRenderer.register(context);
```
<a name="MarkdownItRenderer.renderContent"></a>

### MarkdownItRenderer.renderContent(content, context) ⇒
Renders Markdown for a provided string with a provided context.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The rendered content.\

| Param | Description |
| --- | --- |
| content | Markdown content to be converted to HTML. |
| context | A Uttori-like context. |

**Example** *(MarkdownItRenderer.renderContent(content, context))*\
```js
const context = {
  config: {
    [MarkdownItRenderer.configKey]: {
      ...,
    },
  },
};
MarkdownItRenderer.renderContent(content, context);
```
<a name="MarkdownItRenderer.renderCollection"></a>

### MarkdownItRenderer.renderCollection(collection, context) ⇒
Renders Markdown for a collection of Uttori documents with a provided context.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The rendered documents.\

| Param | Description |
| --- | --- |
| collection | A collection of Uttori documents. |
| context | A Uttori-like context. |

**Example** *(MarkdownItRenderer.renderCollection(collection, context))*\
```js
const context = {
  config: {
    [MarkdownItRenderer.configKey]: {
      ...,
    },
  },
};
MarkdownItRenderer.renderCollection(collection, context);
```
<a name="MarkdownItRenderer.render"></a>

### MarkdownItRenderer.render(content, [config]) ⇒
Renders Markdown for a provided string with a provided MarkdownIt configuration.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The rendered content.\

| Param | Description |
| --- | --- |
| content | Markdown content to be converted to HTML. |
| [config] | A provided MarkdownIt configuration to use. |

**Example** *(MarkdownItRenderer.render(content, config))*\
```js
const html = MarkdownItRenderer.render(content, config);
```
<a name="MarkdownItRenderer.parse"></a>

### MarkdownItRenderer.parse(content, [config]) ⇒
Parse Markdown for a provided string with a provided MarkdownIt configuration.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The rendered content.\
**See**: [MarkdownIt.parse](https://markdown-it.github.io/markdown-it/#MarkdownIt.parse)\

| Param | Description |
| --- | --- |
| content | Markdown content to be converted to HTML. |
| [config] | A provided MarkdownIt configuration to use. |

**Example** *(MarkdownItRenderer.parse(content, config))*\
```js
const tokens = MarkdownItRenderer.parse(content, config);
```
<a name="MarkdownItRenderer.cleanContent"></a>

### MarkdownItRenderer.cleanContent(content, [md]) ⇒
Removes empty links and fills placeholder links outside fenced and indented code.
Code source is preserved so diagram labels and code examples are not rewritten.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The rendered content.\

| Param | Description |
| --- | --- |
| content | Markdown content to be converted to HTML. |
| [md] | Parser used to recognize code boundaries, including nested blocks. |

<a name="MarkdownItRenderer.cleanLinks"></a>

### MarkdownItRenderer.cleanLinks(content) ⇒
Apply legacy placeholder-link cleanup to a source region known to be outside code.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: Prose with empty links removed and missing destinations filled.\

| Param | Description |
| --- | --- |
| content | Markdown prose to clean. |

<a name="MarkdownItRenderer.viewModelDetail"></a>

### MarkdownItRenderer.viewModelDetail(viewModel, context) ⇒
Will attempt to extract the table of contents when set to and add it to the view model.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)\
**Returns**: The view model.\

| Param | Description |
| --- | --- |
| viewModel | Markdown content to be converted to HTML. |
| context | A Uttori-like context. |

**Example** *(MarkdownItRenderer.viewModelDetail(viewModel, context))*\
```js
viewModel = MarkdownItRenderer.viewModelDetail(viewModel, context);
```
<a name="createParser"></a>

## createParser(config) ⇒
Creates the parser shared by render and parse so both paths use the same link rules.

**Kind**: global function\
**Returns**: Configured parser.\

| Param | Description |
| --- | --- |
| config | Renderer configuration. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import { referenceTag, definitionOpenTag } from './markdown-it-plugin/footnotes.js';
import type { MarkdownItRendererOptions, MarkdownItRendererConfig } from '../types/plugins/renderer-markdown-it.js';
export type { MarkdownItExample, MarkdownItRendererOptionsUttori, MarkdownItRendererOptions, MarkdownItRendererConfig, MarkdownItRendererInputOptions, } from '../types/plugins/renderer-markdown-it.js';
/**
 * Uttori MarkdownIt Renderer
 * @example <caption>MarkdownItRenderer</caption>
 * const content = MarkdownItRenderer.render("...");
 */
declare class MarkdownItRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>MarkdownItRenderer.configKey</caption>
     * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
     */
    static get configKey(): 'uttori-plugin-renderer-markdown-it';
    /**
     * The default configuration.
     * @returns The default configuration.
     * @example <caption>MarkdownItRenderer.defaultConfig()</caption>
     * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
     */
    static defaultConfig(): {
        markdownIt: MarkdownItRendererOptions;
    };
    /**
     * Create a config that is extended from the default config.
     * @param config The user provided configuration.
     * @returns The new configration.
     */
    static extendConfig(config?: MarkdownItRendererConfig): {
        events?: Record<string, string[]>;
        markdownIt: {
            html?: boolean;
            xhtmlOut?: boolean;
            breaks?: boolean;
            langPrefix?: string;
            linkify?: boolean;
            typographer?: boolean;
            quotes?: string | string[];
            uttori: {
                baseUrl: string;
                allowedExternalDomains: string[];
                disableValidation: boolean;
                openNewWindow: boolean;
                lazyImages: boolean;
                mermaid?: boolean;
                examples?: Record<string, import("../types/plugins/renderer-markdown-it.js").MarkdownItExample>;
                footnotes: {
                    referenceTag: typeof import("./markdown-it-plugin/footnotes.js").referenceTag;
                    definitionOpenTag: typeof import("./markdown-it-plugin/footnotes.js").definitionOpenTag;
                    definitionCloseTag: string;
                };
                toc: {
                    extract: boolean;
                    openingTag: string;
                    closingTag: string;
                    slugify: object;
                    stableIds?: boolean;
                };
                wikilinks: {
                    slugify: object;
                };
            };
        };
    };
    /**
     * Validates the provided configuration for required entries.
     * @param config A provided configuration to use.
     * @param _context Unused
     * @example <caption>MarkdownItRenderer.validateConfig(config, _context)</caption>
     * MarkdownItRenderer.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, MarkdownItRendererConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>MarkdownItRenderer.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [MarkdownItRenderer.configKey]: {
     *       ...,
     *       events: {
     *         renderContent: ['render-content', 'render-meta-description'],
     *         renderCollection: ['render-search-results'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * MarkdownItRenderer.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): void;
    /**
     * Renders Markdown for a provided string with a provided context.
     * @param content Markdown content to be converted to HTML.
     * @param context A Uttori-like context.
     * @returns The rendered content.
     * @example <caption>MarkdownItRenderer.renderContent(content, context)</caption>
     * const context = {
     *   config: {
     *     [MarkdownItRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * MarkdownItRenderer.renderContent(content, context);
     */
    static renderContent(content: string, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): string;
    /**
     * Renders Markdown for a collection of Uttori documents with a provided context.
     * @param collection A collection of Uttori documents.
     * @param context A Uttori-like context.
     * @returns The rendered documents.
     * @example <caption>MarkdownItRenderer.renderCollection(collection, context)</caption>
     * const context = {
     *   config: {
     *     [MarkdownItRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * MarkdownItRenderer.renderCollection(collection, context);
     */
    static renderCollection(collection: import('../wiki.js').UttoriWikiDocument[], context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): import('../wiki.js').UttoriWikiDocument[];
    /**
     * Renders Markdown for a provided string with a provided MarkdownIt configuration.
     * @param content Markdown content to be converted to HTML.
     * @param [config] A provided MarkdownIt configuration to use.
     * @returns The rendered content.
     * @example <caption>MarkdownItRenderer.render(content, config)</caption>
     * const html = MarkdownItRenderer.render(content, config);
     */
    static render(content: string | undefined, config?: MarkdownItRendererConfig): string;
    /**
     * Parse Markdown for a provided string with a provided MarkdownIt configuration.
     * @param content Markdown content to be converted to HTML.
     * @param [config] A provided MarkdownIt configuration to use.
     * @returns The rendered content.
     * @example <caption>MarkdownItRenderer.parse(content, config)</caption>
     * const tokens = MarkdownItRenderer.parse(content, config);
     * @see {@link https://markdown-it.github.io/markdown-it/#MarkdownIt.parse|MarkdownIt.parse}
     */
    static parse(content: string, config?: MarkdownItRendererConfig): import('markdown-it').Token[];
    /**
     * Removes empty links and fills placeholder links outside fenced and indented code.
     * Code source is preserved so diagram labels and code examples are not rewritten.
     * @param content Markdown content to be converted to HTML.
     * @param [md] Parser used to recognize code boundaries, including nested blocks.
     * @returns The rendered content.
     */
    static cleanContent(content: string, md?: import('markdown-it').MarkdownIt): string;
    /**
     * Apply legacy placeholder-link cleanup to a source region known to be outside code.
     * @param content Markdown prose to clean.
     * @returns Prose with empty links removed and missing destinations filled.
     */
    static cleanLinks(content: string): string;
    /**
     * Will attempt to extract the table of contents when set to and add it to the view model.
     * @param viewModel Markdown content to be converted to HTML.
     * @param context A Uttori-like context.
     * @returns The view model.
     * @example <caption>MarkdownItRenderer.viewModelDetail(viewModel, context)</caption>
     * viewModel = MarkdownItRenderer.viewModelDetail(viewModel, context);
     */
    static viewModelDetail(viewModel: import('../wiki.js').UttoriWikiViewModel, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): import('../wiki.js').UttoriWikiViewModel | {
        toc: string;
    };
}
export default MarkdownItRenderer;

export interface MarkdownItExample {
    /** Editable input shown in the rendered block. */
    source: string;
    /** Output visible before client-side enhancement. */
    expectedOutput: string;
    /** Input field label; defaults to "Input". */
    inputLabel?: string;
    /** Output field label; defaults to "Output". */
    outputLabel?: string;
}
export interface MarkdownItRendererOptionsUttori {
    /** Prefix for relative URLs, useful when the Express app is not at URI root. */
    baseUrl: string;
    /**
     * Allowed External Domains, if a domain is not in this list, it is set to 'nofollow'. Values should be strings of the hostname portion of the URL object (like example.org).
     */
    allowedExternalDomains: string[];
    /**
     * Optionally disable the built in Markdown-It link validation, large security risks when link validation is disabled.
     */
    disableValidation: boolean;
    /** Open external domains in a new window. */
    openNewWindow: boolean;
    /** Add lazy loading params to image tags. */
    lazyImages: boolean;
    /**
     * Defaults to true.Emit escaped Mermaid fences as `pre.mermaid` for client-side rendering, false keeps ordinary code blocks.
     */
    mermaid?: boolean;
    /** Registered editable input and expected output for `[example:id]` blocks. */
    examples?: Record<string, MarkdownItExample>;
    /** Footnote settings. */
    footnotes: {
        referenceTag: typeof import('../../plugins/markdown-it-plugin/footnotes.js').referenceTag;
        definitionOpenTag: typeof import('../../plugins/markdown-it-plugin/footnotes.js').definitionOpenTag;
        definitionCloseTag: string;
    };
    /** Table of Contents settings. */
    toc: {
        extract: boolean;
        openingTag: string;
        closingTag: string;
        slugify: object;
        stableIds?: boolean;
    };
    /** WikiLinks settings. */
    wikilinks: {
        slugify: object;
    };
}
export interface MarkdownItRendererOptions {
    /** Enable HTML tags in source. */
    html?: boolean;
    /** Use '/' to close single tags. */
    xhtmlOut?: boolean;
    /** Convert '\n' in paragraphs into <br>. */
    breaks?: boolean;
    /** CSS language prefix for fenced blocks. */
    langPrefix?: string;
    /** Autoconvert URL-like text to links. */
    linkify?: boolean;
    /** Enable some language-neutral replacement + quotes beautification. */
    typographer?: boolean;
    /** Double + single quotes replacement pairs. */
    quotes?: string | string[];
    /** The Uttori specific configuration. */
    uttori: MarkdownItRendererOptionsUttori;
}
export interface MarkdownItRendererConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** The MarkdownIt configuration. */
    markdownIt: MarkdownItRendererInputOptions;
}
/** Partial caller settings; extendConfig fills nested renderer defaults before parsing. */
export type MarkdownItRendererInputOptions = Omit<MarkdownItRendererOptions, 'uttori'> & {
    uttori?: Partial<Omit<MarkdownItRendererOptionsUttori, 'footnotes' | 'toc' | 'wikilinks'>> & {
        footnotes?: Partial<MarkdownItRendererOptionsUttori['footnotes']>;
        toc?: Partial<MarkdownItRendererOptionsUttori['toc']>;
        wikilinks?: Partial<MarkdownItRendererOptionsUttori['wikilinks']>;
    };
};
/** MarkdownIt passes these plugin-owned values between its parsing and rendering stages. */
declare module 'markdown-it' {
    interface MarkdownItOptions {
        /** Uttori options are populated by the renderer before rules execute. */
        uttori?: MarkdownItRendererOptionsUttori;
    }
    interface Env {
        /** Footnote state shared by block and inline rules. */
        footnotes?: import('../../plugins/markdown-it-plugin/footnotes.js').MarkdownItFootnotesEnv;
        /** Headings collected before table-of-contents rendering. */
        toc_headings?: import('../../plugins/markdown-it-plugin/toc.js').MarkdownItTocHeading[];
    }
}
```

</details>
