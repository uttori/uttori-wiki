import { htmlTable } from '@uttori/data-tools/diff/textdiff';
import { EventDispatcher } from '@uttori/event-dispatcher';
import crypto from 'node:crypto';
import express from 'express';

import defaultConfig from './config.js';
import { buildPath } from './redirect.js';
import { sanitizeSearchQuery, sanitizeSlug } from './plugins/utilities/security.js';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Wiki'); } catch {}

const escapeQueryValue = (value) => JSON.stringify(String(value)).slice(1, -1);

/**
 * Normalize an Express route parameter to a single string.
 * @param {string | string[] | undefined} value The route parameter value.
 * @returns {string} The normalized route parameter.
 */
export const routeParamToString = (value) => (Array.isArray(value) ? value[0] ?? '' : value ?? '');

/**
 * Normalize Express route parameters to the string-only shape used by redirects.
 * @param {Record<string, string | string[]>} params The Express route parameters.
 * @returns {Record<string, string>} The normalized route parameters.
 */
const normalizeRouteParams = (params) => Object.fromEntries(
  Object.entries(params).map(([key, value]) => [key, routeParamToString(value)]),
);

/**
 * Normalize attachment metadata and ensure every attachment has an ID.
 * @param {unknown} rawAttachments The request-provided attachment value.
 * @returns {UttoriWikiDocumentAttachment[]} Normalized attachments.
 */
