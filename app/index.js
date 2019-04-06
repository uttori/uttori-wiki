const fs = require('fs-extra');
const debug = require('debug')('Uttori.Wiki');
const R = require('ramda');
const Document = require('uttori-document');
const defaultConfig = require('./config.default.js');

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

    // reCaptcha Spam Prevention
    this.recaptcha = undefined;
    /* istanbul ignore next */
    if (config.use_recaptcha) {
      if (!config.recaptcha_site_key) {
        debug('Error initializing reCaptcha: missing config variable recaptcha_site_key');
      }
      if (!config.recaptcha_secret_key) {
        debug('Error initializing reCaptcha: missing config variable recaptcha_secret_key');
      }
      if (config.recaptcha_site_key && config.recaptcha_secret_key) {
        try {
          const { Recaptcha } = require('express-recaptcha');
          this.recaptcha = new Recaptcha(config.recaptcha_site_key, config.recaptcha_secret_key);
        } catch (error) {
          debug('Error initializing reCaptcha:', error);
          throw new Error('Error initializing reCaptcha:', error);
        }
      }
    }

    this.server = server;

    // Rendering
    this.renderer = new this.config.Renderer(this.config);

    // Storage
    this.storageProvider = new this.config.StorageProvider(this.config);

    // Uploads
    this.uploadProvider = new this.config.UploadProvider(this.config);

    // Search
    this.searchProvider = new this.config.SearchProvider();
    this.searchProvider.setup(this);

    // Analytics
    this.pageVisits = this.storageProvider.readObject('visits') || {};

    this.bindRoutes();
  }

  static validateConfig(config) {
    debug('Validating config...');
    if (!config.StorageProvider) {
      debug('Config Error: No StorageProvider provided.');
      throw new Error('No StorageProvider provided.');
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
    if (!description) {
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
    this.server.get('/', this.home.bind(this));

    // Tags
    this.server.get('/tags', this.tagIndex.bind(this));
    this.server.get('/tags/:tag/', this.tag.bind(this));

    // Search
    this.server.get('/search', this.search.bind(this));

    // Not Found Placeholder
    this.server.head('/404', this.notFound.bind(this));
    this.server.get('/404', this.notFound.bind(this));
    this.server.delete('/404', this.notFound.bind(this));
    this.server.patch('/404', this.notFound.bind(this));
    this.server.put('/404', this.notFound.bind(this));
    this.server.post('/404', this.notFound.bind(this));

    // Document
    this.server.get('/new', this.new.bind(this));
    this.server.get('/:slug/edit', this.edit.bind(this));
    this.server.get('/:slug/delete/:key', this.delete.bind(this));
    this.server.get('/:slug/history', this.historyIndex.bind(this));
    this.server.get('/:slug/history/:revision', this.historyDetail.bind(this));
    this.server.get('/:slug/history/:revision/restore', this.historyRestore.bind(this));
    this.server.post('/:slug/save', this.save.bind(this));
    this.server.get('/:slug', this.detail.bind(this));
    this.server.post('/upload', this.upload.bind(this));

    // Not Found - Catch All
    this.server.get('/*', this.notFound.bind(this));
    debug('Bound routes.');
  }

  home(request, response, _next) {
    debug('Home Route');
    const homeDocument = this.storageProvider.get(this.config.home_page);
    homeDocument.html = this.renderer.render(homeDocument.content);
    response.render('home', {
      title: 'Home',
      config: this.config,
      recentDocuments: this.getRecentDocuments(5),
      randomDocuments: this.getRandomDocuments(5),
      popularDocuments: this.getPopularDocuments(5),
      siteSections: this.getSiteSections(),
      homeDocument,
      meta: this.buildMetadata(homeDocument, '/'),
    });
  }

  tagIndex(request, response, _next) {
    debug('Tag Index Route');
    const taggedDocuments = this.getTags().reduce((acc, tag) => {
      acc[tag] = this.getTaggedDocuments(tag);
      return acc;
    }, {});
    response.render('tags', {
      title: 'Tags',
      config: this.config,
      taggedDocuments,
      recentDocuments: this.getRecentDocuments(5),
      randomDocuments: this.getRandomDocuments(5),
      popularDocuments: this.getPopularDocuments(5),
      siteSections: this.config.site_sections,
      meta: this.buildMetadata({}, '/tags'),
    });
  }

  tag(request, response, next) {
    debug('Tag Route');
    const taggedDocuments = this.getTaggedDocuments(request.params.tag);
    if (taggedDocuments.length === 0) {
      debug('No documents for tag!');
      next();
      return;
    }
    response.render('tag', {
      title: request.params.tag,
      config: this.config,
      recentDocuments: this.getRecentDocuments(5),
      randomDocuments: this.getRandomDocuments(5),
      popularDocuments: this.getPopularDocuments(5),
      taggedDocuments,
      section: R.find(R.propEq('tag', request.params.tag))(this.config.site_sections) || {},
      siteSections: this.config.site_sections,
      meta: this.buildMetadata({}, `/tags/${request.params.tag}`),
    });
  }

  search(request, response, _next) {
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
      const searchResults = this.getSearchResults(term, 10);
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

  edit(request, response, next) {
    debug('Edit Route');
    if (!request.params.slug) {
      debug('Missing slug!');
      next();
      return;
    }
    const document = this.storageProvider.get(request.params.slug);
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

  delete(request, response, next) {
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
    const document = this.storageProvider.get(slug);
    if (document) {
      debug('Deleting document', document);
      this.storageProvider.delete(slug);
      this.searchProvider.indexRemove({ slug });
      response.redirect(this.config.site_url);
    } else {
      debug('Nothing found to delete, next.');
      next();
    }
  }

  saveValid(request, response, _next) {
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
    this.storageProvider.update(document, originalSlug);
    this.searchProvider.indexUpdate(document);

    // Remove old document if one existed
    if (originalSlug && originalSlug.length > 0 && document.slug) {
      debug(`Changing slug from "${originalSlug}" to "${document.slug}", cleaning up old files.`);
      this.storageProvider.delete(originalSlug);
      this.searchProvider.indexRemove({ slug: originalSlug });
    }

    this.generateSitemap();
    response.redirect(`${this.config.site_url}/${document.slug}`);
  }

  save(request, response, next) {
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

  new(request, response, _next) {
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

  detail(request, response, next) {
    debug('Detail Route');
    if (!request.params.slug) {
      debug('Missing slug.');
      next();
      return;
    }

    const document = this.storageProvider.get(request.params.slug);
    if (!document) {
      debug('No document found for given slug:', request.params.slug);
      next();
      return;
    }

    document.html = this.renderer.render(document.content);
    this.updateViewCount(request.params.slug);

    response.render('detail', {
      title: document.title,
      config: this.config,
      document,
      popularDocuments: this.getPopularDocuments(5),
      relatedDocuments: this.getRelatedDocuments(document.title, 5),
      recentDocuments: this.getRecentDocuments(5),
      meta: this.buildMetadata(document, `/${request.params.slug}`),
    });
  }

  historyIndex(request, response, next) {
    debug('History Index Route');
    if (!request.params.slug) {
      debug('Missing slug.');
      next();
      return;
    }
    const document = this.storageProvider.get(request.params.slug);
    if (!document) {
      debug('No document found for given slug:', request.params.slug);
      next();
      return;
    }
    const history = this.storageProvider.getHistory(request.params.slug);
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

  historyDetail(request, response, next) {
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
    const document = this.storageProvider.getRevision(request.params.slug, request.params.revision);
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
      popularDocuments: this.getPopularDocuments(5),
      relatedDocuments: this.getRelatedDocuments(document.title, 5),
      recentDocuments: this.getRecentDocuments(5),
      meta: this.buildMetadata({
        ...document,
        title: `${document.title} Revision ${request.params.revision}`,
      }, `/${request.params.slug}/history/${request.params.revision}`, 'noindex'),
    });
  }

  historyRestore(request, response, next) {
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
    const document = this.storageProvider.getRevision(request.params.slug, request.params.revision);
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
  notFound(request, response, _next) {
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
  getDocuments() {
    debug('getDocuments');
    return R.reject(
      R.propEq('slug', this.config.home_page),
      this.storageProvider.all(),
    );
  }

  getSiteSections() {
    debug('getSiteSections');
    return R.map(section => ({
      ...section,
      documentCount: this.getTaggedDocuments(section.tag).length,
    }), this.config.site_sections);
  }

  getRecentDocuments(count) {
    debug('getRecentDocuments:', count);
    return R.take(
      count,
      R.sort(
        (a, b) => (b.updateDate - a.updateDate),
        R.reject(
          document => !document.updateDate,
          this.getDocuments(),
        ),
      ),
    );
  }

  getPopularDocuments(count) {
    debug('getPopularDocuments:', count);
    return R.take(
      count,
      R.sort(
        (a, b) => this.getViewCount(b.slug) - this.getViewCount(a.slug),
        R.reject(
          document => this.getViewCount(document.slug) === 0,
          this.getDocuments(),
        ),
      ),
    );
  }

  getRandomDocuments(count) {
    debug('getRandomDocuments:', count);
    return R.take(
      count,
      R.sort(
        (_a, _b) => Math.random() - Math.random(),
        this.getDocuments(),
      ),
    );
  }

  getTags() {
    debug('getTags');
    let tags = R.pluck('tags')(this.getDocuments());
    tags = R.uniq(R.flatten(tags));
    tags = R.filter(R.identity)(tags);
    tags = R.sort((a, b) => a.localeCompare(b), tags);
    debug('getTags:', tags);
    return tags;
  }

  getTaggedDocuments(tag) {
    debug('getTaggedDocuments:', tag);
    return R.sort(
      (a, b) => (b.updateDate - a.updateDate),
      R.filter(
        document => document.tags.includes(tag),
        this.getDocuments(),
      ),
    );
  }

  getRelatedDocuments(title, count) {
    debug('getRelatedDocuments:', title, count);
    let results = [];
    /* istanbul ignore next */
    try {
      results = this.searchProvider.relatedDocuments(title);
    } catch (error) {
      debug('getRelatedDocuments Error:', error);
    }
    return R.take(
      count,
      R.reject(
        document => !document || document.title === title,
        R.map(
          result => R.find(
            R.propEq('slug', result.ref),
            this.getDocuments(),
          ),
          results,
        ),
      ),
    );
  }

  getSearchResults(query, count) {
    debug('getSearchResults:', query, count);
    let results = [];
    /* istanbul ignore next */
    try {
      results = this.searchProvider.search(query);
    } catch (error) {
      debug('getSearchResults Error:', error);
    }
    return R.take(
      count,
      R.reject(
        R.isNil,
        R.map(
          result => R.find(
            R.propEq('slug', result.ref),
            this.getDocuments(),
          ),
          results,
        ),
      ),
    );
  }

  // Analytics
  updateViewCount(slug) {
    debug('updateViewCount:', slug);
    if (!slug) {
      return;
    }
    this.pageVisits[slug] = (this.pageVisits[slug] || 0) + 1;
    this.storageProvider.storeObject('visits', this.pageVisits);
  }

  getViewCount(slug) {
    debug('getViewCount:', slug);
    return this.pageVisits[slug] || 0;
  }

  // Sitemaps
  generateSitemapXML() {
    debug('Generating Sitemap XML');
    const sitemap = [
      {
        url: '/',
        lastmod: new Date().toISOString(),
        priority: '1.00',
      },
      {
        url: '/tags',
        lastmod: new Date().toISOString(),
        priority: '0.90',
      },
      {
        url: '/new',
        lastmod: new Date().toISOString(),
        priority: '0.90',
      },
    ];

    // Add all documents to the sitemap
    this.getDocuments().forEach((document) => {
      /* istanbul ignore next */
      let lastmod = document.updateDate ? new Date(document.updateDate).toISOString() : '';
      /* istanbul ignore next */
      if (!lastmod) {
        lastmod = document.createDate ? new Date(document.createDate).toISOString() : '';
      }
      sitemap.push({
        url: `/${document.slug}`,
        lastmod,
        priority: '0.80',
      });
    });

    let urlFilter = R.identity;
    /* istanbul ignore else */
    if (Array.isArray(this.config.sitemap_url_filter) && this.config.sitemap_url_filter.length > 0) {
      urlFilter = (route) => {
        let pass = true;
        this.config.sitemap_url_filter.forEach((url_filter) => {
          try {
            if (url_filter.test(route.url)) {
              pass = false;
            }
          } catch (error) {
            /* istanbul ignore next */
            debug('Sitemap Filter Error:', error, url_filter, route.url);
          }
        });
        return pass;
      };
    }

    const data = sitemap.reduce((accumulator, route) => {
      if (urlFilter(route)) {
        accumulator += `<url><loc>${this.config.sitemap_url}${route.url}</loc>`;
        /* istanbul ignore else */
        if (route.lastmod) {
          accumulator += `<lastmod>${route.lastmod}</lastmod>`;
        }
        /* istanbul ignore else */
        if (route.priority) {
          accumulator += `<priority>${route.priority}</priority>`;
        }
        /* istanbul ignore next */
        if (route.changefreq) {
          accumulator += `<changefreq>${route.changefreq}</changefreq>`;
        }
        accumulator += '</url>';
      }
      return accumulator;
    }, '');

    return `${this.config.sitemap_header}${data}${this.config.sitemap_footer}`;
  }

  generateSitemap() {
    debug('Generating Sitemap');
    try {
      fs.outputFileSync(`${this.config.public_dir}/${this.config.sitemap_filename}`, this.generateSitemapXML());
    } catch (error) {
      /* istanbul ignore next */
      debug('Error Generating Sitemap:', error);
    }
  }
}

module.exports = UttoriWiki;
