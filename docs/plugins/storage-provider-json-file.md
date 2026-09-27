<a name="StorageProviderJsonFilePlugin"></a>

## StorageProviderJsonFilePlugin
Uttori Storage Provider - JSON File

**Kind**: global class\

* [StorageProviderJsonFilePlugin](#StorageProviderJsonFilePlugin)
    * [new StorageProviderJsonFilePlugin()](#new_StorageProviderJsonFilePlugin_new)
    * [.configKey](#StorageProviderJsonFilePlugin.configKey) ⇒
    * [.defaultConfig()](#StorageProviderJsonFilePlugin.defaultConfig) ⇒
    * [.register(context)](#StorageProviderJsonFilePlugin.register)

<a name="new_StorageProviderJsonFilePlugin_new"></a>

### new StorageProviderJsonFilePlugin()
**Example** *(Plugin)*\
```js
const storage = StorageProviderJsonFile.callback(viewModel, context);
```
<a name="StorageProviderJsonFilePlugin.configKey"></a>

### StorageProviderJsonFilePlugin.configKey ⇒
The configuration key for plugin to look for in the provided configuration.
In this case the key is `uttori-plugin-storage-provider-json-file`.

**Kind**: static property of [<code>StorageProviderJsonFilePlugin</code>](#StorageProviderJsonFilePlugin)\
**Returns**: The configuration key.\
**Example** *(Plugin.configKey)*\
```js
const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
```
<a name="StorageProviderJsonFilePlugin.defaultConfig"></a>

### StorageProviderJsonFilePlugin.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>StorageProviderJsonFilePlugin</code>](#StorageProviderJsonFilePlugin)\
**Returns**: The configuration.\
**Example** *(Plugin.defaultConfig())*\
```js
const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
```
<a name="StorageProviderJsonFilePlugin.register"></a>

### StorageProviderJsonFilePlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>StorageProviderJsonFilePlugin</code>](#StorageProviderJsonFilePlugin)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(StorageProviderJsonFilePlugin.register(context))*\
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

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * Uttori Storage Provider - JSON File
 * @example <caption>Plugin</caption>
 * const storage = StorageProviderJsonFile.callback(viewModel, context);
 */
declare class StorageProviderJsonFilePlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * In this case the key is `uttori-plugin-storage-provider-json-file`.
     *
     * @returns The configuration key.
     * @example <caption>Plugin.configKey</caption>
     * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
     */
    static get configKey(): 'uttori-plugin-storage-provider-json-file';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>Plugin.defaultConfig()</caption>
     * const config = { ...StorageProviderJsonFilePlugin.defaultConfig(), ...context.config[StorageProviderJsonFilePlugin.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig, 'contentDirectory' | 'historyDirectory' | 'extension' | 'updateTimestamps' | 'useHistory' | 'useCache' | 'events'>;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>StorageProviderJsonFilePlugin.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [StorageProviderJsonFilePlugin.configKey]: {
     *       ...,
     *       events: {
     *         add: ['storage-add'],
     *         delete: ['storage-delete'],
     *         get: ['storage-get'],
     *         getHistory: ['storage-get-history'],
     *         getRevision: ['storage-get-revision'],
     *         getQuery: ['storage-query'],
     *         update: ['storage-update'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * StorageProviderJsonFilePlugin.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-storage-provider-json-file', import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig>): void;
}
export default StorageProviderJsonFilePlugin;
```

</details>
