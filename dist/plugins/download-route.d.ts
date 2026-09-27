import type { DownloadRouterConfig } from '../types/plugins/download-route.js';
export type { DownloadRouterConfig } from '../types/plugins/download-route.js';
/**
 * Uttori Download Router
 * @example <caption>DownloadRouter</caption>
 * const content = DownloadRouter.download(context);
 */
declare class DownloadRouter {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>DownloadRouter.configKey</caption>
     * const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
     */
    static get configKey(): 'uttori-plugin-download-router';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>DownloadRouter.defaultConfig()</caption>
     * const config = { ...DownloadRouter.defaultConfig(), ...context.config[DownloadRouter.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<DownloadRouterConfig, 'basePath' | 'publicRoute' | 'allowedReferrers' | 'middleware'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config - A provided configuration to use.
     * @param [_context] Unused.
     * @example <caption>DownloadRouter.validateConfig(config, _context)</caption>
     * DownloadRouter.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, DownloadRouterConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @param context.hooks An event system / hook system to use.
     * @param context.hooks.on An event registration function.
     * @param context.config - A provided configuration to use.
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
     */
    static register(context: Pick<import('../custom.js').UttoriContext, 'hooks' | 'config'>): void;
    /**
     * Add the upload route to the server object.
     * @param server An Express server instance.
     * @param server.get Function to register route.
     * @param context A Uttori-like context.
     * @param context.config - A provided configuration to use.
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
     */
    static bindRoutes(server: Pick<import('express').Application, 'get'>, context: Pick<import('../custom.js').UttoriContext, 'config'>): void;
    /**
     * The Express route method to process the upload request and provide a response.
     * @param context A Uttori-like context.
     * @param context.config - A provided configuration to use.
     * @returns The function to pass to Express.
     * @example <caption>DownloadRouter.download(context)(request, response, _next)</caption>
     * server.post('/upload', DownloadRouter.download);
     */
    static download(context: Pick<import('../custom.js').UttoriContext, 'config'>): import('express').RequestHandler;
}
export default DownloadRouter;
//# sourceMappingURL=download-route.d.ts.map