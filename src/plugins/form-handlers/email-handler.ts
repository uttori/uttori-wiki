import { createDebug } from '../../debug.js';
import { createTransport } from 'nodemailer';
import type { EmailHandlerConfig } from '../../types/plugins/form-handlers/email-handler.js';

export type { EmailHandlerConfig } from '../../types/plugins/form-handlers/email-handler.js';

const debug = createDebug('Uttori.Plugin.FormHandler.Email');

/**
 * Replaces form placeholders as literal text so field names and values cannot change replacement syntax.
 * @param template Subject or HTML template.
 * @param formData Submitted field values.
 * @param formConfig Form metadata.
 * @returns Template with known placeholders filled in.
 */
const fillTemplate = (template: string, formData: Record<string, unknown>, formConfig: import('../form-handler.js').FormConfig): string => {
  let result = template.replaceAll('{formName}', () => formConfig.name);
  result = result.replaceAll('{timestamp}', () => new Date().toISOString());

  for (const [key, value] of Object.entries(formData)) {
    result = result.replaceAll(`{${key}}`, () => String(value));
  }

  return result;
};

/*
Example transportOptions: {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password',
  },
}
*/

/**
 * Email handler for form submissions.
 * @example <caption>EmailHandler</caption>
 * const emailHandler = EmailHandler.create(config);
 */
class EmailHandler {
  /**
   * Creates an email handler with the provided configuration.
   * @param config Email configuration.
   * @returns Form handler function.
   */
  static create(config: EmailHandlerConfig): import('../form-handler.js').FormHandlerFunction {
    if (!config.transportOptions || !config.from || !config.to) {
      throw new Error('Email handler requires transportOptions, from, and to configuration');
    }

    // Create transporter
    const transporter = createTransport(config.transportOptions);

    /**
     * @param formData Form data.
     * @param formConfig Form configuration.
     * @param _req The request.
     * @param _res The response.
     * @returns Form handler result.
     */
    return async (formData: Record<string, unknown>, formConfig: import('../form-handler.js').FormConfig, _req: import('express').Request, _res: import('express').Response): Promise<import('../form-handler.js').FormHandlerResult> => {
      try {
        debug('Sending email for form submission:', formConfig.name);

        // Generate subject
        const subject = EmailHandler.generateSubject(config.subject, formData, formConfig);

        // Generate body
        const body = EmailHandler.generateBody(config.template, formData, formConfig);

        // Send email
        const info = await transporter.sendMail({
          from: config.from,
          to: config.to,
          subject: subject,
          html: body,
        });

        debug('Email sent successfully:', info.messageId);

        return {
          success: true,
          message: 'Email sent successfully',
        };
      } catch (error) {
        debug('Email sending failed:', error);
        return {
          success: false,
          message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    };
  }

  /**
   * Generates email subject from template.
   * @param template Subject template; an empty value uses the default subject.
   * @param formData Form data.
   * @param formConfig Form configuration.
   * @returns Generated subject.
   */
  static generateSubject(template: string | undefined, formData: Record<string, unknown>, formConfig: import('../form-handler.js').FormConfig): string {
    return fillTemplate(template || `Form Submission: ${formConfig.name}`, formData, formConfig);
  }

  /**
   * Generates email body from template.
   * @param template Body template; an empty value uses the default HTML body.
   * @param formData Form data.
   * @param formConfig Form configuration.
   * @returns Generated body.
   */
  static generateBody(template: string | null | undefined, formData: Record<string, unknown>, formConfig: import('../form-handler.js').FormConfig): string {
    if (template) {
      return fillTemplate(template, formData, formConfig);
    }

    // Default template
    let body = `<h2>Form Submission: ${formConfig.name}</h2>`;
    body += `<p><strong>Submitted:</strong> ${new Date().toISOString()}</p>`;
    body += '<h3>Form Data:</h3><ul>';

    for (const [key, value] of Object.entries(formData)) {
      body += `<li><strong>${key}:</strong> ${String(value)}</li>`;
    }

    body += '</ul>';

    return body;
  }
}

export default EmailHandler;
