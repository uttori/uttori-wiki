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

test('redirects to the article after saving without changing slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/test-old/save')
    .send('slug=test-old');

  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /test-old');
});

test('redirects to the article after saving without changing slug or providing one in the POST body', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/test-old/save')
    .send('title=Title');

  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /test-old');
});

test('splits tags correctly', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/test-old/save')
    .send('tags=tag-1,tag-2');

  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /test-old');
});

test('redirects to the article after saving with new slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).post('/test-new/save')
    .send('original-slug=test-old');

  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /test-new');
  fs.unlinkSync('test/site/content/test-new.json', () => {});
});

test('falls through to next when missing slug', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.save({ params: { slug: '' }, body: { title: 'Title' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when missing body', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.save({ params: { slug: 'test-old' }, body: {} }, null, next);
  t.true(next.calledOnce);
});
