<a name="AddQueryOutputToViewModel"></a>

## AddQueryOutputToViewModel
Add queries output to the view model.

**Kind**: global class\

* [AddQueryOutputToViewModel](#AddQueryOutputToViewModel)
    * [new AddQueryOutputToViewModel()](#new_AddQueryOutputToViewModel_new)
    * [.configKey](#AddQueryOutputToViewModel.configKey) ⇒
    * [.defaultConfig()](#AddQueryOutputToViewModel.defaultConfig) ⇒
    * [.validateConfig(config, _context)](#AddQueryOutputToViewModel.validateConfig)
    * [.register(context)](#AddQueryOutputToViewModel.register)
    * [.callbackCurry(eventLabel, viewModel, context)](#AddQueryOutputToViewModel.callbackCurry) ⇒
    * [.callback(eventLabel)](#AddQueryOutputToViewModel.callback) ⇒

<a name="new_AddQueryOutputToViewModel_new"></a>

### new AddQueryOutputToViewModel()
**Example** *(AddQueryOutputToViewModel)*\
```js
const viewModel = AddQueryOutputToViewModel.callback(viewModel, context);
```
<a name="AddQueryOutputToViewModel.configKey"></a>

### AddQueryOutputToViewModel.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)\
**Returns**: The configuration key.\
**Example** *(AddQueryOutputToViewModel.configKey)*\
```js
const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
```
<a name="AddQueryOutputToViewModel.defaultConfig"></a>

### AddQueryOutputToViewModel.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)\
**Returns**: The configuration.\
**Example** *(AddQueryOutputToViewModel.defaultConfig())*\
```js
const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
```
<a name="AddQueryOutputToViewModel.validateConfig"></a>

### AddQueryOutputToViewModel.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)\

| Param | Description |
| --- | --- |
| config | A configuration object. |
| _context | A Uttori-like context (unused). |

**Example** *(AddQueryOutputToViewModel.validateConfig(config, _context))*\
```js
AddQueryOutputToViewModel.validateConfig({ ... });
```
<a name="AddQueryOutputToViewModel.register"></a>

### AddQueryOutputToViewModel.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(AddQueryOutputToViewModel.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [AddQueryOutputToViewModel.configKey]: {
      ...,
      events: {
        callback: ['document-save', 'document-delete'],
        validateConfig: ['validate-config'],
      },
      queries: [...],
    },
  },
};
AddQueryOutputToViewModel.register(context);
```
<a name="AddQueryOutputToViewModel.callbackCurry"></a>

### AddQueryOutputToViewModel.callbackCurry(eventLabel, viewModel, context) ⇒
Queries for related documents based on similar tags and searches the storage provider.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)\
**Returns**: The provided view-model document.\

| Param | Description |
| --- | --- |
| eventLabel | The event label to run queries for. |
| viewModel | A Uttori view-model object. |
| context | A Uttori-like context. |

**Example** *(AddQueryOutputToViewModel.callback(viewModel, context))*\
```js
const context = {
  config: {
    [AddQueryOutputToViewModel.configKey]: {
      queries: [...],
    },
  },
  hooks: {
    on: (event) => { ... },
    fetch: (event, query) => { ... },
  },
};
AddQueryOutputToViewModel.callback(viewModel, context);
```
<a name="AddQueryOutputToViewModel.callback"></a>

### AddQueryOutputToViewModel.callback(eventLabel) ⇒
Curry the hook function to take the current event label.

**Kind**: static method of [<code>AddQueryOutputToViewModel</code>](#AddQueryOutputToViewModel)\
**Returns**: The provided view-model document.\

| Param | Description |
| --- | --- |
| eventLabel | The event label to run queries for. |

**Example** *(AddQueryOutputToViewModel.callback(eventLabel))*\
```js
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { AddQueryOutputToViewModelConfig } from '../types/plugins/query-output.js';
export type { AddQueryOutputToViewModelQuery, AddQueryOutputToViewModelConfig, AddQueryOutputToViewModelContext, } from '../types/plugins/query-output.js';
/**
 * Add queries output to the view model.
 * @example <caption>AddQueryOutputToViewModel</caption>
 * const viewModel = AddQueryOutputToViewModel.callback(viewModel, context);
 */
declare class AddQueryOutputToViewModel {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>AddQueryOutputToViewModel.configKey</caption>
     * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
     */
    static get configKey(): 'uttori-plugin-add-query-output-to-view-model';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>AddQueryOutputToViewModel.defaultConfig()</caption>
     * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<AddQueryOutputToViewModelConfig, 'queries' | 'events'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context A Uttori-like context (unused).
     * @example <caption>AddQueryOutputToViewModel.validateConfig(config, _context)</caption>
     * AddQueryOutputToViewModel.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, AddQueryOutputToViewModelConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>AddQueryOutputToViewModel.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [AddQueryOutputToViewModel.configKey]: {
     *       ...,
     *       events: {
     *         callback: ['document-save', 'document-delete'],
     *         validateConfig: ['validate-config'],
     *       },
     *       queries: [...],
     *     },
     *   },
     * };
     * AddQueryOutputToViewModel.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>): void;
    /**
     * Queries for related documents based on similar tags and searches the storage provider.
     * @param eventLabel The event label to run queries for.
     * @param viewModel A Uttori view-model object.
     * @param context A Uttori-like context.
     * @returns The provided view-model document.
     * @example <caption>AddQueryOutputToViewModel.callback(viewModel, context)</caption>
     * const context = {
     *   config: {
     *     [AddQueryOutputToViewModel.configKey]: {
     *       queries: [...],
     *     },
     *   },
     *   hooks: {
     *     on: (event) => { ... },
     *     fetch: (event, query) => { ... },
     *   },
     * };
     * AddQueryOutputToViewModel.callback(viewModel, context);
     */
    static callbackCurry<T extends Record<string, unknown>>(eventLabel: string, viewModel: T, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>): Promise<T>;
    /**
     * Curry the hook function to take the current event label.
     * @param eventLabel The event label to run queries for.
     * @returns The provided view-model document.
     * @example <caption>AddQueryOutputToViewModel.callback(eventLabel)</caption>
     */
    static callback(eventLabel: string): import('../custom.js').AddQueryOutputToViewModelCallback;
}
export default AddQueryOutputToViewModel;

export interface AddQueryOutputToViewModelQuery {
    /** The query to be run. */
    query?: string;
    /** The key to add the query output to. */
    key: string;
    /** The fallback value to use if the query fails. */
    fallback: import('../../wiki.js').UttoriWikiDocument[];
    /** An optional function to format the query output. */
    format?: import('../../custom.js').AddQueryOutputToViewModelFormatFunction;
    /** An optional custom function to execut the query. */
    queryFunction?: import('../../custom.js').AddQueryOutputToViewModelQueryFunction;
}
export interface AddQueryOutputToViewModelConfig {
    /**
     * The array of quieries to be run and returned that will be added to the passed in object and returned with the querie output added.
     */
    queries: Record<string, AddQueryOutputToViewModelQuery[]>;
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
}
/** Uttori context narrowed to this plugin's config shape. */
export type AddQueryOutputToViewModelContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>;
```

</details>
