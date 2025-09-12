import test from 'ava';

import sinon from 'sinon';
import request from 'supertest';
import { UttoriWiki } from '../src/index.js';

import { config, serverSetup, seed } from './_helpers/server.js';

let sandbox;
test.beforeEach(() => {
    sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('create(request, response, _next): renders', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get('/new/test-key');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'New Document');
});

test('create(request, response, _next): can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const newRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, newRoute }, server);
  await request(server).get('/new/test-key');
  t.is(spy.called, true);
});

test('can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      create: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  await seed(uttori);
  const express_response = await request(server).get('/new/test-key');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('falls to 404 when miss matched key', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  const express_response = await request(server).get('/new/bad-key');
  t.is(express_response.status, 404);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found');
});
