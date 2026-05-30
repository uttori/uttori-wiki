export default CsrfProtection;
export type CsrfProtectionConfig = {
    /**
     * An object whose keys correspond to plugin methods, and whose values are arrays of hook event names to listen for.
     */
    events?: Record<string, string[]>;
    /**
     * The hidden form field name that themes should render and that is read from the POST body on save.
     */
    fieldName?: string;
    /**
     * The HTTP request header name that JavaScript clients can use to submit the token instead of a form field.
     */
    headerName?: string;
    /**
     * The key used to store the CSRF token on `request.session`. Change this if it collides with another session value.
     */
    sessionKey?: string;
    /**
     * Number of random bytes to generate. Each byte becomes two hex characters, so the default produces a 64-character token.
     */
    tokenBytes?: number;
    /**
     * Ordered list of sources to search for the submitted token. The first source that contains a non-empty value is used.
     */
    sources?: Array<"body" | "header">;
    /**
     * When `true`, a missing or unavailable `request.session` causes the token to be skipped on injection and the request to be blocked on validation. Set to `false` only if your setup guarantees cookies can never be forged (e.g. purely API clients with custom headers).
     */
    requireSession?: boolean;
    /**
     * When `true`, a fresh token is written to the session every time a valid save request completes. This limits replay-window but will break any browser tabs that still hold the old token. Leave `false` for typical wikis where multiple tabs are common.
     */
    rotateOnValidation?: boolean;
    /**
     * When `true`, the `Sec-Fetch-Site` header is also checked as a defense-in-depth measure. Requests that arrive as `cross-site` are rejected even if the CSRF token matches. Has no effect on browsers that do not send Fetch Metadata headers (e.g. some older browsers), so this is supplemental, not a replacement for token checks.
     */
    checkFetchMetadata?: boolean;
};
export type CsrfViewModel = {
    /**
     * The raw CSRF token value. Read this in JavaScript clients to set the `x-csrf-token` request header.
     */
    token: string;
    /**
     * The form field name that the token should be submitted under.
     */
    fieldName: string;
    /**
     * The HTTP header name that JavaScript clients should use.
     */
    headerName: string;
    /**
     * A ready-to-render hidden `<input>` element. Use `<%- csrf?.input || '' -%>` inside the edit form in EJS templates.
     */
    input: string;
};
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
declare class CsrfProtection {
    /**
     * The configuration key used to look up this plugin's settings in the site config.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>CsrfProtection.configKey</caption>
     * const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * Returns the default configuration for the plugin.
     * All settings are optional; the defaults are safe for a typical Uttori Wiki with sessions enabled.
     * @returns {CsrfProtectionConfig} The default configuration.
     * @example <caption>CsrfProtection.defaultConfig()</caption>
     * const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
     * @static
     */
    static defaultConfig(): CsrfProtectionConfig;
    /**
     * Resolves the active configuration by shallow-merging site config over defaults.
     * Nested `events` and `sources` arrays are merged with their defaults to allow
     * partial overrides without losing unspecified entries.
     * @param {import('../../dist/custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>} context The Uttori wiki context with plugin configuration.
     * @returns {CsrfProtectionConfig} The resolved plugin configuration.
     * @static
     */
    static resolveConfig(context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-csrf", CsrfProtectionConfig>): CsrfProtectionConfig;
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
    static validateConfig(config: Record<string, CsrfProtectionConfig>, _context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-csrf", CsrfProtectionConfig>): void;
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
    static register(context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-csrf", CsrfProtectionConfig>): void;
    /**
     * Generates a cryptographically random CSRF token as a hexadecimal string.
     * @param {number} tokenBytes Number of random bytes to generate. The resulting hex string will be twice this length.
     * @returns {string} A hex-encoded token of length `tokenBytes * 2`.
     * @example <caption>CsrfProtection.generateToken(32)</caption>
     * const token = CsrfProtection.generateToken(32); // 64-character hex string
     * @static
     */
    static generateToken(tokenBytes: number): string;
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
    static escapeHtml(value: unknown): string;
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
    static getSubmittedToken(request: import("express").Request, config: CsrfProtectionConfig): string | null;
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
    static tokensMatch(expected: string, actual: string): boolean;
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
    static injectToken<T extends import("../wiki.js").UttoriWikiViewModel & {
        csrf?: CsrfViewModel;
    }>(viewModel: T, context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-csrf", CsrfProtectionConfig>): T;
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
    static validateToken(request: import("express").Request, context: import("../../dist/custom.js").UttoriContextWithPluginConfig<"uttori-plugin-csrf", CsrfProtectionConfig>): boolean;
}
//# sourceMappingURL=csrf.d.ts.map