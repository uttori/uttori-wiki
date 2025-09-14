export default AuthSimple;
export type AuthSimpleConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]>;
    /**
     * The path to the login endpoint.
     */
    loginPath?: string;
    /**
     * The path to the logout endpoint.
     */
    logoutPath?: string;
    /**
     * The path to redirect to after logging in.
     */
    loginRedirectPath?: string;
    /**
     * The path to redirect to after logging out.
     */
    logoutRedirectPath?: string;
    /**
     * The middleware to use on the login route.
     */
    loginMiddleware?: import("express").RequestHandler[];
    /**
     * The middleware to use on the logout route.
     */
    logoutMiddleware?: import("express").RequestHandler[];
    /**
     * Validation function that will recieve the request body that returns an object to be used as the session payload. If the session is invalid it should return null.
     */
    validateLogin: (arg0: import("express").Request) => Promise<object | null>;
};
/**
 * @typedef {object} AuthSimpleConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [loginPath] The path to the login endpoint.
 * @property {string} [logoutPath] The path to the logout endpoint.
 * @property {string} [loginRedirectPath] The path to redirect to after logging in.
 * @property {string} [logoutRedirectPath] The path to redirect to after logging out.
 * @property {import('express').RequestHandler[]} [loginMiddleware] The middleware to use on the login route.
 * @property {import('express').RequestHandler[]} [logoutMiddleware] The middleware to use on the logout route.
 * @property {function(import('express').Request): Promise<object | null>} validateLogin Validation function that will recieve the request body that returns an object to be used as the session payload. If the session is invalid it should return null.
 */
/**
 * Uttori Auth (Simple)
 * @example <caption>AuthSimple</caption>
 * const content = AuthSimple.storeFile(request);
 * @class
 */
declare class AuthSimple {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>AuthSimple.configKey</caption>
     * const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {AuthSimpleConfig} The configuration.
     * @example <caption>AuthSimple.defaultConfig()</caption>
     * const config = { ...AuthSimple.defaultConfig(), ...context.config[AuthSimple.configKey] };
     * @static
     */
    static defaultConfig(): AuthSimpleConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, AuthSimpleConfig>} config A configuration object.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>} _context Unused.
     * @example <caption>AuthSimple.validateConfig(config, _context)</caption>
     * AuthSimple.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, AuthSimpleConfig>, _context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-auth-simple", AuthSimpleConfig>): void;
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
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-auth-simple", AuthSimpleConfig>): void;
    /**
     * Add the login & logout routes to the server object.
     * @param {import('express').Application} server An Express server instance.
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
    static bindRoutes(server: import("express").Application, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-auth-simple", AuthSimpleConfig>): void;
    /**
     * The Express route method to process the login request and provide a response or redirect.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler<{}, {}, {}, {}>} The function to pass to Express.
     * @example <caption>AuthSimple.login(context)(request, response, next)</caption>
     * server.post('/login', AuthSimple.login(context));
     * @static
     */
    static login(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-auth-simple", AuthSimpleConfig>): import("express").RequestHandler<{}, {}, {}, {}>;
    /**
     * The Express route method to process the logout request and clear the session.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-auth-simple', AuthSimpleConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @example <caption>AuthSimple.login(context)(request, response, _next)</caption>
     * server.post('/logout', AuthSimple.login(context));
     * @static
     */
    static logout(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-auth-simple", AuthSimpleConfig>): import("express").RequestHandler;
}
//# sourceMappingURL=auth-simple.d.ts.map