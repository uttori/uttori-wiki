const fs = require('fs-extra');
const test = require('ava');
const request = require('supertest');
const MarkdownIt = require('markdown-it');

const UttoriWiki = require('../app/index.js');

const { config, server, cleanup } = require('./_helpers/server.js');

const md = new MarkdownIt();

test.before((_t) => {
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

// TODO all sync test need proper clean up
test.skip('sync(req, res, _next): renders', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync');
  // t.is(res.status, 200);
  t.is(res.text, '');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'test | Wiki');
});

test.skip('returnSingle(req, res, next): returns status on an individual file', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync-target/test-key/test-slug');
  t.is(res.status, 200);
  t.is(res.text, '{"success":false}');
});

test.skip('returnList(req, res, next): returns status on a list of files', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync-target/test-key');
  t.is(res.status, 200);
  t.is(res.text, '{"success":false,"message":"Error fetching data. "}');
});

test.skip('returnSingle(req, res, next): returns status on an individual file from a specific server', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync-request/test-key/test-server/test-slug');
  t.is(res.status, 200);
  t.is(res.text, '{"success":false,"message":"Error fetching data. "}');
});

test.skip('returnList(req, res, next): returns status on a list of files from a specific server', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/sync-request/test-key/test-server/');
  t.is(res.status, 200);
  t.is(res.text, '');
});

// TODO More `write` branches tests
test.skip('write(req, res, next): renders error message when no valid body found', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/sync-write/test-key').send({});
  t.is(res.status, 200);
  t.is(res.text, '{"message":"Invalid document provided"}');
});
