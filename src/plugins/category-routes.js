import { sanitizeCategoryPath } from './utilities/security.js';

let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.CategoryRoutes'); } catch {}

/**
 * @typedef {object} CategoryRoutesPluginConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [title] The default title for category pages.
 * @property {number} [limit] The maximum number of documents to return for a category.
 * @property {Record<string, import("express").RequestHandler[]>} [middleware] Middleware for category routes.
 * @property {string} [categoryIndexRoute] A replacement route for the category index route.
 * @property {string} [categoryRoute] A replacement route for the category show route.
 * @property {string} [apiRoute] A replacement route for the category index route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>): import('express').RequestHandler} [categoryIndexRequestHandler] A replacement route handler for the category index route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>): import('express').RequestHandler} [categoryRequestHandler] A replacement route handler for the category show route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>): import('express').RequestHandler} [apiRequestHandler] A request handler for the API route that returns all available categories.
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
 * Category routes plugin for Uttori Wiki.
 * Provides category index and individual category pages functionality with hierarchy support.
 * @property {CategoryRoutesPluginConfig} config The configuration object.
 * @example <caption>Init CategoryRoutesPlugin</caption>
 * const categoryPlugin = new CategoryRoutesPlugin();
 * @class
 */
class CategoryRoutesPlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>CategoryRoutesPlugin.configKey</caption>
   * const config = { ...CategoryRoutesPlugin.defaultConfig(), ...context.config[CategoryRoutesPlugin.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-category-routes';
  }

  /**
   * The keys that are allowed to be set on a document.
   * @returns {string[]} The allowed document keys.
   * @static
   */
  static get allowedDocumentKeys() {
    return [
      'categories',
    ];
  }

  /**
   * The default configuration for the plugin.
   * @returns {CategoryRoutesPluginConfig} The default configuration.
   * @static
   */
  static defaultConfig() {
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
   * @param {CategoryRoutesPluginConfig} config The user provided configuration.
   * @returns {CategoryRoutesPluginConfig} The new configration.
   */
  static extendConfig(config = CategoryRoutesPlugin.defaultConfig()) {
  /** @type {CategoryRoutesPluginConfig} */
    const base = CategoryRoutesPlugin.defaultConfig();
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
   * @param {Record<string, CategoryRoutesPluginConfig>} config A configuration object.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} _context - A Uttori-like context (unused).
   * @example <caption>CategoryRoutesPlugin.validateConfig(config, _context)</caption>
   * CategoryRoutesPlugin.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
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
    //   debug(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.categoryIndex' is missing or not a function.`);
    //   throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.categoryIndex' is missing or not a function.`);
    // }
    // if (typeof categoryConfig.middleware.category !== 'function') {
    //   debug(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.category' is missing or not a function.`);
    //   throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.category' is missing or not a function.`);
    // }
    // if (typeof categoryConfig.middleware.api !== 'function') {
    //   debug(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.api' is missing or not a function.`);
    //   throw new Error(`Config Error: '${CategoryRoutesPlugin.configKey}.middleware.api' is missing or not a function.`);
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
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} context A Uttori-like context.
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
  static register(context) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {CategoryRoutesPluginConfig} */
    const config = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

    // Bind events
    for (const [method, events] of Object.entries(config.events)) {
      if (typeof CategoryRoutesPlugin[method] === 'function') {
        for (const event of events) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = CategoryRoutesPlugin[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Wrapper function for binding category routes.
   * @param {import('express').Application} server An Express server instance.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} context A Uttori-like context.
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
  static bindRoutes(server, context) {
    debug('bindRoutes');
    /** @type {CategoryRoutesPluginConfig} */
    const { categoryRoute, categoryIndexRoute, apiRoute, middleware, categoryIndexRequestHandler, categoryRequestHandler, apiRequestHandler } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);
    debug('bindRoutes:', { categoryRoute, categoryIndexRoute, apiRoute });

    server.get(`/${categoryIndexRoute}`, ...middleware.categoryIndex, categoryIndexRequestHandler(context));
    server.get(`/${categoryRoute}/*categoryPath`, ...middleware.category, categoryRequestHandler(context));
    server.get(`/${apiRoute}`, ...middleware.api, apiRequestHandler(context));
  }

  /**
   * Returns the documents with the provided category, up to the provided limit.
   * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
   * Hooks:
   * - `fetch` - `storage-query` - Searched for the categorized documents.
   * @async
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} context A Uttori-like context.
   * @param {string} category The category to look for in documents.
   * @returns {Promise<CategoryDocument[]>} Promise object that resolves to the array of the documents.
   * @example
   * CategoryRoutesPlugin.getCategorizedDocuments('example', 10);
   * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', categories: ['example'] }]
   */
  static async getCategorizedDocuments(context, category) {
    debug('getCategorizedDocuments:', category);
    /** @type {CategoryRoutesPluginConfig} */
    const { limit, categoryField } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);
    /** @type {CategoryDocument[]} */
    let results = [];
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
   * @param {string[]} categories Array of category paths (e.g., ['parent/child', 'parent/other'])
   * @param {string} separator The separator used in hierarchical categories
   * @returns {Record<string, CategoryTreeNode>} Hierarchical category tree
   * @static
   */
  static buildCategoryTree(categories, separator = '/') {
    /** @type {Record<string, CategoryTreeNode>} */
    const tree = {};

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
   * @param {Record<string, CategoryTreeNode>} tree The category tree
   * @param {string} separator The separator used in hierarchical categories
   * @returns {FlattenedCategory[]} Flattened category array
   * @static
   */
  static flattenCategoryTree(tree, separator = '/', level = 0) {
    const result = [];
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
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @static
   */
  static categoryIndexRequestHandler (context) {
    return async (request, response, _next) => {
      debug('categoryIndexRequestHandler');

      /** @type {CategoryRoutesPluginConfig} */
      const { categoryField, separator } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

      const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
      const ignoreCategories = `"${context.config.ignoreCategories?.join('", "') || ''}"`;
      const query = `SELECT ${categoryField} FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND ${categoryField} EXCLUDES (${ignoreCategories}) ORDER BY updateDate DESC LIMIT -1`;
      /** @type {string[]} */
      let categories = [];
      try {
        // Fetch all the used categories.
        /** @type {Array<Array<Record<string, string | string[]>>>} */
        const [results] = await context.hooks.fetch('storage-query', query, context);
        // Organize and deduplicate, and sort the categories.
        /** @type {string[]} */
        const flatCategories = results.flatMap((doc) => doc?.[categoryField] ?? []);
        categories = [...new Set(flatCategories)].filter(Boolean).sort((a, b) => a.localeCompare(b));
      /* c8 ignore next 3 */
      } catch (error) {
        debug('Error fetching categories:', error);
      }

      // Build hierarchical category tree
      /** @type {Record<string, CategoryTreeNode>} */
      const categoryTree = CategoryRoutesPlugin.buildCategoryTree(categories, separator);
      /** @type {FlattenedCategory[]} */
      const flattenedCategories = CategoryRoutesPlugin.flattenCategoryTree(categoryTree, separator);

      // Collect & sort all the categorized documents for each category.
      /** @type {Record<string, CategoryDocument[]>} */
      const categorizedDocuments = {};
      await Promise.all(categories.map(async (category) => {
        const sorted = await CategoryRoutesPlugin.getCategorizedDocuments(context, category);
        categorizedDocuments[category] = sorted.sort((a, b) => a.title.localeCompare(b.title));
      }));

      const meta = await context.buildMetadata({}, `/${context.config[CategoryRoutesPlugin.configKey].categoryIndexRoute}`);

      /** @type {import('../wiki.js').UttoriWikiViewModel} */
      let viewModel = {
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
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @static
   */
  static categoryRequestHandler (context) {
    return async (request, response, next) => {
      debug('categoryRequestHandler');

      /** @type {CategoryRoutesPluginConfig} */
      const { separator } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

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
      /** @type {CategoryBreadcrumb[]} */
      const breadcrumbs = [];
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

      /** @type {import('../wiki.js').UttoriWikiViewModel} */
      let viewModel = {
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
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} context A Uttori-like context.
   * @returns {Promise<string[]>} Promise object that resolves to the array of all categories.
   * @static
   */
  static async getAllCategories(context) {
    debug('getAllCategories');
    /** @type {CategoryRoutesPluginConfig} */
    const { categoryField } = CategoryRoutesPlugin.extendConfig(context.config[CategoryRoutesPlugin.configKey]);

    const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
    const ignoreCategories = `"${context.config.ignoreCategories?.join('", "') || ''}"`;
    const query = `SELECT ${categoryField} FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND ${categoryField} EXCLUDES (${ignoreCategories}) ORDER BY updateDate DESC LIMIT -1`;

    /** @type {string[]} */
    let categories = [];
    try {
      // Fetch all the used categories.
      /** @type {Array<Array<Record<string, string | string[]>>>} */
      const [results] = await context.hooks.fetch('storage-query', query, context);
      // Organize and deduplicate, and sort the categories.
      /** @type {string[]} */
      const flatCategories = results.flatMap((doc) => doc?.[categoryField] ?? []);
      categories = [...new Set(flatCategories)].filter(Boolean).sort((a, b) => a.localeCompare(b));
    /* c8 ignore next 3 */
    } catch (error) {
      debug('Error fetching categories:', error);
    }

    return categories;
  }

  /**
   * Renders the category API that returns all available categories.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-category-routes', CategoryRoutesPluginConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @static
   */
  static categoryApiRequestHandler (context) {
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
