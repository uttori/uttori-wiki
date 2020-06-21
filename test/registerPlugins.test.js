const test = require('ava');

const { UttoriWiki } = require('../src');

const { serverSetup } = require('./_helpers/server.js');

test('registerPlugins(config): does not fail when plugins is broken', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      theme_dir: '/tmp',
      public_dir: '/tmp',
      plugins: {},
    }, server);
  });
});
