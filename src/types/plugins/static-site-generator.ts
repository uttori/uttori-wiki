export interface StaticSiteRoute {
  /** Public root-relative URL. HTML routes end in `/`. */
  url: string;
  /** Expected response status; use 404 for the not-found page. */
  status?: number;
  /** Explicit relative output path, used for `404.html`. */
  output?: string;
  /** Last content change in Unix milliseconds. */
  updateDate?: number;
}

export interface StaticSiteAsset {
  /** Source file or directory to copy. */
  source: string;
  /** Root-relative destination within the artifact. */
  target: string;
}

export interface StaticSiteBuildOptions {
  /** Configured wiki Express application. */
  app: import('express').Application;
  /** Finite public route list, including the search shell and 404 page. */
  routes: StaticSiteRoute[];
  /** Directory to replace only after a complete build. */
  outputDirectory: string;
  /** Explicit public assets to copy. */
  assets?: StaticSiteAsset[];
  /** Public documents used by the existing Lunr indexer. */
  searchDocuments?: import('../../wiki.js').UttoriWikiDocument[];
  /** HTTP(S) origin for the sitemap. Omit only for local builds. */
  canonicalOrigin?: string;
}
