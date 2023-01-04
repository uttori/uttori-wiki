// @ts-nocheck
const test = require('ava');
const request = require('supertest');
const sinon = require('sinon');

const { UttoriWiki } = require('../src');

const { config, serverSetup, seed } = require('./_helpers/server');

const response = { set: () => {}, redirect: () => {}, render: () => {} };

test('renders', async (t) => {
  t.plan(3);

  const server = serverSetup();
  const uttori = new UttoriWiki(config, server);
  await seed(uttori);
  const express_response = await request(server).get('/');
  t.is(express_response.status, 200);
  t.is(express_response.text.slice(0, 15), '<!DOCTYPE html>');
  const title = express_response.text.match(/<title>(.*?)<\/title>/i);
  t.is(title[1], 'Home Page | Wiki');
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

test('falls through to next when home document is missing', async (t) => {
  t.plan(1);

  const next = sinon.spy();
  const server = serverSetup();
  const uttori = new UttoriWiki({ ...config, home_page: '' }, server);
  await seed(uttori);
  await uttori.home({ params: { slug: '' } }, response, next);
  t.true(next.calledOnce);
});
