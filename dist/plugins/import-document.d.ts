export default ImportDocument;
export type ImportDocumentConfigPage = {
    /**
     * The URL of the page.
     */
    url: string;
    /**
     * The name of the page.
     */
    name: string;
    /**
     * The type of the page.
     */
    type: string;
};
export type ImportDocumentDownload = {
    /**
     * The URL of the page.
     */
    url: string;
    /**
     * The name of the file.
     */
    fileName: string;
    /**
     * The type of the page.
     */
    type: string;
};
export type ImportDocumentProcessPage = {
    /**
     * The content of the page.
     */
    content: string;
    /**
     * The attachments of the page.
     */
    attachments: import("../../src/wiki.js").UttoriWikiDocumentAttachment[];
};
export type ImportDocumentApiPayload = {
    /**
     * The title of the document.
     */
    title: string;
    /**
     * The image of the document.
     */
    image: string;
    /**
     * The excerpt of the document.
     */
    excerpt: string;
    /**
     * The pages of the document.
     */
    pages: ImportDocumentConfigPage[];
    /**
     * The tags of the document.
     */
    tags: string[];
    /**
     * The slug of the document.
     */
    slug: string;
    /**
     * The redirects of the document.
     */
    redirects: string[];
};
export type ImportDocumentConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]>;
    /**
     * The API route for importing documents.
     */
    apiRoute?: string;
    /**
     * Server route to show the import interface.
     */
    publicRoute?: string;
    /**
     * The path to reference uploaded files by.
     */
    uploadPath?: string;
    /**
     * The directory to upload files to.
     */
    uploadDirectory?: string;
    /**
     * When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an empty array don't check at all.
     */
    allowedReferrers?: string[];
    /**
     * A request handler for the interface route.
     */
    interfaceRequestHandler?: (arg0: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-import-document", ImportDocumentConfig>) => import("express").RequestHandler;
    /**
     * A request handler for the API route.
     */
    apiRequestHandler?: (arg0: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-import-document", ImportDocumentConfig>) => import("express").RequestHandler;
    /**
     * Custom Middleware for the API route.
     */
    middlewareApi?: import("express").RequestHandler[];
    /**
     * Custom Middleware for the public route.
     */
    middlewarePublic?: import("express").RequestHandler[];
    /**
     * A function to handle the download.
     */
    downloadFile?: (arg0: ImportDocumentDownload) => Promise<void>;
    /**
     * A function to handle the imported page processing.
     */
    processPage?: (arg0: ImportDocumentConfig, arg1: string, arg2: ImportDocumentConfigPage) => Promise<ImportDocumentProcessPage>;
};
/**
 * @typedef {object} ImportDocumentConfigPage
 * @property {string} url The URL of the page.
 * @property {string} name The name of the page.
 * @property {string} type The type of the page.
 */
/**
 * @typedef {object} ImportDocumentDownload
 * @property {string} url The URL of the page.
 * @property {string} fileName The name of the file.
 * @property {string} type The type of the page.
 */
/**
 * @typedef {object} ImportDocumentProcessPage
 * @property {string} content The content of the page.
 * @property {import('../../src/wiki.js').UttoriWikiDocumentAttachment[]} attachments The attachments of the page.
 */
/**
 * @typedef {object} ImportDocumentApiPayload
 * @property {string} title The title of the document.
 * @property {string} image The image of the document.
 * @property {string} excerpt The excerpt of the document.
 * @property {ImportDocumentConfigPage[]} pages The pages of the document.
 * @property {string[]} tags The tags of the document.
 * @property {string} slug The slug of the document.
 * @property {string[]} redirects The redirects of the document.
 */
/**
 * @typedef {object} ImportDocumentConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [apiRoute] The API route for importing documents.
 * @property {string} [publicRoute] Server route to show the import interface.
 * @property {string} [uploadPath] The path to reference uploaded files by.
 * @property {string} [uploadDirectory] The directory to upload files to.
 * @property {string[]} [allowedReferrers] When not an empty attay, check to see if the current referrer starts with any of the items in this list. When an empty array don't check at all.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): import('express').RequestHandler} [interfaceRequestHandler] A request handler for the interface route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>): import('express').RequestHandler} [apiRequestHandler] A request handler for the API route.
 * @property {import('express').RequestHandler[]} [middlewareApi] Custom Middleware for the API route.
 * @property {import('express').RequestHandler[]} [middlewarePublic] Custom Middleware for the public route.
 * @property {function(ImportDocumentDownload): Promise<void>} [downloadFile] A function to handle the download.
 * @property {function(ImportDocumentConfig, string, ImportDocumentConfigPage): Promise<ImportDocumentProcessPage>} [processPage] A function to handle the imported page processing.
 * @example <caption>ImportDocumentConfig</caption>
 * const config = {
 *   events: {
 *     bindRoutes: ['bind-routes'],
 *     validateConfig: ['validate-config'],
 *   },
 *   middleware: {
 *     apiRoute: [],
 *     publicRoute: [],
 *   },
 *   apiRoute: '/import-api',
 *   publicRoute: '/import',
 *   uploadPath: 'uploads',
 *   uploadDirectory: path.join(__dirname, 'uploads'),
 *   allowedReferrers: [],
 *   apiRequestHandler: (context) => async (request, response, next) => {
 *     debug('apiRequestHandler');
 *     const { title, image, excerpt, pages, tags, slug, redirects } = request.body;
 *     const uploadDir = path.join(config.uploadDirectory, slug);
 *     await fs.promises.mkdir(uploadDir, { recursive: true });
 *     response.status(200).send({ ...document, error: null });
 *   },
 *   interfaceRequestHandler: (context) => async (request, response, next) => {
 *     debug('interfaceRequestHandler');
 *     let viewModel = {
 *       title: 'Import Document',
 *       config: context.config,
 *       session: request.session || {},
 *       slug: 'import-document',
 *       meta: {},
 *       basePath: request.baseUrl,
 *       flash: request.wikiFlash(),
 *     };
 *     viewModel = await context.hooks.filter('view-model-import-document', viewModel, this);
 *     response.set('X-Robots-Tag', 'noindex');
 *     response.render('import', viewModel);
 *   },
 *   middlewareApi: [],
 *   middlewarePublic: [],
 * };
 */
/**
 * Uttori Import Document
 * Imports documents from a variety of sources, including markdown, PDF, and image files.
 * @class
 */
declare class ImportDocument {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>ImportDocument.configKey</caption>
     * const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {ImportDocumentConfig} The configuration.
     * @example <caption>ImportDocument.defaultConfig()</caption>
     * const config = { ...ImportDocument.defaultConfig(), ...context.config[ImportDocument.configKey] };
     * @static
     */
    static defaultConfig(): ImportDocumentConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, ImportDocumentConfig>} config A provided configuration to use.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>} [_context] Unused.
     * @example <caption>ImportDocument.validateConfig(config, _context)</caption>
     * ImportDocument.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, ImportDocumentConfig>, _context?: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-import-document", ImportDocumentConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>} context A Uttori-like context.
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
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-import-document", ImportDocumentConfig>): void;
    /**
     * Add the upload route to the server object.
     * @param {import('express').Application} server An Express server instance.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>} context A Uttori-like context.
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
     * @static
     */
    static bindRoutes(server: import("express").Application, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-import-document", ImportDocumentConfig>): void;
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
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @example <caption>ImportDocument.apiRequestHandler(context)(request, response, _next)</caption>
     * server.post('/chat-api', ImportDocument.apiRequestHandler(context));
     * @static
     */
    static apiRequestHandler(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-import-document", ImportDocumentConfig>): import("express").RequestHandler;
    /**
     * The Express request handler for the interface route.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-import-document', ImportDocumentConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @example <caption>ImportDocument.interfaceRequestHandler(context)(request, response, _next)</caption>
     * server.get('/import', ImportDocument.interfaceRequestHandler(context));
     * @static
     */
    static interfaceRequestHandler(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-import-document", ImportDocumentConfig>): import("express").RequestHandler;
    /**
     * Downloads a file from a URL and saves it to the uploads directory.
     * @param {object} options The options for the download, represents a page
     * @param {string} options.url The URL of the file to download.
     * @param {string} options.fileName The name of the file to save the file to.
     * @param {string} options.type The type of the file to download.
     * @returns {Promise<void>}
     */
    static downloadFile({ url, fileName, type }: {
        url: string;
        fileName: string;
        type: string;
    }): Promise<void>;
    /**
     * Processes a page and returns the content and attachment.
     * @param {ImportDocumentConfig} config The configuration object.
     * @param {string} slug The slug of the document.
     * @param {ImportDocumentConfigPage} page The page to process.
     * @returns {Promise<ImportDocumentProcessPage>} The content and attachments.
     */
    static processPage(config: ImportDocumentConfig, slug: string, page: ImportDocumentConfigPage): Promise<ImportDocumentProcessPage>;
}
//# sourceMappingURL=import-document.d.ts.map