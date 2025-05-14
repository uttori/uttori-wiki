import test from 'ava';
import request from 'supertest';

import { UttoriWiki } from '../src/index.js';

import { config, seed, serverSetup } from './_helpers/server.js';

test('bindRoutes(server): should redirect correctly', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get('/2008/demo-title?redirect=true');
  t.is(express_response.status, 301);
});

test('should handle home route', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get('/');
  t.is(express_response.status, 200);
});

test('should handle search route', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get(`/${config.routes.search}`);
  t.is(express_response.status, 200);
});

test('should handle not found route', async (t) => {
  t.plan(1);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get('/non-existent-route');
  t.is(express_response.status, 404);
});
