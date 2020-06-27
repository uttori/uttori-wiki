const debug = require('debug')('Uttori.Wiki');
const R = require('ramda');
const Document = require('uttori-document');
const { EventDispatcher } = require('@uttori/event-dispatcher');
const defaultConfig = require('./config');

const asyncHandler = (fn) => (request, response, next) => Promise.resolve(fn(request, response, next)).catch(next);

/**
 * UttoriWiki is a fast, simple, wiki knowledge base.
 *
 * @property {object} config - The configuration object.
 * @property {EventDispatcher} hooks - The hook / event dispatching object.
 * @property {object} server - The Express server instance (only exposed when testing).
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
 * @param {object} config - A configuration object.
 * @param {object} server - The Express server instance.
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

    // Expose server to tests.
    /* istanbul ignore next */
    if (process.env.NODE_ENV === 'test') {
      this.server = server;
    }

    // Bind functions.
    this.registerPlugins = this.registerPlugins.bind(this);
    this.validateConfig = this.validateConfig.bind(this);
    this.buildMetadata = this.buildMetadata.bind(this);
    this.bindRoutes = this.bindRoutes.bind(this);
    this.home = this.home.bind(this);
    this.homepageRedirect = this.homepageRedirect.bind(this);
    this.tagIndex = this.tagIndex.bind(this);
    this.tag = this.tag.bind(this);
    this.search = this.search.bind(this);
    this.edit = this.edit.bind(this);
    this.delete = this.delete.bind(this);
    this.save = this.save.bind(this);
    this.new = this.new.bind(this);
    this.detail = this.detail.bind(this);
    this.historyIndex = this.historyIndex.bind(this);
    this.historyDetail = this.historyDetail.bind(this);
    this.historyRestore = this.historyRestore.bind(this);
    this.notFound = this.notFound.bind(this);
    this.saveValid = this.saveValid.bind(this);
    this.getSiteSections = this.getSiteSections.bind(this);
    this.getTaggedDocuments = this.getTaggedDocuments.bind(this);
    this.getSearchResults = this.getSearchResults.bind(this);

    // Bind routes.
    this.bindRoutes(server);
  }

  /**
   * Registers plugins with the Event Dispatcher.
   *
   * @param {object} config - A configuration object.
   * @param {object[]} config.plugins - A collection of plugins to register.
   */
  registerPlugins(config) {
    if (!config.plugins || !Array.isArray(config.plugins)) {
      debug('No plugins configuration provided or plugins is not an Array, skipping.');
      return;
    }
    if (config.plugins.length > 0) {
      debug('Registering Plugins: ', config.plugins.length);
      config.plugins.forEach(async (plugin) => {
        /* istanbul ignore next */
        try {
          plugin.register(this);
        } catch (error) {
          debug('Plugin Error:', plugin);
          debug('Plugin Error:', error);
        }
      });
      debug('Registered Plugins');
    }
  }

  /**
   * Validates the config.
   *
   * Hooks:
   * - `dispatch` - `validate-config` - Passes in the config object.
   *
   * @param {object} config - A configuration object.
   * @param {string} config.theme_dir - The path to the theme directory.
   * @param {string} config.public_dir - The path to the public facing directory.
   */
  validateConfig(config) {
    debug('Validating config...');
    if (!config.theme_dir) {
      debug('Config Error: No theme_dir provided.');
      throw new Error('No theme_dir provided.');
    }
    if (!config.public_dir) {
      debug('Config Error: No public_dir provided.');
      throw new Error('No public_dir provided.');
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
   * @param {object} [document={}] - A configuration object.
   * @param {string} [document.excerpt] - The meta description to be used.
   * @param {string} [document.content] - The document content to be used as a backup meta description when excerpt is not provided.
   * @param {number} [document.updateDate] - The Unix timestamp of the last update date to the document.
   * @param {number} [document.createDate] - The Unix timestamp of the creation date of the document.
   * @param {string} [document.title] - The document title to be used in meta data.
   * @param {string} [path=''] - The URL path to build meta data for.
   * @param {string} [robots=''] - A meta robots tag value.
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
   * @returns {Promise<object>} Metadata object.
   */
  async buildMetadata(document = {}, path = '', robots = '') {
    const canonical = `${this.config.site_url}/${path.trim()}`;

    let description = document && document.excerpt ? document.excerpt : '';
    if (document && document.content && !description) {
      /* istanbul ignore next */
      description = document && document.content ? `${document.content.slice(0, 160)}` : '';
      description = await this.hooks.filter('render-content', description, this);
    }

    const image = '';
    const modified = document && document.updateDate ? new Date(document.updateDate).toISOString() : '';
    const published = document && document.createDate ? new Date(document.createDate).toISOString() : '';
    const title = document && document.title ? document.title : this.config.site_title;

    let metadata = {
      canonical,
      description,
      image,
      modified,
      published,
      robots,
      title,
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
   * @param {object} server - The Express server instance.
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
    server.get('/new', asyncHandler(this.new.bind(this)));
    server.get('/:slug/edit', asyncHandler(this.edit.bind(this)));
    server.get('/:slug/delete/:key', asyncHandler(this.delete.bind(this)));
    server.get('/:slug/history', asyncHandler(this.historyIndex.bind(this)));
    server.get('/:slug/history/:revision', asyncHandler(this.historyDetail.bind(this)));
    server.get('/:slug/history/:revision/restore', asyncHandler(this.historyRestore.bind(this)));
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
   * @param {Request} request - The Express Request object.
   * @param {Response} response - The Express Response object.
   * @param {Function} next - The Express Next function.
   */
  async home(request, response, next) {
    debug('Home Route');
    let homeDocument;
    try {
      [homeDocument] = await this.hooks.fetch('storage-get', this.config.home_page, this);
    } catch (error) {
      /* istanbul ignore next */
      debug('Error loading home document:', error);
    }
    if (!homeDocument) {
      debug('Missing home document');
      next();
      return;
    }
    /* istanbul ignore else */
    if (homeDocument) {
      homeDocument.html = await this.hooks.filter('render-content', homeDocument.content, this);
    }

    const siteSections = await this.getSiteSections();
    const meta = await this.buildMetadata(homeDocument, '');

    let viewModel = {
      title: 'Home',
      config: this.config,
      siteSections,
      homeDocument,
      meta,
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-home', viewModel, this);
    response.render('home', viewModel);
  }

  /**
   * Redirects to the homepage.
   *
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} _next - The Express Next function.
   */
  homepageRedirect(request, response, _next) {
    debug('homepageRedirect:', this.config.home_page);
    response.redirect(301, `${request.protocol}://${request.hostname}/`);
  }

  /**
   * Renders the tag index page with the `tags` template.
   *
   * Hooks:
   * - `filter` - `view-model-tag-index` - Passes in the viewModel.
   *
   * @async
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} _next - The Express Next function.
   */
  async tagIndex(request, response, _next) {
    debug('Tag Index Route');
    const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
    const query = `SELECT tags FROM documents WHERE slug NOT_IN (${ignore_slugs}) ORDER BY updateDate DESC LIMIT -1`;
    let tags = [];
    try {
      [tags] = await this.hooks.fetch('storage-query', query, this);
    } catch (error) {
      /* istanbul ignore next */
      debug('Error loading tags:', error);
    }

    tags = R.pipe(
      R.pluck('tags'),
      R.flatten,
      R.map(R.trim),
      R.uniq,
      R.filter(R.identity),
      R.sort((a, b) => a.localeCompare(b)),
    )(tags);

    const taggedDocuments = {};
    Promise.all(tags.map(async (tag) => {
      taggedDocuments[tag] = await this.getTaggedDocuments(tag);
    }));

    const siteSections = await this.getSiteSections();
    const meta = await this.buildMetadata({}, '/tags');

    let viewModel = {
      title: 'Tags',
      config: this.config,
      taggedDocuments,
      siteSections,
      meta,
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-tag-index', viewModel, this);

    response.render('tags', viewModel);
  }

  /**
   * Renders the tag detail page with `tag` template.
   * Sets the `X-Robots-Tag` header to `noindex`.
   *
   * Hooks:
   * - `filter` - `view-model-tag` - Passes in the viewModel.
   *
   * @async
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} next - The Express Next function.
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

    let viewModel = {
      title: request.params.tag,
      config: this.config,
      taggedDocuments,
      section: R.find(R.propEq('tag', request.params.tag))(this.config.site_sections) || {},
      siteSections: this.config.site_sections,
      meta,
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-tag', viewModel, this);

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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} _next - The Express Next function.
   */
  async search(request, response, _next) {
    debug('Search Route');
    const meta = await this.buildMetadata({ title: 'Search' }, '/search');
    let viewModel = {
      title: 'Search',
      config: this.config,
      searchTerm: '',
      meta,
      basePath: request.proxyUrl || request.baseUrl,
    };
    /* istanbul ignore else */
    if (request.query && request.query.s) {
      const term = decodeURIComponent(request.query.s);
      viewModel.title = `Search results for "${request.query.s}"`;
      viewModel.searchTerm = term;
      const searchResults = await this.getSearchResults(term, 10);
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
    response.render('search', viewModel);
  }

  /**
   * Renders the edit page using the `edit` template.
   *
   * Hooks:
   * - `filter` - `view-model-edit` - Passes in the viewModel.
   *
   * @async
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} next - The Express Next function.
   */
  async edit(request, response, next) {
    debug('Edit Route');
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
      debug('Error loading document:', error);
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
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-edit', viewModel, this);

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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} next - The Express Next function.
   */
  async delete(request, response, next) {
    debug('Delete Route');
    if (!request.params.slug) {
      debug('delete: Missing slug!');
      next();
      return;
    }
    /* istanbul ignore else */
    if (this.config.use_delete_key) {
      if (!request.params.key || request.params.key !== this.config.delete_key) {
        debug('delete: Missing delete key, or a delete key mismatch!');
        next();
        return;
      }
    }

    const { slug } = request.params;
    let document;
    try {
      [document] = await this.hooks.fetch('storage-get', slug, this);
    } catch (error) {
      /* istanbul ignore next */
      debug('Error loading document:', error);
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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} next - The Express Next function.
   */
  async save(request, response, next) {
    debug('Save Route');
    if (!request.params.slug && !request.body.slug) {
      debug('Missing slug!');
      next();
      return;
    }
    if (!request.body || Object.keys(request.body).length === 0) {
      debug('Missing body!');
      next();
      return;
    }
    // Check for spam or otherwise veryify, redirect back if true, continue to update if false.
    const invalid = await this.hooks.validate('validate-save', request, this);
    if (invalid) {
      debug('Invalid:', request.params.slug, JSON.stringify(request.body));
      this.hooks.dispatch('validate-invalid', request, this);
      response.redirect(request.header('Referer') || '/');
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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} _next - The Express Next function.
   */
  async new(request, response, _next) {
    debug('New Route');
    const document = new Document();
    document.slug = '';
    document.title = 'New Document';

    const meta = await this.buildMetadata(document, '/new');
    let viewModel = {
      document,
      title: document.title,
      config: this.config,
      meta,
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-new', viewModel, this);

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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} next - The Express Next function.
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
      debug('Error loading document:', error);
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
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-detail', viewModel, this);

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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} next - The Express Next function.
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
      debug('Error loading document:', error);
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
      debug('Error loading history:', error);
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
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-history-index', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} next - The Express Next function.
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
      debug('Error loading document:', error);
    }

    if (!document) {
      debug('No revision found for given slug & revision pair:', request.params.slug, request.params.revision);
      next();
      return;
    }

    document.html = await this.hooks.filter('render-content', document.content, this);

    const meta = await this.buildMetadata({
      ...document,
      title: `${document.title} Revision ${request.params.revision}`,
    }, `/${request.params.slug}/history/${request.params.revision}`, 'noindex');

    let viewModel = {
      title: `${document.title} Revision ${request.params.revision}`,
      config: this.config,
      document,
      revision: request.params.revision,
      meta,
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-history-detail', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} next - The Express Next function.
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
      debug('Error loading document:', error);
    }

    if (!document) {
      debug('No revision found for given slug & revision pair:', request.params.slug, request.params.revision);
      next();
      return;
    }

    const meta = await this.buildMetadata({
      ...document,
      title: `Editing ${document.title} from Revision ${request.params.revision}`,
    }, `/${request.params.slug}/history/${request.params.revision}/restore`, 'noindex');

    let viewModel = {
      title: `Editing ${document.title} from Revision ${request.params.revision}`,
      document,
      revision: request.params.revision,
      config: this.config,
      meta,
      basePath: request.proxyUrl || request.baseUrl,
    };
    viewModel = await this.hooks.filter('view-model-history-restore', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
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
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} _next - The Express Next function.
   */
  async notFound(request, response, _next) {
    debug('404 Not Found Route');

    const meta = await this.buildMetadata({ title: '404 Not Found' }, '/404', 'noindex');
    let viewModel = {
      title: '404 Not Found',
      config: this.config,
      slug: request.params.slug || '404',
      meta,
      basePath: request.proxyUrl || request.baseUrl,
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
   * Handles saving documents, and changing the slug of documents, the redirecting to the document.
   *
   * Hooks:
   * - `filter` - `document-save` - Passes in the document.
   *
   * @async
   * @param {object} request - The Express Request object.
   * @param {object} response - The Express Response object.
   * @param {Function} _next - The Express Next function.
   */
  async saveValid(request, response, _next) {
    debug('saveValid');
    debug(`Updating with params: ${JSON.stringify(request.params, undefined, 2)}`);
    debug(`Updating with body: ${JSON.stringify(request.body, undefined, 2)}`);

    // Create document from form
    let document = new Document();
    document.title = request.body.title;
    document.excerpt = request.body.excerpt;
    document.content = request.body.content;

    // Normalize tags before save
    let tags = request.body.tags ? request.body.tags.split(',') : [];
    tags = R.pipe(
      R.map(R.trim),
      R.uniq,
      R.filter(R.identity),
      R.sort((a, b) => a.localeCompare(b)),
    )(tags);
    document.tags = tags;

    document.slug = request.body.slug || request.params.slug;
    document.slug = document.slug.toLowerCase();
    /* istanbul ignore next */
    document.customData = R.isEmpty(request.body.customData) ? {} : request.body.customData;

    document = await this.hooks.filter('document-save', document, this);

    // Save document
    const originalSlug = request.body['original-slug'];
    await this.hooks.fetch('storage-update', { document, originalSlug }, this);
    this.hooks.dispatch('search-update', [{ document, originalSlug }], this);

    response.redirect(`${this.config.site_url}/${document.slug}`);
  }

  /**
   * Returns the site sections from the configuration with their tagged document count.
   *
   * @async
   * @example
   * wiki.getSiteSections();
   * ➜ [{ title: 'Example', description: 'Example description text.', tag: 'example', documentCount: 10 }]
   * @returns {Promise<Array>} Promise object that resolves to the array of site sections.
   */
  async getSiteSections() {
    debug('getSiteSections');
    return Promise.all(this.config.site_sections.map(async (section) => {
      const documents = await this.getTaggedDocuments(section.tag);
      const documentCount = documents.length;
      return {
        ...section,
        documentCount,
      };
    }));
  }

  /**
   * Returns the documents with the provided tag, up to the provided limit.
   * This will exclude any documents that have slugs in the `config.ignore_slugs` array.
   *
   * @async
   * @param {string} tag - The tag to look for in documents.
   * @param {number} limit - The maximum number of documents to be returned.
   * @example
   * wiki.getTaggedDocuments('example', 10);
   * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
   * @returns {Promise<Array>} Promise object that resolves to the array of the documents.
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
    return R.reject(R.isNil, results);
  }

  /**
   * Returns the documents that match the provided query string, up to the provided limit.
   * This will exclude any documents that have slugs in the `config.ignore_slugs` array.
   *
   * @async
   * @param {string} query - The query to look for in documents.
   * @param {number} limit - The maximum number of documents to be returned.
   * @example
   * wiki.getSearchResults('needle', 10);
   * ➜ [{ slug: 'example', title: 'Example', content: 'Haystack neelde haystack.', tags: ['example'] }]
   * @returns {Promise<Array>} Promise object that resolves to the array of the documents.
   */
  async getSearchResults(query, limit) {
    debug('getSearchResults:', query, limit);
    let results = [];
    try {
      [results] = await this.hooks.fetch('search-query', { query, limit }, this);
    } catch (error) {
      /* istanbul ignore next */
      debug('getSearchResults Error:', error);
    }
    return R.reject(R.isNil, results);
  }
}

module.exports = UttoriWiki;
