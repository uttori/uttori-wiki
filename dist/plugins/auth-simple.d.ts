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
//# sourceMappingURL=auth-simple.d.ts.map