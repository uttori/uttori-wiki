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

test('renders the edit page for a given slug', async (t) => {
  t.plan(3);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).get('/demo-title/edit');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Editing Demo Title | Wiki');
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server);
  await uttori.edit({ params: { slug: '' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when document is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server);
  await uttori.edit({ params: { slug: 'missing-document' } }, null, next);
  t.true(next.calledOnce);
});
