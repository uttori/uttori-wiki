export default SearchSQLitePlugin;
export type SearchSQLiteEmbedPrompt = (task: string, query: string) => string;
export type SearchSQLiteExtractAttachmentText = (config: SearchSQLiteConfig, attachment: import("../wiki.js").UttoriWikiDocumentAttachment) => Promise<string>;
export type SearchSQLiteConfig = {
    /**
     * The events to listen for.
     */
    events?: Record<string, string[]> | undefined;
    /**
     * The path to the SQLite database.
     */
    databasePath: string;
    /**
     * The options for the database.
     */
    databaseOptions?: import("better-sqlite3").Options | undefined;
    /**
     * Deprecated misspelled alias for `databaseOptions`.
     */
    databseOptions?: import("better-sqlite3").Options | undefined;
    /**
     * Should update times be marked at the time of edit.
     */
    updateTimestamps?: boolean | undefined;
    /**
     * Should history entries be created.
     */
    useHistory?: boolean | undefined;
    /**
     * The base URL for the Ollama server.
     */
    ollamaBaseUrl: string;
    /**
     * The model to use for embeddings.
     */
    embedModel: string;
    /**
     * The prompt to use for embeddings.
     */
    embedPrompt?: SearchSQLiteEmbedPrompt | undefined;
    /**
     * The limit for the number of chunks to return.
     */
    chunkLimit?: number | undefined;
    /**
     * Whether to use the hybrid approach of vector & FTS.
     */
    hybrid?: boolean | undefined;
    /**
     * Whether to use the FTS index.
     */
    fts?: boolean | undefined;
    /**
     * The weight for the FTS index.
     */
    ftsWeight?: number | undefined;
    /**
     * The title boost for query terms.
     */
    titleBoost?: number | undefined;
    /**
     * The text boost for query terms.
     */
    textBoost?: number | undefined;
    /**
     * The FTS weight bump for query terms.
     */
    ftsWeightBump?: number | undefined;
    /**
     * The maximum number of tokens to use for context.
     */
    maxContextTokens?: number | undefined;
    /**
     * The maximum number of chunks to use per source.
     */
    maxPerSource?: number | undefined;
    /**
     * The embedding batch size.
     */
    batch?: number | undefined;
    /**
     * Slugs to ignore.
     */
    ignoreSlugs?: string[] | undefined;
    /**
     * Tags to ignore.
     */
    ignoreTags?: string[] | undefined;
    /**
     * Whether to create the search index when index tables are missing on startup.
     */
    bootstrapIndexOnStartup?: boolean | undefined;
    /**
     * Whether to rebuild the search index on startup.
     */
    rebuildIndexOnStartup?: boolean | undefined;
    /**
     * The root path to the attachments.
     */
    attachmentsRoot?: string | undefined;
    /**
     * Whether to include attachments.
     */
    includeAttachments?: boolean | undefined;
    /**
     * The function to use to extract text from an attachment.
     */
    extractAttachmentText?: SearchSQLiteExtractAttachmentText | undefined;
    /**
     * The markdown-it plugin configuration.
     */
    markdownItPluginConfig?: import("./renderer-markdown-it.js").MarkdownItRendererConfig | undefined;
    /**
     * Whether to convert tables to CSV format.
     */
    tableToCSV?: boolean | undefined;
    /**
     * Maximum number of rows per table chunk for embedding.
     */
    tableMaxRowsPerChunk?: number | undefined;
    /**
     * Maximum estimated tokens per table chunk for embedding.
     */
    tableMaxTokensPerChunk?: number | undefined;
};
/**
 * A scored chunk returned from a retrieval (RAG) query.
 */
export type RetrievedChunk = {
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
     * The section path of the chunk.
     */
    sectionPath: string[];
    /**
     * The source of the chunk.
     */
    source: {
        id: string;
        title?: string | undefined;
        slug?: string | undefined;
    };
    /**
     * The score of the chunk.
     */
    score: number;
};
/**
 * The response from a retrieval (RAG) query.
 */
export type RetrieveResponse = {
    /**
     * The query.
     */
    query: string;
    /**
     * The chunks.
     */
    chunks: RetrievedChunk[];
    /**
     * The citations.
     */
    citations: any[];
};
/**
 * A row returned from the FTS index.
 */
export type FtsRow = {
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
    /**
     * The rank of the chunk.
     */
    rank: number;
};
/**
 * A block of content parsed from a document prior to chunking/embedding.
 */
