import test from 'ava';
import { EventDispatcher } from '@uttori/event-dispatcher';
import Plugin from '../../src/plugins/storage-provider-json-memory.js';

test('register(context): can register', (t) => {
  t.notThrows(() => {
    Plugin.register({ hooks: { on: () => {} }, config: { [Plugin.configKey]: { events: { callback: [] } } } });
  });
});

test('register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    Plugin.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('register(context): errors without events', (t) => {
  t.throws(() => {
    Plugin.register({ hooks: { on: () => {} }, config: { [Plugin.configKey]: { events: undefined } } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('register(context): handles missing methods', (t) => {
  t.notThrows(() => {
    Plugin.register({
      hooks: new EventDispatcher(),
      config: { [Plugin.configKey]: { events: { womp: ['womp'] } } },
      buildMetadata: () => Promise.resolve({}),
    });
  });
});

test('defaultConfig(): can return a default config', (t) => {
  t.notThrows(Plugin.defaultConfig);
});

test('E2E: can return a document', async (t) => {
  t.plan(1);
  const document = {
    updateDate: new Date('2020-04-20').toISOString(),
    createDate: new Date('2020-04-20').toISOString(),
    customData: undefined,
    slug: 'test',
    tags: ['cool', 'blue'],
  };

  const hooks = new EventDispatcher();
  const context = {
    hooks,
    config: {
      [Plugin.configKey]: {
        events: {
          add: ['storage-add'],
          get: ['storage-get'],
        },
      },
    },
  };
  Plugin.register(context);

  await context.hooks.dispatch('storage-add', document);
  const output = await context.hooks.filter('storage-get', document.slug);
  t.deepEqual(output, document);
});
