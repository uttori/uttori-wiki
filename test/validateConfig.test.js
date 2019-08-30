const test = require('ava');

const StorageProvider = require('uttori-storage-provider-json-file');
const UploadProvider = require('uttori-upload-provider-multer'); // require('./__stubs/UploadProvider.js');
const SearchProvider = require('./__stubs/SearchProvider.js');
const AnalyticsProvider = require('./__stubs/AnalyticsProvider.js');
const Renderer = require('./__stubs/Renderer.js');

const UttoriWiki = require('../app');

const { server, cleanup } = require('./_helpers/server.js');

test.before(() => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test('validateConfig(config): throws when missing AnalyticsProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      StorageProvider,
      SearchProvider,
      UploadProvider,
      Renderer,
    }, server);
  }, Error);
  t.is(error.message, 'No AnalyticsProvider provided.');
});

test('validateConfig(config): throws when missing StorageProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      SearchProvider,
      UploadProvider,
      Renderer,
    }, server);
  }, Error);
  t.is(error.message, 'No StorageProvider provided.');
});

test('validateConfig(config): throws when missing SearchProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      StorageProvider,
      UploadProvider,
      Renderer,
    }, server);
  }, Error);
  t.is(error.message, 'No SearchProvider provided.');
});

test('validateConfig(config): throws when missing UploadProvider', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      SearchProvider,
      StorageProvider,
      Renderer,
    }, server);
  }, Error);
  t.is(error.message, 'No UploadProvider provided.');
});

test('validateConfig(config): throws when missing Renderer', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      SearchProvider,
      StorageProvider,
      UploadProvider,
    }, server);
  }, Error);
  t.is(error.message, 'No Renderer provided.');
});

test('validateConfig(config): throws when incorrect sitemap', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      SearchProvider,
      StorageProvider,
      UploadProvider,
      Renderer,
      sitemap: {},
    }, server);
  }, Error);
  t.is(error.message, 'sitemap should be an array.');
});

test('validateConfig(config): throws when incorrect sitemap_url_filter', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      SearchProvider,
      StorageProvider,
      UploadProvider,
      Renderer,
      sitemap_url_filter: {},
    }, server);
  }, Error);
  t.is(error.message, 'sitemap_url_filter should be an array.');
});

test('validateConfig(config): throws when missing theme_dir', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      SearchProvider,
      StorageProvider,
      UploadProvider,
      Renderer,
      sitemap_url_filter: [],
    }, server);
  }, Error);
  t.is(error.message, 'No theme_dir provided.');
});

test('validateConfig(config): throws when missing public_dir', (t) => {
  const error = t.throws(() => {
    const _uttori = new UttoriWiki({
      AnalyticsProvider,
      SearchProvider,
      StorageProvider,
      UploadProvider,
      Renderer,
      sitemap_url_filter: [],
      theme_dir: 'test',
    }, server);
  }, Error);
  t.is(error.message, 'No public_dir provided.');
});
