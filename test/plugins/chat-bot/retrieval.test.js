import test from 'ava';
import sinon from 'sinon';
import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import {
  buildSlugFilter,
  bm25ToSimilarity,
  vecDistanceToSimilarity,
  blendAndRank,
  pickByBudget,
  buildCitations,
  embedQuery,
  retrieve,
} from '../../../src/plugins/chat-bot/retrieval.js';

const baseConfig = {
  titleBoost: 0.25,
  textBoost: 0.10,
  ftsWeight: 0.35,
  ftsWeightBump: 0.15,
  chunkLimit: 12,
  maxContextTokens: 4096,
  maxPerSource: Infinity,
};

/** Build a minimal RetrievedChunk */
const makeChunk = (rowid, source_id, token_count = 100, score = 0.5) => ({
  rowid,
  source_id,
  idx: 0,
  text: 'chunk text '.repeat(10),
  token_count,
  sectionPath: [],
  source: { id: source_id, title: 'Title', slug: source_id },
  score,
});

/**
 * Whether the better-sqlite3 native binding is loadable in this Node version.
 * The project requires Node v24 (.nvmrc) but the shell may be on a different
 * version; in that case integration tests are skipped rather than failing.
 */
let canIntegrate = false;
try {
  const probe = new Database(':memory:');
  probe.close();
  canIntegrate = true;
} catch { /* native binding not available for this Node version */ }

/** Embedding dimension used throughout integration tests. */
const DIM = 3;

/**
 * Build a throwaway SQLite file populated with test data and return its path.
 * @param {{ sources?: object[], chunks?: object[] }} [opts]
 * @returns {string} Absolute path to the temp DB file.
 */
function makeTestDb(opts = {}) {
  const tmpFile = path.join(os.tmpdir(), `uttori-retrieve-${Date.now()}-${Math.random().toString(36).slice(2)}.sqlite`);
  const db = new Database(tmpFile);
  sqliteVec.load(db);

  db.exec(`
    CREATE TABLE IF NOT EXISTS uttori_sources(
      id TEXT PRIMARY KEY,
      slug TEXT,
      title TEXT,
      update_date INTEGER,
      meta_json TEXT,
      content_hash TEXT
    );
    CREATE TABLE IF NOT EXISTS uttori_chunks(
      source_id TEXT NOT NULL,
      idx INTEGER NOT NULL,
      text TEXT NOT NULL,
      token_count INTEGER NOT NULL,
      meta_json TEXT,
      FOREIGN KEY(source_id) REFERENCES uttori_sources(id)
    );
    CREATE VIRTUAL TABLE uttori_chunks_vec USING vec0(
      embedding float[${DIM}],
      source_id TEXT
    );
    CREATE VIRTUAL TABLE IF NOT EXISTS uttori_chunks_fts USING fts5(
      text,
      content='uttori_chunks',
      content_rowid='rowid',
      tokenize = "unicode61 remove_diacritics 1"
    );
  `);

  const sources = opts.sources ?? [
    { id: 'doc-a', slug: 'doc-a', title: 'Document A about Dogs' },
  ];
  const chunks = opts.chunks ?? [
    {
      source_id: 'doc-a',
      idx: 0,
      text: 'dogs behavior patterns training',
      token_count: 4,
      meta_json: '{"sectionPath":["Intro"]}',
      embedding: [0.8, 0.1, 0.1],
    },
  ];

  const insertSrc = db.prepare(
    'INSERT INTO uttori_sources(id, slug, title, update_date, meta_json, content_hash) VALUES (?, ?, ?, ?, ?, ?)',
  );
  for (const src of sources) {
    insertSrc.run(src.id, src.slug, src.title, Date.now(), '{}', 'test-hash');
  }

  if (chunks.length) {
    const insertChunk = db.prepare(
      'INSERT INTO uttori_chunks(source_id, idx, text, token_count, meta_json) VALUES (?, ?, ?, ?, ?)',
    );
    const insertVec = db.prepare(
      'INSERT INTO uttori_chunks_vec(rowid, embedding, source_id) VALUES (?, ?, ?)',
    );
    const insertFts = db.prepare('INSERT INTO uttori_chunks_fts(rowid, text) VALUES (?, ?)');

    for (const chunk of chunks) {
      const info = insertChunk.run(chunk.source_id, chunk.idx, chunk.text, chunk.token_count, chunk.meta_json ?? '{}');
      const rowid = Number(info.lastInsertRowid);
      const f32 = new Float32Array(chunk.embedding);
      insertVec.run(BigInt(rowid), Buffer.from(f32.buffer), chunk.source_id);
      insertFts.run(rowid, chunk.text);
    }
  }

  db.close();
  return tmpFile;
}

