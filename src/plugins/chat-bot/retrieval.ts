import { createDebug } from '../../debug.js';
import Database from 'better-sqlite3';
import * as sqliteVec from 'sqlite-vec';
import OllamaEmbedder from './ollama-embedder.js';
import type {
  VectorRow, FtsRankRow, CandidateRow, SlugFilter, MatchCounts, Citation,
} from '../../types/plugins/chat-bot/retrieval.js';

export type {
  VectorRow, FtsRankRow, CandidateRow, SlugFilter, MatchCounts, Citation,
} from '../../types/plugins/chat-bot/retrieval.js';

const debug = createDebug('Uttori.Plugin.AIChatBot.Retrieval');

/**
 * Build a reusable SQL filter for restricting retrieval to selected source slugs.
 * @param [slugs] Optional source slugs to restrict search to.
 * @returns The SQL fragment and bound params.
 */
export function buildSlugFilter(slugs: string[] = []): SlugFilter {
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
 * @param baseUrl The base URL of the Ollama server.
 * @param model The model to use for embedding.
 * @param input The text to embed.
 * @param [prompt] The prompt to embed.
 * @returns The embedded query.
 */
export async function embedQuery(baseUrl: string, model: string, input: string, prompt?: string): Promise<Float32Array> {
  const embedder = new OllamaEmbedder(baseUrl, model);
  const vector = await embedder.embed(input, prompt);
  return new Float32Array(vector);
}

/**
 * Run the vector search query.
 * @param db The database.
 * @param queryVectors The embedded query vectors.
 * @param config The plugin config.
 * @param slugFilter The slug filter.
 * @returns The vector rows.
 */
function vectorSearch(db: import('better-sqlite3').Database, queryVectors: Float32Array, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig, slugFilter: SlugFilter): VectorRow[] {
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
  const vectorRows =
    db.prepare(vectorQuery).all(...vectorParams) as VectorRow[];
  debug('retrieve: vector rows:', vectorRows.length);
  return vectorRows;
}

/**
 * Build an FTS5 MATCH query from normalized entity terms.
 * @param entities The query entities.
 * @returns The FTS query.
 */
function buildFtsQuery(entities: string[]): string {
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
 * @param db The database.
 * @param entities The query entities.
 * @param config The plugin config.
 * @param slugFilter The slug filter.
 * @returns The FTS rows.
 */
function ftsSearch(db: import('better-sqlite3').Database, entities: string[], config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig, slugFilter: SlugFilter): FtsRankRow[] {
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
    const rows =
      ftsStmt.all(ftsQuery, ...slugFilter.params, config.chunkLimit * 3) as FtsRankRow[];
    return rows;
  } catch (error) {
    debug('retrieve: FTS error:', error);
    return [];
  }
}

/**
 * Convert Okapi BM25 ranks to normalized similarity scores.
 * @param ftsRows The FTS rows.
 * @returns Similarity score by rowid.
 */
export function bm25ToSimilarity(ftsRows: FtsRankRow[]): Map<number, number> {
  const ranks = ftsRows.map(row => row.rank);
  const mean = ranks.length ? ranks.reduce((sum, rank) => sum + rank, 0) / ranks.length : 0;
  const standardDeviation = ranks.length > 1
    ? Math.sqrt(ranks.reduce((sum, rank) => sum + (rank - mean) ** 2, 0) / (ranks.length - 1))
    : 0;

  const similarityByRowid = new Map<number, number>();
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
 * @param vectorRows The vector rows.
 * @returns Similarity score by rowid.
 */
export function vecDistanceToSimilarity(vectorRows: VectorRow[]): Map<number, number> {
  const distances = vectorRows.map(row => Number(row.distance));
  const min = distances.length ? Math.min(...distances) : 0;
  const max = distances.length ? Math.max(...distances) : 1;

  const similarityByRowid = new Map<number, number>();
  for (const row of vectorRows) {
    const similarity = max === min ? 0 : 1 - ((Number(row.distance) - min) / (max - min));
    similarityByRowid.set(row.rowid, similarity);
  }
  return similarityByRowid;
}

/**
 * Calculate the FTS blend weight for the current query.
 * @param query The normalized query.
 * @param entities The query entities.
 * @param ftsRows The FTS rows.
 * @param config The plugin config.
 * @returns The FTS weight.
 */
function ftsWeight(query: string, entities: string[], ftsRows: FtsRankRow[], config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig): number {
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
 * @param db The database.
 * @param candidateRowids The candidate rowids.
 * @returns The candidate rows.
 */
function fetchCandidateRows(db: import('better-sqlite3').Database, candidateRowids: number[]): CandidateRow[] {
  const placeholders = candidateRowids.map(() => '?').join(',');
  const rows =
    db.prepare(`
      SELECT c.rowid, c.source_id, c.idx, c.text, c.token_count, c.meta_json,
            s.title AS source_title, s.slug AS source_slug
      FROM uttori_chunks c
      JOIN uttori_sources s ON s.id = c.source_id
      WHERE c.rowid IN (${placeholders})
    `).all(...candidateRowids) as CandidateRow[];
  return rows;
}

/**
 * Count query entity matches in candidate titles and text.
 * @param candidateRows The candidate rows.
 * @param entities The query entities.
 * @returns Match counts by rowid.
 */
function calculateMatchCounts(candidateRows: CandidateRow[], entities: string[]): MatchCounts {

  const titleMatchCount = new Map<number, number>();

  const textMatchCount = new Map<number, number>();
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
 * @param candidateRowids The candidate rowids.
 * @param vecSimilarity Vector similarity by rowid.
 * @param ftsSimilarity FTS similarity by rowid.
 * @param wFTS The FTS weight.
 * @param titleMatchCount Title match counts by rowid.
 * @param textMatchCount Text match counts by rowid.
 * @param config The plugin config.
 * @returns The blended chunks.
 */
export function blendAndRank(candidateRowids: number[], vecSimilarity: Map<number, number>, ftsSimilarity: Map<number, number>, wFTS: number, titleMatchCount: Map<number, number>, textMatchCount: Map<number, number>, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig): import('../search-provider-sqlite.js').BlendedChunk[] {
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
 * @param blended The blended chunks.
 * @param candidateRows The candidate rows.
 * @returns The retrieved chunks.
 */
function buildRetrievedChunks(blended: import('../search-provider-sqlite.js').BlendedChunk[], candidateRows: CandidateRow[]): import('../search-provider-sqlite.js').RetrievedChunk[] {

  const candidateRowsById = new Map<number, CandidateRow>();
  for (const row of candidateRows) {
    candidateRowsById.set(row.rowid, row);
  }

  const merged: import('../search-provider-sqlite.js').RetrievedChunk[] = [];
  for (const blendedChunk of blended) {
    const row = candidateRowsById.get(blendedChunk.rowid);
    if (!row) {
      continue;
    }

    let sectionPath: string[] = [];
    try {

      const data = JSON.parse(row.meta_json || '{}') as Record<string, unknown>;
      // Index metadata comes from JSON and may predate the current string-only section paths.
      sectionPath = Array.isArray(data?.sectionPath) ? data.sectionPath.filter((part): part is string => typeof part === 'string') : [];
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
 * @param merged The ranked chunks.
 * @param pinnedRowids Rowids that should be kept first.
 * @param config The plugin config.
 * @returns The picked chunks.
 */
export function pickByBudget(merged: import('../search-provider-sqlite.js').RetrievedChunk[], pinnedRowids: Set<number>, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig): import('../search-provider-sqlite.js').RetrievedChunk[] {

  const capBySource = new Map<string, number>();

  const picked: import('../search-provider-sqlite.js').RetrievedChunk[] = [];
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
 * @param picked The picked chunks.
 * @returns The citations.
 */
export function buildCitations(picked: import('../search-provider-sqlite.js').RetrievedChunk[]): Citation[] {
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
 * @param query The query to retrieve chunks for.
 * @param config The options for the retrieval.
 * @param [slugs] Optional array of source slugs to restrict search to.
 * @returns The retrieved chunks.
 */
export async function retrieve(query: string, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig, slugs: string[] = []): Promise<import('../search-provider-sqlite.js').RetrieveResponse> {
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

    const pinnedRowids = new Set<number>();
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
