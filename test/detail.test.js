// @ts-nocheck
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server');

test('renders the requested slug', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get('/example-title');
  t.is(express_response.status, 200);
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Example Title | Wiki');
});

test('redirects to the actual document when found in the `redirects` array', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get('/example-titlez');
  t.is(response.status, 301);
  t.is(response.text, 'Moved Permanently. Redirecting to https://fake.test/example-title');
});

test('falls throught to next() when there is no slug', async (t) => {
  t.plan(1);

  const response = { set: () => {}, render: () => {}, redirect: () => {} };
  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.detail({ params: { slug: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls throught to next() when there is no document found', async (t) => {
  t.plan(1);

  const response = { set: () => {}, render: () => {}, redirect: () => {} };
  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.detail({ params: { slug: 'missing' } }, response, next);
  t.true(next.calledOnce);
});
