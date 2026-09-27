import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import { sanitizeCategoryPath } from './utilities/security.js';
import type {
  CategoryRoutesPluginConfig, CategoryDocument, CategoryBreadcrumb, FlattenedCategory, CategoryTreeNode,
  CategoryRoutesContext,
} from '../types/plugins/category-routes.js';

export type {
  CategoryRoutesPluginConfig, CategoryDocument, CategoryBreadcrumb, FlattenedCategory, CategoryTreeNode,
  CategoryRoutesContext, CategoryRoutesRequestHandler,
} from '../types/plugins/category-routes.js';

const debug = createDebug('Uttori.Plugin.CategoryRoutes');

/**
 * Category routes plugin for Uttori Wiki.
 * Provides category index and individual category pages functionality with hierarchy support.
 * @example <caption>Init CategoryRoutesPlugin</caption>
 * const categoryPlugin = new CategoryRoutesPlugin();
 */
class CategoryRoutesPlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>CategoryRoutesPlugin.configKey</caption>
   * const config = { ...CategoryRoutesPlugin.defaultConfig(), ...context.config[CategoryRoutesPlugin.configKey] };
   */
  static get configKey(): 'uttori-plugin-category-routes' {
    return 'uttori-plugin-category-routes';
  }

  /**
   * The keys that are allowed to be set on a document.
   * @returns The allowed document keys.
   */
  static get allowedDocumentKeys(): string[] {
    return [
      'categories',
    ];
  }

  /**
   * Normalize a storage row category field into an array of category names.
   * @param document The storage row.
   * @param categoryField The field containing categories.
   * @returns The category names.
   */
  static getDocumentCategories(document: Record<string, string | string[]>, categoryField: string): string[] {
    const categories = document[categoryField];
    if (Array.isArray(categories)) {
      return categories;
    }
    return categories ? [categories] : [];
  }

  /**
   * The default configuration for the plugin.
   * @returns The default configuration.
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<CategoryRoutesPluginConfig, 'title' | 'limit' | 'categoryIndexRoute' | 'categoryRoute' | 'apiRoute' | 'categoryField' | 'separator' | 'middleware' | 'events' | 'categoryIndexRequestHandler' | 'categoryRequestHandler' | 'apiRequestHandler'> {
    return {
      title: 'Categories',
      limit: 1024,
      categoryIndexRoute: 'categories',
      categoryRoute: 'categories',
      apiRoute: 'category-api',
      categoryField: 'categories',
      separator: '/',
      middleware: {
        categoryIndex: [],
        category: [],
        api: [],
      },
      events: {
        bindRoutes: ['bind-routes'],
        validateConfig: ['validate-config'],
      },
      categoryIndexRequestHandler: CategoryRoutesPlugin.categoryIndexRequestHandler,
      categoryRequestHandler: CategoryRoutesPlugin.categoryRequestHandler,
      apiRequestHandler: CategoryRoutesPlugin.categoryApiRequestHandler,
    };
  }

  /**
   * Create a config that is extended from the default config.
   * @param config The user provided configuration.
   * @returns The new configration.
   */
  static extendConfig(config: CategoryRoutesPluginConfig = CategoryRoutesPlugin.defaultConfig()) {

    const base: CategoryRoutesPluginConfig = CategoryRoutesPlugin.defaultConfig();
    return {
      ...base,
      ...config,
      events: {
        ...base.events,
        ...config?.events,
      },
      middleware: {
        ...base.middleware,
        ...config?.middleware,
      },
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param config A configuration object.
   * @param _context - A Uttori-like context (unused).
   * @example <caption>CategoryRoutesPlugin.validateConfig(config, _context)</caption>
   * CategoryRoutesPlugin.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, CategoryRoutesPluginConfig>, _context: unknown) {
    debug('Validating config...');
    if (!config[CategoryRoutesPlugin.configKey]) {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}' configuration key is missing.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}' configuration key is missing.`);
    }

    const categoryConfig = CategoryRoutesPlugin.extendConfig(config[CategoryRoutesPlugin.configKey]);

    if (!categoryConfig.categoryIndexRoute || typeof categoryConfig.categoryIndexRoute !== 'string') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryIndexRoute' is missing or not a string.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryIndexRoute' is missing or not a string.`);
    }
    if (!categoryConfig.categoryRoute || typeof categoryConfig.categoryRoute !== 'string') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryRoute' is missing or not a string.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryRoute' is missing or not a string.`);
    }
    if (!categoryConfig.apiRoute || typeof categoryConfig.apiRoute !== 'string') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.apiRoute' is missing or not a string.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.apiRoute' is missing or not a string.`);
    }
    if (!categoryConfig.title || typeof categoryConfig.title !== 'string') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.title' is missing or not a string.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.title' is missing or not a string.`);
    }
    if (!categoryConfig.categoryField || typeof categoryConfig.categoryField !== 'string') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryField' is missing or not a string.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryField' is missing or not a string.`);
    }
    if (!categoryConfig.separator || typeof categoryConfig.separator !== 'string') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.separator' is missing or not a string.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.separator' is missing or not a string.`);
    }
    if (typeof categoryConfig.limit !== 'number') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.limit' is missing or not a number.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.limit' is missing or not a number.`);
    }
    if (typeof categoryConfig.middleware !== 'object') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware' is missing or not an object.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware' is missing or not an object.`);
    }
    // if (typeof categoryConfig.middleware.categoryIndex !== 'function') {
    // debug(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.categoryIndex' is missing or not a function.`);
    // throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.categoryIndex' is missing or not a function.`);
    // }
    // if (typeof categoryConfig.middleware.category !== 'function') {
    // debug(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.category' is missing or not a function.`);
    // throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.category' is missing or not a function.`);
    // }
    // if (typeof categoryConfig.middleware.api !== 'function') {
    // debug(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.api' is missing or not a function.`);
    // throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.api' is missing or not a function.`);
    // }
    if (typeof categoryConfig.categoryIndexRequestHandler !== 'function') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryIndexRequestHandler' is missing or not a function.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryIndexRequestHandler' is missing or not a function.`);
    }
    if (typeof categoryConfig.categoryRequestHandler !== 'function') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryRequestHandler' is missing or not a function.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.categoryRequestHandler' is missing or not a function.`);
    }
    if (typeof categoryConfig.apiRequestHandler !== 'function') {
      debug(`Config Error: '${CategoryRoutesPlugin.configKey}.apiRequestHandler' is missing or not a function.`);
      throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.apiRequestHandler' is missing or not a function.`);
    }

    debug('Validated config.');
  }

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
  static register(context: CategoryRoutesContext) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

    // Bind events
    const pluginMethods = CategoryRoutesPlugin;
    for (const [method, events] of Object.entries(config.events ?? {})) {
      const pluginMethodsMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(pluginMethods, method);
      if (pluginMethodsMethod) {
        for (const event of events) {
          const callback = pluginMethodsMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

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
  static bindRoutes(server: import('express').Application, context: CategoryRoutesContext) {
    debug('bindRoutes');

    const {
      categoryRoute = 'categories',
      categoryIndexRoute = 'categories',
      apiRoute = 'category-api',
      middleware = {},
      categoryIndexRequestHandler = CategoryRoutesPlugin.categoryIndexRequestHandler,
      categoryRequestHandler = CategoryRoutesPlugin.categoryRequestHandler,
      apiRequestHandler = CategoryRoutesPlugin.categoryApiRequestHandler,
    }: CategoryRoutesPluginConfig = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);
    const routeMiddleware = {
      categoryIndex: [],
      category: [],
      api: [],
      ...middleware,
    };
    debug('bindRoutes:', { categoryRoute, categoryIndexRoute, apiRoute });

    server.get(`/${categoryIndexRoute}`, ...routeMiddleware.categoryIndex, categoryIndexRequestHandler(context));
    server.get(`/${categoryRoute}/*categoryPath`, ...routeMiddleware.category, categoryRequestHandler(context));
    server.get(`/${apiRoute}`, ...routeMiddleware.api, apiRequestHandler(context));
  }

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
  static async getCategorizedDocuments(context: CategoryRoutesContext, category: string): Promise<CategoryDocument[]> {
    debug('getCategorizedDocuments:', category);

    const { limit, categoryField } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

    let results: CategoryDocument[] = [];
    try {
      const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
      const query = `SELECT * FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND ${categoryField} INCLUDES "${category}" ORDER BY title ASC LIMIT ${limit}`;
      [results] = await context.hooks.fetch('storage-query', query, context);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('getCategorizedDocuments Error:', error);
    }
    return results.filter(Boolean);
  }

  /**
   * Builds a hierarchical category tree from flat category paths.
   * @param categories Array of category paths (e.g., ['parent/child', 'parent/other'])
   * @param separator The separator used in hierarchical categories
   * @returns Hierarchical category tree
   */
  static buildCategoryTree(categories: string[], separator = '/'): Record<string, CategoryTreeNode> {

    const tree: Record<string, CategoryTreeNode> = {};

    for (const category of categories) {
      const parts = category.split(separator);
      let current = tree;

      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {
            name: part,
            fullPath: parts.slice(0, i + 1).join(separator),
            children: {},
            documents: [],
          };
        }
        current = current[part].children;
      }
    }

    return tree;
  }

  /**
   * Flattens a hierarchical category tree into a sorted array.
   * @param tree The category tree
   * @param separator The separator used in hierarchical categories
   * @returns Flattened category array
   */
  static flattenCategoryTree(tree: Record<string, CategoryTreeNode>, separator = '/', level = 0): FlattenedCategory[] {

    const result: FlattenedCategory[] = [];
    for (const [name, category] of Object.entries(tree)) {
      result.push({
        name: category.name || name,
        fullPath: category.fullPath,
        level: level,
      });
      if (Object.keys(category.children).length > 0) {
        result.push(...CategoryRoutesPlugin.flattenCategoryTree(category.children, separator, level + 1));
      }
    }
    return result.sort((a, b) => a.fullPath.localeCompare(b.fullPath));
  }

  /**
   * Renders the category index page with the `categories` template.
   * Hooks:
   * - `filter` - `view-model-category-index` - Passes in the viewModel.
   * @param context A Uttori-like context.
   * @returns The function to pass to Express.
   */
  static categoryIndexRequestHandler (context: CategoryRoutesContext): import('express').RequestHandler {
    return async (request, response, _next) => {
      debug('categoryIndexRequestHandler');

      const { categoryField = 'categories', separator = '/' } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

      const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
      const ignoreCategories = `"${context.config.ignoreCategories?.join('", "') || ''}"`;
      const query = `SELECT ${categoryField} FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND ${categoryField} EXCLUDES (${ignoreCategories}) ORDER BY updateDate DESC LIMIT -1`;

      let categories: string[] = [];
      try {
        // Fetch all the used categories.

        const [results]: (Record<string, string | string[]>)[][] = await context.hooks.fetch('storage-query', query, context);
        // Organize and deduplicate, and sort the categories.

        const flatCategories: string[] = results.flatMap((doc) => CategoryRoutesPlugin.getDocumentCategories(doc, categoryField));
        categories = [...new Set(flatCategories)].filter(Boolean).sort((a, b) => a.localeCompare(b));
      /* c8 ignore next 3 */
      } catch (error) {
        debug('Error fetching categories:', error);
      }

      // Build hierarchical category tree

      const categoryTree: Record<string, CategoryTreeNode> = CategoryRoutesPlugin.buildCategoryTree(categories, separator);

      const flattenedCategories: FlattenedCategory[] = CategoryRoutesPlugin.flattenCategoryTree(categoryTree, separator);

      // Collect & sort all the categorized documents for each category.

      const categorizedDocuments: Record<string, CategoryDocument[]> = {};
      await Promise.all(categories.map(async (category) => {
        const sorted = await CategoryRoutesPlugin.getCategorizedDocuments(context, category);
        categorizedDocuments[category] = sorted.sort((a, b) => a.title.localeCompare(b.title));
      }));

      const meta = await context.buildMetadata({}, `/${context.config[CategoryRoutesPlugin.configKey].categoryIndexRoute}`);

      let viewModel: import('../wiki.js').UttoriWikiViewModel = {
        title: context.config[CategoryRoutesPlugin.configKey].title,
        config: context.config,
        session: request.session,
        categorizedDocuments,
        categoryTree,
        flattenedCategories,
        meta,
        basePath: request.baseUrl,
        flash: request.wikiFlash(),
      };
      viewModel = await context.hooks.filter('view-model-category-index', viewModel, context);
      if (context.config.useCache) {
        response.set('Cache-control', `public, max-age=${context.config.cacheShort}`);
      }
      response.render('categories', viewModel);
    };
  }

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
  static categoryRequestHandler (context: CategoryRoutesContext): import('express').RequestHandler {
    return async (request, response, next) => {
      debug('categoryRequestHandler');

      const { separator = '/' } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

      // Get the category path from the wildcard route
      let categoryPath = String(request.params.categoryPath || '').trim();
      if (!categoryPath) {
        debug('No category path provided!');
        next();
        return;
      }

      // Sanitize category path to prevent path traversal and other attacks
      categoryPath = sanitizeCategoryPath(categoryPath, separator);

      if (!categoryPath) {
        debug('Invalid category path after sanitization!');
        next();
        return;
      }

      const categorizedDocuments = await CategoryRoutesPlugin.getCategorizedDocuments(context, categoryPath);
      if (categorizedDocuments.length === 0) {
        debug('No documents for category!');
        next();
        return;
      }

      const meta = await context.buildMetadata({}, `/${context.config[CategoryRoutesPlugin.configKey].categoryRoute}/${categoryPath}`);
      const title = `${categoryPath} Categorized Documents`;

      // Build breadcrumb navigation

      const breadcrumbs: CategoryBreadcrumb[] = [];
      const pathParts = categoryPath.split(separator);
      let currentPath = '';
      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}${separator}${part}` : part;
        breadcrumbs.push({
          name: part,
          path: currentPath,
          isLast: currentPath === categoryPath,
        });
      }

      let viewModel: import('../wiki.js').UttoriWikiViewModel = {
        title,
        config: context.config,
        session: request.session,
        categorizedDocuments,
        categoryPath,
        breadcrumbs,
        meta,
        basePath: request.baseUrl,
        flash: request.wikiFlash(),
      };
      viewModel = await context.hooks.filter('view-model-category', viewModel, context);
      if (context.config.useCache) {
        response.set('Cache-control', `public, max-age=${context.config.cacheShort}`);
      }
      response.render('category', viewModel);
    };
  }

  /**
   * Returns all available categories from documents.
   * This is used for auto-completion and category listing.
   * @param context A Uttori-like context.
   * @returns Promise object that resolves to the array of all categories.
   */
  static async getAllCategories(context: CategoryRoutesContext): Promise<string[]> {
    debug('getAllCategories');

    const { categoryField = 'categories' } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

    const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
    const ignoreCategories = `"${context.config.ignoreCategories?.join('", "') || ''}"`;
    const query = `SELECT ${categoryField} FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND ${categoryField} EXCLUDES (${ignoreCategories}) ORDER BY updateDate DESC LIMIT -1`;

    let categories: string[] = [];
    try {
      // Fetch all the used categories.

      const [results]: (Record<string, string | string[]>)[][] = await context.hooks.fetch('storage-query', query, context);
      // Organize and deduplicate, and sort the categories.

      const flatCategories: string[] = results.flatMap((doc) => CategoryRoutesPlugin.getDocumentCategories(doc, categoryField));
      categories = [...new Set(flatCategories)].filter(Boolean).sort((a, b) => a.localeCompare(b));
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching categories:', error);
    }

    return categories;
  }

  /**
   * Renders the category API that returns all available categories.
   * @param context A Uttori-like context.
   * @returns The function to pass to Express.
   */
  static categoryApiRequestHandler (context: CategoryRoutesContext): import('express').RequestHandler {
    return async (request, response, _next) => {
      debug('categoryApiRequestHandler');

      try {
        const categories = await CategoryRoutesPlugin.getAllCategories(context);
        response.json(categories);
      } catch (error) {
        debug('Error in categoryApiRequestHandler:', error);
        response.status(500).json({ error: 'Failed to fetch categories' });
      }
    };
  }
}

export default CategoryRoutesPlugin;
