const fs = require('fs-extra');
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

test('deletes the document and redirects to the home page', async (t) => {
  t.plan(2);

  await fs.writeJson('test/site/content/test-delete.json', {
    title: 'Delete Page',
    slug: 'test-delete',
    content: '## Delete Page',
    html: '',
    updateDate: 1412921841841,
    createDate: null,
    tags: [],
  });
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  const response = await request(uttori.server).get('/test-delete/delete/test-key');
  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test');
  await fs.remove('test/site/content/test-delete.json');
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.delete({ params: { key: 'test-key' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when document is not found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.delete({ params: { slug: 'missing', key: 'test-key' } }, null, next);
  t.true(next.calledOnce);
});

test('falls to 404 when miss matched key', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).get('/missing/delete/bad-key');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});
