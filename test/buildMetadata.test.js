import test from 'ava';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup } from './_helpers/server.js';

test('buildMetadata(document, path, robots): can build metadata with empty object', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);

  t.deepEqual(await uttori.buildMetadata(), {
    canonical: `${config.publicUrl}`,
    robots: '',
    title: '',
    description: '',
    modified: '',
    published: '',
    image: '',
  });
});

test('buildMetadata(document, path, robots): can build metadata with simple document', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);

  t.deepEqual(await uttori.buildMetadata({
    excerpt: 'Test',
    content: '# Test',
    updateDate: 1553915818665,
    createDate: 1553915818665,
    title: 'Title',
    image: 'test.png',
  }, '/path', 'robots'), {
    canonical: `${config.publicUrl}/path`,
    description: 'Test',
    image: 'test.png',
    modified: '2019-03-30T03:16:58.665Z',
    published: '2019-03-30T03:16:58.665Z',
    robots: 'robots',
    title: 'Title',
  });
});

test('buildMetadata(document, path, robots): can build metadata without an excerpt', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config }, server);

  t.deepEqual(await uttori.buildMetadata({
    excerpt: '',
    content: '# Test',
    updateDate: 1553915818665,
    createDate: 1553915818665,
    title: 'Title',
  }, '/path', 'robots'), {
    canonical: `${config.publicUrl}/path`,
    description: '# Test',
    image: '',
    modified: '2019-03-30T03:16:58.665Z',
    published: '2019-03-30T03:16:58.665Z',
    robots: 'robots',
    title: 'Title',
  });
});
