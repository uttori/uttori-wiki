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
