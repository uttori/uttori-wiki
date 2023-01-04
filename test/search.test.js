const test = require('ava');
const sinon = require('sinon');
const request = require('supertest');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server');

test('search(request, response, _next): renders', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get('/search?s=test');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i) || '';
  t.is(title[1], 'Search results for &#34;test&#34; | Wiki');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sinon.spy();
  const searchRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, searchRoute }, server);
  await request(server).get('/search?s=test');
  t.is(spy.called, true);
});
