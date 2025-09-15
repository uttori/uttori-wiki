export default MarkdownItRenderer;
export type MarkdownItRendererOptionsUttori = {
    /**
     * Prefix for relative URLs, useful when the Express app is not at URI root.
     */
    baseUrl: string;
    /**
     * Allowed External Domains, if a domain is not in this list, it is set to 'nofollow'. Values should be strings of the hostname portion of the URL object (like example.org).
     */
    allowedExternalDomains: string[];
    /**
     * Optionally disable the built in Markdown-It link validation, large security risks when link validation is disabled.
     */
    disableValidation: boolean;
    /**
     * Open external domains in a new window.
     */
    openNewWindow: boolean;
    /**
     * Add lazy loading params to image tags.
     */
    lazyImages: boolean;
    /**
     * Footnote settings.
     */
    footnotes: {
        referenceTag: Function;
        definitionOpenTag: Function;
        definitionCloseTag: string;
    };
    /**
     * Table of Contents settings.
     */
    toc: {
        extract: boolean;
        openingTag: string;
        closingTag: string;
        slugify: object;
    };
    /**
     * WikiLinks settings.
     */
    wikilinks: {
        slugify: object;
    };
};
export type MarkdownItRendererOptions = {
    /**
     * Enable HTML tags in source.
     */
    html?: boolean;
    /**
     * Use '/' to close single tags.
     */
    xhtmlOut?: boolean;
    /**
     * Convert '\n' in paragraphs into <br>.
     */
    breaks?: boolean;
    /**
     * CSS language prefix for fenced blocks.
     */
    langPrefix?: string;
    /**
     * Autoconvert URL-like text to links.
     */
    linkify?: boolean;
    /**
     * Enable some language-neutral replacement + quotes beautification.
     */
    typographer?: boolean;
    /**
     * Double + single quotes replacement pairs.
     */
    quotes?: string;
    /**
     * The Uttori specific configuration.
     */
    uttori: MarkdownItRendererOptionsUttori;
};
export type MarkdownItRendererConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]>;
    /**
     * The MarkdownIt configuration.
     */
    markdownIt: MarkdownItRendererOptions;
};
/**
 * @typedef {object} MarkdownItRendererOptionsUttori
 * @property {string} baseUrl Prefix for relative URLs, useful when the Express app is not at URI root.
 * @property {string[]} allowedExternalDomains Allowed External Domains, if a domain is not in this list, it is set to 'nofollow'. Values should be strings of the hostname portion of the URL object (like example.org).
 * @property {boolean} disableValidation Optionally disable the built in Markdown-It link validation, large security risks when link validation is disabled.
 * @property {boolean} openNewWindow Open external domains in a new window.
 * @property {boolean} lazyImages Add lazy loading params to image tags.
 * @property {object} footnotes Footnote settings.
 * @property {Function} footnotes.referenceTag A funciton to return the default HTML for a footnote reference.
 * @property {Function} footnotes.definitionOpenTag A funciton to return the default opening HTML for a footnote definition.
 * @property {string} footnotes.definitionCloseTag The default closing HTML for a footnote definition.
 * @property {object} toc Table of Contents settings.
 * @property {boolean} toc.extract When true, extract the table of contents to the view model from the content.
 * @property {string} toc.openingTag The opening DOM tag for the TOC container.
 * @property {string} toc.closingTag The closing DOM tag for the TOC container.
 * @property {object} toc.slugify Slugify options for convering headings to anchor links.
 * @property {object} wikilinks WikiLinks settings.
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
declare class MarkdownItRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>MarkdownItRenderer.configKey</caption>
     * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {MarkdownItRendererConfig} The default configuration.
     * @example <caption>MarkdownItRenderer.defaultConfig()</caption>
     * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
     * @static
     */
    static defaultConfig(): MarkdownItRendererConfig;
    /**
     * Create a config that is extended from the default config.
     * @param {MarkdownItRendererConfig} config The user provided configuration.
     * @returns {MarkdownItRendererConfig} The new configration.
     */
    static extendConfig(config?: MarkdownItRendererConfig): MarkdownItRendererConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, MarkdownItRendererConfig>} config A provided configuration to use.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>} _context Unused
     * @example <caption>MarkdownItRenderer.validateConfig(config, _context)</caption>
     * MarkdownItRenderer.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, MarkdownItRendererConfig>, _context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-markdown-it", MarkdownItRendererConfig>): void;
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
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-markdown-it", MarkdownItRendererConfig>): void;
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
    static renderContent(content: string, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-markdown-it", MarkdownItRendererConfig>): string;
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
    static renderCollection(collection: import("../wiki.js").UttoriWikiDocument[], context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-markdown-it", MarkdownItRendererConfig>): import("../wiki.js").UttoriWikiDocument[];
    /**
     * Renders Markdown for a provided string with a provided MarkdownIt configuration.
     * @param {string} content Markdown content to be converted to HTML.
     * @param {MarkdownItRendererConfig} [config] A provided MarkdownIt configuration to use.
     * @returns {string} The rendered content.
     * @example <caption>MarkdownItRenderer.render(content, config)</caption>
     * const html = MarkdownItRenderer.render(content, config);
     * @static
     */
    static render(content: string, config?: MarkdownItRendererConfig): string;
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
    static parse(content: string, config?: MarkdownItRendererConfig): import("markdown-it/index.js").Token[];
    /**
     * Removes empty links, as these have caused issues.
     * Find missing links, and link them to the slug from the provided text.
     * @param {string} content Markdown content to be converted to HTML.
     * @returns {string} The rendered content.
     * @static
     */
    static cleanContent(content: string): string;
    /**
     * Will attempt to extract the table of contents when set to and add it to the view model.
     * @param {import('../wiki.js').UttoriWikiViewModel} viewModel Markdown content to be converted to HTML.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>} context A Uttori-like context.
     * @returns {import('../wiki.js').UttoriWikiViewModel | { toc: string }} The view model.
     * @example <caption>MarkdownItRenderer.viewModelDetail(viewModel, context)</caption>
     * viewModel = MarkdownItRenderer.viewModelDetail(viewModel, context);
     * @static
     */
    static viewModelDetail(viewModel: import("../wiki.js").UttoriWikiViewModel, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-markdown-it", MarkdownItRendererConfig>): import("../wiki.js").UttoriWikiViewModel | {
        toc: string;
    };
}
//# sourceMappingURL=renderer-markdown-it.d.ts.map