import test from 'ava';
import sinon from 'sinon';
import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';

import SearchSQLitePlugin from '../../../src/plugins/search-provider-sqlite.js';
import {
  buildBlocks,
  ensureChatIndexSchema,
  removeIndexedDocumentFromDatabase,
  indexDocumentInDatabase,
} from '../../../src/plugins/chat-bot/index-documents.js';

const DIM = 3;

let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

/** @type {boolean} */
let canIntegrate = false;
try {
  const probe = new Database(':memory:');
  probe.close();
  canIntegrate = true;
} catch { /* native binding unavailable */ }

/** @returns {import('better-sqlite3').Database} */
function makeBaseDb() {
  const db = new Database(':memory:');
  sqliteVec.load(db);
  db.exec(`
    CREATE TABLE IF NOT EXISTS uttori_sources (
      id TEXT PRIMARY KEY,
      slug TEXT,
      title TEXT,
      update_date INTEGER,
      meta_json TEXT,
      content_hash TEXT
    );
    CREATE TABLE IF NOT EXISTS uttori_chunks (
      source_id TEXT NOT NULL,
      idx INTEGER NOT NULL,
      text TEXT NOT NULL,
      token_count INTEGER NOT NULL,
      meta_json TEXT,
      FOREIGN KEY(source_id) REFERENCES uttori_sources(id)
    );
  `);
  return db;
}

/** @param {Record<string, unknown>} [overrides] */
function makeConfig(overrides = {}) {
  return {
    ...SearchSQLitePlugin.defaultConfig(),
    ollamaBaseUrl: 'http://127.0.0.1:11434',
    includeAttachments: false,
    fts: false,
    batch: 2,
    ...overrides,
  };
}

/** @returns {import('../../wiki.js').UttoriWikiDocument} */
function makeDocument(overrides = {}) {
  return {
    slug: 'doc-a',
    title: 'Doc A',
    content: '# Intro\n\nFirst paragraph.\n\n## Details\n\nSecond paragraph.',
    tags: ['alpha'],
    updateDate: 1_700_000_000_000,
    attachments: [],
    ...overrides,
  };
}

/** @returns {{ probeDimension: sinon.SinonStub, embedBatch: sinon.SinonStub }} */
function makeMockEmbedder() {
  return {
    probeDimension: sinon.stub().resolves(DIM),
    embedBatch: sinon.stub().callsFake(async (texts) => texts.map(() => Array(DIM).fill(0.1))),
  };
}

test('buildBlocks: parses markdown sections into blocks', async (t) => {
  const blocks = await buildBlocks(makeDocument(), makeConfig());
  t.true(blocks.length >= 1);
  t.true(blocks.every((block) => block.slug === 'doc-a'));
  t.true(blocks.some((block) => block.text.includes('First paragraph')));
  t.true(blocks.some((block) => block.text.includes('Second paragraph')));
});

test('buildBlocks: skips attachments when includeAttachments is false', async (t) => {
  const blocks = await buildBlocks(makeDocument({
    attachments: [{ path: 'notes.txt', skip: false }],
  }), makeConfig({ includeAttachments: false }));
  t.false(blocks.some((block) => block.sectionPath.some((part) => part.includes('Attachment'))));
});

test('buildBlocks: skips flagged attachments and uses custom extractors', async (t) => {
  const extractAttachmentText = sinon.stub().resolves('Attachment body text.');
  const blocks = await buildBlocks(makeDocument({
    attachments: [
      { path: 'skip.txt', skip: true },
      { path: 'notes.txt', skip: false },
    ],
  }), makeConfig({
    includeAttachments: true,
    extractAttachmentText,
  }));
  t.is(extractAttachmentText.callCount, 1);
  t.true(blocks.some((block) => block.text.includes('Attachment body text')));
});

test('buildBlocks: splits attachment pages and large paragraphs', async (t) => {
  const longSentence = `${'word '.repeat(120).trim()}.`;
  const longParagraph = `${longSentence} ${longSentence}`;
  const extractAttachmentText = sinon.stub().resolves(`Page one.\n\n---\n\n${longParagraph}`);
  const blocks = await buildBlocks(makeDocument({
    attachments: [{ path: 'manual.pdf', skip: false }],
  }), makeConfig({ includeAttachments: true, extractAttachmentText }));
  t.true(blocks.length >= 1);
  t.true(blocks.some((block) => block.text.includes('Page one')));
});

