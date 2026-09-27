export interface GoogleDocsHandlerConfig {
    /** Path to Google service account credentials JSON file. */
    credentialsPath: string;
    /** Google Sheets spreadsheet ID. */
    spreadsheetId: string;
    /** Name of the sheet to write to. */
    sheetName: string;
    /** Whether to prepend a timestamp to each row. */
    prependTimestamp?: boolean;
}
export interface GoogleDocsSheetItem {
    /** The name of the sheet. */
    name?: string | null;
    /** The ID of the sheet. */
    id?: string | null;
}
//# sourceMappingURL=google-docs-handler.d.ts.map