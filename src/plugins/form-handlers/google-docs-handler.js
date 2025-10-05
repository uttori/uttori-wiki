import { google } from 'googleapis';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.Plugin.FormHandler.GoogleDocs'); } catch {}

/**
 * @typedef {object} GoogleDocsHandlerConfig
 * @property {string} credentialsPath Path to Google service account credentials JSON file.
 * @property {string} spreadsheetId Google Sheets spreadsheet ID.
 * @property {string} sheetName Name of the sheet to write to.
 * @property {boolean} [prependTimestamp] Whether to prepend a timestamp to each row.
 */

/**
 * Google Docs/Sheets handler for form submissions.
 * @example <caption>GoogleDocsHandler</caption>
 * const googleDocsHandler = GoogleDocsHandler.create(config);
 * @class
 */
class GoogleDocsHandler {
  /**
   * Creates a Google Docs handler with the provided configuration.
   * @param {GoogleDocsHandlerConfig} config Google Docs configuration.
   * @returns {import('../form-handler.js').FormHandlerFunction} Form handler function.
   * @static
   */
  static create(config) {
    if (!config.credentialsPath || !config.spreadsheetId || !config.sheetName) {
      throw new Error('Google Docs handler requires credentialsPath, spreadsheetId, and sheetName configuration');
    }

    /**
     * @param {Record<string, any>} formData Form data.
     * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
     * @param {import('express').Request} _req The request.
     * @param {import('express').Response} _res The response.
     * @returns {Promise<import('../form-handler.js').FormHandlerResult>} Form handler result.
     */
    return async (formData, formConfig, _req, _res) => {
      /* c8 ignore next 15 */
      try {
        debug('Writing to Google Sheets for form submission:', formConfig.name);

        await GoogleDocsHandler.appendRow(config, formData, formConfig);

        return {
          success: true,
        };
      } catch (error) {
        debug('Google Sheets writing failed:', error);
        return {
          success: false,
        };
      }
    };
  }

  /**
   * Appends a row to the Google Sheet.
   * @param {GoogleDocsHandlerConfig} config Handler configuration.
   * @param {Record<string, any>} formData Form data.
   * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
   * @returns {Promise<import('googleapis').sheets_v4.Schema$AppendValuesResponse>} The response from the Google Sheets API.
   * @static
   */
  static async appendRow(config, formData, formConfig) {
    debug('Appending row to Google Sheet:', config, formData, formConfig);

    // Load credentials
    const auth = new google.auth.GoogleAuth({
      keyFile: config.credentialsPath,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare data row
    const rowData = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

    // Append data to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: config.spreadsheetId,
      range: `${config.sheetName}!A:Z`,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: {
        values: [rowData],
      },
    });

    debug('Data appended to Google Sheet successfully:', response.data);
    return response.data;
  }

  /**
   * Prepares row data for Google Sheets.
   * @param {Record<string, any>} formData Form data.
   * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
   * @param {GoogleDocsHandlerConfig} config Handler configuration.
   * @returns {string[]} Row data array.
   * @static
   */
  static prepareRowData(formData, formConfig, config) {
    /** @type {string[]} */
    const rowData = [];

    // Add timestamp if requested
    if (config.prependTimestamp) {
      rowData.push(new Date().toISOString());
    }

    // Add form name
    rowData.push(formConfig.name);

    // Use form field order
    for (const field of formConfig.fields) {
      rowData.push(String(formData[field.name] || ''));
    }

    return rowData;
  }

  /**
   * Creates a new Google Sheet with the specified name and sheet.
   * Not used in this handler but is useful for debugging.
   * @param {GoogleDocsHandlerConfig} config Handler configuration.
   * @param {string} spreadsheetName Name for the new spreadsheet.
   * @param {string[]} [headers] Custom headers for the spreadsheet (optional).
   * @returns {Promise<string>} The ID of the created spreadsheet.
   * @static
   */
  static async createSpreadsheet(config, spreadsheetName, headers) {
    try {
      debug('Creating new Google Sheet:', spreadsheetName);

      const auth = new google.auth.GoogleAuth({
        keyFile: config.credentialsPath,
        scopes: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive',
        ],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // Create the spreadsheet
      const createResponse = await sheets.spreadsheets.create({
        requestBody: {
          properties: {
            title: spreadsheetName,
          },
          sheets: [
            {
              properties: {
                title: config.sheetName,
              },
            },
          ],
        },
      });

      const spreadsheetId = createResponse.data.spreadsheetId;
      debug('Created Google Sheet with ID:', spreadsheetId);

      // Set up headers if they exist
      if (headers && headers.length > 0) {
        const headers = [];

        // Add timestamp header if requested
        if (config.prependTimestamp) {
          headers.push('Timestamp');
        }

        // Add form name header
        headers.push('Form Name');

        // Add field headers
        if (headers && headers.length > 0) {
          headers.push(...headers);
        }

        // Write headers to sheet
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${config.sheetName}!A1:${String.fromCharCode(65 + headers.length - 1)}1`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [headers],
          },
        });
      }

      return spreadsheetId;
    } catch (error) {
      debug('Failed to create Google Sheet:', error);
      throw new Error(`Failed to create Google Sheet: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Checks if a spreadsheet exists and is accessible.
   * Not used in this handler but is useful for debugging.
   * @param {GoogleDocsHandlerConfig} config Handler configuration.
   * @returns {Promise<boolean>} True if the spreadsheet exists and is accessible.
   * @static
   */
  static async checkSpreadsheetExists(config) {
    try {
      if (!config.spreadsheetId) {
        return false;
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: config.credentialsPath,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const sheets = google.sheets({ version: 'v4', auth });

      // Try to get spreadsheet metadata
      await sheets.spreadsheets.get({
        spreadsheetId: config.spreadsheetId,
      });

      return true;
    } catch (error) {
      debug('Spreadsheet does not exist or is not accessible:', error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Lists all spreadsheets the service account has access to.
   * Not used in this handler but is useful for debugging.
   * @param {GoogleDocsHandlerConfig} config Handler configuration.
   * @returns {Promise<{ id: string; name: string; }[]>} List of accessible spreadsheets.
   * @static
   */
  static async listSpreadsheets(config) {
    const auth = new google.auth.GoogleAuth({
      keyFile: config.credentialsPath,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    // List all spreadsheets ("templates") the service account has access to and log them
    const drive = google.drive({ version: 'v3', auth });
    const filesRes = await drive.files.list({
      q: 'mimeType=\'application/vnd.google-apps.spreadsheet\'',
      fields: 'files(id, name)',
      pageSize: 100,
    });
    const templates = (filesRes.data.files || []).map((f) => ({ id: f.id, name: f.name }));
    debug('Accessible Google Sheets (templates):', templates);
    return templates;
  }
}

export default GoogleDocsHandler;
