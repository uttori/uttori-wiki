const test = require('ava');
const { UttoriWiki } = require('../src');

const { serverSetup } = require('./_helpers/server.js');

test('validateConfig(config): throws when missing theme_dir', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({}, server);
  }, { message: 'No theme_dir provided.' });
});

test('validateConfig(config): throws when missing public_dir', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      theme_dir: 'test',
    }, server);
  }, { message: 'No public_dir provided.' });
});

test('validateConfig(config): can validate', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      theme_dir: 'test',
      public_dir: 'test',
    }, server);
  });
});
