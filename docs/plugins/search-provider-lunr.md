<a name="SearchLunrPlugin"></a>

## SearchLunrPlugin
Uttori Search Provider - Lunr, Uttori Plugin Adapter

**Kind**: global class\

* [SearchLunrPlugin](#SearchLunrPlugin)
    * [new SearchLunrPlugin()](#new_SearchLunrPlugin_new)
    * [.configKey](#SearchLunrPlugin.configKey) ⇒
    * [.exportIndex(documents)](#SearchLunrPlugin.exportIndex) ⇒
    * [.defaultConfig()](#SearchLunrPlugin.defaultConfig) ⇒
    * [.validateConfig(config)](#SearchLunrPlugin.validateConfig)
    * [.register(context)](#SearchLunrPlugin.register)

<a name="new_SearchLunrPlugin_new"></a>

### new SearchLunrPlugin()
**Example**\
```js
const search = Plugin.callback(viewModel, context);
```
<a name="SearchLunrPlugin.configKey"></a>

### SearchLunrPlugin.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)\
**Returns**: The configuration key.\
**Example**\
```js
const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
```
<a name="SearchLunrPlugin.exportIndex"></a>

### SearchLunrPlugin.exportIndex(documents) ⇒
Export the provider's actual indexing logic for a static browser search.

**Kind**: static method of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)\
**Returns**: A serialized Lunr index.\

| Param | Description |
| --- | --- |
| documents | Public documents. |

<a name="SearchLunrPlugin.defaultConfig"></a>

### SearchLunrPlugin.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)\
**Returns**: The configuration.\
**Example**\
```js
const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
```
<a name="SearchLunrPlugin.validateConfig"></a>

### SearchLunrPlugin.validateConfig(config)
Validates the provided configuration for required entries and types.

**Kind**: static method of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |

<a name="SearchLunrPlugin.register"></a>

### SearchLunrPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>SearchLunrPlugin</code>](#SearchLunrPlugin)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example**\
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
        getPopularSearchTerms: ['search-popular-terms'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
Plugin.register(context);
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { SearchLunrConfig } from '../types/plugins/search-provider-lunr.js';
export type { LunrLocale, SearchLunrConfig } from '../types/plugins/search-provider-lunr.js';
/**
 * Uttori Search Provider - Lunr, Uttori Plugin Adapter
 * @example
 * ```js
 * const search = Plugin.callback(viewModel, context);
 * ```
 */
declare class SearchLunrPlugin {
    /**
     * Export the provider's actual indexing logic for a static browser search.
     * @param documents Public documents.
     * @returns A serialized Lunr index.
     */
    static exportIndex(documents: import('../wiki.js').UttoriWikiDocument[]): object;
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example
     * ```js
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * ```
     */
    static get configKey(): 'uttori-plugin-search-provider-lunr';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example
     * ```js
     * const config = { ...Plugin.defaultConfig(), ...context.config[Plugin.configKey] };
     * ```
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<SearchLunrConfig, 'ignoreSlugs' | 'lunr_locales' | 'events'>;
    /**
     * Validates the provided configuration for required entries and types.
     * @param config A provided configuration to use.
     */
    static validateConfig(config: Record<string, SearchLunrConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example
     * ```js
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [Plugin.configKey]: {
     *       ...,
     *       events: {
     *         search: ['search-query'],
     *         buildIndex: ['search-add', 'search-rebuild', 'search-remove', 'search-update'],
     *         getPopularSearchTerms: ['search-popular-terms'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * Plugin.register(context);
     * ```
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-lunr', SearchLunrConfig>): Promise<void>;
}
export default SearchLunrPlugin;

export type LunrLocale = ((lunrModule: typeof import('lunr')) => void);
export interface SearchLunrConfig {
    /** A list of locales to add support for from lunr-languages. */
    lunr_locales?: string[];
    /** A list of locales to add support for from lunr-languages. */
    lunrLocaleFunctions?: LunrLocale[];
    /** A list of slugs to not consider when indexing documents. */
    ignoreSlugs?: string[];
    /** The events to listen for. */
    events?: Record<string, string[]>;
}
```

</details>
