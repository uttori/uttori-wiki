## Classes

<dl>
<dt><a href="#SearchLunrPlugin">SearchLunrPlugin</a></dt>
<dd><p>Uttori Search Provider - Lunr, Uttori Plugin Adapter</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#LunrLocale">LunrLocale</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#SearchLunrConfig">SearchLunrConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="SearchLunrPlugin"></a>

## SearchLunrPlugin
Uttori Search Provider - Lunr, Uttori Plugin Adapter

**Kind**: global class  

* [SearchLunrPlugin](#SearchLunrPlugin)
    * [new SearchLunrPlugin()](#new_SearchLunrPlugin_new)
    * [.configKey](#SearchLunrPlugin.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#SearchLunrPlugin.defaultConfig) ⇒ [<code>SearchLunrConfig</code>](#SearchLunrConfig)
    * [.validateConfig(config)](#SearchLunrPlugin.validateConfig)
    * [.register(context)](#SearchLunrPlugin.register)

<a name="new_SearchLunrPlugin_new"></a>

### new SearchLunrPlugin()
**Example**  
```js
const search = Plugin.callback(viewModel, context);
```
<a name="SearchLunrPlugin.configKey"></a>

### SearchLunrPlugin.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)  
**Returns**: <code>string</code> - The configuration key.  
**Example**  
```js
const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
```
<a name="SearchLunrPlugin.defaultConfig"></a>

### SearchLunrPlugin.defaultConfig() ⇒ [<code>SearchLunrConfig</code>](#SearchLunrConfig)
The default configuration.

**Kind**: static method of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)  
**Returns**: [<code>SearchLunrConfig</code>](#SearchLunrConfig) - The configuration.  
**Example**  
```js
const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
```
<a name="SearchLunrPlugin.validateConfig"></a>

### SearchLunrPlugin.validateConfig(config)
Validates the provided configuration for required entries and types.

**Kind**: static method of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, SearchLunrConfig&gt;</code> | A provided configuration to use. |

<a name="SearchLunrPlugin.register"></a>

### SearchLunrPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-search-provider-lunr&#x27;, SearchLunrConfig&gt;</code> | A Uttori-like context. |

**Example**  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [Plugin.configKey]: {
      ...,
      events: {
        search: ['search-query'],
        buildIndex: ['search-add', 'search-rebuild', 'search-remove', 'search-update'],
        getPopularSearchTerms: ['popular-search-terms'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
Plugin.register(context);
```
<a name="LunrLocale"></a>

## LunrLocale : <code>function</code>
**Kind**: global typedef  

| Param | Type | Description |
| --- | --- | --- |
| lunr | <code>lunr</code> | The Lunr instance. |

<a name="SearchLunrConfig"></a>

## SearchLunrConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [lunr_locales] | <code>Array.&lt;string&gt;</code> | A list of locales to add support for from lunr-languages. |
| [lunrLocaleFunctions] | [<code>Array.&lt;LunrLocale&gt;</code>](#LunrLocale) | A list of locales to add support for from lunr-languages. |
| [ignoreSlugs] | <code>Array.&lt;string&gt;</code> | A list of slugs to not consider when indexing documents. |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | The events to listen for. |

