<a name="AuthSimple"></a>

## AuthSimple
Uttori Auth (Simple)

**Kind**: global class\

* [AuthSimple](#AuthSimple)
    * [new AuthSimple()](#new_AuthSimple_new)
    * [.configKey](#AuthSimple.configKey) ⇒
    * [.defaultConfig()](#AuthSimple.defaultConfig) ⇒
    * [.validateConfig(config, _context)](#AuthSimple.validateConfig)
    * [.register(context)](#AuthSimple.register)
    * [.bindRoutes(server, context)](#AuthSimple.bindRoutes)
    * [.login(context)](#AuthSimple.login) ⇒
    * [.logout(context)](#AuthSimple.logout) ⇒

<a name="new_AuthSimple_new"></a>

### new AuthSimple()
**Example** *(AuthSimple)*\
```js
const content = AuthSimple.storeFile(request);
```
<a name="AuthSimple.configKey"></a>

### AuthSimple.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>AuthSimple</code>](#AuthSimple)\
**Returns**: The configuration key.\
**Example** *(AuthSimple.configKey)*\
```js
const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
```
<a name="AuthSimple.defaultConfig"></a>

### AuthSimple.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)\
**Returns**: The configuration.\
**Example** *(AuthSimple.defaultConfig())*\
```js
const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
```
<a name="AuthSimple.validateConfig"></a>

### AuthSimple.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)\

| Param | Description |
| --- | --- |
| config | A configuration object. |
| _context | Unused. |

**Example** *(AuthSimple.validateConfig(config, _context))*\
```js
AuthSimple.validateConfig({ ... });
```
<a name="AuthSimple.register"></a>

### AuthSimple.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(AuthSimple.register(context))*\
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

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| context | A Uttori-like context. |

**Example** *(AuthSimple.bindRoutes(server, context))*\
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

### AuthSimple.login(context) ⇒
The Express route method to process the login request and provide a response or redirect.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(AuthSimple.login(context)(request, response, next))*\
```js
server.post('/login', AuthSimple.login(context));
```
<a name="AuthSimple.logout"></a>

### AuthSimple.logout(context) ⇒
The Express route method to process the logout request and clear the session.

**Kind**: static method of [<code>AuthSimple</code>](#AuthSimple)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(AuthSimple.login(context)(request, response, _next))*\
```js
server.post('/logout', AuthSimple.login(context));
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { AuthSimpleConfig } from '../types/plugins/auth-simple.js';
export type { AuthSimpleValidateLogin, AuthSimpleConfig } from '../types/plugins/auth-simple.js';
/**
 * Uttori Auth (Simple)
 * @example <caption>AuthSimple</caption>
 * const content = AuthSimple.storeFile(request);
 */
declare class AuthSimple {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>AuthSimple.configKey</caption>
     * const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
     */
    static get configKey(): 'uttori-plugin-auth-simple';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>AuthSimple.defaultConfig()</caption>
     * const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<AuthSimpleConfig, 'events' | 'loginPath' | 'loginRedirectPath' | 'loginMiddleware' | 'logoutPath' | 'logoutRedirectPath' | 'logoutMiddleware' | 'validateLogin'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context Unused.
     * @example <caption>AuthSimple.validateConfig(config, _context)</caption>
     * AuthSimple.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, AuthSimpleConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>AuthSimple.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [AuthSimple.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * AuthSimple.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>): void;
    /**
     * Add the login & logout routes to the server object.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>AuthSimple.bindRoutes(server, context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [AuthSimple.configKey]: {
     *       loginPath: '/login',
     *       logoutPath: '/logout',
     *       loginMiddleware: [ ... ],
     *       logoutMiddleware: [ ... ],
     *     },
     *   },
     * };
     * AuthSimple.bindRoutes(server, context);
     */
    static bindRoutes(server: import('express').Application, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>): void;
    /**
     * The Express route method to process the login request and provide a response or redirect.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>AuthSimple.login(context)(request, response, next)</caption>
     * server.post('/login', AuthSimple.login(context));
     */
    static login(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>): import('express').RequestHandler<Record<string, never>, unknown, Record<string, never>, Record<string, never>>;
    /**
     * The Express route method to process the logout request and clear the session.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>AuthSimple.login(context)(request, response, _next)</caption>
     * server.post('/logout', AuthSimple.login(context));
     */
    static logout(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>): import('express').RequestHandler;
}
export default AuthSimple;

/** Validates a login request and returns session data, or null for invalid credentials. */
export type AuthSimpleValidateLogin = (request: import('express').Request) => Promise<Record<string, unknown> | null>;
export interface AuthSimpleConfig {
    /** An object whose keys correspond to methods, and contents are events to listen for. */
    events?: Record<string, string[]>;
    /** The path to the login endpoint. */
    loginPath?: string;
    /** The path to the logout endpoint. */
    logoutPath?: string;
    /** The path to redirect to after logging in. */
    loginRedirectPath?: string;
    /** The path to redirect to after logging out. */
    logoutRedirectPath?: string;
    /** The middleware to use on the login route. */
    loginMiddleware?: import('express').RequestHandler[];
    /** The middleware to use on the logout route. */
    logoutMiddleware?: import('express').RequestHandler[];
    /** Validation function for the login request. */
    validateLogin: AuthSimpleValidateLogin;
}
```

</details>
