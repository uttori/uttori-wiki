## Classes

<dl>
<dt><a href="#GoogleDocsHandler">GoogleDocsHandler</a></dt>
<dd><p>Google Docs/Sheets handler for form submissions.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#columnLabel">columnLabel(column)</a> ⇒</dt>
<dd><p>Converts a one-based column number to a Sheets column label, including columns after Z.</p>
</dd>
</dl>

<a name="GoogleDocsHandler"></a>

## GoogleDocsHandler
Google Docs/Sheets handler for form submissions.

**Kind**: global class\

* [GoogleDocsHandler](#GoogleDocsHandler)
    * [new GoogleDocsHandler()](#new_GoogleDocsHandler_new)
    * [.create(config)](#GoogleDocsHandler.create) ⇒
    * [.appendRow(config, formData, formConfig)](#GoogleDocsHandler.appendRow) ⇒
    * [.prepareRowData(formData, formConfig, config)](#GoogleDocsHandler.prepareRowData) ⇒
    * [.createSpreadsheet(config, spreadsheetName, [headers])](#GoogleDocsHandler.createSpreadsheet) ⇒
    * [.checkSpreadsheetExists(config)](#GoogleDocsHandler.checkSpreadsheetExists) ⇒
    * [.listSpreadsheets(config)](#GoogleDocsHandler.listSpreadsheets) ⇒

<a name="new_GoogleDocsHandler_new"></a>

### new GoogleDocsHandler()
**Example** *(GoogleDocsHandler)*\
```js
const googleDocsHandler = GoogleDocsHandler.create(config);
```
<a name="GoogleDocsHandler.create"></a>

### GoogleDocsHandler.create(config) ⇒
Creates a Google Docs handler with the provided configuration.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)\
**Returns**: Form handler function.\

| Param | Description |
| --- | --- |
| config | Google Docs configuration. |

<a name="GoogleDocsHandler.appendRow"></a>

### GoogleDocsHandler.appendRow(config, formData, formConfig) ⇒
Appends a row to the Google Sheet.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)\
**Returns**: The response from the Google Sheets API.\

| Param | Description |
| --- | --- |
| config | Handler configuration. |
| formData | Form data. |
| formConfig | Form configuration. |

<a name="GoogleDocsHandler.prepareRowData"></a>

### GoogleDocsHandler.prepareRowData(formData, formConfig, config) ⇒
Prepares row data for Google Sheets.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)\
**Returns**: Row data array.\

| Param | Description |
| --- | --- |
| formData | Form data. |
| formConfig | Form configuration. |
| config | Handler configuration. |

<a name="GoogleDocsHandler.createSpreadsheet"></a>

### GoogleDocsHandler.createSpreadsheet(config, spreadsheetName, [headers]) ⇒
Creates a new Google Sheet with the specified name and sheet.
Not used in this handler but is useful for debugging.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)\
**Returns**: The ID of the created spreadsheet.\

| Param | Description |
| --- | --- |
| config | Handler configuration. |
| spreadsheetName | Name for the new spreadsheet. |
| [headers] | Custom headers for the spreadsheet (optional). |

<a name="GoogleDocsHandler.checkSpreadsheetExists"></a>

### GoogleDocsHandler.checkSpreadsheetExists(config) ⇒
Checks if a spreadsheet exists and is accessible.
Not used in this handler but is useful for debugging.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)\
**Returns**: True if the spreadsheet exists and is accessible.\

| Param | Description |
| --- | --- |
| config | Handler configuration. |

<a name="GoogleDocsHandler.listSpreadsheets"></a>

### GoogleDocsHandler.listSpreadsheets(config) ⇒
Lists all spreadsheets the service account has access to.
Not used in this handler but is useful for debugging.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)\
**Returns**: List of accessible spreadsheets.\

| Param | Description |
| --- | --- |
| config | Handler configuration. |

<a name="columnLabel"></a>

## columnLabel(column) ⇒
Converts a one-based column number to a Sheets column label, including columns after Z.

**Kind**: global function\
**Returns**: Column label.\

| Param | Description |
| --- | --- |
| column | One-based column number. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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
```

</details>