/**
 * Minimal config object for retrieve() calls.
 * @param {string} databasePath
 * @param {object} [overrides]
 * @returns {object}
 */
const makeRetrieveConfig = (databasePath, overrides = {}) => ({
  databasePath,
  databseOptions: {},
  ollamaBaseUrl: 'http://localhost:11434',
  embedModel: 'bge-m3',
  embedPrompt: (_instruction, text) => text,
  chunkLimit: 12,
  maxContextTokens: 4096,
  maxPerSource: 3,
  titleBoost: 0.25,
  textBoost: 0.10,
  ftsWeight: 0.35,
  ftsWeightBump: 0.15,
  hybrid: false,
  ...overrides,
});

/** Stub fetch to return a DIM-element embedding. */
const stubEmbedding = (vec = [0.8, 0.1, 0.1]) =>
  sinon.stub(global, 'fetch').resolves({
    ok: true,
    json: async () => ({ embedding: vec }),
  });

test('buildSlugFilter: returns empty filter for no slugs', (t) => {
  const result = buildSlugFilter([]);
  t.is(result.sql, '');
  t.deepEqual(result.params, []);
});

test('buildSlugFilter: returns empty filter when called with no arguments', (t) => {
  const result = buildSlugFilter();
  t.is(result.sql, '');
  t.deepEqual(result.params, []);
});

test('buildSlugFilter: returns empty filter for non-array input', (t) => {
  const result = buildSlugFilter(null);
  t.is(result.sql, '');
  t.deepEqual(result.params, []);
});

test('buildSlugFilter: builds correct SQL and params for one slug', (t) => {
  const result = buildSlugFilter(['my-doc']);
  t.is(result.sql, 'AND s.slug IN (?)');
  t.deepEqual(result.params, ['my-doc']);
});

test('buildSlugFilter: builds correct SQL and params for multiple slugs', (t) => {
  const result = buildSlugFilter(['doc-a', 'doc-b', 'doc-c']);
  t.is(result.sql, 'AND s.slug IN (?,?,?)');
  t.deepEqual(result.params, ['doc-a', 'doc-b', 'doc-c']);
});

test('buildSlugFilter: trims slug whitespace', (t) => {
  const result = buildSlugFilter(['  trimmed  ']);
  t.deepEqual(result.params, ['trimmed']);
});

test('buildSlugFilter: filters out empty strings after trim', (t) => {
  const result = buildSlugFilter(['valid', '  ', '']);
  t.deepEqual(result.params, ['valid']);
  t.is(result.sql, 'AND s.slug IN (?)');
});

test('bm25ToSimilarity: returns empty map for no rows', (t) => {
  const result = bm25ToSimilarity([]);
  t.is(result.size, 0);
});

test('bm25ToSimilarity: returns 0.5 for single row (no std dev)', (t) => {
  const result = bm25ToSimilarity([{ rowid: 1, rank: -5 }]);
  t.is(result.get(1), 0.5);
});

test('bm25ToSimilarity: returns scores between 0 and 1 for multiple rows', (t) => {
  // BM25 ranks are negative; more-negative = better match
  const rows = [
    { rowid: 1, rank: -8 },
    { rowid: 2, rank: -4 },
    { rowid: 3, rank: -1 },
  ];
  const result = bm25ToSimilarity(rows);
  t.is(result.size, 3);
  for (const [, score] of result) {
    t.true(score >= 0 && score <= 1);
  }
});

