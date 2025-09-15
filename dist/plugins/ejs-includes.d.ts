export default EJSRenderer;
export type EJSRendererConfig = {
    /**
     * Events to bind to.
     */
    events?: Record<string, string[]>;
    /**
     * EJS configuration.
     */
    ejs?: ejs.Options;
};
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
declare class EJSRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>EJSRenderer.configKey</caption>
     * const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {EJSRendererConfig} The configuration.
     * @example <caption>EJSRenderer.defaultConfig()</caption>
     * const config = { ...EJSRenderer.defaultConfig(), ...context.config[EJSRenderer.configKey] };
     * @static
     */
    static defaultConfig(): EJSRendererConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, EJSRendererConfig>} config A provided configuration to use.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-ejs', EJSRendererConfig>} _context Unused
     * @example <caption>EJSRenderer.validateConfig(config, _context)</caption>
     * EJSRenderer.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, EJSRendererConfig>, _context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-ejs", EJSRendererConfig>): void;
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
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-ejs", EJSRendererConfig>): void;
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
    static renderContent(content: string, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-ejs", EJSRendererConfig>): string;
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
    static renderCollection(collection: import("../wiki.js").UttoriWikiDocument[], context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-ejs", EJSRendererConfig>): import("../wiki.js").UttoriWikiDocument[];
    /**
     * Render EJS content in a provided string.
     * @param {string} content Content to be searched through to make replacements.
     * @param {ejs.Options} config A provided configuration to use.
     * @returns {string} The rendered content.
     * @example <caption>EJSRenderer.render(content, config)</caption>
     * const html = EJSRenderer.render(content, config);
     * @static
     */
    static render(content: string, config: ejs.Options): string;
}
import ejs from 'ejs';
//# sourceMappingURL=ejs-includes.d.ts.map