// @ts-nocheck
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server');

const response = { set: () => {}, redirect: () => {}, render: () => {} };

test('renders the requested slug history', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get('/demo-title/history');
  t.is(express_response.status, 200);
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Demo Title Revision History | Wiki');
});

test('can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      historyIndex: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  await seed(uttori);
  const express_response = await request(server).get('/demo-title/history');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sinon.spy();
  const historyIndexRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, historyIndexRoute }, server);
  await request(server).get('/demo-title/history');
  t.is(spy.called, true);
});

test('falls through to next when public_history is false', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, public_history: false }, server);
  await seed(uttori);
  const express_response = await request(server).get('/demo-title/history');
  t.is(express_response.status, 404);
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyIndex({ params: { slug: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when no revision is found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyIndex({ params: { slug: 'missing' } }, response, next);
  t.true(next.calledOnce);
});
