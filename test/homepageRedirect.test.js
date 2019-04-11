const fs = require('fs-extra');
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const UttoriWiki = require('../app');

const { config, server, cleanup } = require('./_helpers/server.js');

test.before(() => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test.beforeEach(async () => {
  await fs.writeJson('test/site/data/visits.json', {
    'example-title': 2,
    'demo-title': 0,
    'fake-title': 1,
  });
});

test.afterEach(() => {
  cleanup();
});

test('redirects to root', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).get('/home-page');
  t.is(response.status, 301);
  t.is(response.text, 'Moved Permanently. Redirecting to http://127.0.0.1/');
});
