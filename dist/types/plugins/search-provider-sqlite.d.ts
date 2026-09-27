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
//# sourceMappingURL=search-provider-sqlite.d.ts.map