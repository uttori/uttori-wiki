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
//# sourceMappingURL=email-handler.d.ts.map