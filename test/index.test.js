const test = require('ava');

const UttoriWiki = require('../src');

const { config, serverSetup } = require('./_helpers/server.js');

test('throws when missing config', (t) => {
  t.throws(() => {
    const _uttori = new UttoriWiki();
  }, { message: 'No config provided.' });
});

test('throws when missing server', (t) => {
  t.throws(() => {
    const _uttori = new UttoriWiki(config);
  }, { message: 'No server provided.' });
});

test('can stand up', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki(config, server);
  });
});