test('bm25ToSimilarity: best (most-negative) rank gets highest similarity', (t) => {
  const rows = [
    { rowid: 1, rank: -10 }, // best
    { rowid: 2, rank: -2 },  // worst
  ];
  const result = bm25ToSimilarity(rows);
  t.true(result.get(1) > result.get(2));
});

test('vecDistanceToSimilarity: returns empty map for no rows', (t) => {
  const result = vecDistanceToSimilarity([]);
  t.is(result.size, 0);
});

test('vecDistanceToSimilarity: returns 0 for all rows when all distances equal', (t) => {
  const rows = [{ rowid: 1, distance: 0.5 }, { rowid: 2, distance: 0.5 }];
  const result = vecDistanceToSimilarity(rows);
  t.is(result.get(1), 0);
  t.is(result.get(2), 0);
});

test('vecDistanceToSimilarity: closest distance (min) maps to similarity 1', (t) => {
  const rows = [
    { rowid: 1, distance: 0.1 }, // closest
    { rowid: 2, distance: 0.9 }, // furthest
  ];
  const result = vecDistanceToSimilarity(rows);
  t.is(result.get(1), 1);
  t.is(result.get(2), 0);
});

test('vecDistanceToSimilarity: intermediate distance maps between 0 and 1', (t) => {
  const rows = [
    { rowid: 1, distance: 0.0 },
    { rowid: 2, distance: 0.5 },
    { rowid: 3, distance: 1.0 },
  ];
  const result = vecDistanceToSimilarity(rows);
  const mid = result.get(2);
  t.true(mid > 0 && mid < 1);
});

test('blendAndRank: returns blended chunks sorted descending by score', (t) => {
  const rowids = [1, 2, 3];
  const vecSim = new Map([[1, 0.9], [2, 0.5], [3, 0.1]]);
  const ftsSim = new Map([[1, 0.8], [2, 0.4], [3, 0.2]]);
  const titleCount = new Map();
  const textCount = new Map();
  const result = blendAndRank(rowids, vecSim, ftsSim, 0.35, titleCount, textCount, baseConfig);
  t.is(result.length, 3);
  // Scores should be descending
  for (let i = 0; i < result.length - 1; i++) {
    t.true(result[i].score >= result[i + 1].score);
  }
});

test('blendAndRank: adds title boost to score', (t) => {
  const rowids = [1, 2];
  const vecSim = new Map([[1, 0.5], [2, 0.5]]);
  const ftsSim = new Map();
  const titleCount = new Map([[1, 2]]); // rowid 1 matched title twice
  const textCount = new Map();
  const result = blendAndRank(rowids, vecSim, ftsSim, 0, titleCount, textCount, baseConfig);
  const r1 = result.find((r) => r.rowid === 1);
  const r2 = result.find((r) => r.rowid === 2);
  t.true(r1.score > r2.score);
  t.is(r1.titleBoost, 2 * baseConfig.titleBoost);
});

test('blendAndRank: adds text boost to score', (t) => {
  const rowids = [1, 2];
  const vecSim = new Map([[1, 0.5], [2, 0.5]]);
  const ftsSim = new Map();
  const titleCount = new Map();
  const textCount = new Map([[2, 3]]); // rowid 2 matched text three times
  const result = blendAndRank(rowids, vecSim, ftsSim, 0, titleCount, textCount, baseConfig);
  const r1 = result.find((r) => r.rowid === 1);
  const r2 = result.find((r) => r.rowid === 2);
  t.true(r2.score > r1.score);
  t.is(r2.textBoost, 3 * baseConfig.textBoost);
});

test('blendAndRank: returns empty array for no rowids', (t) => {
  const result = blendAndRank([], new Map(), new Map(), 0, new Map(), new Map(), baseConfig);
  t.deepEqual(result, []);
});

test('pickByBudget: returns empty array for no chunks', (t) => {
  const result = pickByBudget([], new Set(), baseConfig);
  t.deepEqual(result, []);
});

