export default FormHandler;
export type FormField = {
    /**
     * The field name.
     */
    name: string;
    /**
     * The field type (text, email, textarea, etc.).
     */
    type: string;
    /**
     * Whether the field is required.
     */
    required: boolean;
    /**
     * The field label for display.
     */
    label?: string;
    /**
     * The field placeholder text.
     */
    placeholder?: string;
    /**
     * Custom validation function.
     */
    validation?: FormFieldValidationFunction;
    /**
     * Custom error message for validation.
     */
    errorMessage?: string;
};
export type FormFieldValidationFunction = Function;
export type FormConfig = {
    /**
     * The form name/identifier.
     */
    name: string;
    /**
     * The route path for the form submission.
     */
    route: string;
    /**
     * The form fields configuration.
     */
    fields: FormField[];
    /**
     * Custom handler function for form submission.
     */
    handler?: Function;
    /**
     * Success message to return.
     */
    successMessage: string;
    /**
     * Error message to return.
     */
    errorMessage: string;
    /**
     * Custom middleware for the form route.
     */
    middleware?: import("express").RequestHandler[];
};
export type FormHandlerConfig = {
    /**
     * Events to bind to.
     */
    events?: Record<string, string[]>;
    /**
     * Array of form configurations.
     */
    forms: FormConfig[];
    /**
     * Base route prefix for all forms.
     */
    baseRoute?: string;
    /**
     * Default handler function for forms without custom handlers.
     */
    defaultHandler?: Function;
};
export type FormHandlerFunction = Function;
export type FormHandlerResult = {
    /**
     * Whether the form submission was successful.
     */
    success: boolean;
    /**
     * The result message.
     */
    message?: string;
};
export type FormHandlerValidationResult = {
    /**
     * Whether the form data is valid.
     */
    valid: boolean;
    /**
     * The validation errors.
     */
    errors: string[];
};
/**
 * @typedef {object} FormField
 * @property {string} name The field name.
 * @property {string} type The field type (text, email, textarea, etc.).
 * @property {boolean} required Whether the field is required.
 * @property {string} [label] The field label for display.
 * @property {string} [placeholder] The field placeholder text.
 * @property {FormFieldValidationFunction} [validation] Custom validation function.
 * @property {string} [errorMessage] Custom error message for validation.
 */
/**
 * @typedef {Function} FormFieldValidationFunction
 * @param {string} value The field value.
 * @returns {boolean} Whether the field is valid.
 */
/**
 * @typedef {object} FormConfig
 * @property {string} name The form name/identifier.
 * @property {string} route The route path for the form submission.
 * @property {FormField[]} fields The form fields configuration.
 * @property {function} [handler] Custom handler function for form submission.
 * @property {string} successMessage Success message to return.
 * @property {string} errorMessage Error message to return.
 * @property {import('express').RequestHandler[]} [middleware] Custom middleware for the form route.
 * @property {FormHandlerFunction} [handler] Custom handler function for form submission.
 */
/**
 * @typedef {object} FormHandlerConfig
 * @property {Record<string, string[]>} [events] Events to bind to.
 * @property {FormConfig[]} forms Array of form configurations.
 * @property {string} [baseRoute] Base route prefix for all forms.
 * @property {function} [defaultHandler] Default handler function for forms without custom handlers.
 */
/**
 * @typedef {Function} FormHandlerFunction
 * @property {Record<string, any>} formData The form data.
 * @property {FormConfig} formConfig The form configuration.
 * @property {import('express').Request} _req The request.
 * @property {import('express').Response} _res The response.
 * @returns {Promise<FormHandlerResult>} The result.
 */
/**
 * @typedef {object} FormHandlerResult
 * @property {boolean} success Whether the form submission was successful.
 * @property {string} [message] The result message.
 */
/**
 * @typedef {object} FormHandlerValidationResult
 * @property {boolean} valid Whether the form data is valid.
 * @property {string[]} errors The validation errors.
 */
/**
 * Uttori Form Handler Plugin
 * @example <caption>FormHandler</caption>
 * const formHandler = new FormHandler(config);
 * @class
 */
declare class FormHandler {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     * @type {string}
     * @returns {string} The configuration key.
     * @example <caption>FormHandler.configKey</caption>
     * const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
     * @static
     */
    static get configKey(): string;
    /**
     * The default configuration.
     * @returns {FormHandlerConfig} The configuration.
     * @example <caption>FormHandler.defaultConfig()</caption>
     * const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
     * @static
     */
    static defaultConfig(): FormHandlerConfig;
    /**
     * Validates the provided configuration for required entries.
     * @param {Record<string, FormHandlerConfig>} config - A provided configuration to use.
     * @param {object} [_context] Unused.
     * @example <caption>FormHandler.validateConfig(config, _context)</caption>
     * FormHandler.validateConfig({ ... });
     * @static
     */
    static validateConfig(config: Record<string, FormHandlerConfig>, _context?: object): void;
    /**
     * Register the plugin with a provided set of events on a provided Hook system.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-form-handler', FormHandlerConfig>} context A Uttori-like context.
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
     * @static
     */
    static register(context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-form-handler", FormHandlerConfig>): void;
    /**
     * Binds routes to the Express app.
     * @param {import('express').Application} server The Express app.
     * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-form-handler', FormHandlerConfig>} context The context.
     * @static
     */
    static bindRoutes(server: import("express").Application, context: import("../../dist/custom.d.ts").UttoriContextWithPluginConfig<"uttori-plugin-form-handler", FormHandlerConfig>): void;
    /**
     * Creates a form handler middleware function.
     * @param {FormConfig} formConfig The form configuration.
     * @param {FormHandlerFunction} defaultHandler The default handler function.
     * @returns {import('express').RequestHandler} Express middleware function.
     * @static
     */
    static createFormHandler(formConfig: FormConfig, defaultHandler: FormHandlerFunction): import("express").RequestHandler;
    /**
     * Validates form data against form configuration.
     * @param {Record<string, any>} formData The form data to validate.
     * @param {FormConfig} formConfig The form configuration.
     * @returns {FormHandlerValidationResult} Validation result.
     * @static
     */
    static validateFormData(formData: Record<string, any>, formConfig: FormConfig): FormHandlerValidationResult;
}
//# sourceMappingURL=form-handler.d.ts.map