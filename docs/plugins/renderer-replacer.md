## Classes

<dl>
<dt><a href="#ReplacerRenderer">ReplacerRenderer</a></dt>
<dd><p>Uttori Replacer Renderer</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ReplacerRendererRule">ReplacerRendererRule</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ReplacerRendererConfig">ReplacerRendererConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="ReplacerRenderer"></a>

## ReplacerRenderer
Uttori Replacer Renderer

**Kind**: global class  

* [ReplacerRenderer](#ReplacerRenderer)
    * [new ReplacerRenderer()](#new_ReplacerRenderer_new)
    * [.configKey](#ReplacerRenderer.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#ReplacerRenderer.defaultConfig) ⇒ [<code>ReplacerRendererConfig</code>](#ReplacerRendererConfig)
    * [.validateConfig(config, [_context])](#ReplacerRenderer.validateConfig)
    * [.register(context)](#ReplacerRenderer.register)
    * [.renderContent(content, context)](#ReplacerRenderer.renderContent) ⇒ <code>string</code>
    * [.renderCollection(collection, context)](#ReplacerRenderer.renderCollection) ⇒ <code>Array.&lt;UttoriWikiDocument&gt;</code>
    * [.render(content, config)](#ReplacerRenderer.render) ⇒ <code>string</code>

<a name="new_ReplacerRenderer_new"></a>

### new ReplacerRenderer()
**Example** *(ReplacerRenderer)*  
```js
const content = ReplacerRenderer.render("...");
```
<a name="ReplacerRenderer.configKey"></a>

### ReplacerRenderer.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>ReplacerRenderer</code>](#ReplacerRenderer)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(ReplacerRenderer.configKey)*  
```js
const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
```
<a name="ReplacerRenderer.defaultConfig"></a>

### ReplacerRenderer.defaultConfig() ⇒ [<code>ReplacerRendererConfig</code>](#ReplacerRendererConfig)
The default configuration.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)  
**Returns**: [<code>ReplacerRendererConfig</code>](#ReplacerRendererConfig) - The configuration.  
**Example** *(ReplacerRenderer.defaultConfig())*  
```js
const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
```
<a name="ReplacerRenderer.validateConfig"></a>

### ReplacerRenderer.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, ReplacerRendererConfig&gt;</code> | A configuration object. |
| [_context] | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-replacer&#x27;, ReplacerRendererConfig&gt;</code> | Unused. |

**Example** *(ReplacerRenderer.validateConfig(config, _context))*  
```js
ReplacerRenderer.validateConfig({ ... });
```
<a name="ReplacerRenderer.register"></a>

### ReplacerRenderer.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-replacer&#x27;, ReplacerRendererConfig&gt;</code> | A Uttori-like context. |

**Example** *(ReplacerRenderer.register(context))*  
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

### ReplacerRenderer.renderContent(content, context) ⇒ <code>string</code>
Replace content in a provided string with a provided context.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)  
**Returns**: <code>string</code> - The rendered content.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Content to be converted to HTML. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-replacer&#x27;, ReplacerRendererConfig&gt;</code> | A Uttori-like context. |

**Example** *(ReplacerRenderer.renderContent(content, context))*  
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

### ReplacerRenderer.renderCollection(collection, context) ⇒ <code>Array.&lt;UttoriWikiDocument&gt;</code>
Replace content in a collection of Uttori documents with a provided context.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)  
**Returns**: <code>Array.&lt;UttoriWikiDocument&gt;</code> - The rendered documents.  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Array.&lt;UttoriWikiDocument&gt;</code> | A collection of Uttori documents. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-renderer-replacer&#x27;, ReplacerRendererConfig&gt;</code> | A Uttori-like context. |

**Example** *(ReplacerRenderer.renderCollection(collection, context))*  
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

### ReplacerRenderer.render(content, config) ⇒ <code>string</code>
Replace content in a provided string with a provided set of rules.

**Kind**: static method of [<code>ReplacerRenderer</code>](#ReplacerRenderer)  
**Returns**: <code>string</code> - The rendered content.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Content to be searched through to make replacements. |
| config | [<code>ReplacerRendererConfig</code>](#ReplacerRendererConfig) | A provided configuration to use. |

**Example** *(ReplacerRenderer.render(content, config))*  
```js
const html = ReplacerRenderer.render(content, config);
```
<a name="ReplacerRendererRule"></a>

## ReplacerRendererRule : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| test | <code>string</code> \| <code>RegExp</code> | The test to use for replacing content. |
| output | <code>string</code> | The output to use for replacing content. |

<a name="ReplacerRendererConfig"></a>

## ReplacerRendererConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rules | [<code>Array.&lt;ReplacerRendererRule&gt;</code>](#ReplacerRendererRule) | The rules to use for replacing content. |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspond to methods, and contents are events to listen for. |