test('pickByBudget: picks chunks up to chunkLimit', (t) => {
  const config = { ...baseConfig, chunkLimit: 2, maxContextTokens: 99999, maxPerSource: Infinity };
  const chunks = [1, 2, 3].map((id) => makeChunk(id, 'src'));
  const result = pickByBudget(chunks, new Set(), config);
  t.is(result.length, 2);
});

test('pickByBudget: respects token budget', (t) => {
  const config = { ...baseConfig, chunkLimit: 99, maxContextTokens: 250, maxPerSource: Infinity };
  // 100 tokens each; budget allows 2, and the 3rd would be skipped
  const chunks = [1, 2, 3].map((id) => makeChunk(id, 'src' + id, 100));
  const result = pickByBudget(chunks, new Set(), config);
  t.true(result.length <= 2);
});

test('pickByBudget: respects maxPerSource cap', (t) => {
  const config = { ...baseConfig, chunkLimit: 99, maxContextTokens: 99999, maxPerSource: 1 };
  const chunks = [1, 2, 3].map((id) => makeChunk(id, 'same-source'));
  const result = pickByBudget(chunks, new Set(), config);
  t.is(result.length, 1);
});

test('pickByBudget: pinned rowid is always included first', (t) => {
  const config = { ...baseConfig, chunkLimit: 2, maxContextTokens: 99999, maxPerSource: Infinity };
  const chunks = [
    makeChunk(10, 'src', 100, 0.9),
    makeChunk(20, 'src', 100, 0.1), // pinned but lower score
    makeChunk(30, 'src', 100, 0.5),
  ];
  const pinned = new Set([20]);
  const result = pickByBudget(chunks, pinned, config);
  t.is(result[0].rowid, 20);
});

test('pickByBudget: uses approxTokenLen when token_count is null', (t) => {
  const config = { ...baseConfig, chunkLimit: 99, maxContextTokens: 99999, maxPerSource: Infinity };
  const chunk = { ...makeChunk(1, 'src'), token_count: null };
  const result = pickByBudget([chunk], new Set(), config);
  t.is(result.length, 1);
});

test('buildCitations: returns empty array for no chunks', (t) => {
  t.deepEqual(buildCitations([]), []);
});

test('buildCitations: maps chunk to citation with slug', (t) => {
  const chunk = makeChunk(1, 'my-source');
  chunk.source.slug = 'my-source';
  const [citation] = buildCitations([chunk]);
  t.is(citation.source_id, 'my-source');
  t.is(citation.slug, 'my-source');
});

test('buildCitations: appends anchor for chunks with sectionPath', (t) => {
  const chunk = makeChunk(1, 'my-source');
  chunk.source.slug = 'my-slug';
  chunk.sectionPath = ['Intro', 'Background'];
  const [citation] = buildCitations([chunk]);
  t.true(citation.slug.includes('#'));
  t.true(citation.slug.startsWith('my-slug#'));
});

test('buildCitations: uses source.id as title fallback when title is empty', (t) => {
  const chunk = makeChunk(1, 'my-source');
  chunk.source.title = '';
  const [citation] = buildCitations([chunk]);
  t.is(citation.title, 'my-source');
});

test('buildCitations: includes idx and score in citation', (t) => {
  const chunk = { ...makeChunk(1, 'src'), idx: 5, score: 0.77 };
  const [citation] = buildCitations([chunk]);
  t.is(citation.idx, 5);
  t.is(citation.score, 0.77);
});

test.serial('embedQuery: returns Float32Array from Ollama embedding response', async (t) => {
  const fetchStub = sinon.stub(global, 'fetch').resolves({
    ok: true,
    json: async () => ({ embedding: [0.1, 0.2, 0.3] }),
  });
  try {
    const result = await embedQuery('http://localhost:11434', 'bge-m3', 'test query');
    t.true(result instanceof Float32Array);
    t.is(result.length, 3);
  } finally {
    fetchStub.restore();
  }
});

