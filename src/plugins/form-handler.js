import express from 'express';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.FormHandler'); } catch {}

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
class FormHandler {
  /**
   * The configuration key for plugin to look for in the provided configuration.
   * @type {string}
   * @returns {string} The configuration key.
   * @example <caption>FormHandler.configKey</caption>
   * const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
   * @static
   */
  static get configKey() {
    return 'uttori-plugin-form-handler';
  }

  /**
   * The default configuration.
   * @returns {FormHandlerConfig} The configuration.
   * @example <caption>FormHandler.defaultConfig()</caption>
   * const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
   * @static
   */
  static defaultConfig() {
    return {
      /**
       * Base route prefix for all forms
       * @type {string}
       */
      baseRoute: '/forms',

      /**
       * Array of form configurations
       * @type {FormConfig[]}
       */
      forms: [],

      /**
       * Default handler function for forms without custom handlers
       * @param {Record<string, any>} formData The form data.
       * @param {FormConfig} formConfig The form configuration.
       * @param {import('express').Request} _req The request.
       * @param {import('express').Response} _res The response.
       * @returns {Promise<FormHandlerResult>} The result.
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
   * @param {Record<string, FormHandlerConfig>} config - A provided configuration to use.
   * @param {object} [_context] Unused.
   * @example <caption>FormHandler.validateConfig(config, _context)</caption>
   * FormHandler.validateConfig({ ... });
   * @static
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
  static register(context) {
    debug('register');
    if (!context || !context.hooks || typeof context.hooks.on !== 'function') {
      throw new Error('Missing event dispatcher in \'context.hooks.on(event, callback)\' format.');
    }

    /** @type {FormHandlerConfig} */
    const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
    if (!config.events) {
      throw new Error('Missing events to listen to for in \'config.events\'.');
    }

    // Bind events
    for (const [method, eventNames] of Object.entries(config.events)) {
      if (typeof FormHandler[method] === 'function') {
        for (const event of eventNames) {
          /** @type {import('@uttori/event-dispatcher').UttoriEventCallback} */
          const callback = FormHandler[method];
          context.hooks.on(event, callback);
        }
      } else {
        debug(`Missing function "${method}"`);
      }
    }

    debug('FormHandler plugin registered with', config.forms.length, 'forms');
  }

  /**
   * Binds routes to the Express app.
   * @param {import('express').Application} server The Express app.
   * @param {import('../../dist/custom.d.ts').UttoriContextWithPluginConfig<'uttori-plugin-form-handler', FormHandlerConfig>} context The context.
   * @static
   */
  static bindRoutes(server, context) {
    debug('bindRoutes');

    /** @type {FormHandlerConfig} */
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
   * @param {FormConfig} formConfig The form configuration.
   * @param {FormHandlerFunction} defaultHandler The default handler function.
   * @returns {import('express').RequestHandler} Express middleware function.
   * @static
   */
  static createFormHandler(formConfig, defaultHandler) {
    /** @type {import('express').RequestHandler<any, any, any, any>} */
    return async (req, res) => {
      try {
        debug(`Processing form submission for "${formConfig.name}"`);

        // Extract form data from request body
        /** @type {Record<string, any>} */
        const formData = req.body;

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

      } catch (error) {
        debug('Form submission error:', error);
        return res.status(500).json({
          success: false,
          message: 'Internal server error',
          /* c8 ignore next 1 */
          error: error instanceof Error ? error.message : 'Unknown Error',
        });
      }
    };
  }

  /**
   * Validates form data against form configuration.
   * @param {Record<string, any>} formData The form data to validate.
   * @param {FormConfig} formConfig The form configuration.
   * @returns {FormHandlerValidationResult} Validation result.
   * @static
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
          } catch {
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
        } catch (error) {
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
