import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import type { AddQueryOutputToViewModelConfig } from '../types/plugins/query-output.js';

export type {
  AddQueryOutputToViewModelQuery, AddQueryOutputToViewModelConfig, AddQueryOutputToViewModelContext,
} from '../types/plugins/query-output.js';

const debug = createDebug('Uttori.Plugin.AddQueryOutputToViewModel');

/**
 * Add queries output to the view model.
 * @example <caption>AddQueryOutputToViewModel</caption>
 * const viewModel = AddQueryOutputToViewModel.callback(viewModel, context);
 */
class AddQueryOutputToViewModel {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>AddQueryOutputToViewModel.configKey</caption>
   * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
   */
  static get configKey(): 'uttori-plugin-add-query-output-to-view-model' {
    return 'uttori-plugin-add-query-output-to-view-model';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example <caption>AddQueryOutputToViewModel.defaultConfig()</caption>
   * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<AddQueryOutputToViewModelConfig, 'queries' | 'events'> {
    return {
      queries: {},
      events: {},
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param config A configuration object.
   * @param _context A Uttori-like context (unused).
   * @example <caption>AddQueryOutputToViewModel.validateConfig(config, _context)</caption>
   * AddQueryOutputToViewModel.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, AddQueryOutputToViewModelConfig>, _context: unknown) {
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
   * @param context A Uttori-like context.
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
   */
  static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      const AddQueryOutputToViewModelMethod = getPluginMethod<typeof AddQueryOutputToViewModel.callback>(AddQueryOutputToViewModel, method);
      if (AddQueryOutputToViewModelMethod) {
        for (const event of eventNames) {

          const callback = AddQueryOutputToViewModelMethod.call(AddQueryOutputToViewModel, event);
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Queries for related documents based on similar tags and searches the storage provider.
   * @param eventLabel The event label to run queries for.
   * @param viewModel A Uttori view-model object.
   * @param context A Uttori-like context.
   * @returns The provided view-model document.
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
   */
  static async callbackCurry<T extends Record<string, unknown>>(eventLabel: string, viewModel: T, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>): Promise<T> {
    debug('callbackCurry:', { eventLabel });

    const { queries = {} }: Partial<AddQueryOutputToViewModelConfig> = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
    if (!viewModel) {
      debug('Missing target to add query output to.');
      return viewModel;
    }

    const allQueries = [...(queries[eventLabel] || []), ...(queries['*'] || [])];
    debug(`callbackCurry: Found ${allQueries.length} queries for event "${eventLabel}" including "*" queries`);
    for (const { query, key, fallback, format, queryFunction } of allQueries) {
      debug(`query: "${query}", key: "${key}", fallback: "${JSON.stringify(fallback)}"`);
      let results: unknown[] = fallback;
      try {
        if (typeof queryFunction === 'function') {
          [results] = await queryFunction(viewModel, context);
        } else {
          [results] = await context.hooks.fetch('storage-query', query);
        }
        if (typeof format === 'function') {
          // Storage hooks provide documents; the formatter may replace them with another view shape.
          results = format(results as import('../wiki.js').UttoriWikiDocument[]);
          debug('format:', results);
        }
      } catch (error) {
        debug('Error with query:', query, error);
      }
      debug('results:', results?.length);
      Object.assign(viewModel, { [key]: results });
    }

    return viewModel;
  }

  /**
   * Curry the hook function to take the current event label.
   * @param eventLabel The event label to run queries for.
   * @returns The provided view-model document.
   * @example <caption>AddQueryOutputToViewModel.callback(eventLabel)</caption>
   */
  static callback(eventLabel: string): import('../custom.js').AddQueryOutputToViewModelCallback {
    debug('callback:', eventLabel);
    const handler: import('../custom.js').AddQueryOutputToViewModelCallback = (viewModel, context) => AddQueryOutputToViewModel.callbackCurry(
      eventLabel,
      viewModel,
      context,
    );
    return handler;
  }
}

export default AddQueryOutputToViewModel;
