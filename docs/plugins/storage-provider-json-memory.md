<a name="StorageProviderJsonMemoryPlugin"></a>

## StorageProviderJsonMemoryPlugin
Uttori Storage Provider - JSON Memory

**Kind**: global class\

* [StorageProviderJsonMemoryPlugin](#StorageProviderJsonMemoryPlugin)
    * [new StorageProviderJsonMemoryPlugin()](#new_StorageProviderJsonMemoryPlugin_new)
    * [.configKey](#StorageProviderJsonMemoryPlugin.configKey) ⇒
    * [.defaultConfig()](#StorageProviderJsonMemoryPlugin.defaultConfig) ⇒
    * [.register(context)](#StorageProviderJsonMemoryPlugin.register)

<a name="new_StorageProviderJsonMemoryPlugin_new"></a>

### new StorageProviderJsonMemoryPlugin()
**Example** *(StorageProviderJsonMemoryPlugin)*\
```js
const storage = StorageProviderJsonMemoryPlugin.callback(viewModel, context);
```
<a name="StorageProviderJsonMemoryPlugin.configKey"></a>

### StorageProviderJsonMemoryPlugin.configKey ⇒
The configuration key for plugin to look for in the provided configuration.
In this case the key is `uttori-plugin-storage-provider-json-memory`.

**Kind**: static property of [<code>StorageProviderJsonMemoryPlugin</code>](#StorageProviderJsonMemoryPlugin)\
**Returns**: The configuration key.\
**Example** *(StorageProviderJsonMemoryPlugin.configKey)*\
```js
const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
```
<a name="StorageProviderJsonMemoryPlugin.defaultConfig"></a>

### StorageProviderJsonMemoryPlugin.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>StorageProviderJsonMemoryPlugin</code>](#StorageProviderJsonMemoryPlugin)\
**Returns**: The configuration.\
**Example** *(Plugin.defaultConfig())*\
```js
const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
```
<a name="StorageProviderJsonMemoryPlugin.register"></a>

### StorageProviderJsonMemoryPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>StorageProviderJsonMemoryPlugin</code>](#StorageProviderJsonMemoryPlugin)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(StorageProviderJsonMemoryPlugin.register(context))*\
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

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * Uttori Storage Provider - JSON Memory
 * @example <caption>StorageProviderJsonMemoryPlugin</caption>
 * const storage = StorageProviderJsonMemoryPlugin.callback(viewModel, context);
 */
declare class StorageProviderJsonMemoryPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * In this case the key is `uttori-plugin-storage-provider-json-memory`.
     *
     * @returns The configuration key.
     * @example <caption>StorageProviderJsonMemoryPlugin.configKey</caption>
     * const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
     */
    static get configKey(): 'uttori-plugin-storage-provider-json-memory';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>Plugin.defaultConfig()</caption>
     * const config = { ...StorageProviderJsonMemoryPlugin.defaultConfig(), ...context.config[StorageProviderJsonMemoryPlugin.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<import('./storeage-provider-json/storage-provider-memory.js').StorageProviderConfig, 'events'>;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>StorageProviderJsonMemoryPlugin.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [StorageProviderJsonMemoryPlugin.configKey]: {
     *       ...,
     *       events: {
     *         add: ['storage-add'],
     *         delete: ['storage-delete'],
     *         get: ['storage-get'],
     *         getHistory: ['storage-get-history'],
     *         getRevision: ['storage-get-revision'],
     *         getQuery: ['storage-query'],
     *         update: ['storage-update'],
     *       },
     *     },
     *   },
     * };
     * StorageProviderJsonMemoryPlugin.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-storage-provider-json-memory', import('../plugins/storeage-provider-json/storage-provider-memory.js').StorageProviderConfig>): void;
}
export default StorageProviderJsonMemoryPlugin;
```

</details>
