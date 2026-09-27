import type { SitemapGeneratorUrl, SitemapGeneratorConfig } from '../types/plugins/sitemap-generator.js';
export type { SitemapGeneratorUrl, SitemapUrlFilter, SitemapGeneratorConfig, } from '../types/plugins/sitemap-generator.js';
/**
 * Uttori Sitemap Generator
 *
 * Generates a valid sitemap.xml file for submitting to search engines.
 * @example <caption>SitemapGenerator</caption>
 * const sitemap = SitemapGenerator.generate({ ... });
 */
declare class SitemapGenerator {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>SitemapGenerator.configKey</caption>
     * const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
     */
    static get configKey(): 'uttori-plugin-generator-sitemap';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>SitemapGenerator.defaultConfig()</caption>
     * const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<SitemapGeneratorConfig, 'urls' | 'url_filters' | 'base_url' | 'directory' | 'filename' | 'extension' | 'page_priority' | 'xml_header' | 'xml_footer'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param [_context] A Uttori-like context (unused).
     * @example <caption>SitemapGenerator.validateConfig(config, _context)</caption>
     * SitemapGenerator.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, SitemapGeneratorConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example <caption>SitemapGenerator.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [SitemapGenerator.configKey]: {
     *       ...,
     *       events: {
     *         callback: ['document-save', 'document-delete'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * SitemapGenerator.register(context);
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>): void;
    /**
     * Wrapper function for calling generating and writing the sitemap file.
     * @async
     * @param document A Uttori document (unused).
     * @param context A Uttori-like context.
     * @returns The provided document.
     * @example <caption>SitemapGenerator.callback(_document, context)</caption>
     * const context = {
     *   config: {
     *     [SitemapGenerator.configKey]: {
     *       ...,
     *     },
     *   },
     *   hooks: {
     *     on: (event) => { ... }
     *   },
     * };
     * SitemapGenerator.callback(null, context);
     */
    static callback(document: import('../wiki.js').UttoriWikiDocument, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>): Promise<object>;
    /**
     * Generates a sitemap from the provided context.
     * @param context A Uttori-like context.
     * @returns The generated sitemap.
     * @example <caption>SitemapGenerator.callback(_document, context)</caption>
     * const context = {
     *   config: {
     *     [SitemapGenerator.configKey]: {
     *       ...,
     *     },
     *   },
     *   hooks: {
     *     on: (event) => { ... },
     *     fetch: (event, query) => { ... },
     *   },
     * };
     * SitemapGenerator.generateSitemap(context);
     */
    static generateSitemap(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>): Promise<string>;
    /**
     * Render an explicit finite route list without querying storage.
     * Static exports use this so the sitemap has exactly the pages in the artifact.
     * @param routes Public paths and their content dates.
     * @param config Sitemap formatting and canonical origin.
     * @returns Sitemap XML.
     */
    static generateRoutes(routes: SitemapGeneratorUrl[], config: Partial<SitemapGeneratorConfig>): string;
}
export default SitemapGenerator;
//# sourceMappingURL=sitemap-generator.d.ts.map