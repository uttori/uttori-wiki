import { promises as fs } from 'node:fs';
import test from 'ava';
import { EventDispatcher } from '@uttori/event-dispatcher';

import { slow } from '../_helpers/slow.js';
import SearchSQLitePlugin from '../../src/plugins/search-provider-sqlite.js';

const folder = 'test/site-search-provider-sqlite';

let counter = 0;

/**
 * Build a register-ready context that avoids network indexing on startup.
 * @param {object} [overrides] Config overrides.
 * @returns {{ hooks: EventDispatcher, config: Record<string, any> }} The context.
 */
function makeContext(overrides = {}) {
  counter += 1;
  return {
    hooks: new EventDispatcher(),
    config: {
      [SearchSQLitePlugin.configKey]: {
        databasePath: `${folder}/db-${counter}.sqlite`,
        bootstrapIndexOnStartup: false,
        rebuildIndexOnStartup: false,
        // Avoid attempting to talk to Ollama during indexing in these tests.
        ollamaBaseUrl: 'http://127.0.0.1:1',
        ...overrides,
      },
    },
  };
}

test.before(async () => {
  await fs.rm(folder, { recursive: true, force: true });
  await fs.mkdir(folder, { recursive: true });
});

test.after.always(async () => {
  await fs.rm(folder, { recursive: true, force: true });
});

test('configKey: returns the key', (t) => {
  t.is(SearchSQLitePlugin.configKey, 'uttori-plugin-search-provider-sqlite');
});

test('defaultConfig: maps storage and search hooks', (t) => {
  const config = SearchSQLitePlugin.defaultConfig();
  t.deepEqual(config.events.add, ['storage-add']);
  t.deepEqual(config.events.retrieve, ['search-retrieve']);
  t.deepEqual(config.events.listDocuments, ['search-documents']);
  t.deepEqual(config.events.getPopularSearchTerms, ['search-popular-terms']);
});

test('validateConfig: throws when the config key is missing', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({}), { message: /configuration key is missing/ });
});

test('validateConfig: throws on a non-string databasePath', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { databasePath: 5 } }), { message: /`databasePath` should be a string/ });
});

test('validateConfig: throws on a non-object databaseOptions', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { databaseOptions: 'no' } }), { message: /`databaseOptions` should be an object/ });
});

test('validateConfig: throws on a non-object databseOptions alias', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { databseOptions: 'no' } }), { message: /`databseOptions` should be an object/ });
});

test('validateConfig: throws on a non-string ollamaBaseUrl', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { ollamaBaseUrl: 5 } }), { message: /`ollamaBaseUrl` should be a string/ });
});

test('validateConfig: throws on a non-string embedModel', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { embedModel: 5 } }), { message: /`embedModel` should be a string/ });
});

test('validateConfig: throws on a non-function embedPrompt', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { embedPrompt: 'no' } }), { message: /`embedPrompt` should be a function/ });
});

test('validateConfig: throws on a non-array ignoreSlugs', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { ignoreSlugs: 'no' } }), { message: /`ignoreSlugs` should be an array/ });
});

test('validateConfig: throws on a non-array ignoreTags', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { ignoreTags: 'no' } }), { message: /`ignoreTags` should be an array/ });
});

test('validateConfig: throws on a non-function extractAttachmentText', (t) => {
  t.throws(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: { extractAttachmentText: 'no' } }), { message: /`extractAttachmentText` should be a function/ });
});

test('validateConfig: accepts a default-shaped config', (t) => {
  t.notThrows(() => SearchSQLitePlugin.validateConfig({ [SearchSQLitePlugin.configKey]: {} }));
});

test('register: skips events that map to no instance or static method', async (t) => {
  const context = makeContext({ events: { totallyNotAMethod: ['some-event'] } });
  await t.notThrowsAsync(SearchSQLitePlugin.register(/** @type {any} */ (context)));
  // The unknown method is ignored while the default hooks remain bound.
  t.is(context.hooks.events['some-event'], undefined);
  t.is(context.hooks.events['storage-add'].callbacks.length, 1);
});

test('register: errors without an event dispatcher', async (t) => {
  await t.throwsAsync(SearchSQLitePlugin.register({ hooks: {} }), { message: /Missing event dispatcher/ });
});

test('register: keeps the default events even when config events are nulled out', async (t) => {
  // register() always merges base events, so the default hooks remain bound.
  const context = makeContext({ events: null });
  await t.notThrowsAsync(SearchSQLitePlugin.register(/** @type {any} */ (context)));
  t.is(context.hooks.events['storage-add'].callbacks.length, 1);
});

test('register: binds instance methods to their hooks', async (t) => {
  const context = makeContext();
  await SearchSQLitePlugin.register(/** @type {any} */ (context));
  t.true(Array.isArray(context.hooks.events['storage-add']?.callbacks));
  t.is(context.hooks.events['storage-add'].callbacks.length, 1);
  t.is(context.hooks.events['search-retrieve'].callbacks.length, 1);
  t.is(context.hooks.events['search-documents'].callbacks.length, 1);
});

test('register: binds the static validateConfig fallback to validate-config', async (t) => {
  const context = makeContext();
  await SearchSQLitePlugin.register(/** @type {any} */ (context));
  t.true(context.hooks.events['validate-config'].callbacks.includes(SearchSQLitePlugin.validateConfig));
});

slow('register: bound hooks operate end-to-end through the dispatcher', async (t) => {
  const context = makeContext();
  await SearchSQLitePlugin.register(/** @type {any} */ (context));

  // Use fetch (which awaits callbacks) rather than dispatch (fire-and-forget) so the add completes.
  await context.hooks.fetch('storage-add', { slug: 'alpha', title: 'Alpha', content: 'hello world', tags: [] }, context);

  const [document] = await context.hooks.fetch('storage-get', 'alpha', context);
  t.is(document.slug, 'alpha');

  const [documents] = await context.hooks.fetch('search-documents', {}, context);
  t.is(documents.length, 1);
  t.is(documents[0].id, 'alpha');
});
