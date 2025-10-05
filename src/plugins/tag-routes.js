let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.TagRoutes'); } catch {}

/**
 * @typedef {object} TagRoutesPluginConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [title] The default title for tag pages.
 * @property {number} [limit] The maximum number of documents to return for a tag.
 * @property {Record<string, import("express").RequestHandler[]>} [middleware] Middleware for tag routes.
 * @property {string} [tagIndexRoute] A replacement route for the tag index route.
 * @property {string} [tagRoute] A replacement route for the tag show route.
 * @property {string} [apiRoute] A replacement route for the tag index route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>): import('express').RequestHandler} [tagIndexRequestHandler] A replacement route handler for the tag index route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>): import('express').RequestHandler} [tagRequestHandler] A replacement route handler for the tag show route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>): import('express').RequestHandler} [apiRequestHandler] A request handler for the API route.
 */

/**
 * Tag routes plugin for Uttori Wiki.
 * Provides tag index and individual tag pages functionality.
 * @property {TagRoutesPluginConfig} config The configuration object.
 * @example <caption>Init TagRoutesPlugin</caption>
 * const tagPlugin = new TagRoutesPlugin();
 * @class
 */
class TagRoutesPlugin {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>TagRoutesPlugin.configKey</caption>
   * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-tag-routes';
  }

  /**
   * The default configuration.
   * @returns {TagRoutesPluginConfig} The configuration.
   * @example <caption>TagRoutesPlugin.defaultConfig()</caption>
   * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      title: 'Tags',
      limit: 1024,
      tagIndexRoute: 'tags',
      tagRoute: 'tags',
      apiRoute: 'tag-api',
      middleware: {
        tagIndex: [],
        tag: [],
        api: [],
      },
      events: {
        bindRoutes: ['bind-routes'],
        validateConfig: ['validate-config'],
      },
      tagIndexRequestHandler: TagRoutesPlugin.tagIndexRequestHandler,
      tagRequestHandler: TagRoutesPlugin.tagRequestHandler,
      apiRequestHandler: TagRoutesPlugin.tagRequestHandler,
    };
  }

  /**
   * Create a config that is extended from the default config.
   * @param {TagRoutesPluginConfig} config The user provided configuration.
   * @returns {TagRoutesPluginConfig} The new configration.
   */
  static extendConfig(config = TagRoutesPlugin.defaultConfig()) {
  /** @type {TagRoutesPluginConfig} */
    const base = TagRoutesPlugin.defaultConfig();
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
   * @param {Record<string, TagRoutesPluginConfig>} config A configuration object.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} _context - A Uttori-like context (unused).
   * @example <caption>TagRoutesPlugin.validateConfig(config, _context)</caption>
   * TagRoutesPlugin.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config[TagRoutesPlugin.configKey]) {
      debug(`Config Error: '${TagRoutesPlugin.configKey}' configuration key is missing.`);
      throw new Error(`Config Error: '${TagRoutesPlugin.configKey}' configuration key is missing.`);
    }
    if (!config[TagRoutesPlugin.configKey].tagIndexRoute || typeof config[TagRoutesPlugin.configKey].tagIndexRoute !== 'string') {
      debug(`Config Error: '${TagRoutesPlugin.configKey}.tagIndexRoute' is missing or not a string.`);
      throw new Error(`Config Error: '${TagRoutesPlugin.configKey}.tagIndexRoute' is missing or not a string.`);
    }
    if (!config[TagRoutesPlugin.configKey].tagRoute || typeof config[TagRoutesPlugin.configKey].tagRoute !== 'string') {
      debug(`Config Error: '${TagRoutesPlugin.configKey}.tagRoute' is missing or not a string.`);
      throw new Error(`Config Error: '${TagRoutesPlugin.configKey}.tagRoute' is missing or not a string.`);
    }
    if (!config[TagRoutesPlugin.configKey].apiRoute || typeof config[TagRoutesPlugin.configKey].apiRoute !== 'string') {
      debug(`Config Error: '${TagRoutesPlugin.configKey}.apiRoute' is missing or not a string.`);
      throw new Error(`Config Error: '${TagRoutesPlugin.configKey}.apiRoute' is missing or not a string.`);
    }
    if (!config[TagRoutesPlugin.configKey].title || typeof config[TagRoutesPlugin.configKey].title !== 'string') {
      debug(`Config Error: '${TagRoutesPlugin.configKey}.title' is missing or not a string.`);
      throw new Error(`Config Error: '${TagRoutesPlugin.configKey}.title' is missing or not a string.`);
    }

    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
   * @example <caption>TagRoutesPlugin.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [TagRoutesPlugin.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * TagRoutesPlugin.register(context);
   * @static
   */
  static register(context) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {TagRoutesPluginConfig} */
    const config = TagRoutesPlugin.extendConfig(context.config[TagRoutesPlugin.configKey]);

    // Bind events
    for (const [method, events] of Object.entries(config.events)) {
      if (typeof TagRoutesPlugin[method] === 'function') {
        for (const event of events) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = TagRoutesPlugin[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Wrapper function for binding tag routes.
   * @param {import('express').Application} server An Express server instance.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
   * @example <caption>TagRoutesPlugin.bindRoutes(plugin)</caption>
   * const context = {
   *   config: {
   *     [TagRoutesPlugin.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * TagRoutesPlugin.bindRoutes(plugin);
   * @static
   */
  static bindRoutes(server, context) {
    debug('bindRoutes');
    /** @type {TagRoutesPluginConfig} */
    const { tagRoute, tagIndexRoute, apiRoute, middleware, tagIndexRequestHandler, tagRequestHandler, apiRequestHandler } = TagRoutesPlugin.extendConfig(context.config[TagRoutesPlugin.configKey]);
    debug('bindRoutes:', { tagRoute, tagIndexRoute });

    server.get(`/${tagIndexRoute}`, ...middleware.tagIndex, tagIndexRequestHandler(context));
    server.get(`/${tagRoute}/:tag`, ...middleware.tag, tagRequestHandler(context));
    server.get(`/${apiRoute}`, ...middleware.api, apiRequestHandler(context));
  }

  /**
   * Returns the documents with the provided tag, up to the provided limit.
   * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
   *
   * Hooks:
   * - `fetch` - `storage-query` - Searched for the tagged documents.
   * @async
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
   * @param {string} tag The tag to look for in documents.
   * @returns {Promise<import('../wiki.js').UttoriWikiDocument[]>} Promise object that resolves to the array of the documents.
   * @example
   * plugin.getTaggedDocuments('example', 10);
   * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
   */
  static async getTaggedDocuments(context, tag) {
    debug('getTaggedDocuments:', tag);
    /** @type {TagRoutesPluginConfig} */
    const { limit } = TagRoutesPlugin.extendConfig(context.config[TagRoutesPlugin.configKey]);
    /** @type {import('../wiki.js').UttoriWikiDocument[]} */
    let results = [];
    try {
      const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
      const query = `SELECT * FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND tags INCLUDES "${tag}" ORDER BY title ASC LIMIT ${limit}`;
      [results] = await context.hooks.fetch('storage-query', query, context);
    /* c8 ignore next 3 */
    } catch (error) {
      debug('getTaggedDocuments Error:', error);
    }
    return results.filter(Boolean);
  }

  /**
   * Renders the tag index page with the `tags` template.
   *
   * Hooks:
   * - `filter` - `view-model-tag-index` - Passes in the viewModel.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @static
   */
  static tagIndexRequestHandler (context) {
    return async (request, response, _next) => {
      debug('tagIndexRequestHandler');

      const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
      const ignoreTags = `"${context.config.ignoreTags.join('", "')}"`;
      const query = `SELECT tags FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND tags EXCLUDES (${ignoreTags}) ORDER BY updateDate DESC LIMIT -1`;
      /** @type {string[]} */
      let tags = [];
      try {
        // Fetch all the used tags.
        /** @type {import('../wiki.js').UttoriWikiDocument[][]} */
        const [results] = await context.hooks.fetch('storage-query', query, context);
        // Organize and deduplicate, and sort the tags.
        tags = [...new Set(results.flatMap((t) => t.tags))].filter(Boolean).sort((a, b) => a.localeCompare(b));
      /* c8 ignore next 3 */
      } catch (error) {
        debug('Error fetching tags:', error);
      }

      // Collect & sort all the tagged documents for each tag.
      /** @type {Record<string, import('../wiki.js').UttoriWikiDocument[]>} */
      const taggedDocuments = {};
      await Promise.all(tags.map(async (tag) => {
        const sorted = await TagRoutesPlugin.getTaggedDocuments(context, tag);
        taggedDocuments[tag] = sorted.sort((a, b) => a.title.localeCompare(b.title));
      }));

      const meta = await context.buildMetadata({}, `/${context.config[TagRoutesPlugin.configKey].tagIndexRoute}`);

      /** @type {import('../wiki.js').UttoriWikiViewModel} */
      let viewModel = {
        title: context.config[TagRoutesPlugin.configKey].title,
        config: context.config,
        session: request.session,
        taggedDocuments,
        meta,
        basePath: request.baseUrl,
        flash: request.wikiFlash(),
      };
      viewModel = await context.hooks.filter('view-model-tag-index', viewModel, context);
      if (context.config.useCache) {
        response.set('Cache-control', `public, max-age=${context.config.cacheShort}`);
      }
      response.render('tags', viewModel);
    };
  }

  /**
   * Renders the tag detail page with `tag` template.
   * Sets the `X-Robots-Tag` header to `noindex`.
   * Attempts to pull in the relevant site section for the tag if defined in the config site sections.
   *
   * Hooks:
   * - `filter` - `view-model-tag` - Passes in the viewModel.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
   * @returns {import('express').RequestHandler} The function to pass to Express.
   * @static
   */
  static tagRequestHandler (context) {
    return async (request, response, next) => {
      debug('tagRequestHandler');

      const taggedDocuments = await TagRoutesPlugin.getTaggedDocuments(context,request.params.tag);
      if (taggedDocuments.length === 0) {
        debug('No documents for tag!');
        next();
        return;
      }

      const meta = await context.buildMetadata({}, `/${context.config[TagRoutesPlugin.configKey].tagRoute}/${request.params.tag}`);
      const title = `${request.params.tag} Tagged Documents`;

      /** @type {import('../wiki.js').UttoriWikiViewModel} */
      let viewModel = {
        title,
        config: context.config,
        session: request.session,
        taggedDocuments,
        meta,
        basePath: request.baseUrl,
        flash: request.wikiFlash(),
      };
      viewModel = await context.hooks.filter('view-model-tag', viewModel, context);
      if (context.config.useCache) {
        response.set('Cache-control', `public, max-age=${context.config.cacheShort}`);
      }
      response.render('tag', viewModel);
    };
  }
}

export default TagRoutesPlugin;
