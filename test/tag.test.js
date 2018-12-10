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

test('tagsIndex(req, res, next): renders that tag index page', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/tags');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Tags | Wiki');
});

test('tag(req, res, next): renders that tag page for a given tag', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/tags/Cool');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Cool | Wiki');
});

test('tag(req, res, next): falls through to next when tag is missing', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/tags/_');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});
