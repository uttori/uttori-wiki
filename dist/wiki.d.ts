import type { UttoriWikiBuildViewModelBaseOptions, UttoriWikiBaseViewModel, UttoriWikiDocument, UttoriWikiDocumentMetaData } from './types/wiki.js';
export type { UttoriWikiViewModel, UttoriWikiBuildViewModelBaseOptions, UttoriWikiBaseViewModel, UttoriWikiDocument, UttoriWikiDocumentAttachment, UttoriWikiDocumentMetaData, } from './types/wiki.js';
/**
 * Normalize an Express route parameter to a single string.
 * @param value The route parameter value.
 * @returns The normalized route parameter.
 */
export declare const routeParamToString: (value: string | string[] | undefined) => string;
/**
 * UttoriWiki is a fast, simple, wiki knowledge base.
 * @example <caption>Init UttoriWiki</caption>
 * const server = express();
 * const wiki = new UttoriWiki(config, server);
 * server.listen(server.get('port'), server.get('ip'), () => { ... });
 */
declare class UttoriWiki {
    /** User configuration merged with wiki defaults before plugins register. */
    config: import('./config.js').UttoriWikiConfig;
    /** Event dispatcher owned by this wiki instance and shared with its plugins. */
    hooks: import('@uttori/event-dispatcher').EventDispatcher;
    /**
     * Creates an instance of UttoriWiki.
     * @param config A configuration object.
     * @param server The Express server instance.
     */
    constructor(config: import('./config.js').UttoriWikiConfig, server: import('express').Application);
    /**
     * Registers plugins with the Event Dispatcher.
     * @param config A configuration object.
     */
    registerPlugins(config: import('./config.js').UttoriWikiConfig): void;
    /**
     * Validates the config.
     *
     * Hooks:
     * - `dispatch` - `validate-config` - Passes in the config object.
     * @param config A configuration object.
     */
    validateConfig(config: import('./config.js').UttoriWikiConfig): void;
    /**
     * Builds the metadata for the view model.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the meta description.
     * @async
     * @param document A UttoriWikiDocument.
     * @param [path] The URL path to build meta data for with leading slash.
     * @param [robots] A meta robots tag value.
     * @returns Metadata object.
     * @example
     * const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
     * ➜ {
     *   canonical, // `${this.config.publicUrl}/private-document-path`
     *   robots, // 'no-index'
     *   title, // document.title
     *   description, // document.excerpt || document.content.slice(0, 160)
     *   modified, // new Date(document.updateDate).toISOString()
     *   published, // new Date(document.createDate).toISOString()
     * }
     */
    buildMetadata(document: Partial<UttoriWikiDocument>, path?: string, robots?: string): Promise<UttoriWikiDocumentMetaData>;
    /**
     * Builds the base view model object for all routes.
     * @param request The Express Request object.
     * @param [options] Base view model values.
     * @returns Base view model.
     */
    buildViewModelBase(request: import('express').Request, options?: UttoriWikiBuildViewModelBaseOptions): UttoriWikiBaseViewModel;
    /**
     * Bind the routes to the server.
     * Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All
     *
     * Hooks:
     * - `dispatch` - `bind-routes` - Passes in the server instance.
     * @param server The Express server instance.
     */
    bindRoutes(server: import('express').Application): void;
    /**
     * Renders the homepage with the `home` template.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the home-page content.
     * - `filter` - `view-model-home` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    home: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Redirects to the homepage.
     *
     */
    homepageRedirect: import('express').RequestHandler;
    /**
     * Renders the search page using the `search` template.
     *
     * Hooks:
     * - `filter` - `render-search-results` - Passes in the search results.
     * - `filter` - `view-model-search` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    search: (request: import('express').Request<Record<string, never>, Record<string, never>, Record<string, never>, {
        s: string;
    }>, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the edit page using the `edit` template.
     *
     * Hooks:
     * - `filter` - `view-model-edit` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    edit: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Attempts to delete a document and redirect to the homepage.
     * If the config `useDeleteKey` value is true, the key is verified before deleting.
     *
     * Hooks:
     * - `dispatch` - `document-delete` - Passes in the document beind deleted.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    delete: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Attempts to update an existing document and redirects to the detail view of that document when successful.
     *
     * Hooks:
     * - `validate` - `validate-save` - Passes in the request.
     * - `dispatch` - `validate-invalid` - Passes in the request.
     * - `dispatch` - `validate-valid` - Passes in the request.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    save: (request: import('express').Request<import('./custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Attempts to save a new document and redirects to the detail view of that document when successful.
     *
     * Hooks:
     * - `validate` - `validate-save` - Passes in the request.
     * - `dispatch` - `validate-invalid` - Passes in the request.
     * - `dispatch` - `validate-valid` - Passes in the request.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    saveNew: (request: import('express').Request<import('./custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the creation page using the `edit` template.
     *
     * Hooks:
     * - `filter` - `view-model-new` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    create: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the detail page using the `detail` template.
     *
     * Hooks:
     * - `fetch` - `storage-get` - Get the requested content from the storage.
     * - `filter` - `render-content` - Passes in the document content.
     * - `filter` - `view-model-detail` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    detail: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the a preview of the passed in content.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the request body content.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    preview: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the history index page using the `history_index` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-history-index` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    historyIndex: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the history detail page using the `detail` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `render-content` - Passes in the document content.
     * - `fetch` - `storage-get-revision` - Loads the requested revision (and the prior revision when diffing the newest).
     * - `fetch` - `storage-get` - Loads the live document for comparison when the requested revision is not the newest.
     * - `fetch` - `storage-get-history` - Lists revisions to detect the newest and choose a diff baseline.
     * - `filter` - `view-model-history-detail` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    historyDetail: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the history restore page using the `edit` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-history-restore` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    historyRestore: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
    /**
     * Renders the 404 Not Found page using the `404` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     *
     * Hooks:
     * - `filter` - `view-model-error-404` - Passes in the viewModel.
     * @async
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    notFound: (request: import('express').Request, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
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
     * @param request The Express Request object.
     * @param response The Express Response object.
     * @param next The Express Next function.
     */
    saveValid: (request: import('express').Request<import('./custom.js').SaveParams, Record<string, never>, UttoriWikiDocument>, response: import('express').Response, next: import('express').NextFunction) => Promise<void>;
}
export default UttoriWiki;
//# sourceMappingURL=wiki.d.ts.map