import type { GoogleDocsHandlerConfig, GoogleDocsSheetItem } from '../../types/plugins/form-handlers/google-docs-handler.js';
export type { GoogleDocsHandlerConfig, GoogleDocsSheetItem, } from '../../types/plugins/form-handlers/google-docs-handler.js';
/**
 * Google Docs/Sheets handler for form submissions.
 * @example <caption>GoogleDocsHandler</caption>
 * const googleDocsHandler = GoogleDocsHandler.create(config);
 */
declare class GoogleDocsHandler {
    /**
     * Creates a Google Docs handler with the provided configuration.
     * @param config Google Docs configuration.
     * @returns Form handler function.
     */
    static create(config: GoogleDocsHandlerConfig): import('../form-handler.js').FormHandlerFunction;
    /**
     * Appends a row to the Google Sheet.
     * @param config Handler configuration.
     * @param formData Form data.
     * @param formConfig Form configuration.
     * @returns The response from the Google Sheets API.
     */
    static appendRow(config: GoogleDocsHandlerConfig, formData: Record<string, unknown>, formConfig: import('../form-handler.js').FormConfig): Promise<import('googleapis').sheets_v4.Schema$AppendValuesResponse>;
    /**
     * Prepares row data for Google Sheets.
     * @param formData Form data.
     * @param formConfig Form configuration.
     * @param config Handler configuration.
     * @returns Row data array.
     */
    static prepareRowData(formData: Record<string, unknown>, formConfig: import('../form-handler.js').FormConfig, config: GoogleDocsHandlerConfig): string[];
    /**
     * Creates a new Google Sheet with the specified name and sheet.
     * Not used in this handler but is useful for debugging.
     * @param config Handler configuration.
     * @param spreadsheetName Name for the new spreadsheet.
     * @param [headers] Custom headers for the spreadsheet (optional).
     * @returns The ID of the created spreadsheet.
     */
    static createSpreadsheet(config: GoogleDocsHandlerConfig, spreadsheetName: string, headers?: string[]): Promise<string>;
    /**
     * Checks if a spreadsheet exists and is accessible.
     * Not used in this handler but is useful for debugging.
     * @param config Handler configuration.
     * @returns True if the spreadsheet exists and is accessible.
     */
    static checkSpreadsheetExists(config: GoogleDocsHandlerConfig): Promise<boolean>;
    /**
     * Lists all spreadsheets the service account has access to.
     * Not used in this handler but is useful for debugging.
     * @param config Handler configuration.
     * @returns List of accessible spreadsheets.
     */
    static listSpreadsheets(config: GoogleDocsHandlerConfig): Promise<GoogleDocsSheetItem[]>;
}
export default GoogleDocsHandler;
//# sourceMappingURL=google-docs-handler.d.ts.map