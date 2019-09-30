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

test('getSiteSections(count): returns the config sections with tag counts', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server);
  const sections = await uttori.getSiteSections();
  t.deepEqual(sections, [{
    description: 'Example description text.',
    documentCount: 1,
    tag: 'example',
    title: 'Example',
  }]);
});
