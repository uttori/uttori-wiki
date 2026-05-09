import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup, seed } from './_helpers/server.js';

const response = { set: () => {}, redirect: () => {}, render: () => {} };

let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('renders the requested slug and revision', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const [history] = await uttori.hooks.fetch('storage-get-history', 'demo-title', uttori);
  const express_response = await request(server).get(`/demo-title/history/${history[0]}`);
  t.is(express_response.status, 200);
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.true(title[1].startsWith('Demo Title Beta Revision 1'));
});

test('can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      historyDetail: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  await seed(uttori);
  const [history] = await uttori.hooks.fetch('storage-get-history', 'demo-title', uttori);
  const express_response = await request(server).get(`/demo-title/history/${history[0]}`);
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const historyDetailRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, historyDetailRoute }, server);
  await request(server).get('/demo-title/history/test');
  t.is(spy.called, true);
});

test('falls through to next when publicHistory is false', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, publicHistory: false }, server);
  await seed(uttori);
  const [history] = await uttori.hooks.fetch('storage-get-history', 'demo-title', uttori);
  const express_response = await request(server).get(`/demo-title/history/${history[0]}`);
  t.is(express_response.status, 404);
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  /** @type {import('express').NextFunction} */
  const next = sandbox.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyDetail({ params: { slug: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when revision is missing', async (t) => {
  t.plan(1);

  /** @type {import('express').NextFunction} */
  const next = sandbox.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyDetail({ params: { slug: 'demo-title', revision: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when no revision is found', async (t) => {
  t.plan(1);

  /** @type {import('express').NextFunction} */
  const next = sandbox.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyDetail({ params: { slug: 'demo-title', revision: '1' } }, response, next);
  t.true(next.calledOnce);
});

test('historyDetail: compares image field when image ID references attachment', async (t) => {
  t.plan(3);
  const slug = 'test-image-diff-with-attachment';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  const imageId1 = 'image-1';
  const imageId2 = 'image-2';

  // Create initial document with image
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Image Diff',
      slug,
      content: '## Test Image Diff',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      image: imageId1,
      attachments: [
        {
          id: imageId1,
          name: 'old-image.jpg',
          path: '/files/old-image.jpg',
          type: 'image/jpeg',
          size: 1024,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  // Create history entry
  const [history] = await uttori.hooks.fetch('storage-get-history', slug, uttori);
  const revision = history[0];

  // Update document with different image
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test Image Diff Updated',
      slug,
      content: '## Test Image Diff Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
      image: imageId2,
      attachments: [
        {
          id: imageId2,
          name: 'new-image.jpg',
          path: '/files/new-image.jpg',
          type: 'image/jpeg',
          size: 2048,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  // Get the viewModel from historyDetail
  const requestObj = { params: { slug, revision } };
  const viewModel = { diffs: {} };
  const renderSpy = sandbox.spy((template, vm) => {
    Object.assign(viewModel, vm);
  });
  const mockResponse = { set: () => {}, render: renderSpy, status: () => mockResponse };

  await uttori.historyDetail(requestObj, mockResponse, () => {});

  t.truthy(viewModel.diffs.image);
  t.true(viewModel.diffs.image.includes('/files/old-image.jpg'));
  t.true(viewModel.diffs.image.includes('/files/new-image.jpg'));
});

test('historyDetail: compares image field when image ID does not reference attachment', async (t) => {
  t.plan(2);
  const slug = 'test-image-diff-no-attachment';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document with image ID that matches an attachment
  const imageAttachmentId = 'image-attachment-id';
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Image Diff No Attach',
      slug,
      content: '## Test Image Diff No Attach',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      image: imageAttachmentId,
      attachments: [
        {
          id: imageAttachmentId,
          name: 'image.jpg',
          path: '/files/image.jpg',
          type: 'image/jpeg',
          size: 1024,
          metadata: {},
        },
        {
          id: 'other-attachment-id',
          name: 'other.jpg',
          path: '/files/other.jpg',
          type: 'image/jpeg',
          size: 1024,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  // Get history entry - this will be the revision we compare against
  const [history] = await uttori.hooks.fetch('storage-get-history', slug, uttori);
  const revision = history[0];

  // Update document with different image ID that doesn't match any attachment
  // This tests the branch where newImageAttachment is undefined, so it uses newImageId (line 1056-1058)
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test Image Diff No Attach Updated',
      slug,
      content: '## Test Image Diff No Attach Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
      attachments: [
        {
          id: 'yet-another-attachment-id',
          name: 'yet-another.jpg',
          path: '/files/yet-another.jpg',
          type: 'image/jpeg',
          size: 2048,
          metadata: {},
        },
      ],
    },
    wikiFlash }), (response), () => {});

  // Manually set image ID that doesn't match any attachment to test the branch where
  // newImageAttachment is undefined, so it uses `newImageId`
  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [currentDoc] = await uttori.hooks.fetch('storage-get', slug, this);
  currentDoc.image = 'another-missing-id';
  await uttori.hooks.fetch('storage-update', { document: currentDoc, originalSlug: slug }, this);

  const requestObj = { params: { slug, revision } };
  const viewModel = { diffs: {} };
  const renderSpy = sandbox.spy((template, vm) => {
    Object.assign(viewModel, vm);
  });
  const mockResponse = { set: () => {}, render: renderSpy, status: () => mockResponse };

  await uttori.historyDetail(requestObj, mockResponse, () => {});

  // Verify the diff was created - this tests the branches where image ID doesn't match attachments
  // For the revision: oldImageAttachment will be found (imageAttachmentId matches), so oldImageValue = '/files/image.jpg'
  // For the current: newImageAttachment will be undefined (another-missing-id doesn't match), so newImageValue = 'another-missing-id'
  // Since '/files/image.jpg' !== 'another-missing-id', the diff should be created
  t.truthy(viewModel.diffs.image, 'Diff should be created when image values differ');
  t.true(viewModel.diffs.image.includes('another-missing-id') || viewModel.diffs.image.includes('/files/image.jpg'));
});

test('historyDetail: compares tags array when tags differ', async (t) => {
  t.plan(3);
  const slug = 'test-tags-diff';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document with tags as array
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Tags Diff',
      slug,
      content: '## Test Tags Diff',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['tag1', 'tag2'],
    },
    wikiFlash }), (response), () => {});

  // Create history entry
  const [history] = await uttori.hooks.fetch('storage-get-history', slug, uttori);
  const revision = history[0];

  // Update document with different tags
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test Tags Diff Updated',
      slug,
      content: '## Test Tags Diff Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: ['tag3', 'tag4'],
    },
    wikiFlash }), (response), () => {});

  const requestObj = { params: { slug, revision } };
  const viewModel = { diffs: {} };
  const renderSpy = sandbox.spy((template, vm) => {
    Object.assign(viewModel, vm);
  });
  const mockResponse = { set: () => {}, render: renderSpy, status: () => mockResponse };

  await uttori.historyDetail(requestObj, mockResponse, () => {});

  t.truthy(viewModel.diffs.tags);
  t.true(viewModel.diffs.tags.includes('tag1, tag2'));
  t.true(viewModel.diffs.tags.includes('tag3, tag4'));
});

