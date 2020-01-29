const test = require('ava');
const StorageProvider = require('uttori-storage-provider-json-file');

const UttoriWiki = require('../src');

const { config, serverSetup, cleanup } = require('./_helpers/server.js');

test.before(() => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test.afterEach(() => {
  cleanup();
});

test('getSearchResults(query, count): returns search results', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider, skip_setup: true }, server);
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
