## Classes

<dl>
<dt><a href="#EJSRenderer">EJSRenderer</a></dt>
<dd><p>Uttori Replacer Renderer</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#EJSRendererConfig">EJSRendererConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="EJSRenderer"></a>

## EJSRenderer
Uttori Replacer Renderer

**Kind**: global class  

* [EJSRenderer](#EJSRenderer)
    * [.configKey](#EJSRenderer.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#EJSRenderer.defaultConfig) ⇒ [<code>EJSRendererConfig</code>](#EJSRendererConfig)
    * [.validateConfig(config, _context)](#EJSRenderer.validateConfig)
    * [.register(context)](#EJSRenderer.register)
    * [.renderContent(content, context)](#EJSRenderer.renderContent) ⇒ <code>string</code>
    * [.renderCollection(collection, context)](#EJSRenderer.renderCollection) ⇒ <code>Array.&lt;object&gt;</code>
    * [.render(content, config)](#EJSRenderer.render) ⇒ <code>string</code>

<a name="EJSRenderer.configKey"></a>

### EJSRenderer.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>EJSRenderer</code>](#EJSRenderer)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(EJSRenderer.configKey)*  
```js
const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
```
<a name="EJSRenderer.defaultConfig"></a>

### EJSRenderer.defaultConfig() ⇒ [<code>EJSRendererConfig</code>](#EJSRendererConfig)
The default configuration.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)  
**Returns**: [<code>EJSRendererConfig</code>](#EJSRendererConfig) - The configuration.  
**Example** *(EJSRenderer.defaultConfig())*  
```js
const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
```
<a name="EJSRenderer.validateConfig"></a>

### EJSRenderer.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, EJSRendererConfig&gt;</code> | A provided configuration to use. |
| _context | <code>object</code> | Unused |

**Example** *(EJSRenderer.validateConfig(config, _context))*  
```js
EJSRenderer.validateConfig({ ... });
```
<a name="EJSRenderer.register"></a>

### EJSRenderer.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>object</code> | A Uttori-like context. |
| context.hooks | <code>object</code> | An event system / hook system to use. |
| context.hooks.on | <code>function</code> | An event registration function. |
| context.config | <code>Record.&lt;string, EJSRendererConfig&gt;</code> | A provided configuration to use. |

**Example** *(EJSRenderer.register(context))*  
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

### EJSRenderer.renderContent(content, context) ⇒ <code>string</code>
Replace content in a provided string with a provided context.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)  
**Returns**: <code>string</code> - The rendered content.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Content to be converted to HTML. |
| context | <code>object</code> | A Uttori-like context. |
| context.config | <code>Record.&lt;string, EJSRendererConfig&gt;</code> | A provided configuration to use. |

**Example** *(EJSRenderer.renderContent(content, context))*  
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

### EJSRenderer.renderCollection(collection, context) ⇒ <code>Array.&lt;object&gt;</code>
Replace content in a collection of Uttori documents with a provided context.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)  
**Returns**: <code>Array.&lt;object&gt;</code> - } The rendered documents.  

| Param | Type | Description |
| --- | --- | --- |
| collection | <code>Array.&lt;UttoriWikiDocument&gt;</code> | A collection of Uttori documents. |
| context | <code>object</code> | A Uttori-like context. |
| context.config | <code>Record.&lt;string, EJSRendererConfig&gt;</code> | A provided configuration to use. |

**Example** *(EJSRenderer.renderCollection(collection, context))*  
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

### EJSRenderer.render(content, config) ⇒ <code>string</code>
Render EJS content in a provided string.

**Kind**: static method of [<code>EJSRenderer</code>](#EJSRenderer)  
**Returns**: <code>string</code> - The rendered content.  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | Content to be searched through to make replacements. |
| config | <code>object</code> | A provided configuration to use. |

**Example** *(EJSRenderer.render(content, config))*  
```js
const html = EJSRenderer.render(content, config);
```
<a name="EJSRendererConfig"></a>

## EJSRendererConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | Events to bind to. |

