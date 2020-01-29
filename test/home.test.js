const test = require('ava');
const request = require('supertest');
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

test('home(request, response, _next): renders', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, StorageProvider }, server);
  const response = await request(uttori.server).get('/');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Home | Wiki');
});
