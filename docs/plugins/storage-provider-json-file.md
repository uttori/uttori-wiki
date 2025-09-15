<a name="StorageProviderJsonFilePlugin"></a>

## StorageProviderJsonFilePlugin
Uttori Storage Provider - JSON File

**Kind**: global class  

* [StorageProviderJsonFilePlugin](#StorageProviderJsonFilePlugin)
    * [new StorageProviderJsonFilePlugin()](#new_StorageProviderJsonFilePlugin_new)
    * [.configKey](#StorageProviderJsonFilePlugin.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#StorageProviderJsonFilePlugin.defaultConfig) ⇒ <code>StorageProviderJsonFileConfig</code>
    * [.register(context)](#StorageProviderJsonFilePlugin.register)

<a name="new_StorageProviderJsonFilePlugin_new"></a>

### new StorageProviderJsonFilePlugin()
**Example** *(Plugin)*  
```js
const storage = StorageProviderJsonFile.callback(viewModel, context);
```
<a name="StorageProviderJsonFilePlugin.configKey"></a>

### StorageProviderJsonFilePlugin.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.
In this case the key is `uttori-plugin-storage-provider-json-file`.

**Kind**: static property of [<code>StorageProviderJsonFilePlugin</code>](#StorageProviderJsonFilePlugin)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(Plugin.configKey)*  
```js
const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
```
<a name="StorageProviderJsonFilePlugin.defaultConfig"></a>

### StorageProviderJsonFilePlugin.defaultConfig() ⇒ <code>StorageProviderJsonFileConfig</code>
The default configuration.

**Kind**: static method of [<code>StorageProviderJsonFilePlugin</code>](#StorageProviderJsonFilePlugin)  
**Returns**: <code>StorageProviderJsonFileConfig</code> - The configuration.  
**Example** *(Plugin.defaultConfig())*  
```js
const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
```
<a name="StorageProviderJsonFilePlugin.register"></a>

### StorageProviderJsonFilePlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>StorageProviderJsonFilePlugin</code>](#StorageProviderJsonFilePlugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-storage-provider-json-file&#x27;, StorageProviderJsonFileConfig&gt;</code> | A Uttori-like context. |

**Example** *(StorageProviderJsonFilePlugin.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [StorageProviderJsonFilePlugin.configKey]: {
      ...,
      events: {
        add: ['storage-add'],
        delete: ['storage-delete'],
        get: ['storage-get'],
        getHistory: ['storage-get-history'],
        getRevision: ['storage-get-revision'],
        getQuery: ['storage-query'],
        update: ['storage-update'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
StorageProviderJsonFilePlugin.register(context);
```
