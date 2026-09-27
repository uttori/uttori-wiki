import type { AddQueryOutputToViewModelConfig } from '../types/plugins/query-output.js';
export type { AddQueryOutputToViewModelQuery, AddQueryOutputToViewModelConfig, AddQueryOutputToViewModelContext, } from '../types/plugins/query-output.js';
/**
 * Add queries output to the view model.
 * @example <caption>AddQueryOutputToViewModel</caption>
 * const viewModel = AddQueryOutputToViewModel.callback(viewModel, context);
 */
declare class AddQueryOutputToViewModel {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>AddQueryOutputToViewModel.configKey</caption>
     * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
     */
    static get configKey(): 'uttori-plugin-add-query-output-to-view-model';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>AddQueryOutputToViewModel.defaultConfig()</caption>
     * const config = { ...AddQueryOutputToViewModel.defaultConfig(), ...context.config[AddQueryOutputToViewModel.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<AddQueryOutputToViewModelConfig, 'queries' | 'events'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config A configuration object.
     * @param _context A Uttori-like context (unused).
     * @example <caption>AddQueryOutputToViewModel.validateConfig(config, _context)</caption>
     * AddQueryOutputToViewModel.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, AddQueryOutputToViewModelConfig>, _context: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
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
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>): void;
    /**
     * Queries for related documents based on similar tags and searches the storage provider.
     * @param eventLabel The event label to run queries for.
     * @param viewModel A Uttori view-model object.
     * @param context A Uttori-like context.
     * @returns The provided view-model document.
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
     */
    static callbackCurry<T extends Record<string, unknown>>(eventLabel: string, viewModel: T, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-add-query-output-to-view-model', AddQueryOutputToViewModelConfig>): Promise<T>;
    /**
     * Curry the hook function to take the current event label.
     * @param eventLabel The event label to run queries for.
     * @returns The provided view-model document.
     * @example <caption>AddQueryOutputToViewModel.callback(eventLabel)</caption>
     */
    static callback(eventLabel: string): import('../custom.js').AddQueryOutputToViewModelCallback;
}
export default AddQueryOutputToViewModel;
//# sourceMappingURL=query-output.d.ts.map