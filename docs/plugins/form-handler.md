## Classes

<dl>
<dt><a href="#FormHandler">FormHandler</a></dt>
<dd><p>Uttori Form Handler Plugin</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#baseRoute">baseRoute</a></dt>
<dd><p>Base route prefix for all forms</p>
</dd>
<dt><a href="#forms">forms</a></dt>
<dd><p>Array of form configurations</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#defaultHandler">defaultHandler(formData, formConfig, _req, _res)</a> ⇒</dt>
<dd><p>Default handler function for forms without custom handlers</p>
</dd>
</dl>

<a name="FormHandler"></a>

## FormHandler
Uttori Form Handler Plugin

**Kind**: global class\

* [FormHandler](#FormHandler)
    * [new FormHandler()](#new_FormHandler_new)
    * [.configKey](#FormHandler.configKey) ⇒
    * [.defaultConfig()](#FormHandler.defaultConfig) ⇒
    * [.validateConfig(config, [_context])](#FormHandler.validateConfig)
    * [.register(context)](#FormHandler.register)
    * [.bindRoutes(server, context)](#FormHandler.bindRoutes)
    * [.createFormHandler(formConfig, defaultHandler)](#FormHandler.createFormHandler) ⇒
    * [.validateFormData(formData, formConfig)](#FormHandler.validateFormData) ⇒

<a name="new_FormHandler_new"></a>

### new FormHandler()
**Example** *(FormHandler)*\
```js
const formHandler = new FormHandler(config);
```
<a name="FormHandler.configKey"></a>

### FormHandler.configKey ⇒
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>FormHandler</code>](#FormHandler)\
**Returns**: The configuration key.\
**Example** *(FormHandler.configKey)*\
```js
const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
```
<a name="FormHandler.defaultConfig"></a>

### FormHandler.defaultConfig() ⇒
The default configuration.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)\
**Returns**: The configuration.\
**Example** *(FormHandler.defaultConfig())*\
```js
const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
```
<a name="FormHandler.validateConfig"></a>

### FormHandler.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)\

| Param | Description |
| --- | --- |
| config | A provided configuration to use. |
| [_context] | Unused. |

**Example** *(FormHandler.validateConfig(config, _context))*\
```js
FormHandler.validateConfig({ ... });
```
<a name="FormHandler.register"></a>

### FormHandler.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)\

| Param | Description |
| --- | --- |
| context | A Uttori-like context. |

**Example**\
```js
const context = {
  hooks: {
    on: (event, callback) => { ... },
  },
  config: {
    [Plugin.configKey]: {
      forms: [...],
    },
  },
};
Plugin.register(context);
```
<a name="FormHandler.bindRoutes"></a>

### FormHandler.bindRoutes(server, context)
Binds routes to the Express app.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)\

| Param | Description |
| --- | --- |
| server | The Express app. |
| context | The context. |

<a name="FormHandler.createFormHandler"></a>

### FormHandler.createFormHandler(formConfig, defaultHandler) ⇒
Creates a form handler middleware function.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)\
**Returns**: Express middleware function.\

| Param | Description |
| --- | --- |
| formConfig | The form configuration. |
| defaultHandler | The default handler function. |

<a name="FormHandler.validateFormData"></a>

### FormHandler.validateFormData(formData, formConfig) ⇒
Validates form data against form configuration.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)\
**Returns**: Validation result.\

| Param | Description |
| --- | --- |
| formData | The form data to validate. |
| formConfig | The form configuration. |

<a name="baseRoute"></a>

## baseRoute
Base route prefix for all forms

**Kind**: global variable\
<a name="forms"></a>

## forms
Array of form configurations

**Kind**: global variable\
<a name="defaultHandler"></a>

## defaultHandler(formData, formConfig, _req, _res) ⇒
Default handler function for forms without custom handlers

**Kind**: global function\
**Returns**: The result.\

| Param | Description |
| --- | --- |
| formData | The form data. |
| formConfig | The form configuration. |
| _req | The request. |
| _res | The response. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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

/** Validates a single form field value. */
export type FormFieldValidationFunction = (value: string) => boolean;
export interface FormField {
    /** The field name. */
    name: string;
    /** The field type (text, email, textarea, etc.). */
    type: string;
    /** Whether the field is required. */
    required: boolean;
    /** The field label for display. */
    label?: string;
    /** The field placeholder text. */
    placeholder?: string;
    /** Custom validation function. */
    validation?: FormFieldValidationFunction;
    /** Custom error message for validation. */
    errorMessage?: string;
}
export interface FormConfig {
    /** The form name/identifier. */
    name: string;
    /** The route path for the form submission. */
    route: string;
    /** The form fields configuration. */
    fields: FormField[];
    /** Custom handler function for form submission. */
    handler?: FormHandlerFunction;
    /** Success message to return. */
    successMessage: string;
    /** Error message to return. */
    errorMessage: string;
    /** Custom middleware for the form route. */
    middleware?: import('express').RequestHandler[];
}
export interface FormHandlerConfig {
    /** Events to bind to. */
    events?: Record<string, string[]>;
    /** Array of form configurations. */
    forms: FormConfig[];
    /** Base route prefix for all forms. */
    baseRoute?: string;
    /** Default handler function for forms without custom handlers. */
    defaultHandler?: FormHandlerFunction;
}
/** Handles a validated form submission. */
export type FormHandlerFunction = (formData: Record<string, unknown>, formConfig: FormConfig, req: import('express').Request, res: import('express').Response) => Promise<FormHandlerResult>;
export interface FormHandlerResult {
    /** Whether the form submission was successful. */
    success: boolean;
    /** The result message. */
    message?: string;
}
export interface FormHandlerValidationResult {
    /** Whether the form data is valid. */
    valid: boolean;
    /** The validation errors. */
    errors: string[];
}
```

</details>
