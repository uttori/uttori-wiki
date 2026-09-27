import type { TagRoutesPluginConfig, TagRoutesContext } from '../types/plugins/tag-routes.js';
export type { TagRoutesPluginConfig, TagRoutesContext, TagRoutesRequestHandler } from '../types/plugins/tag-routes.js';
/**
 * Tag routes plugin for Uttori Wiki.
 * Provides tag index and individual tag pages functionality.
 * @example <caption>Init TagRoutesPlugin</caption>
 * const tagPlugin = new TagRoutesPlugin();
 */
declare class TagRoutesPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>TagRoutesPlugin.configKey</caption>
     * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
     */
    static get configKey(): 'uttori-plugin-tag-routes';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>TagRoutesPlugin.defaultConfig()</caption>
     * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<TagRoutesPluginConfig, 'title' | 'limit' | 'tagIndexRoute' | 'tagRoute' | 'apiRoute' | 'middleware' | 'events' | 'tagIndexRequestHandler' | 'tagRequestHandler' | 'apiRequestHandler'>;
    /**
     * Create a config that is extended from the default config.
     * @param config The user provided configuration.
     * @returns The new configration.
     */
    static extendConfig(config?: TagRoutesPluginConfig): {
        title: string;
        limit: number;
        tagIndexRoute: string;
        tagRoute: string;
        apiRoute: string;
        tagIndexRequestHandler: import("../types/plugins/tag-routes.js").TagRoutesRequestHandler;
        tagRequestHandler: import("../types/plugins/tag-routes.js").TagRoutesRequestHandler;
        apiRequestHandler: import("../types/plugins/tag-routes.js").TagRoutesRequestHandler;
        events: {
            [x: string]: string[];
        };
        middleware: {
            [x: string]: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>[];
        };
    };
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context - A Uttori-like context (unused).
     * @example <caption>TagRoutesPlugin.validateConfig(config, _context)</caption>
     * TagRoutesPlugin.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, TagRoutesPluginConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
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
     */
    static register(context: TagRoutesContext): void;
    /**
     * Wrapper function for binding tag routes.
     * @param server An Express server instance.
     * @param context A Uttori-like context.
     * @example <caption>TagRoutesPlugin.bindRoutes(plugin)</caption>
     * const context = {
     *   config: {
     *     [TagRoutesPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * TagRoutesPlugin.bindRoutes(plugin);
     */
    static bindRoutes(server: import('express').Application, context: TagRoutesContext): void;
    /**
     * Normalize document tags before the document is saved.
     * @param document The document being saved.
     * @param _context A Uttori-like context.
     * @returns The document with normalized tags.
     */
    static normalizeDocumentTags(document: import('../wiki.js').UttoriWikiDocument, _context: TagRoutesContext): import('../wiki.js').UttoriWikiDocument;
    /**
     * Returns the documents with the provided tag, up to the provided limit.
     * This will exclude any documents that have slugs in the `config.ignoreSlugs` array.
     *
     * Hooks:
     * - `fetch` - `storage-query` - Searched for the tagged documents.
     * @async
     * @param context A Uttori-like context.
     * @param tag The tag to look for in documents.
     * @returns Promise object that resolves to the array of the documents.
     * @example
     * plugin.getTaggedDocuments('example', 10);
     * ➜ [{ slug: 'example', title: 'Example', content: 'Example content.', tags: ['example'] }]
     */
    static getTaggedDocuments(context: TagRoutesContext, tag: string): Promise<import('../wiki.js').UttoriWikiDocument[]>;
    /**
     * Renders the tag index page with the `tags` template.
     *
     * Hooks:
     * - `filter` - `view-model-tag-index` - Passes in the viewModel.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static tagIndexRequestHandler(context: TagRoutesContext): import('express').RequestHandler;
    /**
     * Renders the tag detail page with `tag` template.
     * Sets the `X-Robots-Tag` header to `noindex`.
     * Attempts to pull in the relevant site section for the tag if defined in the config site sections.
     *
     * Hooks:
     * - `filter` - `view-model-tag` - Passes in the viewModel.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static tagRequestHandler(context: TagRoutesContext): import('express').RequestHandler;
}
export default TagRoutesPlugin;
//# sourceMappingURL=tag-routes.d.ts.map