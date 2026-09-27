import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import ejs from 'ejs';
import type { EJSRendererConfig } from '../types/plugins/ejs-includes.js';

export type { EJSRendererConfig } from '../types/plugins/ejs-includes.js';

const debug = createDebug('Uttori.Plugin.Render.EJSRenderer');

/**
 * Uttori Replacer Renderer
 * @example <caption>EJSRenderer</caption>
 * const content = EJSRenderer.render("...");
 */
class EJSRenderer {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>EJSRenderer.configKey</caption>
   * const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
   */
  static get configKey(): 'uttori-plugin-renderer-ejs' {
    return 'uttori-plugin-renderer-ejs';
  }

  /**
   * The default configuration.
   * @returns The configuration.
   * @example <caption>EJSRenderer.defaultConfig()</caption>
   * const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
   */
  static defaultConfig(): import('../custom.js').DefaultPluginConfig<EJSRendererConfig, 'ejs'> {
    return {
      ejs: {},
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param config A provided configuration to use.
   * @param _context Unused
   * @example <caption>EJSRenderer.validateConfig(config, _context)</caption>
   * EJSRenderer.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, EJSRendererConfig>, _context: unknown) {
    debug('Validating config...');
    if (!config || !config[EJSRenderer.configKey]) {
      throw new Error(`EJSRenderer Config Warning: '${EJSRenderer.configKey}' configuration key is missing.`);
    }

    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param context A Uttori-like context.
   * @example <caption>EJSRenderer.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [EJSRenderer.configKey]: {
   *       ...,
   *       events: {
   *         renderContent: ['render-content', 'render-meta-description'],
   *         renderCollection: ['render-search-results'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * EJSRenderer.register(context);
   */
  static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      const EJSRendererMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(EJSRenderer, method);
      if (EJSRendererMethod) {
        for (const event of eventNames) {

          const callback = EJSRendererMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Replace content in a provided string with a provided context.
   * @param content Content to be converted to HTML.
   * @param context A Uttori-like context.
   * @returns The rendered content.
   * @example <caption>EJSRenderer.renderContent(content, context)</caption>
   * const context = {
   *   config: {
   *     [EJSRenderer.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * EJSRenderer.renderContent(content, context);
   */
  static renderContent(content: string | undefined, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>): string {
    debug('renderContent');
    if (!context || !context.config || !context.config[EJSRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }

    const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
    return EJSRenderer.render(content, config.ejs);
  }

  /**
   * Replace content in a collection of Uttori documents with a provided context.
   * @param collection A collection of Uttori documents.
   * @param context A Uttori-like context.
   * @returns The rendered documents.
   * @example <caption>EJSRenderer.renderCollection(collection, context)</caption>
   * const context = {
   *   config: {
   *     [EJSRenderer.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * EJSRenderer.renderCollection(collection, context);
   */
  static renderCollection(collection: import('../wiki.js').UttoriWikiDocument[], context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>): import('../wiki.js').UttoriWikiDocument[] {
    debug('renderCollection:', collection.length);
    if (!context || !context.config || !context.config[EJSRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }

    const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
    return collection.map((document) => {
      const html = EJSRenderer.render(document.html, config.ejs);
      return { ...document, html };
    });
  }

  /**
   * Render EJS content in a provided string.
   * @param content Content to be searched through to make replacements.
   * @param config A provided configuration to use.
   * @returns The rendered content.
   * @example <caption>EJSRenderer.render(content, config)</caption>
   * const html = EJSRenderer.render(content, config);
   */
  static render(content: string | undefined, config: ejs.Options): string {
    debug('content', content);
    if (!content) {
      debug('No input provided, returning a blank string.');
      return '';
    }

    content = ejs.render(content, {}, { ...config, async: false });

    return content;
  }
}

export default EJSRenderer;
