let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.AuthSimple'); } catch {}

/**
 * @typedef AuthSimpleConfigEvents
 * @type {object}
 * @property {string[]} bindRoutes The collection of events to bind to for setting up the login and logout routes.
 * @property {string[]} validateConfig The collection of events to bind to for validating the configuration.
 */

/**
 * @typedef {object} AuthSimpleConfig
 * @property {AuthSimpleConfigEvents} [events] Events to bind to.
 * @property {string} [loginPath] The path to the login endpoint.
 * @property {string} [loginRedirectPath] The path to redirect to after logging in.
 * @property {Function[]} [loginMiddleware] The middleware to use on the login route.
 * @property {string} [logoutPath] The path to the logout endpoint.
 * @property {string} [logoutRedirectPath] The path to redirect to after logging out.
 * @property {Function[]} [logoutMiddleware] The middleware to use on the logout route.
 * @property {((request: import('express').Request) => Promise<object | null>)} validateLogin Validation function that will recieve the request body that returns an object to be used as the session payload. If the session is invalid it should return null.
 */

/**
 * Uttori Auth (Simple)
 * @example <caption>AuthSimple</caption>
 * const content = AuthSimple.storeFile(request);
 * @class
 */
class AuthSimple {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>AuthSimple.configKey</caption>
   * const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-auth-simple';
  }

  /**
   * The default configuration.
   * @returns {AuthSimpleConfig} The configuration.
   * @example <caption>AuthSimple.defaultConfig()</caption>
   * const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      // Login Path
      loginPath: '/login',

      // Login Redirect Path
      loginRedirectPath: '/',

      // Login Route Middleware
      loginMiddleware: [],

      // Logout Path
      logoutPath: '/logout',

      // Logout Redirect Path
      logoutRedirectPath: '/',

      // Logout Route Middleware
      logoutMiddleware: [],

      // Validation function that will recieve the request body that returns an object to be used as the session payload.
      // If the session is invalid it should return null.
      validateLogin: (_request) => Promise.resolve(null),
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, AuthSimpleConfig>} config A configuration object.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>} _context Unused.
   * @example <caption>AuthSimple.validateConfig(config, _context)</caption>
   * AuthSimple.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config || !config[AuthSimple.configKey]) {
      const error = `Config Error: '${AuthSimple.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }
    if (typeof config[AuthSimple.configKey].loginPath !== 'string') {
      const error = 'Config Error: `loginPath` should be a string server route to where credentials should be POSTed to.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[AuthSimple.configKey].loginRedirectPath !== 'string') {
      const error = 'Config Error: `loginRedirectPath` should be a string server route to where a successful login should navigate to.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(config[AuthSimple.configKey].loginMiddleware)) {
      const error = 'Config Error: `loginMiddleware` should be an array of middlewares or an empty array.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[AuthSimple.configKey].logoutPath !== 'string') {
      const error = 'Config Error: `logoutPath` should be a string server route to where logout requests should be POSTed to.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[AuthSimple.configKey].logoutRedirectPath !== 'string') {
      const error = 'Config Error: `logoutRedirectPath` should be a string server route to where a logout should navigate to.';
      debug(error);
      throw new Error(error);
    }
    if (!Array.isArray(config[AuthSimple.configKey].logoutMiddleware)) {
      const error = 'Config Error: `logoutMiddleware` should be an array of middlewares or an empty array.';
      debug(error);
      throw new Error(error);
    }
    if (typeof config[AuthSimple.configKey].validateLogin !== 'function') {
      const error = 'Config Error: `validateLogin` should be a function to validate the request body.';
      debug(error);
      throw new Error(error);
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>} context A Uttori-like context.
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
   * @static
   */
  static register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error("Missing event dispatcher in 'context.hooks.on(event, callback)' format.");
    }
    const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
    if (!config.events) {
      throw new Error("Missing events to listen to for in 'config.events'.");
    }
    // Bind events
    for (const [method, events] of Object.entries(config.events)) {
      if (typeof AuthSimple[method] === 'function') {
        for (const event of events) {
          context.hooks.on(event, AuthSimple[method]);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Add the login & logout routes to the server object.
   * @param {object} server An Express server instance.
   * @param {Function} server.post Function to register route.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>} context A Uttori-like context.
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
   * @static
   */
  static bindRoutes(server, context) {
    debug('bindRoutes');
    const { loginPath, logoutPath, loginMiddleware, logoutMiddleware } = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
    debug('bindRoutes loginPath:', loginPath);
    debug('bindRoutes logoutPath:', logoutPath);
    server.post(loginPath, ...loginMiddleware, AuthSimple.login(context));
    server.post(logoutPath, ...logoutMiddleware, AuthSimple.logout(context));
  }

  /**
   * The Express route method to process the login request and provide a response or redirect.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler<{}, {}, {}, {}>} The function to pass to Express.
   * @example <caption>AuthSimple.login(context)(request, response, next)</caption>
   * server.post('/login', AuthSimple.login(context));
   * @static
   */
  static login(context) {
    /** @type {import('express').RequestHandler<{}, {}, {}, {}>} */
    return async (request, response, next) => {
      debug('login');
      const { validateLogin, loginPath, loginRedirectPath } = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };

      if (typeof validateLogin !== 'function') {
        debug('Missing "validateLogin" function.');
        next();
        return;
      }

      // Validate login, returns profile.
      /** @type {Record<string, unknown> | null} */
      const profile = await validateLogin(request);
      debug('profile:', profile);

      // Determine what the client wants in the response
      const accept = request.accepts(['json', 'html']);

      if (profile) {
        // Set the response on the session.
        request.session['profile'] = profile;

        if (accept === 'json') {
          response.type('application/json');
          response.json(profile);
        } else {
          debug('Redirecting to loginRedirectPath:', loginRedirectPath);
          response.status(302).redirect(loginRedirectPath);
        }
        return;
      }

      // Not logged in.
      if (accept === 'json') {
        response.type('application/json');
        response.status(401).json({ error: true });
      } else {
        response.redirect(loginPath);
      }
    };
  }

  /**
   * The Express route method to process the logout request and clear the session.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler<{}, {}, {}, {}>} The function to pass to Express.
   * @example <caption>AuthSimple.login(context)(request, response, _next)</caption>
   * server.post('/logout', AuthSimple.login(context));
   * @static
   */
  static logout(context) {
    /** @type {import('express').RequestHandler<{}, {}, {}, {}>} */
    return (request, response, _next) => {
      debug('logout');
      const { logoutRedirectPath } = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
      request.session.destroy((error) => {
        debug('Destroyed session:', error);
      });
      const accept = request.accepts(['json', 'html']);
      if (accept === 'json') {
        response.type('application/json');
        response.status(200).json({ success: true });
      } else {
        response.redirect(logoutRedirectPath);
      }
      return;
    };
  }
}

export default AuthSimple;
