## Classes

<dl>
<dt><a href="#EmailHandler">EmailHandler</a></dt>
<dd><p>Email handler for form submissions.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#fillTemplate">fillTemplate(template, formData, formConfig)</a> ⇒ <code>string</code></dt>
<dd><p>Replaces form placeholders as literal text so field names and values cannot change replacement syntax.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#EmailHandlerConfig">EmailHandlerConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="EmailHandler"></a>

## EmailHandler
Email handler for form submissions.

**Kind**: global class  

* [EmailHandler](#EmailHandler)
    * [new EmailHandler()](#new_EmailHandler_new)
    * [.create(config)](#EmailHandler.create) ⇒ <code>FormHandlerFunction</code>
    * [.generateSubject(template, formData, formConfig)](#EmailHandler.generateSubject) ⇒ <code>string</code>
    * [.generateBody(template, formData, formConfig)](#EmailHandler.generateBody) ⇒ <code>string</code>

<a name="new_EmailHandler_new"></a>

### new EmailHandler()
**Example** *(EmailHandler)*  
```js
const emailHandler = EmailHandler.create(config);
```
<a name="EmailHandler.create"></a>

### EmailHandler.create(config) ⇒ <code>FormHandlerFunction</code>
Creates an email handler with the provided configuration.

**Kind**: static method of [<code>EmailHandler</code>](#EmailHandler)  
**Returns**: <code>FormHandlerFunction</code> - Form handler function.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>EmailHandlerConfig</code>](#EmailHandlerConfig) | Email configuration. |

<a name="EmailHandler.generateSubject"></a>

### EmailHandler.generateSubject(template, formData, formConfig) ⇒ <code>string</code>
Generates email subject from template.

**Kind**: static method of [<code>EmailHandler</code>](#EmailHandler)  
**Returns**: <code>string</code> - Generated subject.  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>string</code> \| <code>undefined</code> | Subject template; an empty value uses the default subject. |
| formData | <code>Record.&lt;string, any&gt;</code> | Form data. |
| formConfig | <code>FormConfig</code> | Form configuration. |

<a name="EmailHandler.generateBody"></a>

### EmailHandler.generateBody(template, formData, formConfig) ⇒ <code>string</code>
Generates email body from template.

**Kind**: static method of [<code>EmailHandler</code>](#EmailHandler)  
**Returns**: <code>string</code> - Generated body.  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>string</code> \| <code>null</code> \| <code>undefined</code> | Body template; an empty value uses the default HTML body. |
| formData | <code>Record.&lt;string, any&gt;</code> | Form data. |
| formConfig | <code>FormConfig</code> | Form configuration. |

<a name="fillTemplate"></a>

## fillTemplate(template, formData, formConfig) ⇒ <code>string</code>
Replaces form placeholders as literal text so field names and values cannot change replacement syntax.

**Kind**: global function  
**Returns**: <code>string</code> - Template with known placeholders filled in.  

| Param | Type | Description |
| --- | --- | --- |
| template | <code>string</code> | Subject or HTML template. |
| formData | <code>Record.&lt;string, any&gt;</code> | Submitted field values. |
| formConfig | <code>FormConfig</code> | Form metadata. |

<a name="EmailHandlerConfig"></a>

## EmailHandlerConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| transportOptions | <code>module:nodemailer~TransportOptions</code> | Nodemailer transport options. |
| from | <code>string</code> | Email address to send from. |
| to | <code>string</code> | Email address to send to. |
| subject | <code>string</code> | Email subject template. |
| [template] | <code>string</code> | Email body template (optional). |

