import { promises as fs } from 'node:fs';
import test from 'ava';

import { slow } from '../_helpers/slow.js';
import SearchProvider from '../../src/plugins/utilities/search-sqlite.js';

const folder = 'test/site-search-sqlite';

let counter = 0;

/**
 * Build a fresh provider against a unique database path.
 * @param {object} [overrides] Config overrides.
 * @returns {SearchProvider} The provider instance.
 */
function makeProvider(overrides = {}) {
  counter += 1;
  return new SearchProvider({
    databasePath: `${folder}/db-${counter}.sqlite`,
    // Avoid attempting to talk to Ollama during indexing in these storage-focused tests.
    ollamaBaseUrl: 'http://127.0.0.1:1',
    ...overrides,
  });
}

/**
 * Build a minimal document.
 * @param {string} slug The slug.
 * @param {object} [extra] Extra fields.
 * @returns {object} The document.
 */
function makeDocument(slug, extra = {}) {
  return {
    slug,
    title: `Title ${slug}`,
    content: `Content for ${slug}.`,
    tags: [],
    ...extra,
  };
}

test.before(async () => {
  await fs.rm(folder, { recursive: true, force: true });
  await fs.mkdir(folder, { recursive: true });
});

test.after.always(async () => {
  await fs.rm(folder, { recursive: true, force: true });
});

test('constructor: creates the database file', async (t) => {
  const provider = makeProvider();
  await t.notThrowsAsync(provider.all());
});

slow('add / get: persists and returns a document', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha'));
  const document = await provider.get('alpha');
  t.is(document.slug, 'alpha');
  t.is(document.title, 'Title alpha');
  t.truthy(document.createDate);
});

slow('add: does not overwrite an existing document', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha', { title: 'First' }));
  await provider.add(makeDocument('alpha', { title: 'Second' }));
  const document = await provider.get('alpha');
  t.is(document.title, 'First');
});

test('get: returns undefined without a slug', async (t) => {
  const provider = makeProvider();
  t.is(await provider.get(''), undefined);
});

slow('update: changes content and records history', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha', { content: 'one' }));
  await provider.update({ document: makeDocument('alpha', { content: 'two' }) });
  const document = await provider.get('alpha');
  t.is(document.content, 'two');
  const history = await provider.getHistory('alpha');
  t.true(history.length >= 1);
});

slow('update: renaming a slug moves the document', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha'));
  await provider.update({ document: makeDocument('beta'), originalSlug: 'alpha' });
  t.is(await provider.get('alpha'), undefined);
  t.is((await provider.get('beta')).slug, 'beta');
});

slow('update: falls back to add when nothing exists', async (t) => {
  const provider = makeProvider();
  await provider.update({ document: makeDocument('gamma') });
  t.is((await provider.get('gamma')).slug, 'gamma');
});

slow('getRevision: returns a stored revision', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha', { content: 'one' }));
  const [revision] = await provider.getHistory('alpha');
  const document = await provider.getRevision({ slug: 'alpha', revision });
  t.is(document.slug, 'alpha');
});

test('getRevision: returns undefined without slug or revision', async (t) => {
  const provider = makeProvider();
  t.is(await provider.getRevision({ slug: '', revision: '1' }), undefined);
  t.is(await provider.getRevision({ slug: 'alpha', revision: '' }), undefined);
});

slow('delete: removes a document', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha'));
  await provider.delete('alpha');
  t.is(await provider.get('alpha'), undefined);
});

slow('all: returns a slug-keyed map', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha'));
  await provider.add(makeDocument('beta'));
  const all = await provider.all();
  t.deepEqual(Object.keys(all).sort(), ['alpha', 'beta']);
});

slow('getQuery: returns matching documents', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha'));
  await provider.add(makeDocument('beta'));
  const results = await provider.getQuery('SELECT * FROM documents WHERE \'slug\' = \'alpha\' ORDER BY updateDate DESC LIMIT 10');
  t.is(results.length, 1);
  t.is(results[0].slug, 'alpha');
});

slow('getQuery: COUNT(*) returns a number', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha'));
  await provider.add(makeDocument('beta'));
  const count = await provider.getQuery('SELECT COUNT(*) FROM documents WHERE \'slug\' != \'\' ORDER BY updateDate DESC LIMIT 100');
  t.is(count, 2);
});

slow('internalSearch: falls back to LIKE matching when FTS is unavailable', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha', { content: 'unicorn sightings' }));
  await provider.add(makeDocument('beta', { content: 'dragon tales' }));
  const results = await provider.internalSearch({ query: 'unicorn', limit: 10 });
  t.is(results.length, 1);
  t.is(results[0].slug, 'alpha');
});

test('internalSearch: returns empty for an empty query', async (t) => {
  const provider = makeProvider();
  t.deepEqual(await provider.internalSearch({ query: '' }), []);
});

slow('search: records popular search terms', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha', { content: 'unicorn' }));
  await provider.search({ query: 'unicorn' });
  await provider.search({ query: 'unicorn' });
  await provider.search({ query: 'dragon' });
  const terms = provider.getPopularSearchTerms({ limit: 1 });
  t.deepEqual(terms, ['unicorn']);
});

