const fs = require('fs');
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');
const MarkdownIt = require('markdown-it');

// Server
const express = require('express');
const ejs = require('ejs');
const layouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');

const StorageProvider = require('uttori-storage-provider-json-file');
const UploadProvider = require('uttori-upload-provider-multer'); // require('./__stubs/UploadProvider.js');
const SearchProvider = require('./__stubs/SearchProvider.js');

const defaultConfig = require('../app/config.default.js');
const UttoriWiki = require('../app/index.js');

const md = new MarkdownIt();

let app;
let config;
let server;

test.before((_t) => {
  process.env.DELETE_KEY = 'test-key';
  config = {
    ...defaultConfig,
    site_sections: [
      {
        title: 'Example',
        description: 'Example description text.',
        tag: 'example',
      },
    ],
    // Specify the theme to use
    theme_dir: 'test/site/themes/',
    theme_name: 'default',
    content_dir: 'test/site/content/',
    history_dir: 'test/site/content/history/',
    uploads_dir: 'test/site/uploads/',
    data_dir: 'test/site/data/',
    public_dir: 'test/site/themes/default/public/',
    // Providers
    StorageProvider,
    SearchProvider,
    UploadProvider,
    // Syncing
    sync_key: 'test-key',
  };

  server = express();
  server.set('port', process.env.PORT || 8000);
  server.set('ip', process.env.IP || '127.0.0.1');

  server.set('views', path.join(config.theme_dir, config.theme_name, 'templates'));
  server.use(layouts);
  server.set('layout extractScripts', true);
  server.set('layout extractStyles', true);
  server.set('view engine', 'html');
  // server.enable('view cache');
  server.engine('html', ejs.renderFile);

  // Setup Express
  server.use(express.static(config.public_dir));
  server.use('/uploads', express.static(config.uploads_dir));
  server.use(bodyParser.json({ limit: '50mb' }));
  server.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
  app = server.listen(server.get('port'), server.get('ip'));
});

test.after(() => {
  app.close();
});

test.beforeEach(() => {
  fs.writeFileSync('test/site/data/visits.json', '{"example-title":2,"demo-title":0,"fake-title":1}');
});

test.afterEach(() => {
  // NOTE: What is the best way to do this
  try {
    fs.unlinkSync('test/site/content/test-old.json', () => {});
    fs.unlinkSync('test/site/data/visits.json', () => {});
  } catch (e) {}
});

test('Uttori: throws when missing config', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki();
  }, Error);
  t.is(error.message, 'No config provided.');
});

test('Uttori: throws when missing server', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki(config);
  }, Error);
  t.is(error.message, 'No server provided.');
});

test('Uttori: throws when missing render', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki(config, server);
  }, Error);
  t.is(error.message, 'No render provided.');
});

test('Uttori: validateConfig.validateConfig(config): throws when missing StorageProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      SearchProvider,
      UploadProvider,
    }, server, md);
  }, Error);
  t.is(error.message, 'No StorageProvider provided.');
});

test('Uttori: validateConfig(config): throws when missing SearchProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      StorageProvider,
      UploadProvider,
    }, server, md);
  }, Error);
  t.is(error.message, 'No SearchProvider provided.');
});

test('Uttori: validateConfig(config): throws when missing UploadProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      SearchProvider,
      StorageProvider,
    }, server, md);
  }, Error);
  t.is(error.message, 'No UploadProvider provided.');
});

test('Uttori: can stand up', (t) => {
  t.notThrows(() => {
    const _uttori = new UttoriWiki(config, server, md);
  }, Error);
});

test('Uttori: home(req, res, _next): renders', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Home | Wiki');
});

test('Uttori: tag(req, res, next): renders that tag page for a given tag', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/~test');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'test | Wiki');
});

test('Uttori: tag(req, res, next): falls through to next when tag is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.tag({ params: { tag: '' } }, null, next);
  t.true(next.calledOnce);
});

test('Uttori: search(req, res, _next): renders', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/search?s=test');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Searching &#34;test&#34; | Wiki');
});

test('Uttori: edit(req, res, next): renders the edit page for a given slug', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/test/edit');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'test | Wiki');
});

