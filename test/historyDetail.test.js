// @ts-nocheck
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server');

const response = { set: () => {}, redirect: () => {}, render: () => {} };

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

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sinon.spy();
  const historyDetailRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, historyDetailRoute }, server);
  await request(server).get('/demo-title/history/test');
  t.is(spy.called, true);
});

test('falls through to next when public_history is false', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, public_history: false }, server);
  await seed(uttori);
  const [history] = await uttori.hooks.fetch('storage-get-history', 'demo-title', uttori);
  const express_response = await request(server).get(`/demo-title/history/${history[0]}`);
  t.is(express_response.status, 404);
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyDetail({ params: { slug: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when revision is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyDetail({ params: { slug: 'demo-title', revision: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when no revision is found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.historyDetail({ params: { slug: 'demo-title', revision: '1' } }, response, next);
  t.true(next.calledOnce);
});
