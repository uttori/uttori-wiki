import type { CsrfProtectionConfig, CsrfViewModel } from '../types/plugins/csrf.js';
export type { CsrfProtectionConfig, CsrfViewModel } from '../types/plugins/csrf.js';
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
declare class CsrfProtection {
    /**
     * The configuration key used to look up this plugin's settings in the site config.
     *
     * @returns The configuration key.
     * @example <caption>CsrfProtection.configKey</caption>
     * const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
     */
    static get configKey(): 'uttori-plugin-csrf';
    /**
     * Returns the default configuration for the plugin.
     * All settings are optional; the defaults are safe for a typical Uttori Wiki with sessions enabled.
     * @returns The default configuration.
     * @example <caption>CsrfProtection.defaultConfig()</caption>
     * const config = { ...CsrfProtection.defaultConfig(), ...context.config[CsrfProtection.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<CsrfProtectionConfig, 'events' | 'fieldName' | 'headerName' | 'sessionKey' | 'tokenBytes' | 'sources' | 'requireSession' | 'rotateOnValidation' | 'checkFetchMetadata'>;
    /**
     * Resolves the active configuration by shallow-merging site config over defaults.
     * Nested `events` and `sources` arrays are merged with their defaults to allow
     * partial overrides without losing unspecified entries.
     * @param context The Uttori wiki context with plugin configuration.
     * @returns The resolved plugin configuration.
     */
    static resolveConfig(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>): {
        fieldName: string;
        headerName: string;
        sessionKey: string;
        tokenBytes: number;
        requireSession: boolean;
        rotateOnValidation: boolean;
        checkFetchMetadata: boolean;
        events: {
            [x: string]: string[];
        };
        sources: ("body" | "header")[];
    };
    /**
     * Validates the provided configuration for required entries and correct types.
     * Called automatically on the `validate-config` hook.
     * @param config A configuration object.
     * @param _context Unused context object.
     * @throws {Error} When any required config value is missing or has the wrong type.
     * @example <caption>CsrfProtection.validateConfig(config, _context)</caption>
     * CsrfProtection.validateConfig({ [CsrfProtection.configKey]: { ...CsrfProtection.defaultConfig() } });
     */
    static validateConfig(config: Record<string, CsrfProtectionConfig>, _context: unknown): void;
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
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>): void;
    /**
     * Generates a cryptographically random CSRF token as a hexadecimal string.
     * @param tokenBytes Number of random bytes to generate. The resulting hex string will be twice this length.
     * @returns A hex-encoded token of length `tokenBytes * 2`.
     * @example <caption>CsrfProtection.generateToken(32)</caption>
     * const token = CsrfProtection.generateToken(32); // 64-character hex string
     */
    static generateToken(tokenBytes: number): string;
    /**
     * Escapes a value for safe interpolation into an HTML attribute.
     * The generated CSRF token is hex-only, but `fieldName` is configurable and
     * should not be trusted as safe HTML.
     * @param value The value to escape.
     * @returns The escaped HTML value.
     * @example <caption>CsrfProtection.escapeHtml(value)</caption>
     * const safe = CsrfProtection.escapeHtml('csrf"token');
     */
    static escapeHtml(value: unknown): string;
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
    static getSubmittedToken(request: import('express').Request, config: ReturnType<typeof CsrfProtection.resolveConfig>): string | null;
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
     * @param viewModel The current view model being built for the edit, create, or restore page.
     * @param context The Uttori wiki context with plugin configuration.
     * @returns The view model, now extended with a `csrf` property.
     * @example <caption>CsrfProtection.injectToken(viewModel, context)</caption>
     * // In an EJS edit template, after registering the plugin:
     * // <%- csrf?.input || '' -%>
     */
    static injectToken<T extends import('../wiki.js').UttoriWikiViewModel & {
        csrf?: CsrfViewModel;
    }>(viewModel: T, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>): T;
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
    static validateToken(request: import('express').Request, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-csrf', CsrfProtectionConfig>): boolean;
}
export default CsrfProtection;
//# sourceMappingURL=csrf.d.ts.map