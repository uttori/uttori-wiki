import test from 'ava';
import request from 'supertest';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup, seed } from './_helpers/server.js';

test('redirects to this.config.publicUrl', async (t) => {
  t.plan(2);
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get(`/${config.homePage}`);
  t.is(response.status, 301);
  t.is(response.text, `Moved Permanently. Redirecting to ${config.publicUrl}`);
});

test('redirects to root with no config set', async (t) => {
  t.plan(2);
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  uttori.config.publicUrl = undefined;
  await seed(uttori);
  const response = await request(server).get(`/${config.homePage}`);
  t.is(response.status, 301);
  t.is(response.text, 'Moved Permanently. Redirecting to /');
});
