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

test('getRandomDocuments(count): returns the requested number of random documents', async (t) => {
  t.plan(3);

  let random;
  const uttori = new UttoriWiki(config, server);
  random = await uttori.getRandomDocuments(1);
  t.is(random.length, 1);
  random = await uttori.getRandomDocuments(2);
  t.is(random.length, 2);
  random = await uttori.getRandomDocuments(3);
  t.is(random.length, 3);
});
