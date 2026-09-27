## Classes

<dl>
<dt><a href="#EmailHandler">EmailHandler</a></dt>
<dd><p>Email handler for form submissions.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#fillTemplate">fillTemplate(template, formData, formConfig)</a> ⇒</dt>
<dd><p>Replaces form placeholders as literal text so field names and values cannot change replacement syntax.</p>
</dd>
</dl>

<a name="EmailHandler"></a>

## EmailHandler
Email handler for form submissions.

**Kind**: global class\

* [EmailHandler](#EmailHandler)
    * [new EmailHandler()](#new_EmailHandler_new)
    * [.create(config)](#EmailHandler.create) ⇒
    * [.generateSubject(template, formData, formConfig)](#EmailHandler.generateSubject) ⇒
    * [.generateBody(template, formData, formConfig)](#EmailHandler.generateBody) ⇒

<a name="new_EmailHandler_new"></a>

### new EmailHandler()
**Example** *(EmailHandler)*\
```js
const emailHandler = EmailHandler.create(config);
```
<a name="EmailHandler.create"></a>

### EmailHandler.create(config) ⇒
Creates an email handler with the provided configuration.

**Kind**: static method of [<code>EmailHandler</code>](#EmailHandler)\
**Returns**: Form handler function.\

| Param | Description |
| --- | --- |
| config | Email configuration. |

<a name="EmailHandler.generateSubject"></a>

### EmailHandler.generateSubject(template, formData, formConfig) ⇒
Generates email subject from template.

**Kind**: static method of [<code>EmailHandler</code>](#EmailHandler)\
**Returns**: Generated subject.\

| Param | Description |
| --- | --- |
| template | Subject template; an empty value uses the default subject. |
| formData | Form data. |
| formConfig | Form configuration. |

<a name="EmailHandler.generateBody"></a>

### EmailHandler.generateBody(template, formData, formConfig) ⇒
Generates email body from template.

**Kind**: static method of [<code>EmailHandler</code>](#EmailHandler)\
**Returns**: Generated body.\

| Param | Description |
| --- | --- |
| template | Body template; an empty value uses the default HTML body. |
| formData | Form data. |
| formConfig | Form configuration. |

<a name="fillTemplate"></a>

## fillTemplate(template, formData, formConfig) ⇒
Replaces form placeholders as literal text so field names and values cannot change replacement syntax.

**Kind**: global function\
**Returns**: Template with known placeholders filled in.\

| Param | Description |
| --- | --- |
| template | Subject or HTML template. |
| formData | Submitted field values. |
| formConfig | Form metadata. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import type { EmailHandlerConfig } from '../../types/plugins/form-handlers/email-handler.js';
export type { EmailHandlerConfig } from '../../types/plugins/form-handlers/email-handler.js';
/**
 * Email handler for form submissions.
 * @example <caption>EmailHandler</caption>
 * const emailHandler = EmailHandler.create(config);
 */
declare class EmailHandler {
    /**
     * Creates an email handler with the provided configuration.
     * @param config Email configuration.
     * @returns Form handler function.
     */
    static create(config: EmailHandlerConfig): import('../form-handler.js').FormHandlerFunction;
    /**
     * Generates email subject from template.
     * @param template Subject template; an empty value uses the default subject.
     * @param formData Form data.
     * @param formConfig Form configuration.
     * @returns Generated subject.
     */
    static generateSubject(template: string | undefined, formData: Record<string, unknown>, formConfig: import('../form-handler.js').FormConfig): string;
    /**
     * Generates email body from template.
     * @param template Body template; an empty value uses the default HTML body.
     * @param formData Form data.
     * @param formConfig Form configuration.
     * @returns Generated body.
     */
    static generateBody(template: string | null | undefined, formData: Record<string, unknown>, formConfig: import('../form-handler.js').FormConfig): string;
}
export default EmailHandler;

export interface EmailHandlerConfig {
    /** Nodemailer transport options. */
    transportOptions: import('nodemailer').TransportOptions;
    /** Email address to send from. */
    from: string;
    /** Email address to send to. */
    to: string;
    /** Email subject template. */
    subject: string;
    /** Email body template (optional). */
    template?: string;
}
```

</details>
