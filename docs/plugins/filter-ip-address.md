## Classes

<dl>
<dt><a href="#FilterIPAddress">FilterIPAddress</a></dt>
<dd><p>Uttori IP Address Filter</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#__dirname">__dirname</a> : <code>string</code></dt>
<dd><p>The directory name of the current file.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#FilterIPAddressConfig">FilterIPAddressConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="FilterIPAddress"></a>

## FilterIPAddress
Uttori IP Address Filter

**Kind**: global class  

* [FilterIPAddress](#FilterIPAddress)
    * [new FilterIPAddress()](#new_FilterIPAddress_new)
    * [.configKey](#FilterIPAddress.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#FilterIPAddress.defaultConfig) ⇒ [<code>FilterIPAddressConfig</code>](#FilterIPAddressConfig)
    * [.validateConfig(config, _context)](#FilterIPAddress.validateConfig)
    * [.register(context)](#FilterIPAddress.register)
    * [.getClientIP(config, request)](#FilterIPAddress.getClientIP) ⇒ <code>string</code>
    * [.logIPActivity(config, ip, request)](#FilterIPAddress.logIPActivity)
    * [.validateIP(request, context)](#FilterIPAddress.validateIP) ⇒ <code>boolean</code>

<a name="new_FilterIPAddress_new"></a>

### new FilterIPAddress()
**Example** *(FilterIPAddress)*  
```js
const valid = await FilterIPAddress.validateIP(request, context);
```
<a name="FilterIPAddress.configKey"></a>

### FilterIPAddress.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>FilterIPAddress</code>](#FilterIPAddress)  
**Returns**: <code>string</code> - The configuration key.  
<a name="FilterIPAddress.defaultConfig"></a>

### FilterIPAddress.defaultConfig() ⇒ [<code>FilterIPAddressConfig</code>](#FilterIPAddressConfig)
The default configuration.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)  
**Returns**: [<code>FilterIPAddressConfig</code>](#FilterIPAddressConfig) - The configuration.  
<a name="FilterIPAddress.validateConfig"></a>

### FilterIPAddress.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, FilterIPAddressConfig&gt;</code> | A configuration object. |
| _context | <code>object</code> | Unused context object. |

<a name="FilterIPAddress.register"></a>

### FilterIPAddress.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-filter-ip-address&#x27;, FilterIPAddressConfig&gt;</code> | A Uttori-like context. |

**Example** *(FilterIPAddress.register(context))*  
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

### FilterIPAddress.getClientIP(config, request) ⇒ <code>string</code>
Gets the real IP address from the request, considering proxy headers if configured.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)  
**Returns**: <code>string</code> - The client's IP address.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>FilterIPAddressConfig</code>](#FilterIPAddressConfig) | The configuration object. |
| request | <code>module:express~Request</code> | The Express request object. |

<a name="FilterIPAddress.logIPActivity"></a>

### FilterIPAddress.logIPActivity(config, ip, request)
Logs the IP address and content to a file.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>FilterIPAddressConfig</code>](#FilterIPAddressConfig) | The configuration object. |
| ip | <code>string</code> | The IP address to log. |
| request | <code>module:express~Request</code> | The content being submitted. |

<a name="FilterIPAddress.validateIP"></a>

### FilterIPAddress.validateIP(request, context) ⇒ <code>boolean</code>
Validates the request IP against the blocklist and logs the activity.

**Kind**: static method of [<code>FilterIPAddress</code>](#FilterIPAddress)  
**Returns**: <code>boolean</code> - Returns `true` if the IP is blocklisted (invalid), `false` otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express request object. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-filter-ip-address&#x27;, FilterIPAddressConfig&gt;</code> | Unused context object. |

<a name="__dirname"></a>

## \_\_dirname : <code>string</code>
The directory name of the current file.

**Kind**: global constant  
<a name="FilterIPAddressConfig"></a>

## FilterIPAddressConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> |  | Events to bind to. |
| [logPath] | <code>string</code> | <code>&quot;&#x27;./logs&#x27;&quot;</code> | Directory where IP logs will be stored. |
| [blocklist] | <code>Array.&lt;string&gt;</code> | <code>[]</code> | List of IP addresses to block. |
| [trustProxy] | <code>boolean</code> | <code>false</code> | Whether to trust the X-Forwarded-For header. |

