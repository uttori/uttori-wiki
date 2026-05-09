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
export function buildSlugFilter(slugs?: string[]): SlugFilter;
/**
 * Embed a query using the shared Ollama embedder implementation.
 * @param {string} baseUrl The base URL of the Ollama server.
 * @param {string} model The model to use for embedding.
 * @param {string} input The text to embed.
 * @param {string} [prompt] The prompt to embed.
 * @returns {Promise<Float32Array>} The embedded query.
 */
export function embedQuery(baseUrl: string, model: string, input: string, prompt?: string): Promise<Float32Array>;
/**
 * Convert Okapi BM25 ranks to normalized similarity scores.
 * @param {FtsRankRow[]} ftsRows The FTS rows.
 * @returns {Map<number, number>} Similarity score by rowid.
 */
export function bm25ToSimilarity(ftsRows: FtsRankRow[]): Map<number, number>;
/**
 * Convert vector distances to normalized similarity scores.
 * @param {VectorRow[]} vectorRows The vector rows.
 * @returns {Map<number, number>} Similarity score by rowid.
 */
export function vecDistanceToSimilarity(vectorRows: VectorRow[]): Map<number, number>;
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
export function blendAndRank(candidateRowids: number[], vecSimilarity: Map<number, number>, ftsSimilarity: Map<number, number>, wFTS: number, titleMatchCount: Map<number, number>, textMatchCount: Map<number, number>, config: import("../ai-chat-bot.js").AIChatBotConfig): import("../ai-chat-bot.js").BlendedChunk[];
/**
 * Select chunks under chunk, per-source, and token budgets.
 * @param {import('../ai-chat-bot.js').RetrievedChunk[]} merged The ranked chunks.
 * @param {Set<number>} pinnedRowids Rowids that should be kept first.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The plugin config.
 * @returns {import('../ai-chat-bot.js').RetrievedChunk[]} The picked chunks.
 */
export function pickByBudget(merged: import("../ai-chat-bot.js").RetrievedChunk[], pinnedRowids: Set<number>, config: import("../ai-chat-bot.js").AIChatBotConfig): import("../ai-chat-bot.js").RetrievedChunk[];
/**
 * Build citations from retrieved chunks.
 * @param {import('../ai-chat-bot.js').RetrievedChunk[]} picked The picked chunks.
 * @returns {Citation[]} The citations.
 */
export function buildCitations(picked: import("../ai-chat-bot.js").RetrievedChunk[]): Citation[];
/**
 * Retrieve chunks from the database.
 * @param {string} query The query to retrieve chunks for.
 * @param {import('../ai-chat-bot.js').AIChatBotConfig} config The options for the retrieval.
 * @param {string[]} [slugs] Optional array of source slugs to restrict search to.
 * @returns {Promise<import('../ai-chat-bot.js').RetrieveResponse>} The retrieved chunks.
 */
export function retrieve(query: string, config: import("../ai-chat-bot.js").AIChatBotConfig, slugs?: string[]): Promise<import("../ai-chat-bot.js").RetrieveResponse>;
export type VectorRow = {
    /**
     * The rowid of the chunk.
     */
    rowid: number;
    /**
     * The vector distance.
     */
    distance: number;
};
export type FtsRankRow = {
    /**
     * The rowid of the chunk.
     */
    rowid: number;
    /**
     * The FTS rank.
     */
    rank: number;
};
export type CandidateRow = {
    /**
     * The rowid of the chunk.
     */
    rowid: number;
    /**
     * The source id of the chunk.
     */
    source_id: string;
    /**
     * The index of the chunk.
     */
    idx: number;
    /**
     * The text of the chunk.
     */
    text: string;
    /**
     * The token count of the chunk.
     */
    token_count: number;
    /**
     * The meta JSON of the chunk.
     */
    meta_json: string;
    /**
     * The title of the source.
     */
    source_title: string;
    /**
     * The slug of the source.
     */
    source_slug: string;
};
export type SlugFilter = {
    /**
     * The SQL filter fragment.
     */
    sql: string;
    /**
     * The slug filter params.
     */
    params: string[];
};
export type MatchCounts = {
    /**
     * The title match counts by rowid.
     */
    titleMatchCount: Map<number, number>;
    /**
     * The text match counts by rowid.
     */
    textMatchCount: Map<number, number>;
};
export type Citation = {
    /**
     * The source title.
     */
    title: string;
    /**
     * The source slug with an optional section anchor.
     */
    slug: string;
    /**
     * The section path.
     */
    sectionPath: string[];
    /**
     * The source id.
     */
    source_id: string;
    /**
     * The chunk index.
     */
    idx: number;
    /**
     * The retrieval score.
     */
    score: number;
};
//# sourceMappingURL=retrieval.d.ts.map