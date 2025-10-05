import fs from 'node:fs/promises';
import test from 'ava';
import { EventDispatcher } from '@uttori/event-dispatcher';
import Plugin from '../../src/plugins/storage-provider-json-file.js';
import StorageProvider from '../../src/plugins/storeage-provider-json/storage-provider-file.js';

const folder = 'test/site-json-file';

const config = {
  contentDirectory: `${folder}/content`,
  historyDirectory: `${folder}/content/history`,
  extension: 'json',
  updateTimestamps: true,
  useHistory: true,
  useCache: true,
  spacesDocument: undefined,
  spacesHistory: undefined,
};

test.beforeEach(async () => {
  await StorageProvider.ensureDirectory(`${folder}/content/history`);
});

test.afterEach.always(async () => {
  try {
    await fs.rm(folder, { recursive: true, force: true });
  } catch (error) {
  }
});

test('Plugin.configKey: returns a stable string', (t) => {
  t.is(Plugin.configKey, 'uttori-plugin-storage-provider-json-file');
});

test('Plugin.register(context): can register', (t) => {
  t.notThrows(() => {
    Plugin.register({ hooks: { on: () => {} }, config: { [Plugin.configKey]: { ...config, events: { callback: [] } } } });
  });
});

test('Plugin.register(context): does not error with events corresponding to missing methods', async (t) => {
  await t.notThrowsAsync(async () => {
    await Plugin.register({
      hooks: {
        on: () => {},
      },
      config: {
        [Plugin.configKey]: {
          ...config,
          events: {
            test: ['test'],
          },
        },
      },
    });
  });
});

test('Plugin.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    Plugin.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('Plugin.register(context): errors without events', (t) => {
  t.throws(() => {
    Plugin.register({ hooks: { on: () => {} }, config: { [Plugin.configKey]: { events: undefined } } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('Plugin.defaultConfig(): can return a default config', (t) => {
  t.notThrows(Plugin.defaultConfig);
});

test('Plugin.get(viewModel, context): can return a document', async (t) => {
  t.plan(1);
  const document = {
    updateDate: new Date('2020-04-20').toISOString(),
    createDate: new Date('2020-04-20').toISOString(),
    customData: {},
    slug: 'test',
    tags: ['cool', 'blue'],
  };

  const hooks = new EventDispatcher();
  const context = {
    hooks,
    config: {
      [Plugin.configKey]: {
        ...config,
        events: {
          add: ['storage-add'],
          get: ['storage-get'],
        },
      },
    },
  };
  Plugin.register(context);

  await context.hooks.filter('storage-add', document);
  const output = await context.hooks.filter('storage-get', document.slug);
  t.deepEqual(output, document);
});
