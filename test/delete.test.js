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

test('deletes the document and redirects to the home page', async (t) => {
  t.plan(2);

  fs.writeFileSync('test/site/content/test-delete.json', '{"title": "Delete Page","slug": "test-delete","content": "## Delete Page","html": "","updateDate": 1412921841841,"createDate": null,"tags": []}');
  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/test-delete/delete/test-key');
  t.is(res.status, 302);
  t.is(res.text, 'Found. Redirecting to /');
  try {
    fs.unlinkSync('test/site/content/test-delete.json', () => {});
  } catch (e) {}
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.delete({ params: { key: 'test-key' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when document is not found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server, md);
  uttori.delete({ params: { slug: 'missing', key: 'test-key' } }, null, next);
  t.true(next.calledOnce);
});

test('falls to 404 when miss matched key', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server, md);
  const res = await request(uttori.server).get('/missing/delete/bad-key');
  t.is(res.status, 200);
  t.is(res.text.substring(0, 15), '<!DOCTYPE html>');
  const title = res.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});
