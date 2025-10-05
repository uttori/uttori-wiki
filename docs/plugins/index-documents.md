## Functions

<dl>
<dt><a href="#buildBlocks">buildBlocks(document, config)</a> ⇒ <code>Promise.&lt;Array.&lt;Block&gt;&gt;</code></dt>
<dd><p>Build blocks from a document.</p>
</dd>
<dt><a href="#indexAllDocuments">indexAllDocuments(fullConfig, context)</a> ⇒ <code>Promise.&lt;void&gt;</code></dt>
<dd><p>Index all documents in the database.</p>
</dd>
</dl>

<a name="buildBlocks"></a>

## buildBlocks(document, config) ⇒ <code>Promise.&lt;Array.&lt;Block&gt;&gt;</code>
Build blocks from a document.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Block&gt;&gt;</code> - The blocks.  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>UttoriWikiDocument</code> | The document to build blocks from. |
| config | <code>AIChatBotConfig</code> | The options. |

<a name="buildBlocks..output"></a>

### buildBlocks~output : <code>Array.&lt;Block&gt;</code>
**Kind**: inner constant of [<code>buildBlocks</code>](#buildBlocks)  
<a name="indexAllDocuments"></a>

## indexAllDocuments(fullConfig, context) ⇒ <code>Promise.&lt;void&gt;</code>
Index all documents in the database.

**Kind**: global function  
**Returns**: <code>Promise.&lt;void&gt;</code> - The indexed documents.  

| Param | Type | Description |
| --- | --- | --- |
| fullConfig | <code>Record.&lt;string, AIChatBotConfig&gt;</code> | The configuration. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-ai-chat-bot&#x27;, AIChatBotConfig&gt;</code> | The context. |


* [indexAllDocuments(fullConfig, context)](#indexAllDocuments) ⇒ <code>Promise.&lt;void&gt;</code>
    * [~documents](#indexAllDocuments..documents) : <code>Array.&lt;UttoriWikiDocument&gt;</code>
    * [~config](#indexAllDocuments..config) : <code>AIChatBotConfig</code>
    * [~db](#indexAllDocuments..db) : <code>module:better-sqlite3/index.js~Database</code>
    * [~embeddings](#indexAllDocuments..embeddings) : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
    * [~rowids](#indexAllDocuments..rowids) : <code>Array.&lt;number&gt;</code>
    * [~chunksWithVectors](#indexAllDocuments..chunksWithVectors) : <code>Array.&lt;ChunkWithMeta&gt;</code>

<a name="indexAllDocuments..documents"></a>

### indexAllDocuments~documents : <code>Array.&lt;UttoriWikiDocument&gt;</code>
**Kind**: inner property of [<code>indexAllDocuments</code>](#indexAllDocuments)  
<a name="indexAllDocuments..config"></a>

### indexAllDocuments~config : <code>AIChatBotConfig</code>
**Kind**: inner constant of [<code>indexAllDocuments</code>](#indexAllDocuments)  
<a name="indexAllDocuments..db"></a>

### indexAllDocuments~db : <code>module:better-sqlite3/index.js~Database</code>
**Kind**: inner constant of [<code>indexAllDocuments</code>](#indexAllDocuments)  
<a name="indexAllDocuments..embeddings"></a>

### indexAllDocuments~embeddings : <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
**Kind**: inner constant of [<code>indexAllDocuments</code>](#indexAllDocuments)  
<a name="indexAllDocuments..rowids"></a>

### indexAllDocuments~rowids : <code>Array.&lt;number&gt;</code>
**Kind**: inner constant of [<code>indexAllDocuments</code>](#indexAllDocuments)  
<a name="indexAllDocuments..chunksWithVectors"></a>

### indexAllDocuments~chunksWithVectors : <code>Array.&lt;ChunkWithMeta&gt;</code>
**Kind**: inner constant of [<code>indexAllDocuments</code>](#indexAllDocuments)  
