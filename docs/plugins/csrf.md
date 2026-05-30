## Classes

<dl>
<dt><a href="#CsrfProtection">CsrfProtection</a></dt>
<dd><p>Uttori CSRF Protection</p>
<p>Implements the CSRF token pattern described at <a href="https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF">https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF</a>.
Tokens are generated with <code>crypto.randomBytes</code>, stored server-side in <code>express-session</code>, and compared using
<code>crypto.timingSafeEqual</code> to prevent timing-based oracle attacks.</p>
<p>The plugin hooks into three existing view-model filter events to inject tokens into edit and create forms,
and into the <code>validate-save</code> event to reject saves that are missing or present a mismatched token.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#CsrfProtectionConfig">CsrfProtectionConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CsrfViewModel">CsrfViewModel</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="CsrfProtection"></a>

## CsrfProtection
Uttori CSRF ProtectionImplements the CSRF token pattern described at https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF.Tokens are generated with `crypto.randomBytes`, stored server-side in `express-session`, and compared using`crypto.timingSafeEqual` to prevent timing-based oracle attacks.The plugin hooks into three existing view-model filter events to inject tokens into edit and create forms,and into the `validate-save` event to reject saves that are missing or present a mismatched token.

**Kind**: global class  

* [CsrfProtection](#CsrfProtection)
    * [new CsrfProtection()](#new_CsrfProtection_new)
    * [.configKey](#CsrfProtection.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#CsrfProtection.defaultConfig) ⇒ [<code>CsrfProtectionConfig</code>](#CsrfProtectionConfig)
    * [.resolveConfig(context)](#CsrfProtection.resolveConfig) ⇒ [<code>CsrfProtectionConfig</code>](#CsrfProtectionConfig)
    * [.validateConfig(config, _context)](#CsrfProtection.validateConfig)
    * [.register(context)](#CsrfProtection.register)
    * [.generateToken(tokenBytes)](#CsrfProtection.generateToken) ⇒ <code>string</code>
    * [.escapeHtml(value)](#CsrfProtection.escapeHtml) ⇒ <code>string</code>
    * [.getSubmittedToken(request, config)](#CsrfProtection.getSubmittedToken) ⇒ <code>string</code> \| <code>null</code>
    * [.tokensMatch(expected, actual)](#CsrfProtection.tokensMatch) ⇒ <code>boolean</code>
    * [.injectToken(viewModel, context)](#CsrfProtection.injectToken) ⇒ <code>T</code>
    * [.validateToken(request, context)](#CsrfProtection.validateToken) ⇒ <code>boolean</code>

<a name="new_CsrfProtection_new"></a>

### new CsrfProtection()
**Example** *(CsrfProtection - register in site config)*  
```js
import { CsrfProtection } from '@uttori/wiki';
const config = {
  plugins: [CsrfProtection],
  [CsrfProtection.configKey]: {
    ...CsrfProtection.defaultConfig(),
  },
};
```
<a name="CsrfProtection.configKey"></a>

### CsrfProtection.configKey ⇒ <code>string</code>
The configuration key used to look up this plugin's settings in the site config.

**Kind**: static property of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(CsrfProtection.configKey)*  
```js
const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
```
<a name="CsrfProtection.defaultConfig"></a>

### CsrfProtection.defaultConfig() ⇒ [<code>CsrfProtectionConfig</code>](#CsrfProtectionConfig)
Returns the default configuration for the plugin.All settings are optional; the defaults are safe for a typical Uttori Wiki with sessions enabled.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: [<code>CsrfProtectionConfig</code>](#CsrfProtectionConfig) - The default configuration.  
**Example** *(CsrfProtection.defaultConfig())*  
```js
const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
```
<a name="CsrfProtection.resolveConfig"></a>

### CsrfProtection.resolveConfig(context) ⇒ [<code>CsrfProtectionConfig</code>](#CsrfProtectionConfig)
Resolves the active configuration by shallow-merging site config over defaults.Nested `events` and `sources` arrays are merged with their defaults to allowpartial overrides without losing unspecified entries.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: [<code>CsrfProtectionConfig</code>](#CsrfProtectionConfig) - The resolved plugin configuration.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-csrf&#x27;, CsrfProtectionConfig&gt;</code> | The Uttori wiki context with plugin configuration. |

<a name="CsrfProtection.validateConfig"></a>

### CsrfProtection.validateConfig(config, _context)
Validates the provided configuration for required entries and correct types.Called automatically on the `validate-config` hook.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Throws**:

- <code>Error</code> When any required config value is missing or has the wrong type.


| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, CsrfProtectionConfig&gt;</code> | A configuration object. |
| _context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-csrf&#x27;, CsrfProtectionConfig&gt;</code> | Unused context object. |

**Example** *(CsrfProtection.validateConfig(config, _context))*  
```js
CsrfProtection.validateConfig({ [CsrfProtection.configKey]: { ...CsrfProtection.defaultConfig() } });
```
<a name="CsrfProtection.register"></a>

### CsrfProtection.register(context)
Registers the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Throws**:

- <code>Error</code> When the event dispatcher is missing from the context.


| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-csrf&#x27;, CsrfProtectionConfig&gt;</code> | A Uttori-like context. |

**Example** *(CsrfProtection.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [CsrfProtection.configKey]: {
      ...CsrfProtection.defaultConfig(),
    },
  },
};
CsrfProtection.register(context);
```
<a name="CsrfProtection.generateToken"></a>

### CsrfProtection.generateToken(tokenBytes) ⇒ <code>string</code>
Generates a cryptographically random CSRF token as a hexadecimal string.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: <code>string</code> - A hex-encoded token of length `tokenBytes * 2`.  

| Param | Type | Description |
| --- | --- | --- |
| tokenBytes | <code>number</code> | Number of random bytes to generate. The resulting hex string will be twice this length. |

**Example** *(CsrfProtection.generateToken(32))*  
```js
const token = CsrfProtection.generateToken(32); // 64-character hex string
```
<a name="CsrfProtection.escapeHtml"></a>

### CsrfProtection.escapeHtml(value) ⇒ <code>string</code>
Escapes a value for safe interpolation into an HTML attribute.The generated CSRF token is hex-only, but `fieldName` is configurable andshould not be trusted as safe HTML.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: <code>string</code> - The escaped HTML value.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>unknown</code> | The value to escape. |

**Example** *(CsrfProtection.escapeHtml(value))*  
```js
const safe = CsrfProtection.escapeHtml('csrf"token');
```
<a name="CsrfProtection.getSubmittedToken"></a>

### CsrfProtection.getSubmittedToken(request, config) ⇒ <code>string</code> \| <code>null</code>
Extracts the submitted CSRF token from the request according to configured sources.Body tokens must be non-empty strings. Header tokens may be a non-empty string ora string array, matching Node/Express header shapes.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: <code>string</code> \| <code>null</code> - The submitted token, or `null` when none is present.  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express request object. |
| config | [<code>CsrfProtectionConfig</code>](#CsrfProtectionConfig) | The resolved CSRF plugin configuration. |

**Example** *(CsrfProtection.getSubmittedToken(request, config))*  
```js
const submittedToken = CsrfProtection.getSubmittedToken(request, config);
```
<a name="CsrfProtection.tokensMatch"></a>

### CsrfProtection.tokensMatch(expected, actual) ⇒ <code>boolean</code>
Compares two normalized token strings using a constant-time comparison.`crypto.timingSafeEqual` requires buffers of identical byte length, so lengthis checked first and only equal-length buffers are compared.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: <code>boolean</code> - Whether both token strings match.  

| Param | Type | Description |
| --- | --- | --- |
| expected | <code>string</code> | The token stored in the session. |
| actual | <code>string</code> | The token submitted with the request. |

**Example** *(CsrfProtection.tokensMatch(expected, actual))*  
```js
const valid = CsrfProtection.tokensMatch(sessionToken, submittedToken);
```
<a name="CsrfProtection.injectToken"></a>

### CsrfProtection.injectToken(viewModel, context) ⇒ <code>T</code>
View-model filter hook. Generates or retrieves a CSRF token from the session and adds a`csrf` object to the view model so EJS templates can render a hidden input field.The session is accessed via `viewModel.session`, which `UttoriWiki.buildViewModelBase`always includes. If the session is unavailable and `requireSession` is `true` the viewmodel is returned unchanged and no `csrf` property is set.When `rotateOnValidation` is `false` (default) the same token is reused across requestsso that multiple browser tabs can coexist without invalidating each other's tokens.When `rotateOnValidation` is `true`, the token is rotated only after a successful validation,not during page render.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: <code>T</code> - The view model, now extended with a `csrf` property.  

| Param | Type | Description |
| --- | --- | --- |
| viewModel | <code>T</code> | The current view model being built for the edit, create, or restore page. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-csrf&#x27;, CsrfProtectionConfig&gt;</code> | The Uttori wiki context with plugin configuration. |

**Example** *(CsrfProtection.injectToken(viewModel, context))*  
```js
// In an EJS edit template, after registering the plugin:
// <%- csrf?.input || '' -%>
```
<a name="CsrfProtection.validateToken"></a>

### CsrfProtection.validateToken(request, context) ⇒ <code>boolean</code>
Validation hook for the `validate-save` event.Returns `true` to block the save request if any of the following conditions are met:- `requireSession` is `true` and no session exists on the request.- `checkFetchMetadata` is `true` and the `Sec-Fetch-Site` header indicates a cross-site origin.- No CSRF token is stored in the session (the edit page was never rendered with the plugin active).- No token was submitted in the request body or headers.- The submitted token does not match the session token (timing-safe comparison).Returns `false` to allow the save to proceed.When `rotateOnValidation` is `true` and a successful validation occurs, the session token is rotated.

**Kind**: static method of [<code>CsrfProtection</code>](#CsrfProtection)  
**Returns**: <code>boolean</code> - `true` to block the request, `false` to allow it.  

| Param | Type | Description |
| --- | --- | --- |
| request | <code>module:express~Request</code> | The Express request object. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-csrf&#x27;, CsrfProtectionConfig&gt;</code> | The Uttori wiki context with plugin configuration. |

**Example** *(CsrfProtection.validateToken(request, context))*  
```js
const blocked = CsrfProtection.validateToken(request, context);
```
<a name="CsrfProtectionConfig"></a>

## CsrfProtectionConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> |  | An object whose keys correspond to plugin methods, and whose values are arrays of hook event names to listen for. |
| [fieldName] | <code>string</code> | <code>&quot;&#x27;_csrf&#x27;&quot;</code> | The hidden form field name that themes should render and that is read from the POST body on save. |
| [headerName] | <code>string</code> | <code>&quot;&#x27;x-csrf-token&#x27;&quot;</code> | The HTTP request header name that JavaScript clients can use to submit the token instead of a form field. |
| [sessionKey] | <code>string</code> | <code>&quot;&#x27;uttoriCsrfToken&#x27;&quot;</code> | The key used to store the CSRF token on `request.session`. Change this if it collides with another session value. |
| [tokenBytes] | <code>number</code> | <code>32</code> | Number of random bytes to generate. Each byte becomes two hex characters, so the default produces a 64-character token. |
| [sources] | <code>Array.&lt;(&#x27;body&#x27;\|&#x27;header&#x27;)&gt;</code> | <code>[&#x27;body&#x27;,&#x27;header&#x27;]</code> | Ordered list of sources to search for the submitted token. The first source that contains a non-empty value is used. |
| [requireSession] | <code>boolean</code> | <code>true</code> | When `true`, a missing or unavailable `request.session` causes the token to be skipped on injection and the request to be blocked on validation. Set to `false` only if your setup guarantees cookies can never be forged (e.g. purely API clients with custom headers). |
| [rotateOnValidation] | <code>boolean</code> | <code>false</code> | When `true`, a fresh token is written to the session every time a valid save request completes. This limits replay-window but will break any browser tabs that still hold the old token. Leave `false` for typical wikis where multiple tabs are common. |
| [checkFetchMetadata] | <code>boolean</code> | <code>false</code> | When `true`, the `Sec-Fetch-Site` header is also checked as a defense-in-depth measure. Requests that arrive as `cross-site` are rejected even if the CSRF token matches. Has no effect on browsers that do not send Fetch Metadata headers (e.g. some older browsers), so this is supplemental, not a replacement for token checks. |

<a name="CsrfViewModel"></a>

## CsrfViewModel : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | The raw CSRF token value. Read this in JavaScript clients to set the `x-csrf-token` request header. |
| fieldName | <code>string</code> | The form field name that the token should be submitted under. |
| headerName | <code>string</code> | The HTTP header name that JavaScript clients should use. |
| input | <code>string</code> | A ready-to-render hidden `<input>` element. Use `<%- csrf?.input || '' -%>` inside the edit form in EJS templates. |

