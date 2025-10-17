import { htmlTable } from '@uttori/data-tools/diff/textdiff';
import { EventDispatcher } from '@uttori/event-dispatcher';

import defaultConfig from './config.js';
import { buildPath } from './redirect.js';

// TODO: Convert to Express Router-Level Middleware, https://expressjs.com/en/guide/using-middleware.html

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Wiki'); } catch {}

// TODO Standardize the view model so it is consistent across all the routes.

/**
 * @typedef {object} UttoriWikiViewModel
 * @property {string} title The document title to be used anywhere a title may be needed.
 * @property {import('./config.js').UttoriWikiConfig} config The configuration object.
 * @property {UttoriWikiDocumentMetaData} meta The metadata object.
 * @property {string} basePath The base path of the request.
 * @property {UttoriWikiDocument} [document] The document object.
 * @property {import('express-session').Session} [session] The Express session object.
 * @property {(boolean | object | Array<string>)} [flash] The flash object.
 * @property {UttoriWikiDocument[] | Record<string, UttoriWikiDocument[]>} [taggedDocuments] An array of documents that are tagged with the document.
 * @property {string} [searchTerm] The search term to be used in the search results.
 * @property {UttoriWikiDocument[]} [searchResults] An array of search results.
 * @property {string} [slug] The slug of the document.
 * @property {string} [action] The action to be used in the form.
 * @property {string} [revision] The revision of the document.
 * @property {Record<string, string[]>} [historyByDay] An object of history by day.
 * @property {UttoriWikiDocument} [currentDocument] The current version of the document for comparison.
 * @property {Record<string, string>} [diffs] An object containing HTML table diffs for changed fields.
 */

