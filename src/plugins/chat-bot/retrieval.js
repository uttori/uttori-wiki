import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';

import OllamaEmbedder from './ollama-embedder.js';

let debug = (..._) => {};
/* c8 ignore next 1 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.AIChatBot.Retrieval'); } catch {}

/**
 * @typedef {object} VectorRow
 * @property {number} rowid The rowid of the chunk.
 * @property {number} distance The vector distance.
 */

/**
 * @typedef {object} FtsRankRow
 * @property {number} rowid The rowid of the chunk.
 * @property {number} rank The FTS rank.
 */

/**
 * @typedef {object} CandidateRow
 * @property {number} rowid The rowid of the chunk.
 * @property {string} source_id The source id of the chunk.
 * @property {number} idx The index of the chunk.
 * @property {string} text The text of the chunk.
 * @property {number} token_count The token count of the chunk.
 * @property {string} meta_json The meta JSON of the chunk.
 * @property {string} source_title The title of the source.
 * @property {string} source_slug The slug of the source.
 */

/**
 * @typedef {object} SlugFilter
 * @property {string} sql The SQL filter fragment.
 * @property {string[]} params The slug filter params.
 */

/**
 * @typedef {object} MatchCounts
 * @property {Map<number, number>} titleMatchCount The title match counts by rowid.
 * @property {Map<number, number>} textMatchCount The text match counts by rowid.
 */

/**
 * @typedef {object} Citation
 * @property {string} title The source title.
 * @property {string} slug The source slug with an optional section anchor.
 * @property {string[]} sectionPath The section path.
 * @property {string} source_id The source id.
 * @property {number} idx The chunk index.
 * @property {number} score The retrieval score.
 */

/**
 * Build a reusable SQL filter for restricting retrieval to selected source slugs.
 * @param {string[]} [slugs] Optional source slugs to restrict search to.
 * @returns {SlugFilter} The SQL fragment and bound params.
 */
export function buildSlugFilter(slugs = []) {
  const slugParams = Array.isArray(slugs) ? slugs.map(slug => `${slug}`.trim()).filter(Boolean) : [];
  if (!slugParams.length) {
    return { sql: '', params: [] };
  }
  debug('retrieve: restricting search to slugs:', slugParams);
  return {
    sql: `AND s.slug IN (${slugParams.map(() => '?').join(',')})`,
    params: slugParams,
  };
}

/**
 * Embed a query using the shared Ollama embedder implementation.
 * @param {string} baseUrl The base URL of the Ollama server.
 * @param {string} model The model to use for embedding.
 * @param {string} input The text to embed.
 * @param {string} [prompt] The prompt to embed.
 * @returns {Promise<Float32Array>} The embedded query.
 */
export async function embedQuery(baseUrl, model, input, prompt) {
  const embedder = new OllamaEmbedder(baseUrl, model);
  const vector = await embedder.embed(input, prompt);
  return new Float32Array(vector);
}

/**
 * Run the vector search query.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {Float32Array} queryVectors The embedded query vectors.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The plugin config.
 * @param {SlugFilter} slugFilter The slug filter.
 * @returns {VectorRow[]} The vector rows.
 */
function vectorSearch(db, queryVectors, config, slugFilter) {
  const limit = config.chunkLimit * 3;
  const vectorQuery = `WITH vec_matches AS (
      SELECT v.rowid, v.distance
      FROM uttori_chunks_vec v
      WHERE v.embedding MATCH ? AND v.k = ?
    )
    SELECT
      c.rowid,
      vec_matches.distance
    FROM vec_matches
    JOIN uttori_chunks c ON vec_matches.rowid = c.rowid
    JOIN uttori_sources s ON c.source_id = s.id
    WHERE 1=1 ${slugFilter.sql}
    ORDER BY vec_matches.distance
    LIMIT ?`;
  const vectorParams = [
    Buffer.from(queryVectors.buffer, queryVectors.byteOffset, queryVectors.byteLength),
    limit,
    ...slugFilter.params,
    limit,
  ];
  const vectorRows = /** @type {VectorRow[]} */
    (db.prepare(vectorQuery).all(...vectorParams));
  debug('retrieve: vector rows:', vectorRows.length);
  return vectorRows;
}

