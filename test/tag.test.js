const test = require('ava');
const request = require('supertest');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server.js');

test('tagsIndex(request, response, next): renders that tag index page', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get('/tags');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Tags | Wiki');
});

test('tag(request, response, next): renders that tag page for a given tag', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get('/tags/Cool');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Cool | Wiki');
});

test('tag(request, response, next): falls through to 404 when tag is missing', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get('/tags/_');
  t.is(response.status, 404);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});
