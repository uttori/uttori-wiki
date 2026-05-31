## Functions

<dl>
<dt><a href="#buildBlocks">buildBlocks(document, config)</a> ⇒ <code>Promise.&lt;Array.&lt;Block&gt;&gt;</code></dt>
<dd><p>Build blocks from a document.</p>
</dd>
<dt><a href="#ensureChatIndexSchema">ensureChatIndexSchema(db, config, [options])</a> ⇒ <code>Promise.&lt;{embedder: OllamaEmbedder, dim: number}&gt;</code></dt>
<dd><p>Ensure the chat index tables exist.</p>
</dd>
<dt><a href="#removeIndexedDocumentFromDatabase">removeIndexedDocumentFromDatabase(db, slug)</a></dt>
<dd><p>Remove a document and all of its chunks from the chat index.</p>
</dd>
<dt><a href="#indexDocumentInDatabase">indexDocumentInDatabase(db, config, embedder, document)</a> ⇒ <code>Promise.&lt;{chunks: number, skipped: boolean, errored: number}&gt;</code></dt>
<dd><p>Index one document using an already-open database.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ChatIndexSchemaOptions">ChatIndexSchemaOptions</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="buildBlocks"></a>

## buildBlocks(document, config) ⇒ <code>Promise.&lt;Array.&lt;Block&gt;&gt;</code>
Build blocks from a document.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Block&gt;&gt;</code> - The blocks.  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriWikiDocument</code> | The document to build blocks from. |
| config | <code>SearchSQLiteConfig</code> | The options. |


* [buildBlocks(document, config)](#buildBlocks) ⇒ <code>Promise.&lt;Array.&lt;Block&gt;&gt;</code>
    * [~output](#buildBlocks..output) : <code>Array.&lt;Block&gt;</code>
    * [~sectionHash](#buildBlocks..sectionHash) : <code>Record.&lt;string, {headers: Array.&lt;string&gt;, content: Array.&lt;string&gt;}&gt;</code>
    * [~sectionz](#buildBlocks..sectionz) : <code>Array.&lt;{headers: Array.&lt;string&gt;, content: Array.&lt;string&gt;}&gt;</code>
    * [~chunks](#buildBlocks..chunks) : <code>Array.&lt;string&gt;</code>
    * [~newItems](#buildBlocks..newItems) : <code>Array.&lt;Block&gt;</code>

<a name="buildBlocks..output"></a>

### buildBlocks~output : <code>Array.&lt;Block&gt;</code>
**Kind**: inner constant of [<code>buildBlocks</code>](#buildBlocks)  
<a name="buildBlocks..sectionHash"></a>

### buildBlocks~sectionHash : <code>Record.&lt;string, {headers: Array.&lt;string&gt;, content: Array.&lt;string&gt;}&gt;</code>
**Kind**: inner constant of [<code>buildBlocks</code>](#buildBlocks)  
<a name="buildBlocks..sectionz"></a>

### buildBlocks~sectionz : <code>Array.&lt;{headers: Array.&lt;string&gt;, content: Array.&lt;string&gt;}&gt;</code>
**Kind**: inner constant of [<code>buildBlocks</code>](#buildBlocks)  
<a name="buildBlocks..chunks"></a>

### buildBlocks~chunks : <code>Array.&lt;string&gt;</code>
**Kind**: inner constant of [<code>buildBlocks</code>](#buildBlocks)  
<a name="buildBlocks..newItems"></a>

### buildBlocks~newItems : <code>Array.&lt;Block&gt;</code>
**Kind**: inner constant of [<code>buildBlocks</code>](#buildBlocks)  
<a name="ensureChatIndexSchema"></a>

## ensureChatIndexSchema(db, config, [options]) ⇒ <code>Promise.&lt;{embedder: OllamaEmbedder, dim: number}&gt;</code>
Ensure the chat index tables exist.

**Kind**: global function  
**Returns**: <code>Promise.&lt;{embedder: OllamaEmbedder, dim: number}&gt;</code> - The embedder and vector dimension.  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>module:better-sqlite3/index.js~Database</code> | The database. |
| config | <code>SearchSQLiteConfig</code> | The options. |
| [options] | [<code>ChatIndexSchemaOptions</code>](#ChatIndexSchemaOptions) | Schema options. |

<a name="removeIndexedDocumentFromDatabase"></a>

## removeIndexedDocumentFromDatabase(db, slug)
Remove a document and all of its chunks from the chat index.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>module:better-sqlite3/index.js~Database</code> | The database. |
| slug | <code>string</code> | The source slug to remove. |

<a name="indexDocumentInDatabase"></a>

## indexDocumentInDatabase(db, config, embedder, document) ⇒ <code>Promise.&lt;{chunks: number, skipped: boolean, errored: number}&gt;</code>
Index one document using an already-open database.

**Kind**: global function  
**Returns**: <code>Promise.&lt;{chunks: number, skipped: boolean, errored: number}&gt;</code> - Indexing stats.  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>module:better-sqlite3/index.js~Database</code> | The database. |
| config | <code>SearchSQLiteConfig</code> | The options. |
| embedder | <code>OllamaEmbedder</code> | The embedder. |
| document | <code>UttoriWikiDocument</code> | The document to index. |


* [indexDocumentInDatabase(db, config, embedder, document)](#indexDocumentInDatabase) ⇒ <code>Promise.&lt;{chunks: number, skipped: boolean, errored: number}&gt;</code>
    * [~embeddings](#indexDocumentInDatabase..embeddings) : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
    * [~chunksWithVectors](#indexDocumentInDatabase..chunksWithVectors) : <code>Array.&lt;ChunkWithMeta&gt;</code>

<a name="indexDocumentInDatabase..embeddings"></a>

### indexDocumentInDatabase~embeddings : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
**Kind**: inner constant of [<code>indexDocumentInDatabase</code>](#indexDocumentInDatabase)  
<a name="indexDocumentInDatabase..chunksWithVectors"></a>

### indexDocumentInDatabase~chunksWithVectors : <code>Array.&lt;ChunkWithMeta&gt;</code>
**Kind**: inner constant of [<code>indexDocumentInDatabase</code>](#indexDocumentInDatabase)  
<a name="ChatIndexSchemaOptions"></a>

## ChatIndexSchemaOptions : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [rebuild] | <code>boolean</code> | Whether to rebuild index tables. |

