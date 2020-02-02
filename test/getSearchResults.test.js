const test = require('ava');

const UttoriWiki = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('getSearchResults(query, count): returns search results', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, skip_setup: true }, server);
  await uttori.setup();
  seed(uttori.storageProvider);
  const results = await uttori.getSearchResults('example', 1);
  t.deepEqual(results, [{
    content: '## Example Title',
    createDate: 1459310452001,
    customData: undefined,
    html: '',
    slug: 'example-title',
    tags: ['Example Tag', 'example'],
    title: 'Example Title',
    updateDate: 1459310452001,
  }]);
});
