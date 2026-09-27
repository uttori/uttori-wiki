## Functions

<dl>
<dt><a href="#buildSlugFilter">buildSlugFilter([slugs])</a> ⇒</dt>
<dd><p>Build a reusable SQL filter for restricting retrieval to selected source slugs.</p>
</dd>
<dt><a href="#embedQuery">embedQuery(baseUrl, model, input, [prompt])</a> ⇒</dt>
<dd><p>Embed a query using the shared Ollama embedder implementation.</p>
</dd>
<dt><a href="#vectorSearch">vectorSearch(db, queryVectors, config, slugFilter)</a> ⇒</dt>
<dd><p>Run the vector search query.</p>
</dd>
<dt><a href="#buildFtsQuery">buildFtsQuery(entities)</a> ⇒</dt>
<dd><p>Build an FTS5 MATCH query from normalized entity terms.</p>
</dd>
<dt><a href="#ftsSearch">ftsSearch(db, entities, config, slugFilter)</a> ⇒</dt>
<dd><p>Run the optional FTS search.</p>
</dd>
<dt><a href="#bm25ToSimilarity">bm25ToSimilarity(ftsRows)</a> ⇒</dt>
<dd><p>Convert Okapi BM25 ranks to normalized similarity scores.</p>
</dd>
<dt><a href="#vecDistanceToSimilarity">vecDistanceToSimilarity(vectorRows)</a> ⇒</dt>
<dd><p>Convert vector distances to normalized similarity scores.</p>
</dd>
<dt><a href="#ftsWeight">ftsWeight(query, entities, ftsRows, config)</a> ⇒</dt>
<dd><p>Calculate the FTS blend weight for the current query.</p>
</dd>
<dt><a href="#fetchCandidateRows">fetchCandidateRows(db, candidateRowids)</a> ⇒</dt>
<dd><p>Fetch all candidate rows before blending.</p>
</dd>
<dt><a href="#calculateMatchCounts">calculateMatchCounts(candidateRows, entities)</a> ⇒</dt>
<dd><p>Count query entity matches in candidate titles and text.</p>
</dd>
<dt><a href="#blendAndRank">blendAndRank(candidateRowids, vecSimilarity, ftsSimilarity, wFTS, titleMatchCount, textMatchCount, config)</a> ⇒</dt>
<dd><p>Blend vector, FTS, and entity boost scores.</p>
</dd>
<dt><a href="#buildRetrievedChunks">buildRetrievedChunks(blended, candidateRows)</a> ⇒</dt>
<dd><p>Materialize scored candidates into retrieved chunks.</p>
</dd>
<dt><a href="#pickByBudget">pickByBudget(merged, pinnedRowids, config)</a> ⇒</dt>
<dd><p>Select chunks under chunk, per-source, and token budgets.</p>
</dd>
<dt><a href="#buildCitations">buildCitations(picked)</a> ⇒</dt>
<dd><p>Build citations from retrieved chunks.</p>
</dd>
<dt><a href="#retrieve">retrieve(query, config, [slugs])</a> ⇒</dt>
<dd><p>Retrieve chunks from the database.</p>
</dd>
</dl>

<a name="buildSlugFilter"></a>

## buildSlugFilter([slugs]) ⇒
Build a reusable SQL filter for restricting retrieval to selected source slugs.

**Kind**: global function\
**Returns**: The SQL fragment and bound params.\

| Param | Description |
| --- | --- |
| [slugs] | Optional source slugs to restrict search to. |

<a name="embedQuery"></a>

## embedQuery(baseUrl, model, input, [prompt]) ⇒
Embed a query using the shared Ollama embedder implementation.

**Kind**: global function\
**Returns**: The embedded query.\

| Param | Description |
| --- | --- |
| baseUrl | The base URL of the Ollama server. |
| model | The model to use for embedding. |
| input | The text to embed. |
| [prompt] | The prompt to embed. |

<a name="vectorSearch"></a>

## vectorSearch(db, queryVectors, config, slugFilter) ⇒
Run the vector search query.

**Kind**: global function\
**Returns**: The vector rows.\

| Param | Description |
| --- | --- |
| db | The database. |
| queryVectors | The embedded query vectors. |
| config | The plugin config. |
| slugFilter | The slug filter. |

