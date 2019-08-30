const debug = require('debug')('Uttori.Wiki');
const R = require('ramda');
const Document = require('uttori-document');
const UttoriSitemap = require('./sitemap');
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

    this.config = { ...defaultConfig, ...config };

    UttoriWiki.validateConfig(this.config);

    this.server = server;

    // reCaptcha Spam Prevention
    this.recaptcha = undefined;

    if (config.skip_setup !== true) {
      this.setup();
    }
    this.bindRoutes();
  }

  async setup() {
    debug('Setting up...');
    /* istanbul ignore next */
    if (this.config.use_recaptcha) {
      this.spam(this.config);
    }
    // Rendering
    this.renderer = new this.config.Renderer(this.config);

    // Storage
    this.storageProvider = new this.config.StorageProvider(this.config);

    // Analytics
    this.analyticsProvider = new this.config.AnalyticsProvider(this.config.analyticsProviderConfig);

    // Uploads
    this.uploadProvider = new this.config.UploadProvider(this.config);

    // Search
    const documents = await this.getDocuments(['title', 'slug', 'content', 'tags']);
    this.searchProvider = new this.config.SearchProvider(this.config);
    await this.searchProvider.setup({ documents });
    debug('Setup complete!');
  }

  spam(config) {
    debug('Setting up reCaptcha...');
    let message;
    if (!config.recaptcha_site_key) {
      message = 'Error initializing reCaptcha: missing config variable recaptcha_site_key';
      debug(message);
      throw new Error(message);
    }
    if (!config.recaptcha_secret_key) {
      message = 'Error initializing reCaptcha: missing config variable recaptcha_secret_key';
      debug(message);
      throw new Error(message);
    }
    /* istanbul ignore next */
    try {
      const { Recaptcha } = require('express-recaptcha');
      this.recaptcha = new Recaptcha(config.recaptcha_site_key, config.recaptcha_secret_key);
      debug('Setup reCaptcha!');
    } catch (error) {
      message = 'Error initializing reCaptcha:';
      debug(message, error);
      throw new Error(message, error);
    }
  }

  static validateConfig(config) {
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
    if (!config.Renderer) {
      debug('Config Error: No Renderer provided.');
      throw new Error('No Renderer provided.');
    }
    if (!Array.isArray(config.sitemap)) {
      debug('Config Error: `sitemap` should be an array.');
      throw new Error('sitemap should be an array.');
    }
    if (config.sitemap_url_filter && !Array.isArray(config.sitemap_url_filter)) {
      debug('Config Error: `sitemap_url_filter` should be an array.');
      throw new Error('sitemap_url_filter should be an array.');
    }
    if (!config.theme_dir) {
      debug('Config Error: No theme_dir provided.');
      throw new Error('No theme_dir provided.');
    }
    if (!config.public_dir) {
      debug('Config Error: No public_dir provided.');
      throw new Error('No public_dir provided.');
    }
    debug('Validated config.');
  }

  buildMetadata(document = {}, path = '', robots = '') {
    const canonical = `${this.config.site_url}/${path.trim()}`;

    let description = document && document.excerpt ? document.excerpt : '';
    if (document && document.content && !description) {
      /* istanbul ignore next */
      description = document && document.content ? `${document.content.substring(0, 160)}` : '';
      description = this.renderer.render(description);
    }

    const image = '';
    const modified = document && document.updateDate ? new Date(document.updateDate).toISOString() : '';
    const published = document && document.createDate ? new Date(document.createDate).toISOString() : '';
    const title = document && document.title ? document.title : this.config.site_title;

    return {
      canonical,
      description,
      image,
      modified,
      published,
      robots,
      title,
    };
  }

  bindRoutes() {
    debug('Binding routes...');
    // Order: Home, Tags, Search, Placeholders, Document, Not Found
    // Home
    this.server.get('/', asyncHandler(this.home.bind(this)));
    this.server.get(`/${this.config.home_page}`, asyncHandler(this.homepageRedirect.bind(this)));

    // Tags
    this.server.get('/tags', asyncHandler(this.tagIndex.bind(this)));
    this.server.get('/tags/:tag/', asyncHandler(this.tag.bind(this)));

    // Search
    this.server.get('/search', asyncHandler(this.search.bind(this)));

    // Not Found Placeholder
    this.server.head('/404', asyncHandler(this.notFound.bind(this)));
    this.server.get('/404', asyncHandler(this.notFound.bind(this)));
    this.server.delete('/404', asyncHandler(this.notFound.bind(this)));
    this.server.patch('/404', asyncHandler(this.notFound.bind(this)));
    this.server.put('/404', asyncHandler(this.notFound.bind(this)));
    this.server.post('/404', asyncHandler(this.notFound.bind(this)));

    // Document
    this.server.get('/new', asyncHandler(this.new.bind(this)));
    this.server.get('/:slug/edit', asyncHandler(this.edit.bind(this)));
    this.server.get('/:slug/delete/:key', asyncHandler(this.delete.bind(this)));
    this.server.get('/:slug/history', asyncHandler(this.historyIndex.bind(this)));
    this.server.get('/:slug/history/:revision', asyncHandler(this.historyDetail.bind(this)));
    this.server.get('/:slug/history/:revision/restore', asyncHandler(this.historyRestore.bind(this)));
    this.server.post('/:slug/save', asyncHandler(this.save.bind(this)));
    this.server.get('/:slug', asyncHandler(this.detail.bind(this)));
    this.server.post('/upload', asyncHandler(this.upload.bind(this)));

    // Not Found - Catch All
    this.server.get('/*', asyncHandler(this.notFound.bind(this)));
    debug('Bound routes.');
  }

  async home(request, response, _next) {
    debug('Home Route');
    const homeDocument = await this.storageProvider.get(this.config.home_page);
    /* istanbul ignore else */
    if (homeDocument) {
      homeDocument.html = this.renderer.render(homeDocument.content);
    }

    const recentDocuments = await this.getRecentDocuments(5);
    const randomDocuments = await this.getRandomDocuments(5);
    const popularDocuments = await this.getPopularDocuments(5);
    const siteSections = await this.getSiteSections();

    response.render('home', {
      title: 'Home',
      config: this.config,
      recentDocuments,
      randomDocuments,
      popularDocuments,
      siteSections,
      homeDocument,
      meta: this.buildMetadata(homeDocument, ''),
    });
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

    response.render('tags', {
      title: 'Tags',
      config: this.config,
      taggedDocuments,
      recentDocuments,
      randomDocuments,
      popularDocuments,
      siteSections,
      meta: this.buildMetadata({}, '/tags'),
    });
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

    response.render('tag', {
      title: request.params.tag,
      config: this.config,
      recentDocuments,
      randomDocuments,
      popularDocuments,
      taggedDocuments,
      section: R.find(R.propEq('tag', request.params.tag))(this.config.site_sections) || {},
      siteSections: this.config.site_sections,
      meta: this.buildMetadata({}, `/tags/${request.params.tag}`),
    });
  }

  async search(request, response, _next) {
    debug('Search Route');
    const viewModel = {
      title: 'Search',
      config: this.config,
      searchTerm: '',
      meta: this.buildMetadata({ title: 'Search' }, '/search'),
    };
    /* istanbul ignore else */
    if (request.query && request.query.s) {
      const term = decodeURIComponent(request.query.s);
      viewModel.title = `Search results for "${request.query.s}"`;
      viewModel.searchTerm = term;
      const searchResults = await this.getSearchResults(term, 10);
      /* istanbul ignore next */
      viewModel.searchResults = searchResults.map((document) => {
        let excerpt = document && document.excerpt ? document.excerpt.substring(0, this.config.excerpt_length) : '';
        if (!excerpt) {
          excerpt = document && document.content ? `${document.content.substring(0, this.config.excerpt_length)} ...` : '';
        }
        document.html = this.renderer.render(excerpt);
        return document;
      });
      viewModel.meta = this.buildMetadata({ title: `Search results for "${request.query.s}"` }, `/search/${request.query.s}`, 'noindex');
    }
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
    response.render('edit', {
      title: `Editing ${document.title}`,
      document,
      config: this.config,
      meta: this.buildMetadata({ ...document, title: `Editing ${document.title}` }, `/${request.params.slug}/edit`),
    });
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
      debug('Deleting document', document);
      await this.storageProvider.delete(slug);
      await this.searchProvider.indexRemove([document]);
      response.redirect(this.config.site_url);
    } else {
      debug('Nothing found to delete, next.');
      next();
    }
  }

  async saveValid(request, response, _next) {
    debug(`Updating with params: ${JSON.stringify(request.params, null, 2)}`);
    debug(`Updating with body: ${JSON.stringify(request.body, null, 2)}`);

    // Create document from form
    const document = new Document();
    document.title = request.body.title;
    document.excerpt = request.body.excerpt;
    document.content = request.body.content;
    document.tags = request.body.tags ? request.body.tags.split(',') : [];
    document.slug = request.body.slug || request.params.slug;
    document.slug = document.slug.toLowerCase();
    /* istanbul ignore next */
    document.customData = R.isEmpty(request.body.customData) ? {} : request.body.customData;

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

    UttoriSitemap.generateSitemap(this.config, await this.getDocuments(['slug', 'createDate', 'updateDate']));
    response.redirect(`${this.config.site_url}/${document.slug}`);
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
    /* istanbul ignore next */
    if (this.config.use_recaptcha) {
      debug('Verifying with reCaptcha...');
      this.recaptcha.verify(request, (error, data) => {
        debug('reCaptch Verification Data:', data);
        if (!error) {
          debug('reCaptch Verified!');
          this.saveValid(request, response, next);
        } else {
          debug('Invalid reCaptcha:', error);
          next();
        }
      });
    } else {
      debug('Skipping reCaptcha...');
      this.saveValid(request, response, next);
    }
  }

  async new(request, response, _next) {
    debug('New Route');
    const document = new Document();
    document.slug = '';
    document.title = 'New Document';
    response.render('edit', {
      document,
      title: document.title,
      config: this.config,
      meta: this.buildMetadata(document, '/new'),
    });
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

    document.html = this.renderer.render(document.content);

    const recentDocuments = await this.getRecentDocuments(5);
    const relatedDocuments = await this.getRelatedDocuments(5, document);
    const popularDocuments = await this.getPopularDocuments(5);

    response.render('detail', {
      title: document.title,
      config: this.config,
      document,
      popularDocuments,
      relatedDocuments,
      recentDocuments,
      meta: this.buildMetadata(document, `/${request.params.slug}`),
    });
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

    response.set('X-Robots-Tag', 'noindex');
    response.render('history_index', {
      title: `${document.title} Revision History`,
      document,
      historyByDay,
      config: this.config,
      meta: this.buildMetadata({
        ...document,
        title: `${document.title} Revision History`,
      }, `/${request.params.slug}/history`, 'noindex'),
    });
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

    document.html = this.renderer.render(document.content);

    response.set('X-Robots-Tag', 'noindex');
    response.render('detail', {
      title: `${document.title} Revision ${request.params.revision}`,
      config: this.config,
      document,
      revision: request.params.revision,
      meta: this.buildMetadata({
        ...document,
        title: `${document.title} Revision ${request.params.revision}`,
      }, `/${request.params.slug}/history/${request.params.revision}`, 'noindex'),
    });
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

    response.set('X-Robots-Tag', 'noindex');
    response.render('edit', {
      title: `Editing ${document.title} from Revision ${request.params.revision}`,
      document,
      revision: request.params.revision,
      config: this.config,
      meta: this.buildMetadata({
        ...document,
        title: `Editing ${document.title} from Revision ${request.params.revision}`,
      }, `/${request.params.slug}/history/${request.params.revision}/restore`, 'noindex'),
    });
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
      return response.status(status).send(send);
    });
  }

  // 404
  async notFound(request, response, _next) {
    debug('404 Not Found Route');
    response.set('X-Robots-Tag', 'noindex');
    response.render('404', {
      title: '404 Not Found',
      config: this.config,
      slug: request.params.slug || '404',
      meta: this.buildMetadata({ title: '404 Not Found' }, '/404', 'noindex'),
    });
  }

  // Helpers
  async getDocuments(fields) {
    debug('getDocuments');
    let all = [];
    try {
      all = await this.storageProvider.all(fields);
    } catch (error) {
      /* istanbul ignore next */
      debug('getDocuments Error:', error);
    }
    return R.reject(
      R.propEq('slug', this.config.home_page),
      all,
    );
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

  async getRelatedDocuments(limit, document) {
    debug('getRelatedDocuments:', limit, document);
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
