const test = require('ava');
const { UttoriWiki } = require('../src');

const { serverSetup } = require('./_helpers/server.js');

test('validateConfig(config): throws when missing theme_dir', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      theme_dir: undefined,
    }, server);
  }, { message: 'No theme_dir provided.' });
});

test('validateConfig(config): throws when missing public_dir', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      theme_dir: 'test',
      public_dir: undefined,
    }, server);
  }, { message: 'No public_dir provided.' });
});

test('validateConfig(config): throws when use_delete_key is true but delete_key is not set', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      theme_dir: 'test',
      public_dir: 'test',
      use_delete_key: true,
    }, server);
  }, { message: 'Using use_delete_key verification but no delete_key value set.' });
});

test('validateConfig(config): throws when use_edit_key is true but edit_key is not set', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      theme_dir: 'test',
      public_dir: 'test',
      use_delete_key: true,
      delete_key: 'test-key',
      use_edit_key: true,
    }, server);
  }, { message: 'Using use_edit_key verification but no edit_key value set.' });
});

test('validateConfig(config): can validate', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      theme_dir: 'test',
      public_dir: 'test',
      use_delete_key: true,
      delete_key: 'test-key',
      use_edit_key: true,
      edit_key: 'test-key',
    }, server);
  });
});
