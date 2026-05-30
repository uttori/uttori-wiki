import crypto from 'node:crypto';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.CsrfProtection'); } catch {}

/**
 * @typedef {object} CsrfProtectionConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to plugin methods, and whose values are arrays of hook event names to listen for.
 * @property {string} [fieldName='_csrf'] The hidden form field name that themes should render and that is read from the POST body on save.
 * @property {string} [headerName='x-csrf-token'] The HTTP request header name that JavaScript clients can use to submit the token instead of a form field.
 * @property {string} [sessionKey='uttoriCsrfToken'] The key used to store the CSRF token on `request.session`. Change this if it collides with another session value.
 * @property {number} [tokenBytes=32] Number of random bytes to generate. Each byte becomes two hex characters, so the default produces a 64-character token.
 * @property {Array<'body'|'header'>} [sources=['body','header']] Ordered list of sources to search for the submitted token. The first source that contains a non-empty value is used.
 * @property {boolean} [requireSession=true] When `true`, a missing or unavailable `request.session` causes the token to be skipped on injection and the request to be blocked on validation. Set to `false` only if your setup guarantees cookies can never be forged (e.g. purely API clients with custom headers).
 * @property {boolean} [rotateOnValidation=false] When `true`, a fresh token is written to the session every time a valid save request completes. This limits replay-window but will break any browser tabs that still hold the old token. Leave `false` for typical wikis where multiple tabs are common.
 * @property {boolean} [checkFetchMetadata=false] When `true`, the `Sec-Fetch-Site` header is also checked as a defense-in-depth measure. Requests that arrive as `cross-site` are rejected even if the CSRF token matches. Has no effect on browsers that do not send Fetch Metadata headers (e.g. some older browsers), so this is supplemental, not a replacement for token checks.
 */

/**
 * @typedef {object} CsrfViewModel
 * @property {string} token The raw CSRF token value. Read this in JavaScript clients to set the `x-csrf-token` request header.
 * @property {string} fieldName The form field name that the token should be submitted under.
 * @property {string} headerName The HTTP header name that JavaScript clients should use.
 * @property {string} input A ready-to-render hidden `<input>` element. Use `<%- csrf?.input || '' -%>` inside the edit form in EJS templates.
 */

/**
 * Uttori CSRF Protection
 *
 * Implements the CSRF token pattern described at https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/CSRF.
 * Tokens are generated with `crypto.randomBytes`, stored server-side in `express-session`, and compared using
 * `crypto.timingSafeEqual` to prevent timing-based oracle attacks.
 *
 * The plugin hooks into three existing view-model filter events to inject tokens into edit and create forms,
 * and into the `validate-save` event to reject saves that are missing or present a mismatched token.
 *
 * @example <caption>CsrfProtection - register in site config</caption>
 * import { CsrfProtection } from '@uttori/wiki';
 * const config = {
 *   plugins: [CsrfProtection],
 *   [CsrfProtection.configKey]: {
 *     ...CsrfProtection.defaultConfig(),
 *   },
 * };
 * @class
 */
class CsrfProtection {
  /**
   * The configuration key used to look up this plugin's settings in the site config.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>CsrfProtection.configKey</caption>
   * const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-csrf';
  }

  /**
   * Returns the default configuration for the plugin.
   * All settings are optional; the defaults are safe for a typical Uttori Wiki with sessions enabled.
   * @returns {CsrfProtectionConfig} The default configuration.
   * @example <caption>CsrfProtection.defaultConfig()</caption>
   * const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      events: {
        injectToken: ['view-model-edit', 'view-model-new', 'view-model-history-restore'],
        validateToken: ['validate-save'],
        validateConfig: ['validate-config'],
      },
      fieldName: '_csrf',
      headerName: 'x-csrf-token',
      sessionKey: 'uttoriCsrfToken',
      tokenBytes: 32,
      sources: ['body', 'header'],
      requireSession: true,
      rotateOnValidation: false,
      checkFetchMetadata: false,
    };
  }

  /**
   * Resolves the active configuration by shallow-merging site config over defaults.
   * Nested `events` and `sources` arrays are merged with their defaults to allow
   * partial overrides without losing unspecified entries.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>} context The Uttori wiki context with plugin configuration.
   * @returns {CsrfProtectionConfig} The resolved plugin configuration.
   * @static
   */
  static resolveConfig(context) {
    const defaults = CsrfProtection.defaultConfig();
    const userConfig = context?.config?.[CsrfProtection.configKey] ?? {};
    return {
      ...defaults,
      ...userConfig,
      events: {
        ...defaults.events,
        ...userConfig.events,
      },
      // Prefer the user-supplied sources array verbatim; fall back to defaults.
      sources: userConfig.sources ?? defaults.sources,
    };
  }

