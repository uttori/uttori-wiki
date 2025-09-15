import test from 'ava';
import StorageProvider from '../../../src/plugins/storeage-provider-json/storage-provider-memory.js';

const tagExample = 'Example Tag';
const tagFake = 'Fake';
const exampleSlug = 'example-title';
const secondFile = 'second-file';
const secondFileNewDirectory = 'second-file-new-directory';
const secondFileV1 = 'second file';
const secondFileV2 = 'second file-v2';
const secondFileV3 = 'second file-v3';
const secondFileV4 = 'second file-v4';

const example = {
  title: 'Example Title',
  slug: exampleSlug,
  content: '## Example Title',
  html: '',
  updateDate: 1459310452001,
  createDate: 1459310452001,
  tags: [tagExample],
  customData: {
    keyA: 'value-a',
    keyB: 'value-b',
    keyC: 'value-c',
  },
};

const empty = {
  title: 'empty',
  slug: 'empty',
  content: 'empty',
  html: '',
  updateDate: 1459310452003,
  createDate: 1459310452003,
  tags: [tagFake],
  customData: {},
};

const fake = {
  title: tagFake,
  slug: 'fake',
  content: '# Fake',
  html: '',
  updateDate: 1459310452002,
  createDate: 1459310452002,
  tags: [tagExample, tagFake],
  customData: {},
};

test('constructor(): does not error', (t) => {
  t.notThrows(() => new StorageProvider());
});

test('all(): returns all the documents', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  t.deepEqual(await s.all(), { [exampleSlug]: example });
});

