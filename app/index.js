const debug = require('debug')('Uttori.Wiki');
// const request = require('request'); // Sync
const R = require('ramda');
const Document = require('uttori-document');
const MarkdownHelpers = require('./utilities/markdownHelpers.js');
const defaultConfig = require('./config.default.js');

require('dotenv').config();

class UttoriWiki {
  constructor(config, server, render) {
    debug('Contructing...');
    if (!config) {
      debug('No config provided.');
      throw new Error('No config provided.');
    }
    if (!server) {
      debug('No server provided.');
      throw new Error('No server provided.');
    }
    if (!render) {
      debug('No render provided.');
      throw new Error('No render provided.');
    }

    this.config = { ...defaultConfig, ...config };

    UttoriWiki.validateConfig(this.config);

    this.server = server;
    this.render = render;

    // Storage
    this.storageProvider = new this.config.StorageProvider(this.config);

    // Uploads
    this.uploadProvider = new this.config.UploadProvider(this.config);

    // Analytics
    this.pageVisits = this.storageProvider.readObject('visits') || {};

    // Search
    this.searchProvider = new this.config.SearchProvider();
    this.searchProvider.setup(this);

    this.bindRoutes();
  }

  static validateConfig(config) {
    debug('Validating config...');
    if (!config.StorageProvider) {
      debug('No StorageProvider provided.');
      throw new Error('No StorageProvider provided.');
    }
    if (!config.SearchProvider) {
      debug('No SearchProvider provided.');
      throw new Error('No SearchProvider provided.');
    }
    if (!config.UploadProvider) {
      debug('No UploadProvider provided.');
      throw new Error('No UploadProvider provided.');
    }
    debug('Validated config.');
  }

  bindRoutes() {
    debug('Binding routes...');
    // Order: Home, Tags, Search, Document, Sync, Not Found
    // Home
    this.server.get('/', this.home.bind(this));

    // Tags
    this.server.get('/~:tag/', this.tag.bind(this));

    // Search
    this.server.get('/search', this.search.bind(this));

    // Document
    this.server.get('/new', this.new.bind(this));
    this.server.get('/:slug/edit', this.edit.bind(this));
    this.server.get('/:slug/delete/:key', this.delete.bind(this));
    this.server.post('/:slug/save', this.save.bind(this));
    this.server.get('/:slug', this.detail.bind(this));
    this.server.post('/upload', this.upload.bind(this));

    // Sync
    // this.server.get('/sync', this.sync.bind(this));
    // this.server.get('/sync-target/:key/:slug', this.returnSingle.bind(this));
    // this.server.get('/sync-target/:key', this.returnList.bind(this));
    // this.server.get('/sync-request/:key/:server/:slug', this.requestSingle.bind(this));
    // this.server.get('/sync-request/:key/:server', this.requestList.bind(this));
    // this.server.post('/sync-write/:key', this.write.bind(this));

    // Not Found
    this.server.head('/404', this.notFound.bind(this));
    this.server.get('/404', this.notFound.bind(this));
    this.server.delete('/404', this.notFound.bind(this));
    this.server.patch('/404', this.notFound.bind(this));
    this.server.put('/404', this.notFound.bind(this));
    this.server.post('/404', this.notFound.bind(this));
    this.server.get('/*', this.notFound.bind(this));
    debug('Bound routes.');
  }

  home(req, res, _next) {
    debug('Home Route');
    res.render('home', {
      title: 'Home',
      config: this.config,
      popularSearches: this.searchProvider.getPopularSearchTerms(5),
      recentDocuments: this.getRecentDocuments(5),
      randomDocuments: this.getRandomDocuments(5),
      popularDocuments: this.getPopularDocuments(5),
      siteSections: this.getSiteSections(),
      homeDocument: this.getHomeDocument(),
    });
  }

  tag(req, res, next) {
    debug('Tag Route');
    if (!req.params.tag) {
      debug('Missing tag!');
      next();
      return;
    }
    res.render('tag', {
      title: req.params.tag,
      config: this.config,
      recentDocuments: this.getRecentDocuments(5),
      randomDocuments: this.getRandomDocuments(5),
      popularDocuments: this.getPopularDocuments(5),
      popularSearches: this.searchProvider.getPopularSearchTerms(5) || [],
      taggedDocuments: this.getTaggedDocuments(req.params.tag),
      section: R.find(R.propEq('tag', req.params.tag))(this.config.site_sections) || {},
      siteSections: this.config.site_sections,
    });
  }

