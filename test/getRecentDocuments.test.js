const fs = require('fs-extra');
const test = require('ava');

const UttoriWiki = require('../app');

const { config, server, cleanup } = require('./_helpers/server.js');

test.before(async () => {
  await cleanup();
});

test.after(async () => {
  await cleanup();
});

test.beforeEach(async () => {
  await fs.writeJson('test/site/data/visits.json', {
    'example-title': 2,
    'demo-title': 0,
    'fake-title': 1,
  });
});

test.afterEach(async () => {
  await cleanup();
});

test('getRecentDocuments(count): returns the requested number of the most recently updated documents', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server);
  const recent = await uttori.getRecentDocuments(1);
  t.deepEqual(recent, [{
    content: '## Demo Title',
    createDate: 1459310452002,
    html: '',
    slug: 'demo-title',
    tags: ['Demo Tag', 'Cool'],
    title: 'Demo Title',
    updateDate: 1459310452002,
  }]);
});
