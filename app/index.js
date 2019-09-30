const debug = require('debug')('Uttori.Wiki');
const R = require('ramda');
const Document = require('uttori-document');
const { EventDispatcher } = require('uttori-utilities');
const defaultConfig = require('./config.default.js');

const asyncHandler = (fn) => (request, response, next) => Promise
  .resolve(fn(request, response, next))
  .catch(next);

class UttoriWiki {
  constructor(config, server) {
    debug('Contructing...');
    if (!config) {
      debug('No config provided.');
      throw new Error('No config provided.');
    }
    if (!server) {
      debug('No server provided.');
      throw new Error('No server provided.');
    }

    // Setup configuration with defaults applied and overwritten with passed in custom values.
    this.config = { ...defaultConfig, ...config };

    // Instantiate the event bus / event dispatcher / hooks systems, as we will need it for every other step.
    this.hooks = new EventDispatcher();

    // Register any plugins found in the configuration.
    this.registerPlugins(this.config);

    // Validate the configuration and allow plugins to validate their own configruation.
    this.validateConfig(this.config);

    if (config.skip_setup !== true) {
      this.setup();
    }

    // Bind routes and expose the server for testing.
    this.server = server;
    this.bindRoutes(server);
  }

  async setup() {
    debug('Setting up...');
    // Storage
    this.storageProvider = new this.config.StorageProvider(this.config.storageProviderConfig);

    // Analytics
    this.analyticsProvider = new this.config.AnalyticsProvider(this.config.analyticsProviderConfig);

    // Uploads
    this.uploadProvider = new this.config.UploadProvider(this.config.uploadProviderConfig);

    // Search
    this.searchProvider = new this.config.SearchProvider(this.config.searchProviderConfig);
    await this.searchProvider.setup(this.storageProvider);

    debug('Setup complete!');
  }

  registerPlugins(config) {
    if (!config.plugins || !Array.isArray(config.plugins)) {
      debug('No plugins configuration provided or plugins is not an Array, skipping.');
      return;
    }
    if (config.plugins.length > 0) {
      debug('Registering Plugins: ', config.plugins.length);
      config.plugins.forEach(async (plugin) => {
        /* istanbul ignore next */
        if (plugin.startsWith('uttori-plugin-')) {
          // eslint-disable-next-line security/detect-non-literal-require
          const instance = require(plugin);
          await instance.register(this);
        } else {
          debug(`Plugins must begin with 'uttori-plugin-', you provided: ${plugin}`);
        }
      });
      debug('Registered Plugins');
    }
  }

