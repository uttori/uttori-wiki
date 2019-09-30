const fs = require('fs-extra');
const test = require('ava');
const request = require('supertest');

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

test('upload(req, res, next): uploads the file and returns the filename', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).post('/upload').attach('file', 'test/site/favicon.gif');

  t.is(response.status, 200);
  t.is(response.text.slice(0, 8), 'favicon-');
});