test('getQuery(query): returns the requested number of the most recently updated documents', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  await s.add(fake);
  await s.add(empty);

  let limit = 1;
  let query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY updateDate DESC LIMIT ${limit}`;
  let output = await s.getQuery(query);
  t.deepEqual(output, [empty]);

  limit = 2;
  query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY updateDate DESC LIMIT ${limit}`;
  output = await s.getQuery(query);
  t.deepEqual(output, [empty, fake]);

  limit = 3;
  query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY updateDate DESC LIMIT ${limit}`;
  output = await s.getQuery(query);
  t.deepEqual(output, [empty, fake, example]);
});

test('getQuery(query): returns the requested number of the related documents', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  await s.add(fake);
  const tagged = { ...empty, tags: [tagExample] };
  await s.add(tagged);

  const query = `SELECT * FROM documents WHERE 'tags' INCLUDES ('${example.tags.join(',')}') AND slug != ${example.slug} ORDER BY title DESC LIMIT 2`;
  const output = await s.getQuery(query);
  t.deepEqual(output, [tagged, fake]);
});

test('getQuery(query): returns the requested number of random documents', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  await s.add(fake);
  await s.add(empty);

  let limit = 1;
  let query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY RANDOM LIMIT ${limit}`;
  let output = await s.getQuery(query);
  t.is(output.length, 1);

  limit = 2;
  query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY RANDOM LIMIT ${limit}`;
  output = await s.getQuery(query);
  t.is(output.length, 2);

  limit = 3;
  query = `SELECT * FROM documents WHERE 'slug' != '' ORDER BY RANDOM LIMIT ${limit}`;
  output = await s.getQuery(query);
  t.is(output.length, 3);
});

test('getQuery(query): returns all unique tags from all the documents', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  await s.add(fake);
  await s.add(empty);
  const results = await s.getQuery('SELECT tags FROM documents WHERE slug IS_NOT_NULL ORDER BY slug ASC LIMIT 3');
  t.deepEqual(results, [
    {
      tags: [
        tagFake,
      ],
    },
    {
      tags: [
        tagExample,
      ],
    },
    {
      tags: [
        tagExample,
        tagFake,
      ],
    },
  ]);

  const tags = [...results]
    .map(result => result.tags) // equivalent to R.pluck('tags')
    .flat() // equivalent to R.flatten
    .filter((value, index, self) => self.indexOf(value) === index) // equivalent to R.uniq
    .filter(Boolean) // equivalent to R.filter(Boolean)
    .sort((a, b) => a.localeCompare(b)); // equivalent to R.sort((a, b) => a.localeCompare(b))
  t.deepEqual(tags, [tagExample, tagFake]);
});

test('getQuery(query): returns all unique tags and slug from all the documents', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  await s.add(fake);
  await s.add(empty);
  const results = await s.getQuery('SELECT slug, tags FROM documents WHERE slug IS_NOT_NULL ORDER BY slug ASC LIMIT 3');
  t.deepEqual(results, [
    {
      slug: 'empty',
      tags: [
        tagFake,
      ],
    },
    {
      slug: exampleSlug,
      tags: [
        tagExample,
      ],
    },
    {
      slug: 'fake',
      tags: [
        tagExample,
        tagFake,
      ],
    },
  ]);

  const tags = [...results]
    .map(result => result.tags) // equivalent to R.pluck('tags')
    .flat() // equivalent to R.flatten
    .filter((value, index, self) => self.indexOf(value) === index) // equivalent to R.uniq
    .filter(Boolean) // equivalent to R.filter(Boolean)
    .sort((a, b) => a.localeCompare(b)); // equivalent to R.sort((a, b) => a.localeCompare(b))
  t.deepEqual(tags, [tagExample, tagFake]);
});

test('get(slug): returns the matching document', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const results = await s.get(example.slug);
  t.deepEqual(results, example);
});

test('get(slug): returns undefined when there is no slug', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const results = await s.get();
  t.is(results, undefined);
});

test('get(slug): returns undefined when no document is found', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = await s.get('missing-file');
  t.is(document, undefined);
});

test('getHistory(slug): returns an empty array when missing a slug', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const history = await s.getHistory('');
  t.deepEqual(history, []);
});

test('getHistory(slug): returns an empty array when a slug is not found', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  t.deepEqual(await s.getHistory(''), []);
  t.deepEqual(await s.getHistory('missing'), []);
});

test('getHistory(slug): returns an array of the history revisions', async (t) => {
  let history;
  const s = new StorageProvider();
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, secondFileV1);
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = secondFileV2;
  document.content = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, secondFileV2);
  history = await s.getHistory(document.slug);
  t.is(history.length, 2);

  document.title = secondFileV3;
  document.content = secondFileV3;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, secondFileV3);
  history = await s.getHistory(document.slug);
  t.is(history.length, 3);

  document.slug = secondFileNewDirectory;
  document.title = secondFileV4;
  document.content = secondFileV4;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, secondFileV4);
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);
});

test('getRevision({ slug, revision }): returns undefined when missing a slug', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const revision = await s.getRevision({ slug: undefined, revision: undefined });
  t.is(revision, undefined);
});

test('getRevision({ slug, revision }): returns undefined when missing a revision', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const revision = await s.getRevision({ slug: 'slug', revision: '' });
  t.is(revision, undefined);
});

test('getRevision({ slug, revision }): returns undefined when no revision is found', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const revision = await s.getRevision({ slug: 'slug', revision: 'missing' });
  t.is(revision, undefined);
});

test('getRevision({ slug, revision }): returns a specific revision of an article', async (t) => {
  let history;
  const s = new StorageProvider();
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, secondFileV1);
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = secondFileV2;
  document.content = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, secondFileV2);
  history = await s.getHistory(document.slug);
  t.is(history.length, 2);

  document.title = secondFileV3;
  document.content = secondFileV3;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, secondFileV3);
  history = await s.getHistory(document.slug);
  t.is(history.length, 3);

  document.slug = secondFileNewDirectory;
  document.title = secondFileV4;
  document.content = secondFileV4;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, secondFileV4);
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  let revision;
  revision = await s.getRevision({ slug: document.slug, revision: history[0] });
  t.is(revision.title, secondFileV1);
  revision = await s.getRevision({ slug: document.slug, revision: history[1] });
  t.is(revision.title, secondFileV2);
  revision = await s.getRevision({ slug: document.slug, revision: history[2] });
  t.is(revision.title, secondFileV3);
  revision = await s.getRevision({ slug: document.slug, revision: history[3] });
  t.is(revision.title, secondFileV4);
});

test('add(document): cannot add without a document or a slug', async (t) => {
  const s = new StorageProvider();
  await s.add();
  t.is(Object.values(await s.all()).length, 0);
  await s.add({});
  t.is(Object.values(await s.all()).length, 0);
});

test('add(document): creates a new document', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.deepEqual(Object.values(await s.all())[0], example);
  t.is(Object.values(await s.all())[1].slug, document.slug);
});

test('add(document): creates a new document with missing fields', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    html: '',
    slug: secondFile,
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.deepEqual(Object.values(await s.all())[0], example);
  t.is(Object.values(await s.all())[1].slug, document.slug);
});

test('add(document): does not create a document with the same slug', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.deepEqual(Object.values(await s.all())[0], example);
  t.is(Object.values(await s.all())[1].slug, document.slug);
  t.is(Object.values(await s.all()).length, 2);
  await s.add(document);
  t.is(Object.values(await s.all()).length, 2);
});

test('update(document, originalSlug): does not update without a document or slug', async (t) => {
  const s = new StorageProvider();
  await s.add(example);

  await s.update({ document: undefined, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, example.title);

  await s.update({ document: { title: 'New' }, slug: undefined, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 1);
  t.is(Object.values(await s.all())[0].title, example.title);
});

test('update(document, originalSlug): updates the document', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.values(await s.all()).length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 2);
  t.is(Object.values(await s.all())[1].title, document.title);
});

test('update(document, originalSlug): updates the document without timestamps or history', async (t) => {
  const s = new StorageProvider({ useHistory: false, updateTimestamps: false });
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.values(await s.all()).length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 2);
  t.is(Object.values(await s.all())[1].title, document.title);
});

test('update(document, originalSlug): renames the history if it exists', async (t) => {
  let history;
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    customData: { test: true },
    html: '',
    slug: secondFile,
    tags: ['test'],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.values(await s.all()).length, 2);
  history = await s.getHistory(document.slug);
  t.is(history.length, 1);

  document.title = secondFileV2;
  document.content = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 2);
  t.is(Object.values(await s.all())[1].title, document.title);
  history = await s.getHistory(document.slug);
  t.is(history.length, 2);

  document.title = secondFileV3;
  document.content = secondFileV3;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 2);
  t.is(Object.values(await s.all())[1].title, document.title);
  history = await s.getHistory(document.slug);
  t.is(history.length, 3);

  document.slug = secondFileNewDirectory;
  document.title = secondFileV4;
  document.content = secondFileV4;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 2);
  t.is(Object.values(await s.all())[1].title, document.title);
  history = await s.getHistory(document.slug);
  t.is(history.length, 4);

  t.is(s.history[secondFileNewDirectory].length, 4);
  t.is(s.history[secondFile], undefined);
});

test('update(document, originalSlug): updates the document with missing fields', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    html: '',
    slug: secondFile,
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.values(await s.all()).length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: secondFile });
  t.is(Object.values(await s.all()).length, 2);
  t.is(Object.values(await s.all())[1].title, document.title);
});

test('update(document, originalSlug): updates the document with missing fields when no originalSlug is provided', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    html: '',
    slug: secondFile,
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.values(await s.all()).length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: undefined });
  t.is(Object.values(await s.all()).length, 2);
  t.is(Object.values(await s.all())[1].title, document.title);
});

test('update(document, originalSlug): does not update when the document exists', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    html: '',
    slug: secondFile,
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.values(await s.all()).length, 2);
  document.title = secondFileV2;
  await s.update({ document, originalSlug: exampleSlug });
  t.is(Object.values(await s.all()).length, 2);
  t.is(Object.values(await s.all())[1].title, secondFileV1);
});

test('update(document, originalSlug): adds a document if the document to update is not found', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: 1,
    customData: {},
    html: '',
    slug: 'third-file',
    tags: [],
    title: 'third file',
    updateDate: 1,
  };
  await s.update({ document, originalSlug: '' });
  t.is(Object.keys(await s.all()).length, 2);
});

test('delete(document): removes the document', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: 1,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: 1,
  };
  await s.add(document);
  t.is(Object.keys(await s.all()).length, 2);
  await s.delete(document.slug);
  t.is(Object.keys(await s.all()).length, 1);
});

test('delete(document): removes the document without history', async (t) => {
  const s = new StorageProvider({ useHistory: false });
  await s.add(example);
  const document = {
    content: '',
    createDate: 1,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: 1,
  };
  await s.add(document);
  t.is(Object.keys(await s.all()).length, 2);
  await s.delete(document.slug);
  t.is(Object.keys(await s.all()).length, 1);
});

test('delete(document): does nothing when no document is found', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  const document = {
    content: '',
    createDate: undefined,
    customData: {},
    html: '',
    slug: secondFile,
    tags: [],
    title: secondFileV1,
    updateDate: undefined,
  };
  await s.add(document);
  t.is(Object.keys(await s.all()).length, 2);
  await s.delete('slug');
  t.is(Object.keys(await s.all()).length, 2);
});

test('reset(document, originalSlug): returns to initial state', async (t) => {
  const s = new StorageProvider();
  await s.add(example);
  t.is(Object.keys(await s.all()).length, 1);
  s.reset();
  t.is(Object.keys(await s.all()).length, 0);
});
