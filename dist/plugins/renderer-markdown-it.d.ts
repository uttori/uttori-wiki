import { referenceTag, definitionOpenTag } from './markdown-it-plugin/footnotes.js';
import type { MarkdownItRendererOptions, MarkdownItRendererConfig } from '../types/plugins/renderer-markdown-it.js';
export type { MarkdownItExample, MarkdownItRendererOptionsUttori, MarkdownItRendererOptions, MarkdownItRendererConfig, MarkdownItRendererInputOptions, } from '../types/plugins/renderer-markdown-it.js';
/**
 * Uttori MarkdownIt Renderer
 * @example <caption>MarkdownItRenderer</caption>
 * const content = MarkdownItRenderer.render("...");
 */
declare class MarkdownItRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>MarkdownItRenderer.configKey</caption>
     * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
     */
    static get configKey(): 'uttori-plugin-renderer-markdown-it';
    /**
     * The default configuration.
     * @returns The default configuration.
     * @example <caption>MarkdownItRenderer.defaultConfig()</caption>
     * const config = { ...MarkdownItRenderer.defaultConfig(), ...context.config[MarkdownItRenderer.configKey] };
     */
    static defaultConfig(): {
        markdownIt: MarkdownItRendererOptions;
    };
    /**
     * Create a config that is extended from the default config.
     * @param config The user provided configuration.
     * @returns The new configration.
     */
    static extendConfig(config?: MarkdownItRendererConfig): {
        events?: Record<string, string[]>;
        markdownIt: {
            html?: boolean;
            xhtmlOut?: boolean;
            breaks?: boolean;
            langPrefix?: string;
            linkify?: boolean;
            typographer?: boolean;
            quotes?: string | string[];
            uttori: {
                baseUrl: string;
                allowedExternalDomains: string[];
                disableValidation: boolean;
                openNewWindow: boolean;
                lazyImages: boolean;
                mermaid?: boolean;
                examples?: Record<string, import("../types/plugins/renderer-markdown-it.js").MarkdownItExample>;
                footnotes: {
                    referenceTag: typeof import("./markdown-it-plugin/footnotes.js").referenceTag;
                    definitionOpenTag: typeof import("./markdown-it-plugin/footnotes.js").definitionOpenTag;
                    definitionCloseTag: string;
                };
                toc: {
                    extract: boolean;
                    openingTag: string;
                    closingTag: string;
                    slugify: object;
                    stableIds?: boolean;
                };
                wikilinks: {
                    slugify: object;
                };
            };
        };
    };
    /**
     * Validates the provided configuration for required entries.
     * @param config A provided configuration to use.
     * @param _context Unused
     * @example <caption>MarkdownItRenderer.validateConfig(config, _context)</caption>
     * MarkdownItRenderer.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, MarkdownItRendererConfig>, _context: unknown): void;
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
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): void;
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
    static renderContent(content: string, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): string;
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
    static renderCollection(collection: import('../wiki.js').UttoriWikiDocument[], context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): import('../wiki.js').UttoriWikiDocument[];
    /**
     * Renders Markdown for a provided string with a provided MarkdownIt configuration.
     * @param content Markdown content to be converted to HTML.
     * @param [config] A provided MarkdownIt configuration to use.
     * @returns The rendered content.
     * @example <caption>MarkdownItRenderer.render(content, config)</caption>
     * const html = MarkdownItRenderer.render(content, config);
     */
    static render(content: string | undefined, config?: MarkdownItRendererConfig): string;
    /**
     * Parse Markdown for a provided string with a provided MarkdownIt configuration.
     * @param content Markdown content to be converted to HTML.
     * @param [config] A provided MarkdownIt configuration to use.
     * @returns The rendered content.
     * @example <caption>MarkdownItRenderer.parse(content, config)</caption>
     * const tokens = MarkdownItRenderer.parse(content, config);
     * @see {@link https://markdown-it.github.io/markdown-it/#MarkdownIt.parse|MarkdownIt.parse}
     */
    static parse(content: string, config?: MarkdownItRendererConfig): import('markdown-it').Token[];
    /**
     * Removes empty links and fills placeholder links outside fenced and indented code.
     * Code source is preserved so diagram labels and code examples are not rewritten.
     * @param content Markdown content to be converted to HTML.
     * @param [md] Parser used to recognize code boundaries, including nested blocks.
     * @returns The rendered content.
     */
    static cleanContent(content: string, md?: import('markdown-it').MarkdownIt): string;
    /**
     * Apply legacy placeholder-link cleanup to a source region known to be outside code.
     * @param content Markdown prose to clean.
     * @returns Prose with empty links removed and missing destinations filled.
     */
    static cleanLinks(content: string): string;
    /**
     * Will attempt to extract the table of contents when set to and add it to the view model.
     * @param viewModel Markdown content to be converted to HTML.
     * @param context A Uttori-like context.
     * @returns The view model.
     * @example <caption>MarkdownItRenderer.viewModelDetail(viewModel, context)</caption>
     * viewModel = MarkdownItRenderer.viewModelDetail(viewModel, context);
     */
    static viewModelDetail(viewModel: import('../wiki.js').UttoriWikiViewModel, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-markdown-it', MarkdownItRendererConfig>): import('../wiki.js').UttoriWikiViewModel | {
        toc: string;
    };
}
export default MarkdownItRenderer;
//# sourceMappingURL=renderer-markdown-it.d.ts.map