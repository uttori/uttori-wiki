## Classes

<dl>
<dt><a href="#AuthSimple">AuthSimple</a></dt>
<dd><p>Uttori Auth (Simple)</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#AuthSimpleConfig">AuthSimpleConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="AuthSimple"></a>

## AuthSimple
Uttori Auth (Simple)

**Kind**: global class  

* [AuthSimple](#AuthSimple)
    * [new AuthSimple()](#new_AuthSimple_new)
    * [.configKey](#AuthSimple.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#AuthSimple.defaultConfig) ⇒ [<code>AuthSimpleConfig</code>](#AuthSimpleConfig)
    * [.validateConfig(config, _context)](#AuthSimple.validateConfig)
    * [.register(context)](#AuthSimple.register)
    * [.bindRoutes(server, context)](#AuthSimple.bindRoutes)
    * [.login(context)](#AuthSimple.login) ⇒ <code>module:express~RequestHandler.&lt;{}, {}, {}, {}&gt;</code>
    * [.logout(context)](#AuthSimple.logout) ⇒ <code>module:express~RequestHandler</code>

<a name="new_AuthSimple_new"></a>

### new AuthSimple()
**Example** *(AuthSimple)*  
```js
const content = AuthSimple.storeFile(request);
```
<a name="AuthSimple.configKey"></a>

### AuthSimple.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AuthSimple</code>](#AuthSimple)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(AuthSimple.configKey)*  
```js
const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
```
<a name="AuthSimple.defaultConfig"></a>

### AuthSimple.defaultConfig() ⇒ [<code>AuthSimpleConfig</code>](#AuthSimpleConfig)
The default configuration.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)  
**Returns**: [<code>AuthSimpleConfig</code>](#AuthSimpleConfig) - The configuration.  
**Example** *(AuthSimple.defaultConfig())*  
```js
const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
```
<a name="AuthSimple.validateConfig"></a>

### AuthSimple.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, AuthSimpleConfig&gt;</code> | A configuration object. |
| _context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-auth-simple&#x27;, AuthSimpleConfig&gt;</code> | Unused. |

**Example** *(AuthSimple.validateConfig(config, _context))*  
```js
AuthSimple.validateConfig({ ... });
```
<a name="AuthSimple.register"></a>

### AuthSimple.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-auth-simple&#x27;, AuthSimpleConfig&gt;</code> | A Uttori-like context. |

**Example** *(AuthSimple.register(context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [AuthSimple.configKey]: {
      ...,
      events: {
        bindRoutes: ['bind-routes'],
      },
    },
  },
};
AuthSimple.register(context);
```
<a name="AuthSimple.bindRoutes"></a>

### AuthSimple.bindRoutes(server, context)
Add the login & logout routes to the server object.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | An Express server instance. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-auth-simple&#x27;, AuthSimpleConfig&gt;</code> | A Uttori-like context. |

**Example** *(AuthSimple.bindRoutes(server, context))*  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [AuthSimple.configKey]: {
      loginPath: '/login',
      logoutPath: '/logout',
      loginMiddleware: [ ... ],
      logoutMiddleware: [ ... ],
    },
  },
};
AuthSimple.bindRoutes(server, context);
```
<a name="AuthSimple.login"></a>

### AuthSimple.login(context) ⇒ <code>module:express~RequestHandler.&lt;{}, {}, {}, {}&gt;</code>
The Express route method to process the login request and provide a response or redirect.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)  
**Returns**: <code>module:express~RequestHandler.&lt;{}, {}, {}, {}&gt;</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-auth-simple&#x27;, AuthSimpleConfig&gt;</code> | A Uttori-like context. |

**Example** *(AuthSimple.login(context)(request, response, next))*  
```js
server.post('/login', AuthSimple.login(context));
```
<a name="AuthSimple.logout"></a>

### AuthSimple.logout(context) ⇒ <code>module:express~RequestHandler</code>
The Express route method to process the logout request and clear the session.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)  
**Returns**: <code>module:express~RequestHandler</code> - The function to pass to Express.  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-auth-simple&#x27;, AuthSimpleConfig&gt;</code> | A Uttori-like context. |

**Example** *(AuthSimple.login(context)(request, response, _next))*  
```js
server.post('/logout', AuthSimple.login(context));
```
<a name="AuthSimpleConfig"></a>

## AuthSimpleConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | An object whose keys correspond to methods, and contents are events to listen for. |
| [loginPath] | <code>string</code> | The path to the login endpoint. |
| [logoutPath] | <code>string</code> | The path to the logout endpoint. |
| [loginRedirectPath] | <code>string</code> | The path to redirect to after logging in. |
| [logoutRedirectPath] | <code>string</code> | The path to redirect to after logging out. |
| [loginMiddleware] | <code>Array.&lt;module:express~RequestHandler&gt;</code> | The middleware to use on the login route. |
| [logoutMiddleware] | <code>Array.&lt;module:express~RequestHandler&gt;</code> | The middleware to use on the logout route. |
| validateLogin | <code>function</code> | Validation function that will recieve the request body that returns an object to be used as the session payload. If the session is invalid it should return null. |

