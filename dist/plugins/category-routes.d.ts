import type { CategoryRoutesPluginConfig, CategoryDocument, FlattenedCategory, CategoryTreeNode, CategoryRoutesContext } from '../types/plugins/category-routes.js';
export type { CategoryRoutesPluginConfig, CategoryDocument, CategoryBreadcrumb, FlattenedCategory, CategoryTreeNode, CategoryRoutesContext, CategoryRoutesRequestHandler, } from '../types/plugins/category-routes.js';
/**
 * Category routes plugin for Uttori Wiki.
 * Provides category index and individual category pages functionality with hierarchy support.
 * @example <caption>Init CategoryRoutesPlugin</caption>
 * const categoryPlugin = new CategoryRoutesPlugin();
 */
declare class CategoryRoutesPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>CategoryRoutesPlugin.configKey</caption>
     * const config = { ...CategoryRoutesPlugin.defaultConfig(), ...context.config[CategoryRoutesPlugin.configKey] };
     */
    static get configKey(): 'uttori-plugin-category-routes';
    /**
     * The keys that are allowed to be set on a document.
     * @returns The allowed document keys.
     */
    static get allowedDocumentKeys(): string[];
    /**
     * Normalize a storage row category field into an array of category names.
     * @param document The storage row.
     * @param categoryField The field containing categories.
     * @returns The category names.
     */
    static getDocumentCategories(document: Record<string, string | string[]>, categoryField: string): string[];
    /**
     * The default configuration for the plugin.
     * @returns The default configuration.
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<CategoryRoutesPluginConfig, 'title' | 'limit' | 'categoryIndexRoute' | 'categoryRoute' | 'apiRoute' | 'categoryField' | 'separator' | 'middleware' | 'events' | 'categoryIndexRequestHandler' | 'categoryRequestHandler' | 'apiRequestHandler'>;
    /**
     * Create a config that is extended from the default config.
     * @param config The user provided configuration.
     * @returns The new configration.
     */
    static extendConfig(config?: CategoryRoutesPluginConfig): {
        title?: string;
        limit?: number;
        categoryIndexRoute?: string;
        categoryRoute?: string;
        apiRoute?: string;
        categoryIndexRequestHandler?: import("../types/plugins/category-routes.js").CategoryRoutesRequestHandler;
        categoryRequestHandler?: import("../types/plugins/category-routes.js").CategoryRoutesRequestHandler;
        apiRequestHandler?: import("../types/plugins/category-routes.js").CategoryRoutesRequestHandler;
        categoryField?: string;
        separator?: string;
        events: {
            [x: string]: string[];
        };
        middleware: {
            [x: string]: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
        };
    };
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context - A Uttori-like context (unused).
     * @example <caption>CategoryRoutesPlugin.validateConfig(config, _context)</caption>
     * CategoryRoutesPlugin.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, CategoryRoutesPluginConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
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
     */
    static register(context: CategoryRoutesContext): void;
    /**
     * Wrapper function for binding category routes.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>CategoryRoutesPlugin.bindRoutes(plugin)</caption>
     * const context = {
     *   config: {
     *     [CategoryRoutesPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * CategoryRoutesPlugin.bindRoutes(plugin);
     */
    static bindRoutes(server: import('express').Application, context: CategoryRoutesContext): void;
    /**
     * Returns the documents with the provided category, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
     * Hooks:
     * - `fetch` - `storage-query` - Searched for the categorized documents.
     * @async
     * @param context A Uttori-like context.
     * @param category The category to look for in documents.
     * @returns Promise object that resolves to the array of the documents.
     * @example
     * CategoryRoutesPlugin.getCategorizedDocuments('example', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', categories: ['example'] }]
     */
    static getCategorizedDocuments(context: CategoryRoutesContext, category: string): Promise<CategoryDocument[]>;
    /**
     * Builds a hierarchical category tree from flat category paths.
     * @param categories Array of category paths (e.g., ['parent/child', 'parent/other'])
     * @param separator The separator used in hierarchical categories
     * @returns Hierarchical category tree
     */
    static buildCategoryTree(categories: string[], separator?: string): Record<string, CategoryTreeNode>;
    /**
     * Flattens a hierarchical category tree into a sorted array.
     * @param tree The category tree
     * @param separator The separator used in hierarchical categories
     * @returns Flattened category array
     */
    static flattenCategoryTree(tree: Record<string, CategoryTreeNode>, separator?: string, level?: number): FlattenedCategory[];
    /**
     * Renders the category index page with the `categories` template.
     * Hooks:
     * - `filter` - `view-model-category-index` - Passes in the viewModel.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static categoryIndexRequestHandler(context: CategoryRoutesContext): import('express').RequestHandler;
    /**
     * Renders the category detail page with `category` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     * Attempts to pull in the relevant site section for the category if defined in the config site sections.
     *
     * Hooks:
     * - `filter` - `view-model-category` - Passes in the viewModel.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static categoryRequestHandler(context: CategoryRoutesContext): import('express').RequestHandler;
    /**
     * Returns all available categories from documents.
     * This is used for auto-completion and category listing.
     * @param context A Uttori-like context.
     * @returns Promise object that resolves to the array of all categories.
     */
    static getAllCategories(context: CategoryRoutesContext): Promise<string[]>;
    /**
     * Renders the category API that returns all available categories.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static categoryApiRequestHandler(context: CategoryRoutesContext): import('express').RequestHandler;
}
export default CategoryRoutesPlugin;
//# sourceMappingURL=category-routes.d.ts.map