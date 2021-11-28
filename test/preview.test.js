// @ts-nocheck
/* eslint-disable ramda/prefer-ramda-boolean */
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup } = require('./_helpers/server');

test('can preview content', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, use_edit_key: false }, server);
  const response = await request(server).post('/preview').send('# Hello');

  t.is(response.status, 200);
  t.is(response.text, '{"# Hello":""}');
});

test('falls through to next when missing body', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.preview({ params: {}, body: undefined }, { setHeader: () => {} }, next);
  t.true(next.calledOnce);
});
