const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');
const StorageProvider = require('uttori-storage-provider-json-file');

const UttoriWiki = require('../src');

const { config, serverSetup, cleanup } = require('./_helpers/server.js');

test.before(() => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test.afterEach(() => {
  cleanup();
});

test('renders the edit page for a given slug', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  const response = await request(uttori.server).get('/demo-title/history/1500000000000/restore');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Editing Demo Title Beta from Revision 1500000000000 | Wiki');
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  await uttori.historyRestore({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when revision is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  await uttori.historyRestore({ params: { slug: 'demo-title', revision: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when no revision is found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  await uttori.historyRestore({ params: { slug: 'demo-title', revision: '1' } }, null, next);
  t.true(next.calledOnce);
});
