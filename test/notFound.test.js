const test = require('ava');
const request = require('supertest');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server');

test('notFound(request, response, next): renders a 404 page', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get('/404');
  t.is(response.status, 404);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});