test('historyDetail: compares tags when tags are strings', async (t) => {
  t.plan(2);
  const slug = 'test-tags-string-diff';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document - manually set tags as string to test that branch
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Tags String Diff',
      slug,
      content: '## Test Tags String Diff',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['tag1'],
    },
    wikiFlash }), (response), () => {});

  // Manually modify document to have tags as string
  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [doc] = await uttori.hooks.fetch('storage-get', slug, this);
  doc.tags = 'tag1';
  await uttori.hooks.fetch('storage-update', { document: doc, originalSlug: slug }, this);

  // Create history entry
  const [history] = await uttori.hooks.fetch('storage-get-history', slug, uttori);
  const revision = history[0];

  // Update document with different tags as string
  doc.tags = 'tag2';
  await uttori.hooks.fetch('storage-update', { document: doc, originalSlug: slug }, this);

  const requestObj = { params: { slug, revision } };
  const viewModel = { diffs: {} };
  const renderSpy = sandbox.spy((template, vm) => {
    Object.assign(viewModel, vm);
  });
  const mockResponse = { set: () => {}, render: renderSpy, status: () => mockResponse };

  await uttori.historyDetail(requestObj, mockResponse, () => {});

  t.truthy(viewModel.diffs.tags);
  t.true(viewModel.diffs.tags.includes('tag1'));
});

