## Classes

<dl>
<dt><a href="#SearchSQLitePlugin">SearchSQLitePlugin</a></dt>
<dd><p>Uttori Search Provider - SQLite, Uttori Plugin Adapter.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SearchSQLiteEmbedPrompt">SearchSQLiteEmbedPrompt</a> ⇒ <code>string</code></dt>
<dd></dd>
<dt><a href="#SearchSQLiteExtractAttachmentText">SearchSQLiteExtractAttachmentText</a> ⇒ <code>Promise.&lt;string&gt;</code></dt>
<dd></dd>
<dt><a href="#SearchSQLiteConfig">SearchSQLiteConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#RetrievedChunk">RetrievedChunk</a> : <code>object</code></dt>
<dd><p>A scored chunk returned from a retrieval (RAG) query.</p>
</dd>
<dt><a href="#RetrieveResponse">RetrieveResponse</a> : <code>object</code></dt>
<dd><p>The response from a retrieval (RAG) query.</p>
</dd>
<dt><a href="#FtsRow">FtsRow</a> : <code>object</code></dt>
<dd><p>A row returned from the FTS index.</p>
</dd>
<dt><a href="#Block">Block</a> : <code>object</code></dt>
<dd><p>A block of content parsed from a document prior to chunking/embedding.</p>
</dd>
<dt><a href="#ChunkWithMeta">ChunkWithMeta</a> : <code>object</code></dt>
<dd><p>A chunk paired with its embedding and metadata for insertion into the index.</p>
</dd>
<dt><a href="#BlendedChunk">BlendedChunk</a> : <code>object</code></dt>
<dd><p>A candidate chunk with its blended vector + FTS + boost score.</p>
</dd>
</dl>

<a name="SearchSQLitePlugin"></a>

## SearchSQLitePlugin
Uttori Search Provider - SQLite, Uttori Plugin Adapter.

**Kind**: global class  

