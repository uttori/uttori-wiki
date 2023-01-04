// @ts-nocheck
/* eslint-disable ramda/prefer-ramda-boolean */
const test = require('ava');
const sinon = require('sinon');
const request = require('supertest');

const { UttoriWiki } = require('../src');

const { config, serverSetup } = require('./_helpers/server');

test('can preview content', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, use_edit_key: false }, server);
  const response = await request(server).post('/preview').set('Content-type', 'text/plain').send('# Hello');
  t.is(response.status, 200);
  t.is(response.text, '# Hello');
});

test('can handle an empty body', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, use_edit_key: false }, server);
  const response = await request(server).post('/preview').set('Content-type', 'text/plain').send('');

  t.is(response.status, 200);
  t.is(response.text, '');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sinon.spy();
  const previewRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, previewRoute }, server);
  await request(server).post('/preview').set('Content-type', 'text/plain').send('# Hello');
  t.is(spy.called, true);
});

test('returns an empty JSON response body when missing POST body', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  // const response = await uttori.preview({ params: {}, body: undefined }, { setHeader: () => {}, send }, () => {});
  const response = await request(server).post('/preview').set('Content-type', 'text/plain').send('');
  t.is(response.status, 200);
  t.is(response.text, '');
});
