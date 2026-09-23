import { createDebug } from '../../debug.js';
import { createTransport } from 'nodemailer';

const debug = createDebug('Uttori.Plugin.FormHandler.Email');

/**
 * Replaces form placeholders as literal text so field names and values cannot change replacement syntax.
 * @param {string} template Subject or HTML template.
 * @param {Record<string, any>} formData Submitted field values.
 * @param {import('../form-handler.js').FormConfig} formConfig Form metadata.
 * @returns {string} Template with known placeholders filled in.
 */
const fillTemplate = (template, formData, formConfig) => {
  let result = template.replaceAll('{formName}', () => formConfig.name);
  result = result.replaceAll('{timestamp}', () => new Date().toISOString());

  for (const [key, value] of Object.entries(formData)) {
    result = result.replaceAll(`{${key}}`, () => String(value));
  }

  return result;
};

/**
 * @typedef {object} EmailHandlerConfig
 * @property {import('nodemailer').TransportOptions} transportOptions Nodemailer transport options.
 * @property {string} from Email address to send from.
 * @property {string} to Email address to send to.
 * @property {string} subject Email subject template.
 * @property {string} [template] Email body template (optional).
 */

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
 * @class
 */
class EmailHandler {
  /**
   * Creates an email handler with the provided configuration.
   * @param {EmailHandlerConfig} config Email configuration.
   * @returns {import('../form-handler.js').FormHandlerFunction} Form handler function.
   * @static
   */
  static create(config) {
    if (!config.transportOptions || !config.from || !config.to) {
      throw new Error('Email handler requires transportOptions, from, and to configuration');
    }

    // Create transporter
    const transporter = createTransport(config.transportOptions);

    /**
     * @param {Record<string, any>} formData Form data.
     * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
     * @param {import('express').Request} _req The request.
     * @param {import('express').Response} _res The response.
     * @returns {Promise<import('../form-handler.js').FormHandlerResult>} Form handler result.
     */
    return async (formData, formConfig, _req, _res) => {
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
   * @param {string | undefined} template Subject template; an empty value uses the default subject.
   * @param {Record<string, any>} formData Form data.
   * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
   * @returns {string} Generated subject.
   * @static
   */
  static generateSubject(template, formData, formConfig) {
    return fillTemplate(template || `Form Submission: ${formConfig.name}`, formData, formConfig);
  }

  /**
   * Generates email body from template.
   * @param {string | null | undefined} template Body template; an empty value uses the default HTML body.
   * @param {Record<string, any>} formData Form data.
   * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
   * @returns {string} Generated body.
   * @static
   */
  static generateBody(template, formData, formConfig) {
    if (template) {
      return fillTemplate(template, formData, formConfig);
    }

    // Default template
    let body = `<h2>Form Submission: ${formConfig.name}</h2>`;
    body += `<p><strong>Submitted:</strong> ${new Date().toISOString()}</p>`;
    body += '<h3>Form Data:</h3><ul>';

    for (const [key, value] of Object.entries(formData)) {
      body += `<li><strong>${key}:</strong> ${value}</li>`;
    }

    body += '</ul>';

    return body;
  }
}

export default EmailHandler;
