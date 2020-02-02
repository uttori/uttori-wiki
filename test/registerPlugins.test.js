const test = require('ava');

const StorageProvider = require('uttori-storage-provider-json-memory');
const SearchProvider = require('./__stubs/SearchProvider.js');

const UttoriWiki = require('../src');

const { serverSetup } = require('./_helpers/server.js');

test('registerPlugins(config): does not fail when plugins is broken', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      StorageProvider,
      SearchProvider,
      theme_dir: '/tmp',
      public_dir: '/tmp',
      plugins: {},
    }, server);
  });
});

test('registerPlugins(config): does not load plugins that do not begin with uttori-plugin-', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      StorageProvider,
      SearchProvider,
      theme_dir: '/tmp',
      public_dir: '/tmp',
      plugins: ['fake'],
    }, server);
  });
});