/**
 * @typedef {object} UttoriWikiDocument
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
 * @property {boolean} [skip] Whether to skip the attachment. Used to control whether to index the attachment.
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
class UttoriWiki {
/**
 * Creates an instance of UttoriWiki.
 * @param {import('./config.js').UttoriWikiConfig} config - A configuration object.
 * @param {import('express').Application} server - The Express server instance.
 * @class
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
    /** @type {import('./config.js').UttoriWikiConfig} */
    this.config = { ...defaultConfig, ...config };

    // Instantiate the event bus / event dispatcher / hooks systems, as we will need it for every other step.
    /** @type {import('@uttori/event-dispatcher').EventDispatcher} */
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
   * @param {import('./config.js').UttoriWikiConfig} config - A configuration object.
   */
  registerPlugins(config) {
    if (!config.plugins || !Array.isArray(config.plugins) || config.plugins.length <= 0) {
      debug('No plugins configuration provided or plugins is not an Array, skipping.');
      return;
    }
    debug('Registering Plugins: ', config.plugins.length);
    for (const plugin of config.plugins) {
      try {
        plugin.register(this);
      } catch (error) {
        debug('Plugin:', plugin);
        debug('Plugin Error:', error);
      }
    }
    debug('Registered Plugins');
  }

  /**
   * Validates the config.
   *
   * Hooks:
   * - `dispatch` - `validate-config` - Passes in the config object.
   * @param {import('./config.js').UttoriWikiConfig} config A configuration object.
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
  async buildMetadata(document, path = '', robots = '') {
    const canonical = `${this.config.publicUrl}${path.trim()}`;
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
      image = document.image ? document.image : '';
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
   * Bind the routes to the server.
   * Routes are bound in the order of Home, Tags, Search, Not Found Placeholder, Document, Plugins, Not Found - Catch All
   *
   * Hooks:
   * - `dispatch` - `bind-routes` - Passes in the server instance.
   * @param {import('express').Application} server The Express server instance.
   */
  bindRoutes(server) {
    debug('Binding routes...');

    // Home
    server.get('/', this.config.routeMiddleware.home, this.home);
    server.get(`/${this.config.homePage}`, this.config.routeMiddleware.home, this.homepageRedirect);

    // Search
    debug('Binding search route:', `/${this.config.routes.search}`);
    server.get(`/${this.config.routes.search}`, this.config.routeMiddleware.search, this.search);

    // Tags - handled by plugin

    // Not Found Placeholder
    server.head('/404', this.config.routeMiddleware.notFound, this.notFound);
    server.get('/404', this.config.routeMiddleware.notFound, this.notFound);
    server.delete('/404', this.config.routeMiddleware.notFound, this.notFound);
    server.patch('/404', this.config.routeMiddleware.notFound, this.notFound);
    server.put('/404', this.config.routeMiddleware.notFound, this.notFound);
    server.post('/404', this.config.routeMiddleware.notFound, this.notFound);

    // Document CRUD / Admin
    if (this.config.allowCRUDRoutes) {
      server.get('/new/:key', this.config.routeMiddleware.create, this.create);
      server.get('/new', this.config.routeMiddleware.create, this.create);
      server.post('/new/:key', this.config.routeMiddleware.saveNew, this.saveNew);
      server.post('/new', this.config.routeMiddleware.saveNew, this.saveNew);

      server.post('/preview', this.config.routeMiddleware.preview, this.preview);
      server.get('/:slug/edit/:key', this.config.routeMiddleware.edit, this.edit);
      server.get('/:slug/edit', this.config.routeMiddleware.edit, this.edit);
      server.get('/:slug/delete/:key', this.config.routeMiddleware.delete, this.delete);
      server.get('/:slug/delete', this.config.routeMiddleware.delete, this.delete);
    }

    // Document History
    if (this.config.publicHistory) {
      server.get('/:slug/history', this.config.routeMiddleware.historyIndex, this.historyIndex);
      server.get('/:slug/history/:revision', this.config.routeMiddleware.historyDetail, this.historyDetail);
      server.get('/:slug/history/:revision/restore', this.config.routeMiddleware.historyRestore, this.historyRestore);
    } else {
      server.get('/:slug/history', this.config.routeMiddleware.historyIndex, this.notFound);
      server.get('/:slug/history/:revision', this.config.routeMiddleware.historyDetail, this.notFound);
      server.get('/:slug/history/:revision/restore', this.config.routeMiddleware.historyRestore, this.notFound);
    }

    // Document Update
    server.post('/:slug/save/:key', this.config.routeMiddleware.save, this.save);
    server.post('/:slug/save', this.config.routeMiddleware.save, this.save);
    server.put('/:slug/save/:key', this.config.routeMiddleware.save, this.save);
    server.put('/:slug/save', this.config.routeMiddleware.save, this.save);
    server.get('/:slug', this.config.routeMiddleware.detail, this.detail);

    // Handle Redirects
    for (const redirect of this.config.redirects) {
      debug('Redirect:', redirect);
      const { route, target, status = 301, appendQueryString = true } = redirect;
      if (!route || !target) {
        debug('Missing route or target, skipping.');
        continue;
      }
      server.all(route, (request, response, next) => {
        // Build the new path from the route and target using the request params.
        let path = buildPath(request.params, route, target);
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

    this.hooks.dispatch('bind-routes', server, this);

    // Not Found - Catch All
    if (this.config.handleNotFound) {
      server.get('/*splat', this.notFound);
    }

    debug('Bound routes.');
  }

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
  home = async (request, response, next) => {
    debug('Home Route');

    // Check for custom home function, and use it if it exists
    if (this.config.homeRoute) {
      debug('Custom Home Route');
      this.config.homeRoute.call(this, request, response, next);
      return;
    }

    /** @type {UttoriWikiDocument} */
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get', this.config.homePage, this);
    } catch (error) {
      debug('Error fetching home document:', error);
    }
    if (!document) {
      debug('Missing home document');
      await this.notFound(request, response, next);
      return;
    }
    document.html = await this.hooks.filter('render-content', document.content, this);

    const meta = await this.buildMetadata(document, '');

    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      title: document.title,
      config: this.config,
      session: request.session,
      document,
      meta,
      basePath: request.baseUrl,
      flash: request?.wikiFlash?.() || {},
    };

    viewModel = await this.hooks.filter('view-model-home', viewModel, this);
    if (this.config.useCache) {
      response.set('Cache-control', `public, max-age=${this.config.cacheShort}`);
    }
    response.render('home', viewModel);
  };

  /**
   * Redirects to the homepage.
   * @type {import('express').RequestHandler}
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
   * @param {import('express').Request<{}, {}, {}, { s: string }>} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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
    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      title: 'Search',
      config: this.config,
      session: request.session,
      searchTerm: '',
      searchResults: [],
      meta,
      basePath: request.baseUrl,
      flash: request?.wikiFlash?.() || {},
    };

    if (request.query && request.query.s) {
      debug('search query:', request.query.s);
      const query = decodeURIComponent(String(request.query.s));
      viewModel.title = `Search results for "${query}"`;
      viewModel.searchTerm = query;

      /** @type {UttoriWikiDocument[]} */
      let searchResults = [];
      try {
        [searchResults] = await this.hooks.fetch('search-query', { query, limit: 50 }, this);
      /* c8 ignore next 3 */
      } catch (error) {
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

      viewModel.meta = await this.buildMetadata({ title: `Search results for "${JSON.stringify((request.query.s))}"` }, `/search/${JSON.stringify((request.query.s))}`, 'noindex');
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
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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

    /** @type {UttoriWikiDocument} */
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching document:', error);
    }

    if (!document) {
      debug('Missing document!');
      next();
      return;
    }

    const meta = await this.buildMetadata({ ...document, title: `Editing ${document.title}` }, `/${request.params.slug}/edit`);
    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      title: `Editing ${document.title}`,
      document,
      config: this.config,
      session: request.session,
      meta,
      basePath: request.baseUrl,
      action: `${request.baseUrl || ''}/${document.slug}/save`,
      flash: request?.wikiFlash?.() || {},
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
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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
    /** @type {UttoriWikiDocument | undefined} */
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get', slug, this);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching document:', error);
    }
    if (document) {
      this.hooks.dispatch('document-delete', document, this);
      debug('Deleting document', document);
      await this.hooks.fetch('storage-delete', slug, this);
      this.hooks.dispatch('search-delete', document, this);
      request.wikiFlash('success', `Deleted '${slug}' successfully.`);
      response.redirect(this.config.publicUrl || '/');
    } else {
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
   * @param {import('express').Request<import('../dist/custom.d.ts').SaveParams, {}, UttoriWikiDocument>} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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
   * @param {import('express').Request<import('../dist/custom.js').SaveParams, {}, UttoriWikiDocument>} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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
    const { slug } = request.body;
    // Ensure the slug is unique and the redirects do not point to active URLs.
    const query = `SELECT COUNT(*) FROM documents WHERE slug = "${slug}" OR redirects INCLUDES ("${slug}") ORDER BY slug ASC LIMIT -1`;
    let [count] = await this.hooks.fetch('storage-query', query, this);
    if (Array.isArray(count)) {
      const temp = count[0];
      count = temp;
    }
    if (count !== 0) {
      debug(`${count} existing Document or Redirect with the slug:`, slug, JSON.stringify(request.body));
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
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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
    /** @type {UttoriWikiDocument} */
    const document = {
      slug: '',
      title: '',
      content: '',
      createDate: Date.now(),
      updateDate: Date.now(),
      tags: [],
    };

    const meta = await this.buildMetadata(document, '/new');
    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      document,
      title,
      meta,
      config: this.config,
      session: request.session,
      basePath: request.baseUrl,
      action: `${request.baseUrl || ''}/new`,
      flash: request?.wikiFlash?.() || {},
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
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
   */
  detail = async (request, response, next) => {
    debug('Detail Route:', request.originalUrl);

    // Check for custom route function, and use it if it exists.
    if (this.config.detailRoute) {
      debug('Custom Detail Route');
      this.config.detailRoute.call(this, request, response, next);
      return;
    }

    const slug = request.params.slug.trim();
    if (!slug) {
      debug('Missing slug.');
      next();
      return;
    }

    /** @type {UttoriWikiDocument | undefined} */
    let document;
    try {
      // [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
      const ignoreSlugs = `"${this.config.ignoreSlugs.join('", "')}"`;
      const query = `SELECT * FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND (slug = "${slug}" OR redirects INCLUDES ("${slug}")) ORDER BY slug ASC LIMIT 1`;
      /** @type {UttoriWikiDocument[]} */
      const results = await this.hooks.fetch('storage-query', query, this);
      if (results) {
        document = results[0][0];
      }
    /* c8 ignore next 3 */
    } catch (error) {
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

    const meta = await this.buildMetadata(document, `/${request.params.slug}`);

    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      title: document.title,
      config: this.config,
      session: request.session,
      document,
      meta,
      basePath: request.baseUrl,
      flash: request?.wikiFlash?.() || {},
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
   * - `render-content` - `render-content` - Passes in the request body content.
   * @async
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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
    /** @type {UttoriWikiDocument} */
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching document:', error);
    }

    if (!document) {
      debug('No document found for given slug:', request.params.slug);
      next();
      return;
    }

    /** @type {string[]} */
    let history;
    try {
      [history] = await this.hooks.fetch('storage-get-history', request.params.slug, this);
    /* c8 ignore next 3 */
    } catch (error) {
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
    }, /** @type {Record<string, string[]>} */ ({}));

    const meta = await this.buildMetadata({
      ...document,
      title: `${document.title} Revision History`,
    }, `/${request.params.slug}/history`, 'noindex');

    debug('document.title:', document.title);
    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      title: `${document.title} Revision History`,
      document,
      historyByDay,
      config: this.config,
      session: request.session,
      meta,
      basePath: request.baseUrl,
      flash: request?.wikiFlash?.() || {},
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
   * - `render-content` - `render-content` - Passes in the document content.
   * - `filter` - `view-model-history-index` - Passes in the viewModel.
   * @async
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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

    const { slug, revision } = request.params;
    /** @type {UttoriWikiDocument | undefined} */
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get-revision', { slug, revision }, this);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching document:', error);
    }

    if (!document) {
      debug('No revision found for given slug & revision pair:', slug, revision);
      next();
      return;
    }

    document.html = await this.hooks.filter('render-content', document.content, this);

    // Fetch current version of the document to compare with the revision
    /** @type {UttoriWikiDocument | undefined} */
    let currentDocument;
    try {
      [currentDocument] = await this.hooks.fetch('storage-get', slug, this);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching current document:', error);
    }

    // Generate diffs for fields that have changed
    /** @type {Record<string, string>} */
    const diffs = {};
    if (currentDocument) {
      const fieldsToCompare = ['title', 'excerpt', 'content', 'image', 'layout'];
      for (const field of fieldsToCompare) {
        const oldValue = String(document[field] || '');
        const newValue = String(currentDocument[field] || '');
        if (oldValue !== newValue) {
          diffs[field] = htmlTable(oldValue, newValue);
        }
      }

      // Compare tags array
      const oldTags = Array.isArray(document.tags) ? document.tags.join(', ') : String(document.tags || '');
      const newTags = Array.isArray(currentDocument.tags) ? currentDocument.tags.join(', ') : String(currentDocument.tags || '');
      if (oldTags !== newTags) {
        diffs.tags = htmlTable(oldTags, newTags);
      }

      // Compare redirects array
      const oldRedirects = Array.isArray(document.redirects) ? document.redirects.join('\n') : String(document.redirects || '');
      const newRedirects = Array.isArray(currentDocument.redirects) ? currentDocument.redirects.join('\n') : String(currentDocument.redirects || '');
      if (oldRedirects !== newRedirects) {
        diffs.redirects = htmlTable(oldRedirects, newRedirects);
      }
    }
    debug('diffs:', diffs);

    const meta = await this.buildMetadata({
      ...document,
      title: `${document.title} Revision ${revision}`,
    }, `/${slug}/history/${revision}`, 'noindex');

    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      basePath: request.baseUrl,
      config: this.config,
      session: request.session,
      title: `${document.title} Revision ${revision}`,
      document,
      currentDocument,
      diffs,
      meta,
      revision,
      slug,
      flash: request?.wikiFlash?.() || {},
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
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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

    const { slug, revision } = request.params;
    /** @type {UttoriWikiDocument | undefined} */
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get-revision', { slug, revision }, this);
    /* c8 ignore next 3 */
    } catch (error) {
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

    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      basePath: request.baseUrl,
      config: this.config,
      session: request.session,
      title: `Editing ${document.title} from Revision ${revision}`,
      action: `${request.baseUrl || ''}/${document.slug}/save`,
      document,
      meta,
      revision,
      slug,
      flash: request?.wikiFlash?.() || {},
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
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
   */
  notFound = async (request, response, next) => {
    debug('404 Not Found Route');

    // Check for custom route function, and use it if it exists.
    if (this.config.notFoundRoute) {
      debug('Custom 404 Not Found Route');
      this.config.notFoundRoute.call(this, request, response, next);
      return;
    }

    const meta = await this.buildMetadata({ title: '404 Not Found' }, '/404', 'noindex');
    /** @type {UttoriWikiViewModel} */
    let viewModel = {
      title: '404 Not Found',
      config: this.config,
      session: request.session,
      slug: request.params.slug || '404',
      meta,
      basePath: request.baseUrl,
      flash: request?.wikiFlash?.() || {},
    };
    viewModel = await this.hooks.filter('view-model-error-404', viewModel, this);

    response.status(404);
    response.set('X-Robots-Tag', 'noindex');

    // /* c8 ignore next 5 */
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
   * @param {import('express').Request<import('../dist/custom.js').SaveParams, {}, UttoriWikiDocument>} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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

    /** @type {string} */
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

    // Normalize tags before save
    /** @type {string[]} */
    let tags = [];
    if (Array.isArray(request.body.tags)) {
      tags = request.body.tags.sort();
    } else if (typeof request.body.tags === 'string') {
      tags = request.body.tags.split(',').sort();
    }
    tags = [...new Set(tags.map((t) => t.trim()))].filter(Boolean).sort((a, b) => a.localeCompare(b));

    // Normalize redirects before save
    /** @type {string[]} */
    let redirects = [];
    if (Array.isArray(request.body.redirects)) {
      redirects = request.body.redirects;
    } else if (typeof request.body.redirects === 'string') {
      redirects = request.body.redirects.split(/[\n,]/);
    }
    redirects = [...new Set(redirects.map((t) => t.trim()))].filter(Boolean).sort((a, b) => a.localeCompare(b));

    /** @type {UttoriWikiDocumentAttachment[]} */
    let attachments = [];
    debug('attachments:', request.body.attachments);
    if (Array.isArray(request.body.attachments)) {
      attachments = request.body.attachments;
    }

    /** @type {UttoriWikiDocument} */
    let document = {
      ...custom,
      title,
      image,
      excerpt,
      content,
      tags,
      redirects,
      slug,
      createDate: Date.now(),
      updateDate: Date.now(),
      attachments,
    };
    document = await this.hooks.filter('document-save', document, this);

    // Save document
    /** @type {string} */
    const originalSlug = request.body['original-slug'];
    await this.hooks.fetch('storage-update', { document, originalSlug }, this);
    this.hooks.dispatch('search-update', [{ document, originalSlug }], this);

    response.redirect(`${this.config.publicUrl}/${slug}`);
  };
}

export default UttoriWiki;
