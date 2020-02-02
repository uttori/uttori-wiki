const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const UttoriWiki = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('renders the requested slug', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  seed(uttori.storageProvider);
  const response = await request(uttori.server).get('/example-title');
  t.is(response.status, 200);
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Example Title | Wiki');
});

test('falls throught to next() when there is no slug', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  seed(uttori.storageProvider);
  await uttori.detail({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls throught to next() when there is no document found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  seed(uttori.storageProvider);
  await uttori.detail({ params: { slug: 'fake' } }, null, next);
  t.true(next.calledOnce);
});
