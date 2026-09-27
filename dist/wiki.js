import { createDebug } from './debug.js';
import { htmlTable } from '@uttori/data-tools/diff/textdiff';
import { EventDispatcher } from '@uttori/event-dispatcher';
import crypto from 'node:crypto';
import express from 'express';
import defaultConfig from './config.js';
import { buildPath } from './redirect.js';
import { sanitizeSearchQuery, sanitizeSlug } from './plugins/utilities/security.js';
const debug = createDebug('Uttori.Wiki');
const escapeQueryValue = (value = '') => JSON.stringify(String(value)).slice(1, -1);
/**
 * Normalize an Express route parameter to a single string.
 * @param value The route parameter value.
 * @returns The normalized route parameter.
 */
export const routeParamToString = (value) => (Array.isArray(value) ? value[0] ?? '' : value ?? '');
/**
 * Normalize Express route parameters to the string-only shape used by redirects.
 * @param params The Express route parameters.
 * @returns The normalized route parameters.
 */
const normalizeRouteParams = (params) => Object.fromEntries(Object.entries(params).map(([key, value]) => [key, routeParamToString(value)]));
/**
 * Normalize attachment metadata and ensure every attachment has an ID.
 * @param rawAttachments The request-provided attachment value.
 * @returns Normalized attachments.
 */
const normalizeAttachments = (rawAttachments) => {
    if (!Array.isArray(rawAttachments)) {
        return [];
    }
    const attachments = rawAttachments;
    return attachments.map((attachment) => {
        if (!attachment.id) {
            attachment.id = crypto.randomUUID();
        }
        if (typeof attachment?.metadata === 'string') {
            try {
                attachment.metadata = JSON.parse(attachment.metadata);
            }
            catch (error) {
                attachment.metadata = {};
                debug('Error parsing attachment metadata, setting to empty object:', error);
            }
        }
        if (typeof attachment.metadata !== 'object') {
            attachment.metadata = {};
        }
        return attachment;
    });
};
/**
 * Resolve an image reference against document attachments by ID, then by path.
 * @param image The requested image ID or path.
 * @param attachments The document attachments.
 * @returns The matching attachment.
 */
const resolveImageAttachment = (image, attachments) => attachments.find((att) => att.id === image) ?? attachments.find((att) => att.path === image);
/**
 * Check whether an attachment has an image MIME type.
 * @param attachment The attachment to test.
 * @returns Whether the attachment is an image.
 */
const isImageAttachment = (attachment) => typeof attachment?.type === 'string' && attachment.type.toLowerCase().startsWith('image/');
/**
 * UttoriWiki is a fast, simple, wiki knowledge base.
 * @example <caption>Init UttoriWiki</caption>
 * const server = express();
 * const wiki = new UttoriWiki(config, server);
 * server.listen(server.get('port'), server.get('ip'), () => { ... });
 */
