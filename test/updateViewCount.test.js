const fs = require('fs-extra');
const test = require('ava');
const MarkdownIt = require('markdown-it');

const UttoriWiki = require('../app');

const { config, server, cleanup } = require('./_helpers/server.js');

const md = new MarkdownIt();

test.before(() => {
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

test('updateViewCount(slug): does not update without a slug', (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  uttori.pageVisits = {};
  t.deepEqual(uttori.pageVisits, {});
  uttori.updateViewCount();
  t.deepEqual(uttori.pageVisits, {});
});

test('updateViewCount(slug): updates the view count for a given slug', (t) => {
  t.plan(5);

  const uttori = new UttoriWiki(config, server, md);
  uttori.pageVisits = {};
  t.deepEqual(uttori.pageVisits, {});
  uttori.updateViewCount('test');
  t.deepEqual(uttori.pageVisits, {
    test: 1,
  });
  uttori.updateViewCount('test');
  t.deepEqual(uttori.pageVisits, {
    test: 2,
  });
  uttori.updateViewCount('fake');
  t.deepEqual(uttori.pageVisits, {
    test: 2,
    fake: 1,
  });
  uttori.updateViewCount('test');
  t.deepEqual(uttori.pageVisits, {
    test: 3,
    fake: 1,
  });
});
