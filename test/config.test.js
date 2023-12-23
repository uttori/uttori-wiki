import test from 'ava';

import config from '../src/config.js';

test('config can be parsed', (t) => {
  t.notThrows(() => {
    JSON.stringify(config);
  });
});
