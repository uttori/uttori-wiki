// @ts-nocheck
const test = require('ava');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup } = require('./_helpers/server');

const response = { set: () => {}, redirect: () => {}, render: () => {} };

test('saveValid: parses tags as a string', async (t) => {
  t.plan(2);
  const slug = 'test-parse-tags-string';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sinon.spy();
  await uttori.saveValid({ params: {},
    body: {
      title: 'Delete Page',
      slug,
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: 'tag-1,tag-2,tag-3',
    },
    wikiFlash }, response, () => {});

  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.tags, ['tag-1', 'tag-2', 'tag-3']);
});

test('can be replaced', async (t) => {
  t.plan(1);

  const spy = sinon.spy();
  const saveValidRoute = (_request, _response, next) => {
    spy();
    next();
  };
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, saveValidRoute }, server);
  await uttori.saveValid({ params: {}, body: {} }, response, () => {});
  t.is(spy.called, true);
});

test('saveValid: parses tags as an array', async (t) => {
  t.plan(2);
  const slug = 'test-parse-tags-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sinon.spy();
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

  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.tags, ['tag-1', 'tag-2', 'tag-3']);
});

test('saveValid: parses redirects as a string', async (t) => {
  t.plan(2);
  const slug = 'test-parse-redirects-string';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sinon.spy();
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

  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.redirects, ['old-url', 'older-url', 'oldest-url', 'somehow-older']);
});

test('saveValid: parses redirects as an array', async (t) => {
  t.plan(2);
  const slug = 'test-parse-redirects-array';
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sinon.spy();
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

  const [document] = await uttori.hooks.fetch('storage-get', slug, this);
  t.is(document.slug, slug);
  t.deepEqual(document.redirects, ['old-url', 'older-url', 'oldest-url']);
});

test('saveValid: redirects back when no slug is found', async (t) => {
  t.plan(1);
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  const wikiFlash = sinon.spy();
  await uttori.saveValid({ params: {},
    body: {
      title: 'Delete Page',
      slug: '',
      content: '## Delete Page',
      updateDate: 1412921841841,
      createDate: undefined,
      tags: 'tag-1,tag-2,tag-3',
    },
    wikiFlash }, response, () => {});

  t.deepEqual(wikiFlash.lastCall.args, [
    'error',
    'Missing slug.',
  ]);
});
