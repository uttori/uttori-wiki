<a name="SitemapGenerator"></a>

## SitemapGenerator
Uttori Sitemap Generator

Generates a valid sitemap.xml file for submitting to search engines.

**Kind**: global class\

* [SitemapGenerator](#SitemapGenerator)
    * [new SitemapGenerator()](#new_SitemapGenerator_new)
    * [.configKey](#SitemapGenerator.configKey) ⇒
    * [.defaultConfig()](#SitemapGenerator.defaultConfig) ⇒
    * [.validateConfig(config, [_context])](#SitemapGenerator.validateConfig)
    * [.register(context)](#SitemapGenerator.register)
    * [.callback(document, context)](#SitemapGenerator.callback) ⇒
    * [.generateSitemap(context)](#SitemapGenerator.generateSitemap) ⇒
    * [.generateRoutes(routes, config)](#SitemapGenerator.generateRoutes) ⇒

<a name="new_SitemapGenerator_new"></a>

### new SitemapGenerator()
**Example** *(SitemapGenerator)*\
```js
const sitemap = SitemapGenerator.generate({ ... });
```
<a name="SitemapGenerator.configKey"></a>

### SitemapGenerator.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>SitemapGenerator</code>](#SitemapGenerator)\
**Returns**: The configuration key.\
**Example** *(SitemapGenerator.configKey)*\
```js
const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
```
<a name="SitemapGenerator.defaultConfig"></a>

### SitemapGenerator.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)\
**Returns**: The configuration.\
**Example** *(SitemapGenerator.defaultConfig())*\
```js
const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
```
<a name="SitemapGenerator.validateConfig"></a>

### SitemapGenerator.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)\

| Param | Description |
| --- | --- |
| config | A configuration object. |
| [_context] | A Uttori-like context (unused). |

**Example** *(SitemapGenerator.validateConfig(config, _context))*\
```js
SitemapGenerator.validateConfig({ ... });
```
<a name="SitemapGenerator.register"></a>

### SitemapGenerator.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(SitemapGenerator.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [SitemapGenerator.configKey]: {
      ...,
      events: {
        callback: ['document-save', 'document-delete'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
SitemapGenerator.register(context);
```
<a name="SitemapGenerator.callback"></a>

### SitemapGenerator.callback(document, context) ⇒
Wrapper function for calling generating and writing the sitemap file.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)\
**Returns**: The provided document.\

| Param | Description |
| --- | --- |
| document | A Uttori document (unused). |
| context | A Uttori-like context. |

**Example** *(SitemapGenerator.callback(_document, context))*\
```js
const context = {
  config: {
    [SitemapGenerator.configKey]: {
      ...,
    },
  },
  hooks: {
    on: (event) => { ... }
  },
};
SitemapGenerator.callback(null, context);
```
<a name="SitemapGenerator.generateSitemap"></a>

### SitemapGenerator.generateSitemap(context) ⇒
Generates a sitemap from the provided context.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)\
**Returns**: The generated sitemap.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(SitemapGenerator.callback(_document, context))*\
```js
const context = {
  config: {
    [SitemapGenerator.configKey]: {
      ...,
    },
  },
  hooks: {
    on: (event) => { ... },
    fetch: (event, query) => { ... },
  },
};
SitemapGenerator.generateSitemap(context);
```
<a name="SitemapGenerator.generateRoutes"></a>

### SitemapGenerator.generateRoutes(routes, config) ⇒
Render an explicit finite route list without querying storage.
Static exports use this so the sitemap has exactly the pages in the artifact.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)\
**Returns**: Sitemap XML.\

| Param | Description |
| --- | --- |
| routes | Public paths and their content dates. |
| config | Sitemap formatting and canonical origin. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { SitemapGeneratorUrl, SitemapGeneratorConfig } from '../types/plugins/sitemap-generator.js';
export type { SitemapGeneratorUrl, SitemapUrlFilter, SitemapGeneratorConfig, } from '../types/plugins/sitemap-generator.js';
/**
 * Uttori Sitemap Generator
 *
 * Generates a valid sitemap.xml file for submitting to search engines.
 * @example <caption>SitemapGenerator</caption>
 * const sitemap = SitemapGenerator.generate({ ... });
 */
declare class SitemapGenerator {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>SitemapGenerator.configKey</caption>
     * const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
     */
    static get configKey(): 'uttori-plugin-generator-sitemap';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>SitemapGenerator.defaultConfig()</caption>
     * const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<SitemapGeneratorConfig, 'urls' | 'url_filters' | 'base_url' | 'directory' | 'filename' | 'extension' | 'page_priority' | 'xml_header' | 'xml_footer'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param [_context] A Uttori-like context (unused).
     * @example <caption>SitemapGenerator.validateConfig(config, _context)</caption>
     * SitemapGenerator.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, SitemapGeneratorConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>SitemapGenerator.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [SitemapGenerator.configKey]: {
     *       ...,
     *       events: {
     *         callback: ['document-save', 'document-delete'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * SitemapGenerator.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>): void;
    /**
     * Wrapper function for calling generating and writing the sitemap file.
     * @async
     * @param document A Uttori document (unused).
     * @param context A Uttori-like context.
     * @returns The provided document.
     * @example <caption>SitemapGenerator.callback(_document, context)</caption>
     * const context = {
     *   config: {
     *     [SitemapGenerator.configKey]: {
     *       ...,
     *     },
     *   },
     *   hooks: {
     *     on: (event) => { ... }
     *   },
     * };
     * SitemapGenerator.callback(null, context);
     */
    static callback(document: import('../wiki.js').UttoriWikiDocument, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>): Promise<object>;
    /**
     * Generates a sitemap from the provided context.
     * @param context A Uttori-like context.
     * @returns The generated sitemap.
     * @example <caption>SitemapGenerator.callback(_document, context)</caption>
     * const context = {
     *   config: {
     *     [SitemapGenerator.configKey]: {
     *       ...,
     *     },
     *   },
     *   hooks: {
     *     on: (event) => { ... },
     *     fetch: (event, query) => { ... },
     *   },
     * };
     * SitemapGenerator.generateSitemap(context);
     */
    static generateSitemap(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>): Promise<string>;
    /**
     * Render an explicit finite route list without querying storage.
     * Static exports use this so the sitemap has exactly the pages in the artifact.
     * @param routes Public paths and their content dates.
     * @param config Sitemap formatting and canonical origin.
     * @returns Sitemap XML.
     */
    static generateRoutes(routes: SitemapGeneratorUrl[], config: Partial<SitemapGeneratorConfig>): string;
}
export default SitemapGenerator;

export interface SitemapGeneratorUrl {
    /** The URL of the document. */
    url: string;
    /** The last modified date of the document. */
    lastmod?: string;
    /** The priority of the document. */
    priority?: string;
    /** The change frequency of the document. */
    changefreq?: string;
}
export type SitemapUrlFilter = (route: SitemapGeneratorUrl) => boolean;
export interface SitemapGeneratorConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** A collection of Uttori documents. */
    urls: SitemapGeneratorUrl[];
    /** A collection of Regular Expression URL filters to exclude documents. */
    url_filters?: RegExp[];
    /** The base URL (ie https://domain.tld) for all documents. */
    base_url: string;
    /** The path to the location you want the sitemap file to be written to. */
    directory: string;
    /** The file name to use for the generated file. */
    filename?: string;
    /** The file extension to use for the generated file. */
    extension?: string;
    /** Sitemap default page priority. */
    page_priority?: string;
    /** Sitemap XML Header, standard XML sitemap header is the default. */
    xml_header?: string;
    /** Sitemap XML Footer, standard XML sitemap closing tag is the default. */
    xml_footer?: string;
}
```

</details>
