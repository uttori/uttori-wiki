const fs = require('fs-extra');
const test = require('ava');
const MarkdownIt = require('markdown-it');

const UttoriWiki = require('../app/index.js');

const { config, server, cleanup } = require('./_helpers/server.js');

const md = new MarkdownIt();

test.before((_t) => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test.beforeEach(async () => {
  await fs.writeJson('test/site/data/visits.json', {
    'example-title': 2,
    'demo-title': 0,
    'fake-title': 1,
  });
});

test.afterEach(() => {
  cleanup();
});

test('getHomeDocument(count): returns an empty object when there is no home document', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  t.deepEqual(uttori.getHomeDocument(), {});
});

test('getHomeDocument(count): returns the homepage when present', async (t) => {
  t.plan(1);

  await fs.writeJson('test/site/content/home-page.json', {
    content: '## Home Page',
    createDate: null,
    html: '',
    slug: 'home-page',
    tags: [],
    title: 'Home Page',
    updateDate: 1512921841841,
  });
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
  await fs.remove('test/site/content/home-page.json');
});
