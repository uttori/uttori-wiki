import test from 'ava';
import sinon from 'sinon';
import request from 'supertest';

import { TagRoutesPlugin, UttoriWiki } from '../src/index.js';

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
    [TagRoutesPlugin.configKey]: {
      ...config[TagRoutesPlugin.configKey],
      middleware: {
        ...config[TagRoutesPlugin.configKey].middleware,
        tagIndex: [
          (req, res, _next) => {
            res.status(500).json({});
          },
        ],
      },
    },
  }, server);
  await seed(uttori);
  const express_response = await request(server).get('/tags');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
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
  t.is(title[1], 'Cool Tagged Documents');
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
    [TagRoutesPlugin.configKey]: {
      ...config[TagRoutesPlugin.configKey],
      tagIndexRoute: 'tags',
      tagRoute: 'tags',
      apiRoute: 'tag-api',
      title: 'Tags',
      limit: 1024,
      events: {
        bindRoutes: ['bind-routes'],
        validateConfig: ['validate-config'],
      },
      middleware: {
        ...config[TagRoutesPlugin.configKey].middleware,
        tag: [
          (req, res, _next) => {
            res.status(500).json({});
          },
        ],
      },
    },
  }, server);
  await seed(uttori);
  const express_response = await request(server).get('/tags/Cool');
  t.is(express_response.status, 500);
  t.is(express_response.text, '{}');
});

test('TagRoutesPlugin.getTaggedDocuments(tag): returns documents with the given tag', async (t) => {
  t.plan(4);

  let documents;
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  documents = await TagRoutesPlugin.getTaggedDocuments(uttori, 'Cool');
  t.is(documents.length, 2);
  t.is(documents[0].slug, 'demo-title');
  t.is(documents[1].slug, 'fake-title');

  documents = await TagRoutesPlugin.getTaggedDocuments(uttori, 'No Tag');
  t.deepEqual(documents, []);
});
