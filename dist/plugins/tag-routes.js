import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import { routeParamToString } from '../wiki.js';
const debug = createDebug('Uttori.Plugin.TagRoutes');
/**
 * Tag routes plugin for Uttori Wiki.
 * Provides tag index and individual tag pages functionality.
 * @example <caption>Init TagRoutesPlugin</caption>
 * const tagPlugin = new TagRoutesPlugin();
 */
class TagRoutesPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>TagRoutesPlugin.configKey</caption>
     * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
     */
    static get configKey() {
        return 'uttori-plugin-tag-routes';
    }
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>TagRoutesPlugin.defaultConfig()</caption>
     * const config = { ...TagRoutesPlugin.defaultConfig(), ...context.config[TagRoutesPlugin.configKey] };
     */
    static defaultConfig() {
        return {
            title: 'Tags',
            limit: 1024,
            tagIndexRoute: 'tags',
            tagRoute: 'tags',
            apiRoute: 'tag-api',
            middleware: {
                tagIndex: [],
                tag: [],
                api: [],
            },
            events: {
                bindRoutes: ['bind-routes'],
                normalizeDocumentTags: ['document-save'],
                validateConfig: ['validate-config'],
            },
            tagIndexRequestHandler: TagRoutesPlugin.tagIndexRequestHandler,
            tagRequestHandler: TagRoutesPlugin.tagRequestHandler,
            apiRequestHandler: TagRoutesPlugin.tagRequestHandler,
        };
    }
    /**
     * Create a config that is extended from the default config.
     * @param config The user provided configuration.
     * @returns The new configration.
     */
    static extendConfig(config = TagRoutesPlugin.defaultConfig()) {
        const base = TagRoutesPlugin.defaultConfig();
        return {
            ...base,
            ...config,
            events: {
                ...base.events,
                ...config?.events,
            },
            middleware: {
                ...base.middleware,
                ...config?.middleware,
            },
        };
    }
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context - A Uttori-like context (unused).
     * @example <caption>TagRoutesPlugin.validateConfig(config, _context)</caption>
     * TagRoutesPlugin.validateConfig({ ... });
     */
    static validateConfig(config, _context) {
        debug('Validating config...');
        if (!config[TagRoutesPlugin.configKey]) {
            debug(`Config Error: '${TagRoutesPlugin.configKey}' configuration key is missing.`);
            throw new Error(`Config Error: '${TagRoutesPlugin.configKey}' configuration key is missing.`);
        }
        if (!config[TagRoutesPlugin.configKey].tagIndexRoute || typeof config[TagRoutesPlugin.configKey].tagIndexRoute !== 'string') {
            debug(`Config Error: '${TagRoutesPlugin.configKey}.tagIndexRoute' is missing or not a string.`);
            throw new Error(`Config Error: '${TagRoutesPlugin.configKey}.tagIndexRoute' is missing or not a string.`);
        }
        if (!config[TagRoutesPlugin.configKey].tagRoute || typeof config[TagRoutesPlugin.configKey].tagRoute !== 'string') {
            debug(`Config Error: '${TagRoutesPlugin.configKey}.tagRoute' is missing or not a string.`);
            throw new Error(`Config Error: '${TagRoutesPlugin.configKey}.tagRoute' is missing or not a string.`);
        }
        if (!config[TagRoutesPlugin.configKey].apiRoute || typeof config[TagRoutesPlugin.configKey].apiRoute !== 'string') {
            debug(`Config Error: '${TagRoutesPlugin.configKey}.apiRoute' is missing or not a string.`);
            throw new Error(`Config Error: '${TagRoutesPlugin.configKey}.apiRoute' is missing or not a string.`);
        }
        if (!config[TagRoutesPlugin.configKey].title || typeof config[TagRoutesPlugin.configKey].title !== 'string') {
            debug(`Config Error: '${TagRoutesPlugin.configKey}.title' is missing or not a string.`);
            throw new Error(`Config Error: '${TagRoutesPlugin.configKey}.title' is missing or not a string.`);
        }
        debug('Validated config.');
    }
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
    static register(context) {
        if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
            throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
        }
        const config = TagRoutesPlugin.extendConfig(context.config[TagRoutesPlugin.configKey]);
        // Bind events
        for (const [method, events] of Object.entries(config.events)) {
            const TagRoutesPluginMethod = getPluginMethod(TagRoutesPlugin, method);
            if (TagRoutesPluginMethod) {
                for (const event of events) {
                    const callback = TagRoutesPluginMethod;
                    context.hooks.on(event, callback);
                }
            }
            else {
                debug(`Missing function "${method}"`);
            }
        }
    }
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
    static bindRoutes(server, context) {
        debug('bindRoutes');
        const { tagRoute, tagIndexRoute, apiRoute, middleware, tagIndexRequestHandler, tagRequestHandler, apiRequestHandler } = TagRoutesPlugin.extendConfig(context.config[TagRoutesPlugin.configKey]);
        debug('bindRoutes:', { tagRoute, tagIndexRoute, apiRoute });
        server.get(`/${tagIndexRoute}`, ...middleware.tagIndex, tagIndexRequestHandler(context));
        server.get(`/${tagRoute}/:tag`, ...middleware.tag, tagRequestHandler(context));
        server.get(`/${apiRoute}`, ...middleware.api, apiRequestHandler(context));
    }
    /**
     * Normalize document tags before the document is saved.
     * @param document The document being saved.
     * @param _context A Uttori-like context.
     * @returns The document with normalized tags.
     */
    static normalizeDocumentTags(document, _context) {
        let tags = [];
        if (Array.isArray(document.tags)) {
            tags = document.tags;
        }
        else if (typeof document.tags === 'string') {
            tags = document.tags.split(',');
        }
        return {
            ...document,
            tags: [...new Set(tags.map((tag) => tag.trim()))].filter(Boolean).sort((a, b) => a.localeCompare(b)),
        };
    }
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
    static async getTaggedDocuments(context, tag) {
        debug('getTaggedDocuments:', tag);
        const { limit } = TagRoutesPlugin.extendConfig(context.config[TagRoutesPlugin.configKey]);
        let results = [];
        try {
            const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
            const query = `SELECT * FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND tags INCLUDES "${tag}" ORDER BY title ASC LIMIT ${limit}`;
            [results] = await context.hooks.fetch('storage-query', query, context);
            /* c8 ignore next 3 */
        }
        catch (error) {
            debug('getTaggedDocuments Error:', error);
        }
        return results.filter(Boolean);
    }
    /**
     * Renders the tag index page with the `tags` template.
     *
     * Hooks:
     * - `filter` - `view-model-tag-index` - Passes in the viewModel.
     * @param context A Uttori-like context.
     * @returns The function to pass to Express.
     */
    static tagIndexRequestHandler(context) {
        return async (request, response, _next) => {
            debug('tagIndexRequestHandler');
            const ignoreSlugs = `"${context.config.ignoreSlugs.join('", "')}"`;
            const ignoreTags = `"${context.config.ignoreTags.join('", "')}"`;
            const query = `SELECT tags FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND tags EXCLUDES (${ignoreTags}) ORDER BY updateDate DESC LIMIT -1`;
            let tags = [];
            try {
                // Fetch all the used tags.
                const [results] = await context.hooks.fetch('storage-query', query, context);
                // Organize and deduplicate, and sort the tags.
                tags = [...new Set(results.flatMap((t) => t.tags))].filter(Boolean).sort((a, b) => a.localeCompare(b));
                /* c8 ignore next 3 */
            }
            catch (error) {
                debug('Error fetching tags:', error);
            }
            // Collect & sort all the tagged documents for each tag.
            const taggedDocuments = {};
            await Promise.all(tags.map(async (tag) => {
                const sorted = await TagRoutesPlugin.getTaggedDocuments(context, tag);
                taggedDocuments[tag] = sorted.sort((a, b) => a.title.localeCompare(b.title));
            }));
            const meta = await context.buildMetadata({}, `/${context.config[TagRoutesPlugin.configKey].tagIndexRoute}`);
            let viewModel = {
                ...context.buildViewModelBase(request, { title: context.config[TagRoutesPlugin.configKey].title, meta }),
                taggedDocuments,
            };
            viewModel = await context.hooks.filter('view-model-tag-index', viewModel, context);
            if (context.config.useCache) {
                response.set('Cache-control', `public, max-age=${context.config.cacheShort}`);
            }
            response.render('tags', viewModel);
        };
    }
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
    static tagRequestHandler(context) {
        return async (request, response, next) => {
            debug('tagRequestHandler');
            const tag = routeParamToString(request.params.tag);
            const taggedDocuments = await TagRoutesPlugin.getTaggedDocuments(context, tag);
            if (taggedDocuments.length === 0) {
                debug('No documents for tag!');
                next();
                return;
            }
            const meta = await context.buildMetadata({}, `/${context.config[TagRoutesPlugin.configKey].tagRoute}/${tag}`);
            const title = `${tag} Tagged Documents`;
            let viewModel = {
                ...context.buildViewModelBase(request, { title, meta }),
                taggedDocuments,
            };
            viewModel = await context.hooks.filter('view-model-tag', viewModel, context);
            if (context.config.useCache) {
                response.set('Cache-control', `public, max-age=${context.config.cacheShort}`);
            }
            response.render('tag', viewModel);
        };
    }
}
export default TagRoutesPlugin;
//# sourceMappingURL=tag-routes.js.map