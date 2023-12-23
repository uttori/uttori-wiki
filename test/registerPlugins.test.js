import test from 'ava';

import { UttoriWiki } from '../src/index.js';

import { serverSetup } from './_helpers/server.js';

test('registerPlugins(config): does not fail when plugins is broken', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      themePath: '/tmp',
      publicPath: '/tmp',
      plugins: {},
    }, server);
  });
});

test('registerPlugins(config): does not fail when plugin.register throws an error', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      themePath: '/tmp',
      publicPath: '/tmp',
      plugins: [{
        register: () => {
          throw new Error('test');
        },
      }],
    }, server);
  });
});
