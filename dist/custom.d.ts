import { Express } from 'express-serve-static-core';
import { EventDispatcher } from '@uttori/event-dispatcher';

// https://plusreturn.com/blog/how-to-extend-express-request-interface-in-typescript/
/** Add wikiFlash to the Request type. */
declare module 'express-serve-static-core' {
  interface Request {
    wikiFlash(key?: string, value?: any): object | any[] | boolean;
  }
}

// https://stackoverflow.com/questions/38900537/typescript-extend-express-session-interface-with-own-class
declare namespace Express {
  interface CustomSessionFields {
      myCustomField: string;
  }
  type RequestExpress = import('express-serve-static-core').Request;
  type SessionExpress = import('express-session').Session;
  type SessionDataExpress = import('express-session').SessionData;
  export interface RequestExtended extends RequestExpress {
      session: SessionExpress & Partial<SessionDataExpress> & CustomSessionFields
  }
}

/**
 * Uttori plugin configuration type.
 */
export type UttoriPluginConfig = Record<string, any>;

/**
 * Known plugin configuration keys mapped to their specific config types.
 */
export type KnownPluginConfigs = {
  'uttori-plugin-analytics-json-file': import('./plugins/analytics-json-file.js').AnalyticsPluginConfig;
  'uttori-plugin-auth-simple': import('./plugins/auth-simple.js').AuthSimpleConfig;
  'uttori-plugin-download-router': import('./plugins/download-route.js').DownloadRouterConfig;
  'uttori-plugin-renderer-ejs': import('./plugins/ejs-includes.js').EJSRendererConfig;
  'uttori-plugin-filter-ip-address': import('./plugins/filter-ip-address.js').FilterIPAddressConfig;
  'uttori-plugin-import-document': import('./plugins/import-document.js').ImportDocumentConfig;
  'uttori-plugin-add-query-output-to-view-model': import('./plugins/query-output.js').AddQueryOutputToViewModelConfig;
  'uttori-plugin-renderer-markdown-it': import('./plugins/renderer-markdown-it.js').MarkdownItRendererConfig;
  'uttori-plugin-renderer-replacer': import('./plugins/renderer-replacer.js').ReplacerRendererConfig;
  'uttori-plugin-search-provider-lunr': import('./plugins/search-provider-lunr.js').SearchProviderLunrConfig;
  'uttori-plugin-generator-sitemap': import('./plugins/sitemap-generator.js').SitemapGeneratorConfig;
  'uttori-plugin-storage-provider-json-file': import('./plugins/storage-provider-json-file.js').StorageProviderJsonFileConfig;
  'uttori-plugin-storage-provider-json-memory': import('./plugins/storage-provider-json-memory.js').StorageProviderJsonMemoryConfig;
  'uttori-plugin-tag-routes': import('./plugins/tag-routes.js').TagRoutesPluginConfig;
  'uttori-plugin-upload-multer': import('./plugins/upload-multer.js').MulterUploadConfig;
}

export type UttoriContext = {
  config: KnownPluginConfigs & Record<string, UttoriPluginConfig>;
  hooks: EventDispatcher;
}

/**
 * Extend a Uttori Context with a specific plugin config type.
 * @example <caption>UttoriContextWithPluginConfig</caption>
 * const context: UttoriContextWithPluginConfig<'my-plugin', MyPluginConfig> = {
 *   config: {
 *     'my-plugin': { enabled: true, foo: 1 },
 *   },
 * };
 */
export type UttoriContextWithPluginConfig<K extends string, CustomPluginConfig> =
  Omit<UttoriContext, 'config'> & {
    config: KnownPluginConfigs & Record<string, UttoriPluginConfig> & Record<K, CustomPluginConfig>;
  };

export type UttoriMiddleware = (string | Function | boolean)[]

export type AddQueryOutputToViewModelFormatFunction = (documents: UttoriWikiDocument[]) => any[]
export type AddQueryOutputToViewModelQueryFunction = (target: any, context: import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>) => Promise<any[][]>
export type AddQueryOutputToViewModelCallback = (target: any, context: import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>) => Promise<any>

export interface UttoriRedirect {
  /** The route to redirect from. */
  route: string;
  /** The route to redirect to. */
  target: string;
  /** The HTTP status code to use. Defaults to `301` */
  status?: number;
  /** If true, append the query string to the target. Default to `true` */
  appendQueryString?: boolean;
}

export interface SaveParams {
  /** Optional edit key/ */
  key?: string
  /** The slug to save to. */
  slug?: string
}

export interface UttoriWikiPlugin {
  /** The config key the plugin will search for in the larger config object. */
  static configKey: string
  /** The default config for the plugin. */
  static defaultConfig: Record<string, any>
  /** Validates the config. */
  static validateConfig?: (config: Record<string, object>, _context: UttoriContext) => void
  /** Sets up any hooks the plugin needs. */
  static register: (context: UttoriWiki) => void
  /** If the plugin has routes to bind, this function will be called with the Express app and the context. */
  static bindRoutes?: (app: Express, context: UttoriContext) => void
}

export type Operator = '=' | '!=' | '<=' | '<' | '>=' | '>' | 'LIKE' | 'IN' | 'NOT_IN' | 'INCLUDES' | 'EXCLUDES' | 'IS_NULL' | 'IS_NOT_NULL' | 'BETWEEN' | 'AND' | 'OR';
export type Value = string | number | Array<string | number | SqlWhereParserAst> | [string | number, string | number];

export type SqlWhereParserAst = {
  [key in Exclude<Operator, 'AND' | 'OR'>]?: Value;
} & {
  AND?: SqlWhereParserAst[];
  OR?: SqlWhereParserAst[];
};
export type ParserOperand = boolean | string | number | symbol | SqlWhereParserAst | Array<boolean | string | number | symbol | SqlWhereParserAst>;

export type SqlWhereParserEvaluator = (operatorValue: (number | string | symbol), operands: Array<string>) => Array<SqlWhereParserAst> | SqlWhereParserAst;