class UttoriWiki {
    /**
     * Creates an instance of UttoriWiki.
     * @param config A configuration object.
     * @param server The Express server instance.
     */
    constructor(config, server) {
        debug('Contructing...');
        if (!config) {
            const error = 'No config provided.';
            debug(error);
            throw new Error(error);
        }
        if (!server) {
            const error = 'No server provided.';
            debug(error);
            throw new Error(error);
        }
        // Initialize configuration with defaults applied and overwritten with passed in custom values.
        this.config = { ...defaultConfig, ...config };
        // Instantiate the event bus / event dispatcher / hooks systems, as we will need it for every other step.
        this.hooks = new EventDispatcher();
        // Register any plugins found in the configuration.
        this.registerPlugins(this.config);
        // Validate the configuration and allow plugins to validate their own configruation.
        this.validateConfig(this.config);
        // Bind Express routes.
        this.bindRoutes(server);
    }
    /**
     * Registers plugins with the Event Dispatcher.
     * @param config A configuration object.
     */
    registerPlugins(config) {
        if (!config.plugins || !Array.isArray(config.plugins) || config.plugins.length <= 0) {
            debug('No plugins configuration provided or plugins is not an Array, skipping.');
            return;
        }
        debug('Registering Plugins: ', config.plugins.length);
        for (const plugin of config.plugins) {
            // A plugin that did not register can leave read and render hooks absent.
            // Failing here is safer than exporting an apparently empty wiki.
            plugin.register(this);
        }
        debug('Registered Plugins');
    }
    /**
     * Validates the config.
     *
     * Hooks:
     * - `dispatch` - `validate-config` - Passes in the config object.
     * @param config A configuration object.
     */
    validateConfig(config) {
        debug('Validating config...');
        if (typeof config.themePath !== 'string') {
            throw new TypeError('No themePath provided.');
        }
        if (typeof config.publicPath !== 'string') {
            throw new TypeError('No publicPath provided.');
        }
        if (config.useDeleteKey && !config.deleteKey) {
            throw new TypeError('Using useDeleteKey verification but no deleteKey value set.');
        }
        if (config.useEditKey && !config.editKey) {
            throw new TypeError('Using useEditKey verification but no editKey value set.');
        }
        this.hooks.dispatch('validate-config', config, this);
        debug('Validated config.');
    }
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
    async buildMetadata(document, path = '', robots = '') {
        let canonicalPath = path.trim();
        // Mounted wikis opt into their public prefix and trailing slash here. Keep
        // legacy canonical paths unchanged when neither option is configured.
        if (this.config.canonicalPathPrefix || this.config.canonicalTrailingSlash) {
            const prefix = this.config.canonicalPathPrefix?.replace(/^\/+|\/+$/g, '') || '';
            canonicalPath = `/${[prefix, canonicalPath.replace(/^\/+|\/+$/g, '')].filter(Boolean).join('/')}`;
            if (this.config.canonicalTrailingSlash && !canonicalPath.endsWith('/')) {
                canonicalPath += '/';
            }
        }
        const canonical = `${this.config.publicUrl}${canonicalPath}`;
        let title = '';
        let description = '';
        let modified = '';
        let published = '';
        let image = '';
        if (document) {
            description = document.excerpt ? document.excerpt : '';
            if (document.content && !description) {
                description = document.content.slice(0, 160);
                description = await this.hooks.filter('render-content', description, this);
            }
            modified = document.updateDate ? new Date(document.updateDate).toISOString() : '';
            published = document.createDate ? new Date(document.createDate).toISOString() : '';
            title = document.title ? document.title : '';
            // Handle image as an ID reference to an attachment
            if (document.image && document.attachments && Array.isArray(document.attachments)) {
                const imageAttachment = document.attachments.find((att) => att.id === document.image);
                if (imageAttachment && imageAttachment.path) {
                    image = imageAttachment.path;
                }
            }
        }
        let metadata = {
            canonical,
            robots,
            title,
            description,
            modified,
            published,
            image,
        };
        metadata = await this.hooks.filter('view-model-metadata', metadata, this);
        return metadata;
    }
    /**
     * Builds the base view model object for all routes.
     * @param request The Express Request object.
     * @param [options] Base view model values.
     * @returns Base view model.
     */
    buildViewModelBase(request, options = {}) {
        const { title = '', meta, slug } = options;
        const requestSlug = routeParamToString(request.params?.slug);
        return {
            title,
            config: this.config,
            session: request.session,
            meta,
            basePath: request.baseUrl,
            flash: request?.wikiFlash?.() || {},
            slug: typeof slug === 'string' ? slug : requestSlug,
        };
    }
    /**
     * Bind the routes to the server.
     * Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All
     *
     * Hooks:
     * - `dispatch` - `bind-routes` - Passes in the server instance.
     * @param server The Express server instance.
     */
    bindRoutes(server) {
        debug('Binding routes...');
        const router = express.Router();
        // Home
        router.get('/', this.config.routeMiddleware.home, this.home);
        router.get(`/${this.config.homePage}`, this.config.routeMiddleware.home, this.homepageRedirect);
        // Search
        debug('Binding search route:', `/${this.config.routes.search}`);
        router.get(`/${this.config.routes.search}`, this.config.routeMiddleware.search, this.search);
        // Tags - handled by plugin
        // Not Found Placeholder
        router.head('/404', this.config.routeMiddleware.notFound, this.notFound);
        router.get('/404', this.config.routeMiddleware.notFound, this.notFound);
        router.delete('/404', this.config.routeMiddleware.notFound, this.notFound);
        router.patch('/404', this.config.routeMiddleware.notFound, this.notFound);
        router.put('/404', this.config.routeMiddleware.notFound, this.notFound);
        router.post('/404', this.config.routeMiddleware.notFound, this.notFound);
        // Document CRUD / Admin
        if (this.config.allowCRUDRoutes) {
            router.get('/new/:key', this.config.routeMiddleware.create, this.create);
            router.get('/new', this.config.routeMiddleware.create, this.create);
            router.post('/new/:key', this.config.routeMiddleware.saveNew, this.saveNew);
            router.post('/new', this.config.routeMiddleware.saveNew, this.saveNew);
            router.post('/preview', this.config.routeMiddleware.preview, this.preview);
            router.get('/:slug/edit/:key', this.config.routeMiddleware.edit, this.edit);
            router.get('/:slug/edit', this.config.routeMiddleware.edit, this.edit);
            router.get('/:slug/delete/:key', this.config.routeMiddleware.delete, this.delete);
            router.get('/:slug/delete', this.config.routeMiddleware.delete, this.delete);
            // Save endpoints must share the CRUD gate with their edit forms.
            router.post('/:slug/save/:key', this.config.routeMiddleware.save, this.save);
            router.post('/:slug/save', this.config.routeMiddleware.save, this.save);
            router.put('/:slug/save/:key', this.config.routeMiddleware.save, this.save);
            router.put('/:slug/save', this.config.routeMiddleware.save, this.save);
        }
        // Document History
        if (this.config.publicHistory) {
            router.get('/:slug/history', this.config.routeMiddleware.historyIndex, this.historyIndex);
            router.get('/:slug/history/:revision', this.config.routeMiddleware.historyDetail, this.historyDetail);
            router.get('/:slug/history/:revision/restore', this.config.routeMiddleware.historyRestore, this.historyRestore);
        }
        else {
            router.get('/:slug/history', this.config.routeMiddleware.historyIndex, this.notFound);
            router.get('/:slug/history/:revision', this.config.routeMiddleware.historyDetail, this.notFound);
            router.get('/:slug/history/:revision/restore', this.config.routeMiddleware.historyRestore, this.notFound);
        }
        // Handle Redirects
        for (const redirect of this.config?.redirects ?? []) {
            debug('Redirect:', redirect);
            const { route, target, status = 301, appendQueryString = true } = redirect;
            if (!route || !target) {
                debug('Missing route or target, skipping.');
                continue;
            }
            router.all(route, (request, response, next) => {
                // Build the new path from the route and target using the request params.
                let path = buildPath(normalizeRouteParams(request.params), route, target);
                debug('Redirecting to:', path);
                // Append query string if needed
                if (appendQueryString && request.url.includes('?')) {
                    path += request.url.slice(request.url.indexOf('?'));
                }
                // Redirect to the new path if it is different from the current path
                if (path !== request.url) {
                    debug('Redirecting to:', path);
                    response.status(status).redirect(path);
                    return;
                }
                /* c8 ignore next */
                next();
            });
        }
        // Allow plugins to register routes before the /:slug catch-all so their
        // explicit paths are not shadowed by the document detail handler.
        this.hooks.dispatch('bind-routes', router, this);
        // Document slug catch-all - must stay after plugin routes
        router.get('/:slug', this.config.routeMiddleware.detail, this.detail);
        // Not Found - Catch All
        if (this.config.handleNotFound) {
            router.get('/*splat', this.notFound);
        }
        server.use(router);
        debug('Bound routes.');
    }
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
    home = async (request, response, next) => {
        debug('Home Route');
        // Check for custom home function, and use it if it exists
        if (this.config.homeRoute) {
            debug('Custom Home Route');
            this.config.homeRoute.call(this, request, response, next);
            return;
        }
        let document;
        try {
            [document] = await this.hooks.fetch('storage-get', this.config.homePage, this);
        }
        catch (error) {
            debug('Error fetching home document:', error);
        }
        if (!document) {
            debug('Missing home document');
            await this.notFound(request, response, next);
            return;
        }
        document.html = await this.hooks.filter('render-content', document.content, this);
        const meta = await this.buildMetadata(document, '');
        let viewModel = {
            ...this.buildViewModelBase(request, { title: document.title, meta }),
            document,
        };
        viewModel = await this.hooks.filter('view-model-home', viewModel, this);
        if (this.config.useCache) {
            response.set('Cache-control', `public, max-age=${this.config.cacheShort}`);
        }
        debug('Rendering home template');
        response.render('home', viewModel);
    };
    /**
     * Redirects to the homepage.
     *
     */
    homepageRedirect = (request, response, _next) => {
        debug('homepageRedirect:', this.config.homePage);
        response.redirect(301, this.config.publicUrl || '/');
        return;
    };
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
    search = async (request, response, next) => {
        debug('Search Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.searchRoute) {
            debug('Custom Search Route');
            this.config.searchRoute.call(this, request, response, next);
            return;
        }
        const meta = await this.buildMetadata({ title: 'Search' }, '/search');
        let viewModel = {
            ...this.buildViewModelBase(request, { title: 'Search', meta }),
            searchTerm: '',
            searchResults: [],
        };
        if (request.query && request.query.s) {
            debug('search query:', request.query.s);
            let query = decodeURIComponent(String(request.query.s));
            // Sanitize search query to prevent XSS and other attacks
            query = sanitizeSearchQuery(query);
            if (!query) {
                // Empty query after sanitization, skip search
                viewModel = await this.hooks.filter('view-model-search', viewModel, this);
                response.set('X-Robots-Tag', 'noindex');
                if (this.config.useCache) {
                    response.set('Cache-control', 'no-store, no-cache, max-age=0');
                }
                response.render('search', viewModel);
                return;
            }
            viewModel.title = `Search results for "${query}"`;
            viewModel.searchTerm = query;
            let searchResults = [];
            try {
                [searchResults] = await this.hooks.fetch('search-query', { query, limit: 50 }, this);
                /* c8 ignore next 3 */
            }
            catch (error) {
                debug('Error fetching "search-query":', error);
            }
            /* c8 ignore next 8 */
            viewModel.searchResults = searchResults.map((document) => {
                let excerpt = document && document.excerpt ? document.excerpt.slice(0, this.config.excerptLength) : '';
                if (!excerpt) {
                    excerpt = document && document.content ? `${document.content.slice(0, this.config.excerptLength)} ...` : '';
                }
                document.html = excerpt;
                return document;
            });
            viewModel.meta = await this.buildMetadata({ title: `Search results for "${JSON.stringify(request.query.s)}"` }, `/search/${JSON.stringify(request.query.s)}`, 'noindex');
            viewModel.searchResults = await this.hooks.filter('render-search-results', viewModel.searchResults, this);
        }
        viewModel = await this.hooks.filter('view-model-search', viewModel, this);
        response.set('X-Robots-Tag', 'noindex');
        if (this.config.useCache) {
            response.set('Cache-control', 'no-store, no-cache, max-age=0');
        }
        response.render('search', viewModel);
    };
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
    edit = async (request, response, next) => {
        debug('Edit Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.editRoute) {
            debug('Custom Edit Route');
            this.config.editRoute.call(this, request, response, next);
            return;
        }
        if (this.config.useEditKey && (!request.params.key || request.params.key !== this.config.editKey)) {
            debug('edit: Missing edit key, or a edit key mismatch!');
            next();
            return;
        }
        if (!request.params.slug) {
            debug('Missing slug!');
            next();
            return;
        }
        let document;
        try {
            [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching document:', error);
        }
        if (!document) {
            debug('Missing document!');
            next();
            return;
        }
        const meta = await this.buildMetadata({ ...document, title: `Editing ${document.title}` }, `/${String(request.params.slug)}/edit`);
        let viewModel = {
            ...this.buildViewModelBase(request, { title: `Editing ${document.title}`, meta }),
            document,
            action: `${request.baseUrl || ''}/${document.slug}/save`,
        };
        viewModel = await this.hooks.filter('view-model-edit', viewModel, this);
        response.set('X-Robots-Tag', 'noindex');
        response.set('Cache-control', 'no-store, no-cache, max-age=0');
        response.render('edit', viewModel);
    };
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
    delete = async (request, response, next) => {
        debug('Delete Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.deleteRoute) {
            debug('Custom Delete Route');
            this.config.deleteRoute.call(this, request, response, next);
            return;
        }
        if (this.config.useDeleteKey && (!request.params.key || request.params.key !== this.config.deleteKey)) {
            debug('delete: Missing delete key, or a delete key mismatch!');
            next();
            return;
        }
        if (!request.params.slug) {
            debug('delete: Missing slug!');
            next();
            return;
        }
        const { slug } = request.params;
        let document;
        try {
            [document] = await this.hooks.fetch('storage-get', slug, this);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching document:', error);
        }
        if (document) {
            this.hooks.dispatch('document-delete', document, this);
            debug('Deleting document', document);
            await this.hooks.fetch('storage-delete', slug, this);
            this.hooks.dispatch('search-delete', document, this);
            request.wikiFlash('success', `Deleted '${String(slug)}' successfully.`);
            response.redirect(this.config.publicUrl || '/');
        }
        else {
            debug('Nothing found to delete, next.');
            next();
        }
    };
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
    save = async (request, response, next) => {
        debug('Save Edit Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.saveRoute) {
            debug('Custom Save Edit Route');
            this.config.saveRoute.call(this, request, response, next);
            return;
        }
        if (this.config.useEditKey && (!request.params.key || request.params.key !== this.config.editKey)) {
            debug('save: Missing edit key, or a edit key mismatch!');
            next();
            return;
        }
        if (!request.params.slug) {
            debug('save: Missing slug!');
            next();
            return;
        }
        if (!request.body || (request.body && Object.keys(request.body).length === 0)) {
            debug('Missing body!');
            next();
            return;
        }
        if (!request.body.content) {
            debug('Missing content!');
            next();
            return;
        }
        // Check for spam or otherwise veryify, redirect back if true, continue to update if false.
        const invalid = await this.hooks.validate('validate-save', request, this);
        if (invalid) {
            debug('Invalid:', request.params.slug, JSON.stringify(request.body));
            this.hooks.dispatch('validate-invalid', request, this);
            response.redirect(request.get('Referrer') || '/');
            return;
        }
        this.hooks.dispatch('validate-valid', request, this);
        request.wikiFlash('success', `Updated '${request.params.slug}' successfully.`);
        await this.saveValid(request, response, next);
    };
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
    saveNew = async (request, response, next) => {
        debug('Save New Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.saveNewRoute) {
            debug('Custom Save New Route');
            this.config.saveNewRoute.call(this, request, response, next);
            return;
        }
        if (this.config.useEditKey && (!request.params.key || request.params.key !== this.config.editKey)) {
            debug('save: Missing edit key, or a edit key mismatch!');
            response.redirect(request.get('Referrer') || '/');
            return;
        }
        if (!request.body || (request.body && Object.keys(request.body).length === 0)) {
            debug('Missing body!');
            response.redirect(request.get('Referrer') || '/');
            return;
        }
        const slug = String(request.body.slug || '').trim();
        // Ensure the slug is unique and the redirects do not point to active URLs.
        const safeSlug = escapeQueryValue(slug);
        const query = `SELECT COUNT(*) FROM documents WHERE slug = "${safeSlug}" OR redirects INCLUDES ("${safeSlug}") ORDER BY slug ASC LIMIT -1`;
        let [count] = await this.hooks.fetch('storage-query', query, this);
        if (Array.isArray(count)) {
            const temp = count[0];
            count = temp;
        }
        if (count !== 0) {
            debug(`${String(count)} existing Document or Redirect with the slug:`, slug, JSON.stringify(request.body));
            response.redirect(request.get('Referrer') || '/');
            return;
        }
        // Check for spam or otherwise veryify, redirect back if true, continue to update if false.
        const invalid = await this.hooks.validate('validate-save', request, this);
        if (invalid) {
            debug('Invalid:', slug, JSON.stringify(request.body));
            this.hooks.dispatch('validate-invalid', request, this);
            response.redirect(request.get('Referrer') || '/');
            return;
        }
        this.hooks.dispatch('validate-valid', request, this);
        request.wikiFlash('success', `Created '${slug}' successfully.`);
        await this.saveValid(request, response, next);
    };
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
    create = async (request, response, next) => {
        debug('New Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.newRoute) {
            debug('Custom New Route');
            this.config.newRoute.call(this, request, response, next);
            return;
        }
        if (this.config.useEditKey && (!request.params.key || request.params.key !== this.config.editKey)) {
            debug('edit: Missing edit key, or a edit key mismatch!');
            next();
            return;
        }
        const title = 'New Document';
        const document = {
            slug: '',
            title: '',
            content: '',
            createDate: Date.now(),
            updateDate: Date.now(),
            tags: [],
        };
        const meta = await this.buildMetadata(document, '/new');
        let viewModel = {
            ...this.buildViewModelBase(request, { title, meta }),
            document,
            action: `${request.baseUrl || ''}/new`,
        };
        viewModel = await this.hooks.filter('view-model-new', viewModel, this);
        response.set('X-Robots-Tag', 'noindex');
        response.set('Cache-control', 'no-store, no-cache, max-age=0');
        response.render('edit', viewModel);
    };
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
    detail = async (request, response, next) => {
        debug('Detail Route:', request.originalUrl);
        // Check for custom route function, and use it if it exists.
        if (this.config.detailRoute) {
            debug('Custom Detail Route');
            this.config.detailRoute.call(this, request, response, next);
            return;
        }
        let slug = routeParamToString(request.params.slug).trim();
        if (!slug) {
            debug('Missing slug.');
            next();
            return;
        }
        // Sanitize slug to prevent path traversal
        slug = sanitizeSlug(slug);
        if (!slug) {
            debug('Invalid slug after sanitization.');
            next();
            return;
        }
        let document;
        try {
            // [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
            const ignoreSlugs = `"${this.config.ignoreSlugs.join('", "')}"`;
            const safeSlug = escapeQueryValue(slug);
            const query = `SELECT * FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND (slug = "${safeSlug}" OR redirects INCLUDES ("${safeSlug}")) ORDER BY slug ASC LIMIT 1`;
            const results = await this.hooks.fetch('storage-query', query, this);
            if (results) {
                document = results[0][0];
            }
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching document:', error);
        }
        // If we don't have anyhting it is likely a 404, fall through to the next handler.
        if (!document) {
            debug('No document found for given slug:', request.params.slug);
            next();
            return;
        }
        // Check for redirects and handle the 301 redirect to the actual slug.
        if (document.slug !== slug) {
            response.redirect(301, `${this.config.publicUrl}/${document.slug}`);
            return;
        }
        document.html = await this.hooks.filter('render-content', document.content, this);
        const meta = await this.buildMetadata(document, `/${String(request.params.slug)}`);
        let viewModel = {
            ...this.buildViewModelBase(request, { title: document.title, meta }),
            document,
        };
        viewModel = await this.hooks.filter('view-model-detail', viewModel, this);
        if (this.config.useCache) {
            response.set('Cache-control', `public, max-age=${this.config.cacheShort}`);
        }
        debug('layout:', document.layout ?? 'detail');
        response.render(document.layout ?? 'detail', viewModel);
    };
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
    preview = async (request, response, next) => {
        debug('Preview Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.previewRoute) {
            debug('Custom Preview Route');
            this.config.previewRoute.call(this, request, response, next);
            return;
        }
        response.setHeader('X-Robots-Tag', 'noindex');
        if (!request.body) {
            debug('Missing body!');
            response.setHeader('Content-Type', 'text/html');
            response.status(200).send('');
            return;
        }
        const html = await this.hooks.filter('render-content', request.body, this);
        response.setHeader('Content-Type', 'text/html');
        response.status(200).send(html);
    };
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
    historyIndex = async (request, response, next) => {
        debug('History Index Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.historyIndexRoute) {
            debug('Custom History Index Route');
            this.config.historyIndexRoute.call(this, request, response, next);
            return;
        }
        if (!request.params.slug) {
            debug('Missing slug.');
            next();
            return;
        }
        let document;
        try {
            [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching document:', error);
        }
        if (!document) {
            debug('No document found for given slug:', request.params.slug);
            next();
            return;
        }
        let history;
        try {
            [history] = await this.hooks.fetch('storage-get-history', request.params.slug, this);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching history:', error);
        }
        /* c8 ignore next 5 */
        if (!Array.isArray(history) || history.length === 0) {
            debug('No history found for given slug:', request.params.slug);
            next();
            return;
        }
        const historyByDay = history.reduce((output, value) => {
            /* c8 ignore next */
            value = value.includes('-') ? value.split('-')[0] : value;
            const d = new Date(Number.parseInt(value, 10));
            const key = d.toISOString().split('T')[0];
            output[key] = output[key] || [];
            output[key].push(value);
            return output;
        }, ({}));
        const meta = await this.buildMetadata({
            ...document,
            title: `${document.title} Revision History`,
        }, `/${String(request.params.slug)}/history`, 'noindex');
        debug('document.title:', document.title);
        let viewModel = {
            ...this.buildViewModelBase(request, { title: `${document.title} Revision History`, meta }),
            document,
            historyByDay,
        };
        viewModel = await this.hooks.filter('view-model-history-index', viewModel, this);
        response.set('X-Robots-Tag', 'noindex');
        if (this.config.useCache) {
            response.set('Cache-control', `public, max-age=${this.config.cacheShort}`);
        }
        response.render('history_index', viewModel);
    };
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
    historyDetail = async (request, response, next) => {
        debug('History Detail Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.historyDetailRoute) {
            debug('Custom History Detail Route');
            this.config.historyDetailRoute.call(this, request, response, next);
            return;
        }
        if (!request.params.slug) {
            debug('Missing slug.');
            next();
            return;
        }
        if (!request.params.revision) {
            debug('Missing revision.');
            next();
            return;
        }
        const slug = routeParamToString(request.params.slug);
        const revision = routeParamToString(request.params.revision);
        let document;
        try {
            [document] = await this.hooks.fetch('storage-get-revision', { slug, revision }, this);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching document:', error);
        }
        if (!document) {
            debug('No revision found for given slug & revision pair:', slug, revision);
            next();
            return;
        }
        document.html = await this.hooks.filter('render-content', document.content, this);
        /**
         * Normalize a history revision id (same rule as the history index route).
         * @param rev Revision from the URL or history list.
         */
        const historyRevisionKey = (rev) => {
            const s = String(rev);
            return s.includes('-') ? s.split('-')[0] : s;
        };
        let currentDocument;
        try {
            [currentDocument] = await this.hooks.fetch('storage-get', slug, this);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching current document:', error);
        }
        let historyList = [];
        try {
            [historyList] = await this.hooks.fetch('storage-get-history', slug, this);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching history for revision diff:', error);
        }
        /**
         * When viewing the newest revision, it matches the live document, so diff against the prior revision instead.
         *
         */
        let previousDocument;
        if (Array.isArray(historyList) && historyList.length >= 2) {
            const sortedDesc = [...historyList].sort((a, b) => Number.parseInt(historyRevisionKey(b), 10) - Number.parseInt(historyRevisionKey(a), 10));
            if (historyRevisionKey(revision) === historyRevisionKey(sortedDesc[0])) {
                try {
                    [previousDocument] = await this.hooks.fetch('storage-get-revision', { slug, revision: sortedDesc[1] }, this);
                    /* c8 ignore next 3 */
                }
                catch (error) {
                    debug('Error fetching previous revision for diff:', error);
                }
            }
        }
        const diffOldDoc = previousDocument ?? document;
        const diffNewDoc = previousDocument ? document : currentDocument;
        // Generate diffs for fields that have changed
        const diffs = {};
        if (diffNewDoc) {
            const fieldsToCompare = ['title', 'excerpt', 'content', 'layout'];
            for (const field of fieldsToCompare) {
                const oldValue = String(diffOldDoc[field] || '');
                const newValue = String(diffNewDoc[field] || '');
                if (oldValue !== newValue) {
                    diffs[field] = htmlTable(oldValue, newValue);
                }
            }
            // Compare image field (which is an ID reference to an attachment)
            const oldImageId = diffOldDoc.image;
            const newImageId = diffNewDoc.image;
            let oldImageValue = '';
            let newImageValue = '';
            if (oldImageId && diffOldDoc.attachments && Array.isArray(diffOldDoc.attachments)) {
                const oldImageAttachment = diffOldDoc.attachments.find((att) => att.id === oldImageId);
                oldImageValue = oldImageAttachment?.path || oldImageId;
            }
            else if (oldImageId) {
                oldImageValue = oldImageId;
            }
            if (newImageId && diffNewDoc.attachments && Array.isArray(diffNewDoc.attachments)) {
                const newImageAttachment = diffNewDoc.attachments.find((att) => att.id === newImageId);
                newImageValue = newImageAttachment?.path || newImageId;
            }
            else if (newImageId) {
                newImageValue = newImageId;
            }
            if (oldImageValue !== newImageValue) {
                diffs.image = htmlTable(oldImageValue, newImageValue);
            }
            // Compare tags array
            const oldTags = Array.isArray(diffOldDoc.tags) ? diffOldDoc.tags.join(', ') : String(diffOldDoc.tags || '');
            const newTags = Array.isArray(diffNewDoc.tags) ? diffNewDoc.tags.join(', ') : String(diffNewDoc.tags || '');
            if (oldTags !== newTags) {
                diffs.tags = htmlTable(oldTags, newTags);
            }
            // Compare redirects array
            const oldRedirects = Array.isArray(diffOldDoc.redirects) ? diffOldDoc.redirects.join('\n') : String(diffOldDoc.redirects || '');
            const newRedirects = Array.isArray(diffNewDoc.redirects) ? diffNewDoc.redirects.join('\n') : String(diffNewDoc.redirects || '');
            if (oldRedirects !== newRedirects) {
                diffs.redirects = htmlTable(oldRedirects, newRedirects);
            }
        }
        debug('diffs:', diffs);
        const meta = await this.buildMetadata({
            ...document,
            title: `${document.title} Revision ${revision}`,
        }, `/${slug}/history/${revision}`, 'noindex');
        let viewModel = {
            ...this.buildViewModelBase(request, { title: `${document.title} Revision ${revision}`, meta, slug }),
            document,
            currentDocument,
            diffs,
            revision,
        };
        viewModel = await this.hooks.filter('view-model-history-detail', viewModel, this);
        response.set('X-Robots-Tag', 'noindex');
        if (this.config.useCache) {
            response.set('Cache-control', `public, max-age=${this.config.cacheLong}`);
        }
        debug('layout:', document.layout ?? 'history_detail');
        response.render(document.layout ?? 'history_detail', viewModel);
    };
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
    historyRestore = async (request, response, next) => {
        debug('History Restore Route');
        // Check for custom route function, and use it if it exists.
        if (this.config.historyRestoreRoute) {
            debug('Custom History Restore Route');
            this.config.historyRestoreRoute.call(this, request, response, next);
            return;
        }
        if (!request.params.slug) {
            debug('Missing slug!');
            next();
            return;
        }
        if (!request.params.revision) {
            debug('Missing revision.');
            next();
            return;
        }
        const slug = routeParamToString(request.params.slug);
        const revision = routeParamToString(request.params.revision);
        let document;
        try {
            [document] = await this.hooks.fetch('storage-get-revision', { slug, revision }, this);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('Error fetching document:', error);
        }
        if (!document) {
            debug('No revision found for given slug & revision pair:', slug, revision);
            next();
            return;
        }
        const meta = await this.buildMetadata({
            ...document,
            title: `Editing ${document.title} from Revision ${revision}`,
        }, `/${slug}/history/${revision}/restore`, 'noindex');
        let viewModel = {
            ...this.buildViewModelBase(request, { title: `Editing ${document.title} from Revision ${revision}`, meta, slug }),
            action: `${request.baseUrl || ''}/${document.slug}/save`,
            document,
            revision,
        };
        viewModel = await this.hooks.filter('view-model-history-restore', viewModel, this);
        response.set('X-Robots-Tag', 'noindex');
        if (this.config.useCache) {
            response.set('Cache-control', `public, max-age=${this.config.cacheLong}`);
        }
        response.render('edit', viewModel);
    };
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
    notFound = async (request, response, next) => {
        debug('404 Not Found Route:', request.path);
        // Check for custom route function, and use it if it exists.
        if (this.config.notFoundRoute) {
            debug('Custom 404 Not Found Route');
            this.config.notFoundRoute.call(this, request, response, next);
            return;
        }
        const meta = await this.buildMetadata({ title: '404 Not Found' }, '/404', 'noindex');
        let viewModel = {
            ...this.buildViewModelBase(request, { title: '404 Not Found', meta, slug: routeParamToString(request.params.slug) || '404' }),
        };
        viewModel = await this.hooks.filter('view-model-error-404', viewModel, this);
        response.status(404);
        response.set('X-Robots-Tag', 'noindex');
        /* c8 ignore next 5 */
        if (request.accepts('html')) {
            response.render('404', viewModel);
            return;
        }
        /* c8 ignore next 5 */
        if (request.accepts('json')) {
            response.send({ error: 'Not found' });
            return;
        }
        /* c8 ignore next */
        response.type('txt').send('Not found');
    };
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
    saveValid = async (request, response, next) => {
        debug('Save Valid');
        debug(`Saving with params: ${JSON.stringify(request.params, undefined, 2)}`);
        debug(`Saving with body: ${JSON.stringify(request.body, undefined, 2)}`);
        // Check for custom route function, and use it if it exists.
        if (this.config.saveValidRoute) {
            debug('Custom Save Valid Route');
            this.config.saveValidRoute.call(this, request, response, next);
            return;
        }
        const { title = '', excerpt = '', content = '', image = '' } = request.body;
        let slug = request.body.slug || request.params.slug;
        if (!slug) {
            request.wikiFlash('error', 'Missing slug.');
            response.redirect(request.get('Referrer') || '/');
            return;
        }
        slug = slug.toLowerCase();
        // Filter out any unwanted keys
        const custom = this.config.allowedDocumentKeys.reduce((output, key) => {
            if (request.body[key]) {
                output[key] = request.body[key];
            }
            return output;
        }, {});
        debug('custom keys:', custom);
        // Normalize redirects before save
        let redirects = [];
        if (Array.isArray(request.body.redirects)) {
            redirects = request.body.redirects;
        }
        else if (typeof request.body.redirects === 'string') {
            redirects = request.body.redirects.split(/[\n,]/);
        }
        redirects = [...new Set(redirects.map((t) => t.trim()))].filter(Boolean).sort((a, b) => a.localeCompare(b));
        let attachments = [];
        debug('attachments:', request.body.attachments);
        attachments = normalizeAttachments(request.body.attachments);
        // If we're updating an existing document, preserve createDate and ensure attachments have IDs
        let createDate = Date.now();
        if (request.params.slug) {
            try {
                const results = await this.hooks.fetch('storage-get', request.params.slug, this);
                const existingDocument = results?.[0];
                if (existingDocument) {
                    createDate = existingDocument.createDate || createDate;
                    // Ensure existing attachments in the document have IDs if they don't
                    if (existingDocument.attachments && Array.isArray(existingDocument.attachments)) {
                        existingDocument.attachments.forEach((existingAtt) => {
                            if (!existingAtt.id) {
                                existingAtt.id = crypto.randomUUID();
                            }
                        });
                        // Merge with new attachments, preserving IDs from existing ones
                        attachments = attachments.map((newAtt) => {
                            const existingAtt = existingDocument?.attachments?.find((e) => e.path === newAtt.path);
                            newAtt.id = existingAtt?.id || newAtt.id || crypto.randomUUID();
                            return newAtt;
                        });
                    }
                }
            } /* c8 ignore next 3 */
            catch (error) {
                debug('Error fetching existing document for update:', error);
            }
        }
        // Handle image - it should be an ID reference to an image attachment.
        let imageId = null;
        if (image) {
            const imageAttachment = resolveImageAttachment(image, attachments);
            if (!imageAttachment) {
                debug('Image not found by ID or path:', image);
                request.wikiFlash('error', 'Document image must reference an attachment.');
                response.redirect(request.get?.('Referrer') || '/');
                return;
            }
            if (!isImageAttachment(imageAttachment)) {
                debug('Image attachment is not an image:', imageAttachment);
                request.wikiFlash('error', 'Document image must reference an image attachment.');
                response.redirect(request.get?.('Referrer') || '/');
                return;
            }
            imageId = imageAttachment.id;
        }
        let document = {
            ...custom,
            title,
            image: imageId || undefined,
            excerpt,
            content,
            tags: request.body.tags ?? [],
            redirects,
            slug,
            createDate,
            updateDate: Date.now(),
            attachments,
        };
        document = await this.hooks.filter('document-save', document, this);
        // Save document
        const originalSlug = request.body['original-slug'];
        await this.hooks.fetch('storage-update', { document, originalSlug }, this);
        this.hooks.dispatch('search-update', [{ document, originalSlug }], this);
        response.redirect(`${this.config.publicUrl}/${slug}`);
    };
}
export default UttoriWiki;
//# sourceMappingURL=wiki.js.map