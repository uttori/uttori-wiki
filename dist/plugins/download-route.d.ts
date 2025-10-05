export default DownloadRouter;
export type DownloadRouterConfig = {
    /**
     * Events to bind to.
     */
    events?: Record<string, string[]>;
    /**
     * Directory files will be downloaded from.
     */
    basePath: string;
    /**
     * Server route to GET uploads from.
     */
    publicRoute: string;
    /**
     * When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an rmpty array don't check at all.
     */
    allowedReferrers: string[];
    /**
     * Custom Middleware for the Upload route
     */
    middleware: import("express").RequestHandler[];
};
/**
 * @typedef {object} DownloadRouterConfig
 * @property {Record<string, string[]>} [events] Events to bind to.
 * @property {string} basePath Directory files will be downloaded from.
 * @property {string} publicRoute Server route to GET uploads from.
 * @property {string[]} allowedReferrers When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an rmpty array don't check at all.
 * @property {import('express').RequestHandler[]} middleware Custom Middleware for the Upload route
 */
/**
 * Uttori Download Router
 * @example <caption>DownloadRouter</caption>
 * const content = DownloadRouter.download(context);
 * @class
 */
declare class DownloadRouter {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>DownloadRouter.configKey</caption>
     * const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {DownloadRouterConfig} The configuration.
     * @example <caption>DownloadRouter.defaultConfig()</caption>
     * const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
     * @static
     */
    static defaultConfig(): DownloadRouterConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, DownloadRouterConfig>} config - A provided configuration to use.
     * @param {object} [_context] Unused.
     * @example <caption>DownloadRouter.validateConfig(config, _context)</caption>
     * DownloadRouter.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, DownloadRouterConfig>, _context?: object): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {object} context A Uttori-like context.
     * @param {object} context.hooks An event system / hook system to use.
     * @param {Function} context.hooks.on An event registration function.
     * @param {Record<string, DownloadRouterConfig>} context.config - A provided configuration to use.
     * @example <caption>DownloadRouter.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [DownloadRouter.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * DownloadRouter.register(context);
     * @static
     */
    static register(context: {
        hooks: {
            on: Function;
        };
        config: Record<string, DownloadRouterConfig>;
    }): void;
    /**
     * Add the upload route to the server object.
     * @param {object} server An Express server instance.
     * @param {Function} server.get Function to register route.
     * @param {object} context A Uttori-like context.
     * @param {Record<string, DownloadRouterConfig>} context.config - A provided configuration to use.
     * @example <caption>DownloadRouter.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [DownloadRouter.configKey]: {
     *       middleware: [],
     *       publicRoute: '/download',
     *     },
     *   },
     * };
     * DownloadRouter.bindRoutes(server, context);
     * @static
     */
    static bindRoutes(server: {
        get: Function;
    }, context: {
        config: Record<string, DownloadRouterConfig>;
    }): void;
    /**
     * The Express route method to process the upload request and provide a response.
     * @param {object} context A Uttori-like context.
     * @param {Record<string, DownloadRouterConfig>} context.config - A provided configuration to use.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @example <caption>DownloadRouter.download(context)(request, response, _next)</caption>
     * server.post('/upload', DownloadRouter.download);
     * @static
     */
    static download(context: {
        config: Record<string, DownloadRouterConfig>;
    }): import("express").RequestHandler;
}
//# sourceMappingURL=download-route.d.ts.map