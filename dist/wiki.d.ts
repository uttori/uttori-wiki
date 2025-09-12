export default UttoriWiki;
export type UttoriWikiDocument = {
    /**
     * The document slug to be used in the URL and as a unique ID.
     */
    slug: string;
    /**
     * The document title to be used anywhere a title may be needed.
     */
    title: string;
    /**
     * An image to represent the document in Open Graph or elsewhere.
     */
    image?: string;
    /**
     * A succinct deescription of the document, think meta description.
     */
    excerpt?: string;
    /**
     * All text content for the doucment.
     */
    content: string;
    /**
     * All rendered HTML content for the doucment that will be presented to the user.
     */
    html?: string;
    /**
     * The Unix timestamp of the creation date of the document.
     */
    createDate: number;
    /**
     * The Unix timestamp of the last update date to the document.
     */
    updateDate: number;
    /**
     * A collection of tags that represent the document.
     */
    tags: string | string[];
    /**
     * An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks.
     */
    redirects?: string | string[];
    /**
     * The layout to use when rendering the document.
     */
    layout?: string;
    /**
     * An array of attachments to the document with name being a display name, path being the path to the file, and type being the MIME type of the file. Useful for storing files like PDFs, images, etc.
     */
    attachments?: UttoriWikiDocumentAttachment[];
};
export type UttoriWikiDocumentAttachment = {
    /**
     * The display name of the attachment.
     */
    name: string;
    /**
     * The path to the attachment.
     */
    path: string;
    /**
     * The MIME type of the attachment.
     */
    type: string;
};
/**
 * @typedef UttoriWikiDocument
 * @type {object}
 * @property {string} slug The document slug to be used in the URL and as a unique ID.
 * @property {string} title The document title to be used anywhere a title may be needed.
 * @property {string} [image] An image to represent the document in Open Graph or elsewhere.
 * @property {string} [excerpt] A succinct deescription of the document, think meta description.
 * @property {string} content All text content for the doucment.
 * @property {string} [html] All rendered HTML content for the doucment that will be presented to the user.
 * @property {number} createDate The Unix timestamp of the creation date of the document.
 * @property {number} updateDate The Unix timestamp of the last update date to the document.
 * @property {string|string[]} tags A collection of tags that represent the document.
 * @property {string|string[]} [redirects] An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks.
 * @property {string} [layout] The layout to use when rendering the document.
 * @property {UttoriWikiDocumentAttachment[]} [attachments] An array of attachments to the document with name being a display name, path being the path to the file, and type being the MIME type of the file. Useful for storing files like PDFs, images, etc.
 */
/**
 * @typedef UttoriWikiDocumentAttachment
 * @type {object}
 * @property {string} name The display name of the attachment.
 * @property {string} path The path to the attachment.
 * @property {string} type The MIME type of the attachment.
 */
/**
 * UttoriWiki is a fast, simple, wiki knowledge base.
 * @property {import('./config.js').UttoriWikiConfig} config - The configuration object.
 * @property {import('@uttori/event-dispatcher').EventDispatcher} hooks - The hook / event dispatching object.
 * @example <caption>Init UttoriWiki</caption>
 * const server = express();
 * const wiki = new UttoriWiki(config, server);
 * server.listen(server.get('port'), server.get('ip'), () => { ... });
 * @class
 */
