// @ts-nocheck
const test = require('ava');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('getSearchResults(query, count): returns search results', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const results = await uttori.getSearchResults('example', 1);
  t.is(results.length, 1);
  t.is(results[0].slug, 'example-title');
});
