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

test('getViewCount(slug): returns 0 without a slug', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  t.is(uttori.getViewCount(), 0);
});

test('getViewCount(slug): returns 0 when a match is not found', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  t.is(uttori.getViewCount('getViewCount-2'), 0);
  uttori.updateViewCount('getViewCount-2');
  t.is(uttori.getViewCount('getViewCount-2'), 1);
});