  validateConfig(config) {
    debug('Validating config...');
    if (!config.StorageProvider) {
      debug('Config Error: No StorageProvider provided.');
      throw new Error('No StorageProvider provided.');
    }
    if (!config.AnalyticsProvider) {
      debug('Config Error: No AnalyticsProvider provided.');
      throw new Error('No AnalyticsProvider provided.');
    }
    if (!config.SearchProvider) {
      debug('Config Error: No SearchProvider provided.');
      throw new Error('No SearchProvider provided.');
    }
    if (!config.UploadProvider) {
      debug('Config Error: No UploadProvider provided.');
      throw new Error('No UploadProvider provided.');
    }
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

  bindRoutes(server) {
    debug('Binding routes...');
    // Order: Home, Tags, Search, Placeholders, Document, Not Found
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
    server.post('/upload', asyncHandler(this.upload.bind(this)));

    // Not Found - Catch All
    server.get('/*', asyncHandler(this.notFound.bind(this)));

    this.hooks.dispatch('bind-routes', server, this);

    debug('Bound routes.');
  }

  async home(request, response, _next) {
    debug('Home Route');
    const homeDocument = await this.storageProvider.get(this.config.home_page);
    /* istanbul ignore else */
    if (homeDocument) {
      homeDocument.html = await this.hooks.filter('render-content', homeDocument.content, this);
    }

    const recentDocuments = await this.getRecentDocuments(5);
    const randomDocuments = await this.getRandomDocuments(5);
    const popularDocuments = await this.getPopularDocuments(5);
    const siteSections = await this.getSiteSections();
    const meta = await this.buildMetadata(homeDocument, '');

    let viewModel = {
      title: 'Home',
      config: this.config,
      recentDocuments,
      randomDocuments,
      popularDocuments,
      siteSections,
      homeDocument,
      meta,
    };
    viewModel = await this.hooks.filter('view-model-home', viewModel, this);

    response.render('home', viewModel);
  }

  /* eslint-disable class-methods-use-this */
  homepageRedirect(request, response, _next) {
    debug('homepageRedirect');
    return response.redirect(301, `${request.protocol}://${request.hostname}/`);
  }
  /* eslint-enable class-methods-use-this */

  async tagIndex(request, response, _next) {
    debug('Tag Index Route');
    const tags = await this.storageProvider.tags();

    const taggedDocuments = {};
    Promise.all(tags.map(async (tag) => {
      taggedDocuments[tag] = await this.getTaggedDocuments(tag);
    }));

    const recentDocuments = await this.getRecentDocuments(5);
    const randomDocuments = await this.getRandomDocuments(5);
    const popularDocuments = await this.getPopularDocuments(5);
    const siteSections = await this.getSiteSections();
    const meta = await this.buildMetadata({}, '/tags');

    let viewModel = {
      title: 'Tags',
      config: this.config,
      taggedDocuments,
      recentDocuments,
      randomDocuments,
      popularDocuments,
      siteSections,
      meta,
    };
    viewModel = await this.hooks.filter('view-model-tag-index', viewModel, this);

    response.render('tags', viewModel);
  }

  async tag(request, response, next) {
    debug('Tag Route');
    const taggedDocuments = await this.getTaggedDocuments(request.params.tag);
    if (taggedDocuments.length === 0) {
      debug('No documents for tag!');
      next();
      return;
    }

    const recentDocuments = await this.getRecentDocuments(5);
    const randomDocuments = await this.getRandomDocuments(5);
    const popularDocuments = await this.getPopularDocuments(5);
    const meta = await this.buildMetadata({}, `/tags/${request.params.tag}`);

    let viewModel = {
      title: request.params.tag,
      config: this.config,
      recentDocuments,
      randomDocuments,
      popularDocuments,
      taggedDocuments,
      section: R.find(R.propEq('tag', request.params.tag))(this.config.site_sections) || {},
      siteSections: this.config.site_sections,
      meta,
    };
    viewModel = await this.hooks.filter('view-model-tag', viewModel, this);

    response.render('tag', viewModel);
  }

  async search(request, response, _next) {
    debug('Search Route');
    const meta = await this.buildMetadata({ title: 'Search' }, '/search');
    let viewModel = {
      title: 'Search',
      config: this.config,
      searchTerm: '',
      meta,
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

  async edit(request, response, next) {
    debug('Edit Route');
    if (!request.params.slug) {
      debug('Missing slug!');
      next();
      return;
    }
    const document = await this.storageProvider.get(request.params.slug);
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
    };
    viewModel = await this.hooks.filter('view-model-edit', viewModel, this);

    response.render('edit', viewModel);
  }

  async delete(request, response, next) {
    debug('Delete Route');
    /* istanbul ignore else */
    if (this.config.use_delete_key) {
      if (!request.params.key || request.params.key !== this.config.delete_key) {
        debug('Missing delete key, or a delete key mismatch!');
        next();
        return;
      }
    }
    if (!request.params.slug) {
      debug('Missing slug!');
      next();
      return;
    }

    const { slug } = request.params;
    const document = await this.storageProvider.get(slug);
    if (document) {
      this.hooks.dispatch('document-delete', document, this);
      debug('Deleting document', document);
      await this.storageProvider.delete(slug);
      await this.searchProvider.indexRemove([document]);
      response.redirect(this.config.site_url);
    } else {
      debug('Nothing found to delete, next.');
      next();
    }
  }

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
    this.saveValid(request, response, next);
  }

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
    };
    viewModel = await this.hooks.filter('view-model-new', viewModel, this);