slow('listDocuments: returns selector-shaped rows', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha'));
  const documents = await provider.listDocuments();
  t.is(documents.length, 1);
  t.deepEqual(Object.keys(documents[0]).sort(), ['id', 'slug', 'title', 'update_date']);
  t.is(documents[0].id, 'alpha');
});

test('retrieve: returns an empty result for an empty query', async (t) => {
  const provider = makeProvider();
  t.deepEqual(await provider.retrieve(''), { query: '', chunks: [], citations: [] });
});

slow('reset: clears all documents', async (t) => {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha'));
  provider.reset();
  t.deepEqual(await provider.all(), {});
});

test('constructor: accepts both databaseOptions and the legacy databseOptions alias', async (t) => {
  const a = makeProvider({ databaseOptions: { timeout: 1000 } });
  const b = makeProvider({ databseOptions: { timeout: 1000 } });
  await t.notThrowsAsync(a.all());
  await t.notThrowsAsync(b.all());
});

/**
 * Seed a provider with three tagged + weighted documents for query-operator coverage.
 * @returns {Promise<SearchProvider>} The seeded provider.
 */
async function seedQueryProvider() {
  const provider = makeProvider();
  await provider.add(makeDocument('alpha', { tags: ['cool', 'new'], weight: 5 }));
  await provider.add(makeDocument('beta', { tags: ['lame'], weight: 15 }));
  await provider.add(makeDocument('gamma', { tags: [], weight: 25 }));
  return provider;
}

slow('getQuery: AND + IN + INCLUDES narrows to a single document', async (t) => {
  const provider = await seedQueryProvider();
  const results = await provider.getQuery('SELECT * FROM documents WHERE slug IN ("alpha","beta") AND tags INCLUDES ("cool") ORDER BY title ASC LIMIT 10');
  t.deepEqual(results.map(document => document.slug), ['alpha']);
});

slow('getQuery: OR matches either branch', async (t) => {
  const provider = await seedQueryProvider();
  const results = await provider.getQuery('SELECT * FROM documents WHERE slug = "alpha" OR slug = "beta" ORDER BY title ASC LIMIT 10');
  t.deepEqual(results.map(document => document.slug).sort(), ['alpha', 'beta']);
});

slow('getQuery: BETWEEN matches an inclusive numeric range', async (t) => {
  const provider = await seedQueryProvider();
  const results = await provider.getQuery('SELECT * FROM documents WHERE weight BETWEEN 1 AND 10 ORDER BY title ASC LIMIT 10');
  t.deepEqual(results.map(document => document.slug), ['alpha']);
});

slow('getQuery: NOT_IN excludes the listed slugs', async (t) => {
  const provider = await seedQueryProvider();
  const results = await provider.getQuery('SELECT * FROM documents WHERE slug NOT_IN ("gamma") ORDER BY title ASC LIMIT 10');
  t.deepEqual(results.map(document => document.slug).sort(), ['alpha', 'beta']);
});

slow('getQuery: EXCLUDES drops documents whose tags intersect the list', async (t) => {
  const provider = await seedQueryProvider();
  const results = await provider.getQuery('SELECT * FROM documents WHERE tags EXCLUDES ("lame") ORDER BY title ASC LIMIT 10');
  t.deepEqual(results.map(document => document.slug).sort(), ['alpha', 'gamma']);
});

slow('getQuery: IS_NOT_NULL and LIKE and comparison operators run', async (t) => {
  const provider = await seedQueryProvider();
  const notNull = await provider.getQuery('SELECT * FROM documents WHERE slug IS_NOT_NULL ORDER BY title ASC LIMIT 10');
  t.is(notNull.length, 3);

  const like = await provider.getQuery('SELECT * FROM documents WHERE title LIKE "Title" ORDER BY title ASC LIMIT 10');
  t.is(like.length, 3);

  const heavy = await provider.getQuery('SELECT * FROM documents WHERE weight >= 15 ORDER BY title ASC LIMIT 10');
  t.deepEqual(heavy.map(document => document.slug).sort(), ['beta', 'gamma']);

  const notGamma = await provider.getQuery('SELECT * FROM documents WHERE slug != "gamma" ORDER BY title ASC LIMIT 10');
  t.is(notGamma.length, 2);
});

slow('getQuery: IS_NULL matches when a JSON field is absent', async (t) => {
  const provider = await seedQueryProvider();
  const results = await provider.getQuery('SELECT * FROM documents WHERE missingField IS_NULL ORDER BY title ASC LIMIT 10');
  t.is(results.length, 3);
});

slow('getQuery: explicit field projection returns parsed rows including tags', async (t) => {
  const provider = await seedQueryProvider();
  const results = await provider.getQuery('SELECT slug, tags FROM documents WHERE slug = "alpha" ORDER BY title ASC LIMIT 10');
  t.is(results.length, 1);
  t.is(results[0].slug, 'alpha');
  t.deepEqual(results[0].tags, ['cool', 'new']);
});
