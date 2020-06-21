const test = require('ava');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('getSiteSections(count): returns the config sections with tag counts', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const sections = await uttori.getSiteSections();
  t.deepEqual(sections, [{
    description: 'Example description text.',
    documentCount: 1,
    tag: 'example',
    title: 'Example',
  }]);
});
