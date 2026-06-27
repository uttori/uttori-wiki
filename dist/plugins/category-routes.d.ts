export default CategoryRoutesPlugin;
export type CategoryRoutesPluginConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]> | undefined;
    /**
     * The default title for category pages.
     */
    title?: string | undefined;
    /**
     * The maximum number of documents to return for a category.
     */
    limit?: number | undefined;
    /**
     * Middleware for category routes.
     */
    middleware?: Record<string, import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[]> | undefined;
    /**
     * A replacement route for the category index route.
     */
    categoryIndexRoute?: string | undefined;
    /**
     * A replacement route for the category show route.
     */
    categoryRoute?: string | undefined;
    /**
     * A replacement route for the category index route.
     */
    apiRoute?: string | undefined;
    /**
     * A replacement route handler for the category index route.
     */
    categoryIndexRequestHandler?: CategoryRoutesRequestHandler | undefined;
    /**
     * A replacement route handler for the category show route.
     */
    categoryRequestHandler?: CategoryRoutesRequestHandler | undefined;
    /**
     * A request handler for the API route that returns all available categories.
     */
    apiRequestHandler?: CategoryRoutesRequestHandler | undefined;
    /**
     * The document field to use for categories (default: 'categories').
     */
    categoryField?: string | undefined;
    /**
     * The separator used in hierarchical categories (default: '/').
     */
    separator?: string | undefined;
};
export type CategoryDocument = import("../wiki.js").UttoriWikiDocument;
export type CategoryBreadcrumb = {
    /**
     * The name of the breadcrumb.
     */
    name: string;
    /**
     * The path to the breadcrumb.
     */
    path: string;
    /**
     * Whether the breadcrumb is the last in the chain.
     */
    isLast: boolean;
};
export type FlattenedCategory = {
    /**
     * The name of the category.
     */
    name: string;
    /**
     * The full path of the category.
     */
    fullPath: string;
    /**
     * The nesting level of the category.
     */
    level: number;
};
export type CategoryTreeNode = {
    /**
     * The name of the category.
     */
    name: string;
    /**
     * The full path of the category.
     */
    fullPath: string;
    /**
     * The child categories.
     */
    children: Record<string, CategoryTreeNode>;
    /**
     * The documents in the category.
     */
    documents: CategoryDocument[];
};
/**
 * Uttori context narrowed to this plugin's config shape.
 */
export type CategoryRoutesContext = import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-category-routes", CategoryRoutesPluginConfig>;
/**
 * Builds an Express handler for a category route.
 */
export type CategoryRoutesRequestHandler = (context: CategoryRoutesContext) => import("express").RequestHandler;
/**
 * @typedef {object} CategoryRoutesPluginConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [title] The default title for category pages.
 * @property {number} [limit] The maximum number of documents to return for a category.
 * @property {Record<string, import("express").RequestHandler[]>} [middleware] Middleware for category routes.
 * @property {string} [categoryIndexRoute] A replacement route for the category index route.
 * @property {string} [categoryRoute] A replacement route for the category show route.
 * @property {string} [apiRoute] A replacement route for the category index route.
 * @property {CategoryRoutesRequestHandler} [categoryIndexRequestHandler] A replacement route handler for the category index route.
 * @property {CategoryRoutesRequestHandler} [categoryRequestHandler] A replacement route handler for the category show route.
 * @property {CategoryRoutesRequestHandler} [apiRequestHandler] A request handler for the API route that returns all available categories.
 * @property {string} [categoryField] The document field to use for categories (default: 'categories').
 * @property {string} [separator] The separator used in hierarchical categories (default: '/').
 */
/**
 * @typedef {import('../wiki.js').UttoriWikiDocument} CategoryDocument
 */
/**
 * @typedef {object} CategoryBreadcrumb
 * @property {string} name The name of the breadcrumb.
 * @property {string} path The path to the breadcrumb.
 * @property {boolean} isLast Whether the breadcrumb is the last in the chain.
 */
/**
 * @typedef {object} FlattenedCategory
 * @property {string} name The name of the category.
 * @property {string} fullPath The full path of the category.
 * @property {number} level The nesting level of the category.
 */
/**
 * @typedef {object} CategoryTreeNode
 * @property {string} name The name of the category.
 * @property {string} fullPath The full path of the category.
 * @property {Record<string, CategoryTreeNode>} children The child categories.
 * @property {CategoryDocument[]} documents The documents in the category.
 */
/**
 * Uttori context narrowed to this plugin's config shape.
 * @typedef {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} CategoryRoutesContext
 */
/**
 * Builds an Express handler for a category route.
 * @callback CategoryRoutesRequestHandler
 * @param {CategoryRoutesContext} context A Uttori-like context.
 * @returns {import('express').RequestHandler} The Express request handler.
 */
/**
 * Category routes plugin for Uttori Wiki.
 * Provides category index and individual category pages functionality with hierarchy support.
 * @property {CategoryRoutesPluginConfig} config The configuration object.
 * @example <caption>Init CategoryRoutesPlugin</caption>
 * const categoryPlugin = new CategoryRoutesPlugin();
 * @class
 */
