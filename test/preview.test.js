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

test('returns an empty response when the POST body is missing', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, useEditKey: false }, server);
  /** @type {Record<string, string>} */
  const headers = {};
  const response = {
    statusCode: 0,
    body: undefined,
    setHeader(key, value) { headers[key] = value; },
    status(code) { this.statusCode = code; return this; },
    send(body) { this.body = body; },
  };

  await uttori.preview(/** @type {any} */ ({ body: undefined }), /** @type {any} */ (response), () => {});

  t.is(response.statusCode, 200);
  t.is(response.body, '');
});
