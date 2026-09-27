## Classes

<dl>
<dt><a href="#FilterIPAddress">FilterIPAddress</a></dt>
<dd><p>Uttori IP Address Filter</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#__dirname">__dirname</a></dt>
<dd><p>The directory name of the current file.</p>
</dd>
</dl>

<a name="FilterIPAddress"></a>

## FilterIPAddress
Uttori IP Address Filter

**Kind**: global class\

* [FilterIPAddress](#FilterIPAddress)
    * [new FilterIPAddress()](#new_FilterIPAddress_new)
    * [.configKey](#FilterIPAddress.configKey) ⇒
    * [.defaultConfig()](#FilterIPAddress.defaultConfig) ⇒
    * [.validateConfig(config, _context)](#FilterIPAddress.validateConfig)
    * [.register(context)](#FilterIPAddress.register)
    * [.getClientIP(config, request)](#FilterIPAddress.getClientIP) ⇒
    * [.logIPActivity(config, ip, request)](#FilterIPAddress.logIPActivity)
    * [.validateIP(request, context)](#FilterIPAddress.validateIP) ⇒

<a name="new_FilterIPAddress_new"></a>

### new FilterIPAddress()
**Example** *(FilterIPAddress)*\
```js
const valid = await FilterIPAddress.validateIP(request, context);
```
<a name="FilterIPAddress.configKey"></a>

### FilterIPAddress.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>FilterIPAddress</code>](#FilterIPAddress)\
**Returns**: The configuration key.\
<a name="FilterIPAddress.defaultConfig"></a>

### FilterIPAddress.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)\
**Returns**: The configuration.\
<a name="FilterIPAddress.validateConfig"></a>

### FilterIPAddress.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)\

| Param | Description |
| --- | --- |
| config | A configuration object. |
| _context | Unused context object. |

<a name="FilterIPAddress.register"></a>

### FilterIPAddress.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(FilterIPAddress.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [FilterIPAddress.configKey]: {
      ...,
      events: {
        'validate-save': ['validateIP'],
      },
    },
  },
};
FilterIPAddress.register(context);
```
<a name="FilterIPAddress.getClientIP"></a>

### FilterIPAddress.getClientIP(config, request) ⇒
Gets the real IP address from the request, considering proxy headers if configured.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)\
**Returns**: The client's IP address.\

| Param | Description |
| --- | --- |
| config | The configuration object. |
| request | The Express request object. |

<a name="FilterIPAddress.logIPActivity"></a>

### FilterIPAddress.logIPActivity(config, ip, request)
Logs the IP address and content to a file.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)\

| Param | Description |
| --- | --- |
| config | The configuration object. |
| ip | The IP address to log. |
| request | The content being submitted. |

<a name="FilterIPAddress.validateIP"></a>

### FilterIPAddress.validateIP(request, context) ⇒
Validates the request IP against the blocklist and logs the activity.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)\
**Returns**: Returns `true` if the IP is blocklisted (invalid), `false` otherwise.\

| Param | Description |
| --- | --- |
| request | The Express request object. |
| context | Unused context object. |

<a name="__dirname"></a>

## \_\_dirname
The directory name of the current file.

**Kind**: global constant\

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { FilterIPAddressConfig } from '../types/plugins/filter-ip-address.js';
export type { FilterIPAddressConfig } from '../types/plugins/filter-ip-address.js';
/**
 * Uttori IP Address Filter
 * @example <caption>FilterIPAddress</caption>
 * const valid = await FilterIPAddress.validateIP(request, context);
 */
declare class FilterIPAddress {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     */
    static get configKey(): 'uttori-plugin-filter-ip-address';
    /**
     * The default configuration.
     * @returns The configuration.
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<FilterIPAddressConfig, 'events' | 'logPath' | 'blocklist' | 'trustProxy'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context Unused context object.
     */
    static validateConfig(config: Record<string, FilterIPAddressConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>FilterIPAddress.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [FilterIPAddress.configKey]: {
     *       ...,
     *       events: {
     *         'validate-save': ['validateIP'],
     *       },
     *     },
     *   },
     * };
     * FilterIPAddress.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-ip-address', FilterIPAddressConfig>): void;
    /**
     * Gets the real IP address from the request, considering proxy headers if configured.
     * @param config The configuration object.
     * @param request The Express request object.
     * @returns The client's IP address.
     */
    static getClientIP(config: FilterIPAddressConfig, request: import('express').Request): string;
    /**
     * Logs the IP address and content to a file.
     * @param config The configuration object.
     * @param ip The IP address to log.
     * @param request The content being submitted.
     */
    static logIPActivity(config: FilterIPAddressConfig, ip: string, request: import('express').Request): void;
    /**
     * Validates the request IP against the blocklist and logs the activity.
     * @param request The Express request object.
     * @param context Unused context object.
     * @returns Returns `true` if the IP is blocklisted (invalid), `false` otherwise.
     */
    static validateIP(request: import('express').Request, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-filter-ip-address', FilterIPAddressConfig>): boolean;
}
export default FilterIPAddress;

export interface FilterIPAddressConfig {
    /** Events to bind to. */
    events?: Record<string, string[]>;
    /** Directory where IP logs will be stored. */
    logPath?: string;
    /** List of IP addresses to block. */
    blocklist?: string[];
    /** Whether to trust the X-Forwarded-For header. */
    trustProxy?: boolean;
}
```

</details>
