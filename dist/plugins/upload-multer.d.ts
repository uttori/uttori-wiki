export default MulterUpload;
export type MulterUploadConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]>;
    /**
     * Directory files will be uploaded to. The default is 'uploads'.
     */
    directory?: string;
    /**
     * Server route to POST uploads to. The default is '/upload'.
     */
    route?: string;
    /**
     * Server route to GET uploads from. The default is '/uploads'.
     */
    publicRoute?: string;
    /**
     * Custom Middleware for the Upload route
     */
    middleware?: import("express").RequestHandler[];
};
/**
 * @typedef {object} MulterUploadConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [directory] Directory files will be uploaded to. The default is 'uploads'.
 * @property {string} [route] Server route to POST uploads to. The default is '/upload'.
 * @property {string} [publicRoute] Server route to GET uploads from. The default is '/uploads'.
 * @property {import('express').RequestHandler[]} [middleware] Custom Middleware for the Upload route
 */
/**
 * Uttori Multer Upload
 * @example <caption>MulterUpload</caption>
 * const content = MulterUpload.storeFile(request);
 * @class
 */
declare class MulterUpload {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>MulterUpload.configKey</caption>
     * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {MulterUploadConfig} The configuration.
     * @example <caption>MulterUpload.defaultConfig()</caption>
     * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
     * @static
     */
    static defaultConfig(): MulterUploadConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, MulterUploadConfig>} config A configuration object.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>} _context Unused.
     * @example <caption>MulterUpload.validateConfig(config, _context)</caption>
     * MulterUpload.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, MulterUploadConfig>, _context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-upload-multer", MulterUploadConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>} context A Uttori-like context.
     * @example <caption>MulterUpload.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [MulterUpload.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * MulterUpload.register(context);
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-upload-multer", MulterUploadConfig>): void;
    /**
     * Add the upload route to the server object.
     * @param {import('express').Application} server An Express server instance.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>} context A Uttori-like context.
     * @example <caption>MulterUpload.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [MulterUpload.configKey]: {
     *       directory: 'uploads',
     *       route: '/upload',
     *     },
     *   },
     * };
     * MulterUpload.bindRoutes(server, context);
     * @static
     */
    static bindRoutes(server: import("express").Application, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-upload-multer", MulterUploadConfig>): void;
    /**
     * The Express route method to process the upload request and provide a response.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler<{}, string, { fullPath: string }>} The function to pass to Express.
     * @example <caption>MulterUpload.upload(context)(request, response, _next)</caption>
     * server.post('/upload', MulterUpload.upload);
     * @static
     */
    static upload(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-upload-multer", MulterUploadConfig>): import("express").RequestHandler<{}, string, {
        fullPath: string;
    }>;
}
//# sourceMappingURL=upload-multer.d.ts.map