    response.render('edit', viewModel);
  }

  async detail(request, response, next) {
    debug('Detail Route');
    if (!request.params.slug) {
      debug('Missing slug.');
      next();
      return;
    }

    const document = await this.storageProvider.get(request.params.slug);
    if (!document) {
      debug('No document found for given slug:', request.params.slug);
      next();
      return;
    }

    document.html = await this.hooks.filter('render-content', document.content, this);

    const recentDocuments = await this.getRecentDocuments(5);
    const relatedDocuments = await this.getRelatedDocuments(document, 5);
    const popularDocuments = await this.getPopularDocuments(5);
    const meta = await this.buildMetadata(document, `/${request.params.slug}`);

    let viewModel = {
      title: document.title,
      config: this.config,
      document,
      popularDocuments,
      relatedDocuments,
      recentDocuments,
      meta,
    };
    viewModel = await this.hooks.filter('view-model-detail', viewModel, this);

    response.render('detail', viewModel);
  }

  async historyIndex(request, response, next) {
    debug('History Index Route');
    if (!request.params.slug) {
      debug('Missing slug.');
      next();
      return;
    }
    const document = await this.storageProvider.get(request.params.slug);
    if (!document) {
      debug('No document found for given slug:', request.params.slug);
      next();
      return;
    }
    const history = await this.storageProvider.getHistory(request.params.slug);
    const historyByDay = history.reduce((acc, value) => {
      const d = new Date(parseInt(value, 10));
      const key = d.toISOString().split('T')[0];
      acc[key] = acc[key] || [];
      acc[key].push(value);
      return acc;
    }, {});
    const meta = await this.buildMetadata({
      ...document,
      title: `${document.title} Revision History`,
    }, `/${request.params.slug}/history`, 'noindex');

    let viewModel = {
      title: `${document.title} Revision History`,
      document,
      historyByDay,
      config: this.config,
      meta,
    };
    viewModel = await this.hooks.filter('view-model-history-index', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
    response.render('history_index', viewModel);
  }

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
    const document = await this.storageProvider.getRevision(request.params.slug, request.params.revision);
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
    };
    viewModel = await this.hooks.filter('view-model-history-detail', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
    response.render('detail', viewModel);
  }

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
    const document = await this.storageProvider.getRevision(request.params.slug, request.params.revision);
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
    };
    viewModel = await this.hooks.filter('view-model-history-restore', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
    response.render('edit', viewModel);
  }

  upload(request, response, _next) {
    debug('Upload Route');
    this.uploadProvider.storeFile(request, response, (error) => {
      let status = 200;
      let send = request.file.filename;
      /* istanbul ignore next */
      if (error) {
        debug('Upload Error:', error);
        status = 422;
        send = error;
      }

      this.hooks.dispatch('file-upload', request.file, this);

      return response.status(status).send(send);
    });
  }

  // 404
  async notFound(request, response, _next) {
    debug('404 Not Found Route');

    const meta = await this.buildMetadata({ title: '404 Not Found' }, '/404', 'noindex');
    let viewModel = {
      title: '404 Not Found',
      config: this.config,
      slug: request.params.slug || '404',
      meta,
    };
    viewModel = await this.hooks.filter('error-404', viewModel, this);

    response.set('X-Robots-Tag', 'noindex');
    response.render('404', viewModel);
  }

  // Helpers
  async saveValid(request, response, _next) {
    debug(`Updating with params: ${JSON.stringify(request.params, null, 2)}`);
    debug(`Updating with body: ${JSON.stringify(request.body, null, 2)}`);

    // Create document from form
    let document = new Document();
    document.title = request.body.title;
    document.excerpt = request.body.excerpt;
    document.content = request.body.content;
    document.tags = request.body.tags ? request.body.tags.split(',') : [];
    document.slug = request.body.slug || request.params.slug;
    document.slug = document.slug.toLowerCase();
    /* istanbul ignore next */
    document.customData = R.isEmpty(request.body.customData) ? {} : request.body.customData;

    document = await this.hooks.filter('document-save', document, this);

    // Save document
    const originalSlug = request.body['original-slug'];
    await this.storageProvider.update(document, originalSlug);
    await this.searchProvider.indexUpdate([document]);

    // Remove old document if one existed
    if (originalSlug && originalSlug.length > 0 && originalSlug !== document.slug) {
      debug(`Changing slug from "${originalSlug}" to "${document.slug}", cleaning up old files.`);
      await this.storageProvider.delete(originalSlug);
      await this.searchProvider.indexRemove([{ slug: originalSlug }]);
    }

    response.redirect(`${this.config.site_url}/${document.slug}`);
  }

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

  async getRecentDocuments(limit) {
    debug('getRecentDocuments:', limit);
    let results = [];
    try {
      const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
      results = await this.storageProvider.getQuery(`SELECT * FROM documents WHERE slug NOT_IN (${ignore_slugs}) ORDER BY updateDate DESC LIMIT ${limit}`);
    } catch (error) {
      /* istanbul ignore next */
      debug('getRecentDocuments Error:', error);
    }
    return R.reject(R.isNil, results);
  }

  async getPopularDocuments(limit) {
    debug('getPopularDocuments:', limit);
    let results = [];
    let popular = [];
    try {
      popular = await this.analyticsProvider.getPopularDocuments(limit);
      debug('popular:', popular);
      if (popular.length > 0) {
        popular = R.reverse(R.pluck('slug')(popular));
        const slugs = `"${popular.join('", "')}"`;
        const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
        results = await this.storageProvider.getQuery(`SELECT * FROM documents WHERE slug NOT_IN (${ignore_slugs}) AND slug IN (${slugs}) ORDER BY updateDate DESC LIMIT ${limit}`);
        results = R.sortBy(R.pipe(R.prop('slug'), R.indexOf(R.__, popular)))(results);
      } else {
        debug('No popular documents returned from AnalyticsProvider');
      }
    } catch (error) {
      /* istanbul ignore next */
      debug('getPopularDocuments Error:', error);
    }
    return R.reject(R.isNil, results);
  }

  async getRandomDocuments(limit) {
    debug('getRandomDocuments:', limit);
    let results = [];
    try {
      const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
      results = await this.storageProvider.getQuery(`SELECT * FROM documents WHERE slug NOT_IN (${ignore_slugs}) ORDER BY RANDOM LIMIT ${limit}`);
    } catch (error) {
      /* istanbul ignore next */
      debug('getRandomDocuments Error:', error);
    }
    return R.reject(R.isNil, results);
  }

  async getTaggedDocuments(tag, limit = 1024) {
    debug('getTaggedDocuments:', tag, limit);
    let results = [];
    try {
      const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
      const query = `SELECT 'slug', 'title', 'tags', 'updateDate' FROM documents WHERE slug NOT_IN (${ignore_slugs}) AND tags INCLUDES "${tag}" ORDER BY title ASC LIMIT ${limit}`;
      results = await this.storageProvider.getQuery(query);
    } catch (error) {
      /* istanbul ignore next */
      debug('getTaggedDocuments Error:', error);
    }
    return R.reject(R.isNil, results);
  }

  async getRelatedDocuments(document, limit) {
    debug('getRelatedDocuments:', document, limit);
    let results = [];
    /* istanbul ignore else */
    if (document && Array.isArray(document.tags)) {
      try {
        const tags = `("${document.tags.join('", "')}")`;
        const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
        const query = `SELECT 'slug', 'title', 'tags', 'updateDate' FROM documents WHERE slug NOT_IN (${ignore_slugs}) AND tags INCLUDES ${tags} ORDER BY title ASC LIMIT ${limit}`;
        results = await this.storageProvider.getQuery(query);
      } catch (error) {
        /* istanbul ignore next */
        debug('getRelatedDocuments Error:', error);
      }
    }
    return R.reject(R.isNil, results);
  }

  async getSearchResults(query, limit) {
    debug('getSearchResults:', query, limit);
    let results = [];
    try {
      const search_results = await this.searchProvider.search(query, limit);
      /* istanbul ignore else */
      if (this.searchProvider.shouldAugment(query, ['slug', 'title', 'excerpt', 'content'])) {
        const ignore_slugs = `"${this.config.ignore_slugs.join('", "')}"`;
        const slugs = `"${R.pluck('slug', search_results).join('", "')}"`;
        results = await this.storageProvider.getQuery(`SELECT * FROM documents WHERE slug NOT_IN (${ignore_slugs}) AND slug IN (${slugs}) ORDER BY updateDate DESC LIMIT ${limit}`);
        results = R.sortBy(R.pipe(R.prop('slug'), R.indexOf(R.__, R.pluck('slug', search_results))))(results);
      }
    } catch (error) {
      /* istanbul ignore next */
      debug('getSearchResults Error:', error);
    }
    return R.reject(R.isNil, results);
  }
}

module.exports = UttoriWiki;
