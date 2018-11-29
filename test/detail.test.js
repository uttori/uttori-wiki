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

test('renders the requested slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/example-title');
  t.is(res.status, 200);
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Example Title | Wiki');
});

test('falls throught to next() when there is no slug', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.detail({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls throught to next() when there is no document found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.detail({ params: { slug: 'fake' } }, null, next);
  t.true(next.calledOnce);
});