  search(req, res, _next) {
    debug('Search Route');
    const viewModel = {
      title: 'Search',
      config: this.config,
      searchTerm: '',
    };
    /* istanbul ignore else */
    if (req.query && req.query.s) {
      const term = decodeURIComponent(req.query.s);
      viewModel.title = `Searching "${req.query.s}"`;
      viewModel.searchTerm = term;
      viewModel.searchResults = this.getSearchResults(term, 10);
      viewModel.searchResults.map((document) => {
        const excerpt = `${document.content.substring(0, this.config.excerpt_length)} ...`;
        document.html = this.render.render(excerpt).trim();
        return document;
      });
    }
    res.render('search', viewModel);
  }

  edit(req, res, next) {
    debug('Edit Route');
    if (!req.params.slug) {
      debug('Missing slug!');
      next();
      return;
    }
    const document = this.storageProvider.get(req.params.slug);
    res.render('edit', {
      title: document.title,
      document,
      config: this.config,
    });
  }

  delete(req, res, next) {
    debug('Delete Route');
    if (!req.params.slug || !req.params.key || req.params.key !== process.env.DELETE_KEY) {
      debug('Missing one or more of: slug, key, or a key mismatch!');
      next();
      return;
    }

    const { slug } = req.params;
    const document = this.storageProvider.get(slug);
    if (document && (document.content || document.html)) {
      debug('Deleting document', document);
      this.storageProvider.delete(slug);
      this.searchProvider.indexRemove({ slug });
      res.redirect(this.config.base);
    } else {
      debug('Nothing found to delete, next.');
      next();
    }
  }

  save(req, res, next) {
    debug('Save Route');
    if (!req.params.slug || !req.body || Object.keys(req.body).length === 0) {
      debug('Missing slug or body!');
      next();
      return;
    }

    debug(`Updating with params: ${JSON.stringify(req.params, null, 2)}`);
    debug(`Updating with body: ${JSON.stringify(req.body, null, 2)}`);

    // Create document from form
    const document = new Document();
    document.title = req.body.title;
    document.content = MarkdownHelpers.prepare(this.config, req.body.content);
    document.tags = req.body.tags ? req.body.tags.split(',') : [];
    document.slug = req.params.slug;
    document.customData = R.isEmpty(req.body.customData) ? {} : req.body.customData;

    // Save document
    this.storageProvider.update(document);
    this.searchProvider.indexUpdate(document);

    // Remove old document if one existed
    const { originalSlug } = req.body;
    if (originalSlug && originalSlug.length > 0 && originalSlug !== req.params.slug) {
      debug(`Changing slug from "${originalSlug}" to "${req.body.slug}", cleaning up old files.`);
      this.storageProvider.delete(originalSlug);
      this.searchProvider.indexRemove({ slug: originalSlug });
    }

    res.redirect(`${this.config.base}${req.body.slug || req.params.slug}`);
  }

  new(req, res, _next) {
    debug('New Route');
    const document = new Document();
    document.slug = '';
    document.title = 'New Document';
    res.render('edit', {
      document,
      title: document.title,
      config: this.config,
    });
  }

  detail(req, res, next) {
    debug('Detail Route');
    if (!req.params.slug) {
      debug('Missing slug.');
      next();
      return;
    }

    const document = this.storageProvider.get(req.params.slug);
    if (!document || document.content.length === 0) {
      debug('No document found for given slug:', req.params.slug);
      next();
      return;
    }

    document.html = this.render.render(document.content);
    this.updateViewCount(req.params.slug);

    res.render('detail', {
      title: document.title,
      config: this.config,
      document,
      popularDocuments: this.getPopularDocuments(5),
      relatedDocuments: this.getRelatedDocuments(document.title, 5),
      recentDocuments: this.getRecentDocuments(5),
    });
  }

  upload(req, res, _next) {
    debug('Upload Route');
    this.uploadProvider.storeFile(req, res, (error) => {
      /* istanbul ignore next */
      if (error) {
        debug('Upload Error:', error);
        return res.status(422).send(error);
      }
      return res.status(200).send(req.file.filename);
    });
  }

