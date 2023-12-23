import test from 'ava';
import request from 'supertest';
import sinon from 'sinon';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup, seed } from './_helpers/server.js';

test('renders', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get('/');
  t.is(express_response.status, 200);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Home Page');
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sinon.spy();
  const homeRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const _uttori = new UttoriWiki({ ...config, homeRoute }, server);
  await request(server).get('/');
  t.is(spy.called, true);
});

test('can have middleware set and used', async (t) => {
  t.plan(2);

  const server = serverSetup();
  const uttori = new UttoriWiki({
    ...config,
    routeMiddleware: {
      ...config.routeMiddleware,
      home: [
        (req, res, _next) => {
          res.status(500).json({});
        },
      ],
    },
  }, server);
  await seed(uttori);
  const express_response = await request(server).get('/');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('falls through to 404 when home document is missing', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, homePage: '' }, server);
  await seed(uttori);
  const express_response = await request(server).get('/');
  t.is(express_response.status, 404);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found');
});

test('falls through to 404 when this.hooks.fetch throws an error fetching the home document', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  uttori.hooks.fetch = () => {
    throw new Error('test');
  };
  const express_response = await request(server).get('/');
  t.is(express_response.status, 404);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found');
});
