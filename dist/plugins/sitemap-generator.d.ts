export default SitemapGenerator;
export type SitemapGeneratorUrl = {
    /**
     * The URL of the document.
     */
    url: string;
    /**
     * The last modified date of the document.
     */
    lastmod: string;
    /**
     * The priority of the document.
     */
    priority: string;
    /**
     * The change frequency of the document.
     */
    changefreq?: string;
};
export type SitemapGeneratorConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]>;
    /**
     * A collection of Uttori documents.
     */
    urls: SitemapGeneratorUrl[];
    /**
     * A collection of Regular Expression URL filters to exclude documents.
     */
    url_filters?: RegExp[];
    /**
     * The base URL (ie https://domain.tld) for all documents.
     */
    base_url: string;
    /**
     * The path to the location you want the sitemap file to be written to.
     */
    directory: string;
    /**
     * The file name to use for the generated file.
     */
    filename?: string;
    /**
     * The file extension to use for the generated file.
     */
    extension?: string;
    /**
     * Sitemap default page priority.
     */
    page_priority?: string;
    /**
     * Sitemap XML Header, standard XML sitemap header is the default.
     */
    xml_header?: string;
    /**
     * Sitemap XML Footer, standard XML sitemap closing tag is the default.
     */
    xml_footer?: string;
};
/**
 * @typedef {object} SitemapGeneratorUrl
 * @property {string} url The URL of the document.
 * @property {string} lastmod The last modified date of the document.
 * @property {string} priority The priority of the document.
 * @property {string} [changefreq] The change frequency of the document.
 */
/**
 * @typedef {object} SitemapGeneratorConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {SitemapGeneratorUrl[]} urls A collection of Uttori documents.
 * @property {RegExp[]} [url_filters] A collection of Regular Expression URL filters to exclude documents.
 * @property {string} base_url The base URL (ie https://domain.tld) for all documents.
 * @property {string} directory The path to the location you want the sitemap file to be written to.
 * @property {string} [filename='sitemap'] The file name to use for the generated file.
 * @property {string} [extension='xml'] The file extension to use for the generated file.
 * @property {string} [page_priority='0.08'] Sitemap default page priority.
 * @property {string} [xml_header] Sitemap XML Header, standard XML sitemap header is the default.
 * @property {string} [xml_footer] Sitemap XML Footer, standard XML sitemap closing tag is the default.
 */
/**
 * Uttori Sitemap Generator
 *
 * Generates a valid sitemap.xml file for submitting to search engines.
 * @example <caption>SitemapGenerator</caption>
 * const sitemap = SitemapGenerator.generate({ ... });
 * @class
 */
declare class SitemapGenerator {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @static
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>SitemapGenerator.configKey</caption>
     * const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @static
     * @returns {SitemapGeneratorConfig} The configuration.
     * @example <caption>SitemapGenerator.defaultConfig()</caption>
     * const config = { ...SitemapGenerator.defaultConfig(), ...context.config[SitemapGenerator.configKey] };
     */
    static defaultConfig(): SitemapGeneratorConfig;
    /**
     * Validates the provided configuration for required entries.
     * @static
     * @param {Record<string, SitemapGeneratorConfig>} config A configuration object.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>} [_context] A Uttori-like context (unused).
     * @example <caption>SitemapGenerator.validateConfig(config, _context)</caption>
     * SitemapGenerator.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, SitemapGeneratorConfig>, _context?: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-generator-sitemap", SitemapGeneratorConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>} context A Uttori-like context.
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
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-generator-sitemap", SitemapGeneratorConfig>): void;
    /**
     * Wrapper function for calling generating and writing the sitemap file.
     * @static
     * @async
     * @param {import('../../src/wiki.js').UttoriWikiDocument} document A Uttori document (unused).
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>} context A Uttori-like context.
     * @returns {Promise<object>} The provided document.
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
    static callback(document: import("../../src/wiki.js").UttoriWikiDocument, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-generator-sitemap", SitemapGeneratorConfig>): Promise<object>;
    /**
     * Generates a sitemap from the provided context.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-generator-sitemap', SitemapGeneratorConfig>} context A Uttori-like context.
     * @returns {Promise<string>} The generated sitemap.
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
     * @static
     */
    static generateSitemap(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-generator-sitemap", SitemapGeneratorConfig>): Promise<string>;
}
//# sourceMappingURL=sitemap-generator.d.ts.map