test('Uttori: edit(req, res, next): falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.edit({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('Uttori: delete(req, res, next): deletes the document and redirects to the home page', async (t) => {
  t.plan(2);

  fs.writeFileSync('test/site/content/test-delete.json', '{"title": "Delete Page","slug": "test-delete","content": "## Delete Page","html": "","updateDate": 1412921841841,"createDate": null,"tags": []}');
  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/test-delete/delete/test-key');
  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /');
  try {
    fs.unlinkSync('test/site/content/test-delete.json', () => {});
  } catch (e) {}
});

test('Uttori: delete(req, res, next): falls through to next when document is not found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.delete({ params: { slug: 'missing', key: 'test-key' } }, null, next);
  t.true(next.calledOnce);
});

test('Uttori: delete(req, res, next): falls to 404 when miss matched key', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/missing/delete/bad-key');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});

test('Uttori: save(req, res, next): redirects to the article after saving without changing slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/test-old/save')
    .send('slug=test-old');

  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /test-old');
});

test('Uttori: save(req, res, next): redirects to the article after saving without changing slug or providing one in the POST body', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/test-old/save')
    .send('title=Title');

  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /test-old');
});

test('Uttori: save(req, res, next): splits tags correctly', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/test-old/save')
    .send('tags=tag-1,tag-2');

  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /test-old');
});

test('Uttori: save(req, res, next): redirects to the article after saving with new slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/test-new/save')
    .send('originalSlug=test-old');

  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /test-new');
  fs.unlinkSync('test/site/content/test-new.json', () => {});
});

test('Uttori: save(req, res, next): falls through to next when missing slug', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.save({ params: { slug: '' }, body: { title: 'Title' } }, null, next);
  t.true(next.calledOnce);
});

test('Uttori: save(req, res, next): falls through to next when missing body', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.save({ params: { slug: 'test-old' }, body: {} }, null, next);
  t.true(next.calledOnce);
});

test('Uttori: new(req, res, _next): renders', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/new');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'New Document | Wiki');
});

test('Uttori: detail(req, res, _next): renders the requested slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/example-title');
  t.is(res.status, 200);
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Example Title | Wiki');
});

test('Uttori: detail(req, res, _next): falls throught to next() when there is no slug', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.detail({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('Uttori: upload(req, res, next): uploads the file and returns the filename', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/upload')
    .attach('file', 'test/site/favicon.gif');

  t.is(res.status, 200);
  t.is(res.text.substring(0, 8), 'favicon-');
});

// TODO all sync test need proper clean up
test.skip('Uttori: sync(req, res, _next): renders', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync');
  // t.is(res.status, 200);
  t.is(res.text, '');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'test | Wiki');
});

test.skip('Uttori: returnSingle(req, res, next): returns status on an individual file', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync-target/test-key/test-slug');
  t.is(res.status, 200);
  t.is(res.text, '{"success":false}');
});

test.skip('Uttori: returnList(req, res, next): returns status on a list of files', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync-target/test-key');
  t.is(res.status, 200);
  t.is(res.text, '{"success":false,"message":"Error fetching data. "}');
});

test.skip('Uttori: returnSingle(req, res, next): returns status on an individual file from a specific server', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync-request/test-key/test-server/test-slug');
  t.is(res.status, 200);
  t.is(res.text, '{"success":false,"message":"Error fetching data. "}');
});

test.skip('Uttori: returnList(req, res, next): returns status on a list of files from a specific server', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync-request/test-key/test-server/');
  t.is(res.status, 200);
  t.is(res.text, '');
});

// TODO More `write` branches tests
test.skip('Uttori: write(req, res, next): renders error message when no valid body found', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/sync-write/test-key').send({});
  t.is(res.status, 200);
  t.is(res.text, '{"message":"Invalid document provided"}');
});

test('Uttori: notFound(req, res, next): renders a 404 page', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/404');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});

test('Uttori: getHomeDocument(count): returns an empty object when there is no home document', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.getHomeDocument(), {});
});

test('Uttori: getHomeDocument(count): returns the homepage when present', async (t) => {
  t.plan(1);

  fs.writeFileSync('test/site/content/home-page.json', '{"title": "Home Page","slug": "home-page","content": "## Home Page","html": "","updateDate": 1512921841841,"createDate": null,"tags": []}');
  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.getHomeDocument(), {
    content: '## Home Page',
    createDate: null,
    html: '<h2>Home Page</h2>',
    slug: 'home-page',
    tags: [],
    title: 'Home Page',
    updateDate: 1512921841841,
  });
  fs.unlinkSync('test/site/content/home-page.json', () => {});
});

