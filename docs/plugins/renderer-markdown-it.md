## Classes

<dl>
<dt><a href="#MarkdownItRenderer">MarkdownItRenderer</a></dt>
<dd><p>Uttori MarkdownIt Renderer</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#MarkdownItRendererOptionsUttori">MarkdownItRendererOptionsUttori</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#MarkdownItRendererOptions">MarkdownItRendererOptions</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#MarkdownItRendererConfig">MarkdownItRendererConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="MarkdownItRenderer"></a>

## MarkdownItRenderer
Uttori MarkdownIt Renderer

**Kind**: global class  

* [MarkdownItRenderer](#MarkdownItRenderer)
    * [new MarkdownItRenderer()](#new_MarkdownItRenderer_new)
    * [.configKey](#MarkdownItRenderer.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#MarkdownItRenderer.defaultConfig) ⇒ [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig)
    * [.extendConfig(config)](#MarkdownItRenderer.extendConfig) ⇒ [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig)
    * [.validateConfig(config, _context)](#MarkdownItRenderer.validateConfig)
    * [.register(context)](#MarkdownItRenderer.register)
    * [.renderContent(content, context)](#MarkdownItRenderer.renderContent) ⇒ <code>string</code>
    * [.renderCollection(collection, context)](#MarkdownItRenderer.renderCollection) ⇒ <code>Array.&lt;UttoriWikiDocument&gt;</code>
    * [.render(content, [config])](#MarkdownItRenderer.render) ⇒ <code>string</code>
    * [.parse(content, [config])](#MarkdownItRenderer.parse) ⇒ <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code>
    * [.cleanContent(content)](#MarkdownItRenderer.cleanContent) ⇒ <code>string</code>
    * [.viewModelDetail(viewModel, context)](#MarkdownItRenderer.viewModelDetail) ⇒ <code>UttoriWikiViewModel</code> \| <code>Object</code>

<a name="new_MarkdownItRenderer_new"></a>

### new MarkdownItRenderer()
**Example** *(MarkdownItRenderer)*  
```js
const content = MarkdownItRenderer.render("...");
```
<a name="MarkdownItRenderer.configKey"></a>

### MarkdownItRenderer.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(MarkdownItRenderer.configKey)*  
```js
const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
```
<a name="MarkdownItRenderer.defaultConfig"></a>

### MarkdownItRenderer.defaultConfig() ⇒ [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig)
The default configuration.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig) - The default configuration.  
**Example** *(MarkdownItRenderer.defaultConfig())*  
```js
const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
```
<a name="MarkdownItRenderer.extendConfig"></a>

### MarkdownItRenderer.extendConfig(config) ⇒ [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig)
Create a config that is extended from the default config.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig) - The new configration.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig) | The user provided configuration. |

<a name="MarkdownItRenderer.validateConfig"></a>

### MarkdownItRenderer.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, MarkdownItRendererConfig&gt;</code> | A provided configuration to use. |
| _context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-markdown-it&#x27;, MarkdownItRendererConfig&gt;</code> | Unused |

**Example** *(MarkdownItRenderer.validateConfig(config, _context))*  
```js
MarkdownItRenderer.validateConfig({ ... });
```
<a name="MarkdownItRenderer.register"></a>

### MarkdownItRenderer.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-markdown-it&#x27;, MarkdownItRendererConfig&gt;</code> | A Uttori-like context. |

**Example** *(MarkdownItRenderer.register(context))*  
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

### MarkdownItRenderer.renderContent(content, context) ⇒ <code>string</code>
Renders Markdown for a provided string with a provided context.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: <code>string</code> - The rendered content.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Markdown content to be converted to HTML. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-markdown-it&#x27;, MarkdownItRendererConfig&gt;</code> | A Uttori-like context. |

**Example** *(MarkdownItRenderer.renderContent(content, context))*  
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

### MarkdownItRenderer.renderCollection(collection, context) ⇒ <code>Array.&lt;UttoriWikiDocument&gt;</code>
Renders Markdown for a collection of Uttori documents with a provided context.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: <code>Array.&lt;UttoriWikiDocument&gt;</code> - The rendered documents.  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Array.&lt;UttoriWikiDocument&gt;</code> | A collection of Uttori documents. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-markdown-it&#x27;, MarkdownItRendererConfig&gt;</code> | A Uttori-like context. |

**Example** *(MarkdownItRenderer.renderCollection(collection, context))*  
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

### MarkdownItRenderer.render(content, [config]) ⇒ <code>string</code>
Renders Markdown for a provided string with a provided MarkdownIt configuration.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: <code>string</code> - The rendered content.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Markdown content to be converted to HTML. |
| [config] | [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig) | A provided MarkdownIt configuration to use. |

**Example** *(MarkdownItRenderer.render(content, config))*  
```js
const html = MarkdownItRenderer.render(content, config);
```
<a name="MarkdownItRenderer.parse"></a>

### MarkdownItRenderer.parse(content, [config]) ⇒ <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code>
Parse Markdown for a provided string with a provided MarkdownIt configuration.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: <code>Array.&lt;module:markdown-it/index.js~Token&gt;</code> - The rendered content.  
**See**: [MarkdownIt.parse](https://markdown-it.github.io/markdown-it/#MarkdownIt.parse)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Markdown content to be converted to HTML. |
| [config] | [<code>MarkdownItRendererConfig</code>](#MarkdownItRendererConfig) | A provided MarkdownIt configuration to use. |

**Example** *(MarkdownItRenderer.parse(content, config))*  
```js
const tokens = MarkdownItRenderer.parse(content, config);
```
<a name="MarkdownItRenderer.cleanContent"></a>

### MarkdownItRenderer.cleanContent(content) ⇒ <code>string</code>
Removes empty links, as these have caused issues.
Find missing links, and link them to the slug from the provided text.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: <code>string</code> - The rendered content.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Markdown content to be converted to HTML. |

<a name="MarkdownItRenderer.viewModelDetail"></a>

### MarkdownItRenderer.viewModelDetail(viewModel, context) ⇒ <code>UttoriWikiViewModel</code> \| <code>Object</code>
Will attempt to extract the table of contents when set to and add it to the view model.

**Kind**: static method of [<code>MarkdownItRenderer</code>](#MarkdownItRenderer)  
**Returns**: <code>UttoriWikiViewModel</code> \| <code>Object</code> - The view model.  

| Param | Type | Description |
| --- | --- | --- |
| viewModel | <code>UttoriWikiViewModel</code> | Markdown content to be converted to HTML. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-markdown-it&#x27;, MarkdownItRendererConfig&gt;</code> | A Uttori-like context. |

**Example** *(MarkdownItRenderer.viewModelDetail(viewModel, context))*  
```js
viewModel = MarkdownItRenderer.viewModelDetail(viewModel, context);
```
<a name="MarkdownItRendererOptionsUttori"></a>

## MarkdownItRendererOptionsUttori : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| baseUrl | <code>string</code> | Prefix for relative URLs, useful when the Express app is not at URI root. |
| allowedExternalDomains | <code>Array.&lt;string&gt;</code> | Allowed External Domains, if a domain is not in this list, it is set to 'nofollow'. Values should be strings of the hostname portion of the URL object (like example.org). |
| disableValidation | <code>boolean</code> | Optionally disable the built in Markdown-It link validation, large security risks when link validation is disabled. |
| openNewWindow | <code>boolean</code> | Open external domains in a new window. |
| lazyImages | <code>boolean</code> | Add lazy loading params to image tags. |
| [footnotes] | <code>object</code> | Footnote settings. |
| footnotes.referenceTag | <code>function</code> | A funciton to return the default HTML for a footnote reference. |
| footnotes.definitionOpenTag | <code>function</code> | A funciton to return the default opening HTML for a footnote definition. |
| footnotes.definitionCloseTag | <code>string</code> | The default closing HTML for a footnote definition. |
| [toc] | <code>object</code> | Table of Contents settings. |
| toc.extract | <code>boolean</code> | When true, extract the table of contents to the view model from the content. |
| toc.openingTag | <code>string</code> | The opening DOM tag for the TOC container. |
| toc.closingTag | <code>string</code> | The closing DOM tag for the TOC container. |
| toc.slugify | <code>object</code> | Slugify options for convering headings to anchor links. |
| [wikilinks] | <code>object</code> | WikiLinks settings. |
| wikilinks.slugify | <code>object</code> | Slugify options for convering Wikilinks to anchor links. |

<a name="MarkdownItRendererOptions"></a>

## MarkdownItRendererOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [html] | <code>boolean</code> | Enable HTML tags in source. |
| [xhtmlOut] | <code>boolean</code> | Use '/' to close single tags. |
| [breaks] | <code>boolean</code> | Convert '\n' in paragraphs into <br>. |
| [langPrefix] | <code>string</code> | CSS language prefix for fenced blocks. |
| [linkify] | <code>boolean</code> | Autoconvert URL-like text to links. |
| [typographer] | <code>boolean</code> | Enable some language-neutral replacement + quotes beautification. |
| [quotes] | <code>string</code> | Double + single quotes replacement pairs. |
| uttori | [<code>MarkdownItRendererOptionsUttori</code>](#MarkdownItRendererOptionsUttori) | The Uttori specific configuration. |

<a name="MarkdownItRendererConfig"></a>

## MarkdownItRendererConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspond to methods, and contents are events to listen for. |
| markdownIt | [<code>MarkdownItRendererOptions</code>](#MarkdownItRendererOptions) | The MarkdownIt configuration. |

