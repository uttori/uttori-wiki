export interface AddQueryOutputToViewModelQuery {
  /** The query to be run. */
  query?: string;
  /** The key to add the query output to. */
  key: string;
  /** The fallback value to use if the query fails. */
  fallback: import('../../wiki.js').UttoriWikiDocument[];
  /** An optional function to format the query output. */
  format?: import('../../custom.js').AddQueryOutputToViewModelFormatFunction;
  /** An optional custom function to execut the query. */
  queryFunction?: import('../../custom.js').AddQueryOutputToViewModelQueryFunction;
}

export interface AddQueryOutputToViewModelConfig {
  /**
   * The array of quieries to be run and returned that will be added to the passed in object and returned with the querie output added.
   */
  queries: Record<string, AddQueryOutputToViewModelQuery[]>;
  /** An object whose keys correspond to methods, and contents are events to listen for. */
  events?: Record<string, string[]>;
}

/** Uttori context narrowed to this plugin's config shape. */
export type AddQueryOutputToViewModelContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>;