test.serial('embedQuery: returns Float32Array from embeddings array shape', async (t) => {
  const fetchStub = sinon.stub(global, 'fetch').resolves({
    ok: true,
    json: async () => ({ embeddings: [0.4, 0.5, 0.6] }),
  });
  try {
    const result = await embedQuery('http://localhost:11434', 'bge-m3', 'test');
    t.true(result instanceof Float32Array);
    // Float32 has ~7 significant digits; use approximate equality
    t.true(Math.abs(result[0] - 0.4) < 1e-6);
  } finally {
    fetchStub.restore();
  }
});

test.serial('embedQuery: returns empty Float32Array when embed returns empty vector', async (t) => {
  const fetchStub = sinon.stub(global, 'fetch').rejects(new Error('Network error'));
  try {
    const result = await embedQuery('http://localhost:11434', 'bge-m3', 'test');
    t.true(result instanceof Float32Array);
    t.is(result.length, 0);
  } finally {
    fetchStub.restore();
  }
});

test('pickByBudget: skips already-included pinned chunk during iteration', (t) => {
  // Pinned chunk is first in merged so the loop encounters it before any break.
  // Iteration flow: chunk(20) pinned→pre-added; loop hits 20→skip(lines 385-387),
  // then adds 30 and 40, reaching chunkLimit.
  const config = { ...baseConfig, chunkLimit: 3, maxContextTokens: 99999, maxPerSource: Infinity };
  const chunks = [
    makeChunk(20, 'src-pinned', 100, 0.9),
    makeChunk(30, 'src-a', 100, 0.5),
    makeChunk(40, 'src-b', 100, 0.3),
  ];
  const result = pickByBudget(chunks, new Set([20]), config);
  t.is(result.length, 3);
  t.is(result[0].rowid, 20);
});

test.serial('retrieve: returns chunks and citations via vector search', async (t) => {
  if (!canIntegrate) { return t.pass('Skipping: better-sqlite3 not available for Node ' + process.version); }
  const dbPath = makeTestDb();
  const fetchStub = stubEmbedding();
  try {
    const result = await retrieve('dogs', makeRetrieveConfig(dbPath));
    t.truthy(result.query);
    t.true(Array.isArray(result.chunks));
    t.true(Array.isArray(result.citations));
    t.true(result.chunks.length > 0);
    t.true(result.citations.length > 0);
    t.is(result.chunks[0].source_id, 'doc-a');
  } finally {
    fetchStub.restore();
    fs.unlinkSync(dbPath);
  }
});

test.serial('retrieve: returns empty result when slug filter matches nothing', async (t) => {
  if (!canIntegrate) { return t.pass('Skipping: better-sqlite3 not available for Node ' + process.version); }
  const dbPath = makeTestDb();
  const fetchStub = stubEmbedding();
  try {
    const result = await retrieve('dogs', makeRetrieveConfig(dbPath), ['nonexistent-slug']);
    t.deepEqual(result.chunks, []);
    t.deepEqual(result.citations, []);
  } finally {
    fetchStub.restore();
    fs.unlinkSync(dbPath);
  }
});

test.serial('retrieve: slug filter restricts results to matching source', async (t) => {
  if (!canIntegrate) { return t.pass('Skipping: better-sqlite3 not available for Node ' + process.version); }
  const dbPath = makeTestDb({
    sources: [
      { id: 'doc-a', slug: 'doc-a', title: 'Dogs Guide' },
      { id: 'doc-b', slug: 'doc-b', title: 'Cats Guide' },
    ],
    chunks: [
      { source_id: 'doc-a', idx: 0, text: 'dogs training', token_count: 2, meta_json: '{}', embedding: [0.9, 0.05, 0.05] },
      { source_id: 'doc-b', idx: 0, text: 'cats behavior', token_count: 2, meta_json: '{}', embedding: [0.05, 0.9, 0.05] },
    ],
  });
  const fetchStub = stubEmbedding([0.9, 0.05, 0.05]);
  try {
    const result = await retrieve('dogs', makeRetrieveConfig(dbPath), ['doc-a']);
    for (const chunk of result.chunks) {
      t.is(chunk.source_id, 'doc-a');
    }
  } finally {
    fetchStub.restore();
    fs.unlinkSync(dbPath);
  }
});

