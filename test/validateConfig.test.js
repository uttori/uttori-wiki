const test = require('ava');
const StorageProvider = require('uttori-storage-provider-json-memory');

const SearchProvider = require('./__stubs/SearchProvider.js');
const UttoriWiki = require('../src');

const { serverSetup } = require('./_helpers/server.js');

test('validateConfig(config): throws when missing StorageProvider', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      SearchProvider,
    }, server);
  }, { message: 'No StorageProvider provided.' });
});

test('validateConfig(config): throws when missing SearchProvider', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      StorageProvider,
    }, server);
  }, { message: 'No SearchProvider provided.' });
});

test('validateConfig(config): throws when missing theme_dir', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      SearchProvider,
      StorageProvider,
    }, server);
  }, { message: 'No theme_dir provided.' });
});

test('validateConfig(config): throws when missing public_dir', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      SearchProvider,
      StorageProvider,
      theme_dir: 'test',
    }, server);
  }, { message: 'No public_dir provided.' });
});
