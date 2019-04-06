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

test('notFound(request, response, next): renders a 404 page', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).get('/404');
  t.is(response.status, 200);
  t.is(response.text.substring(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});