export type Block = {
    /**
     * The type of block.
     */
    type?: "paragraph" | "heading" | undefined;
    /**
     * The index of the block.
     */
    idx?: number | undefined;
    /**
     * The level of the heading.
     */
    level?: number | undefined;
    /**
     * The text of the block.
     */
    text: string;
    /**
     * The section path of the block.
     */
    sectionPath: string[];
    /**
     * The token count of the block.
     */
    tokenCount?: number | undefined;
    /**
     * The tags of the block.
     */
    tags?: string[] | undefined;
    /**
     * The slug of the block.
     */
    slug?: string | undefined;
};
/**
 * A chunk paired with its embedding and metadata for insertion into the index.
 */
export type ChunkWithMeta = {
    /**
     * The text of the chunk.
     */
    text: string;
    /**
     * The index of the chunk.
     */
    idx: number;
    /**
     * The token count of the chunk.
     */
    token_count: number;
    /**
     * The section path of the chunk.
     */
    sectionPath: string[];
    /**
     * The source id of the chunk.
     */
    source_id?: string | undefined;
    /**
     * The embedding of the chunk.
     */
    embedding?: number[] | undefined;
    /**
     * The meta JSON of the chunk.
     */
    meta?: object | undefined;
};
/**
 * A candidate chunk with its blended vector + FTS + boost score.
 */
export type BlendedChunk = {
    /**
     * The rowid of the chunk.
     */
    rowid: number;
    /**
     * The score of the chunk.
     */
    score: number;
    /**
     * The title boost of the chunk.
     */
    titleBoost: number;
    /**
     * The text boost of the chunk.
     */
    textBoost: number;
};
/**
 * @callback SearchSQLiteEmbedPrompt
 * @param {string} task The embedding task label.
 * @param {string} query The query text to embed.
 * @returns {string} The prompt passed to the embedding model.
 */
/**
 * @callback SearchSQLiteExtractAttachmentText
 * @param {SearchSQLiteConfig} config The plugin configuration.
 * @param {import('../wiki.js').UttoriWikiDocumentAttachment} attachment The attachment to extract text from.
 * @returns {Promise<string>} The extracted attachment text.
 */
/**
 * @typedef {object} SearchSQLiteConfig
 * @property {Record<string, string[]>} [events] The events to listen for.
 * @property {string} databasePath The path to the SQLite database.
 * @property {import('better-sqlite3').Options} [databaseOptions] The options for the database.
 * @property {import('better-sqlite3').Options} [databseOptions] Deprecated misspelled alias for `databaseOptions`.
 * @property {boolean} [updateTimestamps] Should update times be marked at the time of edit.
 * @property {boolean} [useHistory] Should history entries be created.
 * @property {string} ollamaBaseUrl The base URL for the Ollama server.
 * @property {string} embedModel The model to use for embeddings.
 * @property {SearchSQLiteEmbedPrompt} [embedPrompt] The prompt to use for embeddings.
 * @property {number} [chunkLimit] The limit for the number of chunks to return.
 * @property {boolean} [hybrid] Whether to use the hybrid approach of vector & FTS.
 * @property {boolean} [fts] Whether to use the FTS index.
 * @property {number} [ftsWeight] The weight for the FTS index.
 * @property {number} [titleBoost] The title boost for query terms.
 * @property {number} [textBoost] The text boost for query terms.
 * @property {number} [ftsWeightBump] The FTS weight bump for query terms.
 * @property {number} [maxContextTokens] The maximum number of tokens to use for context.
 * @property {number} [maxPerSource] The maximum number of chunks to use per source.
 * @property {number} [batch] The embedding batch size.
 * @property {string[]} [ignoreSlugs] Slugs to ignore.
 * @property {string[]} [ignoreTags] Tags to ignore.
 * @property {boolean} [bootstrapIndexOnStartup] Whether to create the search index when index tables are missing on startup.
 * @property {boolean} [rebuildIndexOnStartup] Whether to rebuild the search index on startup.
 * @property {string} [attachmentsRoot] The root path to the attachments.
 * @property {boolean} [includeAttachments] Whether to include attachments.
 * @property {SearchSQLiteExtractAttachmentText} [extractAttachmentText] The function to use to extract text from an attachment.
 * @property {import('./renderer-markdown-it.js').MarkdownItRendererConfig} [markdownItPluginConfig] The markdown-it plugin configuration.
 * @property {boolean} [tableToCSV] Whether to convert tables to CSV format.
 * @property {number} [tableMaxRowsPerChunk] Maximum number of rows per table chunk for embedding.
 * @property {number} [tableMaxTokensPerChunk] Maximum estimated tokens per table chunk for embedding.
 */
