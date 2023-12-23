import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup } from './_helpers/server.js';

test('redirects to the document after saving without using an editKey when useEditKey is false', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, useEditKey: false }, server);
  const response = await request(server).post('/new').send('slug=test-old');

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
      saveNew: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  const express_response = await request(server).post('/new').send('slug=test-old');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sinon.spy();
  const saveNewRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, saveNewRoute }, server);
  await request(server).post('/new').send('slug=test-old');
  t.is(spy.called, true);
});

test('redirects to the document after saving', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  const response = await request(server).post('/new/test-key').send('slug=test-old&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects to the document after saving with case transforms', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(server).post('/new/test-key').send('slug=Test-OLD&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');

  const [document] = await uttori.hooks.fetch('storage-get', 'test-old', this);
  t.is(document.slug, 'test-old');
});

test('redirects back if no slug is present', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  const response = await request(server).post('/new/test-key').send('tags=tag-1,tag-2,tag-1&content=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to /');
});

test('redirects after spliting tags correctly', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(server).post('/new/test-key').send('tags=tag-1,tag-2,tag-1&content=test&slug=test-tags');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-tags');

  const [document] = await uttori.hooks.fetch('storage-get', 'test-tags', this);
  t.deepEqual(document.tags, ['tag-1', 'tag-2']);
});

test('redirects after spliting redirects correctly', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(server).post('/new/test-key').send('redirects=bad-url&content=test&slug=test-redirects');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-redirects');

  const [document] = await uttori.hooks.fetch('storage-get', 'test-redirects', this);
  t.deepEqual(document.redirects, ['bad-url']);
});

test('redirects to the document after saving with invalid content', async (t) => {
  t.plan(3);

  const valid = sinon.spy();
  const invalid = sinon.spy();
  const validate = {
    register: (context) => {
      context.hooks.on('validate-save', () => Promise.resolve(true));
      context.hooks.on('validate-invalid', invalid);
      context.hooks.on('validate-valid', valid);
      context.hooks.on('storage-query', () => Promise.resolve([0]));
    },
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, plugins: [validate] }, server);
  const response = await request(server).post('/new/test-key').send('content=test');

  t.is(response.status, 302);
  t.false(valid.called);
  t.true(invalid.called);
});

test('redirects to the document after saving with valid content', async (t) => {
  t.plan(2);

  const valid = sinon.spy();
  const invalid = sinon.spy();
  const validate = {
    register: (context) => {
      context.hooks.on('validate-save', () => Promise.resolve(false));
      context.hooks.on('validate-invalid', invalid);
      context.hooks.on('validate-valid', valid);
      context.hooks.on('storage-query', () => 0);
    },
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, plugins: [validate] }, server);
  await request(server).post('/new/test-key').send('content=test');

  t.false(invalid.called);
  t.true(valid.called);
});

test('redirects to the document after saving with a full payload', async (t) => {
  t.plan(8);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(server).post('/new/test-key').send('title=Title&excerpt=Short&content=Markdown&tags=tag-1,tag-2&author=Name&slug=test-brand-new');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-brand-new');

  const [document] = await uttori.hooks.fetch('storage-get', 'test-brand-new', this);
  t.is(document.author, 'Name');
  t.is(document.content, 'Markdown');
  t.is(document.excerpt, 'Short');
  t.is(document.slug, 'test-brand-new');
  t.deepEqual(document.tags, ['tag-1', 'tag-2']);
  t.is(document.title, 'Title');
});

test('redirects back after attempting to saving with an existing document with a matching slug or redirect', async (t) => {
  t.plan(3);

  const valid = sinon.spy();
  const invalid = sinon.spy();
  const validate = {
    register: (context) => {
      context.hooks.on('validate-save', () => Promise.resolve(false));
      context.hooks.on('validate-invalid', invalid);
      context.hooks.on('validate-valid', valid);
      context.hooks.on('storage-query', () => Promise.resolve([1]));
    },
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, plugins: [validate] }, server);
  const response = await request(server).post('/new/test-key').send('slug=demo-title&content=test');

  t.is(response.status, 302);
  t.false(valid.called);
  t.false(invalid.called);
});

test('redirects back after attempting to saving when missing body keys', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const redirect = sinon.spy();
  const response = { redirect };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.saveNew({ params: { key: 'test-key' }, body: {} }, response, next);
  t.true(redirect.calledOnce);
});

test('redirects back after attempting to saving when missing body', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const redirect = sinon.spy();
  const response = { redirect };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.saveNew({ params: { key: 'test-key' }, body: undefined }, response, next);
  t.true(redirect.calledOnce);
});

test('redirects back after attempting to saving when useEditKey is set but no editKey is provided', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const redirect = sinon.spy();
  const response = { redirect };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.saveNew({ params: { key: 'bad-key' }, body: { title: 'Title' } }, response, next);
  t.true(redirect.calledOnce);
});