test.serial('retrieve: hybrid FTS mode augments vector results', async (t) => {
  if (!canIntegrate) { return t.pass('Skipping: better-sqlite3 not available for Node ' + process.version); }
  const dbPath = makeTestDb();
  const fetchStub = stubEmbedding();
  try {
    const result = await retrieve('dogs', makeRetrieveConfig(dbPath, { hybrid: true }));
    t.truthy(result.query);
    t.true(Array.isArray(result.chunks));
    t.true(Array.isArray(result.citations));
  } finally {
    fetchStub.restore();
    fs.unlinkSync(dbPath);
  }
});

test.serial('retrieve: sectionPath is parsed from meta_json', async (t) => {
  if (!canIntegrate) { return t.pass('Skipping: better-sqlite3 not available for Node ' + process.version); }
  const dbPath = makeTestDb({
    sources: [{ id: 'doc-a', slug: 'doc-a', title: 'Document A' }],
    chunks: [
      {
        source_id: 'doc-a',
        idx: 0,
        text: 'dogs behavior',
        token_count: 2,
        meta_json: '{"sectionPath":["Section One","Sub Section"]}',
        embedding: [0.8, 0.1, 0.1],
      },
    ],
  });
  const fetchStub = stubEmbedding();
  try {
    const result = await retrieve('dogs', makeRetrieveConfig(dbPath));
    t.true(result.chunks.length > 0);
    t.deepEqual(result.chunks[0].sectionPath, ['Section One', 'Sub Section']);
    t.true(result.citations[0].slug.includes('#'));
  } finally {
    fetchStub.restore();
    fs.unlinkSync(dbPath);
  }
});

test.serial('retrieve: title match boosts chunk score', async (t) => {
  if (!canIntegrate) { return t.pass('Skipping: better-sqlite3 not available for Node ' + process.version); }
  // doc-a title contains "dogs" so it should receive a title boost
  const dbPath = makeTestDb({
    sources: [
      { id: 'doc-a', slug: 'doc-a', title: 'Dogs Training Guide' },
      { id: 'doc-b', slug: 'doc-b', title: 'Unrelated Topic' },
    ],
    chunks: [
      { source_id: 'doc-a', idx: 0, text: 'dogs sit stay fetch', token_count: 4, meta_json: '{}', embedding: [0.5, 0.3, 0.2] },
      { source_id: 'doc-b', idx: 0, text: 'unrelated content here', token_count: 3, meta_json: '{}', embedding: [0.5, 0.3, 0.2] },
    ],
  });
  const fetchStub = stubEmbedding([0.5, 0.3, 0.2]);
  try {
    const result = await retrieve('dogs', makeRetrieveConfig(dbPath));
    t.true(result.chunks.length > 0);
    // doc-a chunk should rank first due to title boost
    t.is(result.chunks[0].source_id, 'doc-a');
  } finally {
    fetchStub.restore();
    fs.unlinkSync(dbPath);
  }
});

test.serial('retrieve: respects chunkLimit', async (t) => {
  if (!canIntegrate) { return t.pass('Skipping: better-sqlite3 not available for Node ' + process.version); }
  const chunks = Array.from({ length: 5 }, (_, i) => ({
    source_id: 'doc-a',
    idx: i,
    text: `chunk ${i} about dogs`,
    token_count: 4,
    meta_json: '{}',
    embedding: [0.8 - i * 0.1, 0.1, 0.1],
  }));
  const dbPath = makeTestDb({
    sources: [{ id: 'doc-a', slug: 'doc-a', title: 'Dogs' }],
    chunks,
  });
  const fetchStub = stubEmbedding([0.8, 0.1, 0.1]);
  try {
    const result = await retrieve('dogs', makeRetrieveConfig(dbPath, { chunkLimit: 2 }));
    t.true(result.chunks.length <= 2);
  } finally {
    fetchStub.restore();
    fs.unlinkSync(dbPath);
  }
});
