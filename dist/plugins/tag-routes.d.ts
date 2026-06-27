export default TagRoutesPlugin;
export type TagRoutesPluginConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]> | undefined;
    /**
     * The default title for tag pages.
     */
    title?: string | undefined;
    /**
     * The maximum number of documents to return for a tag.
     */
    limit?: number | undefined;
    /**
     * Middleware for tag routes.
     */
    middleware?: Record<string, import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[]> | undefined;
    /**
     * A replacement route for the tag index route.
     */
    tagIndexRoute?: string | undefined;
    /**
     * A replacement route for the tag show route.
     */
    tagRoute?: string | undefined;
    /**
     * A replacement route for the tag index route.
     */
    apiRoute?: string | undefined;
    /**
     * A replacement route handler for the tag index route.
     */
    tagIndexRequestHandler?: TagRoutesRequestHandler | undefined;
    /**
     * A replacement route handler for the tag show route.
     */
    tagRequestHandler?: TagRoutesRequestHandler | undefined;
    /**
     * A request handler for the API route.
     */
    apiRequestHandler?: TagRoutesRequestHandler | undefined;
};
/**
 * Uttori context narrowed to this plugin's config shape.
 */
export type TagRoutesContext = import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-tag-routes", TagRoutesPluginConfig>;
/**
 * Builds an Express handler for a tag route.
 */
export type TagRoutesRequestHandler = (context: TagRoutesContext) => import("express").RequestHandler;
/**
 * @typedef {object} TagRoutesPluginConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [title] The default title for tag pages.
 * @property {number} [limit] The maximum number of documents to return for a tag.
 * @property {Record<string, import("express").RequestHandler[]>} [middleware] Middleware for tag routes.
 * @property {string} [tagIndexRoute] A replacement route for the tag index route.
 * @property {string} [tagRoute] A replacement route for the tag show route.
 * @property {string} [apiRoute] A replacement route for the tag index route.
 * @property {TagRoutesRequestHandler} [tagIndexRequestHandler] A replacement route handler for the tag index route.
 * @property {TagRoutesRequestHandler} [tagRequestHandler] A replacement route handler for the tag show route.
 * @property {TagRoutesRequestHandler} [apiRequestHandler] A request handler for the API route.
 */
/**
 * Uttori context narrowed to this plugin's config shape.
 * @typedef {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-tag-routes', TagRoutesPluginConfig>} TagRoutesContext
 */
/**
 * Builds an Express handler for a tag route.
 * @callback TagRoutesRequestHandler
 * @param {TagRoutesContext} context A Uttori-like context.
 * @returns {import('express').RequestHandler} The Express request handler.
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
     * @param {TagRoutesContext} _context - A Uttori-like context (unused).
     * @example <caption>TagRoutesPlugin.validateConfig(config, _context)</caption>
     * TagRoutesPlugin.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, TagRoutesPluginConfig>, _context: TagRoutesContext): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {TagRoutesContext} context A Uttori-like context.
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
    static register(context: TagRoutesContext): void;
    /**
     * Wrapper function for binding tag routes.
     * @param {import('express').Application} server An Express server instance.
     * @param {TagRoutesContext} context A Uttori-like context.
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
    static bindRoutes(server: import("express").Application, context: TagRoutesContext): void;
    /**
     * Normalize document tags before the document is saved.
     * @param {import('../wiki.js').UttoriWikiDocument} document The document being saved.
     * @param {TagRoutesContext} _context A Uttori-like context.
     * @returns {import('../wiki.js').UttoriWikiDocument} The document with normalized tags.
     * @static
     */
    static normalizeDocumentTags(document: import("../wiki.js").UttoriWikiDocument, _context: TagRoutesContext): import("../wiki.js").UttoriWikiDocument;
    /**
     * Returns the documents with the provided tag, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
     *
     * Hooks:
     * - `fetch` - `storage-query` - Searched for the tagged documents.
     * @async
     * @param {TagRoutesContext} context A Uttori-like context.
     * @param {string} tag The tag to look for in documents.
     * @returns {Promise<import('../wiki.js').UttoriWikiDocument[]>} Promise object that resolves to the array of the documents.
     * @example
     * plugin.getTaggedDocuments('example', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
     */
    static getTaggedDocuments(context: TagRoutesContext, tag: string): Promise<import("../wiki.js").UttoriWikiDocument[]>;
    /**
     * Renders the tag index page with the `tags` template.
     *
     * Hooks:
     * - `filter` - `view-model-tag-index` - Passes in the viewModel.
     * @param {TagRoutesContext} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static tagIndexRequestHandler(context: TagRoutesContext): import("express").RequestHandler;
    /**
     * Renders the tag detail page with `tag` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     * Attempts to pull in the relevant site section for the tag if defined in the config site sections.
     *
     * Hooks:
     * - `filter` - `view-model-tag` - Passes in the viewModel.
     * @param {TagRoutesContext} context A Uttori-like context.
     * @returns {import('express').RequestHandler} The function to pass to Express.
     * @static
     */
    static tagRequestHandler(context: TagRoutesContext): import("express").RequestHandler;
}
//# sourceMappingURL=tag-routes.d.ts.map