test('buildBlocks: breaks very large attachment paragraphs into word chunks', async (t) => {
  const hugeSentence = `${'token '.repeat(200).trim()}.`;
  const hugeParagraph = `${hugeSentence} ${hugeSentence} ${hugeSentence} ${hugeSentence}`;
  const extractAttachmentText = sinon.stub().resolves(hugeParagraph);
  const blocks = await buildBlocks(makeDocument({
    attachments: [{ path: 'big.pdf', skip: false }],
  }), makeConfig({ includeAttachments: true, extractAttachmentText }));
  const attachmentBlocks = blocks.filter((block) => block.sectionPath.some((part) => part.includes('Attachment')));
  t.true(attachmentBlocks.length >= 1);
  t.true(extractAttachmentText.calledOnce);
});

test('buildBlocks: ignores empty attachment text', async (t) => {
  const extractAttachmentText = sinon.stub().resolves('');
  const blocks = await buildBlocks(makeDocument({
    attachments: [{ path: 'empty.txt', skip: false }],
  }), makeConfig({ includeAttachments: true, extractAttachmentText }));
  t.false(blocks.some((block) => block.sectionPath.some((part) => part.includes('Attachment'))));
});

test('removeIndexedDocumentFromDatabase: no-ops for empty slug', (t) => {
  const db = makeBaseDb();
  t.notThrows(() => removeIndexedDocumentFromDatabase(db, ''));
  db.close();
});

test('removeIndexedDocumentFromDatabase: removes chunks and vec rows', (t) => {
  const db = makeBaseDb();
  db.exec(`CREATE VIRTUAL TABLE IF NOT EXISTS uttori_chunks_vec USING vec0(embedding float[${DIM}], source_id TEXT);`);
  db.prepare('INSERT INTO uttori_sources(id, slug, title, update_date, meta_json, content_hash) VALUES (?, ?, ?, ?, ?, ?)')
    .run('doc-a', 'doc-a', 'Doc A', 1, '{}', 'hash');
  const info = db.prepare('INSERT INTO uttori_chunks(source_id, idx, text, token_count, meta_json) VALUES (?, ?, ?, ?, ?)')
    .run('doc-a', 0, 'chunk', 1, '{}');
  db.prepare('INSERT INTO uttori_chunks_vec(rowid, embedding, source_id) VALUES (?, ?, ?)')
    .run(BigInt(info.lastInsertRowid), Buffer.from(new Float32Array([0.1, 0.2, 0.3]).buffer), 'doc-a');

  removeIndexedDocumentFromDatabase(db, 'doc-a');

  t.is(db.prepare('SELECT COUNT(*) AS count FROM uttori_chunks').get().count, 0);
  t.is(db.prepare('SELECT COUNT(*) AS count FROM uttori_sources').get().count, 0);
  t.is(db.prepare('SELECT COUNT(*) AS count FROM uttori_chunks_vec').get().count, 0);
  db.close();
});

test('removeIndexedDocumentFromDatabase: skips vec and fts cleanup when auxiliary tables are missing', (t) => {
  const db = makeBaseDb();
  db.prepare('INSERT INTO uttori_sources(id, slug, title, update_date, meta_json, content_hash) VALUES (?, ?, ?, ?, ?, ?)')
    .run('doc-a', 'doc-a', 'Doc A', 1, '{}', 'hash');
  db.prepare('INSERT INTO uttori_chunks(source_id, idx, text, token_count, meta_json) VALUES (?, ?, ?, ?, ?)')
    .run('doc-a', 0, 'chunk', 1, '{}');

  t.notThrows(() => removeIndexedDocumentFromDatabase(db, 'doc-a'));
  t.is(db.prepare('SELECT COUNT(*) AS count FROM uttori_chunks').get().count, 0);
  db.close();
});

test('ensureChatIndexSchema: throws when sqlite-vec is unavailable', async (t) => {
  const db = new Database(':memory:');
  await t.throwsAsync(
    ensureChatIndexSchema(db, makeConfig(), {}),
    { message: /sqlite-vec is not loaded/ },
  );
  db.close();
});

test.serial('ensureChatIndexSchema: throws when vec_version is empty', async (t) => {
  const db = {
    prepare: (sql) => {
      if (sql.includes('vec_version')) {
        return { get: () => ({}) };
      }
      throw new Error(`unexpected sql: ${sql}`);
    },
    exec: () => {},
  };
  await t.throwsAsync(
    ensureChatIndexSchema(/** @type {any} */ (db), makeConfig(), {}),
    { message: /sqlite-vec is not loaded/ },
  );
});

