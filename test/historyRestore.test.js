import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup, seed } from './_helpers/server.js';

const response = { set: () => {}, render: () => {}, redirect: () => {} };

test('renders the edit page for a given slug', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const [history] = await uttori.hooks.fetch('storage-get-history', 'demo-title', uttori);
  const express_response = await request(server).get(`/demo-title/history/${history[0]}/restore`);
  t.is(express_response.status, 200);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.true(title[1].startsWith('Editing Demo Title Beta from Revision 1'));
});

test('can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      historyRestore: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  await seed(uttori);
  const [history] = await uttori.hooks.fetch('storage-get-history', 'demo-title', uttori);
  const express_response = await request(server).get(`/demo-title/history/${history[0]}/restore`);
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sinon.spy();
  const historyRestoreRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, historyRestoreRoute }, server);
  await request(server).get('/demo-title/history/test/restore');
  t.is(spy.called, true);
});

test('falls through to next when publicHistory is false', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, publicHistory: false }, server);
  await seed(uttori);
  const [history] = await uttori.hooks.fetch('storage-get-history', 'demo-title', uttori);
  const espress_response = await request(server).get(`/demo-title/history/${history[0]}/restore`);
  t.is(espress_response.status, 404);
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyRestore({ params: { slug: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when revision is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyRestore({ params: { slug: 'demo-title', revision: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when no revision is found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyRestore({ params: { slug: 'demo-title', revision: '1' } }, response, next);
  t.true(next.calledOnce);
});
