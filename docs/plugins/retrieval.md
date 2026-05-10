## Functions

<dl>
<dt><a href="#buildSlugFilter">buildSlugFilter([slugs])</a> ⇒ <code><a href="#SlugFilter">SlugFilter</a></code></dt>
<dd><p>Build a reusable SQL filter for restricting retrieval to selected source slugs.</p>
</dd>
<dt><a href="#embedQuery">embedQuery(baseUrl, model, input, [prompt])</a> ⇒ <code>Promise.&lt;Float32Array&gt;</code></dt>
<dd><p>Embed a query using the shared Ollama embedder implementation.</p>
</dd>
<dt><a href="#vectorSearch">vectorSearch(db, queryVectors, config, slugFilter)</a> ⇒ <code><a href="#VectorRow">Array.&lt;VectorRow&gt;</a></code></dt>
<dd><p>Run the vector search query.</p>
</dd>
<dt><a href="#buildFtsQuery">buildFtsQuery(entities)</a> ⇒ <code>string</code></dt>
<dd><p>Build an FTS5 MATCH query from normalized entity terms.</p>
</dd>
<dt><a href="#ftsSearch">ftsSearch(db, entities, config, slugFilter)</a> ⇒ <code><a href="#FtsRankRow">Array.&lt;FtsRankRow&gt;</a></code></dt>
<dd><p>Run the optional FTS search.</p>
</dd>
<dt><a href="#bm25ToSimilarity">bm25ToSimilarity(ftsRows)</a> ⇒ <code>Map.&lt;number, number&gt;</code></dt>
<dd><p>Convert Okapi BM25 ranks to normalized similarity scores.</p>
</dd>
<dt><a href="#vecDistanceToSimilarity">vecDistanceToSimilarity(vectorRows)</a> ⇒ <code>Map.&lt;number, number&gt;</code></dt>
<dd><p>Convert vector distances to normalized similarity scores.</p>
</dd>
<dt><a href="#ftsWeight">ftsWeight(query, entities, ftsRows, config)</a> ⇒ <code>number</code></dt>
<dd><p>Calculate the FTS blend weight for the current query.</p>
</dd>
<dt><a href="#fetchCandidateRows">fetchCandidateRows(db, candidateRowids)</a> ⇒ <code><a href="#CandidateRow">Array.&lt;CandidateRow&gt;</a></code></dt>
<dd><p>Fetch all candidate rows before blending.</p>
</dd>
<dt><a href="#calculateMatchCounts">calculateMatchCounts(candidateRows, entities)</a> ⇒ <code><a href="#MatchCounts">MatchCounts</a></code></dt>
<dd><p>Count query entity matches in candidate titles and text.</p>
</dd>
<dt><a href="#blendAndRank">blendAndRank(candidateRowids, vecSimilarity, ftsSimilarity, wFTS, titleMatchCount, textMatchCount, config)</a> ⇒ <code>Array.&lt;BlendedChunk&gt;</code></dt>
<dd><p>Blend vector, FTS, and entity boost scores.</p>
</dd>
<dt><a href="#buildRetrievedChunks">buildRetrievedChunks(blended, candidateRows)</a> ⇒ <code>Array.&lt;RetrievedChunk&gt;</code></dt>
<dd><p>Materialize scored candidates into retrieved chunks.</p>
</dd>
<dt><a href="#pickByBudget">pickByBudget(merged, pinnedRowids, config)</a> ⇒ <code>Array.&lt;RetrievedChunk&gt;</code></dt>
<dd><p>Select chunks under chunk, per-source, and token budgets.</p>
</dd>
<dt><a href="#buildCitations">buildCitations(picked)</a> ⇒ <code><a href="#Citation">Array.&lt;Citation&gt;</a></code></dt>
<dd><p>Build citations from retrieved chunks.</p>
</dd>
<dt><a href="#retrieve">retrieve(query, config, [slugs])</a> ⇒ <code>Promise.&lt;RetrieveResponse&gt;</code></dt>
<dd><p>Retrieve chunks from the database.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#VectorRow">VectorRow</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FtsRankRow">FtsRankRow</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#CandidateRow">CandidateRow</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#SlugFilter">SlugFilter</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#MatchCounts">MatchCounts</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#Citation">Citation</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="buildSlugFilter"></a>

## buildSlugFilter([slugs]) ⇒ [<code>SlugFilter</code>](#SlugFilter)
Build a reusable SQL filter for restricting retrieval to selected source slugs.