/**
 * Build an FTS5 MATCH query from normalized entity terms.
 * @param {string[]} entities The query entities.
 * @returns {string} The FTS query.
 */
function buildFtsQuery(entities) {
  const items = entities.filter(Boolean).map(term => term.replace(/\?/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
  const pieces = items.map(phrase => {
    // Remove duplicates before building a loose AND phrase.
    const parts = [...new Set(phrase.split(/\s+/).filter(Boolean))];
    return parts.length ? parts.map(term => `"${term}"*`).join(' AND ') : '';
  }).filter(Boolean);
  debug('retrieve: FTS pieces:', pieces);
  return pieces.join(' OR ');
}

/**
 * Run the optional FTS search.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {string[]} entities The query entities.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The plugin config.
 * @param {SlugFilter} slugFilter The slug filter.
 * @returns {FtsRankRow[]} The FTS rows.
 */
function ftsSearch(db, entities, config, slugFilter) {
  if (!config.hybrid) {
    return [];
  }
  try {
    const ftsQuery = buildFtsQuery(entities);
    debug('retrieve: FTS query:', ftsQuery);
    if (!ftsQuery) {
      return [];
    }

    const ftsStmt = db.prepare(`
      SELECT f.rowid, bm25(uttori_chunks_fts) AS rank
      FROM uttori_chunks_fts f
      JOIN uttori_chunks c ON f.rowid = c.rowid
      JOIN uttori_sources s ON c.source_id = s.id
      WHERE uttori_chunks_fts MATCH ? ${slugFilter.sql}
      ORDER BY rank
      LIMIT ?
    `);
    const rows = /** @type {FtsRankRow[]} */
      (ftsStmt.all(ftsQuery, ...slugFilter.params, config.chunkLimit * 3));
    return rows;
  } catch (error) {
    debug('retrieve: FTS error:', error);
    return [];
  }
}

/**
 * Convert Okapi BM25 ranks to normalized similarity scores.
 * @param {FtsRankRow[]} ftsRows The FTS rows.
 * @returns {Map<number, number>} Similarity score by rowid.
 */
export function bm25ToSimilarity(ftsRows) {
  const ranks = ftsRows.map(row => row.rank);
  const mean = ranks.length ? ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length : 0;
  const standardDeviation = ranks.length > 1
    ? Math.sqrt(ranks.reduce((sum, rank) => sum + (rank - mean) ** 2, 0) / (ranks.length - 1))
    : 0;
  /** @type {Map<number, number>} */
  const similarityByRowid = new Map();
  for (const row of ftsRows) {
    if (!standardDeviation) {
      similarityByRowid.set(row.rowid, 0.5);
      continue;
    }
    const z = (mean - row.rank) / standardDeviation;
    similarityByRowid.set(row.rowid, 1 / (1 + Math.exp(-z)));
  }
  return similarityByRowid;
}

/**
 * Convert vector distances to normalized similarity scores.
 * @param {VectorRow[]} vectorRows The vector rows.
 * @returns {Map<number, number>} Similarity score by rowid.
 */
export function vecDistanceToSimilarity(vectorRows) {
  const distances = vectorRows.map(row => Number(row.distance));
  const min = distances.length ? Math.min(...distances) : 0;
  const max = distances.length ? Math.max(...distances) : 1;
  /** @type {Map<number, number>} */
  const similarityByRowid = new Map();
  for (const row of vectorRows) {
    const similarity = max === min ? 0 : 1 - ((Number(row.distance) - min) / (max - min));
    similarityByRowid.set(row.rowid, similarity);
  }
  return similarityByRowid;
}

/**
 * Calculate the FTS blend weight for the current query.
 * @param {string} query The normalized query.
 * @param {string[]} entities The query entities.
 * @param {FtsRankRow[]} ftsRows The FTS rows.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The plugin config.
 * @returns {number} The FTS weight.
 */
function ftsWeight(query, entities, ftsRows, config) {
  if (!ftsRows.length) {
    return 0;
  }
  const parts = query.split(/\s+/).filter(Boolean);
  const looksLiteral = parts.length <= 4 && /[A-Z]/.test(query) && !/\?$/.test(query);
  const base = config.ftsWeight;
  const bump = entities.length ? config.ftsWeightBump : 0;
  return looksLiteral ? Math.min(0.8, base + bump + 0.15) : Math.min(0.8, base + bump);
}

/**
 * Fetch all candidate rows before blending.
 * @param {import('better-sqlite3/index.js').Database} db The database.
 * @param {number[]} candidateRowids The candidate rowids.
 * @returns {CandidateRow[]} The candidate rows.
 */
function fetchCandidateRows(db, candidateRowids) {
  const placeholders = candidateRowids.map(() => '?').join(',');
  const rows = /** @type {CandidateRow[]} */
    (db.prepare(`
      SELECT c.rowid, c.source_id, c.idx, c.text, c.token_count, c.meta_json,
            s.title AS source_title, s.slug AS source_slug
      FROM uttori_chunks c
      JOIN uttori_sources s ON s.id = c.source_id
      WHERE c.rowid IN (${placeholders})
    `).all(...candidateRowids));
  return rows;
}

/**
 * Count query entity matches in candidate titles and text.
 * @param {CandidateRow[]} candidateRows The candidate rows.
 * @param {string[]} entities The query entities.
 * @returns {MatchCounts} Match counts by rowid.
 */
function calculateMatchCounts(candidateRows, entities) {
  /** @type {Map<number, number>} */
  const titleMatchCount = new Map();
  /** @type {Map<number, number>} */
  const textMatchCount = new Map();
  const terms = entities.map(term => term.toLowerCase());
  for (const row of candidateRows) {
    const title = (row.source_title ?? '').toLowerCase();
    const text = (row.text ?? '').toLowerCase();
    let titleCount = 0;
    let textCount = 0;
    for (const term of terms) {
      if (term && title.includes(term)) titleCount++;
      if (term && text.includes(term)) textCount++;
    }
    if (titleCount) {
      debug('retrieve: title match:', row.rowid, titleCount);
      titleMatchCount.set(row.rowid, titleCount);
    }
    if (textCount) {
      debug('retrieve: text match:', row.rowid, textCount);
      textMatchCount.set(row.rowid, textCount);
    }
  }
  return { titleMatchCount, textMatchCount };
}

/**
 * Blend vector, FTS, and entity boost scores.
 * @param {number[]} candidateRowids The candidate rowids.
 * @param {Map<number, number>} vecSimilarity Vector similarity by rowid.
 * @param {Map<number, number>} ftsSimilarity FTS similarity by rowid.
 * @param {number} wFTS The FTS weight.
 * @param {Map<number, number>} titleMatchCount Title match counts by rowid.
 * @param {Map<number, number>} textMatchCount Text match counts by rowid.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The plugin config.
 * @returns {import('../ai-chat-bot.js').BlendedChunk[]} The blended chunks.
 */
export function blendAndRank(candidateRowids, vecSimilarity, ftsSimilarity, wFTS, titleMatchCount, textMatchCount, config) {
  const blended = candidateRowids.map(rowid => {
    const v = vecSimilarity.get(rowid) ?? 0;
    const f = ftsSimilarity.get(rowid) ?? 0;
    const titleBoost = (titleMatchCount.get(rowid) ?? 0) * config.titleBoost;
    const textBoost = (textMatchCount.get(rowid) ?? 0) * config.textBoost;
    return {
      rowid,
      score: ((1 - wFTS) * v) + (wFTS * f) + titleBoost + textBoost,
      titleBoost,
      textBoost,
    };
  });
  return blended.sort((a, b) => b.score - a.score);
}

/**
 * Materialize scored candidates into retrieved chunks.
 * @param {import('../ai-chat-bot.js').BlendedChunk[]} blended The blended chunks.
 * @param {CandidateRow[]} candidateRows The candidate rows.
 * @returns {import('../ai-chat-bot.js').RetrievedChunk[]} The retrieved chunks.
 */
function buildRetrievedChunks(blended, candidateRows) {
  /** @type {Map<number, CandidateRow>} */
  const candidateRowsById = new Map();
  for (const row of candidateRows) {
    candidateRowsById.set(row.rowid, row);
  }

  /** @type {import('../ai-chat-bot.js').RetrievedChunk[]} */
  const merged = [];
  for (const blendedChunk of blended) {
    const row = candidateRowsById.get(blendedChunk.rowid);
    if (!row) {
      continue;
    }
    /** @type {string[]} */
    let sectionPath = [];
    try {
      /** @type {Record<string, any>} */
      const data = JSON.parse(row.meta_json || '{}');
      sectionPath = Array.isArray(data?.sectionPath) ? data.sectionPath : [];
    } catch (error) {
      debug('retrieve: error parsing sectionPath:', error);
    }
    merged.push({
      rowid: row.rowid,
      source_id: row.source_id,
      idx: row.idx,
      text: row.text,
      token_count: row.token_count,
      sectionPath,
      source: { id: row.source_id, title: row.source_title, slug: row.source_slug },
      score: blendedChunk.score,
    });
  }
  return merged;
}

/**
 * Select chunks under chunk, per-source, and token budgets.
 * @param {import('../ai-chat-bot.js').RetrievedChunk[]} merged The ranked chunks.
 * @param {Set<number>} pinnedRowids Rowids that should be kept first.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The plugin config.
 * @returns {import('../ai-chat-bot.js').RetrievedChunk[]} The picked chunks.
 */
export function pickByBudget(merged, pinnedRowids, config) {
  /** @type {Map<string, number>} */
  const capBySource = new Map();
  /** @type {import('../ai-chat-bot.js').RetrievedChunk[]} */
  const picked = [];
  let budget = config.maxContextTokens;

  const pinned = merged.find(chunk => pinnedRowids.has(chunk.rowid));
  if (pinned) {
    picked.push(pinned);
    capBySource.set(pinned.source_id, 1);
    budget -= pinned.token_count ?? OllamaEmbedder.approxTokenLen(pinned.text);
  }
  debug('retrieve: pinned row ids:', pinnedRowids);
  debug('retrieve: picking chunks...');

  for (const chunk of merged) {
    debug('retrieve: merged chunk:', chunk.source_id, chunk.score);
    if (pinnedRowids.has(chunk.rowid)) {
      debug('retrieve: skipping pinned chunk:', chunk.source_id, chunk.score);
      continue;
    }

    const count = capBySource.get(chunk.source_id) ?? 0;
    if (count >= config.maxPerSource) {
      debug('retrieve: skipping chunk from source:', chunk.source_id, 'because we have too many chunks from this source:', count);
      continue;
    }

    const tokens = chunk.token_count ?? OllamaEmbedder.approxTokenLen(chunk.text);
    if (tokens > budget && picked.length) {
      debug('retrieve: skipping chunk from source:', chunk.source_id, 'because we have too many tokens:', tokens, '> budget:', budget);
      continue;
    }

    picked.push(chunk);
    capBySource.set(chunk.source_id, count + 1);
    budget -= tokens;
    if (picked.length >= config.chunkLimit || budget <= 0) {
      debug('retrieve: stopping because we have too many chunks:', picked.length);
      break;
    }
  }
  return picked;
}

/**
 * Build citations from retrieved chunks.
 * @param {import('../ai-chat-bot.js').RetrievedChunk[]} picked The picked chunks.
 * @returns {Citation[]} The citations.
 */
export function buildCitations(picked) {
  return picked.map(chunk => {
    const anchor = chunk.sectionPath.length ? '#' + chunk.sectionPath.map(encodeURIComponent).join('-') : '';
    return {
      title: chunk.source.title || chunk.source.id,
      slug: (chunk.source.slug || '') + anchor,
      sectionPath: chunk.sectionPath,
      source_id: chunk.source_id,
      idx: chunk.idx,
      score: chunk.score,
    };
  });
}

/**
 * Retrieve chunks from the database.
 * @param {string} query The query to retrieve chunks for.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options for the retrieval.
 * @param {string[]} [slugs] Optional array of source slugs to restrict search to.
 * @returns {Promise<import('../ai-chat-bot.js').RetrieveResponse>} The retrieved chunks.
 */
export async function retrieve(query, config, slugs = []) {
  debug('retrieve:', { query, slugs });
  const retrievalStartTime = Date.now();
  const db = new Database(config.databasePath, config.databseOptions);
  sqliteVec.load(db);

  try {
    const slugFilter = buildSlugFilter(slugs);
    const normalizedQuery = OllamaEmbedder.removeStopWords(query.trim()).join(' ');
    const entities = OllamaEmbedder.removeStopWords(normalizedQuery);
    const queryVectors = await embedQuery(
      config.ollamaBaseUrl,
      config.embedModel,
      normalizedQuery,
      config.embedPrompt('Given a web search query, retrieve relevant passages that answer the query', normalizedQuery),
    );

    const vectorRows = vectorSearch(db, queryVectors, config, slugFilter);
    const ftsRows = ftsSearch(db, entities, config, slugFilter);
    debug('retrieve: FTS rows:', ftsRows.length);
    debug('retrieve: FTS rows:', ftsRows.map(row => ({ rowid: row.rowid, rank: row.rank })));

    const candidateRowids = Array.from(new Set([
      ...vectorRows.map(row => row.rowid),
      ...ftsRows.map(row => row.rowid),
    ]));
    if (!candidateRowids.length) {
      debug('retrieve: no candidate rowids');
      return { query: normalizedQuery, chunks: [], citations: [] };
    }

    const candidateRows = fetchCandidateRows(db, candidateRowids);
    const { titleMatchCount, textMatchCount } = calculateMatchCounts(candidateRows, entities);
    const blended = blendAndRank(
      candidateRowids,
      vecDistanceToSimilarity(vectorRows),
      bm25ToSimilarity(ftsRows),
      ftsWeight(normalizedQuery, entities, ftsRows, config),
      titleMatchCount,
      textMatchCount,
      config,
    );

    /** @type {Set<number>} */
    const pinnedRowids = new Set();
    const firstTitleExact = blended.find(chunk => titleMatchCount.has(chunk.rowid));
    if (firstTitleExact) {
      debug('retrieve: pinned title exact match:', firstTitleExact.rowid);
      pinnedRowids.add(firstTitleExact.rowid);
    }

    const merged = buildRetrievedChunks(blended, candidateRows);
    debug('retrieve: merged chunks:', merged.length);
    debug('retrieve: merged chunks:', merged.map(chunk => ({ source_id: chunk.source_id, score: chunk.score })));

    const picked = pickByBudget(merged, pinnedRowids, config);
    debug('retrieve: picked chunks:', picked.length);
    debug('retrieve: picked chunks:', picked.map(chunk => ({ source_id: chunk.source_id, score: chunk.score })));

    const citations = buildCitations(picked);
    debug('retrieve: citations:', citations.length);
    debug('retrieve: citations:', citations.map(citation => ({ slug: citation.slug, sectionPath: citation.sectionPath, score: citation.score, source_id: citation.source_id })));

    const sortedChunks = picked.sort((a, b) => b.score - a.score).slice(0, config.chunkLimit);
    const totalContextTokens = sortedChunks.reduce((total, chunk) => {
      return total + (chunk.token_count ?? OllamaEmbedder.approxTokenLen(chunk.text));
    }, 0);
    debug('Total Context Tokens:', totalContextTokens);
    debug('Retrieval Time:', `${Date.now() - retrievalStartTime}ms`);
    return { query: normalizedQuery, chunks: sortedChunks, citations };
  } finally {
    db.close();
  }
}
