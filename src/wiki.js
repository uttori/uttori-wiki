const { Application, Request, Response } = require('express');
const { EventDispatcher } = require('@uttori/event-dispatcher');
const defaultConfig = require('./config');
const { UttoriWikiConfig } = require('./config');

// TODO: Convert to Express Router-Level Middleware, https://expressjs.com/en/guide/using-middleware.html

/** @type {Function} */
let debug = () => {}; try { debug = require('debug')('Uttori.Wiki'); } catch {}

// Used in `bindRoutes`
/** @type {Function} */
const asyncHandler = (fn) => (request, response, next) => Promise.resolve(fn(request, response, next)).catch(next);

/**
 * @typedef UttoriWikiDocument
 * @type {object}
 * @property {string} slug The document slug to be used in the URL and as a unique ID.
 * @property {string} title The document title to be used anywhere a title may be needed.
 * @property {string} excerpt A succinct deescription of the document, think meta description.
 * @property {string} content All text content for the doucment.
 * @property {string} [html] All rendered HTML content for the doucment that will be presented to the user.
 * @property {number} createDate The Unix timestamp of the creation date of the document.
 * @property {number} updateDate The Unix timestamp of the last update date to the document.
 * @property {string[]} [redirects] An array of slug like strings that will redirect to this document. Useful for renaming and keeping links valid or for short form WikiLinks.
 */

/**
 * UttoriWiki is a fast, simple, wiki knowledge base.
 *
 * @property {UttoriWikiConfig} config - The configuration object.
 * @property {EventDispatcher} hooks - The hook / event dispatching object.
 * @example <caption>Init UttoriWiki</caption>
 * const server = express();
 * const wiki = new UttoriWiki(config, server);
 * server.listen(server.get('port'), server.get('ip'), () => { ... });
 * @class
 */
class UttoriWiki {
/**
 * Creates an instance of UttoriWiki.
 *
 * @param {UttoriWikiConfig} config - A configuration object.
 * @param {Application} server - The Express server instance.
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
   *
   * @param {UttoriWikiConfig} config - A configuration object.
   */
  registerPlugins(config) {
    if (!config.plugins || !Array.isArray(config.plugins) || config.plugins.length <= 0) {
      debug('No plugins configuration provided or plugins is not an Array, skipping.');
      return;
    }
    debug('Registering Plugins: ', config.plugins.length);
    config.plugins.forEach(async (plugin) => {
      /* istanbul ignore next */
      try {
        plugin.register(this);
      } catch (error) {
        debug('Plugin:', plugin);
        debug('Plugin Error:', error);
      }
    });
    debug('Registered Plugins');
  }

  /**
   * Validates the config.
   *
   * Hooks:
   * - `dispatch` - `validate-config` - Passes in the config object.
   *
   * @param {UttoriWikiConfig} config A configuration object.
   */
  validateConfig(config) {
    debug('Validating config...');
    if (typeof config.theme_dir !== 'string') {
      throw new TypeError('No theme_dir provided.');
    }
    if (typeof config.public_dir !== 'string') {
      throw new TypeError('No public_dir provided.');
    }
    if (config.use_delete_key && !config.delete_key) {
      throw new TypeError('Using use_delete_key verification but no delete_key value set.');
    }
    if (config.use_edit_key && !config.edit_key) {
      throw new TypeError('Using use_edit_key verification but no edit_key value set.');
    }

    this.hooks.dispatch('validate-config', config, this);

    debug('Validated config.');
  }

