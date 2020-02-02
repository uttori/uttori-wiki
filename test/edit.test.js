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
  const response = await request(uttori.server).get('/demo-title/edit');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Editing Demo Title | Wiki');
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  await uttori.edit({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when document is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  seed(uttori.storageProvider);
  await uttori.edit({ params: { slug: 'missing-document' } }, null, next);
  t.true(next.calledOnce);
});
