import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import crypto from 'node:crypto';
const debug = createDebug('Uttori.Plugin.CsrfProtection');
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
 */
class CsrfProtection {
    /**
     * The configuration key used to look up this plugin's settings in the site config.
     *
     * @returns The configuration key.
     * @example <caption>CsrfProtection.configKey</caption>
     * const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
     */
    static get configKey() {
        return 'uttori-plugin-csrf';
    }
    /**
     * Returns the default configuration for the plugin.
     * All settings are optional; the defaults are safe for a typical Uttori Wiki with sessions enabled.
     * @returns The default configuration.
     * @example <caption>CsrfProtection.defaultConfig()</caption>
     * const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
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
     * @param context The Uttori wiki context with plugin configuration.
     * @returns The resolved plugin configuration.
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
     * @param config A configuration object.
     * @param _context Unused context object.
     * @throws {Error} When any required config value is missing or has the wrong type.
     * @example <caption>CsrfProtection.validateConfig(config, _context)</caption>
     * CsrfProtection.validateConfig({ [CsrfProtection.configKey]: { ...CsrfProtection.defaultConfig() } });
     */
    static validateConfig(config, _context) {
        debug('Validating config...');
        if (!config[CsrfProtection.configKey]) {
            throw new Error(`Config missing '${CsrfProtection.configKey}' entry.`);
        }
        const pluginConfig = config[CsrfProtection.configKey];
        if (typeof pluginConfig.fieldName !== 'string' || !pluginConfig.fieldName) {
            throw new Error(`Config '${CsrfProtection.configKey}.fieldName' must be a non-empty string.`);
        }
        if (typeof pluginConfig.headerName !== 'string' || !pluginConfig.headerName) {
            throw new Error(`Config '${CsrfProtection.configKey}.headerName' must be a non-empty string.`);
        }
        if (typeof pluginConfig.sessionKey !== 'string' || !pluginConfig.sessionKey) {
            throw new Error(`Config '${CsrfProtection.configKey}.sessionKey' must be a non-empty string.`);
        }
        if (typeof pluginConfig.tokenBytes !== 'number' || !Number.isInteger(pluginConfig.tokenBytes) || pluginConfig.tokenBytes < 16) {
            throw new Error(`Config '${CsrfProtection.configKey}.tokenBytes' must be an integer >= 16.`);
        }
        if (!Array.isArray(pluginConfig.sources) || pluginConfig.sources.length === 0) {
            throw new Error(`Config '${CsrfProtection.configKey}.sources' must be a non-empty array.`);
        }
        const allowedSources = new Set(['body', 'header']);
        for (const source of pluginConfig.sources) {
            if (!allowedSources.has(source)) {
                throw new Error(`Config '${CsrfProtection.configKey}.sources' must only contain "body" or "header".`);
            }
        }
        if (typeof pluginConfig.requireSession !== 'boolean') {
            throw new Error(`Config '${CsrfProtection.configKey}.requireSession' must be a boolean.`);
        }
        if (typeof pluginConfig.rotateOnValidation !== 'boolean') {
            throw new Error(`Config '${CsrfProtection.configKey}.rotateOnValidation' must be a boolean.`);
        }
        if (typeof pluginConfig.checkFetchMetadata !== 'boolean') {
            throw new Error(`Config '${CsrfProtection.configKey}.checkFetchMetadata' must be a boolean.`);
        }
        debug('Validated config.');
    }
    /**
     * Registers the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
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
            const CsrfProtectionMethod = getPluginMethod(CsrfProtection, method);
            if (CsrfProtectionMethod) {
                for (const event of events) {
                    const callback = CsrfProtectionMethod;
                    context.hooks.on(event, callback);
                }
            }
            else {
                debug(`Missing function "${method}"`);
            }
        }
    }
    /**
     * Generates a cryptographically random CSRF token as a hexadecimal string.
     * @param tokenBytes Number of random bytes to generate. The resulting hex string will be twice this length.
     * @returns A hex-encoded token of length `tokenBytes * 2`.
     * @example <caption>CsrfProtection.generateToken(32)</caption>
     * const token = CsrfProtection.generateToken(32); // 64-character hex string
     */
    static generateToken(tokenBytes) {
        return crypto.randomBytes(tokenBytes).toString('hex');
    }
    /**
     * Escapes a value for safe interpolation into an HTML attribute.
     * The generated CSRF token is hex-only, but `fieldName` is configurable and
     * should not be trusted as safe HTML.
     * @param value The value to escape.
     * @returns The escaped HTML value.
     * @example <caption>CsrfProtection.escapeHtml(value)</caption>
     * const safe = CsrfProtection.escapeHtml('csrf"token');
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
     * @param request The Express request object.
     * @param config The resolved CSRF plugin configuration.
     * @returns The submitted token, or `null` when none is present.
     * @example <caption>CsrfProtection.getSubmittedToken(request, config)</caption>
     * const submittedToken = CsrfProtection.getSubmittedToken(request, config);
     */
    static getSubmittedToken(request, config) {
        const body = (request?.body ?? {});
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
     * @param expected The token stored in the session.
     * @param actual The token submitted with the request.
     * @returns Whether both token strings match.
     * @example <caption>CsrfProtection.tokensMatch(expected, actual)</caption>
     * const valid = CsrfProtection.tokensMatch(sessionToken, submittedToken);
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
     * @param viewModel The current view model being built for the edit, create, or restore page.
     * @param context The Uttori wiki context with plugin configuration.
     * @returns The view model, now extended with a `csrf` property.
     * @example <caption>CsrfProtection.injectToken(viewModel, context)</caption>
     * // In an EJS edit template, after registering the plugin:
     * // <%- csrf?.input || '' -%>
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
        const storedToken = session?.[config.sessionKey];
        let token = typeof storedToken === 'string' ? storedToken : undefined;
        if (!token) {
            token = CsrfProtection.generateToken(config.tokenBytes);
            if (session) {
                session[config.sessionKey] = token;
            }
            debug('Generated new CSRF token.');
        }
        else {
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
     * @param request The Express request object.
     * @param context The Uttori wiki context with plugin configuration.
     * @returns `true` to block the request, `false` to allow it.
     * @example <caption>CsrfProtection.validateToken(request, context)</caption>
     * const blocked = CsrfProtection.validateToken(request, context);
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
//# sourceMappingURL=csrf.js.map