  /**
   * Builds the metadata for the view model.
   *
   * Hooks:
   * - `filter` - `render-content` - Passes in the meta description.
   *
   * @async
   * @param {UttoriWikiDocument|object} document A UttoriWikiDocument.
   * @param {string} [path=''] The URL path to build meta data for.
   * @param {string} [robots=''] A meta robots tag value.
   * @returns {Promise<object>} Metadata object.
   * @example
   * const metadata = await wiki.buildMetadata(document, '/private-document-path', 'no-index');
   * ➜ {
   *   canonical,   // `${this.config.site_url}/private-document-path`
   *   robots,      // 'no-index'
   *   title,       // document.title
   *   description, // document.excerpt || document.content.slice(0, 160)
   *   modified,    // new Date(document.updateDate).toISOString()
   *   published,   // new Date(document.createDate).toISOString()
   * }
   */
  async buildMetadata(document, path = '', robots = '') {
    const canonical = `${this.config.site_url}/${path.trim()}`;
    let title = '';
    let description = '';
    let modified = '';
    let published = '';

    if (document) {
      description = document && document.excerpt ? document.excerpt : '';
      if (document.content && !description) {
        description = document.content.slice(0, 160);
        description = await this.hooks.filter('render-content', description, this);
      }
      modified = document.updateDate ? new Date(document.updateDate).toISOString() : '';
      published = document.createDate ? new Date(document.createDate).toISOString() : '';
      title = document.title ? document.title : '';
    }

    let metadata = {
      canonical,
      robots,
      title,
      description,
      modified,
      published,
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
   *
   * @param {Application} server The Express server instance.
   */
  bindRoutes(server) {
    debug('Binding routes...');
    // Home
    server.get('/', asyncHandler(this.home.bind(this)));
    server.get(`/${this.config.home_page}`, asyncHandler(this.homepageRedirect.bind(this)));

    // Tags
    server.get('/tags', asyncHandler(this.tagIndex.bind(this)));
    server.get('/tags/:tag/', asyncHandler(this.tag.bind(this)));

    // Search
    server.get('/search', asyncHandler(this.search.bind(this)));

    // Not Found Placeholder
    server.head('/404', asyncHandler(this.notFound.bind(this)));
    server.get('/404', asyncHandler(this.notFound.bind(this)));
    server.delete('/404', asyncHandler(this.notFound.bind(this)));
    server.patch('/404', asyncHandler(this.notFound.bind(this)));
    server.put('/404', asyncHandler(this.notFound.bind(this)));
    server.post('/404', asyncHandler(this.notFound.bind(this)));

    // Document
    server.get('/new/:key', asyncHandler(this.new.bind(this)));
    server.get('/new', asyncHandler(this.new.bind(this)));
    server.get('/:slug/edit/:key', asyncHandler(this.edit.bind(this)));
    server.get('/:slug/edit', asyncHandler(this.edit.bind(this)));
    server.get('/:slug/delete/:key', asyncHandler(this.delete.bind(this)));
    server.get('/:slug/delete', asyncHandler(this.delete.bind(this)));

    // Document History
    if (this.config.public_history) {
      server.get('/:slug/history', asyncHandler(this.historyIndex.bind(this)));
      server.get('/:slug/history/:revision', asyncHandler(this.historyDetail.bind(this)));
      server.get('/:slug/history/:revision/restore', asyncHandler(this.historyRestore.bind(this)));
    }

    server.post('/:slug/save/:key', asyncHandler(this.save.bind(this)));
    server.post('/:slug/save', asyncHandler(this.save.bind(this)));
    server.get('/:slug', asyncHandler(this.detail.bind(this)));

    this.hooks.dispatch('bind-routes', server, this);

    // Not Found - Catch All
    server.get('/*', asyncHandler(this.notFound.bind(this)));

    debug('Bound routes.');
  }

  /**
   * Renders the homepage with the `home` template.
   *
   * Hooks:
   * - `filter` - `render-content` - Passes in the home-page content.
   * - `filter` - `view-model-home` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async home(request, response, next) {
    debug('Home Route');
    /** @type {UttoriWikiDocument} */
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get', this.config.home_page, this);
    } catch (error) {
      /* istanbul ignore next */
      debug('Error fetching home document:', error);
    }
    if (!document) {
      debug('Missing home document');
      next();
      return;
    }
    document.html = await this.hooks.filter('render-content', document.content, this);

    let siteSections = [];
    try {
      siteSections = await Promise.all(this.config.site_sections.map(async (section) => {
        let documentCount = 0;
        try {
          const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
          const query = `SELECT COUNT(*) FROM documents WHERE slug NOT_IN (${ignore_slugs}) AND tags INCLUDES "${section.tag}" ORDER BY RANDOM LIMIT -1`;
          [documentCount] = await this.hooks.fetch('storage-query', query, this);
        } catch (error) {
          /* istanbul ignore next */
          debug('Error counting tags:', error);
        }

        return {
          ...section,
          documentCount,
        };
      }));
    } catch (error) {
      /* istanbul ignore next */
      debug('Error getting site_sections:', error);
    }

    const meta = await this.buildMetadata(document, '');

    let viewModel = {
      title: document.title,
      config: this.config,
      siteSections,
      document,
      meta,
      basePath: request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-home', viewModel, this);
    response.set('Cache-control', `public, max-age=${this.config.cache_short}`);
    response.render('home', viewModel);
  }

  /**
   * Redirects to the homepage.
   *
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} _next The Express Next function.
   */
  homepageRedirect(request, response, _next) {
    debug('homepageRedirect:', this.config.home_page);
    response.redirect(301, this.config.site_url);
  }

  /**
   * Renders the tag index page with the `tags` template.
   *
   * Hooks:
   * - `filter` - `view-model-tag-index` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} _next The Express Next function.
   */
  async tagIndex(request, response, _next) {
    debug('Tag Index Route');
    const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
    const query = `SELECT tags FROM documents WHERE slug NOT_IN (${ignore_slugs}) ORDER BY updateDate DESC LIMIT -1`;
    let tags = [];
    try {
      [tags] = await this.hooks.fetch('storage-query', query, this);
      tags = [...new Set(tags.flatMap((t) => t.tags))].filter(Boolean).sort((a, b) => a.localeCompare(b));
    } catch (error) {
      /* istanbul ignore next */
      debug('Error fetching tags:', error);
    }

    const taggedDocuments = {};
    Promise.all(tags.map(async (tag) => {
      taggedDocuments[tag] = await this.getTaggedDocuments(tag);
    }));

    const meta = await this.buildMetadata({}, '/tags');

    let viewModel = {
      title: 'Tags',
      config: this.config,
      taggedDocuments,
      meta,
      basePath: request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-tag-index', viewModel, this);
    response.set('Cache-control', `public, max-age=${this.config.cache_short}`);
    response.render('tags', viewModel);
  }

  /**
   * Renders the tag detail page with `tag` template.
   * Sets the `X-Robots-Tag` header to `noindex`.
   * Attempts to pull in the relevant site section for the tag if defined in the config site sections.
   *
   * Hooks:
   * - `filter` - `view-model-tag` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async tag(request, response, next) {
    debug('Tag Route');
    const taggedDocuments = await this.getTaggedDocuments(request.params.tag);
    if (taggedDocuments.length === 0) {
      debug('No documents for tag!');
      next();
      return;
    }

    const meta = await this.buildMetadata({}, `/tags/${request.params.tag}`);
    const section = this.config.site_sections.find((s) => s.tag === request.params.tag) || {};

    let viewModel = {
      title: request.params.tag,
      config: this.config,
      taggedDocuments,
      section,
      meta,
      basePath: request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-tag', viewModel, this);
    response.set('Cache-control', `public, max-age=${this.config.cache_short}`);
    response.render('tag', viewModel);
  }

  /**
   * Renders the search page using the `search` template.
   *
   * Hooks:
   * - `filter` - `render-search-results` - Passes in the search results.
   * - `filter` - `view-model-search` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} _next The Express Next function.
   */
  async search(request, response, _next) {
    debug('Search Route');
    const meta = await this.buildMetadata({ title: 'Search' }, '/search');
    let viewModel = {
      title: 'Search',
      config: this.config,
      searchTerm: '',
      searchResults: [],
      meta,
      basePath: request.baseUrl,
    };
    /* istanbul ignore else */
    if (request.query && request.query.s) {
      const query = decodeURIComponent(String(request.query.s));
      viewModel.title = `Search results for "${request.query.s}"`;
      viewModel.searchTerm = query;

      let searchResults = [];
      try {
        [searchResults] = await this.hooks.fetch('search-query', { query, limit: 50 }, this);
      } catch (error) {
        /* istanbul ignore next */
        debug('Error fetching "search-query":', error);
      }

      /* istanbul ignore next */
      viewModel.searchResults = searchResults.map((document) => {
        let excerpt = document && document.excerpt ? document.excerpt.slice(0, this.config.excerpt_length) : '';
        if (!excerpt) {
          excerpt = document && document.content ? `${document.content.slice(0, this.config.excerpt_length)} ...` : '';
        }
        document.html = excerpt;
        return document;
      });

      viewModel.meta = await this.buildMetadata({ title: `Search results for "${request.query.s}"` }, `/search/${request.query.s}`, 'noindex');
      viewModel.searchResults = await this.hooks.filter('render-search-results', viewModel.searchResults, this);
    }
    viewModel = await this.hooks.filter('view-model-search', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
    response.set('Cache-control', 'no-store, no-cache, max-age=0');
    response.render('search', viewModel);
  }

  /**
   * Renders the edit page using the `edit` template.
   *
   * Hooks:
   * - `filter` - `view-model-edit` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async edit(request, response, next) {
    debug('Edit Route');
    if (this.config.use_edit_key && (!request.params.key || request.params.key !== this.config.edit_key)) {
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
    } catch (error) {
      /* istanbul ignore next */
      debug('Error fetching document:', error);
    }

    if (!document) {
      debug('Missing document!');
      next();
      return;
    }

    const meta = await this.buildMetadata({ ...document, title: `Editing ${document.title}` }, `/${request.params.slug}/edit`);
    let viewModel = {
      title: `Editing ${document.title}`,
      document,
      config: this.config,
      meta,
      basePath: request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-edit', viewModel, this);
    response.set('X-Robots-Tag', 'noindex');
    response.set('Cache-control', 'no-store, no-cache, max-age=0');
    response.render('edit', viewModel);
  }

  /**
   * Attempts to delete a document and redirect to the homepage.
   * If the config `use_delete_key` value is true, the key is verified before deleting.
   *
   * Hooks:
   * - `dispatch` - `document-delete` - Passes in the document beind deleted.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async delete(request, response, next) {
    debug('Delete Route');
    if (this.config.use_delete_key && (!request.params.key || request.params.key !== this.config.delete_key)) {
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
    } catch (error) {
      /* istanbul ignore next */
      debug('Error fetching document:', error);
    }
    if (document) {
      this.hooks.dispatch('document-delete', document, this);
      debug('Deleting document', document);
      await this.hooks.fetch('storage-delete', slug, this);
      this.hooks.dispatch('search-delete', document, this);
      response.redirect(this.config.site_url);
    } else {
      debug('Nothing found to delete, next.');
      next();
    }
  }

