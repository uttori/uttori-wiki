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

test('getRandomDocuments(count): returns the requested number of random documents', (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  t.is(uttori.getRandomDocuments(1).length, 1);
  t.is(uttori.getRandomDocuments(2).length, 2);
  t.is(uttori.getRandomDocuments(3).length, 3);
});
