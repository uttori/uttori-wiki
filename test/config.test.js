const test = require('ava');
const config = require('../src/config.default.js');

test('config can be parsed', (t) => {
  t.notThrows(() => {
    JSON.stringify(config);
  });
});