**Kind**: global function  
**Returns**: [<code>SlugFilter</code>](#SlugFilter) - The SQL fragment and bound params.  

| Param | Type | Description |
| --- | --- | --- |
| [slugs] | <code>Array.&lt;string&gt;</code> | Optional source slugs to restrict search to. |

<a name="embedQuery"></a>

## embedQuery(baseUrl, model, input, [prompt]) ⇒ <code>Promise.&lt;Float32Array&gt;</code>
Embed a query using the shared Ollama embedder implementation.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Float32Array&gt;</code> - The embedded query.  

| Param | Type | Description |
| --- | --- | --- |
| baseUrl | <code>string</code> | The base URL of the Ollama server. |
| model | <code>string</code> | The model to use for embedding. |
| input | <code>string</code> | The text to embed. |
| [prompt] | <code>string</code> | The prompt to embed. |

<a name="vectorSearch"></a>

## vectorSearch(db, queryVectors, config, slugFilter) ⇒ [<code>Array.&lt;VectorRow&gt;</code>](#VectorRow)
Run the vector search query.

**Kind**: global function  
**Returns**: [<code>Array.&lt;VectorRow&gt;</code>](#VectorRow) - The vector rows.  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>module:better-sqlite3/index.js~Database</code> | The database. |
| queryVectors | <code>Float32Array</code> | The embedded query vectors. |
| config | <code>AIChatBotConfig</code> | The plugin config. |
| slugFilter | [<code>SlugFilter</code>](#SlugFilter) | The slug filter. |

<a name="buildFtsQuery"></a>

## buildFtsQuery(entities) ⇒ <code>string</code>
Build an FTS5 MATCH query from normalized entity terms.

**Kind**: global function  
**Returns**: <code>string</code> - The FTS query.  

| Param | Type | Description |
| --- | --- | --- |
| entities | <code>Array.&lt;string&gt;</code> | The query entities. |

<a name="ftsSearch"></a>

## ftsSearch(db, entities, config, slugFilter) ⇒ [<code>Array.&lt;FtsRankRow&gt;</code>](#FtsRankRow)
Run the optional FTS search.

**Kind**: global function  
**Returns**: [<code>Array.&lt;FtsRankRow&gt;</code>](#FtsRankRow) - The FTS rows.  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>module:better-sqlite3/index.js~Database</code> | The database. |
| entities | <code>Array.&lt;string&gt;</code> | The query entities. |
| config | <code>AIChatBotConfig</code> | The plugin config. |
| slugFilter | [<code>SlugFilter</code>](#SlugFilter) | The slug filter. |

<a name="bm25ToSimilarity"></a>

## bm25ToSimilarity(ftsRows) ⇒ <code>Map.&lt;number, number&gt;</code>
Convert Okapi BM25 ranks to normalized similarity scores.

**Kind**: global function  
**Returns**: <code>Map.&lt;number, number&gt;</code> - Similarity score by rowid.  

| Param | Type | Description |
| --- | --- | --- |
| ftsRows | [<code>Array.&lt;FtsRankRow&gt;</code>](#FtsRankRow) | The FTS rows. |

<a name="bm25ToSimilarity..similarityByRowid"></a>

### bm25ToSimilarity~similarityByRowid : <code>Map.&lt;number, number&gt;</code>
**Kind**: inner constant of [<code>bm25ToSimilarity</code>](#bm25ToSimilarity)  
<a name="vecDistanceToSimilarity"></a>

## vecDistanceToSimilarity(vectorRows) ⇒ <code>Map.&lt;number, number&gt;</code>
Convert vector distances to normalized similarity scores.

**Kind**: global function  
**Returns**: <code>Map.&lt;number, number&gt;</code> - Similarity score by rowid.  

| Param | Type | Description |
| --- | --- | --- |
| vectorRows | [<code>Array.&lt;VectorRow&gt;</code>](#VectorRow) | The vector rows. |

<a name="vecDistanceToSimilarity..similarityByRowid"></a>

### vecDistanceToSimilarity~similarityByRowid : <code>Map.&lt;number, number&gt;</code>
**Kind**: inner constant of [<code>vecDistanceToSimilarity</code>](#vecDistanceToSimilarity)  
<a name="ftsWeight"></a>

## ftsWeight(query, entities, ftsRows, config) ⇒ <code>number</code>
Calculate the FTS blend weight for the current query.

**Kind**: global function  
**Returns**: <code>number</code> - The FTS weight.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The normalized query. |
| entities | <code>Array.&lt;string&gt;</code> | The query entities. |
| ftsRows | [<code>Array.&lt;FtsRankRow&gt;</code>](#FtsRankRow) | The FTS rows. |
| config | <code>AIChatBotConfig</code> | The plugin config. |

<a name="fetchCandidateRows"></a>

## fetchCandidateRows(db, candidateRowids) ⇒ [<code>Array.&lt;CandidateRow&gt;</code>](#CandidateRow)
Fetch all candidate rows before blending.

**Kind**: global function  
**Returns**: [<code>Array.&lt;CandidateRow&gt;</code>](#CandidateRow) - The candidate rows.  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>module:better-sqlite3/index.js~Database</code> | The database. |
| candidateRowids | <code>Array.&lt;number&gt;</code> | The candidate rowids. |

<a name="calculateMatchCounts"></a>

## calculateMatchCounts(candidateRows, entities) ⇒ [<code>MatchCounts</code>](#MatchCounts)
Count query entity matches in candidate titles and text.

**Kind**: global function  
**Returns**: [<code>MatchCounts</code>](#MatchCounts) - Match counts by rowid.  

| Param | Type | Description |
| --- | --- | --- |
| candidateRows | [<code>Array.&lt;CandidateRow&gt;</code>](#CandidateRow) | The candidate rows. |
| entities | <code>Array.&lt;string&gt;</code> | The query entities. |


* [calculateMatchCounts(candidateRows, entities)](#calculateMatchCounts) ⇒ [<code>MatchCounts</code>](#MatchCounts)
    * [~titleMatchCount](#calculateMatchCounts..titleMatchCount) : <code>Map.&lt;number, number&gt;</code>
    * [~textMatchCount](#calculateMatchCounts..textMatchCount) : <code>Map.&lt;number, number&gt;</code>

<a name="calculateMatchCounts..titleMatchCount"></a>

### calculateMatchCounts~titleMatchCount : <code>Map.&lt;number, number&gt;</code>
**Kind**: inner constant of [<code>calculateMatchCounts</code>](#calculateMatchCounts)  
<a name="calculateMatchCounts..textMatchCount"></a>

### calculateMatchCounts~textMatchCount : <code>Map.&lt;number, number&gt;</code>
**Kind**: inner constant of [<code>calculateMatchCounts</code>](#calculateMatchCounts)  
<a name="blendAndRank"></a>

## blendAndRank(candidateRowids, vecSimilarity, ftsSimilarity, wFTS, titleMatchCount, textMatchCount, config) ⇒ <code>Array.&lt;BlendedChunk&gt;</code>
Blend vector, FTS, and entity boost scores.

**Kind**: global function  
**Returns**: <code>Array.&lt;BlendedChunk&gt;</code> - The blended chunks.  

| Param | Type | Description |
| --- | --- | --- |
| candidateRowids | <code>Array.&lt;number&gt;</code> | The candidate rowids. |
| vecSimilarity | <code>Map.&lt;number, number&gt;</code> | Vector similarity by rowid. |
| ftsSimilarity | <code>Map.&lt;number, number&gt;</code> | FTS similarity by rowid. |
| wFTS | <code>number</code> | The FTS weight. |
| titleMatchCount | <code>Map.&lt;number, number&gt;</code> | Title match counts by rowid. |
| textMatchCount | <code>Map.&lt;number, number&gt;</code> | Text match counts by rowid. |
| config | <code>AIChatBotConfig</code> | The plugin config. |

<a name="buildRetrievedChunks"></a>

## buildRetrievedChunks(blended, candidateRows) ⇒ <code>Array.&lt;RetrievedChunk&gt;</code>
Materialize scored candidates into retrieved chunks.

**Kind**: global function  
**Returns**: <code>Array.&lt;RetrievedChunk&gt;</code> - The retrieved chunks.  

| Param | Type | Description |
| --- | --- | --- |
| blended | <code>Array.&lt;BlendedChunk&gt;</code> | The blended chunks. |
| candidateRows | [<code>Array.&lt;CandidateRow&gt;</code>](#CandidateRow) | The candidate rows. |


* [buildRetrievedChunks(blended, candidateRows)](#buildRetrievedChunks) ⇒ <code>Array.&lt;RetrievedChunk&gt;</code>
    * [~sectionPath](#buildRetrievedChunks..sectionPath) : <code>Array.&lt;string&gt;</code>
    * [~candidateRowsById](#buildRetrievedChunks..candidateRowsById) : <code>Map.&lt;number, CandidateRow&gt;</code>
    * [~merged](#buildRetrievedChunks..merged) : <code>Array.&lt;RetrievedChunk&gt;</code>
    * [~data](#buildRetrievedChunks..data) : <code>Record.&lt;string, any&gt;</code>

<a name="buildRetrievedChunks..sectionPath"></a>

### buildRetrievedChunks~sectionPath : <code>Array.&lt;string&gt;</code>
**Kind**: inner property of [<code>buildRetrievedChunks</code>](#buildRetrievedChunks)  
<a name="buildRetrievedChunks..candidateRowsById"></a>

### buildRetrievedChunks~candidateRowsById : <code>Map.&lt;number, CandidateRow&gt;</code>
**Kind**: inner constant of [<code>buildRetrievedChunks</code>](#buildRetrievedChunks)  
<a name="buildRetrievedChunks..merged"></a>

### buildRetrievedChunks~merged : <code>Array.&lt;RetrievedChunk&gt;</code>
**Kind**: inner constant of [<code>buildRetrievedChunks</code>](#buildRetrievedChunks)  
<a name="buildRetrievedChunks..data"></a>

### buildRetrievedChunks~data : <code>Record.&lt;string, any&gt;</code>
**Kind**: inner constant of [<code>buildRetrievedChunks</code>](#buildRetrievedChunks)  
<a name="pickByBudget"></a>

## pickByBudget(merged, pinnedRowids, config) ⇒ <code>Array.&lt;RetrievedChunk&gt;</code>
Select chunks under chunk, per-source, and token budgets.

**Kind**: global function  
**Returns**: <code>Array.&lt;RetrievedChunk&gt;</code> - The picked chunks.  

| Param | Type | Description |
| --- | --- | --- |
| merged | <code>Array.&lt;RetrievedChunk&gt;</code> | The ranked chunks. |
| pinnedRowids | <code>Set.&lt;number&gt;</code> | Rowids that should be kept first. |
| config | <code>AIChatBotConfig</code> | The plugin config. |


* [pickByBudget(merged, pinnedRowids, config)](#pickByBudget) ⇒ <code>Array.&lt;RetrievedChunk&gt;</code>
    * [~capBySource](#pickByBudget..capBySource) : <code>Map.&lt;string, number&gt;</code>
    * [~picked](#pickByBudget..picked) : <code>Array.&lt;RetrievedChunk&gt;</code>

<a name="pickByBudget..capBySource"></a>

### pickByBudget~capBySource : <code>Map.&lt;string, number&gt;</code>
**Kind**: inner constant of [<code>pickByBudget</code>](#pickByBudget)  
<a name="pickByBudget..picked"></a>

### pickByBudget~picked : <code>Array.&lt;RetrievedChunk&gt;</code>
**Kind**: inner constant of [<code>pickByBudget</code>](#pickByBudget)  
<a name="buildCitations"></a>

## buildCitations(picked) ⇒ [<code>Array.&lt;Citation&gt;</code>](#Citation)
Build citations from retrieved chunks.

**Kind**: global function  
**Returns**: [<code>Array.&lt;Citation&gt;</code>](#Citation) - The citations.  

| Param | Type | Description |
| --- | --- | --- |
| picked | <code>Array.&lt;RetrievedChunk&gt;</code> | The picked chunks. |

<a name="retrieve"></a>

## retrieve(query, config, [slugs]) ⇒ <code>Promise.&lt;RetrieveResponse&gt;</code>
Retrieve chunks from the database.

**Kind**: global function  
**Returns**: <code>Promise.&lt;RetrieveResponse&gt;</code> - The retrieved chunks.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The query to retrieve chunks for. |
| config | <code>AIChatBotConfig</code> | The options for the retrieval. |
| [slugs] | <code>Array.&lt;string&gt;</code> | Optional array of source slugs to restrict search to. |

<a name="retrieve..pinnedRowids"></a>

### retrieve~pinnedRowids : <code>Set.&lt;number&gt;</code>
**Kind**: inner constant of [<code>retrieve</code>](#retrieve)  
<a name="VectorRow"></a>

## VectorRow : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rowid | <code>number</code> | The rowid of the chunk. |
| distance | <code>number</code> | The vector distance. |

<a name="FtsRankRow"></a>

## FtsRankRow : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rowid | <code>number</code> | The rowid of the chunk. |
| rank | <code>number</code> | The FTS rank. |

<a name="CandidateRow"></a>

## CandidateRow : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rowid | <code>number</code> | The rowid of the chunk. |
| source_id | <code>string</code> | The source id of the chunk. |
| idx | <code>number</code> | The index of the chunk. |
| text | <code>string</code> | The text of the chunk. |
| token_count | <code>number</code> | The token count of the chunk. |
| meta_json | <code>string</code> | The meta JSON of the chunk. |
| source_title | <code>string</code> | The title of the source. |
| source_slug | <code>string</code> | The slug of the source. |

<a name="SlugFilter"></a>

## SlugFilter : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| sql | <code>string</code> | The SQL filter fragment. |
| params | <code>Array.&lt;string&gt;</code> | The slug filter params. |

<a name="MatchCounts"></a>

## MatchCounts : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| titleMatchCount | <code>Map.&lt;number, number&gt;</code> | The title match counts by rowid. |
| textMatchCount | <code>Map.&lt;number, number&gt;</code> | The text match counts by rowid. |

<a name="Citation"></a>

## Citation : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| title | <code>string</code> | The source title. |
| slug | <code>string</code> | The source slug with an optional section anchor. |
| sectionPath | <code>Array.&lt;string&gt;</code> | The section path. |
| source_id | <code>string</code> | The source id. |
| idx | <code>number</code> | The chunk index. |
| score | <code>number</code> | The retrieval score. |

