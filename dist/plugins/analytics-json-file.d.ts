import type { AnalyticsPluginConfig, AnalyticsPluginDocumentHandler, AnalyticsPluginGetCountHandler, AnalyticsPluginGetPopularDocumentsHandler } from '../types/plugins/analytics-json-file.js';
export type { AnalyticsPluginPopularDocument, AnalyticsPluginConfig, AnalyticsPluginContext, AnalyticsPluginDocumentHandler, AnalyticsPluginGetCountHandler, AnalyticsPluginGetPopularDocumentsHandler, } from '../types/plugins/analytics-json-file.js';
/**
 * Page view analytics for Uttori documents using JSON files stored on the local file system.
 * @example <caption>Init AnalyticsProvider</caption>
 * const analyticsProvider = new AnalyticsProvider({ directory: 'data' });
 */
declare class AnalyticsPlugin {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>AnalyticsPlugin.configKey</caption>
     * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
     */
    static get configKey(): 'uttori-plugin-analytics-json-file';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>AnalyticsPlugin.defaultConfig()</caption>
     * const config = { ...AnalyticsPlugin.defaultConfig(), ...context.config[AnalyticsPlugin.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<AnalyticsPluginConfig, 'name' | 'extension' | 'limit' | 'events' | 'directory'>;
    /**
     * Validates the provided configuration for required entries.
     * @param _analytics - An AnalyticsProvider instance (unused).
     * @example <caption>AnalyticsPlugin.validateConfig(config, _context)</caption>
     * AnalyticsPlugin.validateConfig({ ... });
     */
    static validateConfig(_analytics: AnalyticsPlugin): (config: Record<string, AnalyticsPluginConfig>, _context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>) => void;
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
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-analytics-json-file', AnalyticsPluginConfig>): void;
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
    static updateDocument(analytics: import('./utilities/analytics-provider.js').default): AnalyticsPluginDocumentHandler;
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
    static getCount(analytics: import('./utilities/analytics-provider.js').default): AnalyticsPluginGetCountHandler;
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
    static getPopularDocuments(analytics: import('./utilities/analytics-provider.js').default): AnalyticsPluginGetPopularDocumentsHandler;
}
export default AnalyticsPlugin;
//# sourceMappingURL=analytics-json-file.d.ts.map