export default EmailHandler;
export type EmailHandlerConfig = {
    /**
     * Nodemailer transport options.
     */
    transportOptions: import("nodemailer").TransportOptions;
    /**
     * Email address to send from.
     */
    from: string;
    /**
     * Email address to send to.
     */
    to: string;
    /**
     * Email subject template.
     */
    subject: string;
    /**
     * Email body template (optional).
     */
    template?: string;
};
/**
 * @typedef {object} EmailHandlerConfig
 * @property {import('nodemailer').TransportOptions} transportOptions Nodemailer transport options.
 * @property {string} from Email address to send from.
 * @property {string} to Email address to send to.
 * @property {string} subject Email subject template.
 * @property {string} [template] Email body template (optional).
 */
/**
 * Email handler for form submissions.
 * @example <caption>EmailHandler</caption>
 * const emailHandler = EmailHandler.create(config);
 * @class
 */
declare class EmailHandler {
    /**
     * Creates an email handler with the provided configuration.
     * @param {EmailHandlerConfig} config Email configuration.
     * @returns {import('../form-handler.js').FormHandlerFunction} Form handler function.
     * @static
     */
    static create(config: EmailHandlerConfig): import("../form-handler.js").FormHandlerFunction;
    /**
     * Generates email subject from template.
     * @param {string} template Subject template.
     * @param {Record<string, any>} formData Form data.
     * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
     * @returns {string} Generated subject.
     * @static
     */
    static generateSubject(template: string, formData: Record<string, any>, formConfig: import("../form-handler.js").FormConfig): string;
    /**
     * Generates email body from template.
     * @param {string} template Body template.
     * @param {Record<string, any>} formData Form data.
     * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
     * @returns {string} Generated body.
     * @static
     */
    static generateBody(template: string, formData: Record<string, any>, formConfig: import("../form-handler.js").FormConfig): string;
}
//# sourceMappingURL=email-handler.d.ts.map