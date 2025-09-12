import test from 'ava';
import sinon from 'sinon';
import request from 'supertest';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup } from './_helpers/server.js';


let sandbox;
test.beforeEach(() => {
    sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('can preview content', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, useEditKey: false }, server);
  const response = await request(server).post('/preview').set('Content-type', 'text/plain').send('# Hello');
  t.is(response.status, 200);
  t.is(response.text, '# Hello');
});

test('can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      preview: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  const express_response = await request(server).post('/preview').set('Content-type', 'text/plain').send('# Hello');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('can handle an empty body', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, useEditKey: false }, server);
  const response = await request(server).post('/preview').set('Content-type', 'text/plain').send('');

  t.is(response.status, 200);
  t.is(response.text, '');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const previewRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, previewRoute }, server);
  await request(server).post('/preview').set('Content-type', 'text/plain').send('# Hello');
  t.is(spy.called, true);
});

test('returns an empty JSON response body when missing POST body', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  // const response = await uttori.preview({ params: {}, body: undefined }, { setHeader: () => {}, send }, () => {});
  const response = await request(server).post('/preview').set('Content-type', 'text/plain').send('');
  t.is(response.status, 200);
  t.is(response.text, '');
});
