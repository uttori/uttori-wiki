import type { VectorRow, FtsRankRow, SlugFilter, Citation } from '../../types/plugins/chat-bot/retrieval.js';
export type { VectorRow, FtsRankRow, CandidateRow, SlugFilter, MatchCounts, Citation, } from '../../types/plugins/chat-bot/retrieval.js';
/**
 * Build a reusable SQL filter for restricting retrieval to selected source slugs.
 * @param [slugs] Optional source slugs to restrict search to.
 * @returns The SQL fragment and bound params.
 */
export declare function buildSlugFilter(slugs?: string[]): SlugFilter;
/**
 * Embed a query using the shared Ollama embedder implementation.
 * @param baseUrl The base URL of the Ollama server.
 * @param model The model to use for embedding.
 * @param input The text to embed.
 * @param [prompt] The prompt to embed.
 * @returns The embedded query.
 */
export declare function embedQuery(baseUrl: string, model: string, input: string, prompt?: string): Promise<Float32Array>;
/**
 * Convert Okapi BM25 ranks to normalized similarity scores.
 * @param ftsRows The FTS rows.
 * @returns Similarity score by rowid.
 */
export declare function bm25ToSimilarity(ftsRows: FtsRankRow[]): Map<number, number>;
/**
 * Convert vector distances to normalized similarity scores.
 * @param vectorRows The vector rows.
 * @returns Similarity score by rowid.
 */
export declare function vecDistanceToSimilarity(vectorRows: VectorRow[]): Map<number, number>;
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
export declare function blendAndRank(candidateRowids: number[], vecSimilarity: Map<number, number>, ftsSimilarity: Map<number, number>, wFTS: number, titleMatchCount: Map<number, number>, textMatchCount: Map<number, number>, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig): import('../search-provider-sqlite.js').BlendedChunk[];
/**
 * Select chunks under chunk, per-source, and token budgets.
 * @param merged The ranked chunks.
 * @param pinnedRowids Rowids that should be kept first.
 * @param config The plugin config.
 * @returns The picked chunks.
 */
export declare function pickByBudget(merged: import('../search-provider-sqlite.js').RetrievedChunk[], pinnedRowids: Set<number>, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig): import('../search-provider-sqlite.js').RetrievedChunk[];
/**
 * Build citations from retrieved chunks.
 * @param picked The picked chunks.
 * @returns The citations.
 */
export declare function buildCitations(picked: import('../search-provider-sqlite.js').RetrievedChunk[]): Citation[];
/**
 * Retrieve chunks from the database.
 * @param query The query to retrieve chunks for.
 * @param config The options for the retrieval.
 * @param [slugs] Optional array of source slugs to restrict search to.
 * @returns The retrieved chunks.
 */
export declare function retrieve(query: string, config: import('../search-provider-sqlite.js').ResolvedSearchSQLiteConfig, slugs?: string[]): Promise<import('../search-provider-sqlite.js').RetrieveResponse>;
//# sourceMappingURL=retrieval.d.ts.map