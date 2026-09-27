import type { Express } from 'express-serve-static-core';
import type { AddQueryOutputToViewModelConfig } from '../plugins/query-output.js';
import type { EventDispatcher } from '@uttori/event-dispatcher';
import type { UttoriWikiConfig } from '../config.js';
import type { UttoriWikiDocument, UttoriWikiDocumentMetaData } from '../wiki.js';

/** Add wikiFlash to the Request type. */
declare module 'express-serve-static-core' {
  interface Request {
    wikiFlash: typeof import('../wiki-flash.js').wikiFlash;
  }
}

/** Uttori plugin configuration type. */
export type UttoriPluginConfig = Record<string, unknown>;

/** Known plugin configuration keys mapped to their specific config types. */
export interface KnownPluginConfigs {
  'uttori-plugin-ai-chat-bot': import('../plugins/ai-chat-bot.js').AIChatBotConfig;
  'uttori-plugin-analytics-json-file': import('../plugins/analytics-json-file.js').AnalyticsPluginConfig;
  'uttori-plugin-auth-simple': import('../plugins/auth-simple.js').AuthSimpleConfig;
  'uttori-plugin-category-routes': import('../plugins/category-routes.js').CategoryRoutesPluginConfig;
  'uttori-plugin-csrf': import('../plugins/csrf.js').CsrfProtectionConfig;
  'uttori-plugin-download-router': import('../plugins/download-route.js').DownloadRouterConfig;
  'uttori-plugin-renderer-ejs': import('../plugins/ejs-includes.js').EJSRendererConfig;
  'uttori-plugin-filter-ip-address': import('../plugins/filter-ip-address.js').FilterIPAddressConfig;
  'uttori-plugin-filter-spam-edit': import('../plugins/filter-spam-edit.js').FilterSpamEditConfig;
  'uttori-plugin-form-handler': import('../plugins/form-handler.js').FormHandlerConfig;
  'uttori-plugin-import-document': import('../plugins/import-document.js').ImportDocumentConfig;
  'uttori-plugin-mcp-provider': import('../plugins/mcp-provider.js').MCPProviderConfig;
  'uttori-plugin-add-query-output-to-view-model': import('../plugins/query-output.js').AddQueryOutputToViewModelConfig;
  'uttori-plugin-renderer-markdown-it': import('../plugins/renderer-markdown-it.js').MarkdownItRendererConfig;
  'uttori-plugin-renderer-replacer': import('../plugins/renderer-replacer.js').ReplacerRendererConfig;
  'uttori-plugin-search-provider-lunr': import('../plugins/search-provider-lunr.js').SearchLunrConfig;
  'uttori-plugin-search-provider-sqlite': import('../plugins/search-provider-sqlite.js').SearchSQLiteConfig;
  'uttori-plugin-generator-sitemap': import('../plugins/sitemap-generator.js').SitemapGeneratorConfig;
  'uttori-plugin-storage-provider-json-file': import('../plugins/storeage-provider-json/storage-provider-file.js').StorageProviderJsonFileConfig;
  'uttori-plugin-storage-provider-json-memory': import('../plugins/storeage-provider-json/storage-provider-memory.js').StorageProviderConfig;
  'uttori-plugin-tag-routes': import('../plugins/tag-routes.js').TagRoutesPluginConfig;
  'uttori-plugin-upload-multer': import('../plugins/upload-multer.js').MulterUploadConfig;
}