/**
 * A scored chunk returned from a retrieval (RAG) query.
 * @typedef {object} RetrievedChunk
 * @property {number} rowid The rowid of the chunk.
 * @property {string} source_id The source id of the chunk.
 * @property {number} idx The index of the chunk.
 * @property {string} text The text of the chunk.
 * @property {number} token_count The token count of the chunk.
 * @property {string[]} sectionPath The section path of the chunk.
 * @property {object} source The source of the chunk.
 * @property {string} source.id The id of the source.
 * @property {string} [source.title] The title of the source.
 * @property {string} [source.slug] The slug of the source.
 * @property {number} score The score of the chunk.
 */
/**
 * The response from a retrieval (RAG) query.
 * @typedef {object} RetrieveResponse
 * @property {string} query The query.
 * @property {RetrievedChunk[]} chunks The chunks.
 * @property {any[]} citations The citations.
 */
/**
 * A row returned from the FTS index.
 * @typedef {object} FtsRow
 * @property {number} rowid The rowid of the chunk.
 * @property {string} source_id The source id of the chunk.
 * @property {number} idx The index of the chunk.
 * @property {string} text The text of the chunk.
 * @property {number} token_count The token count of the chunk.
 * @property {string} meta_json The meta JSON of the chunk.
 * @property {string} source_title The title of the source.
 * @property {string} source_slug The slug of the source.
 * @property {number} rank The rank of the chunk.
 */
/**
 * A block of content parsed from a document prior to chunking/embedding.
 * @typedef {object} Block
 * @property {"heading" | "paragraph"} [type] The type of block.
 * @property {number} [idx] The index of the block.
 * @property {number} [level] The level of the heading.
 * @property {string} text The text of the block.
 * @property {string[]} sectionPath The section path of the block.
 * @property {number} [tokenCount] The token count of the block.
 * @property {string[]} [tags] The tags of the block.
 * @property {string} [slug] The slug of the block.
 */
/**
 * A chunk paired with its embedding and metadata for insertion into the index.
 * @typedef {object} ChunkWithMeta
 * @property {string} text The text of the chunk.
 * @property {number} idx The index of the chunk.
 * @property {number} token_count The token count of the chunk.
 * @property {string[]} sectionPath The section path of the chunk.
 * @property {string} [source_id] The source id of the chunk.
 * @property {number[]} [embedding] The embedding of the chunk.
 * @property {object} [meta] The meta JSON of the chunk.
 */
/**
 * A candidate chunk with its blended vector + FTS + boost score.
 * @typedef {object} BlendedChunk
 * @property {number} rowid The rowid of the chunk.
 * @property {number} score The score of the chunk.
 * @property {number} titleBoost The title boost of the chunk.
 * @property {number} textBoost The text boost of the chunk.
 */
/**
 * Uttori Search Provider - SQLite, Uttori Plugin Adapter.
 *
 * @example
 * ```js
 * const search = SearchSQLitePlugin.callback(viewModel, context);
 * ```
 * @class
 */
declare class SearchSQLitePlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @type {string}
     * @returns {string} The configuration key.
     * @example
     * ```js
     * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
     * ```
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     *
     * @returns {SearchSQLiteConfig} The configuration.
     * @example
     * ```js
     * const config = { ...SearchSQLitePlugin.defaultConfig(), ...context.config[SearchSQLitePlugin.configKey] };
     * ```
     * @static
     */
    static defaultConfig(): SearchSQLiteConfig;
    /**
     * Validates the provided configuration for required entries and types.
     *
     * @param {Record<string, SearchSQLiteConfig>} config A provided configuration to use.
     * @example
     * ```js
     * SearchSQLitePlugin.validateConfig({ ... });
     * ```
     * @static
     */
    static validateConfig(config: Record<string, SearchSQLiteConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     *
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-sqlite', SearchSQLiteConfig>} context A Uttori-like context.
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
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-search-provider-sqlite", SearchSQLiteConfig>): Promise<void>;
}
//# sourceMappingURL=search-provider-sqlite.d.ts.map