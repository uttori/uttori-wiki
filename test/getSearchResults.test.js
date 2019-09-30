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

test('getSearchResults(query, count): returns search results', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki({ ...config, skip_setup: true }, server);
  await uttori.setup();
  const results = await uttori.getSearchResults('example', 1);
  t.deepEqual(results, [{
    content: '## Example Title',
    createDate: 1459310452001,
    html: '',
    slug: 'example-title',
    tags: ['Example Tag', 'example'],
    title: 'Example Title',
    updateDate: 1459310452001,
  }]);
});