declare class CategoryRoutesPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>CategoryRoutesPlugin.configKey</caption>
     * const config = { ...CategoryRoutesPlugin.defaultConfig(), ...context.config[CategoryRoutesPlugin.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The keys that are allowed to be set on a document.
     * @returns {string[]} The allowed document keys.
     * @static
     */
    static get allowedDocumentKeys(): string[];
    /**
     * Normalize a storage row category field into an array of category names.
     * @param {Record<string, string | string[]>} document The storage row.
     * @param {string} categoryField The field containing categories.
     * @returns {string[]} The category names.
     * @static
     */
    static getDocumentCategories(document: Record<string, string | string[]>, categoryField: string): string[];
    /**
     * The default configuration for the plugin.
     * @returns {CategoryRoutesPluginConfig} The default configuration.
     * @static
     */
    static defaultConfig(): CategoryRoutesPluginConfig;
    /**
     * Create a config that is extended from the default config.
     * @param {CategoryRoutesPluginConfig} config The user provided configuration.
     * @returns {CategoryRoutesPluginConfig} The new configration.
     */
    static extendConfig(config?: CategoryRoutesPluginConfig): CategoryRoutesPluginConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, CategoryRoutesPluginConfig>} config A configuration object.
     * @param {CategoryRoutesContext} _context - A Uttori-like context (unused).
     * @example <caption>CategoryRoutesPlugin.validateConfig(config, _context)</caption>
     * CategoryRoutesPlugin.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, CategoryRoutesPluginConfig>, _context: CategoryRoutesContext): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {CategoryRoutesContext} context A Uttori-like context.
     * @example <caption>CategoryRoutesPlugin.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [CategoryRoutesPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * CategoryRoutesPlugin.register(context);
     * @static
     */
    static register(context: CategoryRoutesContext): void;
    /**
     * Wrapper function for binding category routes.
     * @param {import('express').Application} server An Express server instance.
     * @param {CategoryRoutesContext} context A Uttori-like context.
     * @example <caption>CategoryRoutesPlugin.bindRoutes(plugin)</caption>
     * const context = {
     *   config: {
     *     [CategoryRoutesPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * CategoryRoutesPlugin.bindRoutes(plugin);
     * @static
     */
    static bindRoutes(server: import("express").Application, context: CategoryRoutesContext): void;
    /**
     * Returns the documents with the provided category, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
     * Hooks:
     * - `fetch` - `storage-query` - Searched for the categorized documents.
     * @async
     * @param {CategoryRoutesContext} context A Uttori-like context.
     * @param {string} category The category to look for in documents.
     * @returns {Promise<CategoryDocument[]>} Promise object that resolves to the array of the documents.
     * @example
     * CategoryRoutesPlugin.getCategorizedDocuments('example', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', categories: ['example'] }]
     */
    static getCategorizedDocuments(context: CategoryRoutesContext, category: string): Promise<CategoryDocument[]>;
    /**
     * Builds a hierarchical category tree from flat category paths.
     * @param {string[]} categories Array of category paths (e.g., ['parent/child', 'parent/other'])
     * @param {string} separator The separator used in hierarchical categories
     * @returns {Record<string, CategoryTreeNode>} Hierarchical category tree
     * @static
     */
    static buildCategoryTree(categories: string[], separator?: string): Record<string, CategoryTreeNode>;
    /**
     * Flattens a hierarchical category tree into a sorted array.
     * @param {Record<string, CategoryTreeNode>} tree The category tree
     * @param {string} separator The separator used in hierarchical categories
     * @returns {FlattenedCategory[]} Flattened category array
     * @static
     */
    static flattenCategoryTree(tree: Record<string, CategoryTreeNode>, separator?: string, level?: number): FlattenedCategory[];
    /**
     * Renders the category index page with the `categories` template.
     * Hooks:
     * - `filter` - `view-model-category-index` - Passes in the viewModel.
     * @param {CategoryRoutesContext} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static categoryIndexRequestHandler(context: CategoryRoutesContext): import("express").RequestHandler;
    /**
     * Renders the category detail page with `category` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     * Attempts to pull in the relevant site section for the category if defined in the config site sections.
     *
     * Hooks:
     * - `filter` - `view-model-category` - Passes in the viewModel.
     * @param {CategoryRoutesContext} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static categoryRequestHandler(context: CategoryRoutesContext): import("express").RequestHandler;
    /**
     * Returns all available categories from documents.
     * This is used for auto-completion and category listing.
     * @param {CategoryRoutesContext} context A Uttori-like context.
     * @returns {Promise<string[]>} Promise object that resolves to the array of all categories.
     * @static
     */
    static getAllCategories(context: CategoryRoutesContext): Promise<string[]>;
    /**
     * Renders the category API that returns all available categories.
     * @param {CategoryRoutesContext} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static categoryApiRequestHandler(context: CategoryRoutesContext): import("express").RequestHandler;
}
//# sourceMappingURL=category-routes.d.ts.map