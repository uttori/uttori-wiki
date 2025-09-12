import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup } from './_helpers/server.js';


let sandbox;
test.beforeEach(() => {
    sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('redirects to 404 with no content', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, useEditKey: false }, server);
  const response = await request(server).put('/test-old/save').send('slug=test-old');

  t.is(response.status, 404);
});

test('redirects to the document after saving without using an editKey when useEditKey is false', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, useEditKey: false }, server);
  const response = await request(server).put('/test-old/save').send('slug=test-old&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      save: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  const express_response = await request(server).put('/test-old/save').send('slug=test-old&content=test');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const saveRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, saveRoute }, server);
  await request(server).put('/test-old/save').send('slug=test-old&content=test');
  t.is(spy.called, true);
});

test('redirects to the document after saving with no custom fields allowed', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, allowedDocumentKeys: [] }, server);
  const response = await request(server).put('/test-old/save/test-key').send('slug=test-old&content=test&author=✨');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', 'test-old', this);
  t.is(document.author, undefined);
});

test('redirects to the document after saving with custom fields allowed', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(server).put('/test-old/save/test-key').send('slug=test-old&content=test&author=✨');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');

  const [document] = await uttori.hooks.fetch('storage-get', 'test-old', this);
  t.is(document.author, '✨');
});

test.serial('redirects to the document after saving without changing slug', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  const response = await request(server).put('/test-old/save/test-key').send('slug=test-old&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test.serial('redirects to the document after saving without changing slug or providing one in the POST body', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  const response = await request(server).put('/test-old/save/test-key').send('title=Title&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects to the document after saving with case transforms', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(server).put('/test-old/save/test-key').send('slug=Test-OLD&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', 'test-old', this);
  t.is(document.slug, 'test-old');
});

test('redirects after spliting tags correctly', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(server).put('/test-old/save/test-key')
    .send('tags=tag-1,tag-2,tag-1&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', 'test-old', this);
  t.deepEqual(document.tags, ['tag-1', 'tag-2']);
});

test('redirects to the document after saving with new slug', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(server).put('/test-new/save/test-key')
    .send('original-slug=test-old&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-new');

  const [document] = await uttori.hooks.fetch('storage-get', 'test-new', this);
  t.is(document.slug, 'test-new');
});

test('redirects to the document after saving with new slug with case transforms', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  const response = await request(server).put('/Test-NEW/save/test-key').send('original-slug=test-old&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-new');
});

test('redirects to the document after saving with invalid content', async (t) => {
  t.plan(2);

  const valid = sandbox.spy();
  const invalid = sandbox.spy();
  const validate = {
    register: (context) => {
      context.hooks.on('validate-save', () => Promise.resolve(true));
      context.hooks.on('validate-invalid', invalid);
      context.hooks.on('validate-valid', valid);
    },
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, plugins: [validate] }, server);
  await request(server).put('/test-validate-invalid/save/test-key').send('content=test');

  t.false(valid.called);
  t.true(invalid.called);
});

test('redirects to the document after saving with valid content', async (t) => {
  t.plan(2);

  const valid = sandbox.spy();
  const invalid = sandbox.spy();
  const validate = {
    register: (context) => {
      context.hooks.on('validate-save', () => Promise.resolve(false));
      context.hooks.on('validate-invalid', invalid);
      context.hooks.on('validate-valid', valid);
      context.hooks.on('storage-query', () => [0]);
    },
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, plugins: [validate] }, server);
  await request(server).put('/test-validate-valid/save/test-key').send('content=test');

  t.false(invalid.called);
  t.true(valid.called);
});

test('redirects to the document after saving with a full payload', async (t) => {
  t.plan(6);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await request(server).put('/test-old/save/test-key').send('title=Title&excerpt=Short&content=Markdown&tags=tag-1,tag-2&author=Name&slug=test-new');

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', 'test-new', this);
  t.is(document.author, 'Name');
  t.is(document.content, 'Markdown');
  t.is(document.excerpt, 'Short');
  t.is(document.slug, 'test-new');
  t.deepEqual(document.tags, ['tag-1', 'tag-2']);
  t.is(document.title, 'Title');
});

test('falls through to next when missing body keys', async (t) => {
  t.plan(1);

  const next = sandbox.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.save({ params: { slug: 'test-old', key: 'test-key' }, body: {} }, undefined, next);
  t.true(next.calledOnce);
});

test('falls through to next when missing slug', async (t) => {
  t.plan(1);

  const next = sandbox.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.save({ params: { slug: '', key: 'test-key' }, body: { title: 'Title' } }, undefined, next);
  t.true(next.calledOnce);
});

test('falls through to next when missing body', async (t) => {
  t.plan(1);

  const next = sandbox.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.save({ params: { slug: 'test-old', key: 'test-key' }, body: undefined }, undefined, next);
  t.true(next.calledOnce);
});

test('falls through to next when useEditKey is set but no editKey is provided', async (t) => {
  t.plan(1);

  const next = sandbox.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.save({ params: { slug: 'test-old', key: 'bad-key' }, body: { title: 'Title' } }, undefined, next);
  t.true(next.calledOnce);
});
