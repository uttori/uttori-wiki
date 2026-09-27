import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import AnalyticsProvider from './utilities/analytics-provider.js';
const debug = createDebug('Uttori.Plugin.AnalyticsPlugin');
/**
 * Page view analytics for Uttori documents using JSON files stored on the local file system.
 * @example <caption>Init AnalyticsProvider</caption>
 * const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
 */
class AnalyticsPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>AnalyticsPlugin.configKey</caption>
     * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
     */
    static get configKey() {
        return 'uttori-plugin-analytics-json-file';
    }
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>AnalyticsPlugin.defaultConfig()</caption>
     * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
     */
    static defaultConfig() {
        return {
            name: 'visits',
            extension: 'json',
            limit: 10,
            events: {},
            directory: './',
        };
    }
    /**
     * Validates the provided configuration for required entries.
     * @param _analytics - An AnalyticsProvider instance (unused).
     * @example <caption>AnalyticsPlugin.validateConfig(config, _context)</caption>
     * AnalyticsPlugin.validateConfig({ ... });
     */
    static validateConfig(_analytics) {
        /**
         * @param config A configuration object.
         * @param _context - A Uttori-like context (unused).
         */
        const validateConfig = (config, _context) => {
            debug('Validating config...');
            if (!config || !config[AnalyticsPlugin.configKey]) {
                debug(`Config Error: '${AnalyticsPlugin.configKey}' configuration key is missing.`);
                throw new Error(`Config Error: '${AnalyticsPlugin.configKey}' configuration key is missing.`);
            }
            if (!config[AnalyticsPlugin.configKey].directory || typeof config[AnalyticsPlugin.configKey].directory !== 'string') {
                debug('Config Error: `directory` is required should be the path to the location you want the JSON file to be writtent to.');
                throw new Error('directory is required should be the path to the location you want the JSON file to be writtent to.');
            }
            if (!config[AnalyticsPlugin.configKey].limit || typeof config[AnalyticsPlugin.configKey].limit !== 'number') {
                debug('Config Error: `limit` is required should be the number of documents to return.');
                throw new Error('limit is required should be the number of documents to return.');
            }
            debug('Validated config.');
        };
        return validateConfig;
    }
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
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
     */
    static register(context) {
        if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
            throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
        }
        const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
        if (!config.events) {
            throw new Error('Missing events to listen to for in \'config.events\'.');
        }
        // Bind events
        const analytics = new AnalyticsProvider(config);
        for (const [method, eventNames] of Object.entries(config.events)) {
            const AnalyticsPluginMethod = getPluginMethod(AnalyticsPlugin, method);
            if (AnalyticsPluginMethod) {
                for (const event of eventNames) {
                    const callback = AnalyticsPluginMethod.call(AnalyticsPlugin, analytics);
                    context.hooks.on(event, callback);
                }
            }
            else {
                debug(`Missing function "${method}"`);
            }
        }
    }
    /**
     * Wrapper function for calling update.
     * @param analytics An AnalyticsProvider instance.
     * @returns The provided document.
     * @example <caption>AnalyticsPlugin.updateDocument(analytics)</caption>
     * const context = {
     * config: {
     * [AnalyticsPlugin.configKey]: {
     * ...,
     * },
     * },
     * };
     * AnalyticsPlugin.updateDocument(document, null);
     */
    static updateDocument(analytics) {
        return (document, _context) => {
            debug('updateDocument');
            if (document?.slug) {
                analytics.update(document.slug);
            }
            return document;
        };
    }
    /**
     * Wrapper function for calling update.
     * @param analytics An AnalyticsProvider instance.
     * @returns The view count for the document.
     * @example <caption>AnalyticsPlugin.getCount(analytics, slug)</caption>
     * const context = {
     * config: {
     * [AnalyticsPlugin.configKey]: {
     * ...,
     * },
     * },
     * };
     * AnalyticsPlugin.getCount(analytics, slug);
     */
    static getCount(analytics) {
        return (document, _context) => {
            debug('getCount');
            let count = 0;
            if (document?.slug) {
                count = analytics.get(document.slug);
            }
            return count;
        };
    }
    /**
     * Wrapper function for calling update.
     * @param analytics An AnalyticsProvider instance.
     * @returns Popular documents.
     * @example <caption>AnalyticsPlugin.getPopularDocuments(analytics)</caption>
     * const context = {
     * config: {
     * [AnalyticsPlugin.configKey]: {
     * ...,
     * },
     * },
     * };
     * AnalyticsPlugin.getPopularDocuments(analytics);
     */
    static getPopularDocuments(analytics) {
        return (_data, context) => {
            debug('getPopularDocuments');
            let documents = [];
            const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
            documents = analytics.getPopularDocuments(config.limit);
            return documents;
        };
    }
}
export default AnalyticsPlugin;
//# sourceMappingURL=analytics-json-file.js.map