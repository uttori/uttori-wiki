// @ts-nocheck
/* eslint-disable ramda/prefer-ramda-boolean */
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('redirects to the article after saving without changing slug', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(uttori.server).post('/test-old/save').send('slug=test-old&body=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects to the article after saving without changing slug or providing one in the POST body', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(uttori.server).post('/test-old/save').send('title=Title&body=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects to the article after saving with case transforms', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(uttori.server).post('/test-old/save').send('slug=Test-OLD&body=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects after spliting tags correctly', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(uttori.server).post('/test-old/save')
    .send('tags=tag-1,tag-2,tag-1&body=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-old');
});

test('redirects to the article after saving with new slug', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(uttori.server).post('/test-new/save')
    .send('original-slug=test-old&body=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-new');
});

test('redirects to the article after saving with new slug with case transforms', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(uttori.server).post('/Test-NEW/save').send('original-slug=test-old&body=test');

  t.is(response.status, 302);
  t.is(response.text, 'Found. Redirecting to https://fake.test/test-new');
});

test('redirects to the article after saving with invalid content', async (t) => {
  t.plan(2);

  const valid = sinon.spy();
  const invalid = sinon.spy();
  const validate = {
    register: (context) => {
      context.hooks.on('validate-save', () => Promise.resolve(true));
      context.hooks.on('validate-invalid', invalid);
      context.hooks.on('validate-valid', valid);
    },
  };
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, plugins: [validate] }, server);
  await seed(uttori);
  await request(uttori.server).post('/test-validate-invalid/save').send('body=test');

  t.false(valid.called);
  t.true(invalid.called);
});

test('redirects to the article after saving with valid content', async (t) => {
  t.plan(2);

  const valid = sinon.spy();
  const invalid = sinon.spy();
  const validate = {
    register: (context) => {
      context.hooks.on('validate-save', () => Promise.resolve(false));
      context.hooks.on('validate-invalid', invalid);
      context.hooks.on('validate-valid', valid);
    },
  };
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, plugins: [validate] }, server);
  await seed(uttori);
  await request(uttori.server).post('/test-validate-valid/save').send('body=test');

  t.false(invalid.called);
  t.true(valid.called);
});

test('falls through to next when missing slug (params)', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.save({ params: { slug: '' }, body: { title: 'Title' } }, undefined, next);
  t.true(next.calledOnce);
});

test('falls through to next when missing body', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.save({ params: { slug: 'test-old' }, body: {} }, undefined, next);
  t.true(next.calledOnce);
});
