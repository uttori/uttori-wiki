// @ts-nocheck
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server');

const response = { set: () => {}, render: () => {}, redirect: () => {} };

test('renders the requested slug', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get('/example-title');
  t.is(express_response.status, 200);
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Example Title | Wiki');
});

test('falls throught to next() when there is no slug', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.detail({ params: { slug: '' } }, response, next);
  t.true(next.calledOnce);
});

test('falls throught to next() when there is no document found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  await uttori.detail({ params: { slug: 'missing' } }, response, next);
  t.true(next.calledOnce);
});
