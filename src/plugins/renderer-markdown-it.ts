import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import MarkdownIt from 'markdown-it';
import slugify from 'slugify';
import markdownItPlugin from './markdown-it-plugin/markdown-it-plugin.js';
import { referenceTag, definitionOpenTag } from './markdown-it-plugin/footnotes.js';
import type { MarkdownItRendererOptions, MarkdownItRendererConfig } from '../types/plugins/renderer-markdown-it.js';

export type {
  MarkdownItExample, MarkdownItRendererOptionsUttori, MarkdownItRendererOptions,
  MarkdownItRendererConfig, MarkdownItRendererInputOptions,
} from '../types/plugins/renderer-markdown-it.js';

const debug = createDebug('Uttori.Plugin.Render.MarkdownIt');

/**
 * Creates the parser shared by render and parse so both paths use the same link rules.
 * @param config Renderer configuration.
 * @returns Configured parser.
 */
const createParser = (config: MarkdownItRendererConfig): import('markdown-it').MarkdownIt => {
  // Direct render/parse calls preserve caller options; context-based hooks apply defaults in extendConfig.
  const md = new MarkdownIt(config.markdownIt as import('markdown-it').MarkdownItOptions).use(markdownItPlugin);

  // linkify-it 6 disabled bare-domain links by default; keep existing linkify:true output stable.
  if (config.markdownIt.linkify) {
    md.linkify.set({ fuzzyLink: true });
  }
  if (config.markdownIt.uttori?.disableValidation) {
    md.validateLink = () => true;
  }

  return md;
};

/**
 * Uttori MarkdownIt Renderer
 * @example <caption>MarkdownItRenderer</caption>
 * const content = MarkdownItRenderer.render("...");
 */
class MarkdownItRenderer {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   *
   * @returns The configuration key.
   * @example <caption>MarkdownItRenderer.configKey</caption>
   * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
   */
  static get configKey(): 'uttori-plugin-renderer-markdown-it' {
    return 'uttori-plugin-renderer-markdown-it';
  }

