export default TagRoutesPlugin;
export type TagRoutesPluginConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]>;
    /**
     * The default title for tag pages.
     */
    title?: string;
    /**
     * The maximum number of documents to return for a tag.
     */
    limit?: number;
    /**
     * Middleware for tag routes.
     */
    middleware?: Record<string, import("express").RequestHandler[]>;
    /**
     * A replacement route for the tag index route.
     */
    tagIndexRoute?: string;
    /**
     * A replacement route for the tag show route.
     */
    tagRoute?: string;
    /**
     * A replacement route for the tag index route.
     */
    apiRoute?: string;
    /**
     * A replacement route handler for the tag index route.
     */
    tagIndexRequestHandler?: (arg0: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>) => import("express").RequestHandler;
    /**
     * A replacement route handler for the tag show route.
     */
    tagRequestHandler?: (arg0: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>) => import("express").RequestHandler;
    /**
     * A request handler for the API route.
     */
    apiRequestHandler?: (arg0: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>) => import("express").RequestHandler;
};
/**
 * @typedef {object} TagRoutesPluginConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [title] The default title for tag pages.
 * @property {number} [limit] The maximum number of documents to return for a tag.
 * @property {Record<string, import("express").RequestHandler[]>} [middleware] Middleware for tag routes.
 * @property {string} [tagIndexRoute] A replacement route for the tag index route.
 * @property {string} [tagRoute] A replacement route for the tag show route.
 * @property {string} [apiRoute] A replacement route for the tag index route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>): import('express').RequestHandler} [tagIndexRequestHandler] A replacement route handler for the tag index route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>): import('express').RequestHandler} [tagRequestHandler] A replacement route handler for the tag show route.
 * @property {function(import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>): import('express').RequestHandler} [apiRequestHandler] A request handler for the API route.
 */
/**
 * Tag routes plugin for Uttori Wiki.
 * Provides tag index and individual tag pages functionality.
 * @property {TagRoutesPluginConfig} config The configuration object.
 * @example <caption>Init TagRoutesPlugin</caption>
 * const tagPlugin = new TagRoutesPlugin();
 * @class
 */
declare class TagRoutesPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>TagRoutesPlugin.configKey</caption>
     * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {TagRoutesPluginConfig} The configuration.
     * @example <caption>TagRoutesPlugin.defaultConfig()</caption>
     * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
     * @static
     */
    static defaultConfig(): TagRoutesPluginConfig;
    /**
     * Create a config that is extended from the default config.
     * @param {TagRoutesPluginConfig} config The user provided configuration.
     * @returns {TagRoutesPluginConfig} The new configration.
     */
    static extendConfig(config?: TagRoutesPluginConfig): TagRoutesPluginConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, TagRoutesPluginConfig>} config A configuration object.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} _context - A Uttori-like context (unused).
     * @example <caption>TagRoutesPlugin.validateConfig(config, _context)</caption>
     * TagRoutesPlugin.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, TagRoutesPluginConfig>, _context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
     * @example <caption>TagRoutesPlugin.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [TagRoutesPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * TagRoutesPlugin.register(context);
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>): void;
    /**
     * Wrapper function for binding tag routes.
     * @param {import('express').Application} server An Express server instance.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
     * @example <caption>TagRoutesPlugin.bindRoutes(plugin)</caption>
     * const context = {
     *   config: {
     *     [TagRoutesPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * TagRoutesPlugin.bindRoutes(plugin);
     * @static
     */
    static bindRoutes(server: import("express").Application, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>): void;
    /**
     * Returns the documents with the provided tag, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
     *
     * Hooks:
     * - `fetch` - `storage-query` - Searched for the tagged documents.
     * @async
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
     * @param {string} tag The tag to look for in documents.
     * @returns {Promise<import('../wiki.js').UttoriWikiDocument[]>} Promise object that resolves to the array of the documents.
     * @example
     * plugin.getTaggedDocuments('example', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
     */
    static getTaggedDocuments(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>, tag: string): Promise<import("../wiki.js").UttoriWikiDocument[]>;
    /**
     * Renders the tag index page with the `tags` template.
     *
     * Hooks:
     * - `filter` - `view-model-tag-index` - Passes in the viewModel.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static tagIndexRequestHandler(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>): import("express").RequestHandler;
    /**
     * Renders the tag detail page with `tag` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     * Attempts to pull in the relevant site section for the tag if defined in the config site sections.
     *
     * Hooks:
     * - `filter` - `view-model-tag` - Passes in the viewModel.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static tagRequestHandler(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>): import("express").RequestHandler;
}
//# sourceMappingURL=tag-routes.d.ts.map