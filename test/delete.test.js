// @ts-nocheck
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server');

const response = { set: () => {}, redirect: () => {}, render: () => {} };

test('deletes the document and redirects to the home page', async (t) => {
  t.plan(2);

  const testDelete = {
    title: 'Delete Page',
    slug: 'test-delete',
    content: '## Delete Page',
    updateDate: 1412921841841,
    createDate: undefined,
  };
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  // uttori.storageProvider.add(testDelete);
  await uttori.saveValid({ params: {}, body: testDelete }, response, () => {});
  const express_response = await request(server).get('/test-delete/delete/test-key');
  t.is(express_response.status, 302);
  t.is(express_response.text, 'Found. Redirecting to https://fake.test');
});

test('falls through to next when slug is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.delete({ params: { key: 'test-key' } }, response, next);
  t.true(next.calledOnce);
});

test('falls through to next when document is not found', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await uttori.delete({ params: { slug: 'missing', key: 'test-key' } }, response, next);
  t.true(next.calledOnce);
});

test('falls to 404 when miss matched key', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const _uttori = new UttoriWiki(config, server);
  const express_response = await request(server).get('/missing/delete/bad-key');
  t.is(express_response.status, 404);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], '404 Not Found | Wiki');
});