test.serial('ensureChatIndexSchema: rebuild clears existing index tables', async (t) => {
  if (!canIntegrate) {
    t.pass('skipped: better-sqlite3 unavailable');
    return;
  }
  sandbox.stub(globalThis, 'fetch').resolves(/** @type {any} */ ({
    ok: true,
    json: async () => ({ embedding: Array(DIM).fill(0.1) }),
  }));
  const db = makeBaseDb();
  await ensureChatIndexSchema(db, makeConfig(), { rebuild: false });
  db.prepare('INSERT INTO uttori_sources(id, slug, title, update_date, meta_json, content_hash) VALUES (?, ?, ?, ?, ?, ?)')
    .run('old', 'old', 'Old', 1, '{}', 'hash');
  db.prepare('INSERT INTO uttori_chunks(source_id, idx, text, token_count, meta_json) VALUES (?, ?, ?, ?, ?)')
    .run('old', 0, 'old chunk', 1, '{}');

  await ensureChatIndexSchema(db, makeConfig(), { rebuild: true });

  t.is(db.prepare('SELECT COUNT(*) AS count FROM uttori_sources').get().count, 0);
  t.is(db.prepare('SELECT COUNT(*) AS count FROM uttori_chunks').get().count, 0);
  db.close();
});

test.serial('ensureChatIndexSchema: creates FTS tables when enabled', async (t) => {
  if (!canIntegrate) {
    t.pass('skipped: better-sqlite3 unavailable');
    return;
  }
  sandbox.stub(globalThis, 'fetch').resolves(/** @type {any} */ ({
    ok: true,
    json: async () => ({ embedding: Array(DIM).fill(0.1) }),
  }));
  const db = makeBaseDb();
  await ensureChatIndexSchema(db, makeConfig({ fts: true }), {});

  const ftsTables = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'uttori_chunks_fts\'').all();
  t.is(ftsTables.length, 1);
  db.close();
});

test.serial('indexDocumentInDatabase: indexes, skips unchanged content, and counts empty embeddings', async (t) => {
  if (!canIntegrate) {
    t.pass('skipped: better-sqlite3 unavailable');
    return;
  }
  const db = makeBaseDb();
  const config = makeConfig();
  const embedder = makeMockEmbedder();
  sandbox.stub(globalThis, 'fetch').resolves(/** @type {any} */ ({
    ok: true,
    json: async () => ({ embedding: Array(DIM).fill(0.1) }),
  }));
  await ensureChatIndexSchema(db, config, {});

  const document = makeDocument();
  const first = await indexDocumentInDatabase(db, config, embedder, document);
  t.false(first.skipped);
  t.true(first.chunks > 0);
  t.is(first.errored, 0);

  const second = await indexDocumentInDatabase(db, config, embedder, document);
  t.true(second.skipped);
  t.is(second.chunks, 0);

  embedder.embedBatch.callsFake(async (texts) => texts.map(() => []));
  const changed = await indexDocumentInDatabase(db, config, embedder, {
    ...document,
    updateDate: document.updateDate + 1,
    content: '# Intro\n\nChanged paragraph.\n\n## Details\n\nMore text here.',
  });
  t.false(changed.skipped);
  t.true(changed.errored >= 1);
  db.close();
});

test.serial('indexDocumentInDatabase: throws when chunk insert returns a non-integer rowid', async (t) => {
  if (!canIntegrate) {
    t.pass('skipped: better-sqlite3 unavailable');
    return;
  }
  const db = makeBaseDb();
  const config = makeConfig();
  const embedder = makeMockEmbedder();
  sandbox.stub(globalThis, 'fetch').resolves(/** @type {any} */ ({
    ok: true,
    json: async () => ({ embedding: Array(DIM).fill(0.1) }),
  }));
  await ensureChatIndexSchema(db, config, {});

  const originalPrepare = db.prepare.bind(db);
  sandbox.stub(db, 'prepare').callsFake((sql) => {
    const statement = originalPrepare(sql);
    if (sql.includes('INSERT INTO uttori_chunks(source_id')) {
      return {
        run: () => ({ lastInsertRowid: 1.5 }),
      };
    }
    return statement;
  });

  await t.throwsAsync(
    indexDocumentInDatabase(db, config, embedder, makeDocument()),
    { message: /Unexpected non-integer rowid/ },
  );
  db.close();
});

test.serial('indexDocumentInDatabase: inserts FTS rows when fts is enabled', async (t) => {
  if (!canIntegrate) {
    t.pass('skipped: better-sqlite3 unavailable');
    return;
  }
  const db = makeBaseDb();
  const config = makeConfig({ fts: true });
  const embedder = makeMockEmbedder();
  sandbox.stub(globalThis, 'fetch').resolves(/** @type {any} */ ({
    ok: true,
    json: async () => ({ embedding: Array(DIM).fill(0.1) }),
  }));
  await ensureChatIndexSchema(db, config, {});

  const result = await indexDocumentInDatabase(db, config, embedder, makeDocument());
  t.false(result.skipped);
  t.is(result.errored, 0);
  t.true(db.prepare('SELECT COUNT(*) AS count FROM uttori_chunks_fts').get().count > 0);
  db.close();
});
