import test from 'ava';
import SearchProvider from '../../../src/plugins/utilities/search-lunr.js';
import localeFr from 'lunr-languages/lunr.fr.js';
import SearchLunrPlugin from '../../../src/plugins/search-provider-lunr.js';

const documents = [
  {
    title: 'First Document',
    slug: 'first-document',
    content: '# Markdown 1st',
    updateDate: 1497188345000,
    createDate: 1497188348000,
    tags: ['cool', 'blue'],
  },
  {
    title: 'Second Document',
    slug: 'second-document',
    content: '## Markdown 2nd',
    updateDate: 1497188345000,
    createDate: 1497188348000,
    tags: ['cool', 'red'],
  },
  {
    title: 'Third Document',
    slug: 'third-document',
    content: '### Markdown 3rd',
    updateDate: 1497188345000,
    createDate: 1497188348000,
    tags: ['lame', 'red', 'blue'],
  },
];

const config = {
  [SearchLunrPlugin.configKey]: {},
};

const hooks = {
  on: () => {},
  fetch: async () => Promise.resolve([documents]),
};

test('constructor(config): does not throw error', (t) => {
  t.notThrows(() => {
    const _ = new SearchProvider();
  });
});

test('constructor(config): uses provided lunr_locales', (t) => {
  const s = new SearchProvider({ lunr_locales: [localeFr] });
  t.deepEqual(s.config.lunr_locales, [localeFr]);
});

test('buildIndex(context): loops through all documents without error', async (t) => {
  const s = new SearchProvider({});
  await t.notThrowsAsync(async () => {
    await s.buildIndex({ config, hooks });
  });
});

test('buildIndex(context): handles missing documents', async (t) => {
  const s = new SearchProvider({});

  await t.notThrowsAsync(async () => {
    await s.buildIndex({ config, hooks: { fetch: () => Promise.resolve([]) } });
  });

  await t.notThrowsAsync(async () => {
    await s.buildIndex({ hooks: { fetch: () => Promise.resolve(undefined) } });
  });

  await t.notThrowsAsync(async () => {
    await s.buildIndex();
  });
});

test('setup(config): can setup with French', (t) => {
  const s = new SearchProvider({ lunr_locales: ['fr'], lunrLocaleFunctions: [localeFr], ignoreSlugs: [] });

  t.notThrows(() => {
    s.setup();
  });
});

test('search({ query, limit }): calls updateTermCount', async (t) => {
  const s = new SearchProvider();
  await s.buildIndex({ hooks });
  await s.search({ query: 'test' });

  t.deepEqual(s.getPopularSearchTerms({ limit: 1 }), ['test']);
});

test('internalSearch({ query, limit }): calls the internal lunr search and returns a list of results', async (t) => {
  t.plan(1);

  const s = new SearchProvider();
  const context = { hooks };
  await s.buildIndex(context);
  const results = await s.internalSearch({ query: 'document' }, context);

  t.is(results, documents);
});

test('internalSearch({ query, limit }): supports lunr locales', async (t) => {
  t.plan(1);

  const s = new SearchProvider({ lunr_locales: ['fr'], lunrLocaleFunctions: [localeFr] });
  const context = { hooks };
  await s.buildIndex(context);
  const results = await s.internalSearch({ query: 'document' }, context);

  t.is(results, documents);
});

test('internalSearch({ query, limit }): returns nothing when lunr fails to return anything', async (t) => {
  const s = new SearchProvider();
  const context = { hooks };
  await s.buildIndex(context);
  const results = await s.internalSearch({ query: 'test' }, context);

  t.deepEqual(results, []);
});

test('internalSearch({ query, limit }): returns nothing when the storage call fails to return anything', async (t) => {
  const s = new SearchProvider();
  const context = { hooks };
  await s.buildIndex(context);
  const results = await s.internalSearch({ query: 'test' }, { hooks: { fetch: () => Promise.resolve([]) } });

  t.deepEqual(results, []);
});

test('indexAdd(documents, context): does not throw error', (t) => {
  const s = new SearchProvider();
  const context = { hooks };
  t.notThrows(async () => {
    await s.indexAdd([], context);
  });
});

test('indexUpdate(documents, context): does not throw error', (t) => {
  const s = new SearchProvider();
  const context = { hooks };
  t.notThrows(async () => {
    await s.indexUpdate([], context);
  });
});

test('indexRemove(documents, context): does not throw error', (t) => {
  const s = new SearchProvider();
  const context = { config, hooks };
  t.notThrows(async () => {
    await s.indexRemove([], context);
  });
});

test('updateTermCount(term): does nothing when no term is passed in', async (t) => {
  const s = new SearchProvider();
  await s.buildIndex({ hooks });
  s.updateTermCount();
  t.deepEqual(s.searchTerms, {});
});

test('updateTermCount(term): sets a value of 1 for a new term', async (t) => {
  const s = new SearchProvider();
  await s.buildIndex({ hooks });
  s.updateTermCount('test');
  t.deepEqual(s.searchTerms, { test: 1 });
});

test('updateTermCount(term): updates a value by 1 for an existing term', async (t) => {
  const s = new SearchProvider();
  await s.buildIndex({ hooks });
  s.searchTerms = { test: 1 };
  s.updateTermCount('test');
  t.deepEqual(s.searchTerms, { test: 2 });
});

test('getPopularSearchTerms({ limit }): returns empty when there is no data', async (t) => {
  const s = new SearchProvider();
  await s.buildIndex({ hooks });
  t.deepEqual(s.getPopularSearchTerms({}), []);
});

test('getPopularSearchTerms({ limit }): returns a sorted array of search terms limited by count', async (t) => {
  const s = new SearchProvider();
  await s.buildIndex({ hooks });
  s.searchTerms = {
    LDA: 1,
    patch: 2,
    ROM: 4,
    snes: 3,
  };
  t.deepEqual(s.getPopularSearchTerms({ limit: 10 }), ['ROM', 'snes', 'patch', 'LDA']);
  t.deepEqual(s.getPopularSearchTerms({ limit: 1 }), ['ROM']);
});
