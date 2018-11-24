const fs = require('fs');
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');
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

test.beforeEach(() => {
  fs.writeFileSync('test/site/data/visits.json', '{"example-title":2,"demo-title":0,"fake-title":1}');
});

test.afterEach(() => {
  cleanup();
});

test('renders the edit page for a given slug', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/test/edit');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'test | Wiki');
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.edit({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});
