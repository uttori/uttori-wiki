import test from 'ava';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup, seed } from './_helpers/server.js';

test('getTaggedDocuments(tag): returns documents with the given tag', async (t) => {
  t.plan(4);

  let documents;
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  documents = await uttori.getTaggedDocuments('Cool');
  t.is(documents.length, 2);
  t.is(documents[0].slug, 'demo-title');
  t.is(documents[1].slug, 'fake-title');

  documents = await uttori.getTaggedDocuments('No Tag');
  t.deepEqual(documents, []);
});
