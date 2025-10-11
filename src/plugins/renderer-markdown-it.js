import MarkdownIt from 'markdown-it';
import slugify from 'slugify';
import markdownItPlugin from './markdown-it-plugin/markdown-it-plugin.js';
import { referenceTag, definitionOpenTag } from './markdown-it-plugin/footnotes.js';

let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.Render.MarkdownIt'); } catch {}

/**
 * @typedef {object} MarkdownItRendererOptionsUttori
 * @property {string} baseUrl Prefix for relative URLs, useful when the Express app is not at URI root.
 * @property {string[]} allowedExternalDomains Allowed External Domains, if a domain is not in this list, it is set to 'nofollow'. Values should be strings of the hostname portion of the URL object (like example.org).
 * @property {boolean} disableValidation Optionally disable the built in Markdown-It link validation, large security risks when link validation is disabled.
 * @property {boolean} openNewWindow Open external domains in a new window.
 * @property {boolean} lazyImages Add lazy loading params to image tags.
 * @property {object} [footnotes] Footnote settings.
 * @property {Function} footnotes.referenceTag A funciton to return the default HTML for a footnote reference.
 * @property {Function} footnotes.definitionOpenTag A funciton to return the default opening HTML for a footnote definition.
 * @property {string} footnotes.definitionCloseTag The default closing HTML for a footnote definition.
 * @property {object} [toc] Table of Contents settings.
 * @property {boolean} toc.extract When true, extract the table of contents to the view model from the content.
 * @property {string} toc.openingTag The opening DOM tag for the TOC container.
 * @property {string} toc.closingTag The closing DOM tag for the TOC container.
 * @property {object} toc.slugify Slugify options for convering headings to anchor links.
 * @property {object} [wikilinks] WikiLinks settings.
 * @property {object} wikilinks.slugify Slugify options for convering Wikilinks to anchor links.
 */

/**
 * @typedef {object} MarkdownItRendererOptions
 * @property {boolean} [html] Enable HTML tags in source.
 * @property {boolean} [xhtmlOut] Use '/' to close single tags.
 * @property {boolean} [breaks] Convert '\n' in paragraphs into <br>.
 * @property {string} [langPrefix] CSS language prefix for fenced blocks.
 * @property {boolean} [linkify] Autoconvert URL-like text to links.
 * @property {boolean} [typographer] Enable some language-neutral replacement + quotes beautification.
 * @property {string} [quotes] Double + single quotes replacement pairs.
 * @property {MarkdownItRendererOptionsUttori} uttori The Uttori specific configuration.
 */

/**
 * @typedef {object} MarkdownItRendererConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {MarkdownItRendererOptions} markdownIt The MarkdownIt configuration.
 */

/**
 * Uttori MarkdownIt Renderer
 * @example <caption>MarkdownItRenderer</caption>
 * const content = MarkdownItRenderer.render("...");
 * @class
 */
