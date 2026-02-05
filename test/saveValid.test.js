import test from 'ava';
import sinon from 'sinon';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup } from './_helpers/server.js';

const response = { set: () => {}, redirect: () => {}, render: () => {} };


let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('saveValid: parses tags as a string', async (t) => {
  t.plan(2);
  const slug = 'test-parse-tags-string';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['tag-1', 'tag-2', 'tag-3'],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.tags, ['tag-1', 'tag-2', 'tag-3']);
});

test('route can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const saveValidRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, saveValidRoute }, server);
  await uttori.saveValid(({ params: { slug: 'test-can-be-replaced' }, body: {} }), (response), () => {});
  t.is(spy.called, true);
});

test('saveValid: parses tags as an array', async (t) => {
  t.plan(2);
  const slug = 'test-parse-tags-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['tag-1', 'tag-2', 'tag-3'],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.tags, ['tag-1', 'tag-2', 'tag-3']);
});

test('saveValid: sorts tags', async (t) => {
  t.plan(2);
  const slug = 'test-parse-tags-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['c', 'b', 'a'],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.tags, ['a', 'b', 'c']);
});

test('saveValid: parses redirects as a string', async (t) => {
  t.plan(2);
  const slug = 'test-parse-redirects-string';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      redirects: 'old-url,older-url,oldest-url\n\rsomehow-older',
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.redirects, ['old-url', 'older-url', 'oldest-url', 'somehow-older']);
});

test('saveValid: parses redirects as an array', async (t) => {
  t.plan(2);
  const slug = 'test-parse-redirects-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      redirects: ['old-url', 'older-url', 'oldest-url'],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.redirects, ['old-url', 'older-url', 'oldest-url']);
});

test('saveValid: redirects back when no slug is found', async (t) => {
  t.plan(1);
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid(({
    get: () => {},
    params: {},
    body: {
      title: 'Delete Page',
      slug: '',
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['tag-1', 'tag-2', 'tag-3'],
    },
    wikiFlash }), (response), () => {});

  t.deepEqual(wikiFlash.lastCall.args, [
    'error',
    'Missing slug.',
  ]);
});

test('saveValid: handles attachments as an array and generates IDs', async (t) => {
  t.plan(6);
  const slug = 'test-attachments-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const attachments = [
    { name: 'test1.pdf', path: '/files/test1.pdf', type: 'application/pdf' },
    { name: 'test2.jpg', path: '/files/test2.jpg', type: 'image/jpeg' },
  ];

  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Attachments',
      slug,
      content: '## Test Attachments',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      attachments,
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 2);
  t.truthy(document.attachments[0].id);
  t.truthy(document.attachments[1].id);
  // Verify attachments have IDs and other properties
  t.is(document.attachments[0].name, 'test1.pdf');
  t.is(document.attachments[1].name, 'test2.jpg');
});

test('saveValid: parses attachment metadata when it is a JSON string', async (t) => {
  t.plan(4);
  const slug = 'test-attachments-metadata-string';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const metadataObject = { gps: { lat: 37.7749, lon: -122.4194 }, camera: 'Canon' };
  const attachments = [
    {
      name: 'test.jpg',
      path: '/files/test.jpg',
      type: 'image/jpeg',
      metadata: JSON.stringify(metadataObject),
    },
  ];

  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Metadata String',
      slug,
      content: '## Test Metadata String',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      attachments,
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 1);
  t.truthy(document.attachments[0].id);
  t.deepEqual(document.attachments[0].metadata, metadataObject);
});

test('saveValid: handles invalid JSON string in attachment metadata', async (t) => {
  t.plan(4);
  const slug = 'test-attachments-metadata-invalid-json';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const attachments = [
    {
      name: 'test.jpg',
      path: '/files/test.jpg',
      type: 'image/jpeg',
      metadata: 'invalid json string{',
    },
  ];

  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Invalid Metadata',
      slug,
      content: '## Test Invalid Metadata',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      attachments,
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 1);
  t.truthy(document.attachments[0].id);
  t.deepEqual(document.attachments[0].metadata, {});
});

