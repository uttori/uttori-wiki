import { createTransport } from 'nodemailer';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.FormHandler.Email'); } catch {}

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
   * @param {string} template Subject template.
   * @param {Record<string, any>} formData Form data.
   * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
   * @returns {string} Generated subject.
   * @static
   */
  static generateSubject(template, formData, formConfig) {
    let subject = template || `Form Submission: ${formConfig.name}`;

    // Replace placeholders
    subject = subject.replace(/\{formName\}/g, formConfig.name);
    subject = subject.replace(/\{timestamp\}/g, new Date().toISOString());

    // Replace field placeholders
    for (const [key, value] of Object.entries(formData)) {
      // eslint-disable-next-line security/detect-non-literal-regexp
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      subject = subject.replace(placeholder, String(value));
    }

    return subject;
  }

  /**
   * Generates email body from template.
   * @param {string} template Body template.
   * @param {Record<string, any>} formData Form data.
   * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
   * @returns {string} Generated body.
   * @static
   */
  static generateBody(template, formData, formConfig) {
    if (template) {
      let body = template;

      // Replace placeholders
      body = body.replace(/\{formName\}/g, formConfig.name);
      body = body.replace(/\{timestamp\}/g, new Date().toISOString());

      // Replace field placeholders
      for (const [key, value] of Object.entries(formData)) {
        // eslint-disable-next-line security/detect-non-literal-regexp
        const placeholder = new RegExp(`\\{${key}\\}`, 'g');
        body = body.replace(placeholder, String(value));
      }

      return body;
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