test('historyDetail: compares redirects array when redirects differ', async (t) => {
  t.plan(3);
  const slug = 'test-redirects-diff';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document with redirects as array
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Redirects Diff',
      slug,
      content: '## Test Redirects Diff',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      redirects: ['old-slug-1', 'old-slug-2'],
    },
    wikiFlash }), (response), () => {});

  // Create history entry
  const [history] = await uttori.hooks.fetch('storage-get-history', slug, uttori);
  const revision = history[0];

  // Update document with different redirects
  await uttori.saveValid(({ params: { slug },
    body: {
      title: 'Test Redirects Diff Updated',
      slug,
      content: '## Test Redirects Diff Updated',
      updateDate: 1412921841842,
      createDate: undefined,
      tags: [],
      redirects: ['new-slug-1', 'new-slug-2'],
    },
    wikiFlash }), (response), () => {});

  const requestObj = { params: { slug, revision } };
  const viewModel = { diffs: {} };
  const renderSpy = sandbox.spy((template, vm) => {
    Object.assign(viewModel, vm);
  });
  const mockResponse = { set: () => {}, render: renderSpy, status: () => mockResponse };

  await uttori.historyDetail(requestObj, mockResponse, () => {});

  t.truthy(viewModel.diffs.redirects);
  t.true(viewModel.diffs.redirects.includes('old-slug-1'));
  t.true(viewModel.diffs.redirects.includes('new-slug-1'));
});

test('historyDetail: compares redirects when redirects are strings', async (t) => {
  t.plan(2);
  const slug = 'test-redirects-string-diff';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Redirects String Diff',
      slug,
      content: '## Test Redirects String Diff',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      redirects: ['old-slug'],
    },
    wikiFlash }), (response), () => {});

  // Manually modify document to have redirects as string
  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [doc] = await uttori.hooks.fetch('storage-get', slug, this);
  doc.redirects = 'old-slug';
  await uttori.hooks.fetch('storage-update', { document: doc, originalSlug: slug }, this);

  // Create history entry
  const [history] = await uttori.hooks.fetch('storage-get-history', slug, uttori);
  const revision = history[0];

  // Update document with different redirects as string
  doc.redirects = 'new-slug';
  await uttori.hooks.fetch('storage-update', { document: doc, originalSlug: slug }, this);

  const requestObj = { params: { slug, revision } };
  const viewModel = { diffs: {} };
  const renderSpy = sandbox.spy((template, vm) => {
    Object.assign(viewModel, vm);
  });
  const mockResponse = { set: () => {}, render: renderSpy, status: () => mockResponse };

  await uttori.historyDetail(requestObj, mockResponse, () => {});

  t.truthy(viewModel.diffs.redirects);
  t.true(viewModel.diffs.redirects.includes('old-slug'));
});

test('historyDetail: handles image when attachments array does not exist', async (t) => {
  t.plan(1);
  const slug = 'test-image-no-attachments-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();

  // Create initial document, then manually shape it like old data with an image but no attachments property.
  await uttori.saveValid(({ params: {},
    body: {
      title: 'Test Image No Attachments',
      slug,
      content: '## Test Image No Attachments',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
    },
    wikiFlash }), (response), () => {});

  // Manually remove attachments to test the branch
  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [doc] = await uttori.hooks.fetch('storage-get', slug, this);
  doc.image = 'image-id-1';
  delete doc.attachments;
  await uttori.hooks.fetch('storage-update', { document: doc, originalSlug: slug }, this);

  // Create history entry
  const [history] = await uttori.hooks.fetch('storage-get-history', slug, uttori);
  const revision = history[0];

  // Update document with different image
  doc.image = 'image-id-2';
  await uttori.hooks.fetch('storage-update', { document: doc, originalSlug: slug }, this);

  const requestObj = { params: { slug, revision } };
  const viewModel = { diffs: {} };
  const renderSpy = sandbox.spy((template, vm) => {
    Object.assign(viewModel, vm);
  });
  const mockResponse = { set: () => {}, render: renderSpy, status: () => mockResponse };

  await uttori.historyDetail(requestObj, mockResponse, () => {});

  t.truthy(viewModel.diffs.image);
});
