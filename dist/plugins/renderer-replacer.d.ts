import type { ReplacerRendererConfig } from '../types/plugins/renderer-replacer.js';
export type { ReplacerRendererRule, ReplacerRendererConfig } from '../types/plugins/renderer-replacer.js';
/**
 * Uttori Replacer Renderer
 * @example <caption>ReplacerRenderer</caption>
 * const content = ReplacerRenderer.render("...");
 */
declare class ReplacerRenderer {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>ReplacerRenderer.configKey</caption>
     * const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
     */
    static get configKey(): 'uttori-plugin-renderer-replacer';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>ReplacerRenderer.defaultConfig()</caption>
     * const config = { ...ReplacerRenderer.defaultConfig(), ...context.config[ReplacerRenderer.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<ReplacerRendererConfig, 'rules'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param [_context] Unused.
     * @example <caption>ReplacerRenderer.validateConfig(config, _context)</caption>
     * ReplacerRenderer.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, ReplacerRendererConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
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
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>): void;
    /**
     * Replace content in a provided string with a provided context.
     * @param content Content to be converted to HTML.
     * @param context A Uttori-like context.
     * @returns The rendered content.
     * @example <caption>ReplacerRenderer.renderContent(content, context)</caption>
     * const context = {
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * ReplacerRenderer.renderContent(content, context);
     */
    static renderContent(content: string, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>): string;
    /**
     * Replace content in a collection of Uttori documents with a provided context.
     * @param collection A collection of Uttori documents.
     * @param context A Uttori-like context.
     * @returns The rendered documents.
     * @example <caption>ReplacerRenderer.renderCollection(collection, context)</caption>
     * const context = {
     *   config: {
     *     [ReplacerRenderer.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * ReplacerRenderer.renderCollection(collection, context);
     */
    static renderCollection(collection: import('../wiki.js').UttoriWikiDocument[], context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-renderer-replacer', ReplacerRendererConfig>): import('../wiki.js').UttoriWikiDocument[];
    /**
     * Replace content in a provided string with a provided set of rules.
     * @param content Content to be searched through to make replacements.
     * @param config A provided configuration to use.
     * @returns The rendered content.
     * @example <caption>ReplacerRenderer.render(content, config)</caption>
     * const html = ReplacerRenderer.render(content, config);
     */
    static render(content: string, config: ReplacerRendererConfig): string;
}
export default ReplacerRenderer;
//# sourceMappingURL=renderer-replacer.d.ts.map