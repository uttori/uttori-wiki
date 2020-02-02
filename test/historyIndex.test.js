const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');
const StorageProvider = require('uttori-storage-provider-json-memory');

const UttoriWiki = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('renders the requested slug history', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  const response = await request(uttori.server).get('/demo-title/history');
  t.is(response.status, 200);
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Demo Title Revision History | Wiki');
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  await uttori.historyIndex({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when no revision is found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  await uttori.historyIndex({ params: { slug: 'missing' } }, null, next);
  t.true(next.calledOnce);
});