  /**
   * Validates the provided configuration for required entries and correct types.
   * Called automatically on the `validate-config` hook.
   * @param {Record<string, CsrfProtectionConfig>} config A configuration object.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>} _context Unused context object.
   * @throws {Error} When any required config value is missing or has the wrong type.
   * @example <caption>CsrfProtection.validateConfig(config, _context)</caption>
   * CsrfProtection.validateConfig({ [CsrfProtection.configKey]: { ...CsrfProtection.defaultConfig() } });
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config[CsrfProtection.configKey]) {
      throw new Error(`Config missing '${CsrfProtection.configKey}' entry.`);
    }

    if (typeof config[CsrfProtection.configKey].fieldName !== 'string' || !config[CsrfProtection.configKey].fieldName) {
      throw new Error(`Config '${CsrfProtection.configKey}.fieldName' must be a non-empty string.`);
    }
    if (typeof config[CsrfProtection.configKey].headerName !== 'string' || !config[CsrfProtection.configKey].headerName) {
      throw new Error(`Config '${CsrfProtection.configKey}.headerName' must be a non-empty string.`);
    }
    if (typeof config[CsrfProtection.configKey].sessionKey !== 'string' || !config[CsrfProtection.configKey].sessionKey) {
      throw new Error(`Config '${CsrfProtection.configKey}.sessionKey' must be a non-empty string.`);
    }
    if (!Number.isInteger(config[CsrfProtection.configKey].tokenBytes) || config[CsrfProtection.configKey].tokenBytes < 16) {
      throw new Error(`Config '${CsrfProtection.configKey}.tokenBytes' must be an integer >= 16.`);
    }
    if (!Array.isArray(config[CsrfProtection.configKey].sources) || config[CsrfProtection.configKey].sources.length === 0) {
      throw new Error(`Config '${CsrfProtection.configKey}.sources' must be a non-empty array.`);
    }
    const allowedSources = new Set(['body', 'header']);
    for (const source of config[CsrfProtection.configKey].sources) {
      if (!allowedSources.has(source)) {
        throw new Error(`Config '${CsrfProtection.configKey}.sources' must only contain "body" or "header".`);
      }
    }
    if (typeof config[CsrfProtection.configKey].requireSession !== 'boolean') {
      throw new Error(`Config '${CsrfProtection.configKey}.requireSession' must be a boolean.`);
    }
    if (typeof config[CsrfProtection.configKey].rotateOnValidation !== 'boolean') {
      throw new Error(`Config '${CsrfProtection.configKey}.rotateOnValidation' must be a boolean.`);
    }
    if (typeof config[CsrfProtection.configKey].checkFetchMetadata !== 'boolean') {
      throw new Error(`Config '${CsrfProtection.configKey}.checkFetchMetadata' must be a boolean.`);
    }
    debug('Validated config.');
  }

  /**
   * Registers the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>} context A Uttori-like context.
   * @throws {Error} When the event dispatcher is missing from the context.
   * @example <caption>CsrfProtection.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [CsrfProtection.configKey]: {
   *       ...CsrfProtection.defaultConfig(),
   *     },
   *   },
   * };
   * CsrfProtection.register(context);
   * @static
   */
  static register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    const config = CsrfProtection.resolveConfig(context);
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind each configured method name to the requested hook events.
    for (const [method, events] of Object.entries(config.events)) {
      if (typeof CsrfProtection[method] === 'function') {
        for (const event of events) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = CsrfProtection[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Generates a cryptographically random CSRF token as a hexadecimal string.
   * @param {number} tokenBytes Number of random bytes to generate. The resulting hex string will be twice this length.
   * @returns {string} A hex-encoded token of length `tokenBytes * 2`.
   * @example <caption>CsrfProtection.generateToken(32)</caption>
   * const token = CsrfProtection.generateToken(32); // 64-character hex string
   * @static
   */
  static generateToken(tokenBytes) {
    return crypto.randomBytes(tokenBytes).toString('hex');
  }

  /**
   * Escapes a value for safe interpolation into an HTML attribute.
   * The generated CSRF token is hex-only, but `fieldName` is configurable and
   * should not be trusted as safe HTML.
   * @param {unknown} value The value to escape.
   * @returns {string} The escaped HTML value.
   * @example <caption>CsrfProtection.escapeHtml(value)</caption>
   * const safe = CsrfProtection.escapeHtml('csrf"token');
   * @static
   */
  static escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('"', '&quot;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
  }

  /**
   * Extracts the submitted CSRF token from the request according to configured sources.
   * Body tokens must be non-empty strings. Header tokens may be a non-empty string or
   * a string array, matching Node/Express header shapes.
   * @param {import('express').Request} request The Express request object.
   * @param {CsrfProtectionConfig} config The resolved CSRF plugin configuration.
   * @returns {string | null} The submitted token, or `null` when none is present.
   * @example <caption>CsrfProtection.getSubmittedToken(request, config)</caption>
   * const submittedToken = CsrfProtection.getSubmittedToken(request, config);
   * @static
   */
  static getSubmittedToken(request, config) {
    /** @type {Record<string, unknown>} */
    const body = request?.body ?? {};
    const headers = request?.headers ?? {};

    for (const source of config.sources) {
      if (source === 'body') {
        const value = body[config.fieldName];
        if (typeof value === 'string' && value.length > 0) {
          debug('Found CSRF token in request body.');
          return value;
        }
      }

      if (source === 'header') {
        const value = headers[config.headerName.toLowerCase()] ?? headers[config.headerName];
        if (typeof value === 'string' && value.length > 0) {
          debug('Found CSRF token in request header.');
          return value;
        }
        if (Array.isArray(value) && typeof value[0] === 'string' && value[0].length > 0) {
          debug('Found CSRF token in request header.');
          return value[0];
        }
      }
    }

    return null;
  }

  /**
   * Compares two normalized token strings using a constant-time comparison.
   * `crypto.timingSafeEqual` requires buffers of identical byte length, so length
   * is checked first and only equal-length buffers are compared.
   * @param {string} expected The token stored in the session.
   * @param {string} actual The token submitted with the request.
   * @returns {boolean} Whether both token strings match.
   * @example <caption>CsrfProtection.tokensMatch(expected, actual)</caption>
   * const valid = CsrfProtection.tokensMatch(sessionToken, submittedToken);
   * @static
   */
  static tokensMatch(expected, actual) {
    const expectedBuffer = Buffer.from(expected, 'utf8');
    const actualBuffer = Buffer.from(actual, 'utf8');
    return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  }

  /**
   * View-model filter hook. Generates or retrieves a CSRF token from the session and adds a
   * `csrf` object to the view model so EJS templates can render a hidden input field.
   *
   * The session is accessed via `viewModel.session`, which `UttoriWiki.buildViewModelBase`
   * always includes. If the session is unavailable and `requireSession` is `true` the view
   * model is returned unchanged and no `csrf` property is set.
   *
   * When `rotateOnValidation` is `false` (default) the same token is reused across requests
   * so that multiple browser tabs can coexist without invalidating each other's tokens.
   * When `rotateOnValidation` is `true`, the token is rotated only after a successful validation,
   * not during page render.
   * @template {import('../wiki.js').UttoriWikiViewModel & { csrf?: CsrfViewModel }} T
   * @param {T} viewModel The current view model being built for the edit, create, or restore page.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>} context The Uttori wiki context with plugin configuration.
   * @returns {T} The view model, now extended with a `csrf` property.
   * @example <caption>CsrfProtection.injectToken(viewModel, context)</caption>
   * // In an EJS edit template, after registering the plugin:
   * // <%- csrf?.input || '' -%>
   * @static
   */
  static injectToken(viewModel, context) {
    const config = CsrfProtection.resolveConfig(context);
    const session = viewModel?.session;

    if (config.requireSession && !session) {
      debug('No session available, skipping CSRF token injection.');
      return viewModel;
    }

    // Reuse any existing session token to avoid invalidating other open tabs.
    // Generate a new token only when none exists yet.
    let token = session?.[config.sessionKey];
    if (!token) {
      token = CsrfProtection.generateToken(config.tokenBytes);
      if (session) {
        session[config.sessionKey] = token;
      }
      debug('Generated new CSRF token.');
    } else {
      debug('Reusing existing CSRF token from session.');
    }

    // Expose the token on the view model. Themes should render `csrf.input` inside the <form>.
    viewModel.csrf = {
      token,
      fieldName: config.fieldName,
      headerName: config.headerName,
      // Pre-built hidden input element so themes can add it with a single EJS expression.
      input: `<input type="hidden" name="${CsrfProtection.escapeHtml(config.fieldName)}" value="${CsrfProtection.escapeHtml(token)}" />`,
    };

    return viewModel;
  }

  /**
   * Validation hook for the `validate-save` event.
   * Returns `true` to block the save request if any of the following conditions are met:
   * - `requireSession` is `true` and no session exists on the request.
   * - `checkFetchMetadata` is `true` and the `Sec-Fetch-Site` header indicates a cross-site origin.
   * - No CSRF token is stored in the session (the edit page was never rendered with the plugin active).
   * - No token was submitted in the request body or headers.
   * - The submitted token does not match the session token (timing-safe comparison).
   *
   * Returns `false` to allow the save to proceed.
   * When `rotateOnValidation` is `true` and a successful validation occurs, the session token is rotated.
   * @param {import('express').Request} request The Express request object.
   * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>} context The Uttori wiki context with plugin configuration.
   * @returns {boolean} `true` to block the request, `false` to allow it.
   * @example <caption>CsrfProtection.validateToken(request, context)</caption>
   * const blocked = CsrfProtection.validateToken(request, context);
   * @static
   */
  static validateToken(request, context) {
    debug('Validating CSRF token...');
    const config = CsrfProtection.resolveConfig(context);
    const session = request?.session;

    if (config.requireSession && !session) {
      debug('No session available, blocking request.');
      return true;
    }

    // Optional defense-in-depth: reject requests that the browser tagged as cross-site.
    // This relies on the browser sending Sec-Fetch-Site; absent or older browsers will
    // send no header at all (treated as safe here) rather than sending "cross-site".
    if (config.checkFetchMetadata) {
      const secFetchSite = request?.headers?.['sec-fetch-site'];
      if (secFetchSite === 'cross-site') {
        debug(`Blocked cross-site request via Sec-Fetch-Site header: ${secFetchSite}`);
        return true;
      }
    }

    const { sessionKey } = config;
    const rawSessionToken = session?.[sessionKey];
    const sessionToken = rawSessionToken ? String(rawSessionToken) : null;
    if (!sessionToken) {
      debug('No CSRF token in session, blocking request.');
      return true;
    }

    const submittedToken = CsrfProtection.getSubmittedToken(request, config);
    if (!submittedToken) {
      debug('No CSRF token submitted, blocking request.');
      return true;
    }

    if (!CsrfProtection.tokensMatch(sessionToken, submittedToken)) {
      debug('CSRF token mismatch, blocking request.');
      return true;
    }

    // Rotate the session token if configured to prevent replay of a previously observed token.
    // Disabled by default because it breaks multiple browser tabs sharing the same session.
    if (config.rotateOnValidation && session) {
      session[config.sessionKey] = CsrfProtection.generateToken(config.tokenBytes);
      debug('CSRF token rotated after successful validation.');
    }

    debug('CSRF token valid, allowing request.');
    return false;
  }
}

export default CsrfProtection;
