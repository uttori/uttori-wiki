const test = require('ava');

const StorageProvider = require('./__stubs/StorageProvider.js');
const UploadProvider = require('./__stubs/UploadProvider.js');
const SearchProvider = require('./__stubs/SearchProvider.js');
const AnalyticsProvider = require('./__stubs/AnalyticsProvider.js');

const UttoriWiki = require('../app');

const { server, cleanup } = require('./_helpers/server.js');

test.before(() => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test('registerPlugins(config): does not fail when plugins is broken', (t) => {
  t.notThrows(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      StorageProvider,
      SearchProvider,
      UploadProvider,
      theme_dir: '/tmp',
      public_dir: '/tmp',
      plugins: {},
    }, server);
  });
});

test('registerPlugins(config): does not load plugins that do not begin with uttori-plugin-', (t) => {
  t.notThrows(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      StorageProvider,
      SearchProvider,
      UploadProvider,
      theme_dir: '/tmp',
      public_dir: '/tmp',
      plugins: ['fake'],
    }, server);
  });
});
