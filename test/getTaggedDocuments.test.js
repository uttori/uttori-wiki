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

test('getTaggedDocuments(tag): returns documents with the given tag', async (t) => {
  t.plan(2);

  let documents;
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  documents = await uttori.getTaggedDocuments('Cool');
  t.deepEqual(documents, [
    {
      title: 'Demo Title',
      slug: 'demo-title',
      content: '## Demo Title',
      html: '',
      updateDate: 1459310452002,
      createDate: 1459310452002,
      tags: ['Demo Tag', 'Cool'],
    },
    {
      title: 'Fake Title',
      slug: 'fake-title',
      content: '## Fake Title',
      html: '',
      updateDate: 1459310452000,
      createDate: 1459310452000,
      tags: ['Fake Tag', 'Cool'],
    },
  ]);

  documents = await uttori.getTaggedDocuments('No Tag');
  t.deepEqual(documents, []);
});