declare class UttoriWiki {
    /**
     * Creates an instance of UttoriWiki.
     * @param {import('./config.js').UttoriWikiConfig} config - A configuration object.
     * @param {import('express').Application} server - The Express server instance.
     * @class
     */
    constructor(config: import("./config.js").UttoriWikiConfig, server: import("express").Application);
    /** @type {import('./config.js').UttoriWikiConfig} */
    config: import("./config.js").UttoriWikiConfig;
    /** @type {import('@uttori/event-dispatcher').EventDispatcher} */
    hooks: import("@uttori/event-dispatcher").EventDispatcher;
    /**
     * Registers plugins with the Event Dispatcher.
     * @param {import('./config.js').UttoriWikiConfig} config - A configuration object.
     */
    registerPlugins(config: import("./config.js").UttoriWikiConfig): void;
    /**
     * Validates the config.
     *
     * Hooks:
     * - `dispatch` - `validate-config` - Passes in the config object.
     * @param {import('./config.js').UttoriWikiConfig} config A configuration object.
     */
    validateConfig(config: import("./config.js").UttoriWikiConfig): void;
    /**
     * @typedef {object} UttoriWikiDocumentMetaData
     * @property {string} canonical `${this.config.publicUrl}/private-document-path`
     * @property {string} robots 'no-index'
     * @property {string} title document.title
     * @property {string} description document.excerpt || document.content.slice(0, 160)
     * @property {string} modified new Date(document.updateDate).toISOString()
     * @property {string} published new Date(document.createDate).toISOString()
     * @property {string} image OpenGraph Image
     */
    /**
     * Builds the metadata for the view model.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the meta description.
     * @async
     * @param {Partial<UttoriWikiDocument>} document A UttoriWikiDocument.
     * @param {string} [path] The URL path to build meta data for with leading slash.
     * @param {string} [robots] A meta robots tag value.
     * @returns {Promise<UttoriWikiDocumentMetaData>} Metadata object.
     * @example
     * const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
     * ➜ {
     *   canonical,   // `${this.config.publicUrl}/private-document-path`
     *   robots,      // 'no-index'
     *   title,       // document.title
     *   description, // document.excerpt || document.content.slice(0, 160)
     *   modified,    // new Date(document.updateDate).toISOString()
     *   published,   // new Date(document.createDate).toISOString()
     * }
     */
    buildMetadata(document: Partial<UttoriWikiDocument>, path?: string, robots?: string): Promise<{
        /**
         * `${this.config.publicUrl}/private-document-path`
         */
        canonical: string;
        /**
         * 'no-index'
         */
        robots: string;
        /**
         * document.title
         */
        title: string;
        /**
         * document.excerpt || document.content.slice(0, 160)
         */
        description: string;
        /**
         * new Date(document.updateDate).toISOString()
         */
        modified: string;
        /**
         * new Date(document.createDate).toISOString()
         */
        published: string;
        /**
         * OpenGraph Image
         */
        image: string;
    }>;
    /**
     * Bind the routes to the server.
     * Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All
     *
     * Hooks:
     * - `dispatch` - `bind-routes` - Passes in the server instance.
     * @param {import('express').Application} server The Express server instance.
     */
    bindRoutes(server: import("express").Application): void;
    /**
     * Renders the homepage with the `home` template.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the home-page content.
     * - `filter` - `view-model-home` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    home: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Redirects to the homepage.
     * @type {import('express').RequestHandler}
     */
    homepageRedirect: import("express").RequestHandler;
    /**
     * Renders the tag index page with the `tags` template.
     *
     * Hooks:
     * - `filter` - `view-model-tag-index` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    tagIndex: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the tag detail page with `tag` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     * Attempts to pull in the relevant site section for the tag if defined in the config site sections.
     *
     * Hooks:
     * - `filter` - `view-model-tag` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    tag: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the search page using the `search` template.
     *
     * Hooks:
     * - `filter` - `render-search-results` - Passes in the search results.
     * - `filter` - `view-model-search` - Passes in the viewModel.
     * @async
     * @param {import('express').Request<{}, {}, {}, { s: string }>} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    search: (request: import("express").Request<{}, {}, {}, {
        s: string;
    }>, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the edit page using the `edit` template.
     *
     * Hooks:
     * - `filter` - `view-model-edit` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    edit: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Attempts to delete a document and redirect to the homepage.
     * If the config `useDeleteKey` value is true, the key is verified before deleting.
     *
     * Hooks:
     * - `dispatch` - `document-delete` - Passes in the document beind deleted.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    delete: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Attempts to update an existing document and redirects to the detail view of that document when successful.
     *
     * Hooks:
     * - `validate` - `validate-save` - Passes in the request.
     * - `dispatch` - `validate-invalid` - Passes in the request.
     * - `dispatch` - `validate-valid` - Passes in the request.
     * @async
     * @param {import('express').Request<import('../dist/custom.d.ts').SaveParams, {}, UttoriWikiDocument>} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    save: (request: import("express").Request<import("../dist/custom.d.ts").SaveParams, {}, UttoriWikiDocument>, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Attempts to save a new document and redirects to the detail view of that document when successful.
     *
     * Hooks:
     * - `validate` - `validate-save` - Passes in the request.
     * - `dispatch` - `validate-invalid` - Passes in the request.
     * - `dispatch` - `validate-valid` - Passes in the request.
     * @async
     * @param {import('express').Request<import('../dist/custom.js').SaveParams, {}, UttoriWikiDocument>} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    saveNew: (request: import("express").Request<import("../dist/custom.js").SaveParams, {}, UttoriWikiDocument>, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the creation page using the `edit` template.
     *
     * Hooks:
     * - `filter` - `view-model-new` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    create: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the detail page using the `detail` template.
     *
     * Hooks:
     * - `fetch` - `storage-get` - Get the requested content from the storage.
     * - `filter` - `render-content` - Passes in the document content.
     * - `filter` - `view-model-detail` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    detail: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the a preview of the passed in content.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `render-content` - `render-content` - Passes in the request body content.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    preview: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the history index page using the `history_index` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-history-index` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    historyIndex: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the history detail page using the `detail` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `render-content` - `render-content` - Passes in the document content.
     * - `filter` - `view-model-history-index` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    historyDetail: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the history restore page using the `edit` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-history-restore` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    historyRestore: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Renders the 404 Not Found page using the `404` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-error-404` - Passes in the viewModel.
     * @async
     * @param {import('express').Request} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    notFound: (request: import("express").Request, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Handles saving documents, and changing the slug of documents, then redirecting to the document.
     *
     * `title`, `excerpt`, and `content` will default to a blank string
     * `tags` is expected to be a comma delimited string in the request body, "tag-1,tag-2"
     * `slug` will be converted to lowercase and will use `request.body.slug` and fall back to `request.params.slug`.
     *
     * Hooks:
     * - `filter` - `document-save` - Passes in the document.
     * @async
     * @param {import('express').Request<import('../dist/custom.js').SaveParams, {}, UttoriWikiDocument>} request The Express Request object.
     * @param {import('express').Response} response The Express Response object.
     * @param {import('express').NextFunction} next The Express Next function.
     */
    saveValid: (request: import("express").Request<import("../dist/custom.js").SaveParams, {}, UttoriWikiDocument>, response: import("express").Response, next: import("express").NextFunction) => Promise<void>;
    /**
     * Returns the documents with the provided tag, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
     *
     * Hooks:
     * - `fetch` - `storage-query` - Searched for the tagged documents.
     * @async
     * @param {string} tag The tag to look for in documents.
     * @param {number} [limit] The maximum number of documents to be returned.
     * @returns {Promise<UttoriWikiDocument[]>} Promise object that resolves to the array of the documents.
     * @example
     * wiki.getTaggedDocuments('example', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
     */
    getTaggedDocuments: (tag: string, limit?: number) => Promise<UttoriWikiDocument[]>;
}
//# sourceMappingURL=wiki.d.ts.map
