export default GoogleDocsHandler;
export type GoogleDocsHandlerConfig = {
    /**
     * Path to Google service account credentials JSON file.
     */
    credentialsPath: string;
    /**
     * Google Sheets spreadsheet ID.
     */
    spreadsheetId: string;
    /**
     * Name of the sheet to write to.
     */
    sheetName: string;
    /**
     * Whether to prepend a timestamp to each row.
     */
    prependTimestamp?: boolean;
};
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
declare class GoogleDocsHandler {
    /**
     * Creates a Google Docs handler with the provided configuration.
     * @param {GoogleDocsHandlerConfig} config Google Docs configuration.
     * @returns {import('../form-handler.js').FormHandlerFunction} Form handler function.
     * @static
     */
    static create(config: GoogleDocsHandlerConfig): import("../form-handler.js").FormHandlerFunction;
    /**
     * Appends a row to the Google Sheet.
     * @param {GoogleDocsHandlerConfig} config Handler configuration.
     * @param {Record<string, any>} formData Form data.
     * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
     * @returns {Promise<import('googleapis').sheets_v4.Schema$AppendValuesResponse>} The response from the Google Sheets API.
     * @static
     */
    static appendRow(config: GoogleDocsHandlerConfig, formData: Record<string, any>, formConfig: import("../form-handler.js").FormConfig): Promise<import("googleapis").sheets_v4.Schema$AppendValuesResponse>;
    /**
     * Prepares row data for Google Sheets.
     * @param {Record<string, any>} formData Form data.
     * @param {import('../form-handler.js').FormConfig} formConfig Form configuration.
     * @param {GoogleDocsHandlerConfig} config Handler configuration.
     * @returns {string[]} Row data array.
     * @static
     */
    static prepareRowData(formData: Record<string, any>, formConfig: import("../form-handler.js").FormConfig, config: GoogleDocsHandlerConfig): string[];
    /**
     * Creates a new Google Sheet with the specified name and sheet.
     * Not used in this handler but is useful for debugging.
     * @param {GoogleDocsHandlerConfig} config Handler configuration.
     * @param {string} spreadsheetName Name for the new spreadsheet.
     * @param {string[]} [headers] Custom headers for the spreadsheet (optional).
     * @returns {Promise<string>} The ID of the created spreadsheet.
     * @static
     */
    static createSpreadsheet(config: GoogleDocsHandlerConfig, spreadsheetName: string, headers?: string[]): Promise<string>;
    /**
     * Checks if a spreadsheet exists and is accessible.
     * Not used in this handler but is useful for debugging.
     * @param {GoogleDocsHandlerConfig} config Handler configuration.
     * @returns {Promise<boolean>} True if the spreadsheet exists and is accessible.
     * @static
     */
    static checkSpreadsheetExists(config: GoogleDocsHandlerConfig): Promise<boolean>;
    /**
     * Lists all spreadsheets the service account has access to.
     * Not used in this handler but is useful for debugging.
     * @param {GoogleDocsHandlerConfig} config Handler configuration.
     * @returns {Promise<{ id: string; name: string; }[]>} List of accessible spreadsheets.
     * @static
     */
    static listSpreadsheets(config: GoogleDocsHandlerConfig): Promise<{
        id: string;
        name: string;
    }[]>;
}
//# sourceMappingURL=google-docs-handler.d.ts.map