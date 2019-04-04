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

test('getRecentDocuments(count): returns the requested number of the most recently updated documents', (t) => {
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
