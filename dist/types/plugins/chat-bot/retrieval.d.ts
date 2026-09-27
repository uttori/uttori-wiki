export interface VectorRow {
    /** The rowid of the chunk. */
    rowid: number;
    /** The vector distance. */
    distance: number;
}
export interface FtsRankRow {
    /** The rowid of the chunk. */
    rowid: number;
    /** The FTS rank. */
    rank: number;
}
export interface CandidateRow {
    /** The rowid of the chunk. */
    rowid: number;
    /** The source id of the chunk. */
    source_id: string;
    /** The index of the chunk. */
    idx: number;
    /** The text of the chunk. */
    text: string;
    /** The token count of the chunk. */
    token_count: number;
    /** The meta JSON of the chunk. */
    meta_json: string;
    /** The title of the source. */
    source_title: string;
    /** The slug of the source. */
    source_slug: string;
}
export interface SlugFilter {
    /** The SQL filter fragment. */
    sql: string;
    /** The slug filter params. */
    params: string[];
}
export interface MatchCounts {
    /** The title match counts by rowid. */
    titleMatchCount: Map<number, number>;
    /** The text match counts by rowid. */
    textMatchCount: Map<number, number>;
}
export interface Citation {
    /** The source title. */
    title: string;
    /** The source slug with an optional section anchor. */
    slug: string;
    /** The section path. */
    sectionPath: string[];
    /** The source id. */
    source_id: string;
    /** The chunk index. */
    idx: number;
    /** The retrieval score. */
    score: number;
}
//# sourceMappingURL=retrieval.d.ts.map