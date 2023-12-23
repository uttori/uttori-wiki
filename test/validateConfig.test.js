import test from 'ava';
import { UttoriWiki } from '../src/index.js';

import { serverSetup } from './_helpers/server.js';

test('validateConfig(config): throws when missing themePath', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      themePath: undefined,
    }, server);
  }, { message: 'No themePath provided.' });
});

test('validateConfig(config): throws when missing publicPath', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      themePath: 'test',
      publicPath: undefined,
    }, server);
  }, { message: 'No publicPath provided.' });
});

test('validateConfig(config): throws when useDeleteKey is true but deleteKey is not set', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      themePath: 'test',
      publicPath: 'test',
      useDeleteKey: true,
    }, server);
  }, { message: 'Using useDeleteKey verification but no deleteKey value set.' });
});

test('validateConfig(config): throws when useEditKey is true but editKey is not set', (t) => {
  t.throws(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      themePath: 'test',
      publicPath: 'test',
      useDeleteKey: true,
      deleteKey: 'test-key',
      useEditKey: true,
    }, server);
  }, { message: 'Using useEditKey verification but no editKey value set.' });
});

test('validateConfig(config): can validate', (t) => {
  t.notThrows(() => {
    const server = serverSetup();
    const _uttori = new UttoriWiki({
      themePath: 'test',
      publicPath: 'test',
      useDeleteKey: true,
      deleteKey: 'test-key',
      useEditKey: true,
      editKey: 'test-key',
    }, server);
  });
});
