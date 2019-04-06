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

test('redirects to the article after saving without changing slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).post('/test-old/save')
    .send('slug=test-old');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects to the article after saving without changing slug or providing one in the POST body', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).post('/test-old/save')
    .send('title=Title');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects to the article after saving with case transforms', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).post('/test-old/save')
    .send('slug=Test-OLD');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('splits tags correctly', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).post('/test-old/save')
    .send('tags=tag-1,tag-2');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects to the article after saving with new slug', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).post('/test-new/save')
    .send('original-slug=test-old');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-new');
  await fs.remove('test/site/content/test-new.json');
});

test('redirects to the article after saving with new slug with case transforms', async (t) => {
  t.plan(2);

  const uttori = new UttoriWiki(config, server);
  const response = await request(uttori.server).post('/Test-NEW/save')
    .send('original-slug=test-old');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-new');
  await fs.remove('test/site/content/test-new.json');
});

test('falls through to next when missing slug (params)', (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server);
  uttori.save({ params: { slug: '' }, body: { title: 'Title' } }, null, next);
  t.true(next.calledOnce);
});

test('falls through to next when missing body', (t) => {
  t.plan(1);

  const next = sinon.spy();
  const uttori = new UttoriWiki(config, server);
  uttori.save({ params: { slug: 'test-old' }, body: {} }, null, next);
  t.true(next.calledOnce);
});
