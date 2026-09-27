export interface AnalyticsPluginPopularDocument {
  /** The slug of the document. */
  slug: string;
  /** The count of the document. */
  count: number;
}

export interface AnalyticsPluginConfig {
  /** An object whose keys correspond to methods, and contents are events to listen for. */
  events?: Record<string, string[]>;
  /** The name of the analytics file. The default is 'visits'. */
  name?: string;
  /** The extension of the analytics file. The default is 'json'. */
  extension?: string;
  /** The path to the location you want the JSON file to be writtent to. */
  directory: string;
  /** The limit of documents to return. The default is 10. */
  limit?: number;
}

/** Uttori context narrowed to this plugin's config shape. */
export type AnalyticsPluginContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>;

export type AnalyticsPluginDocumentHandler = (document: import('../../wiki.js').UttoriWikiDocument, context: AnalyticsPluginContext) => import('../../wiki.js').UttoriWikiDocument;

export type AnalyticsPluginGetCountHandler = (document: import('../../wiki.js').UttoriWikiDocument, context: AnalyticsPluginContext) => number;

export type AnalyticsPluginGetPopularDocumentsHandler = (data: unknown, context: AnalyticsPluginContext) => AnalyticsPluginPopularDocument[];
