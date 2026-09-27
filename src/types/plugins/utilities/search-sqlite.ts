export type SearchSQLiteConfig = import('../../../plugins/search-provider-sqlite.js').ResolvedSearchSQLiteConfig;

export type SearchSQLiteContext = import('../../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-search-provider-sqlite', SearchSQLiteConfig>;

export interface SearchSQLiteDocumentRow {
  /** The document slug when selected explicitly. */
  slug?: string;
  /** The serialized document payload. */
  data_json: string;
}

export interface SearchSQLiteSlugRow {
  /** The document slug. */
  slug: string;
  /** The serialized document payload. */
  data_json: string;
}

export interface SearchSQLiteCountRow {
  /** The aggregate count result. */
  count: number;
}

export interface SearchSQLiteRevisionRow {
  /** The revision identifier. */
  revision: string;
}

export interface SearchSQLiteIndexUpdate {
  /** The updated document. */
  document: import('../../../wiki.js').UttoriWikiDocument;
  /** The previous slug when the document was renamed. */
  originalSlug?: string;
}

export interface SearchSQLiteConfigSearchOptions {
  /** The value to search for. */
  query: string;
  /** Limit for the number of returned documents. */
  limit?: number;
  /** Optional slugs to restrict search to. */
  slugs?: string[];
}
