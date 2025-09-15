<a name="StorageProviderJsonMemoryPlugin"></a>

## StorageProviderJsonMemoryPlugin
Uttori Storage Provider - JSON Memory

**Kind**: global class  

* [StorageProviderJsonMemoryPlugin](#StorageProviderJsonMemoryPlugin)
    * [new StorageProviderJsonMemoryPlugin()](#new_StorageProviderJsonMemoryPlugin_new)
    * [.configKey](#StorageProviderJsonMemoryPlugin.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#StorageProviderJsonMemoryPlugin.defaultConfig) ⇒ <code>StorageProviderConfig</code>
    * [.register(context)](#StorageProviderJsonMemoryPlugin.register)

<a name="new_StorageProviderJsonMemoryPlugin_new"></a>

### new StorageProviderJsonMemoryPlugin()
**Example** *(StorageProviderJsonMemoryPlugin)*  
```js
const storage = StorageProviderJsonMemoryPlugin.callback(viewModel, context);
```
<a name="StorageProviderJsonMemoryPlugin.configKey"></a>

### StorageProviderJsonMemoryPlugin.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.
In this case the key is `uttori-plugin-storage-provider-json-memory`.

**Kind**: static property of [<code>StorageProviderJsonMemoryPlugin</code>](#StorageProviderJsonMemoryPlugin)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(StorageProviderJsonMemoryPlugin.configKey)*  
```js
const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
```
<a name="StorageProviderJsonMemoryPlugin.defaultConfig"></a>

### StorageProviderJsonMemoryPlugin.defaultConfig() ⇒ <code>StorageProviderConfig</code>
The default configuration.

**Kind**: static method of [<code>StorageProviderJsonMemoryPlugin</code>](#StorageProviderJsonMemoryPlugin)  
**Returns**: <code>StorageProviderConfig</code> - The configuration.  
**Example** *(Plugin.defaultConfig())*  
```js
const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
```
<a name="StorageProviderJsonMemoryPlugin.register"></a>

### StorageProviderJsonMemoryPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>StorageProviderJsonMemoryPlugin</code>](#StorageProviderJsonMemoryPlugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-storage-provider-json-memory&#x27;, StorageProviderConfig&gt;</code> | A Uttori-like context. |

**Example** *(StorageProviderJsonMemoryPlugin.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [StorageProviderJsonMemoryPlugin.configKey]: {
      ...,
      events: {
        add: ['storage-add'],
        delete: ['storage-delete'],
        get: ['storage-get'],
        getHistory: ['storage-get-history'],
        getRevision: ['storage-get-revision'],
        getQuery: ['storage-query'],
        update: ['storage-update'],
      },
    },
  },
};
StorageProviderJsonMemoryPlugin.register(context);
```
