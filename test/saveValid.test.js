import test from 'ava';
import sinon from 'sinon';

import { UttoriWiki } from '../src/index.js';

import { config, serverSetup } from './_helpers/server.js';

const response = { set: () => {}, redirect: () => {}, render: () => {} };


let sandbox;
test.beforeEach(() => {
    sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('saveValid: parses tags as a string', async (t) => {
  t.plan(2);
  const slug = 'test-parse-tags-string';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid({ params: { slug },
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['tag-1', 'tag-2', 'tag-3'],
    },
    wikiFlash }, response, () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.tags, ['tag-1', 'tag-2', 'tag-3']);
});

test('route can be replaced', async (t) => {
  t.plan(1);

  const spy = sandbox.spy();
  const saveValidRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, saveValidRoute }, server);
  await uttori.saveValid({ params: { slug: 'test-can-be-replaced' }, body: {} }, response, () => {});
  t.is(spy.called, true);
});

test('saveValid: parses tags as an array', async (t) => {
  t.plan(2);
  const slug = 'test-parse-tags-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['tag-1', 'tag-2', 'tag-3'],
    },
    wikiFlash }, response, () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.tags, ['tag-1', 'tag-2', 'tag-3']);
});

test('saveValid: sorts tags', async (t) => {
  t.plan(2);
  const slug = 'test-parse-tags-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['c', 'b', 'a'],
    },
    wikiFlash }, response, () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.tags, ['a', 'b', 'c']);
});

test('saveValid: parses redirects as a string', async (t) => {
  t.plan(2);
  const slug = 'test-parse-redirects-string';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      redirects: 'old-url,older-url,oldest-url\n\rsomehow-older',
    },
    wikiFlash }, response, () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.redirects, ['old-url', 'older-url', 'oldest-url', 'somehow-older']);
});

test('saveValid: parses redirects as an array', async (t) => {
  t.plan(2);
  const slug = 'test-parse-redirects-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: [],
      redirects: ['old-url', 'older-url', 'oldest-url'],
    },
    wikiFlash }, response, () => {});

  /** @type {import('../src/wiki.js').UttoriWikiDocument[]} */
  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.redirects, ['old-url', 'older-url', 'oldest-url']);
});

test('saveValid: redirects back when no slug is found', async (t) => {
  t.plan(1);
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sandbox.spy();
  await uttori.saveValid({
    get: () => {},
    params: {},
    body: {
      title: 'Delete Page',
      slug: '',
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: ['tag-1', 'tag-2', 'tag-3'],
    },
    wikiFlash }, response, () => {});

  t.deepEqual(wikiFlash.lastCall.args, [
    'error',
    'Missing slug.',
  ]);
});
