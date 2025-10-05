## Classes

<dl>
<dt><a href="#AnalyticsPlugin">AnalyticsPlugin</a></dt>
<dd><p>Page view analytics for Uttori documents using JSON files stored on the local file system.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AnalyticsPluginPopularDocument">AnalyticsPluginPopularDocument</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#AnalyticsPluginConfig">AnalyticsPluginConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="AnalyticsPlugin"></a>

## AnalyticsPlugin
Page view analytics for Uttori documents using JSON files stored on the local file system.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | [<code>AnalyticsPluginConfig</code>](#AnalyticsPluginConfig) | The configuration object. |


* [AnalyticsPlugin](#AnalyticsPlugin)
    * [new AnalyticsPlugin()](#new_AnalyticsPlugin_new)
    * [.configKey](#AnalyticsPlugin.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#AnalyticsPlugin.defaultConfig) ⇒ [<code>AnalyticsPluginConfig</code>](#AnalyticsPluginConfig)
    * [.validateConfig(config, _context)](#AnalyticsPlugin.validateConfig)
    * [.register(context)](#AnalyticsPlugin.register)
    * [.updateDocument(analytics)](#AnalyticsPlugin.updateDocument) ⇒ <code>function</code>
    * [.getCount(analytics)](#AnalyticsPlugin.getCount) ⇒ <code>function</code>
    * [.getPopularDocuments(analytics)](#AnalyticsPlugin.getPopularDocuments) ⇒ <code>function</code>

<a name="new_AnalyticsPlugin_new"></a>

### new AnalyticsPlugin()
**Example** *(Init AnalyticsProvider)*  
```js
const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
```
<a name="AnalyticsPlugin.configKey"></a>

### AnalyticsPlugin.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(AnalyticsPlugin.configKey)*  
```js
const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
```
<a name="AnalyticsPlugin.defaultConfig"></a>

### AnalyticsPlugin.defaultConfig() ⇒ [<code>AnalyticsPluginConfig</code>](#AnalyticsPluginConfig)
The default configuration.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)  
**Returns**: [<code>AnalyticsPluginConfig</code>](#AnalyticsPluginConfig) - The configuration.  
**Example** *(AnalyticsPlugin.defaultConfig())*  
```js
const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
```
<a name="AnalyticsPlugin.validateConfig"></a>

### AnalyticsPlugin.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, AnalyticsPluginConfig&gt;</code> | A configuration object. |
| _context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-analytics-json-file&#x27;, AnalyticsPluginConfig&gt;</code> | A Uttori-like context (unused). |

**Example** *(AnalyticsPlugin.validateConfig(config, _context))*  
```js
AnalyticsPlugin.validateConfig({ ... });
```
<a name="AnalyticsPlugin.register"></a>

### AnalyticsPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-analytics-json-file&#x27;, AnalyticsPluginConfig&gt;</code> | A Uttori-like context. |

**Example** *(AnalyticsPlugin.register(context))*  
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

### AnalyticsPlugin.updateDocument(analytics) ⇒ <code>function</code>
Wrapper function for calling update.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)  
**Returns**: <code>function</code> - The provided document.  

| Param | Type | Description |
| --- | --- | --- |
| analytics | <code>default</code> | An AnalyticsProvider instance. |

**Example** *(AnalyticsPlugin.updateDocument(analytics))*  
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

### AnalyticsPlugin.getCount(analytics) ⇒ <code>function</code>
Wrapper function for calling update.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)  
**Returns**: <code>function</code> - The provided document.  

| Param | Type | Description |
| --- | --- | --- |
| analytics | <code>default</code> | An AnalyticsProvider instance. |

**Example** *(AnalyticsPlugin.getCount(analytics, slug))*  
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

### AnalyticsPlugin.getPopularDocuments(analytics) ⇒ <code>function</code>
Wrapper function for calling update.

**Kind**: static method of [<code>AnalyticsPlugin</code>](#AnalyticsPlugin)  
**Returns**: <code>function</code> - The provided document.  

| Param | Type | Description |
| --- | --- | --- |
| analytics | <code>default</code> | An AnalyticsProvider instance. |

**Example** *(AnalyticsPlugin.getPopularDocuments(analytics))*  
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
<a name="AnalyticsPluginPopularDocument"></a>

## AnalyticsPluginPopularDocument : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| slug | <code>string</code> | The slug of the document. |
| count | <code>number</code> | The count of the document. |

<a name="AnalyticsPluginConfig"></a>

## AnalyticsPluginConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspond to methods, and contents are events to listen for. |
| [name] | <code>string</code> | The name of the analytics file. The default is 'visits'. |
| [extension] | <code>string</code> | The extension of the analytics file. The default is 'json'. |
| directory | <code>string</code> | The path to the location you want the JSON file to be writtent to. |
| [limit] | <code>number</code> | The limit of documents to return. The default is 10. |

