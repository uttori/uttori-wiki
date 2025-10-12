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
    events?: Record<string, string[]>;
    /**
     * The name of the analytics file. The default is 'visits'.
     */
    name?: string;
    /**
     * The extension of the analytics file. The default is 'json'.
     */
    extension?: string;
    /**
     * The path to the location you want the JSON file to be writtent to.
     */
    directory: string;
    /**
     * The limit of documents to return. The default is 10.
     */
    limit?: number;
};
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
     * @returns {function(import('../wiki.js').UttoriWikiDocument, import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>): import('../wiki.js').UttoriWikiDocument} The provided document.
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
    static updateDocument(analytics: import("./utilities/analytics-provider.js").default): (arg0: import("../wiki.js").UttoriWikiDocument, arg1: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-analytics-json-file", AnalyticsPluginConfig>) => import("../wiki.js").UttoriWikiDocument;
    /**
     * Wrapper function for calling update.
     * @param {import('./utilities/analytics-provider.js').default} analytics An AnalyticsProvider instance.
     * @returns {function(import('../wiki.js').UttoriWikiDocument, import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>): number} The provided document.
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
    static getCount(analytics: import("./utilities/analytics-provider.js").default): (arg0: import("../wiki.js").UttoriWikiDocument, arg1: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-analytics-json-file", AnalyticsPluginConfig>) => number;
    /**
     * Wrapper function for calling update.
     * @param {import('./utilities/analytics-provider.js').default} analytics An AnalyticsProvider instance.
     * @returns {function(unknown, import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>): Array<AnalyticsPluginPopularDocument>} The provided document.
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
    static getPopularDocuments(analytics: import("./utilities/analytics-provider.js").default): (arg0: unknown, arg1: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-analytics-json-file", AnalyticsPluginConfig>) => Array<AnalyticsPluginPopularDocument>;
}
//# sourceMappingURL=analytics-json-file.d.ts.map