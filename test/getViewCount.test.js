const fs = require('fs-extra');
const test = require('ava');

const UttoriWiki = require('../app');

const { config, server, cleanup } = require('./_helpers/server.js');

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

test('getViewCount(slug): returns 0 without a slug', (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server);
  t.is(uttori.getViewCount(), 0);
});

test('getViewCount(slug): returns 0 when a match is not found', (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  t.is(uttori.getViewCount('getViewCount-2'), 0);
  uttori.updateViewCount('getViewCount-2');
  t.is(uttori.getViewCount('getViewCount-2'), 1);
});