/** Defaults supplied by built-in plugins before their hooks are registered. */
export interface PluginDefaults {
  'uttori-plugin-ai-chat-bot': ReturnType<typeof import('../plugins/ai-chat-bot.js').default.defaultConfig>;
  'uttori-plugin-analytics-json-file': ReturnType<typeof import('../plugins/analytics-json-file.js').default.defaultConfig>;
  'uttori-plugin-auth-simple': ReturnType<typeof import('../plugins/auth-simple.js').default.defaultConfig>;
  'uttori-plugin-category-routes': ReturnType<typeof import('../plugins/category-routes.js').default.defaultConfig>;
  'uttori-plugin-csrf': ReturnType<typeof import('../plugins/csrf.js').default.defaultConfig>;
  'uttori-plugin-download-router': ReturnType<typeof import('../plugins/download-route.js').default.defaultConfig>;
  'uttori-plugin-renderer-ejs': ReturnType<typeof import('../plugins/ejs-includes.js').default.defaultConfig>;
  'uttori-plugin-filter-ip-address': ReturnType<typeof import('../plugins/filter-ip-address.js').default.defaultConfig>;
  'uttori-plugin-filter-spam-edit': ReturnType<typeof import('../plugins/filter-spam-edit.js').default.defaultConfig>;
  'uttori-plugin-form-handler': ReturnType<typeof import('../plugins/form-handler.js').default.defaultConfig>;
  'uttori-plugin-import-document': ReturnType<typeof import('../plugins/import-document.js').default.defaultConfig>;
  'uttori-plugin-mcp-provider': ReturnType<typeof import('../plugins/mcp-provider.js').default.defaultConfig>;
  'uttori-plugin-add-query-output-to-view-model': ReturnType<typeof import('../plugins/query-output.js').default.defaultConfig>;
  'uttori-plugin-renderer-markdown-it': ReturnType<typeof import('../plugins/renderer-markdown-it.js').default.defaultConfig>;
  'uttori-plugin-renderer-replacer': ReturnType<typeof import('../plugins/renderer-replacer.js').default.defaultConfig>;
  'uttori-plugin-search-provider-lunr': ReturnType<typeof import('../plugins/search-provider-lunr.js').default.defaultConfig>;
  'uttori-plugin-search-provider-sqlite': ReturnType<typeof import('../plugins/search-provider-sqlite.js').default.defaultConfig>;
  'uttori-plugin-generator-sitemap': ReturnType<typeof import('../plugins/sitemap-generator.js').default.defaultConfig>;
  'uttori-plugin-storage-provider-json-file': ReturnType<typeof import('../plugins/storage-provider-json-file.js').default.defaultConfig>;
  'uttori-plugin-storage-provider-json-memory': ReturnType<typeof import('../plugins/storage-provider-json-memory.js').default.defaultConfig>;
  'uttori-plugin-tag-routes': ReturnType<typeof import('../plugins/tag-routes.js').default.defaultConfig>;
  'uttori-plugin-upload-multer': ReturnType<typeof import('../plugins/upload-multer.js').default.defaultConfig>;
}

/** Wiki services shared with plugins; only installed plugins have configuration entries. */
export interface UttoriContext {
  config: UttoriWikiConfig & Partial<KnownPluginConfigs> & Record<string, unknown>;
  hooks: EventDispatcher;
  buildMetadata: (document: Partial<UttoriWikiDocument>, path?: string, robots?: string) => Promise<UttoriWikiDocumentMetaData>;
  buildViewModelBase: (
    request: import('express').Request,
    options?: { title?: string; meta?: UttoriWikiDocumentMetaData; slug?: string },
  ) => {
    title: string;
    config: UttoriWikiConfig;
    session?: import('express-session').Session & Partial<import('express-session').SessionData>;
    meta?: UttoriWikiDocumentMetaData;
    basePath: string;
    flash?: boolean | object | string[];
    slug?: string;
  };
}

/**
 * Extend a Uttori Context with a specific plugin config type.
 * @example <caption>UttoriContextWithPluginConfig</caption>
 * const context: UttoriContextWithPluginConfig<'my-plugin', MyPluginConfig> = {
 * config: {
 * 'my-plugin': { enabled: true, foo: 1 },
 * },
 * };
 */
export type UttoriContextWithPluginConfig<K extends string, CustomPluginConfig> =
  Omit<UttoriContext, 'config'> & {
    config: UttoriWikiConfig & Partial<KnownPluginConfigs> & Record<string, unknown> & Record<K, K extends keyof PluginDefaults ? ResolvedPluginConfig<CustomPluginConfig, PluginDefaults[K]> : CustomPluginConfig>;
  };

export type UttoriMiddleware = (string | ((...args: never[]) => unknown) | boolean)[];

