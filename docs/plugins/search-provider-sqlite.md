<a name="SearchSQLitePlugin"></a>

## SearchSQLitePlugin
Uttori Search Provider - SQLite, Uttori Plugin Adapter.

**Kind**: global class\

* [SearchSQLitePlugin](#SearchSQLitePlugin)
    * [new SearchSQLitePlugin()](#new_SearchSQLitePlugin_new)
    * [.configKey](#SearchSQLitePlugin.configKey) ⇒
    * [.defaultConfig()](#SearchSQLitePlugin.defaultConfig) ⇒
    * [.validateConfig(config)](#SearchSQLitePlugin.validateConfig)
    * [.register(context)](#SearchSQLitePlugin.register)

<a name="new_SearchSQLitePlugin_new"></a>

### new SearchSQLitePlugin()
**Example**\
```js
const search = SearchSQLitePlugin.callback(viewModel, context);
```
<a name="SearchSQLitePlugin.configKey"></a>

### SearchSQLitePlugin.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>SearchSQLitePlugin</code>](#SearchSQLitePlugin)\
**Returns**: The configuration key.\
**Example**\
```js
const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
```
<a name="SearchSQLitePlugin.defaultConfig"></a>

### SearchSQLitePlugin.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>SearchSQLitePlugin</code>](#SearchSQLitePlugin)\
**Returns**: The configuration.\
**Example**\
```js
const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
```
<a name="SearchSQLitePlugin.validateConfig"></a>

### SearchSQLitePlugin.validateConfig(config)
Validates the provided configuration for required entries and types.

**Kind**: static method of [<code>SearchSQLitePlugin</code>](#SearchSQLitePlugin)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |

**Example**\
```js
SearchSQLitePlugin.validateConfig({ ... });
```
<a name="SearchSQLitePlugin.register"></a>

### SearchSQLitePlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>SearchSQLitePlugin</code>](#SearchSQLitePlugin)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example**\
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

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { SearchSQLiteConfig } from '../types/plugins/search-provider-sqlite.js';
export type { SearchSQLiteEmbedPrompt, SearchSQLiteExtractAttachmentText, SearchSQLiteConfig, RetrievedChunk, RetrieveResponse, FtsRow, Block, IndexedBlock, ChunkWithMeta, BlendedChunk, ResolvedSearchSQLiteConfig, } from '../types/plugins/search-provider-sqlite.js';
/**
 * Uttori Search Provider - SQLite, Uttori Plugin Adapter.
 *
 * @example
 * ```js
 * const search = SearchSQLitePlugin.callback(viewModel, context);
 * ```
 */
declare class SearchSQLitePlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     *
     * @returns The configuration key.
     * @example
     * ```js
     * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
     * ```
     */
    static get configKey(): 'uttori-plugin-search-provider-sqlite';
    /**
     * The default configuration.
     *
     * @returns The configuration.
     * @example
     * ```js
     * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
     * ```
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<SearchSQLiteConfig, 'events' | 'databasePath' | 'databaseOptions' | 'updateTimestamps' | 'useHistory' | 'ollamaBaseUrl' | 'embedModel' | 'embedPrompt' | 'chunkLimit' | 'hybrid' | 'fts' | 'ftsWeight' | 'titleBoost' | 'textBoost' | 'ftsWeightBump' | 'maxContextTokens' | 'maxPerSource' | 'batch' | 'ignoreSlugs' | 'ignoreTags' | 'bootstrapIndexOnStartup' | 'rebuildIndexOnStartup' | 'attachmentsRoot' | 'includeAttachments' | 'markdownItPluginConfig' | 'tableToCSV' | 'tableMaxRowsPerChunk' | 'tableMaxTokensPerChunk'>;
    /**
     * Validates the provided configuration for required entries and types.
     *
     * @param config A provided configuration to use.
     * @example
     * ```js
     * SearchSQLitePlugin.validateConfig({ ... });
     * ```
     */
    static validateConfig(config: Record<string, SearchSQLiteConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     *
     * @param context A Uttori-like context.
     * @example
     * ```js
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [SearchSQLitePlugin.configKey]: {
     *       events: {
     *         search: ['search-query'],
     *         buildIndex: ['search-rebuild'],
     *         indexAdd: ['search-add'],
     *         indexUpdate: ['search-update'],
     *         indexRemove: ['search-remove'],
     *         retrieve: ['search-retrieve'],
     *         listDocuments: ['search-documents'],
     *         getPopularSearchTerms: ['search-popular-terms'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * SearchSQLitePlugin.register(context);
     * ```
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-sqlite', SearchSQLiteConfig>): Promise<void>;
}
export default SearchSQLitePlugin;

export type SearchSQLiteEmbedPrompt = (task: string, query: string) => string;
export type SearchSQLiteExtractAttachmentText = (config: SearchSQLiteConfig, attachment: import('../../wiki.js').UttoriWikiDocumentAttachment) => Promise<string>;
export interface SearchSQLiteConfig {
    /** The events to listen for. */
    events?: Record<string, string[]>;
    /** The path to the SQLite database. */
    databasePath: string;
    /** The options for the database. */
    databaseOptions?: import('better-sqlite3').Options;
    /** Deprecated misspelled alias for `databaseOptions`. */
    databseOptions?: import('better-sqlite3').Options;
    /** Should update times be marked at the time of edit. */
    updateTimestamps?: boolean;
    /** Should history entries be created. */
    useHistory?: boolean;
    /** The base URL for the Ollama server. */
    ollamaBaseUrl: string;
    /** The model to use for embeddings. */
    embedModel: string;
    /** The prompt to use for embeddings. */
    embedPrompt?: SearchSQLiteEmbedPrompt;
    /** The limit for the number of chunks to return. */
    chunkLimit?: number;
    /** Whether to use the hybrid approach of vector & FTS. */
    hybrid?: boolean;
    /** Whether to use the FTS index. */
    fts?: boolean;
    /** The weight for the FTS index. */
    ftsWeight?: number;
    /** The title boost for query terms. */
    titleBoost?: number;
    /** The text boost for query terms. */
    textBoost?: number;
    /** The FTS weight bump for query terms. */
    ftsWeightBump?: number;
    /** The maximum number of tokens to use for context. */
    maxContextTokens?: number;
    /** The maximum number of chunks to use per source. */
    maxPerSource?: number;
    /** The embedding batch size. */
    batch?: number;
    /** Slugs to ignore. */
    ignoreSlugs?: string[];
    /** Tags to ignore. */
    ignoreTags?: string[];
    /** Whether to create the search index when index tables are missing on startup. */
    bootstrapIndexOnStartup?: boolean;
    /** Whether to rebuild the search index on startup. */
    rebuildIndexOnStartup?: boolean;
    /** The root path to the attachments. */
    attachmentsRoot?: string;
    /** Whether to include attachments. */
    includeAttachments?: boolean;
    /** The function to use to extract text from an attachment. */
    extractAttachmentText?: SearchSQLiteExtractAttachmentText;
    /** The markdown-it plugin configuration. */
    markdownItPluginConfig?: import('../../plugins/renderer-markdown-it.js').MarkdownItRendererConfig;
    /** Whether to convert tables to CSV format. */
    tableToCSV?: boolean;
    /** Maximum number of rows per table chunk for embedding. */
    tableMaxRowsPerChunk?: number;
    /** Maximum estimated tokens per table chunk for embedding. */
    tableMaxTokensPerChunk?: number;
}
/** A scored chunk returned from a retrieval (RAG) query. */
export interface RetrievedChunk {
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
    /** The section path of the chunk. */
    sectionPath: string[];
    /** The source of the chunk. */
    source: {
        id: string;
        title?: string;
        slug?: string;
    };
    /** The score of the chunk. */
    score: number;
}
/** The response from a retrieval (RAG) query. */
export interface RetrieveResponse {
    /** The query. */
    query: string;
    /** The chunks. */
    chunks: RetrievedChunk[];
    /** The citations. */
    citations: unknown[];
}
/** A row returned from the FTS index. */
export interface FtsRow {
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
    /** The rank of the chunk. */
    rank: number;
}
/** A block of content parsed from a document prior to chunking/embedding. */
export interface Block {
    /** The type of block. */
    type?: 'heading' | 'paragraph';
    /** The index of the block. */
    idx?: number;
    /** The level of the heading. */
    level?: number;
    /** The text of the block. */
    text: string;
    /** The section path of the block. */
    sectionPath: string[];
    /** The token count of the block. */
    tokenCount?: number;
    /** The tags of the block. */
    tags?: string[];
    /** The slug of the block. */
    slug?: string;
}
/** Consolidated block with its final position and estimated token count. */
export interface IndexedBlock extends Block {
    /** One-based position within the document's consolidated chunks. */
    idx: number;
    /** Estimated token count used for the embedding budget. */
    tokenCount: number;
}
/** A chunk paired with its embedding and metadata for insertion into the index. */
export interface ChunkWithMeta {
    /** The text of the chunk. */
    text: string;
    /** The index of the chunk. */
    idx: number;
    /** The token count of the chunk. */
    token_count: number;
    /** The section path of the chunk. */
    sectionPath: string[];
    /** The source id of the chunk. */
    source_id?: string;
    /** The embedding of the chunk. */
    embedding?: number[];
    /** The meta JSON of the chunk. */
    meta?: object;
}
/** A candidate chunk with its blended vector + FTS + boost score. */
export interface BlendedChunk {
    /** The rowid of the chunk. */
    rowid: number;
    /** The score of the chunk. */
    score: number;
    /** The title boost of the chunk. */
    titleBoost: number;
    /** The text boost of the chunk. */
    textBoost: number;
}
/** Search settings after plugin defaults have been applied. */
export type ResolvedSearchSQLiteConfig = Required<Omit<SearchSQLiteConfig, 'databseOptions' | 'markdownItPluginConfig' | 'events' | 'extractAttachmentText'>> & Pick<SearchSQLiteConfig, 'databseOptions' | 'markdownItPluginConfig' | 'events' | 'extractAttachmentText'>;
```

</details>
