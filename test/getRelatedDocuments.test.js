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

test('getRelatedDocuments(limit, tags): returns related documents', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki({ ...config, skip_setup: true }, server);
  await uttori.setup();
  const related = await uttori.getRelatedDocuments({ slug: '___', tags: ['Cool'] }, 3);
  t.deepEqual(related, [
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
});