const normalizeAttachments = (rawAttachments) => {
  if (!Array.isArray(rawAttachments)) {
    return [];
  }
  /** @type {UttoriWikiDocumentAttachment[]} */
  const attachments = rawAttachments;
  return attachments.map((attachment) => {
    if (!attachment.id) {
      attachment.id = crypto.randomUUID();
    }
    if (typeof attachment?.metadata === 'string') {
      try {
        attachment.metadata = JSON.parse(attachment.metadata);
      } catch (error) {
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
 * @param {string} image The requested image ID or path.
 * @param {UttoriWikiDocumentAttachment[]} attachments The document attachments.
 * @returns {UttoriWikiDocumentAttachment | undefined} The matching attachment.
 */
const resolveImageAttachment = (image, attachments) => attachments.find((att) => att.id === image) ?? attachments.find((att) => att.path === image);

/**
 * Check whether an attachment has an image MIME type.
 * @param {UttoriWikiDocumentAttachment | undefined} attachment The attachment to test.
 * @returns {boolean} Whether the attachment is an image.
 */
const isImageAttachment = (attachment) => typeof attachment?.type === 'string' && attachment.type.toLowerCase().startsWith('image/');

/**
 * @typedef {object} UttoriWikiViewModel
 * @property {string} title The document title to be used anywhere a title may be needed.
 * @property {import('./config.js').UttoriWikiConfig} config The configuration object.
 * @property {UttoriWikiDocumentMetaData} meta The metadata object.
 * @property {string} basePath The base path of the request.
 * @property {UttoriWikiDocument} [document] The document object.
 * @property {import('express-session').Session} [session] The Express session object.
 * @property {(boolean | object | Array<string>)} [flash] The flash object.
 * @property {UttoriWikiDocument[] | Record<string, UttoriWikiDocument[]>} [taggedDocuments] Tag Routes Plugin: documents grouped by tag, or documents for a tag detail route.
 * @property {UttoriWikiDocument[] | Record<string, UttoriWikiDocument[]>} [categorizedDocuments] Category Routes Plugin: documents grouped by category, or documents for a category detail route.
 * @property {Record<string, object>} [categoryTree] Category Routes Plugin: hierarchical category data for the category index.
 * @property {Array<object>} [flattenedCategories] Category Routes Plugin: flattened category data for the category index.
 * @property {string} [categoryPath] Category Routes Plugin: the active category path for a category detail route.
 * @property {Array<object>} [breadcrumbs] Category Routes Plugin: breadcrumb data for a category detail route.
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
 * @typedef {object} UttoriWikiBuildViewModelBaseOptions
 * @property {string} [title] The title for the view model.
 * @property {UttoriWikiDocumentMetaData} [meta] The metadata for the view model.
 * @property {string} [slug] The slug for the view model.
 */

/**
 * @typedef {object} UttoriWikiBaseViewModel
 * @property {string} title The document title to be used anywhere a title may be needed.
 * @property {import('./config.js').UttoriWikiConfig} config The configuration object.
 * @property {import('express-session').Session} [session] The Express session object.
 * @property {UttoriWikiDocumentMetaData} meta The metadata object.
 * @property {string} basePath The base path of the request.
 * @property {(boolean | object | Array<string>)} [flash] The flash object.
 * @property {string} [slug] The slug of the document.
 */

/**
 * @typedef {object} UttoriWikiDocument
 * @property {string} slug The document slug to be used in the URL and as a unique ID.
 * @property {string} title The document title to be used anywhere a title may be needed.
 * @property {string} [image] An ID reference to an attachment in the attachments array that represents the document in Open Graph or elsewhere.
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
 * @property {string} id The unique identifier of the attachment.
 * @property {string} name The display name of the attachment.
 * @property {string} path The path to the attachment.
 * @property {string} type The MIME type of the attachment.
 * @property {number} size The size of the attachment in bytes.
 * @property {object} metadata The metadata of the attachment.
 * @property {string} [metadata.gps] The GPS coordinates of the attachment.
 * @property {number} [metadata.gps.lat] The latitude of the GPS coordinates.
 * @property {number} [metadata.gps.lon] The longitude of the GPS coordinates.
 * @property {boolean} [skip] Whether to skip the attachment. Used to control whether to index the attachment.
 */

/**
 * UttoriWiki is a fast, simple, wiki knowledge base.
 * @property {import('./config.js').UttoriWikiConfig} config The configuration object.
 * @property {import('@uttori/event-dispatcher').EventDispatcher} hooks The hook / event dispatching object.
 * @example <caption>Init UttoriWiki</caption>
 * const server = express();
 * const wiki = new UttoriWiki(config, server);
 * server.listen(server.get('port'), server.get('ip'), () => { ... });
 * @class
 */
class UttoriWiki {
/**
 * Creates an instance of UttoriWiki.
 * @param {import('./config.js').UttoriWikiConfig} config A configuration object.
 * @param {import('express').Application} server The Express server instance.
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
   * @param {import('./config.js').UttoriWikiConfig} config A configuration object.
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
   * @param {import('express').Request} request The Express Request object.
   * @param {UttoriWikiBuildViewModelBaseOptions} [options] Base view model values.
   * @returns {UttoriWikiBaseViewModel} Base view model.
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
   * @param {import('express').Application} server The Express server instance.
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
    }

    // Document History
    if (this.config.publicHistory) {
      router.get('/:slug/history', this.config.routeMiddleware.historyIndex, this.historyIndex);
      router.get('/:slug/history/:revision', this.config.routeMiddleware.historyDetail, this.historyDetail);
      router.get('/:slug/history/:revision/restore', this.config.routeMiddleware.historyRestore, this.historyRestore);
    } else {
      router.get('/:slug/history', this.config.routeMiddleware.historyIndex, this.notFound);
      router.get('/:slug/history/:revision', this.config.routeMiddleware.historyDetail, this.notFound);
      router.get('/:slug/history/:revision/restore', this.config.routeMiddleware.historyRestore, this.notFound);
    }

    // Document Update
    router.post('/:slug/save/:key', this.config.routeMiddleware.save, this.save);
    router.post('/:slug/save', this.config.routeMiddleware.save, this.save);
    router.put('/:slug/save/:key', this.config.routeMiddleware.save, this.save);
    router.put('/:slug/save', this.config.routeMiddleware.save, this.save);

    // Handle Redirects
    for (const redirect of this.config.redirects) {
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

    // Document slug catch-all — must stay after plugin routes
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
      ...this.buildViewModelBase(request, { title: document.title, meta }),
      document,
    };

    viewModel = await this.hooks.filter('view-model-home', viewModel, this);
    if (this.config.useCache) {
      response.set('Cache-control', `public, max-age=${this.config.cacheShort}`);
    }
    debug('Rendering home template:', viewModel);
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

    /** @type {UttoriWikiDocument | undefined} */
    let document;
    try {
      // [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
      const ignoreSlugs = `"${this.config.ignoreSlugs.join('", "')}"`;
      const safeSlug = escapeQueryValue(slug);
      const query = `SELECT * FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND (slug = "${safeSlug}" OR redirects INCLUDES ("${safeSlug}")) ORDER BY slug ASC LIMIT 1`;
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

    const slug = routeParamToString(request.params.slug);
    const revision = routeParamToString(request.params.revision);
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

    /**
     * Normalize a history revision id (same rule as the history index route).
     * @param {string|number} rev Revision from the URL or history list.
     * @returns {string}
     */
    const historyRevisionKey = (rev) => {
      const s = String(rev);
      return s.includes('-') ? s.split('-')[0] : s;
    };

    /** @type {UttoriWikiDocument | undefined} */
    let currentDocument;
    try {
      [currentDocument] = await this.hooks.fetch('storage-get', slug, this);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching current document:', error);
    }

    /** @type {string[]} */
    let historyList = [];
    try {
      [historyList] = await this.hooks.fetch('storage-get-history', slug, this);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching history for revision diff:', error);
    }

    /**
     * When viewing the newest revision, it matches the live document, so diff against the prior revision instead.
     * @type {UttoriWikiDocument | undefined}
     */
    let previousDocument;
    if (Array.isArray(historyList) && historyList.length >= 2) {
      const sortedDesc = [...historyList].sort(
        (a, b) => Number.parseInt(historyRevisionKey(b), 10) - Number.parseInt(historyRevisionKey(a), 10),
      );
      if (historyRevisionKey(revision) === historyRevisionKey(sortedDesc[0])) {
        try {
          [previousDocument] = await this.hooks.fetch('storage-get-revision', { slug, revision: sortedDesc[1] }, this);
        /* c8 ignore next 3 */
        } catch (error) {
          debug('Error fetching previous revision for diff:', error);
        }
      }
    }

    const diffOldDoc = previousDocument ?? document;
    const diffNewDoc = previousDocument ? document : currentDocument;

    // Generate diffs for fields that have changed
    /** @type {Record<string, string>} */
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
      } else if (oldImageId) {
        oldImageValue = oldImageId;
      }
      if (newImageId && diffNewDoc.attachments && Array.isArray(diffNewDoc.attachments)) {
        const newImageAttachment = diffNewDoc.attachments.find((att) => att.id === newImageId);
        newImageValue = newImageAttachment?.path || newImageId;
      } else if (newImageId) {
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

    /** @type {UttoriWikiViewModel} */
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

    const slug = routeParamToString(request.params.slug);
    const revision = routeParamToString(request.params.revision);
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
   * @param {import('express').Request} request The Express Request object.
   * @param {import('express').Response} response The Express Response object.
   * @param {import('express').NextFunction} next The Express Next function.
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
    /** @type {UttoriWikiViewModel} */
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
    debug('custom keys:', custom);

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
    attachments = normalizeAttachments(request.body.attachments);

    // If we're updating an existing document, preserve createDate and ensure attachments have IDs
    let createDate = Date.now();
    if (request.params.slug) {
      try {
        /** @type {UttoriWikiDocument[]} */
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
              const existingAtt = existingDocument.attachments.find((e) => e.path === newAtt.path);
              newAtt.id = existingAtt?.id || newAtt.id || crypto.randomUUID();
              return newAtt;
            });
          }
        }
      } /* c8 ignore next 3 */ catch (error) {
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

    /** @type {UttoriWikiDocument} */
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
    /** @type {string} */
    const originalSlug = request.body['original-slug'];
    await this.hooks.fetch('storage-update', { document, originalSlug }, this);
    this.hooks.dispatch('search-update', [{ document, originalSlug }], this);

    response.redirect(`${this.config.publicUrl}/${slug}`);
  };
}

export default UttoriWiki;
