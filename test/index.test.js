const fs = require('fs-extra');
const test = require('ava');

const UttoriWiki = require('../app');

const { config, server, cleanup } = require('./_helpers/server.js');

test.before(() => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test.beforeEach(async () => {
  await fs.writeJson('test/site/data/visits.json', {
    'example-title': 2,
    'demo-title': 0,
    'fake-title': 1,
  });
});

test.afterEach(() => {
  cleanup();
});

test('throws when missing config', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki();
  }, Error);
  t.is(error.message, 'No config provided.');
});

test('throws when missing server', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki(config);
  }, Error);
  t.is(error.message, 'No server provided.');
});

test('can stand up', (t) => {
  t.notThrows(() => {
    const _uttori = new UttoriWiki(config, server);
  }, Error);
});
