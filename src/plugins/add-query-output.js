let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.AddQueryOutputToViewModel'); } catch {}

/**
 * @typedef {object} AddQueryOutputToViewModelQuery
 * @property {string} [query] The query to be run.
 * @property {string} key The key to add the query output to.
 * @property {object[]} fallback The fallback value to use if the query fails.
 * @property {import('../../dist/custom.js').AddQueryOutputToViewModelFormatFunction} [format] An optional function to format the query output.
 * @property {import('../../dist/custom.js').AddQueryOutputToViewModelQueryFunction} [queryFunction] An optional custom function to execut the query.
 * @example <caption>Query with a custom function</caption>
 * {
 *   query: 'query',
 *   key: 'key',
 *   fallback: [],
 *   format: (results) => results.map((result) => result.slug),
 *   queryFunction: async (target, context) => {
 *     const ignoreSlugs = ['home-page'];
 *     const [popular] = await context.hooks.fetch('popular-documents', { limit: 5 }, context);
 *     const slugs = `"${popular.map(({ slug }) => slug).join('", "')}"`;
 *     const query = `SELECT 'slug', 'title' FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND slug IN (${slugs}) ORDER BY updateDate DESC LIMIT 5`;
 *     const [results] = await context.hooks.fetch('storage-query', query);
 *     return [results];
 *   },
 * }
 * @example <caption>Query with a formatting function</caption>
 * {
 *   key: 'tags',
 *   query: `SELECT tags FROM documents WHERE slug NOT_IN ("${ignoreSlugs.join('", "')}") ORDER BY id ASC LIMIT -1`,
 *   format: (tags) => [...new Set(tags.flatMap((t) => t.tags))].filter(Boolean).sort((a, b) => a.localeCompare(b)),
 *   fallback: [],
 * }
 */

/**
 * @typedef {object} AddQueryOutputToViewModelConfig
 * @property {Record<string, AddQueryOutputToViewModelQuery[]>} queries The array of quieries to be run and returned that will be added to the passed in object and returned with the querie output added.
 * @property {Record<string, string[]>} events An object whose keys correspong to methods, and contents are events to listen for.
 */

/**
 * Add tags to the view model.
 * @example <caption>AddQueryOutputToViewModel</caption>
 * const viewModel = AddQueryOutputToViewModel.callback(viewModel, context);
 * @class
 */
class AddQueryOutputToViewModel {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>AddQueryOutputToViewModel.configKey</caption>
   * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
   * @static
   */
  static get configKey() {
    return 'custom-plugin-add-query-output-to-view-model';
  }

  /**
   * The default configuration.
   * @returns {Partial<AddQueryOutputToViewModelConfig>} The configuration.
   * @example <caption>AddQueryOutputToViewModel.defaultConfig()</caption>
   * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      // Queries to be added to the view model.
      queries: {},
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, AddQueryOutputToViewModelConfig>} config A configuration object.
   * @param {object} _context A Uttori-like context (unused).
   * @example <caption>AddQueryOutputToViewModel.validateConfig(config, _context)</caption>
   * AddQueryOutputToViewModel.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config[AddQueryOutputToViewModel.configKey]) {
      const error = `Config Error: '${AddQueryOutputToViewModel.configKey}' configuration key is missing.`;
      debug(error);
      throw new Error(error);
    }
    if (!config[AddQueryOutputToViewModel.configKey].queries || typeof config[AddQueryOutputToViewModel.configKey].queries !== 'object') {
      const error = 'Config Error: `queries` should be a collection of events where the body is an array of AddQueryOutputToViewModelQuery objects.';
      debug(error);
      throw new Error(error);
    }
    if (!config[AddQueryOutputToViewModel.configKey].events || typeof config[AddQueryOutputToViewModel.configKey].events !== 'object') {
      const error = 'Config Error: `events` should be a collection of events where the body is an array of events to fire on and the key is the method to call.';
      debug(error);
      throw new Error(error);
    }
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.js').UttoriContext} context A Uttori-like context.
   * @example <caption>AddQueryOutputToViewModel.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [AddQueryOutputToViewModel.configKey]: {
   *       ...,
   *       events: {
   *         callback: ['document-save', 'document-delete'],
   *         validateConfig: ['validate-config'],
   *       },
   *       queries: [...],
   *     },
   *   },
   * };
   * AddQueryOutputToViewModel.register(context);
   * @static
   */
  static register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error("Missing event dispatcher in 'context.hooks.on(event, callback)' format.");
    }
    /** @type {Partial<AddQueryOutputToViewModelConfig>} */
    const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
    if (!config.events) {
      throw new Error("Missing events to listen to for in 'config.events'.");
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof AddQueryOutputToViewModel[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = AddQueryOutputToViewModel[method](event);
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Queries for related documents based on similar tags and searches the storage provider.
   * @template T The viewModel we are manipulating.
   * @param {string} eventLabel The event label to run queries for.
   * @param {T} viewModel A Uttori view-model object.
   * @param {import('../../dist/custom.js').UttoriContext} context A Uttori-like context.
   * @returns {Promise<T>} The provided view-model document.
   * @example <caption>AddQueryOutputToViewModel.callback(viewModel, context)</caption>
   * const context = {
   *   config: {
   *     [AddQueryOutputToViewModel.configKey]: {
   *       queries: [...],
   *     },
   *   },
   *   hooks: {
   *     on: (event) => { ... },
   *     fetch: (event, query) => { ... },
   *   },
   * };
   * AddQueryOutputToViewModel.callback(viewModel, context);
   * @static
   */
  static async callbackCurry(eventLabel, viewModel, context) {
    debug('callbackCurry:', { eventLabel });
    /** @type {Partial<AddQueryOutputToViewModelConfig>} */
    const { queries = {} } = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
    if (!viewModel) {
      debug('Missing target to add query output to.');
      return viewModel;
    }

    const allQueries = [...(queries[eventLabel] || []), ...(queries['*'] || [])];
    debug(`callbackCurry: Found ${allQueries.length} queries for event "${eventLabel}" including "*" queries`);
    for (const { query, key, fallback, format, queryFunction } of allQueries) {
      debug(`query: "${query}", key: "${key}", fallback: "${JSON.stringify(fallback)}"`);
      let results = fallback;
      try {
        if (typeof queryFunction === 'function') {
          // eslint-disable-next-line no-await-in-loop
          [results] = await queryFunction(viewModel, context);
        } else {
          // eslint-disable-next-line no-await-in-loop
          [results] = await context.hooks.fetch('storage-query', query);
        }
        if (typeof format === 'function') {
          results = format(results);
          debug('format:', results);
        }
      } catch (error) {
        debug('Error with query:', query, error);
      }
      debug('results:', results?.length);
      viewModel[key] = results;
    }

    return viewModel;
  }

  /**
   * Curry the hook function to take the current event label.
   * @param {string} eventLabel The event label to run queries for.
   * @returns {import('../../dist/custom.js').AddQueryOutputToViewModelCallback} The provided view-model document.
   * @example <caption>AddQueryOutputToViewModel.callback(eventLabel)</caption>
   */
  static callback(eventLabel) {
    debug('callback:', eventLabel);
    return async (target, context) => AddQueryOutputToViewModel.callbackCurry(eventLabel, target, context);
  }
}

export default AddQueryOutputToViewModel;
