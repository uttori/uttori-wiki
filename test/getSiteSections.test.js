const test = require('ava');
const StorageProvider = require('uttori-storage-provider-json-file');

const UttoriWiki = require('../src');

const { config, serverSetup, cleanup } = require('./_helpers/server.js');

test.before(async () => {
  await cleanup();
});

test.after(async () => {
  await cleanup();
});

test.afterEach(async () => {
  await cleanup();
});

test('getSiteSections(count): returns the config sections with tag counts', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  const sections = await uttori.getSiteSections();
  t.deepEqual(sections, [{
    description: 'Example description text.',
    documentCount: 1,
    tag: 'example',
    title: 'Example',
  }]);
});
