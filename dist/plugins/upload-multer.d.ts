import type { MulterUploadConfig } from '../types/plugins/upload-multer.js';
export type { MulterUploadConfig } from '../types/plugins/upload-multer.js';
/**
 * Uttori Multer Upload
 * @example <caption>MulterUpload</caption>
 * const content = MulterUpload.storeFile(request);
 */
declare class MulterUpload {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>MulterUpload.configKey</caption>
     * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
     */
    static get configKey(): 'uttori-plugin-upload-multer';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>MulterUpload.defaultConfig()</caption>
     * const config = { ...MulterUpload.defaultConfig(), ...context.config[MulterUpload.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<MulterUploadConfig, 'directory' | 'route' | 'publicRoute' | 'middleware' | 'allowedMimeTypes' | 'maxFileSize'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context Unused.
     * @example <caption>MulterUpload.validateConfig(config, _context)</caption>
     * MulterUpload.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, MulterUploadConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
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
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>): void;
    /**
     * Add the upload route to the server object.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
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
     */
    static bindRoutes(server: import('express').Application, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>): void;
    /**
     * The Express route method to process the upload request and provide a response.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>MulterUpload.upload(context)(request, response, _next)</caption>
     * server.post('/upload', MulterUpload.upload);
     */
    static upload(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-upload-multer', MulterUploadConfig>): import('express').RequestHandler<Record<string, never>, string, {
        fullPath: string;
    }>;
}
export default MulterUpload;
//# sourceMappingURL=upload-multer.d.ts.map