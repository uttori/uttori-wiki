import ejs from 'ejs';

let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.Render.EJSRenderer'); } catch {}

/**
 * @typedef {object} EJSRendererConfig
 * @property {Record<string, string[]>} [events] Events to bind to.
 * @property {ejs.Options} [ejs] EJS configuration.
 */

/**
 * Uttori Replacer Renderer
 * @example <caption>EJSRenderer</caption>
 * const content = EJSRenderer.render("...");
 * @class
 */
class EJSRenderer {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>EJSRenderer.configKey</caption>
   * const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-renderer-ejs';
  }

  /**
   * The default configuration.
   * @returns {EJSRendererConfig} The configuration.
   * @example <caption>EJSRenderer.defaultConfig()</caption>
   * const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      ejs: {},
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, EJSRendererConfig>} config A provided configuration to use.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>} _context Unused
   * @example <caption>EJSRenderer.validateConfig(config, _context)</caption>
   * EJSRenderer.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config || !config[EJSRenderer.configKey]) {
      throw new Error(`EJSRenderer Config Warning: '${EJSRenderer.configKey}' configuration key is missing.`);
    }

    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>} context A Uttori-like context.
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
   * @static
   */
  static register(context) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    /** @type {EJSRendererConfig} */
    const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof EJSRenderer[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = EJSRenderer[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Replace content in a provided string with a provided context.
   * @param {string} content Content to be converted to HTML.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>} context A Uttori-like context.
   * @returns {string} The rendered content.
   * @example <caption>EJSRenderer.renderContent(content, context)</caption>
   * const context = {
   *   config: {
   *     [EJSRenderer.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * EJSRenderer.renderContent(content, context);
   * @static
   */
  static renderContent(content, context) {
    debug('renderContent');
    if (!context || !context.config || !context.config[EJSRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }
    /** @type {EJSRendererConfig} */
    const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
    return EJSRenderer.render(content, config.ejs);
  }

  /**
   * Replace content in a collection of Uttori documents with a provided context.
   * @param {import('../wiki.js').UttoriWikiDocument[]} collection A collection of Uttori documents.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>} context A Uttori-like context.
   * @returns {import('../wiki.js').UttoriWikiDocument[]} The rendered documents.
   * @example <caption>EJSRenderer.renderCollection(collection, context)</caption>
   * const context = {
   *   config: {
   *     [EJSRenderer.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * EJSRenderer.renderCollection(collection, context);
   * @static
   */
  static renderCollection(collection, context) {
    debug('renderCollection:', collection.length);
    if (!context || !context.config || !context.config[EJSRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }
    /** @type {EJSRendererConfig} */
    const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
    return collection.map((document) => {
      const html = EJSRenderer.render(document.html, config.ejs);
      return { ...document, html };
    });
  }

  /**
   * Render EJS content in a provided string.
   * @param {string} content Content to be searched through to make replacements.
   * @param {ejs.Options} config A provided configuration to use.
   * @returns {string} The rendered content.
   * @example <caption>EJSRenderer.render(content, config)</caption>
   * const html = EJSRenderer.render(content, config);
   * @static
   */
  static render(content, config) {
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