  /**
   * The default configuration.
   * @returns The default configuration.
   * @example <caption>MarkdownItRenderer.defaultConfig()</caption>
   * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
   */
  static defaultConfig(): { markdownIt: MarkdownItRendererOptions } {
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
          mermaid: true,
          footnotes: {
            referenceTag,
            definitionOpenTag,
            definitionCloseTag: '</div>\n',
          },
          toc: {
            extract: false,
            stableIds: false,
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
   * @param config The user provided configuration.
   * @returns The new configration.
   */
  static extendConfig(config: MarkdownItRendererConfig = MarkdownItRenderer.defaultConfig()) {

    const base = MarkdownItRenderer.defaultConfig();

    const baseUttori = base.markdownIt?.uttori;

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
   * @param config A provided configuration to use.
   * @param _context Unused
   * @example <caption>MarkdownItRenderer.validateConfig(config, _context)</caption>
   * MarkdownItRenderer.validateConfig({ ... });
   */
  static validateConfig(config: Record<string, MarkdownItRendererConfig>, _context: unknown) {
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
   * @param context A Uttori-like context.
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
   */
  static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>) {
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }
    const config = MarkdownItRenderer.extendConfig( context.config[MarkdownItRenderer.configKey]);
    if (!config.events || Object.keys(config.events).length === 0) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      const MarkdownItRendererMethod = getPluginMethod<import('@uttori/event-dispatcher').UttoriEventCallback<unknown, unknown, unknown>>(MarkdownItRenderer, method);
      if (MarkdownItRendererMethod) {
        for (const event of eventNames) {

          const callback = MarkdownItRendererMethod;
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }
  }

  /**
   * Renders Markdown for a provided string with a provided context.
   * @param content Markdown content to be converted to HTML.
   * @param context A Uttori-like context.
   * @returns The rendered content.
   * @example <caption>MarkdownItRenderer.renderContent(content, context)</caption>
   * const context = {
   *   config: {
   *     [MarkdownItRenderer.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * MarkdownItRenderer.renderContent(content, context);
   */
  static renderContent(content: string, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): string {
    debug('renderContent');
    if (!context || !context.config || !context.config[MarkdownItRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }

    const config = MarkdownItRenderer.extendConfig( context.config[MarkdownItRenderer.configKey]);
    return MarkdownItRenderer.render(content, config);
  }

  /**
   * Renders Markdown for a collection of Uttori documents with a provided context.
   * @param collection A collection of Uttori documents.
   * @param context A Uttori-like context.
   * @returns The rendered documents.
   * @example <caption>MarkdownItRenderer.renderCollection(collection, context)</caption>
   * const context = {
   *   config: {
   *     [MarkdownItRenderer.configKey]: {
   *       ...,
   *     },
   *   },
   * };
   * MarkdownItRenderer.renderCollection(collection, context);
   */
  static renderCollection(collection: import('../wiki.js').UttoriWikiDocument[], context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): import('../wiki.js').UttoriWikiDocument[] {
    debug('renderCollection:', collection.length);
    if (!context || !context.config || !context.config[MarkdownItRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }

    const config = MarkdownItRenderer.extendConfig( context.config[MarkdownItRenderer.configKey]);
    return collection.map((document) => {
      const html = MarkdownItRenderer.render(document.html, config);
      return { ...document, html };
    });
  }

  /**
   * Renders Markdown for a provided string with a provided MarkdownIt configuration.
   * @param content Markdown content to be converted to HTML.
   * @param [config] A provided MarkdownIt configuration to use.
   * @returns The rendered content.
   * @example <caption>MarkdownItRenderer.render(content, config)</caption>
   * const html = MarkdownItRenderer.render(content, config);
   */
  static render(content: string | undefined, config: MarkdownItRendererConfig = MarkdownItRenderer.defaultConfig()): string {
    if (!content) {
      debug('No input provided, returning a blank string.');
      return '';
    }
    const md = createParser(config);

    // Clean up the content.
    content = MarkdownItRenderer.cleanContent(content, md);
    return md.render(content).trim();
  }

  /**
   * Parse Markdown for a provided string with a provided MarkdownIt configuration.
   * @param content Markdown content to be converted to HTML.
   * @param [config] A provided MarkdownIt configuration to use.
   * @returns The rendered content.
   * @example <caption>MarkdownItRenderer.parse(content, config)</caption>
   * const tokens = MarkdownItRenderer.parse(content, config);
   * @see {@link https://markdown-it.github.io/markdown-it/#MarkdownIt.parse|MarkdownIt.parse}
   */
  static parse(content: string, config: MarkdownItRendererConfig = MarkdownItRenderer.defaultConfig()): import('markdown-it').Token[] {
    if (!content) {
      debug('No input provided, returning an empty array.');
      return [];
    }

    const md = createParser(config);

    // Clean up the content.
    content = MarkdownItRenderer.cleanContent(content, md);
    return md.parse(content, {});
  }

  /**
   * Removes empty links and fills placeholder links outside fenced and indented code.
   * Code source is preserved so diagram labels and code examples are not rewritten.
   * @param content Markdown content to be converted to HTML.
   * @param [md] Parser used to recognize code boundaries, including nested blocks.
   * @returns The rendered content.
   */
  static cleanContent(content: string, md: import('markdown-it').MarkdownIt = new MarkdownIt()): string {
    // Only scan block boundaries when cleanup could change the input. MarkdownIt's
    // line maps handle nested, tilde, and unclosed fences without a second fence grammar.
    if (!/\[.*]\(\s?\)/.test(content)) return content;
    const normalized = content.replace(/\r\n?/g, '\n').replace(/\0/g, '\uFFFD');

    const tokens: import('markdown-it').Token[] = [];
    md.block.parse(normalized, md, {}, tokens);
    const lines = normalized.split(/(?<=\n)/);
    const parts = [];
    let start = 0;
    for (const token of tokens) {
      if ((token.type !== 'fence' && token.type !== 'code_block') || !token.map) continue;
      const [first, last] = token.map;
      parts.push(MarkdownItRenderer.cleanLinks(lines.slice(start, first).join('')));
      parts.push(lines.slice(first, last).join(''));
      start = last;
    }
    parts.push(MarkdownItRenderer.cleanLinks(lines.slice(start).join('')));
    return parts.join('');
  }

  /**
   * Apply legacy placeholder-link cleanup to a source region known to be outside code.
   * @param content Markdown prose to clean.
   * @returns Prose with empty links removed and missing destinations filled.
   */
  static cleanLinks(content: string): string {
    // Remove empty links, as these have caused issues.
    content = content.replace(/\[]\(\)/g, '');

    // Find missing links, and link them.
    const missingLinks = content.match(/\[(.*)]\(\s?\)/g) || [];
    if (missingLinks && missingLinks.length > 0) {
      debug('Found missing links:', missingLinks.length);
      for (const match of missingLinks) {
        const title = match.slice(1).slice(0, -3);
        const slug = slugify(title, { lower: true });
        content = content.replace(match, `[${title}](/${slug})`);
      }
    }

    return content;
  }

  /**
   * Will attempt to extract the table of contents when set to and add it to the view model.
   * @param viewModel Markdown content to be converted to HTML.
   * @param context A Uttori-like context.
   * @returns The view model.
   * @example <caption>MarkdownItRenderer.viewModelDetail(viewModel, context)</caption>
   * viewModel = MarkdownItRenderer.viewModelDetail(viewModel, context);
   */
  static viewModelDetail(viewModel: import('../wiki.js').UttoriWikiViewModel, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): import('../wiki.js').UttoriWikiViewModel | { toc: string } {
    debug('viewModelDetail');
    if (!context || !context.config || !context.config[MarkdownItRenderer.configKey]) {
      throw new Error('Missing configuration.');
    }

    const config = MarkdownItRenderer.extendConfig( context.config[MarkdownItRenderer.configKey]);

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

    const [preToc, tocStart]: string[] = viewModel.document.html.split(config.markdownIt?.uttori?.toc?.openingTag);

    const [toc, postToc]: string[] = tocStart.split(config.markdownIt?.uttori?.toc?.closingTag);

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
