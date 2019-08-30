const test = require('ava');

const UttoriWiki = require('../app');

const { config, server } = require('./_helpers/server.js');

test('spam(config): throws when missing recaptcha_site_key', (t) => {
  const error = t.throws(() => {
    const uttori = new UttoriWiki(config, server);
    uttori.spam({ recaptcha_secret_key: 'secret' });
  }, Error);
  t.is(error.message, 'Error initializing reCaptcha: missing config variable recaptcha_site_key');
});

test('spam(config): throws when missing recaptcha_secret_key', (t) => {
  const error = t.throws(() => {
    const uttori = new UttoriWiki(config, server);
    uttori.spam({ recaptcha_site_key: 'site' });
  }, Error);
  t.is(error.message, 'Error initializing reCaptcha: missing config variable recaptcha_secret_key');
});

test('spam(config): throws when missing reCaptcha', (t) => {
  const error = t.throws(() => {
    const uttori = new UttoriWiki(config, server);
    uttori.spam({ recaptcha_secret_key: 'secret', recaptcha_site_key: 'site' });
  }, Error);
  t.is(error.message, 'Error initializing reCaptcha:');
});
