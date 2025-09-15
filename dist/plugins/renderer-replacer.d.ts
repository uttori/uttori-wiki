export default ReplacerRenderer;
export type ReplacerRendererRule = {
    /**
     * The test to use for replacing content.
     */
    test: string | RegExp;
    /**
     * The output to use for replacing content.
     */
    output: string;
};
export type ReplacerRendererConfig = {
    /**
     * The rules to use for replacing content.
     */
    rules: ReplacerRendererRule[];
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]>;
};
/**
 * @typedef {object} ReplacerRendererRule
 * @property {string | RegExp} test The test to use for replacing content.
 * @property {string} output The output to use for replacing content.
 */
/**
 * @typedef {object} ReplacerRendererConfig
 * @property {ReplacerRendererRule[]} rules The rules to use for replacing content.
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 */
/**
 * Uttori Replacer Renderer
 * @example <caption>ReplacerRenderer</caption>
 * const content = ReplacerRenderer.render("...");
 * @class
 */
declare class ReplacerRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>ReplacerRenderer.configKey</caption>
     * const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {ReplacerRendererConfig} The configuration.
     * @example <caption>ReplacerRenderer.defaultConfig()</caption>
     * const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
     * @static
     */
    static defaultConfig(): ReplacerRendererConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, ReplacerRendererConfig>} config A configuration object.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>} [_context] Unused.
     * @example <caption>ReplacerRenderer.validateConfig(config, _context)</caption>
     * ReplacerRenderer.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, ReplacerRendererConfig>, _context?: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-replacer", ReplacerRendererConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>} context A Uttori-like context.
     * @example <caption>ReplacerRenderer.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *       events: {
     *         renderContent: ['render-content', 'render-meta-description'],
     *         renderCollection: ['render-search-results'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * ReplacerRenderer.register(context);
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-replacer", ReplacerRendererConfig>): void;
    /**
     * Replace content in a provided string with a provided context.
     * @param {string} content Content to be converted to HTML.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>} context A Uttori-like context.
     * @returns {string} The rendered content.
     * @example <caption>ReplacerRenderer.renderContent(content, context)</caption>
     * const context = {
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * ReplacerRenderer.renderContent(content, context);
     * @static
     */
    static renderContent(content: string, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-replacer", ReplacerRendererConfig>): string;
    /**
     * Replace content in a collection of Uttori documents with a provided context.
     * @param {import('../wiki.js').UttoriWikiDocument[]} collection A collection of Uttori documents.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>} context A Uttori-like context.
     * @returns {import('../wiki.js').UttoriWikiDocument[]} The rendered documents.
     * @example <caption>ReplacerRenderer.renderCollection(collection, context)</caption>
     * const context = {
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * ReplacerRenderer.renderCollection(collection, context);
     * @static
     */
    static renderCollection(collection: import("../wiki.js").UttoriWikiDocument[], context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-renderer-replacer", ReplacerRendererConfig>): import("../wiki.js").UttoriWikiDocument[];
    /**
     * Replace content in a provided string with a provided set of rules.
     * @param {string} content Content to be searched through to make replacements.
     * @param {ReplacerRendererConfig} config A provided configuration to use.
     * @returns {string} The rendered content.
     * @example <caption>ReplacerRenderer.render(content, config)</caption>
     * const html = ReplacerRenderer.render(content, config);
     * @static
     */
    static render(content: string, config: ReplacerRendererConfig): string;
}
//# sourceMappingURL=renderer-replacer.d.ts.map