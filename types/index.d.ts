/**
 * Creates an instance of UttoriWiki.
 * @example
 * <caption>Init UttoriWiki</caption>
 * const server = express();
 * const wiki = new UttoriWiki(config, server);
 * server.listen(server.get('port'), server.get('ip'), () => { ... });
 * @property config - The configuration object.
 * @property hooks - The hook / event dispatching object.
 * @property server - The Express server instance (only exposed when testing).
 * @param config - A configuration object.
 * @param server - The Express server instance.
 */
declare class UttoriWiki {
    constructor(config: any, server: any);
    /**
     * Registers plugins with the Event Dispatcher.
     * @param config - A configuration object.
     * @param config.plugins - A collection of plugins to register.
     */
    registerPlugins(config: {
        plugins: object[];
    }): void;
    /**
     * Validates the config.
     *
     * Hooks:
     * - `dispatch` - `validate-config` - Passes in the config object.
     * @param config - A configuration object.
     * @param config.theme_dir - The path to the theme directory.
     * @param config.public_dir - The path to the public facing directory.
     */
    validateConfig(config: {
        theme_dir: string;
        public_dir: string;
    }): void;
    /**
     * Builds the metadata for the view model.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the meta description.
     * @example
     * const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
     * ➜ {
     * ➜   canonical,   // `${this.config.site_url}/private-document-path`
     * ➜   description, // document.excerpt ? `${document.content.slice(0, 160)}`
     * ➜   image,       // '' unless augmented via Plugin
     * ➜   modified,    // new Date(document.updateDate).toISOString()
     * ➜   published,   // new Date(document.createDate).toISOString()
     * ➜   robots,      // 'no-index'
     * ➜   title,       // document.title ? this.config.site_title
     * ➜ }
     * @param [document = {}] - A configuration object.
     * @param document.excerpt - The meta description to be used.
     * @param document.content - The document content to be used as a backup meta description when excerpt is not provided.
     * @param document.updateDate - The Unix timestamp of the last update date to the document.
     * @param document.createDate - The Unix timestamp of the creation date of the document.
     * @param document.title - The document title to be used in meta data.
     * @param [path = ''] - The URL path to build meta data for.
     * @param [robots = ''] - A meta robots tag value.
     * @returns Metadata object.
     */
    buildMetadata(document?: {
        excerpt: string;
        content: string;
        updateDate: number;
        createDate: number;
        title: string;
    }, path?: string, robots?: string): Promise<object>;
    /**
     * Bind the routes to the server.
     * Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All
     *
     * Hooks:
     * - `dispatch` - `bind-routes` - Passes in the server instance.
     * @param server - The Express server instance.
     */
    bindRoutes(server: any): void;
    /**
     * Renders the homepage with the `home` template.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the home-page content.
     * - `filter` - `view-model-home` - Passes in the viewModel.
     * @param _request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    home(_request: Request, response: Response, next: (...params: any[]) => any): void;
    /**
     * Redirects to the homepage.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param _next - The Express Next function.
     */
    homepageRedirect(request: any, response: any, _next: (...params: any[]) => any): void;
    /**
     * Renders the tag index page with the `tags` template.
     *
     * Hooks:
     * - `filter` - `view-model-tag-index` - Passes in the viewModel.
     * @param _request - The Express Request object.
     * @param response - The Express Response object.
     * @param _next - The Express Next function.
     */
    tagIndex(_request: any, response: any, _next: (...params: any[]) => any): void;
    /**
     * Renders the tag detail page with `tag` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-tag` - Passes in the viewModel.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    tag(request: any, response: any, next: (...params: any[]) => any): void;
    /**
     * Renders the search page using the `search` template.
     *
     * Hooks:
     * - `filter` - `render-search-results` - Passes in the search results.
     * - `filter` - `view-model-search` - Passes in the viewModel.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param _next - The Express Next function.
     */
    search(request: any, response: any, _next: (...params: any[]) => any): void;
    /**
     * Renders the edit page using the `edit` template.
     *
     * Hooks:
     * - `filter` - `view-model-edit` - Passes in the viewModel.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    edit(request: any, response: any, next: (...params: any[]) => any): void;
    /**
     * Attempts to delete a document and redirect to the homepage.
     * If the config `use_delete_key` value is true, the key is verified before deleting.
     *
     * Hooks:
     * - `dispatch` - `document-delete` - Passes in the document beind deleted.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    delete(request: any, response: any, next: (...params: any[]) => any): void;
    /**
     * Attempts to save the document and redirects to the detail view of that document when successful.
     *
     * Hooks:
     * - `validate` - `validate-save` - Passes in the request.
     * - `dispatch` - `validate-invalid` - Passes in the request.
     * - `dispatch` - `validate-valid` - Passes in the request.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    save(request: any, response: any, next: (...params: any[]) => any): void;
    /**
     * Renders the new page using the `edit` template.
     *
     * Hooks:
     * - `filter` - `view-model-new` - Passes in the viewModel.
     * @param _request - The Express Request object.
     * @param response - The Express Response object.
     * @param _next - The Express Next function.
     */
    new(_request: any, response: any, _next: (...params: any[]) => any): void;
    /**
     * Renders the detail page using the `detail` template.
     *
     * Hooks:
     * - `render-content` - `render-content` - Passes in the document content.
     * - `filter` - `view-model-detail` - Passes in the viewModel.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    detail(request: any, response: any, next: (...params: any[]) => any): void;
    /**
     * Renders the history index page using the `history_index` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-history-index` - Passes in the viewModel.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    historyIndex(request: any, response: any, next: (...params: any[]) => any): void;
    /**
     * Renders the history detail page using the `detail` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `render-content` - `render-content` - Passes in the document content.
     * - `filter` - `view-model-history-index` - Passes in the viewModel.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    historyDetail(request: any, response: any, next: (...params: any[]) => any): void;
    /**
     * Renders the history restore page using the `edit` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-history-restore` - Passes in the viewModel.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param next - The Express Next function.
     */
    historyRestore(request: any, response: any, next: (...params: any[]) => any): void;
    /**
     * Renders the 404 Not Found page using the `404` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-error-404` - Passes in the viewModel.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param _next - The Express Next function.
     */
    notFound(request: any, response: any, _next: (...params: any[]) => any): void;
    /**
     * Handles saving documents, and changing the slug of documents, the redirecting to the document.
     *
     * Hooks:
     * - `filter` - `document-save` - Passes in the document.
     * @param request - The Express Request object.
     * @param response - The Express Response object.
     * @param _next - The Express Next function.
     */
    saveValid(request: any, response: any, _next: (...params: any[]) => any): void;
    /**
     * Returns the site sections from the configuration with their tagged document count.
     * @example
     * wiki.getSiteSections();
     * ➜ [{ title: 'Example', description: 'Example description text.', tag: 'example', documentCount: 10 }]
     * @returns Promise object that resolves to the array of site sections.
     */
    getSiteSections(): Promise<any[]>;
    /**
     * Returns the documents with the provided tag, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignore_slugs` array.
     * @example
     * wiki.getTaggedDocuments('example', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
     * @param tag - The tag to look for in documents.
     * @param limit - The maximum number of documents to be returned.
     * @returns Promise object that resolves to the array of the documents.
     */
    getTaggedDocuments(tag: string, limit?: number): Promise<any[]>;
    /**
     * Returns the documents that match the provided query string, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignore_slugs` array.
     * @example
     * wiki.getSearchResults('needle', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Haystack neelde haystack.', tags: ['example'] }]
     * @param query - The query to look for in documents.
     * @param limit - The maximum number of documents to be returned.
     * @returns Promise object that resolves to the array of the documents.
     */
    getSearchResults(query: string, limit: number): Promise<any[]>;
    /**
     * The configuration object.
    */
    config: any;
    /**
     * The hook / event dispatching object.
    */
    hooks: EventDispatcher;
    /**
     * The Express server instance (only exposed when testing).
    */
    server: any;
}

