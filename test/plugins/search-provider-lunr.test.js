import test from 'ava';
import localeFr from 'lunr-languages/lunr.fr.js';
import { EventDispatcher } from '@uttori/event-dispatcher';
import StoragePlugin from '../../src/plugins/storage-provider-json-memory.js';
import SearchLunrPlugin from '../../src/plugins/search-provider-lunr.js';

test('Plugin.register(context): can register', async (t) => {
  await t.notThrowsAsync(async () => {
    await SearchLunrPlugin.register({ hooks: { on: () => {}, fetch: () => Promise.resolve([]) }, config: { [SearchLunrPlugin.configKey]: { events: { callback: [] } } } });
  });
});

test('Plugin.register(context): errors without event dispatcher', async (t) => {
  await t.throwsAsync(async () => {
    await SearchLunrPlugin.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('Plugin.register(context): errors without events', async (t) => {
  await t.throwsAsync(async () => {
    await SearchLunrPlugin.register({
      hooks: {
        on: () => {},
        fetch: () => Promise.resolve([]),
      },
      config: {
        [SearchLunrPlugin.configKey]: {
          events: undefined,
        },
      },
    });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('Plugin.register(context): does not error with events corresponding to missing methods', async (t) => {
  await t.notThrowsAsync(async () => {
    await SearchLunrPlugin.register({
      hooks: {
        on: () => {},
        fetch: () => Promise.resolve([]),
      },
      config: {
        [SearchLunrPlugin.configKey]: {
          events: {
            test: ['test'],
            getQuery: ['storage-query'],
          },
        },
      },
    });
  });
});

test('Plugin.defaultConfig(): can return a default config', (t) => {
  t.notThrows(SearchLunrPlugin.defaultConfig);
});

test('Plugin.configKey: returns the key', (t) => {
  t.is(SearchLunrPlugin.configKey, 'uttori-plugin-search-provider-lunr');
});


test('validateConfig(config): validates the provided config', (t) => {
  t.throws(() => {
    SearchLunrPlugin.validateConfig({});
  });

  t.notThrows(() => {
    SearchLunrPlugin.validateConfig({ [SearchLunrPlugin.configKey]: {} });
  });

  t.throws(() => {
    SearchLunrPlugin.validateConfig({ [SearchLunrPlugin.configKey]: { lunr_locales: true } });
  }, { message: 'Config Error: `lunr_locales` is should be an array of strings.' });

  t.notThrows(() => {
    SearchLunrPlugin.validateConfig({ [SearchLunrPlugin.configKey]: { lunr_locales: [] } });
  });

  t.throws(() => {
    SearchLunrPlugin.validateConfig({ [SearchLunrPlugin.configKey]: { lunr_locales: [], lunrLocaleFunctions: true } });
  }, { message: 'Config Error: `lunrLocaleFunctions` is should be an array of Lunr Language Plugins.' });

  t.throws(() => {
    SearchLunrPlugin.validateConfig({ [SearchLunrPlugin.configKey]: { lunr_locales: [], ignoreSlugs: [], ignoreSlugs: true } });
  }, { message: 'Config Error: `ignoreSlugs` is should be an array.' });

  t.notThrows(() => {
    SearchLunrPlugin.validateConfig({ [SearchLunrPlugin.configKey]: { lunr_locales: [], lunrLocaleFunctions: [], ignoreSlugs: [] } });
  });
});

test('Plugin E2E: can return search results', async (t) => {
  t.plan(2);
  const documents = [
    {
      customData: undefined,
      title: 'First Document',
      slug: 'first-document',
      content: '# Markdown 1st',
      updateDate: 1497188348000,
      createDate: 1497188348000,
      tags: ['cool', 'blue'],
    },
    {
      customData: undefined,
      title: 'Second Document',
      slug: 'second-document',
      content: '## Markdown 2nd',
      updateDate: 1497188348000,
      createDate: 1497188348000,
      tags: ['cool', 'red'],
    },
    {
      customData: undefined,
      title: 'Third Document',
      slug: 'third-document',
      content: '### Markdown 3rd',
      updateDate: 1497188348000,
      createDate: 1497188348000,
      tags: ['lame', 'red', 'blue'],
    },
  ];

  const context = {
    hooks: new EventDispatcher(),
    config: {
      [SearchLunrPlugin.configKey]: {
        events: {
          search: ['search-query'],
          getPopularSearchTerms: ['popular-search-terms'],
        },
        lunr_locales: [localeFr],
        ignoreSlugs: [],
      },
      [StoragePlugin.configKey]: {},
    },
  };
  StoragePlugin.register(context);
  await context.hooks.dispatch('storage-add', documents[0], context);
  await context.hooks.dispatch('storage-add', documents[1], context);
  await context.hooks.dispatch('storage-add', documents[2], context);

  await SearchLunrPlugin.register(context);
  const search_results = await context.hooks.fetch('search-query', { query: 'document' }, context);
  t.deepEqual(search_results, [documents]);

  const popular_search_terms = await context.hooks.fetch('popular-search-terms', {}, context);
  t.deepEqual(popular_search_terms, [['document']]);
});
