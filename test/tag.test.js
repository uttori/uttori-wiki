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

test('tagsIndex(request, response, next): renders that tag index page', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const response = await request(server).get('/tags');
  t.is(response.status, 200);
  t.is(response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Tags');
});

test('tagsIndex(request, response, next): can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      tagIndex: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  await seed(uttori);
  const express_response = await request(server).get('/tags');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('tagsIndex(request, response, next): can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const tagIndexRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, tagIndexRoute }, server);
  await request(server).get('/tags');
  t.is(spy.called, true);
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
  t.is(title[1], 'Cool');
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
  t.is(title[1], '404 Not Found');
});

test('tag(request, response, next): can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      tag: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  await seed(uttori);
  const express_response = await request(server).get('/tags/Cool');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('tag(request, response, next): can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const tagRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, tagRoute }, server);
  await request(server).get('/tags/_');
  t.is(spy.called, true);
});
