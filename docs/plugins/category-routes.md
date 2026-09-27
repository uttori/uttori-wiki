<a name="CategoryRoutesPlugin"></a>

## CategoryRoutesPlugin
Category routes plugin for Uttori Wiki.
Provides category index and individual category pages functionality with hierarchy support.

**Kind**: global class\

* [CategoryRoutesPlugin](#CategoryRoutesPlugin)
    * [new CategoryRoutesPlugin()](#new_CategoryRoutesPlugin_new)
    * [.configKey](#CategoryRoutesPlugin.configKey) ⇒
    * [.allowedDocumentKeys](#CategoryRoutesPlugin.allowedDocumentKeys) ⇒
    * [.getDocumentCategories(document, categoryField)](#CategoryRoutesPlugin.getDocumentCategories) ⇒
    * [.defaultConfig()](#CategoryRoutesPlugin.defaultConfig) ⇒
    * [.extendConfig(config)](#CategoryRoutesPlugin.extendConfig) ⇒
    * [.validateConfig(config, _context)](#CategoryRoutesPlugin.validateConfig)
    * [.register(context)](#CategoryRoutesPlugin.register)
    * [.bindRoutes(server, context)](#CategoryRoutesPlugin.bindRoutes)
    * [.getCategorizedDocuments(context, category)](#CategoryRoutesPlugin.getCategorizedDocuments) ⇒
    * [.buildCategoryTree(categories, separator)](#CategoryRoutesPlugin.buildCategoryTree) ⇒
    * [.flattenCategoryTree(tree, separator)](#CategoryRoutesPlugin.flattenCategoryTree) ⇒
    * [.categoryIndexRequestHandler(context)](#CategoryRoutesPlugin.categoryIndexRequestHandler) ⇒
    * [.categoryRequestHandler(context)](#CategoryRoutesPlugin.categoryRequestHandler) ⇒
    * [.getAllCategories(context)](#CategoryRoutesPlugin.getAllCategories) ⇒
    * [.categoryApiRequestHandler(context)](#CategoryRoutesPlugin.categoryApiRequestHandler) ⇒

<a name="new_CategoryRoutesPlugin_new"></a>

### new CategoryRoutesPlugin()
**Example** *(Init CategoryRoutesPlugin)*\
```js
const categoryPlugin = new CategoryRoutesPlugin();
```
<a name="CategoryRoutesPlugin.configKey"></a>

### CategoryRoutesPlugin.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: The configuration key.\
**Example** *(CategoryRoutesPlugin.configKey)*\
```js
const config = { ...CategoryRoutesPlugin.defaultConfig(), ...context.config[CategoryRoutesPlugin.configKey] };
```
<a name="CategoryRoutesPlugin.allowedDocumentKeys"></a>

### CategoryRoutesPlugin.allowedDocumentKeys ⇒
The keys that are allowed to be set on a document.

**Kind**: static property of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: The allowed document keys.\
<a name="CategoryRoutesPlugin.getDocumentCategories"></a>

### CategoryRoutesPlugin.getDocumentCategories(document, categoryField) ⇒
Normalize a storage row category field into an array of category names.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: The category names.\

| Param | Description |
| --- | --- |
| document | The storage row. |
| categoryField | The field containing categories. |

<a name="CategoryRoutesPlugin.defaultConfig"></a>

### CategoryRoutesPlugin.defaultConfig() ⇒
The default configuration for the plugin.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: The default configuration.\
<a name="CategoryRoutesPlugin.extendConfig"></a>

### CategoryRoutesPlugin.extendConfig(config) ⇒
Create a config that is extended from the default config.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: The new configration.\

| Param | Description |
| --- | --- |
| config | The user provided configuration. |

<a name="CategoryRoutesPlugin.validateConfig"></a>

### CategoryRoutesPlugin.validateConfig(config, _context)
Validates the provided configuration for required entries.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\

| Param | Description |
| --- | --- |
| config | A configuration object. |
| _context | A Uttori-like context (unused). |

**Example** *(CategoryRoutesPlugin.validateConfig(config, _context))*\
```js
CategoryRoutesPlugin.validateConfig({ ... });
```
<a name="CategoryRoutesPlugin.register"></a>

### CategoryRoutesPlugin.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example** *(CategoryRoutesPlugin.register(context))*\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [CategoryRoutesPlugin.configKey]: {
      ...,
    },
  },
};
CategoryRoutesPlugin.register(context);
```
<a name="CategoryRoutesPlugin.bindRoutes"></a>

### CategoryRoutesPlugin.bindRoutes(server, context)
Wrapper function for binding category routes.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\

| Param | Description |
| --- | --- |
| server | An Express server instance. |
| context | A Uttori-like context. |

**Example** *(CategoryRoutesPlugin.bindRoutes(plugin))*\
```js
const context = {
  config: {
    [CategoryRoutesPlugin.configKey]: {
      ...,
    },
  },
};
CategoryRoutesPlugin.bindRoutes(plugin);
```
<a name="CategoryRoutesPlugin.getCategorizedDocuments"></a>

### CategoryRoutesPlugin.getCategorizedDocuments(context, category) ⇒
Returns the documents with the provided category, up to the provided limit.
This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
Hooks:
- `fetch` - `storage-query` - Searched for the categorized documents.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: Promise object that resolves to the array of the documents.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |
| category | The category to look for in documents. |

**Example**\
```js
CategoryRoutesPlugin.getCategorizedDocuments('example', 10);
➜ [{ slug: 'example', title: 'Example', content: 'Example content.', categories: ['example'] }]
```
<a name="CategoryRoutesPlugin.buildCategoryTree"></a>

### CategoryRoutesPlugin.buildCategoryTree(categories, separator) ⇒
Builds a hierarchical category tree from flat category paths.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: Hierarchical category tree\

| Param | Default | Description |
| --- | --- | --- |
| categories |  | Array of category paths (e.g., ['parent/child', 'parent/other']) |
| separator | <code>/</code> | The separator used in hierarchical categories |

<a name="CategoryRoutesPlugin.flattenCategoryTree"></a>

### CategoryRoutesPlugin.flattenCategoryTree(tree, separator) ⇒
Flattens a hierarchical category tree into a sorted array.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: Flattened category array\

| Param | Default | Description |
| --- | --- | --- |
| tree |  | The category tree |
| separator | <code>/</code> | The separator used in hierarchical categories |

<a name="CategoryRoutesPlugin.categoryIndexRequestHandler"></a>

### CategoryRoutesPlugin.categoryIndexRequestHandler(context) ⇒
Renders the category index page with the `categories` template.
Hooks:
- `filter` - `view-model-category-index` - Passes in the viewModel.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="CategoryRoutesPlugin.categoryRequestHandler"></a>

### CategoryRoutesPlugin.categoryRequestHandler(context) ⇒
Renders the category detail page with `category` template.
Sets the `X-Robots-Tag` header to `noindex`.
Attempts to pull in the relevant site section for the category if defined in the config site sections.

Hooks:
- `filter` - `view-model-category` - Passes in the viewModel.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="CategoryRoutesPlugin.getAllCategories"></a>

### CategoryRoutesPlugin.getAllCategories(context) ⇒
Returns all available categories from documents.
This is used for auto-completion and category listing.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: Promise object that resolves to the array of all categories.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

<a name="CategoryRoutesPlugin.categoryApiRequestHandler"></a>

### CategoryRoutesPlugin.categoryApiRequestHandler(context) ⇒
Renders the category API that returns all available categories.

**Kind**: static method of [<code>CategoryRoutesPlugin</code>](#CategoryRoutesPlugin)\
**Returns**: The function to pass to Express.\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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
```

</details>
