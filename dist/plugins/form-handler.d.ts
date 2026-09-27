import type { FormConfig, FormHandlerConfig, FormHandlerFunction, FormHandlerValidationResult } from '../types/plugins/form-handler.js';
export type { FormFieldValidationFunction, FormField, FormConfig, FormHandlerConfig, FormHandlerFunction, FormHandlerResult, FormHandlerValidationResult, } from '../types/plugins/form-handler.js';
/**
 * Uttori Form Handler Plugin
 * @example <caption>FormHandler</caption>
 * const formHandler = new FormHandler(config);
 */
declare class FormHandler {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>FormHandler.configKey</caption>
     * const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
     */
    static get configKey(): 'uttori-plugin-form-handler';
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>FormHandler.defaultConfig()</caption>
     * const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
     */
    static defaultConfig(): import('../custom.js').DefaultPluginConfig<FormHandlerConfig, 'baseRoute' | 'forms' | 'defaultHandler'>;
    /**
     * Validates the provided configuration for required entries.
     * @param config - A provided configuration to use.
     * @param [_context] Unused.
     * @example <caption>FormHandler.validateConfig(config, _context)</caption>
     * FormHandler.validateConfig({ ... });
     */
    static validateConfig(config: Record<string, FormHandlerConfig>, _context?: unknown): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param context A Uttori-like context.
     * @example
     * ```js
     * const context = {
     *   hooks: {
     *     on: (event, callback) => { ... },
     *   },
     *   config: {
     *     [Plugin.configKey]: {
     *       forms: [...],
     *     },
     *   },
     * };
     * Plugin.register(context);
     * ```
     */
    static register(context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-form-handler', FormHandlerConfig>): void;
    /**
     * Binds routes to the Express app.
     * @param server The Express app.
     * @param context The context.
     */
    static bindRoutes(server: import('express').Application, context: import('../custom.js').UttoriContextWithPluginConfig<'uttori-plugin-form-handler', FormHandlerConfig>): void;
    /**
     * Creates a form handler middleware function.
     * @param formConfig The form configuration.
     * @param defaultHandler The default handler function.
     * @returns Express middleware function.
     */
    static createFormHandler(formConfig: FormConfig, defaultHandler: FormHandlerFunction): import('express').RequestHandler;
    /**
     * Validates form data against form configuration.
     * @param formData The form data to validate.
     * @param formConfig The form configuration.
     * @returns Validation result.
     */
    static validateFormData(formData: Record<string, unknown>, formConfig: FormConfig): FormHandlerValidationResult;
}
export default FormHandler;
//# sourceMappingURL=form-handler.d.ts.map