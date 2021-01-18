const test = require('ava');
const request = require('supertest');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('redirects to root', async (t) => {
  t.plan(2);
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get(`/${config.home_page}`);
  t.is(response.status, 301);
  t.is(response.text, 'Moved Permanently. Redirecting to https://fake.test');
});
