## Classes

<dl>
<dt><a href="#TagRoutesPlugin">TagRoutesPlugin</a></dt>
<dd><p>Tag routes plugin for Uttori Wiki.
Provides tag index and individual tag pages functionality.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#TagRoutesPluginConfig">TagRoutesPluginConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="TagRoutesPlugin"></a>

## TagRoutesPlugin
Tag routes plugin for Uttori Wiki.
Provides tag index and individual tag pages functionality.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | [<code>TagRoutesPluginConfig</code>](#TagRoutesPluginConfig) | The configuration object. |


* [TagRoutesPlugin](#TagRoutesPlugin)
    * [new TagRoutesPlugin()](#new_TagRoutesPlugin_new)
    * [.configKey](#TagRoutesPlugin.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#TagRoutesPlugin.defaultConfig) ⇒ [<code>TagRoutesPluginConfig</code>](#TagRoutesPluginConfig)
    * [.extendConfig(config)](#TagRoutesPlugin.extendConfig) ⇒ [<code>TagRoutesPluginConfig</code>](#TagRoutesPluginConfig)
    * [.validateConfig(config, _context)](#TagRoutesPlugin.validateConfig)
    * [.register(context)](#TagRoutesPlugin.register)
    * [.bindRoutes(server, context)](#TagRoutesPlugin.bindRoutes)
    * [.getTaggedDocuments(context, tag)](#TagRoutesPlugin.getTaggedDocuments) ⇒ <code>Promise.&lt;Array.&lt;UttoriWikiDocument&gt;&gt;</code>
    * [.tagIndexRequestHandler(context)](#TagRoutesPlugin.tagIndexRequestHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.tagRequestHandler(context)](#TagRoutesPlugin.tagRequestHandler) ⇒ <code>module:express~RequestHandler</code>

<a name="new_TagRoutesPlugin_new"></a>

### new TagRoutesPlugin()
**Example** *(Init TagRoutesPlugin)*  
```js
const tagPlugin = new TagRoutesPlugin();
```
<a name="TagRoutesPlugin.configKey"></a>

### TagRoutesPlugin.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(TagRoutesPlugin.configKey)*  
```js
const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
```
<a name="TagRoutesPlugin.defaultConfig"></a>

### TagRoutesPlugin.defaultConfig() ⇒ [<code>TagRoutesPluginConfig</code>](#TagRoutesPluginConfig)
The default configuration.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  
**Returns**: [<code>TagRoutesPluginConfig</code>](#TagRoutesPluginConfig) - The configuration.  
**Example** *(TagRoutesPlugin.defaultConfig())*  
```js
const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
```
<a name="TagRoutesPlugin.extendConfig"></a>

### TagRoutesPlugin.extendConfig(config) ⇒ [<code>TagRoutesPluginConfig</code>](#TagRoutesPluginConfig)
Create a config that is extended from the default config.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  
**Returns**: [<code>TagRoutesPluginConfig</code>](#TagRoutesPluginConfig) - The new configration.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>TagRoutesPluginConfig</code>](#TagRoutesPluginConfig) | The user provided configuration. |

<a name="TagRoutesPlugin.validateConfig"></a>

### TagRoutesPlugin.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, TagRoutesPluginConfig&gt;</code> | A configuration object. |
| _context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-tag-routes&#x27;, TagRoutesPluginConfig&gt;</code> | A Uttori-like context (unused). |

**Example** *(TagRoutesPlugin.validateConfig(config, _context))*  
```js
TagRoutesPlugin.validateConfig({ ... });
```
<a name="TagRoutesPlugin.register"></a>

### TagRoutesPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-tag-routes&#x27;, TagRoutesPluginConfig&gt;</code> | A Uttori-like context. |

**Example** *(TagRoutesPlugin.register(context))*  
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

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | An Express server instance. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-tag-routes&#x27;, TagRoutesPluginConfig&gt;</code> | A Uttori-like context. |

**Example** *(TagRoutesPlugin.bindRoutes(plugin))*  
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
<a name="TagRoutesPlugin.getTaggedDocuments"></a>

### TagRoutesPlugin.getTaggedDocuments(context, tag) ⇒ <code>Promise.&lt;Array.&lt;UttoriWikiDocument&gt;&gt;</code>
Returns the documents with the provided tag, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignoreSlugs` array.

Hooks:
- `fetch` - `storage-query` - Searched for the tagged documents.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  
**Returns**: <code>Promise.&lt;Array.&lt;UttoriWikiDocument&gt;&gt;</code> - Promise object that resolves to the array of the documents.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-tag-routes&#x27;, TagRoutesPluginConfig&gt;</code> | A Uttori-like context. |
| tag | <code>string</code> | The tag to look for in documents. |

**Example**  
```js
plugin.getTaggedDocuments('example', 10);
➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
```
<a name="TagRoutesPlugin.tagIndexRequestHandler"></a>

### TagRoutesPlugin.tagIndexRequestHandler(context) ⇒ <code>module:express~RequestHandler</code>
Renders the tag index page with the `tags` template.

Hooks:
- `filter` - `view-model-tag-index` - Passes in the viewModel.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-tag-routes&#x27;, TagRoutesPluginConfig&gt;</code> | A Uttori-like context. |

<a name="TagRoutesPlugin.tagRequestHandler"></a>

### TagRoutesPlugin.tagRequestHandler(context) ⇒ <code>module:express~RequestHandler</code>
Renders the tag detail page with `tag` template.
Sets the `X-Robots-Tag` header to `noindex`.
Attempts to pull in the relevant site section for the tag if defined in the config site sections.

Hooks:
- `filter` - `view-model-tag` - Passes in the viewModel.

**Kind**: static method of [<code>TagRoutesPlugin</code>](#TagRoutesPlugin)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-tag-routes&#x27;, TagRoutesPluginConfig&gt;</code> | A Uttori-like context. |

<a name="TagRoutesPluginConfig"></a>

## TagRoutesPluginConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspond to methods, and contents are events to listen for. |
| [title] | <code>string</code> | The default title for tag pages. |
| [limit] | <code>number</code> | The maximum number of documents to return for a tag. |
| [middleware] | <code>Record.&lt;string, Array.&lt;module:express~RequestHandler&gt;&gt;</code> | Middleware for tag routes. |
| [tagIndexRoute] | <code>string</code> | A replacement route for the tag index route. |
| [tagRoute] | <code>string</code> | A replacement route for the tag show route. |
| [apiRoute] | <code>string</code> | A replacement route for the tag index route. |
| [tagIndexRequestHandler] | <code>function</code> | A replacement route handler for the tag index route. |
| [tagRequestHandler] | <code>function</code> | A replacement route handler for the tag show route. |
| [apiRequestHandler] | <code>function</code> | A request handler for the API route. |

