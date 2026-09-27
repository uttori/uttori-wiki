import type { ImportDocumentConfigPage, ImportDocumentProcessConfig, ImportDocumentProcessPage, ImportDocumentConfig } from '../types/plugins/import-document.js';
export type { ImportDocumentConfigPage, ImportDocumentDownload, ImportDocumentDownloadFile, ImportDocumentProcessConfig, ImportDocumentProcessPageFunction, ImportDocumentProcessPage, ImportDocumentApiPayload, ImportDocumentContext, ImportDocumentRequestHandlerFactory, ImportDocumentConfig, ImportDocumentPayload, } from '../types/plugins/import-document.js';
/**
 * Uttori Import Document
 * Imports documents from a variety of sources, including markdown, PDF, and image files.
 */
declare class ImportDocument {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>ImportDocument.configKey</caption>
     * const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
     */
    static get configKey(): 'uttori-plugin-import-document';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>ImportDocument.defaultConfig()</caption>
     * const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<ImportDocumentConfig, 'apiRoute' | 'publicRoute' | 'uploadPath' | 'uploadDirectory' | 'allowedReferrers' | 'middlewarePublic' | 'middlewareApi' | 'downloadFile' | 'processPage' | 'apiRequestHandler' | 'interfaceRequestHandler'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A provided configuration to use.
     * @param [_context] Unused.
     * @example <caption>ImportDocument.validateConfig(config, _context)</caption>
     * ImportDocument.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, ImportDocumentConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>ImportDocument.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [ImportDocument.configKey]: {
     *       ...,
     *       events: {
     *         bindRoutes: ['bind-routes'],
     *       },
     *     },
     *   },
     * };
     * ImportDocument.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): void;
    /**
     * Add the upload route to the server object.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>ImportDocument.bindRoutes(server, context)</caption>
     * const context = {
     *   config: {
     *     [ImportDocument.configKey]: {
     *       middleware: [],
     *       publicRoute: '/download',
     *     },
     *   },
     * };
     * ImportDocument.bindRoutes(server, context);
     */
    static bindRoutes(server: import('express').Application, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): void;
    /**
     * The Express route method to process the upload request and provide a response.
     * Supports both file imports and URL scraping through the pages array.
     *
     * File handling (detected by file extension in page.name):
     * - Markdown files (.md/.markdown): Used directly as content (supports URLs and local paths)
     * - PDF files (.pdf): Stored as attachments (supports URLs and local paths, stub articles only when PDF is the only page)
     * - Image files (.jpg/.jpeg/.png/.gif/.webp/.svg): Stored as attachments (supports URLs and local paths)
     * - Other files: Treated as URLs for web scraping
     *
     * File processing:
     * - All file types support both URLs and local file paths
     * - URLs are downloaded using wget, local files are copied
     * - Provided 'image' parameter (URL) is downloaded to uploads directory
     * - Document image priority: downloaded image > first image page > provided image URL
     *
     * Request body structure:
     * - pages: Array of page objects (files or URLs)
     * - title, image, excerpt, tags, slug, redirects: Document metadata
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>ImportDocument.apiRequestHandler(context)(request, response, _next)</caption>
     * server.post('/chat-api', ImportDocument.apiRequestHandler(context));
     */
    static apiRequestHandler(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): import('express').RequestHandler;
    /**
     * The Express request handler for the interface route.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     * @example <caption>ImportDocument.interfaceRequestHandler(context)(request, response, _next)</caption>
     * server.get('/import', ImportDocument.interfaceRequestHandler(context));
     */
    static interfaceRequestHandler(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): import('express').RequestHandler;
    /**
     * Downloads a file from a URL and saves it to the uploads directory.
     * @param options The options for the download, represents a page
     * @param options.url The URL of the file to download.
     * @param options.fileName The name of the file to save the file to.
     * @param options.type The type of the file to download.
     */
    static downloadFile({ url, fileName, type }: {
        url: string;
        fileName: string;
        type: string;
    }): Promise<void>;
    /**
     * Processes a page and returns the content and attachment.
     * @param config The configuration object.
     * @param slug The slug of the document.
     * @param page The page to process.
     * @returns The content and attachments.
     */
    static processPage(config: ImportDocumentProcessConfig, slug: string, page: ImportDocumentConfigPage): Promise<ImportDocumentProcessPage>;
}
export default ImportDocument;
//# sourceMappingURL=import-document.d.ts.map