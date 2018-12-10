const test = require('ava');
const MarkdownIt = require('markdown-it');

const StorageProvider = require('uttori-storage-provider-json-file');
const UploadProvider = require('uttori-upload-provider-multer'); // require('./__stubs/UploadProvider.js');
const SearchProvider = require('./__stubs/SearchProvider.js');

const UttoriWiki = require('../app/index.js');

const { server, cleanup } = require('./_helpers/server.js');

const md = new MarkdownIt();

test.before((_t) => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test('validateConfig.validateConfig(config): throws when missing StorageProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      SearchProvider,
      UploadProvider,
    }, server, md);
  }, Error);
  t.is(error.message, 'No StorageProvider provided.');
});

test('validateConfig(config): throws when missing SearchProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      StorageProvider,
      UploadProvider,
    }, server, md);
  }, Error);
  t.is(error.message, 'No SearchProvider provided.');
});

test('validateConfig(config): throws when missing UploadProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      SearchProvider,
      StorageProvider,
    }, server, md);
  }, Error);
  t.is(error.message, 'No UploadProvider provided.');
});

test('validateConfig(config): throws when incorrect sitemap_url_filter', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      SearchProvider,
      StorageProvider,
      UploadProvider,
      sitemap_url_filter: {},
    }, server, md);
  }, Error);
  t.is(error.message, 'sitemap_url_filter should be an array.');
});

test('validateConfig(config): throws when missing theme_dir', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      SearchProvider,
      StorageProvider,
      UploadProvider,
      sitemap_url_filter: [],
    }, server, md);
  }, Error);
  t.is(error.message, 'No theme_dir provided.');
});

test('validateConfig(config): throws when missing public_dir', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      SearchProvider,
      StorageProvider,
      UploadProvider,
      sitemap_url_filter: [],
      theme_dir: 'test',
    }, server, md);
  }, Error);
  t.is(error.message, 'No public_dir provided.');
});
