const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');
const StorageProvider = require('uttori-storage-provider-json-memory');

const UttoriWiki = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('renders the edit page for a given slug', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  const history = uttori.storageProvider.getHistory('demo-title')[0];
  const response = await request(uttori.server).get(`/demo-title/history/${history}/restore`);
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.true(title[1].startsWith('Editing Demo Title Beta from Revision 1'));
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  await uttori.historyRestore({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when revision is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  await uttori.historyRestore({ params: { slug: 'demo-title', revision: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when no revision is found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  await uttori.historyRestore({ params: { slug: 'demo-title', revision: '1' } }, null, next);
  t.true(next.calledOnce);
});
