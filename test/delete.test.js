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

test('deletes the document and redirects to config.publicUrl', async (t) => {
  t.plan(2);

  const testDelete = {
    title: 'Delete Page',
    slug: 'test-delete',
    content: '## Delete Page',
    updateDate: 1412921841841,
    createDate: undefined,
  };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid({ params: {}, body: testDelete, wikiFlash }, response, () => {});
  const express_response = await request(server).get('/test-delete/delete/test-key');
  t.is(express_response.status, 302);
  t.is(express_response.text, `Found. Redirecting to ${config.publicUrl}`);
});

test('deletes the document and redirects to root if there is no config.publicUrl', async (t) => {
  t.plan(2);

  const testDelete = {
    title: 'Delete Page',
    slug: 'test-delete',
    content: '## Delete Page',
    updateDate: 1412921841841,
    createDate: undefined,
  };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  uttori.config.publicUrl = undefined;
  await seed(uttori);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid({ params: {}, body: testDelete, wikiFlash }, response, () => {});
  const express_response = await request(server).get('/test-delete/delete/test-key');
  t.is(express_response.status, 302);
  t.is(express_response.text, 'Found. Redirecting to /');
});

test('can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      delete: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  await seed(uttori);
  const express_response = await request(server).get('/test-delete/delete/test-key');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const deleteRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, deleteRoute }, server);
  await uttori.delete({ params: { key: 'test-key' } }, response, () => {});
  t.is(spy.called, true);
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  /** @type {import('express').NextFunction} */
  const next = sandbox.spy();
  const response = { set: () => {}, render: () => {}, redirect: () => {} };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.delete({ params: { key: 'test-key' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when document is not found', async (t) => {
  t.plan(1);

  /** @type {import('express').NextFunction} */
  const next = sandbox.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.delete({ params: { slug: 'missing', key: 'test-key' } }, response, next);
  t.true(next.calledOnce);
});

test('falls to 404 when miss matched key', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  const express_response = await request(server).get('/missing/delete/bad-key');
  t.is(express_response.status, 404);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found');
});
