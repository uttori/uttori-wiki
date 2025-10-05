import fs from 'node:fs/promises';
import test from 'ava';
import { EventDispatcher } from '@uttori/event-dispatcher';
import AnalyticsPlugin from '../../src/plugins/analytics-json-file.js';
import path from 'node:path';

test.beforeEach(async () => {
  await fs.mkdir('test/site/data', { recursive: true });
  await fs.writeFile('test/site/data/visits.json', '{"test":1,"zero":0,"two":2}');
});


test('AnalyticsPlugin.defaultConfig(): can return a default config', (t) => {
  t.notThrows(AnalyticsPlugin.defaultConfig);
});

test('AnalyticsPlugin.validateConfig(config, _context): throws when sitemaps key is missing', (t) => {
  t.throws(() => {
    AnalyticsPlugin.validateConfig({});
  }, { message: 'Config Error: \'uttori-plugin-analytics-json-file\' configuration key is missing.' });
});

test('AnalyticsPlugin.validateConfig(config, _context): throws when directory is missing', (t) => {
  t.throws(() => {
    AnalyticsPlugin.validateConfig({
      [AnalyticsPlugin.configKey]: {},
    });
  }, { message: 'directory is required should be the path to the location you want the JSON file to be writtent to.' });
});

test('AnalyticsPlugin.validateConfig(config, _context): throws when directory is not a string', (t) => {
  t.throws(() => {
    AnalyticsPlugin.validateConfig({
      [AnalyticsPlugin.configKey]: {
        directory: {},
      },
    });
  }, { message: 'directory is required should be the path to the location you want the JSON file to be writtent to.' });
});

test('AnalyticsPlugin.validateConfig(config, _context): throws when limit is not a number', (t) => {
  t.throws(() => {
    AnalyticsPlugin.validateConfig({
      [AnalyticsPlugin.configKey]: {
        directory: './',
        limit: 'a',
      },
    });
  }, { message: 'limit is required should be the number of documents to return.' });
});

test('AnalyticsPlugin.validateConfig(config, _context): can validate', (t) => {
  t.notThrows(() => {
    AnalyticsPlugin.validateConfig({
      [AnalyticsPlugin.configKey]: {
        directory: './',
        limit: 10,
      },
    });
  });
});

test('AnalyticsPlugin.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    AnalyticsPlugin.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('AnalyticsPlugin.register(context): errors without events', (t) => {
  t.throws(() => {
    AnalyticsPlugin.register({ hooks: { on: () => {} }, config: { [AnalyticsPlugin.configKey]: { directory: 'test/site/data', events: undefined } } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test.serial('Plugin.register(context): does not error with events corresponding to missing methods', (t) => {
  t.notThrows(() => {
    AnalyticsPlugin.register({
      hooks: {
        on: () => {},
      },
      config: {
        [AnalyticsPlugin.configKey]: {
          events: {
            test: ['fake'],
          },
          directory: 'test/site/data',
        },
      },
    });
  });
});

test.serial('AnalyticsPlugin.register(context): can register', (t) => {
  t.notThrows(() => {
    AnalyticsPlugin.register({
      hooks: new EventDispatcher(),
      config: { [AnalyticsPlugin.configKey]: { events: { updateDocument: [] }, directory: 'test/site/data', limit: 10 } },
      buildMetadata: () => Promise.resolve({}),
    });
  });
});

test.serial('AnalyticsPlugin: E2E', async (t) => {
  const hooks = new EventDispatcher();
  const config = {
    [AnalyticsPlugin.configKey]: {
      name: 'visits',
      extension: 'json',
      directory: 'test/site/data',
      events: {
        getCount: ['document-view-count'],
        getPopularDocuments: ['popular-documents'],
        updateDocument: ['document-save'],
      },
      limit: 10,
    },
  };
  /** @type {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', import('../../dist/plugins/analytics-json-file.d.ts').AnalyticsPluginConfig>} */
  const context = {
    hooks,
    config,
    buildMetadata: () => Promise.resolve({}),
  };

  AnalyticsPlugin.register(context);

  let output = await fs.readFile(path.join('test/site/data', 'visits.json'), 'utf8');
  t.is(output, '{"test":1,"zero":0,"two":2}');

  // hooks.dispatch('updateDocument', { slug: 'test' });
  // output = await fs.readFile(path.join('test/site/data', 'visits.json'), 'utf8');
  // t.is(output, '{"test":2,"zero":0,"two":2}');

  await hooks.filter('document-save', { slug: 'new' });
  output = await fs.readFile(path.join('test/site/data', 'visits.json'), 'utf8');
  t.is(output, '{"test":1,"zero":0,"two":2,"new":1}');

  await hooks.filter('document-save', { slug: 'new' });
  output = await fs.readFile(path.join('test/site/data', 'visits.json'), 'utf8');
  t.is(output, '{"test":1,"zero":0,"two":2,"new":2}');

  await hooks.validate('document-save', { slug: 'test' });
  output = await fs.readFile(path.join('test/site/data', 'visits.json'), 'utf8');
  t.is(output, '{"test":2,"zero":0,"two":2,"new":2}');

  await hooks.validate('document-save', {});
  output = await fs.readFile(path.join('test/site/data', 'visits.json'), 'utf8');
  t.is(output, '{"test":2,"zero":0,"two":2,"new":2}');

  await hooks.filter('document-save', { slug: 'new' });
  output = await fs.readFile(path.join('test/site/data', 'visits.json'), 'utf8');
  t.is(output, '{"test":2,"zero":0,"two":2,"new":3}');

  // Fetch returns an array of results.
  output = await hooks.fetch('popular-documents', config, context);
  t.deepEqual(output[0], [
    { slug: 'new', count: 3 },
    { slug: 'test', count: 2 },
    { slug: 'two', count: 2 },
    { slug: 'zero', count: 0 },
  ]);
  output = await hooks.fetch('popular-documents', config, context);
  t.deepEqual(output[0], [
    { slug: 'new', count: 3 },
    { slug: 'test', count: 2 },
    { slug: 'two', count: 2 },
    { slug: 'zero', count: 0 },
  ]);
  output = await hooks.fetch('popular-documents', config, context);
  t.deepEqual(output[0], [
    { slug: 'new', count: 3 },
    { slug: 'test', count: 2 },
    { slug: 'two', count: 2 },
    { slug: 'zero', count: 0 },
  ]);

  // Can return the view count for a found document.
  output = await hooks.fetch('document-view-count', { slug: 'new' }, context);
  t.is(output[0], 3);

  // Return 0 for missing documents.
  output = await hooks.fetch('document-view-count', { slug: 'nada' }, context);
  t.is(output[0], 0);
  output = await hooks.fetch('document-view-count', {}, context);
  t.is(output[0], 0);
});
