const test = require('ava');
const config = require('../src/config');

test('config can be parsed', (t) => {
  t.notThrows(() => {
    JSON.stringify(config);
  });
});
