export interface CategoryRoutesPluginConfig {
  /** An object whose keys correspond to methods, and contents are events to listen for. */
  events?: Record<string, string[]>;
  /** The default title for category pages. */
  title?: string;
  /** The maximum number of documents to return for a category. */
  limit?: number;
  /** Middleware for category routes. */
  middleware?: Record<string, import('express').RequestHandler[]>;
  /** A replacement route for the category index route. */
  categoryIndexRoute?: string;
  /** A replacement route for the category show route. */
  categoryRoute?: string;
  /** A replacement route for the category index route. */
  apiRoute?: string;
  /** A replacement route handler for the category index route. */
  categoryIndexRequestHandler?: CategoryRoutesRequestHandler;
  /** A replacement route handler for the category show route. */
  categoryRequestHandler?: CategoryRoutesRequestHandler;
  /** A request handler for the API route that returns all available categories. */
  apiRequestHandler?: CategoryRoutesRequestHandler;
  /** The document field to use for categories (default: 'categories'). */
  categoryField?: string;
  /** The separator used in hierarchical categories (default: '/'). */
  separator?: string;
}

export type CategoryDocument = import('../../wiki.js').UttoriWikiDocument;

export interface CategoryBreadcrumb {
  /** The name of the breadcrumb. */
  name: string;
  /** The path to the breadcrumb. */
  path: string;
  /** Whether the breadcrumb is the last in the chain. */
  isLast: boolean;
}

export interface FlattenedCategory {
  /** The name of the category. */
  name: string;
  /** The full path of the category. */
  fullPath: string;
  /** The nesting level of the category. */
  level: number;
}

export interface CategoryTreeNode {
  /** The name of the category. */
  name: string;
  /** The full path of the category. */
  fullPath: string;
  /** The child categories. */
  children: Record<string, CategoryTreeNode>;
  /** The documents in the category. */
  documents: CategoryDocument[];
}

/** Uttori context narrowed to this plugin's config shape. */
export type CategoryRoutesContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>;

/** Builds an Express handler for a category route. */
export type CategoryRoutesRequestHandler = (context: CategoryRoutesContext) => import('express').RequestHandler;
