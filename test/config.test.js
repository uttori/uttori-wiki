const test = require('ava');
const config = require('../app/config.default.js');

test('Config: can be parsed', (t) => {
  t.notThrows(() => {
    JSON.stringify(config);
  });
});
