const fs = require('fs-extra');
const test = require('ava');
const MarkdownIt = require('markdown-it');

const UttoriWiki = require('../app/index.js');

const { config, server, cleanup } = require('./_helpers/server.js');

const md = new MarkdownIt();

test.before((_t) => {
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

test('buildMetadata(document, path, robots): can build metadata with empty object', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);

  t.deepEqual(uttori.buildMetadata(), {
    canonical: `${config.site_url}/`,
    description: '',
    image: '',
    modified: '',
    published: '',
    robots: '',
    title: config.site_title,
  });
});

test('buildMetadata(document, path, robots): can build metadata with simple document', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);

  t.deepEqual(uttori.buildMetadata({
    excerpt: 'Test',
    content: '# Test',
    updateDate: 1553915818665,
    createDate: 1553915818665,
    title: 'Title',
  }, 'path', 'robots'), {
    canonical: `${config.site_url}/path`,
    description: 'Test',
    image: '',
    modified: '2019-03-30T03:16:58.665Z',
    published: '2019-03-30T03:16:58.665Z',
    robots: 'robots',
    title: 'Title',
  });
});

test('buildMetadata(document, path, robots): can build metadata without an excerpt', async (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);

  t.deepEqual(uttori.buildMetadata({
    excerpt: '',
    content: '# Test',
    updateDate: 1553915818665,
    createDate: 1553915818665,
    title: 'Title',
  }, 'path', 'robots'), {
    canonical: `${config.site_url}/path`,
    description: '<h1>Test</h1>',
    image: '',
    modified: '2019-03-30T03:16:58.665Z',
    published: '2019-03-30T03:16:58.665Z',
    robots: 'robots',
    title: 'Title',
  });
});