  /**
   * Attempts to save the document and redirects to the detail view of that document when successful.
   *
   * Hooks:
   * - `validate` - `validate-save` - Passes in the request.
   * - `dispatch` - `validate-invalid` - Passes in the request.
   * - `dispatch` - `validate-valid` - Passes in the request.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async save(request, response, next) {
    debug('Save Route');
    if (this.config.use_edit_key && (!request.params.key || request.params.key !== this.config.edit_key)) {
      debug('save: Missing edit key, or a edit key mismatch!');
      next();
      return;
    }
    if (!request.body || (request.body && Object.keys(request.body).length === 0)) {
      debug('Missing body!');
      next();
      return;
    }
    // Check for spam or otherwise veryify, redirect back if true, continue to update if false.
    const invalid = await this.hooks.validate('validate-save', request, this);
    if (invalid) {
      debug('Invalid:', request.params.slug, JSON.stringify(request.body));
      this.hooks.dispatch('validate-invalid', request, this);
      response.redirect('back');
      return;
    }
    this.hooks.dispatch('validate-valid', request, this);
    await this.saveValid(request, response, next);
  }

  /**
   * Renders the new page using the `edit` template.
   *
   * Hooks:
   * - `filter` - `view-model-new` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async new(request, response, next) {
    debug('New Route');
    if (this.config.use_edit_key && (!request.params.key || request.params.key !== this.config.edit_key)) {
      debug('edit: Missing edit key, or a edit key mismatch!');
      next();
      return;
    }

    const title = 'New Document';
    const document = {
      slug: '',
      title,
    };

    const meta = await this.buildMetadata(document, '/new');
    let viewModel = {
      document,
      title,
      meta,
      config: this.config,
      basePath: request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-new', viewModel, this);
    response.set('X-Robots-Tag', 'noindex');
    response.set('Cache-control', 'no-store, no-cache, max-age=0');
    response.render('edit', viewModel);
  }

  /**
   * Renders the detail page using the `detail` template.
   *
   * Hooks:
   * - `render-content` - `render-content` - Passes in the document content.
   * - `filter` - `view-model-detail` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async detail(request, response, next) {
    debug('Detail Route');
    if (!request.params.slug) {
      debug('Missing slug.');
      next();
      return;
    }

    let document;
    try {
      [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
    } catch (error) {
      /* istanbul ignore next */
      debug('Error fetching document:', error);
    }

    if (!document) {
      debug('No document found for given slug:', request.params.slug);
      next();
      return;
    }

    document.html = await this.hooks.filter('render-content', document.content, this);

    const meta = await this.buildMetadata(document, `/${request.params.slug}`);

    let viewModel = {
      title: document.title,
      config: this.config,
      document,
      meta,
      basePath: request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-detail', viewModel, this);
    response.set('Cache-control', `public, max-age=${this.config.cache_short}`);
    response.render('detail', viewModel);
  }

  /**
   * Renders the history index page using the `history_index` template.
   * Sets the `X-Robots-Tag` header to `noindex`.
   *
   * Hooks:
   * - `filter` - `view-model-history-index` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async historyIndex(request, response, next) {
    debug('History Index Route');
    if (!request.params.slug) {
      debug('Missing slug.');
      next();
      return;
    }
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get', request.params.slug, this);
    } catch (error) {
      /* istanbul ignore next */
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
    } catch (error) {
      /* istanbul ignore next */
      debug('Error fetching history:', error);
    }

    /* istanbul ignore next */
    if (!Array.isArray(history) || history.length === 0) {
      debug('No history found for given slug:', request.params.slug);
      next();
      return;
    }

    const historyByDay = history.reduce((acc, value) => {
      /* istanbul ignore next */
      value = value.includes('-') ? value.split('-')[0] : value;
      const d = new Date(Number.parseInt(value, 10));
      const key = d.toISOString().split('T')[0];
      acc[key] = acc[key] || [];
      acc[key].push(value);
      return acc;
    }, {});

    const meta = await this.buildMetadata({
      ...document,
      title: `${document.title} Revision History`,
    }, `/${request.params.slug}/history`, 'noindex');

    debug('document.title:', document.title);
    let viewModel = {
      title: `${document.title} Revision History`,
      document,
      historyByDay,
      config: this.config,
      meta,
      basePath: request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-history-index', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
    response.set('Cache-control', `public, max-age=${this.config.cache_short}`);
    response.render('history_index', viewModel);
  }

  /**
   * Renders the history detail page using the `detail` template.
   * Sets the `X-Robots-Tag` header to `noindex`.
   *
   * Hooks:
   * - `render-content` - `render-content` - Passes in the document content.
   * - `filter` - `view-model-history-index` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async historyDetail(request, response, next) {
    debug('History Detail Route');
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
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get-revision', { slug, revision }, this);
    } catch (error) {
      /* istanbul ignore next */
      debug('Error fetching document:', error);
    }

    if (!document) {
      debug('No revision found for given slug & revision pair:', slug, revision);
      next();
      return;
    }

    document.html = await this.hooks.filter('render-content', document.content, this);

    const meta = await this.buildMetadata({
      ...document,
      title: `${document.title} Revision ${revision}`,
    }, `/${slug}/history/${revision}`, 'noindex');

    let viewModel = {
      basePath: request.baseUrl,
      config: this.config,
      title: `${document.title} Revision ${revision}`,
      document,
      meta,
      revision,
      slug,
    };
    viewModel = await this.hooks.filter('view-model-history-detail', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
    response.set('Cache-control', `public, max-age=${this.config.cache_long}`);
    response.render('detail', viewModel);
  }

  /**
   * Renders the history restore page using the `edit` template.
   * Sets the `X-Robots-Tag` header to `noindex`.
   *
   * Hooks:
   * - `filter` - `view-model-history-restore` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} next The Express Next function.
   */
  async historyRestore(request, response, next) {
    debug('History Restore Route');
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
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get-revision', { slug, revision }, this);
    } catch (error) {
      /* istanbul ignore next */
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
      basePath: request.baseUrl,
      config: this.config,
      title: `Editing ${document.title} from Revision ${revision}`,
      document,
      meta,
      revision,
      slug,
    };
    viewModel = await this.hooks.filter('view-model-history-restore', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
    response.set('Cache-control', `public, max-age=${this.config.cache_long}`);
    response.render('edit', viewModel);
  }

  /**
   * Renders the 404 Not Found page using the `404` template.
   * Sets the `X-Robots-Tag` header to `noindex`.
   *
   * Hooks:
   * - `filter` - `view-model-error-404` - Passes in the viewModel.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} _next The Express Next function.
   */
  async notFound(request, response, _next) {
    debug('404 Not Found Route');

    const meta = await this.buildMetadata({ title: '404 Not Found' }, '/404', 'noindex');
    let viewModel = {
      title: '404 Not Found',
      config: this.config,
      slug: request.params.slug || '404',
      meta,
      basePath: request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-error-404', viewModel, this);

    response.status(404);
    response.set('X-Robots-Tag', 'noindex');

    /* istanbul ignore else */
    if (request.accepts('html')) {
      response.render('404', viewModel);
      return;
    }

    /* istanbul ignore next */
    if (request.accepts('json')) {
      response.send({ error: 'Not found' });
      return;
    }

    /* istanbul ignore next */
    response.type('txt').send('Not found');
  }

  /**
   * Handles saving documents, and changing the slug of documents, then redirecting to the document.
   *
   * `title`, `excerpt`, and `content` will default to a blank string
   * `tags` is expected to be a comma delimited string in the request body, "tag-1,tag-2"
   * `slug` will be converted to lowercase and will use `request.body.slug` and fall back to `request.params.slug`.
   *
   * Hooks:
   * - `filter` - `document-save` - Passes in the document.
   *
   * @async
   * @param {Request} request The Express Request object.
   * @param {Response} response The Express Response object.
   * @param {Function} _next The Express Next function.
   */
  async saveValid(request, response, _next) {
    debug('saveValid');
    debug(`Updating with params: ${JSON.stringify(request.params, undefined, 2)}`);
    debug(`Updating with body: ${JSON.stringify(request.body, undefined, 2)}`);

    const { title = '', excerpt = '', content = '' } = request.body;

    // Filter out any unwanted keys
    const custom = this.config.allowedDocumentKeys.reduce((output, key) => {
      if (request.body[key]) {
        output[key] = request.body[key];
      }
      return output;
    }, {});

    // Normalize tags before save
    let tags = typeof request.body.tags === 'string' ? request.body.tags.split(',') : [];
    tags = [...new Set(tags.map((t) => t.trim()))].filter(Boolean).sort((a, b) => a.localeCompare(b));

    let slug = request.body.slug || request.params.slug;
    slug = slug.toLowerCase();

    let document = {
      ...custom,
      title,
      excerpt,
      content,
      tags,
      slug,
    };
    document = await this.hooks.filter('document-save', document, this);

    // Save document
    const originalSlug = request.body['original-slug'];
    await this.hooks.fetch('storage-update', { document, originalSlug }, this);
    this.hooks.dispatch('search-update', [{ document, originalSlug }], this);

    response.redirect(`${this.config.site_url}/${slug}`);
  }

  /**
   * Returns the documents with the provided tag, up to the provided limit.
   * This will exclude any documents that have slugs in the `config.ignore_slugs` array.
   *
   * @async
   * @param {string} tag The tag to look for in documents.
   * @param {number} [limit=1024] The maximum number of documents to be returned.
   * @returns {Promise<Array>} Promise object that resolves to the array of the documents.
   * @example
   * wiki.getTaggedDocuments('example', 10);
   * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
   */
  async getTaggedDocuments(tag, limit = 1024) {
    debug('getTaggedDocuments:', tag, limit);
    let results = [];
    try {
      const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
      const query = `SELECT 'slug', 'title', 'tags', 'updateDate' FROM documents WHERE slug NOT_IN (${ignore_slugs}) AND tags INCLUDES "${tag}" ORDER BY title ASC LIMIT ${limit}`;
      [results] = await this.hooks.fetch('storage-query', query, this);
    } catch (error) {
      /* istanbul ignore next */
      debug('getTaggedDocuments Error:', error);
    }
    return results.filter(Boolean);
  }
}

module.exports = UttoriWiki;