class MarkdownItRenderer {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>MarkdownItRenderer.configKey</caption>
   * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-renderer-markdown-it';
  }

  /**
   * The default configuration.
   * @returns {MarkdownItRendererConfig} The default configuration.
   * @example <caption>MarkdownItRenderer.defaultConfig()</caption>
   * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      markdownIt: {
        html: false,
        xhtmlOut: false,
        breaks: false,
        langPrefix: 'language-',
        linkify: false,
        typographer: false,
        quotes: '“”‘’',
        uttori: {
          baseUrl: '',
          allowedExternalDomains: [],
          disableValidation: false,
          openNewWindow: true,
          lazyImages: true,
          footnotes: {
            referenceTag,
            definitionOpenTag,
            definitionCloseTag: '</div>\n',
          },
          toc: {
            extract: false,
            openingTag: '<nav class="table-of-contents">',
            closingTag: '</nav>',
            slugify: {
              lower: true,
            },
          },
          wikilinks: {
            slugify: {
              lower: true,
            },
          },
        },
      },
    };
  }

  /**
   * Create a config that is extended from the default config.
   * @param {MarkdownItRendererConfig} config The user provided configuration.
   * @returns {MarkdownItRendererConfig} The new configration.
   */
  static extendConfig(config = MarkdownItRenderer.defaultConfig()) {
    /** @type {MarkdownItRendererConfig} */
    const base = MarkdownItRenderer.defaultConfig();

    /** @type {MarkdownItRendererOptionsUttori} */
    const baseUttori = base.markdownIt?.uttori;
    /** @type {MarkdownItRendererOptionsUttori} */
    const configUttori = config?.markdownIt?.uttori;
    return {
      ...base,
      ...config,
      markdownIt: {
        ...base.markdownIt,
        ...config?.markdownIt,
        uttori: {
          ...baseUttori,
          ...configUttori,
          footnotes: {
            ...baseUttori?.footnotes,
            ...configUttori?.footnotes,
          },
          toc: {
            ...baseUttori?.toc,
            ...configUttori?.toc,
          },
          wikilinks: {
            ...baseUttori?.wikilinks,
            ...configUttori?.wikilinks,
          },
        },
      },
    };
  }

  /**
   * Validates the provided configuration for required entries.
   * @param {Record<string, MarkdownItRendererConfig>} config A provided configuration to use.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>} _context Unused
   * @example <caption>MarkdownItRenderer.validateConfig(config, _context)</caption>
   * MarkdownItRenderer.validateConfig({ ... });
   * @static
   */
  static validateConfig(config, _context) {
    debug('Validating config...');
    if (!config || !config[MarkdownItRenderer.configKey]) {
      throw new Error(`MarkdownItRenderer Config Error: '${MarkdownItRenderer.configKey}' configuration key is missing.`);
    }
    if (!config[MarkdownItRenderer.configKey].markdownIt) {
      throw new Error('MarkdownItRenderer Config Error: \'markdownIt\' configuration key is missing.');
    }
    if (!config[MarkdownItRenderer.configKey].markdownIt?.uttori) {
      throw new Error('MarkdownItRenderer Config Error: \'markdownIt.uttori\' configuration key is missing.');
    }
    if (!Array.isArray(config[MarkdownItRenderer.configKey].markdownIt?.uttori?.allowedExternalDomains)) {
      throw new TypeError('MarkdownItRenderer Config Error: \'markdownIt.uttori.allowedExternalDomains\' is missing or not an array.');
    }
    debug('Validated config.');
  }

  /**
   * Register the plugin with a provided set of events on a provided Hook system.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>} context A Uttori-like context.
   * @example <caption>MarkdownItRenderer.register(context)</caption>
   * const context = {
   *   hooks: {
   *     on: (event, callback) => { ... },
   *   },
   *   config: {
   *     [MarkdownItRenderer.configKey]: {
   *       ...,
   *       events: {
   *         renderContent: ['render-content', 'render-meta-description'],
   *         renderCollection: ['render-search-results'],
   *         validateConfig: ['validate-config'],
   *       },
   *     },
   *   },
   * };
   * MarkdownItRenderer.register(context);
   * @static
   */
  static register(context) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    const config = MarkdownItRenderer.extendConfig(/** @type {MarkdownItRendererConfig} */ (context.config[MarkdownItRenderer.configKey]));
    if (!config.events || Object.keys(config.events).length === 0) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof MarkdownItRenderer[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = MarkdownItRenderer[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Renders Markdown for a provided string with a provided context.
   * @param {string} content Markdown content to be converted to HTML.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>} context A Uttori-like context.
   * @returns {string} The rendered content.
   * @example <caption>MarkdownItRenderer.renderContent(content, context)</caption>
   * const context = {
   *   config: {
   *     [MarkdownItRenderer.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * MarkdownItRenderer.renderContent(content, context);
   * @static
   */
  static renderContent(content, context) {
    debug('renderContent');
    if (!context || !context.config || !context.config[MarkdownItRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }
    /** @type {MarkdownItRendererConfig} */
    const config = MarkdownItRenderer.extendConfig(/** @type {MarkdownItRendererConfig} */ (context.config[MarkdownItRenderer.configKey]));
    return MarkdownItRenderer.render(content, config);
  }

  /**
   * Renders Markdown for a collection of Uttori documents with a provided context.
   * @param {import('../wiki.js').UttoriWikiDocument[]} collection A collection of Uttori documents.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>} context A Uttori-like context.
   * @returns {import('../wiki.js').UttoriWikiDocument[]} The rendered documents.
   * @example <caption>MarkdownItRenderer.renderCollection(collection, context)</caption>
   * const context = {
   *   config: {
   *     [MarkdownItRenderer.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * MarkdownItRenderer.renderCollection(collection, context);
   * @static
   */
  static renderCollection(collection, context) {
    debug('renderCollection:', collection.length);
    if (!context || !context.config || !context.config[MarkdownItRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }
    /** @type {MarkdownItRendererConfig} */
    const config = MarkdownItRenderer.extendConfig(/** @type {MarkdownItRendererConfig} */ (context.config[MarkdownItRenderer.configKey]));
    return collection.map((document) => {
      const html = MarkdownItRenderer.render(document.html, config);
      return { ...document, html };
    });
  }

  /**
   * Renders Markdown for a provided string with a provided MarkdownIt configuration.
   * @param {string} content Markdown content to be converted to HTML.
   * @param {MarkdownItRendererConfig} [config] A provided MarkdownIt configuration to use.
   * @returns {string} The rendered content.
   * @example <caption>MarkdownItRenderer.render(content, config)</caption>
   * const html = MarkdownItRenderer.render(content, config);
   * @static
   */
  static render(content, config = MarkdownItRenderer.defaultConfig()) {
    if (!content) {
      debug('No input provided, returning a blank string.');
      return '';
    }
    const md = new MarkdownIt(config.markdownIt).use(markdownItPlugin);
    if (config?.markdownIt?.uttori?.disableValidation) {
      md.validateLink = () => true;
    }

    // Clean up the content.
    content = MarkdownItRenderer.cleanContent(content);
    return md.render(content).trim();
  }

  /**
   * Parse Markdown for a provided string with a provided MarkdownIt configuration.
   * @param {string} content Markdown content to be converted to HTML.
   * @param {MarkdownItRendererConfig} [config] A provided MarkdownIt configuration to use.
   * @returns {import('markdown-it/index.js').Token[]} The rendered content.
   * @example <caption>MarkdownItRenderer.parse(content, config)</caption>
   * const tokens = MarkdownItRenderer.parse(content, config);
   * @see {@link https://markdown-it.github.io/markdown-it/#MarkdownIt.parse|MarkdownIt.parse}
   * @static
   */
  static parse(content, config = MarkdownItRenderer.defaultConfig()) {
    if (!content) {
      debug('No input provided, returning an empty array.');
      return [];
    }

    const md = new MarkdownIt(config.markdownIt).use(markdownItPlugin);
    if (config?.markdownIt?.uttori?.disableValidation) {
      md.validateLink = () => true;
    }

    // Clean up the content.
    content = MarkdownItRenderer.cleanContent(content);
    return md.parse(content, {});
  }

  /**
   * Removes empty links, as these have caused issues.
   * Find missing links, and link them to the slug from the provided text.
   * @param {string} content Markdown content to be converted to HTML.
   * @returns {string} The rendered content.
   * @static
   */
  static cleanContent(content) {
    // Remove empty links, as these have caused issues.
    content = content.replace(/\[]\(\)/g, '');

    // Find missing links, and link them.
    const missingLinks = content.match(/\[(.*)]\(\s?\)/g) || [];
    if (missingLinks && missingLinks.length > 0) {
      debug('Found missing links:', missingLinks.length);
      for (const match of missingLinks) {
        const title = match.slice(1).slice(0, -3);
        // @ts-expect-error slugify is not typed
        const slug = slugify(title, { lower: true });
        content = content.replace(match, `[${title}](/${slug})`);
      }
    }

    return content;
  }

  /**
   * Will attempt to extract the table of contents when set to and add it to the view model.
   * @param {import('../wiki.js').UttoriWikiViewModel} viewModel Markdown content to be converted to HTML.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>} context A Uttori-like context.
   * @returns {import('../wiki.js').UttoriWikiViewModel | { toc: string }} The view model.
   * @example <caption>MarkdownItRenderer.viewModelDetail(viewModel, context)</caption>
   * viewModel = MarkdownItRenderer.viewModelDetail(viewModel, context);
   * @static
   */
  static viewModelDetail(viewModel, context) {
    debug('viewModelDetail');
    if (!context || !context.config || !context.config[MarkdownItRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }
    /** @type {MarkdownItRendererConfig} */
    const config = MarkdownItRenderer.extendConfig(/** @type {MarkdownItRendererConfig} */ (context.config[MarkdownItRenderer.configKey]));

    // Do we need to do anything?
    if (!config.markdownIt?.uttori?.toc?.extract) {
      debug('No document.html provided, returning the viewModel.');
      return viewModel;
    }

    // Check for the HTML table of contents
    if (!viewModel?.document?.html) {
      debug('No document.html provided, returning the viewModel.');
      return viewModel;
    }
    if (!viewModel?.document?.html?.includes(config.markdownIt?.uttori?.toc?.openingTag)) {
      debug('No table of contents found, returning the viewModel.');
      return viewModel;
    }

    // Extract the table of contents and update the HTML
    /** @type {string[]} */
    const [preToc, tocStart] = viewModel.document.html.split(config.markdownIt?.uttori?.toc?.openingTag);
    /** @type {string[]} */
    const [toc, postToc] = tocStart.split(config.markdownIt?.uttori?.toc?.closingTag);

    return {
      ...viewModel,
      document: {
        ...viewModel.document,
        html: `${preToc.trim()}${postToc.trim()}`,
      },
      toc: `${config.markdownIt?.uttori?.toc?.openingTag?.trim()}${toc?.trim()}${config.markdownIt?.uttori?.toc?.closingTag?.trim()}`,
    };
  }
}

export default MarkdownItRenderer;