  // // Sync
  // sync(req, res, _next) {
  //   res.render('sync', { syncKey: this.config.sync_key });
  // }
  //
  // returnSingle(req, res, next) {
  //   if (!req.params.key || !req.params.slug) {
  //     next();
  //     return;
  //   }
  //
  //   if (!this._validateKey(res, req.params.key)) {
  //     return;
  //   }
  //
  //   const doc = R.find(
  //     R.propEq('slug', req.params.slug),
  //     this.storageProvider.all(),
  //   );
  //
  //   res.json({
  //     success: doc != null,
  //     result: doc,
  //   });
  // }
  //
  // returnList(req, res, next) {
  //   if (!req.params.key) {
  //     next();
  //     return;
  //   }
  //
  //   if (!this._validateKey(res, req.params.key)) {
  //     return;
  //   }
  //
  //   const documentSlugs = R.map(
  //     doc => doc.slug,
  //     this.storageProvider.all(),
  //   );
  //
  //   res.json({
  //     success: true,
  //     results: documentSlugs,
  //   });
  // }
  //
  // requestSingle(req, res, next) {
  //   if (!req.params.key || !req.params.server || !req.params.slug) {
  //     next();
  //     return;
  //   }
  //
  //   if (!this._validateKey(res, req.params.key)) {
  //     return;
  //   }
  //
  //   let server = Buffer.from(req.params.server, 'base64').toString('ascii');
  //   server = server.replace(/\/$/, '');
  //
  //   const endpoint = `${server}/sync-target/${req.params.key}/${req.params.slug}`;
  //
  //   request(endpoint, (error, response, body) => {
  //     if (!error && response.statusCode === 200) {
  //       const result = JSON.parse(body);
  //       res.json({ success: result.success, result: result.result });
  //     } else {
  //       res.json({ success: false, message: 'Error fetching data. ' });
  //     }
  //   });
  // }
  //
  // requestList(req, res, next) {
  //   if (!req.params.key || !req.params.server) {
  //     next();
  //     return;
  //   }
  //
  //   if (!this._validateKey(res, req.params.key)) {
  //     return;
  //   }
  //
  //   let server = Buffer.from(req.params.server, 'base64').toString('ascii');
  //   server = server.replace(/\/$/, '');
  //
  //   const endpoint = `${server}/sync-target/${req.params.key}`;
  //
  //   request(endpoint, (error, response, body) => {
  //     if (!error && response.statusCode === 200) {
  //       const result = JSON.parse(body);
  //       res.json({ success: result.success, results: result.results });
  //     } else {
  //       res.json({ success: false, message: 'Error fetching data. ' });
  //     }
  //   });
  // }
  //
  // write(req, res, next) {
  //   if (!req.params.key) {
  //     next();
  //     return;
  //   }
  //
  //   if (!this._validateKey(res, req.params.key)) {
  //     return;
  //   }
  //   if (R.isEmpty(req.body)) {
  //     res.json({ message: 'Invalid document provided' });
  //     return;
  //   }
  //
  //   const newDoc = req.body;
  //   const matchingDocument = R.find(
  //     R.propEq('slug', newDoc.slug),
  //     this.storageProvider.all(),
  //   );
  //
  //   // handle new document
  //   if (!matchingDocument) {
  //     this.storageProvider.add(newDoc);
  //     this.searchProvider.indexAdd(newDoc);
  //
  //     res.json({ message: `Added new document: ${newDoc.title}` });
  //
  //
  //     // handle existing and newer document
  //   } else if (newDoc.updateDate > matchingDocument.updateDate) {
  //     this.storageProvider.update(newDoc);
  //     this.searchProvider.indexUpdate(newDoc);
  //
  //     res.json({ message: `Found newer document, updating: ${newDoc.title}` });
  //
  //
  //     // handle local copy is newer
  //   } else {
  //     res.json({ message: `Local document is newer, ignoring: ${newDoc.title}` });
  //   }
  // }
  //
  // _validateKey(res, key) {
  //   if (key === this.config.sync_key) {
  //     return true;
  //   }
  //
  //   res.json({ message: 'Invalid Sync Key' });
  //   return false;
  // }

  // 404
  notFound(req, res, _next) {
    res.render('404', {
      title: '404 Not Found',
      config: this.config,
      slug: req.params.slug || '404',
    });
  }

  // Home
  getHomeDocument() {
    const document = this.storageProvider.get('home-page');

    // check if no content
    if (!document || document.content <= 0) {
      return {};
    }

    document.html = this.render.render(document.content).trim();

    return document;
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
          this.storageProvider.all(),
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
          this.storageProvider.all(),
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
        this.storageProvider.all(),
      ),
    );
  }

  getTaggedDocuments(tag) {
    debug('getTaggedDocuments:', tag);
    return R.sort(
      (a, b) => (b.updateDate - a.updateDate),
      R.filter(
        document => document.tags.includes(tag),
        this.storageProvider.all(),
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
            this.storageProvider.all(),
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
            this.storageProvider.all(),
          ),
          results,
        ),
      ),
    );
  }

  // Analytics
  updateViewCount(slug) {
    if (!slug) {
      return;
    }

    if (this.pageVisits[slug]) {
      this.pageVisits[slug]++;
    } else {
      this.pageVisits[slug] = 1;
    }

    this.storageProvider.storeObject('visits', this.pageVisits);
  }

  getViewCount(slug) {
    return this.pageVisits[slug] || 0;
  }
}

module.exports = UttoriWiki;