* [SearchSQLitePlugin](#SearchSQLitePlugin)
    * [new SearchSQLitePlugin()](#new_SearchSQLitePlugin_new)
    * [.configKey](#SearchSQLitePlugin.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#SearchSQLitePlugin.defaultConfig) ⇒ [<code>SearchSQLiteConfig</code>](#SearchSQLiteConfig)
    * [.validateConfig(config)](#SearchSQLitePlugin.validateConfig)
    * [.register(context)](#SearchSQLitePlugin.register)

<a name="new_SearchSQLitePlugin_new"></a>

### new SearchSQLitePlugin()
**Example**  
```js
const search = SearchSQLitePlugin.callback(viewModel, context);
```
<a name="SearchSQLitePlugin.configKey"></a>

### SearchSQLitePlugin.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>SearchSQLitePlugin</code>](#SearchSQLitePlugin)  
**Returns**: <code>string</code> - The configuration key.  
**Example**  
```js
const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
```
<a name="SearchSQLitePlugin.defaultConfig"></a>

### SearchSQLitePlugin.defaultConfig() ⇒ [<code>SearchSQLiteConfig</code>](#SearchSQLiteConfig)
The default configuration.

**Kind**: static method of [<code>SearchSQLitePlugin</code>](#SearchSQLitePlugin)  
**Returns**: [<code>SearchSQLiteConfig</code>](#SearchSQLiteConfig) - The configuration.  
**Example**  
```js
const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
```
<a name="SearchSQLitePlugin.validateConfig"></a>

### SearchSQLitePlugin.validateConfig(config)
Validates the provided configuration for required entries and types.

**Kind**: static method of [<code>SearchSQLitePlugin</code>](#SearchSQLitePlugin)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, SearchSQLiteConfig&gt;</code> | A provided configuration to use. |

**Example**  
```js
SearchSQLitePlugin.validateConfig({ ... });
```
<a name="SearchSQLitePlugin.register"></a>

### SearchSQLitePlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>SearchSQLitePlugin</code>](#SearchSQLitePlugin)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-search-provider-sqlite&#x27;, SearchSQLiteConfig&gt;</code> | A Uttori-like context. |

**Example**  
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [SearchSQLitePlugin.configKey]: {
      events: {
        search: ['search-query'],
        buildIndex: ['search-rebuild'],
        indexAdd: ['search-add'],
        indexUpdate: ['search-update'],
        indexRemove: ['search-remove'],
        retrieve: ['search-retrieve'],
        listDocuments: ['search-documents'],
        getPopularSearchTerms: ['search-popular-terms'],
        validateConfig: ['validate-config'],
      },
    },
  },
};
SearchSQLitePlugin.register(context);
```
<a name="SearchSQLiteEmbedPrompt"></a>

## SearchSQLiteEmbedPrompt ⇒ <code>string</code>
**Kind**: global typedef  
**Returns**: <code>string</code> - The prompt passed to the embedding model.  

| Param | Type | Description |
| --- | --- | --- |
| task | <code>string</code> | The embedding task label. |
| query | <code>string</code> | The query text to embed. |

<a name="SearchSQLiteExtractAttachmentText"></a>

## SearchSQLiteExtractAttachmentText ⇒ <code>Promise.&lt;string&gt;</code>
**Kind**: global typedef  
**Returns**: <code>Promise.&lt;string&gt;</code> - The extracted attachment text.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>SearchSQLiteConfig</code>](#SearchSQLiteConfig) | The plugin configuration. |
| attachment | <code>UttoriWikiDocumentAttachment</code> | The attachment to extract text from. |

<a name="SearchSQLiteConfig"></a>

## SearchSQLiteConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | The events to listen for. |
| databasePath | <code>string</code> | The path to the SQLite database. |
| [databaseOptions] | <code>module:better-sqlite3~Options</code> | The options for the database. |
| [databseOptions] | <code>module:better-sqlite3~Options</code> | Deprecated misspelled alias for `databaseOptions`. |
| [updateTimestamps] | <code>boolean</code> | Should update times be marked at the time of edit. |
| [useHistory] | <code>boolean</code> | Should history entries be created. |
| ollamaBaseUrl | <code>string</code> | The base URL for the Ollama server. |
| embedModel | <code>string</code> | The model to use for embeddings. |
| [embedPrompt] | [<code>SearchSQLiteEmbedPrompt</code>](#SearchSQLiteEmbedPrompt) | The prompt to use for embeddings. |
| [chunkLimit] | <code>number</code> | The limit for the number of chunks to return. |
| [hybrid] | <code>boolean</code> | Whether to use the hybrid approach of vector & FTS. |
| [fts] | <code>boolean</code> | Whether to use the FTS index. |
| [ftsWeight] | <code>number</code> | The weight for the FTS index. |
| [titleBoost] | <code>number</code> | The title boost for query terms. |
| [textBoost] | <code>number</code> | The text boost for query terms. |
| [ftsWeightBump] | <code>number</code> | The FTS weight bump for query terms. |
| [maxContextTokens] | <code>number</code> | The maximum number of tokens to use for context. |
| [maxPerSource] | <code>number</code> | The maximum number of chunks to use per source. |
| [batch] | <code>number</code> | The embedding batch size. |
| [ignoreSlugs] | <code>Array.&lt;string&gt;</code> | Slugs to ignore. |
| [ignoreTags] | <code>Array.&lt;string&gt;</code> | Tags to ignore. |
| [bootstrapIndexOnStartup] | <code>boolean</code> | Whether to create the search index when index tables are missing on startup. |
| [rebuildIndexOnStartup] | <code>boolean</code> | Whether to rebuild the search index on startup. |
| [attachmentsRoot] | <code>string</code> | The root path to the attachments. |
| [includeAttachments] | <code>boolean</code> | Whether to include attachments. |
| [extractAttachmentText] | [<code>SearchSQLiteExtractAttachmentText</code>](#SearchSQLiteExtractAttachmentText) | The function to use to extract text from an attachment. |
| [markdownItPluginConfig] | <code>MarkdownItRendererConfig</code> | The markdown-it plugin configuration. |
| [tableToCSV] | <code>boolean</code> | Whether to convert tables to CSV format. |
| [tableMaxRowsPerChunk] | <code>number</code> | Maximum number of rows per table chunk for embedding. |
| [tableMaxTokensPerChunk] | <code>number</code> | Maximum estimated tokens per table chunk for embedding. |

<a name="RetrievedChunk"></a>

## RetrievedChunk : <code>object</code>
A scored chunk returned from a retrieval (RAG) query.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rowid | <code>number</code> | The rowid of the chunk. |
| source_id | <code>string</code> | The source id of the chunk. |
| idx | <code>number</code> | The index of the chunk. |
| text | <code>string</code> | The text of the chunk. |
| token_count | <code>number</code> | The token count of the chunk. |
| sectionPath | <code>Array.&lt;string&gt;</code> | The section path of the chunk. |
| source | <code>object</code> | The source of the chunk. |
| source.id | <code>string</code> | The id of the source. |
| [source.title] | <code>string</code> | The title of the source. |
| [source.slug] | <code>string</code> | The slug of the source. |
| score | <code>number</code> | The score of the chunk. |

<a name="RetrieveResponse"></a>

## RetrieveResponse : <code>object</code>
The response from a retrieval (RAG) query.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The query. |
| chunks | [<code>Array.&lt;RetrievedChunk&gt;</code>](#RetrievedChunk) | The chunks. |
| citations | <code>Array.&lt;any&gt;</code> | The citations. |

<a name="FtsRow"></a>

## FtsRow : <code>object</code>
A row returned from the FTS index.

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
| rank | <code>number</code> | The rank of the chunk. |

<a name="Block"></a>

## Block : <code>object</code>
A block of content parsed from a document prior to chunking/embedding.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [type] | <code>&quot;heading&quot;</code> \| <code>&quot;paragraph&quot;</code> | The type of block. |
| [idx] | <code>number</code> | The index of the block. |
| [level] | <code>number</code> | The level of the heading. |
| text | <code>string</code> | The text of the block. |
| sectionPath | <code>Array.&lt;string&gt;</code> | The section path of the block. |
| [tokenCount] | <code>number</code> | The token count of the block. |
| [tags] | <code>Array.&lt;string&gt;</code> | The tags of the block. |
| [slug] | <code>string</code> | The slug of the block. |

<a name="ChunkWithMeta"></a>

## ChunkWithMeta : <code>object</code>
A chunk paired with its embedding and metadata for insertion into the index.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| text | <code>string</code> | The text of the chunk. |
| idx | <code>number</code> | The index of the chunk. |
| token_count | <code>number</code> | The token count of the chunk. |
| sectionPath | <code>Array.&lt;string&gt;</code> | The section path of the chunk. |
| [source_id] | <code>string</code> | The source id of the chunk. |
| [embedding] | <code>Array.&lt;number&gt;</code> | The embedding of the chunk. |
| [meta] | <code>object</code> | The meta JSON of the chunk. |

<a name="BlendedChunk"></a>

## BlendedChunk : <code>object</code>
A candidate chunk with its blended vector + FTS + boost score.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| rowid | <code>number</code> | The rowid of the chunk. |
| score | <code>number</code> | The score of the chunk. |
| titleBoost | <code>number</code> | The title boost of the chunk. |
| textBoost | <code>number</code> | The text boost of the chunk. |

