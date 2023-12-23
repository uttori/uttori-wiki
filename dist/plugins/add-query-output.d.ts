export default AddQueryOutputToViewModel;
export type AddQueryOutputToViewModelQuery = {
    /**
     * The query to be run.
     */
    query?: string;
    /**
     * The key to add the query output to.
     */
    key: string;
    /**
     * The fallback value to use if the query fails.
     */
    fallback: object[];
    /**
     * An optional function to format the query output.
     */
    format?: import('../../dist/custom.js').AddQueryOutputToViewModelFormatFunction;
    /**
     * An optional custom function to execut the query.
     */
    queryFunction?: import('../../dist/custom.js').AddQueryOutputToViewModelQueryFunction;
};
export type AddQueryOutputToViewModelConfig = {
    /**
     * The array of quieries to be run and returned that will be added to the passed in object and returned with the querie output added.
     */
    queries: Record<string, AddQueryOutputToViewModelQuery[]>;
    /**
     * An object whose keys correspong to methods, and contents are events to listen for.
     */
    events: Record<string, string[]>;
};
/**
 * @typedef {object} AddQueryOutputToViewModelQuery
 * @property {string} [query] The query to be run.
 * @property {string} key The key to add the query output to.
 * @property {object[]} fallback The fallback value to use if the query fails.
 * @property {import('../../dist/custom.js').AddQueryOutputToViewModelFormatFunction} [format] An optional function to format the query output.
 * @property {import('../../dist/custom.js').AddQueryOutputToViewModelQueryFunction} [queryFunction] An optional custom function to execut the query.
 * @example <caption>Query with a custom function</caption>
 * {
 *   query: 'query',
 *   key: 'key',
 *   fallback: [],
 *   format: (results) => results.map((result) => result.slug),
 *   queryFunction: async (target, context) => {
 *     const ignoreSlugs = ['home-page'];
 *     const [popular] = await context.hooks.fetch('popular-documents', { limit: 5 }, context);
 *     const slugs = `"${popular.map(({ slug }) => slug).join('", "')}"`;
 *     const query = `SELECT 'slug', 'title' FROM documents WHERE slug NOT_IN (${ignoreSlugs}) AND slug IN (${slugs}) ORDER BY updateDate DESC LIMIT 5`;
 *     const [results] = await context.hooks.fetch('storage-query', query);
 *     return [results];
 *   },
 * }
 * @example <caption>Query with a formatting function</caption>
 * {
 *   key: 'tags',
 *   query: `SELECT tags FROM documents WHERE slug NOT_IN ("${ignoreSlugs.join('", "')}") ORDER BY id ASC LIMIT -1`,
 *   format: (tags) => [...new Set(tags.flatMap((t) => t.tags))].filter(Boolean).sort((a, b) => a.localeCompare(b)),
 *   fallback: [],
 * }
 */
/**
 * @typedef {object} AddQueryOutputToViewModelConfig
 * @property {Record<string, AddQueryOutputToViewModelQuery[]>} queries The array of quieries to be run and returned that will be added to the passed in object and returned with the querie output added.
 * @property {Record<string, string[]>} events An object whose keys correspong to methods, and contents are events to listen for.
 */
/**
 * Add tags to the view model.
 * @example <caption>AddQueryOutputToViewModel</caption>
 * const viewModel = AddQueryOutputToViewModel.callback(viewModel, context);
 * @class
 */
declare class AddQueryOutputToViewModel {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>AddQueryOutputToViewModel.configKey</caption>
     * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {AddQueryOutputToViewModelConfig} The configuration.
     * @example <caption>AddQueryOutputToViewModel.defaultConfig()</caption>
     * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
     * @static
     */
    static defaultConfig(): AddQueryOutputToViewModelConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, AddQueryOutputToViewModelConfig>} config A configuration object.
     * @param {object} _context A Uttori-like context (unused).
     * @example <caption>AddQueryOutputToViewModel.validateConfig(config, _context)</caption>
     * AddQueryOutputToViewModel.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, AddQueryOutputToViewModelConfig>, _context: object): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.js').UttoriContext} context A Uttori-like context.
     * @example <caption>AddQueryOutputToViewModel.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [AddQueryOutputToViewModel.configKey]: {
     *       ...,
     *       events: {
     *         callback: ['document-save', 'document-delete'],
     *         validateConfig: ['validate-config'],
     *       },
     *       queries: [...],
     *     },
     *   },
     * };
     * AddQueryOutputToViewModel.register(context);
     * @static
     */
    static register(context: import('../../dist/custom.js').UttoriContext): void;
    /**
     * Queries for related documents based on similar tags and searches the storage provider.
     * @param {string} eventLabel The event label to run queries for.
     * @param {object} viewModel A Uttori view-model object.
     * @param {import('../../dist/custom.js').UttoriContext} context A Uttori-like context.
     * @returns {Promise<object[]>} The provided view-model document.
     * @example <caption>AddQueryOutputToViewModel.callback(viewModel, context)</caption>
     * const context = {
     *   config: {
     *     [AddQueryOutputToViewModel.configKey]: {
     *       queries: [...],
     *     },
     *   },
     *   hooks: {
     *     on: (event) => { ... },
     *     fetch: (event, query) => { ... },
     *   },
     * };
     * AddQueryOutputToViewModel.callback(viewModel, context);
     * @static
     */
    static callbackCurry(eventLabel: string, viewModel: object, context: import('../../dist/custom.js').UttoriContext): Promise<object[]>;
    /**
     * Curry the hook function to take the current event label.
     * @param {string} eventLabel The event label to run queries for.
     * @returns {import('../../dist/custom.js').AddQueryOutputToViewModelCallback} The provided view-model document.
     * @example <caption>AddQueryOutputToViewModel.callback(eventLabel)</caption>
     */
    static callback(eventLabel: string): import('../../dist/custom.js').AddQueryOutputToViewModelCallback;
}
//# sourceMappingURL=add-query-output.d.ts.map