test('saveValid: handles attachment metadata that is not an object or string', async (t) => {
  t.plan(4);
  const slug = 'test-attachments-metadata-non-object';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const attachments = [
    {
      name: 'test.jpg',
      path: '/files/test.jpg',
      type: 'image/jpeg',
      metadata: 12345, // Not an object or string
    },
  ];

  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Non-Object Metadata',
      slug,
      content: '## Test Non-Object Metadata',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      attachments,
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 1);
  t.truthy(document.attachments[0].id);
  t.deepEqual(document.attachments[0].metadata, {});
});

test('saveValid: handles missing attachments', async (t) => {
  t.plan(2);
  const slug = 'test-attachments-missing';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test No Attachments',
      slug,
      content: '## Test No Attachments',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.attachments, []);
});

test('saveValid: ignores non-array attachments', async (t) => {
  t.plan(2);
  const slug = 'test-attachments-non-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Non-Array Attachments',
      slug,
      content: '## Test Non-Array Attachments',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      attachments: 'not-an-array',
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.attachments, []);
});

test('saveValid: stores image as ID reference to attachment', async (t) => {
  t.plan(3);
  const slug = 'test-image-id-reference';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const imageId = 'image-123';
  const attachments = [
    {
      id: imageId,
      name: 'test.png',
      path: '/uploads/test.png',
      type: 'image/png',
      size: 1024,
      metadata: {},
    },
  ];

  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Image ID',
      slug,
      content: '## Test Image ID',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      image: imageId,
      attachments,
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.image, imageId);
  t.deepEqual(document.attachments, attachments);
});

test('saveValid: stores image as path and finds attachment by path (backward compatibility)', async (t) => {
  t.plan(3);
  const slug = 'test-image-path-fallback';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const imagePath = '/uploads/test.png';
  const attachments = [
    {
      id: 'image-123',
      name: 'test.png',
      path: imagePath,
      type: 'image/png',
      size: 1024,
      metadata: {},
    },
  ];

  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Image Path',
      slug,
      content: '## Test Image Path',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      image: imagePath,
      attachments,
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.image, 'image-123');
  t.is(document.attachments.length, 1);
});

test('saveValid: preserves attachment IDs when updating existing document', async (t) => {
  t.plan(4);
  const slug = 'test-preserve-attachment-ids';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const existingAttachmentId = 'existing-id-123';
  const existingAttachments = [
    {
      id: existingAttachmentId,
      name: 'existing.pdf',
      path: '/files/existing.pdf',
      type: 'application/pdf',
      size: 2048,
      metadata: {},
    },
  ];

  // Create initial document
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Preserve IDs',
      slug,
      content: '## Test Preserve IDs',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      attachments: existingAttachments,
    },
    wikiFlash,
  }), (response), () => {});

  // Update document with same attachment
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test Preserve IDs Updated',
      slug,
      content: '## Test Preserve IDs Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
      attachments: [
        {
          name: 'existing.pdf',
          path: '/files/existing.pdf',
          type: 'application/pdf',
          size: 2048,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 1);
  t.is(document.attachments[0].id, existingAttachmentId);
  t.is(document.attachments[0].name, 'existing.pdf');
});

