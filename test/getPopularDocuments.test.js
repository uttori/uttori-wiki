const fs = require('fs-extra');
const test = require('ava');

const UttoriWiki = require('../app');

const { config, server, cleanup } = require('./_helpers/server.js');

test.before(() => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test.beforeEach(async () => {
  await fs.writeJson('test/site/data/visits.json', {
    'example-title': 2,
    'demo-title': 0,
    'fake-title': 1,
  });
});

test.afterEach(() => {
  cleanup();
});

test('getPopularDocuments(count): returns the requested number of popular documents', (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server);
  uttori.pageVisits = {};
  uttori.pageVisits['example-title'] = 0;
  t.deepEqual(uttori.getPopularDocuments(1), []);

  uttori.pageVisits['example-title'] = 1;
  t.deepEqual(uttori.getPopularDocuments(1), [{
    content: '## Example Title',
    createDate: 1459310452001,
    html: '',
    slug: 'example-title',
    tags: ['Example Tag', 'example'],
    title: 'Example Title',
    updateDate: 1459310452001,
  }]);

  uttori.pageVisits['demo-title'] = 1;
  t.is(uttori.getPopularDocuments(2).length, 2);
});
