## Classes

<dl>
<dt><a href="#SitemapGenerator">SitemapGenerator</a></dt>
<dd><p>Uttori Sitemap Generator</p>
<p>Generates a valid sitemap.xml file for submitting to search engines.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SitemapGeneratorUrl">SitemapGeneratorUrl</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SitemapGeneratorConfig">SitemapGeneratorConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="SitemapGenerator"></a>

## SitemapGenerator
Uttori Sitemap Generator

Generates a valid sitemap.xml file for submitting to search engines.

**Kind**: global class  

* [SitemapGenerator](#SitemapGenerator)
    * [new SitemapGenerator()](#new_SitemapGenerator_new)
    * [.configKey](#SitemapGenerator.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#SitemapGenerator.defaultConfig) ⇒ [<code>SitemapGeneratorConfig</code>](#SitemapGeneratorConfig)
    * [.validateConfig(config, [_context])](#SitemapGenerator.validateConfig)
    * [.register(context)](#SitemapGenerator.register)
    * [.callback(document, context)](#SitemapGenerator.callback) ⇒ <code>Promise.&lt;object&gt;</code>
    * [.generateSitemap(context)](#SitemapGenerator.generateSitemap) ⇒ <code>Promise.&lt;string&gt;</code>

<a name="new_SitemapGenerator_new"></a>

### new SitemapGenerator()
**Example** *(SitemapGenerator)*  
```js
const sitemap = SitemapGenerator.generate({ ... });
```
<a name="SitemapGenerator.configKey"></a>

### SitemapGenerator.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>SitemapGenerator</code>](#SitemapGenerator)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(SitemapGenerator.configKey)*  
```js
const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
```
<a name="SitemapGenerator.defaultConfig"></a>

### SitemapGenerator.defaultConfig() ⇒ [<code>SitemapGeneratorConfig</code>](#SitemapGeneratorConfig)
The default configuration.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)  
**Returns**: [<code>SitemapGeneratorConfig</code>](#SitemapGeneratorConfig) - The configuration.  
**Example** *(SitemapGenerator.defaultConfig())*  
```js
const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
```
<a name="SitemapGenerator.validateConfig"></a>

### SitemapGenerator.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, SitemapGeneratorConfig&gt;</code> | A configuration object. |
| [_context] | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-generator-sitemap&#x27;, SitemapGeneratorConfig&gt;</code> | A Uttori-like context (unused). |

**Example** *(SitemapGenerator.validateConfig(config, _context))*  
```js
SitemapGenerator.validateConfig({ ... });
```
<a name="SitemapGenerator.register"></a>

### SitemapGenerator.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-generator-sitemap&#x27;, SitemapGeneratorConfig&gt;</code> | A Uttori-like context. |

**Example** *(SitemapGenerator.register(context))*  
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

### SitemapGenerator.callback(document, context) ⇒ <code>Promise.&lt;object&gt;</code>
Wrapper function for calling generating and writing the sitemap file.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)  
**Returns**: <code>Promise.&lt;object&gt;</code> - The provided document.  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriWikiDocument</code> | A Uttori document (unused). |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-generator-sitemap&#x27;, SitemapGeneratorConfig&gt;</code> | A Uttori-like context. |

**Example** *(SitemapGenerator.callback(_document, context))*  
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

### SitemapGenerator.generateSitemap(context) ⇒ <code>Promise.&lt;string&gt;</code>
Generates a sitemap from the provided context.

**Kind**: static method of [<code>SitemapGenerator</code>](#SitemapGenerator)  
**Returns**: <code>Promise.&lt;string&gt;</code> - The generated sitemap.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-generator-sitemap&#x27;, SitemapGeneratorConfig&gt;</code> | A Uttori-like context. |

**Example** *(SitemapGenerator.callback(_document, context))*  
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
<a name="SitemapGeneratorUrl"></a>

## SitemapGeneratorUrl : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL of the document. |
| lastmod | <code>string</code> | The last modified date of the document. |
| priority | <code>string</code> | The priority of the document. |
| [changefreq] | <code>string</code> | The change frequency of the document. |

<a name="SitemapGeneratorConfig"></a>

## SitemapGeneratorConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> |  | An object whose keys correspond to methods, and contents are events to listen for. |
| urls | [<code>Array.&lt;SitemapGeneratorUrl&gt;</code>](#SitemapGeneratorUrl) |  | A collection of Uttori documents. |
| [url_filters] | <code>Array.&lt;RegExp&gt;</code> |  | A collection of Regular Expression URL filters to exclude documents. |
| base_url | <code>string</code> |  | The base URL (ie https://domain.tld) for all documents. |
| directory | <code>string</code> |  | The path to the location you want the sitemap file to be written to. |
| [filename] | <code>string</code> | <code>&quot;&#x27;sitemap&#x27;&quot;</code> | The file name to use for the generated file. |
| [extension] | <code>string</code> | <code>&quot;&#x27;xml&#x27;&quot;</code> | The file extension to use for the generated file. |
| [page_priority] | <code>string</code> | <code>&quot;&#x27;0.08&#x27;&quot;</code> | Sitemap default page priority. |
| [xml_header] | <code>string</code> |  | Sitemap XML Header, standard XML sitemap header is the default. |
| [xml_footer] | <code>string</code> |  | Sitemap XML Footer, standard XML sitemap closing tag is the default. |