export type AddQueryOutputToViewModelFormatFunction = (documents: UttoriWikiDocument[]) => unknown[];

export type AddQueryOutputToViewModelQueryFunction = (target: unknown, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>) => Promise<unknown[][]>;

export type AddQueryOutputToViewModelCallback = (target: Record<string, unknown>, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>) => Promise<unknown>;

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
  /** Optional edit key. */
  key?: string
  /** The slug to save to. */
  slug?: string
}

/**
 * Base interface for extending UttoriWikiDocument with plugin-specific fields.
 * Plugins can extend this interface to add their own document fields.
 *
 * @example
 * ```typescript
 * declare module '@uttori/wiki' {
 * interface UttoriWikiDocumentExtensions {
 * categories?: string[];
 * }
 * }
 * ```
 */
// This intentionally empty interface is the public module-augmentation point for document plugins.
// oxlint-disable-next-line typescript/no-empty-object-type
export interface UttoriWikiDocumentExtensions {}

/**
 * Extended UttoriWikiDocument type that includes plugin-specific fields.
 * This type automatically includes all fields from UttoriWikiDocumentExtensions.
 */
export interface UttoriWikiDocumentExtended extends UttoriWikiDocument, UttoriWikiDocumentExtensions {}

/** Static plugin contract accepted by the wiki plugins array. Only register is invoked directly. */
export interface UttoriWikiPlugin {
  /** The config key the plugin will search for in the larger config object. */
  configKey: string
  /** Optional defaults helper; register is responsible for applying these values. */
  defaultConfig?(): object;
  /** Validates the config. */
  validateConfig?(config: Record<string, object>, _context: UttoriContext): void;
  /** Sets up any hooks the plugin needs. */
  register(context: UttoriContext): void | Promise<void>;
  /** If the plugin has routes to bind, this function will be called with the Express app and the context. */
  bindRoutes?(app: Express, context: UttoriContext): void;
}

/** SQL comparison and logical operator names. */
export type SqlWhereParserOperator =
  | '='
  | '!='
  | '<='
  | '<'
  | '>='
  | '>'
  | 'LIKE'
  | 'IN'
  | 'NOT_IN'
  | 'INCLUDES'
  | 'EXCLUDES'
  | 'IS_NULL'
  | 'IS_NOT_NULL'
  | 'BETWEEN'
  | 'AND'
  | 'OR';

/** SQL comparison and logical operator names. */
export type Operator = SqlWhereParserOperator;

/** Primitive leaf values in a WHERE parser AST. */
export type ParserPrimitive = boolean | string | number | symbol | null | undefined;

/** Operand in a WHERE parser AST node. */
export type ParserOperand = ParserPrimitive | SqlWhereParserAst | ParserOperand[];

/** Value attached to an AST operator key. */
export type Value = ParserOperand | ParserOperand[];

/** Parsed WHERE clause abstract syntax tree. */
export interface SqlWhereParserAst {
  [key: string]: Value;
  [key: symbol]: Value;
}

/** Evaluates a parsed operator and its operands into an AST node. */
export type SqlWhereParserEvaluator = (
  operatorValue: number | string | symbol,
  operands: ParserOperand[],
) => ParserOperand;

/** Session values owned by the built-in flash and authentication plugins. */
declare module 'express-session' {
  interface SessionData {
    /** Plugins such as CSRF may store values under configurable session keys. */
    [key: string]: unknown;
    /** Flash messages are consumed on the next read. */
    wikiFlash?: Record<string, string[]>;
    /** Authenticated profile returned by the configured login validator. */
    profile?: Record<string, unknown> | null;
  }
}

/** Require only fields with defined defaults, preserving user-provided value types. */
export type ResolvedPluginConfig<Config, Defaults> = Config & Required<Pick<Config, {
  [Key in keyof Defaults & keyof Config]: undefined extends Defaults[Key] ? never : Key;
}[keyof Defaults & keyof Config]>>;

/** Defaults remain mutable using the declared config types, including initially empty arrays. */
export type DefaultPluginConfig<Config, DefaultKeys extends keyof Config> = Config & Required<Pick<Config, DefaultKeys>>;