test('saveValid: generates IDs for existing attachments without IDs when updating', async (t) => {
  t.plan(3);
  const slug = 'test-generate-existing-attachment-ids';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const existingAttachments = [
    {
      name: 'existing.pdf',
      path: '/files/existing.pdf',
      type: 'application/pdf',
      size: 2048,
      metadata: {},
    },
  ];

  // Create initial document without attachment IDs
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Generate IDs',
      slug,
      content: '## Test Generate IDs',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      attachments: existingAttachments,
    },
    wikiFlash,
  }), (response), () => {});

  // Get the document and manually remove IDs to simulate old data
  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [initialDoc] = await uttori.hooks.fetch('storage-get', slug, this);
  // Manually remove IDs to test the branch
  if (initialDoc.attachments) {
    initialDoc.attachments.forEach((att) => {
      delete att.id;
    });
    // Save it back without IDs
    await uttori.hooks.fetch('storage-update', { document: initialDoc, originalSlug: slug }, this);
  }

  // Update document - should generate IDs for existing attachments
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test Generate IDs Updated',
      slug,
      content: '## Test Generate IDs Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
      attachments: [
        {
          name: 'existing.pdf',
          path: '/files/existing.pdf',
          type: 'application/pdf',
          size: 2048,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 1);
  t.truthy(document.attachments[0].id);
});

test('saveValid: generates new IDs for new attachments when updating existing document', async (t) => {
  t.plan(4);
  const slug = 'test-new-attachments-on-update';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const existingAttachmentId = 'existing-id-123';
  const existingAttachments = [
    {
      id: existingAttachmentId,
      name: 'existing.pdf',
      path: '/files/existing.pdf',
      type: 'application/pdf',
      size: 2048,
      metadata: {},
    },
  ];

  // Create initial document
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test New Attachments',
      slug,
      content: '## Test New Attachments',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      attachments: existingAttachments,
    },
    wikiFlash,
  }), (response), () => {});

  // Update document with new attachment (different path)
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test New Attachments Updated',
      slug,
      content: '## Test New Attachments Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
      attachments: [
        {
          name: 'new-file.pdf',
          path: '/files/new-file.pdf',
          type: 'application/pdf',
          size: 1024,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 1);
  t.truthy(document.attachments[0].id);
  t.is(document.attachments[0].path, '/files/new-file.pdf');
});

test('saveValid: preserves createDate when updating existing document', async (t) => {
  t.plan(2);
  const slug = 'test-preserve-create-date';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Preserve CreateDate',
      slug,
      content: '## Test Preserve CreateDate',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
    },
    wikiFlash,
  }), (response), () => {});

  // Get the actual createDate that was saved (Date.now() for new documents)
  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [initialDocument] = await uttori.hooks.fetch('storage-get', slug, this);
  const originalCreateDate = initialDocument.createDate;

  // Update document
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test Preserve CreateDate Updated',
      slug,
      content: '## Test Preserve CreateDate Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.createDate, originalCreateDate);
});

test('saveValid: handles update when existing document has no attachments', async (t) => {
  t.plan(3);
  const slug = 'test-update-no-attachments';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document without attachments
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test No Attachments',
      slug,
      content: '## Test No Attachments',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
    },
    wikiFlash,
  }), (response), () => {});

  // Update document with new attachments
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test No Attachments Updated',
      slug,
      content: '## Test No Attachments Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
      attachments: [
        {
          name: 'new-file.pdf',
          path: '/files/new-file.pdf',
          type: 'application/pdf',
          size: 1024,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 1);
  t.truthy(document.attachments[0].id);
});

test('saveValid: handles update when existing document attachments is not an array', async (t) => {
  t.plan(2);
  const slug = 'test-update-invalid-attachments';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Invalid Attachments',
      slug,
      content: '## Test Invalid Attachments',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
    },
    wikiFlash,
  }), (response), () => {});

  // Get the document and manually set invalid attachments to test the branch
  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [initialDoc] = await uttori.hooks.fetch('storage-get', slug, this);
  initialDoc.attachments = 'not-an-array';
  await uttori.hooks.fetch('storage-update', { document: initialDoc, originalSlug: slug }, this);

  // Update document with new attachments
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test Invalid Attachments Updated',
      slug,
      content: '## Test Invalid Attachments Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
      attachments: [
        {
          name: 'new-file.pdf',
          path: '/files/new-file.pdf',
          type: 'application/pdf',
          size: 1024,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.is(document.attachments.length, 1);
});
