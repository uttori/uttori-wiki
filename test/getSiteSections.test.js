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

test('getSiteSections(count): returns the config sections with tag counts', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);

  t.deepEqual(uttori.getSiteSections(), [{
    description: 'Example description text.',
    documentCount: 1,
    tag: 'example',
    title: 'Example',
  }]);
});
