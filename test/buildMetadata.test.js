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
    image: '',
    modified: '2019-03-30T03:16:58.665Z',
    published: '2019-03-30T03:16:58.665Z',
    robots: 'robots',
    title: 'Title',
  });
});

test('buildMetadata(document, path, robots): can build metadata with image as attachment ID reference', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const imageId = 'image-123';
  const imagePath = '/uploads/test.png';

  t.deepEqual(await uttori.buildMetadata({
    excerpt: 'Test',
    content: '# Test',
    updateDate: 1553915818665,
    createDate: 1553915818665,
    title: 'Title',
    image: imageId,
    attachments: [
      {
        id: imageId,
        name: 'test.png',
        path: imagePath,
        type: 'image/png',
        size: 1024,
        metadata: {},
      },
    ],
  }, '/path', 'robots'), {
    canonical: `${config.publicUrl}/path`,
    description: 'Test',
    image: imagePath,
    modified: '2019-03-30T03:16:58.665Z',
    published: '2019-03-30T03:16:58.665Z',
    robots: 'robots',
    title: 'Title',
  });
});

test('buildMetadata(document, path, robots): handles image ID that does not exist in attachments', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);

  t.deepEqual(await uttori.buildMetadata({
    excerpt: 'Test',
    content: '# Test',
    updateDate: 1553915818665,
    createDate: 1553915818665,
    title: 'Title',
    image: 'non-existent-id',
    attachments: [
      {
        id: 'other-id',
        name: 'other.png',
        path: '/uploads/other.png',
        type: 'image/png',
        size: 1024,
        metadata: {},
      },
    ],
  }, '/path', 'robots'), {
    canonical: `${config.publicUrl}/path`,
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