test('Uttori: getSiteSections(count): returns the config sections with tag counts', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);

  t.deepEqual(uttori.getSiteSections(), [{
    description: 'Example description text.',
    documentCount: 1,
    tag: 'example',
    title: 'Example',
  }]);
});

test('Uttori: getRecentDocuments(count): returns the requested number of the most recently updated documents', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.getRecentDocuments(1), [{
    content: '## Demo Title',
    createDate: 1459310452002,
    html: '',
    slug: 'demo-title',
    tags: ['Demo Tag', 'Cool'],
    title: 'Demo Title',
    updateDate: 1459310452002,
  }]);
});

test('Uttori: getPopularDocuments(count): returns the requested number of popular documents', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  uttori.pageVisits = {};
  uttori.pageVisits['example-title'] = 0;
  t.deepEqual(uttori.getPopularDocuments(1), []);

  uttori.pageVisits['example-title'] = 1;
  t.deepEqual(uttori.getPopularDocuments(1), [{
    content: '## Example Title',
    createDate: 1459310452001,
    html: '',
    slug: 'example-title',
    tags: ['Example Tag', 'example'],
    title: 'Example Title',
    updateDate: 1459310452001,
  }]);

  uttori.pageVisits['demo-title'] = 1;
  t.is(uttori.getPopularDocuments(2).length, 2);
});

test('Uttori: getRandomDocuments(count): returns the requested number of random documents', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  t.is(uttori.getRandomDocuments(1).length, 1);
  t.is(uttori.getRandomDocuments(2).length, 2);
  t.is(uttori.getRandomDocuments(3).length, 3);
});

test('Uttori: getTaggedDocuments(tag): returns documents with the given tag', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.getTaggedDocuments('Cool'), [
    {
      title: 'Demo Title',
      slug: 'demo-title',
      content: '## Demo Title',
      html: '',
      updateDate: 1459310452002,
      createDate: 1459310452002,
      tags: ['Demo Tag', 'Cool'],
    },
    {
      title: 'Fake Title',
      slug: 'fake-title',
      content: '## Fake Title',
      html: '',
      updateDate: 1459310452000,
      createDate: 1459310452000,
      tags: ['Fake Tag', 'Cool'],
    },
  ]);

  t.deepEqual(uttori.getTaggedDocuments('No Tag'), []);
});

test('Uttori: getRelatedDocuments(title, count): returns related documents', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.getRelatedDocuments('example', 1), [{
    content: '## Example Title',
    createDate: 1459310452001,
    html: '',
    slug: 'example-title',
    tags: ['Example Tag', 'example'],
    title: 'Example Title',
    updateDate: 1459310452001,
  }]);
});

test('Uttori: getSearchResults(query, count): returns search results', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.getSearchResults('example', 1), [{
    content: '## Example Title',
    createDate: 1459310452001,
    html: '',
    slug: 'example-title',
    tags: ['Example Tag', 'example'],
    title: 'Example Title',
    updateDate: 1459310452001,
  }]);
});

test('Uttori: updateViewCount(slug): does not update without a slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.pageVisits, {
    'demo-title': 0,
    'example-title': 2,
    'fake-title': 1,
  });
  uttori.updateViewCount();
  t.deepEqual(uttori.pageVisits, {
    'demo-title': 0,
    'example-title': 2,
    'fake-title': 1,
  });
});

test('Uttori: updateViewCount(slug): updates the view count for a given slug', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.pageVisits, {
    'demo-title': 0,
    'example-title': 2,
    'fake-title': 1,
  });
  uttori.updateViewCount('test');
  t.deepEqual(uttori.pageVisits, {
    'demo-title': 0,
    'example-title': 2,
    'fake-title': 1,
    test: 1,
  });
  uttori.updateViewCount('test');
  t.deepEqual(uttori.pageVisits, {
    'demo-title': 0,
    'example-title': 2,
    'fake-title': 1,
    test: 2,
  });
});

test('Uttori: getViewCount(slug): returns 0 without a slug', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  t.is(uttori.getViewCount(), 0);
});

test('Uttori: getViewCount(slug): returns 0 when a match is not found', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  t.is(uttori.getViewCount('getViewCount-2'), 0);
  uttori.updateViewCount('getViewCount-2');
  t.is(uttori.getViewCount('getViewCount-2'), 1);
});
