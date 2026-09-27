export interface TagRoutesPluginConfig {
  /** An object whose keys correspond to methods, and contents are events to listen for. */
  events?: Record<string, string[]>;
  /** The default title for tag pages. */
  title?: string;
  /** The maximum number of documents to return for a tag. */
  limit?: number;
  /** Middleware for tag routes. */
  middleware?: Record<string, import('express').RequestHandler[]>;
  /** A replacement route for the tag index route. */
  tagIndexRoute?: string;
  /** A replacement route for the tag show route. */
  tagRoute?: string;
  /** A replacement route for the tag index route. */
  apiRoute?: string;
  /** A replacement route handler for the tag index route. */
  tagIndexRequestHandler?: TagRoutesRequestHandler;
  /** A replacement route handler for the tag show route. */
  tagRequestHandler?: TagRoutesRequestHandler;
  /** A request handler for the API route. */
  apiRequestHandler?: TagRoutesRequestHandler;
}

/** Uttori context narrowed to this plugin's config shape. */
export type TagRoutesContext = import('../../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>;

/** Builds an Express handler for a tag route. */
export type TagRoutesRequestHandler = (context: TagRoutesContext) => import('express').RequestHandler;
