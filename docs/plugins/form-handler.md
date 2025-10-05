## Classes

<dl>
<dt><a href="#FormHandler">FormHandler</a></dt>
<dd><p>Uttori Form Handler Plugin</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#defaultHandler">defaultHandler(formData, formConfig, _req, _res)</a> ⇒ <code><a href="#FormHandlerResult">Promise.&lt;FormHandlerResult&gt;</a></code></dt>
<dd></dd>
</dl>

## Typedefs

<dl>
<dt><a href="#FormField">FormField</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FormFieldValidationFunction">FormFieldValidationFunction</a> ⇒ <code>boolean</code></dt>
<dd></dd>
<dt><a href="#FormConfig">FormConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FormHandlerConfig">FormHandlerConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FormHandlerFunction">FormHandlerFunction</a> ⇒ <code><a href="#FormHandlerResult">Promise.&lt;FormHandlerResult&gt;</a></code></dt>
<dd></dd>
<dt><a href="#FormHandlerResult">FormHandlerResult</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#FormHandlerValidationResult">FormHandlerValidationResult</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="FormHandler"></a>

## FormHandler
Uttori Form Handler Plugin

**Kind**: global class  

* [FormHandler](#FormHandler)
    * [new FormHandler()](#new_FormHandler_new)
    * [.configKey](#FormHandler.configKey) ⇒ <code>string</code>
    * [.defaultConfig()](#FormHandler.defaultConfig) ⇒ [<code>FormHandlerConfig</code>](#FormHandlerConfig)
    * [.validateConfig(config, [_context])](#FormHandler.validateConfig)
    * [.register(context)](#FormHandler.register)
    * [.bindRoutes(server, context)](#FormHandler.bindRoutes)
    * [.createFormHandler(formConfig, defaultHandler)](#FormHandler.createFormHandler) ⇒ <code>module:express~RequestHandler</code>
    * [.validateFormData(formData, formConfig)](#FormHandler.validateFormData) ⇒ [<code>FormHandlerValidationResult</code>](#FormHandlerValidationResult)

<a name="new_FormHandler_new"></a>

### new FormHandler()
**Example** *(FormHandler)*  
```js
const formHandler = new FormHandler(config);
```
<a name="FormHandler.configKey"></a>

### FormHandler.configKey ⇒ <code>string</code>
The configuration key for plugin to look for in the provided configuration.

**Kind**: static property of [<code>FormHandler</code>](#FormHandler)  
**Returns**: <code>string</code> - The configuration key.  
**Example** *(FormHandler.configKey)*  
```js
const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
```
<a name="FormHandler.defaultConfig"></a>

### FormHandler.defaultConfig() ⇒ [<code>FormHandlerConfig</code>](#FormHandlerConfig)
The default configuration.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)  
**Returns**: [<code>FormHandlerConfig</code>](#FormHandlerConfig) - The configuration.  
**Example** *(FormHandler.defaultConfig())*  
```js
const config = { ...FormHandler.defaultConfig(), ...context.config[FormHandler.configKey] };
```
<a name="FormHandler.validateConfig"></a>

### FormHandler.validateConfig(config, [_context])
Validates the provided configuration for required entries.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)  

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Record.&lt;string, FormHandlerConfig&gt;</code> | A provided configuration to use. |
| [_context] | <code>object</code> | Unused. |

**Example** *(FormHandler.validateConfig(config, _context))*  
```js
FormHandler.validateConfig({ ... });
```
<a name="FormHandler.register"></a>

### FormHandler.register(context)
Register the plugin with a provided set of events on a provided Hook system.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)  

| Param | Type | Description |
| --- | --- | --- |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-form-handler&#x27;, FormHandlerConfig&gt;</code> | A Uttori-like context. |

**Example**  
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

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)  

| Param | Type | Description |
| --- | --- | --- |
| server | <code>module:express~Application</code> | The Express app. |
| context | <code>UttoriContextWithPluginConfig.&lt;&#x27;uttori-plugin-form-handler&#x27;, FormHandlerConfig&gt;</code> | The context. |

<a name="FormHandler.createFormHandler"></a>

### FormHandler.createFormHandler(formConfig, defaultHandler) ⇒ <code>module:express~RequestHandler</code>
Creates a form handler middleware function.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)  
**Returns**: <code>module:express~RequestHandler</code> - Express middleware function.  

| Param | Type | Description |
| --- | --- | --- |
| formConfig | [<code>FormConfig</code>](#FormConfig) | The form configuration. |
| defaultHandler | [<code>FormHandlerFunction</code>](#FormHandlerFunction) | The default handler function. |

<a name="FormHandler.validateFormData"></a>

### FormHandler.validateFormData(formData, formConfig) ⇒ [<code>FormHandlerValidationResult</code>](#FormHandlerValidationResult)
Validates form data against form configuration.

**Kind**: static method of [<code>FormHandler</code>](#FormHandler)  
**Returns**: [<code>FormHandlerValidationResult</code>](#FormHandlerValidationResult) - Validation result.  

| Param | Type | Description |
| --- | --- | --- |
| formData | <code>Record.&lt;string, any&gt;</code> | The form data to validate. |
| formConfig | [<code>FormConfig</code>](#FormConfig) | The form configuration. |

<a name="defaultHandler"></a>

## defaultHandler(formData, formConfig, _req, _res) ⇒ [<code>Promise.&lt;FormHandlerResult&gt;</code>](#FormHandlerResult)
**Kind**: global function  
**Returns**: [<code>Promise.&lt;FormHandlerResult&gt;</code>](#FormHandlerResult) - The result.  

| Param | Type | Description |
| --- | --- | --- |
| formData | <code>Record.&lt;string, any&gt;</code> | The form data. |
| formConfig | [<code>FormConfig</code>](#FormConfig) | The form configuration. |
| _req | <code>module:express~Request</code> | The request. |
| _res | <code>module:express~Response</code> | The response. |

<a name="FormField"></a>

## FormField : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The field name. |
| type | <code>string</code> | The field type (text, email, textarea, etc.). |
| required | <code>boolean</code> | Whether the field is required. |
| [label] | <code>string</code> | The field label for display. |
| [placeholder] | <code>string</code> | The field placeholder text. |
| [validation] | [<code>FormFieldValidationFunction</code>](#FormFieldValidationFunction) | Custom validation function. |
| [errorMessage] | <code>string</code> | Custom error message for validation. |

<a name="FormFieldValidationFunction"></a>

## FormFieldValidationFunction ⇒ <code>boolean</code>
**Kind**: global typedef  
**Returns**: <code>boolean</code> - Whether the field is valid.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>string</code> | The field value. |

<a name="FormConfig"></a>

## FormConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The form name/identifier. |
| route | <code>string</code> | The route path for the form submission. |
| fields | [<code>Array.&lt;FormField&gt;</code>](#FormField) | The form fields configuration. |
| [handler] | <code>function</code> | Custom handler function for form submission. |
| successMessage | <code>string</code> | Success message to return. |
| errorMessage | <code>string</code> | Error message to return. |
| [middleware] | <code>Array.&lt;module:express~RequestHandler&gt;</code> | Custom middleware for the form route. |
| [handler] | [<code>FormHandlerFunction</code>](#FormHandlerFunction) | Custom handler function for form submission. |

<a name="FormHandlerConfig"></a>

## FormHandlerConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [events] | <code>Record.&lt;string, Array.&lt;string&gt;&gt;</code> | Events to bind to. |
| forms | [<code>Array.&lt;FormConfig&gt;</code>](#FormConfig) | Array of form configurations. |
| [baseRoute] | <code>string</code> | Base route prefix for all forms. |
| [defaultHandler] | <code>function</code> | Default handler function for forms without custom handlers. |

<a name="FormHandlerFunction"></a>

## FormHandlerFunction ⇒ [<code>Promise.&lt;FormHandlerResult&gt;</code>](#FormHandlerResult)
**Kind**: global typedef  
**Returns**: [<code>Promise.&lt;FormHandlerResult&gt;</code>](#FormHandlerResult) - The result.  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| formData | <code>Record.&lt;string, any&gt;</code> | The form data. |
| formConfig | [<code>FormConfig</code>](#FormConfig) | The form configuration. |
| _req | <code>module:express~Request</code> | The request. |
| _res | <code>module:express~Response</code> | The response. |

<a name="FormHandlerResult"></a>

## FormHandlerResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| success | <code>boolean</code> | Whether the form submission was successful. |
| [message] | <code>string</code> | The result message. |

<a name="FormHandlerValidationResult"></a>

## FormHandlerValidationResult : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| valid | <code>boolean</code> | Whether the form data is valid. |
| errors | <code>Array.&lt;string&gt;</code> | The validation errors. |

