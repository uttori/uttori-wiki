// @ts-nocheck
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

const response = { set: () => {}, redirect: () => {}, render: () => {} };

test('renders', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(uttori.server).get('/');
  t.is(express_response.status, 200);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Home | Wiki');
});

test('falls through to next when home document is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, home_page: '' }, server);
  await seed(uttori);
  await uttori.home({ params: { slug: '' } }, response, next);
  t.true(next.calledOnce);
});
