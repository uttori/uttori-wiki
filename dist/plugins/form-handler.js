import { getPluginMethod } from './utilities/plugin-method.js';
import { createDebug } from '../debug.js';
import express from 'express';
const debug = createDebug('Uttori.Plugin.FormHandler');
/**
 * Uttori Form Handler Plugin
 * @example <caption>FormHandler</caption>
 * const formHandler = new FormHandler(config);
 */
class FormHandler {
    /**
     * The configuration key for plugin to look for in the provided configuration.
     *
     * @returns The configuration key.
     * @example <caption>FormHandler.configKey</caption>
     * const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
     */
    static get configKey() {
        return 'uttori-plugin-form-handler';
    }
    /**
     * The default configuration.
     * @returns The configuration.
     * @example <caption>FormHandler.defaultConfig()</caption>
     * const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
     */
    static defaultConfig() {
        return {
            /**
             * Base route prefix for all forms
             *
             */
            baseRoute: '/forms',
            /**
             * Array of form configurations
             *
             */
            forms: [],
            /**
             * Default handler function for forms without custom handlers
             * @param formData The form data.
             * @param formConfig The form configuration.
             * @param _req The request.
             * @param _res The response.
             * @returns The result.
             */
            defaultHandler: (formData, formConfig, _req, _res) => {
                console.log(`Form submission for "${String(formConfig.name)}":`, formData);
                return Promise.resolve({
                    success: true,
                    message: 'Form submitted successfully',
                });
            },
        };
    }
    /**
     * Validates the provided configuration for required entries.
     * @param config - A provided configuration to use.
     * @param [_context] Unused.
     * @example <caption>FormHandler.validateConfig(config, _context)</caption>
     * FormHandler.validateConfig({ ... });
     */
    static validateConfig(config, _context) {
        debug('Validating config...');
        if (!config || !config[FormHandler.configKey]) {
            const error = `Config Error: '${FormHandler.configKey}' configuration key is missing.`;
            debug(error);
            throw new Error(error);
        }
        const formConfig = config[FormHandler.configKey];
        if (!Array.isArray(formConfig.forms)) {
            const error = 'Config Error: `forms` should be an array of form configurations.';
            debug(error);
            throw new Error(error);
        }
        if (typeof formConfig.baseRoute !== 'string') {
            const error = 'Config Error: `baseRoute` should be a string.';
            debug(error);
            throw new Error(error);
        }
        // Validate each form configuration
        for (const form of formConfig.forms) {
            if (!form.name || typeof form.name !== 'string') {
                const error = 'Config Error: Each form must have a `name` property.';
                debug(error);
                throw new Error(error);
            }
            if (!form.route || typeof form.route !== 'string') {
                const error = 'Config Error: Each form must have a `route` property.';
                debug(error);
                throw new Error(error);
            }
            if (!Array.isArray(form.fields)) {
                const error = 'Config Error: Each form must have a `fields` array.';
                debug(error);
                throw new Error(error);
            }
            if (!form.successMessage || typeof form.successMessage !== 'string') {
                const error = 'Config Error: Each form must have a `successMessage` property.';
                debug(error);
                throw new Error(error);
            }
            if (!form.errorMessage || typeof form.errorMessage !== 'string') {
                const error = 'Config Error: Each form must have a `errorMessage` property.';
                debug(error);
                throw new Error(error);
            }
            // Validate each field
            for (const field of form.fields) {
                if (!field.name || typeof field.name !== 'string') {
                    const error = 'Config Error: Each field must have a `name` property.';
                    debug(error);
                    throw new Error(error);
                }
                if (!field.type || typeof field.type !== 'string') {
                    const error = 'Config Error: Each field must have a `type` property.';
                    debug(error);
                    throw new Error(error);
                }
            }
        }
        debug('Validated config.');
    }
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
    static register(context) {
        debug('register');
        if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
            throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
        }
        const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
        if (!config.events) {
            throw new Error('Missing events to listen to for in \'config.events\'.');
        }
        // Bind events
        for (const [method, eventNames] of Object.entries(config.events)) {
            const FormHandlerMethod = getPluginMethod(FormHandler, method);
            if (FormHandlerMethod) {
                for (const event of eventNames) {
                    const callback = FormHandlerMethod;
                    context.hooks.on(event, callback);
                }
            }
            else {
                debug(`Missing function "${method}"`);
            }
        }
        debug('FormHandler plugin registered with', config.forms.length, 'forms');
    }
    /**
     * Binds routes to the Express app.
     * @param server The Express app.
     * @param context The context.
     */
    static bindRoutes(server, context) {
        debug('bindRoutes');
        const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
        if (!config.forms || config.forms.length === 0) {
            debug('No forms configured, skipping route binding');
            return;
        }
        const { baseRoute } = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
        debug('bindRoutes baseRoute:', baseRoute);
        // Bind each form
        for (const formConfig of config.forms) {
            const fullRoute = `${baseRoute}${formConfig.route}`;
            debug(`Binding form "${formConfig.name}" to route "${fullRoute}"`);
            // Create middleware array
            const middleware = [
                // Parse JSON and form data
                express.json(),
                express.urlencoded({ extended: true }),
                // Add custom middleware if provided
                ...(formConfig.middleware || []),
                // Form submission handler
                FormHandler.createFormHandler(formConfig, formConfig.handler || config.defaultHandler),
            ];
            server.post(fullRoute, ...middleware);
        }
    }
    /**
     * Creates a form handler middleware function.
     * @param formConfig The form configuration.
     * @param defaultHandler The default handler function.
     * @returns Express middleware function.
     */
    static createFormHandler(formConfig, defaultHandler) {
        return (async (req, res) => {
            try {
                debug(`Processing form submission for "${formConfig.name}"`);
                // Extract form data from request body
                const formData = (typeof req.body === 'object' && req.body !== null ? req.body : {});
                // Validate form data
                const validationResult = FormHandler.validateFormData(formData, formConfig);
                if (!validationResult.valid) {
                    return res.status(400).json({
                        success: false,
                        message: formConfig.errorMessage,
                        errors: validationResult.errors,
                    });
                }
                // Use custom handler if provided, otherwise use default
                const handler = formConfig.handler || defaultHandler;
                // Call the handler
                const result = await handler(formData, formConfig, req, res);
                // Return success response
                return res.json({
                    success: true,
                    message: formConfig.successMessage,
                    data: result,
                });
            }
            catch (error) {
                debug('Form submission error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Internal server error',
                    /* c8 ignore next 1 */
                    error: error instanceof Error ? error.message : 'Unknown Error',
                });
            }
        });
    }
    /**
     * Validates form data against form configuration.
     * @param formData The form data to validate.
     * @param formConfig The form configuration.
     * @returns Validation result.
     */
    static validateFormData(formData, formConfig) {
        const errors = [];
        for (const field of formConfig.fields) {
            const value = formData[field.name];
            // Check required fields
            if (field.required && (!value || String(value).trim() === '')) {
                errors.push(`Field "${field.name}" is required`);
                continue;
            }
            // Skip validation for empty optional fields
            if (!value || String(value).trim() === '') {
                continue;
            }
            // Type-specific validation
            switch (field.type) {
                case 'email': {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(String(value))) {
                        errors.push(`Field "${field.name}" must be a valid email address`);
                    }
                    break;
                }
                case 'number': {
                    if (Number.isNaN(Number(value))) {
                        errors.push(`Field "${field.name}" must be a valid number`);
                    }
                    break;
                }
                case 'url': {
                    try {
                        new URL(String(value));
                    }
                    catch {
                        errors.push(`Field "${field.name}" must be a valid URL`);
                    }
                    break;
                }
                default: {
                    // No validation for other types
                    break;
                }
            }
            // Custom validation
            if (field.validation && value) {
                try {
                    if (!field.validation(String(value))) {
                        errors.push(field.errorMessage || `Field "${field.name}" is invalid`);
                    }
                }
                catch (error) {
                    errors.push(`Field "${field.name}" has failed validation due to error`);
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
export default FormHandler;
//# sourceMappingURL=form-handler.js.map