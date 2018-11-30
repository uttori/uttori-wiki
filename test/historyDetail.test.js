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

test('renders the requested slug and revision', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/demo-title/history/1500000000000');
  t.is(res.status, 200);
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Demo Title Beta Revision 1500000000000 | Wiki');
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.historyDetail({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when revision is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.historyDetail({ params: { slug: 'demo-title', revision: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when no revision is found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.historyDetail({ params: { slug: 'demo-title', revision: '1' } }, null, next);
  t.true(next.calledOnce);
});