<a name="buildFtsQuery"></a>

## buildFtsQuery(entities) ⇒
Build an FTS5 MATCH query from normalized entity terms.

**Kind**: global function\
**Returns**: The FTS query.\

| Param | Description |
| --- | --- |
| entities | The query entities. |

<a name="ftsSearch"></a>

## ftsSearch(db, entities, config, slugFilter) ⇒
Run the optional FTS search.

**Kind**: global function\
**Returns**: The FTS rows.\

| Param | Description |
| --- | --- |
| db | The database. |
| entities | The query entities. |
| config | The plugin config. |
| slugFilter | The slug filter. |

<a name="bm25ToSimilarity"></a>

## bm25ToSimilarity(ftsRows) ⇒
Convert Okapi BM25 ranks to normalized similarity scores.

**Kind**: global function\
**Returns**: Similarity score by rowid.\

| Param | Description |
| --- | --- |
| ftsRows | The FTS rows. |

<a name="vecDistanceToSimilarity"></a>

## vecDistanceToSimilarity(vectorRows) ⇒
Convert vector distances to normalized similarity scores.

**Kind**: global function\
**Returns**: Similarity score by rowid.\

| Param | Description |
| --- | --- |
| vectorRows | The vector rows. |

<a name="ftsWeight"></a>

## ftsWeight(query, entities, ftsRows, config) ⇒
Calculate the FTS blend weight for the current query.

**Kind**: global function\
**Returns**: The FTS weight.\

| Param | Description |
| --- | --- |
| query | The normalized query. |
| entities | The query entities. |
| ftsRows | The FTS rows. |
| config | The plugin config. |

<a name="fetchCandidateRows"></a>

## fetchCandidateRows(db, candidateRowids) ⇒
Fetch all candidate rows before blending.

**Kind**: global function\
**Returns**: The candidate rows.\

| Param | Description |
| --- | --- |
| db | The database. |
| candidateRowids | The candidate rowids. |

<a name="calculateMatchCounts"></a>

## calculateMatchCounts(candidateRows, entities) ⇒
Count query entity matches in candidate titles and text.

**Kind**: global function\
**Returns**: Match counts by rowid.\

| Param | Description |
| --- | --- |
| candidateRows | The candidate rows. |
| entities | The query entities. |

<a name="blendAndRank"></a>

## blendAndRank(candidateRowids, vecSimilarity, ftsSimilarity, wFTS, titleMatchCount, textMatchCount, config) ⇒
Blend vector, FTS, and entity boost scores.

**Kind**: global function\
**Returns**: The blended chunks.\

| Param | Description |
| --- | --- |
| candidateRowids | The candidate rowids. |
| vecSimilarity | Vector similarity by rowid. |
| ftsSimilarity | FTS similarity by rowid. |
| wFTS | The FTS weight. |
| titleMatchCount | Title match counts by rowid. |
| textMatchCount | Text match counts by rowid. |
| config | The plugin config. |

<a name="buildRetrievedChunks"></a>

## buildRetrievedChunks(blended, candidateRows) ⇒
Materialize scored candidates into retrieved chunks.

**Kind**: global function\
**Returns**: The retrieved chunks.\

| Param | Description |
| --- | --- |
| blended | The blended chunks. |
| candidateRows | The candidate rows. |

<a name="pickByBudget"></a>

## pickByBudget(merged, pinnedRowids, config) ⇒
Select chunks under chunk, per-source, and token budgets.

**Kind**: global function\
**Returns**: The picked chunks.\

| Param | Description |
| --- | --- |
| merged | The ranked chunks. |
| pinnedRowids | Rowids that should be kept first. |
| config | The plugin config. |

<a name="buildCitations"></a>

## buildCitations(picked) ⇒
Build citations from retrieved chunks.

**Kind**: global function\
**Returns**: The citations.\

| Param | Description |
| --- | --- |
| picked | The picked chunks. |

<a name="retrieve"></a>

## retrieve(query, config, [slugs]) ⇒
Retrieve chunks from the database.

**Kind**: global function\
**Returns**: The retrieved chunks.\

| Param | Description |
| --- | --- |
| query | The query to retrieve chunks for. |
| config | The options for the retrieval. |
| [slugs] | Optional array of source slugs to restrict search to. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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
```

</details>
