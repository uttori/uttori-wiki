export default AnalyticsPlugin;
export type AnalyticsPluginPopularDocument = {
    /**
     * The slug of the document.
     */
    slug: string;
    /**
     * The count of the document.
     */
    count: number;
};
export type AnalyticsPluginConfig = {
    /**
     * An object whose keys correspond to methods, and contents are events to listen for.
     */
    events?: Record<string, string[]> | undefined;
    /**
     * The name of the analytics file. The default is 'visits'.
     */
    name?: string | undefined;
    /**
     * The extension of the analytics file. The default is 'json'.
     */
    extension?: string | undefined;
    /**
     * The path to the location you want the JSON file to be writtent to.
     */
    directory: string;
    /**
     * The limit of documents to return. The default is 10.
     */
    limit?: number | undefined;
};
/**
 * Uttori context narrowed to this plugin's config shape.
 */
export type AnalyticsPluginContext = import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-analytics-json-file", AnalyticsPluginConfig>;
export type AnalyticsPluginDocumentHandler = (document: import("../wiki.js").UttoriWikiDocument, context: AnalyticsPluginContext) => import("../wiki.js").UttoriWikiDocument;
export type AnalyticsPluginGetCountHandler = (document: import("../wiki.js").UttoriWikiDocument, context: AnalyticsPluginContext) => number;
export type AnalyticsPluginGetPopularDocumentsHandler = (data: unknown, context: AnalyticsPluginContext) => AnalyticsPluginPopularDocument[];
/**
 * @typedef {object} AnalyticsPluginPopularDocument
 * @property {string} slug The slug of the document.
 * @property {number} count The count of the document.
 */
/**
 * @typedef {object} AnalyticsPluginConfig
 * @property {Record<string, string[]>} [events] An object whose keys correspond to methods, and contents are events to listen for.
 * @property {string} [name] The name of the analytics file. The default is 'visits'.
 * @property {string} [extension] The extension of the analytics file. The default is 'json'.
 * @property {string} directory The path to the location you want the JSON file to be writtent to.
 * @property {number} [limit] The limit of documents to return. The default is 10.
 */
/**
 * Uttori context narrowed to this plugin's config shape.
 * @typedef {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>} AnalyticsPluginContext
 */
/**
 * @callback AnalyticsPluginDocumentHandler
 * @param {import('../wiki.js').UttoriWikiDocument} document The document being processed.
 * @param {AnalyticsPluginContext} context A Uttori-like context.
 * @returns {import('../wiki.js').UttoriWikiDocument} The provided document.
 */
/**
 * @callback AnalyticsPluginGetCountHandler
 * @param {import('../wiki.js').UttoriWikiDocument} document The document being processed.
 * @param {AnalyticsPluginContext} context A Uttori-like context.
 * @returns {number} The view count.
 */
/**
 * @callback AnalyticsPluginGetPopularDocumentsHandler
 * @param {unknown} data Unused request data.
 * @param {AnalyticsPluginContext} context A Uttori-like context.
 * @returns {AnalyticsPluginPopularDocument[]} Popular documents.
 */
/**
 * Page view analytics for Uttori documents using JSON files stored on the local file system.
 * @property {AnalyticsPluginConfig} config The configuration object.
 * @example <caption>Init AnalyticsProvider</caption>
 * const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
 * @class
 */
declare class AnalyticsPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>AnalyticsPlugin.configKey</caption>
     * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {AnalyticsPluginConfig} The configuration.
     * @example <caption>AnalyticsPlugin.defaultConfig()</caption>
     * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
     * @static
     */
    static defaultConfig(): AnalyticsPluginConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {AnalyticsPlugin} _analytics - An AnalyticsProvider instance (unused).
     * @example <caption>AnalyticsPlugin.validateConfig(config, _context)</caption>
     * AnalyticsPlugin.validateConfig({ ... });
     * @static
     */
    static validateConfig(_analytics: AnalyticsPlugin): (config: Record<string, AnalyticsPluginConfig>, _context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-analytics-json-file", AnalyticsPluginConfig>) => void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>} context A Uttori-like context.
     * @example <caption>AnalyticsPlugin.register(context)</caption>
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [AnalyticsPlugin.configKey]: {
     *       ...,
     *       events: {
     *         updateDocument: ['document-save', 'document-delete'],
     *         validateConfig: ['validate-config'],
     *       },
     *     },
     *   },
     * };
     * AnalyticsPlugin.register(context);
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-analytics-json-file", AnalyticsPluginConfig>): void;
    /**
     * Wrapper function for calling update.
     * @param {import('./utilities/analytics-provider.js').default} analytics An AnalyticsProvider instance.
     * @returns {AnalyticsPluginDocumentHandler} The provided document.
     * @example <caption>AnalyticsPlugin.updateDocument(analytics)</caption>
     * const context = {
     *   config: {
     *     [AnalyticsPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * AnalyticsPlugin.updateDocument(document, null);
     * @static
     */
    static updateDocument(analytics: import("./utilities/analytics-provider.js").default): AnalyticsPluginDocumentHandler;
    /**
     * Wrapper function for calling update.
     * @param {import('./utilities/analytics-provider.js').default} analytics An AnalyticsProvider instance.
     * @returns {AnalyticsPluginGetCountHandler} The view count for the document.
     * @example <caption>AnalyticsPlugin.getCount(analytics, slug)</caption>
     * const context = {
     *   config: {
     *     [AnalyticsPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * AnalyticsPlugin.getCount(analytics, slug);
     * @static
     */
    static getCount(analytics: import("./utilities/analytics-provider.js").default): AnalyticsPluginGetCountHandler;
    /**
     * Wrapper function for calling update.
     * @param {import('./utilities/analytics-provider.js').default} analytics An AnalyticsProvider instance.
     * @returns {AnalyticsPluginGetPopularDocumentsHandler} Popular documents.
     * @example <caption>AnalyticsPlugin.getPopularDocuments(analytics)</caption>
     * const context = {
     *   config: {
     *     [AnalyticsPlugin.configKey]: {
     *       ...,
     *     },
     *   },
     * };
     * AnalyticsPlugin.getPopularDocuments(analytics);
     * @static
     */
    static getPopularDocuments(analytics: import("./utilities/analytics-provider.js").default): AnalyticsPluginGetPopularDocumentsHandler;
}
//# sourceMappingURL=analytics-json-file.d.ts.map