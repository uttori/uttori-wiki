## Classes

<dl>
<dt><a href="#GoogleDocsHandler">GoogleDocsHandler</a></dt>
<dd><p>Google Docs/Sheets handler for form submissions.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#GoogleDocsHandlerConfig">GoogleDocsHandlerConfig</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#GoogleDocsSheetItem">GoogleDocsSheetItem</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="GoogleDocsHandler"></a>

## GoogleDocsHandler
Google Docs/Sheets handler for form submissions.

**Kind**: global class  

* [GoogleDocsHandler](#GoogleDocsHandler)
    * [new GoogleDocsHandler()](#new_GoogleDocsHandler_new)
    * [.create(config)](#GoogleDocsHandler.create) ⇒ <code>FormHandlerFunction</code>
    * [.appendRow(config, formData, formConfig)](#GoogleDocsHandler.appendRow) ⇒ <code>Promise.&lt;module:googleapis~sheets\_v4.Schema$AppendValuesResponse&gt;</code>
    * [.prepareRowData(formData, formConfig, config)](#GoogleDocsHandler.prepareRowData) ⇒ <code>Array.&lt;string&gt;</code>
    * [.createSpreadsheet(config, spreadsheetName, [headers])](#GoogleDocsHandler.createSpreadsheet) ⇒ <code>Promise.&lt;string&gt;</code>
    * [.checkSpreadsheetExists(config)](#GoogleDocsHandler.checkSpreadsheetExists) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.listSpreadsheets(config)](#GoogleDocsHandler.listSpreadsheets) ⇒ <code>Promise.&lt;Array.&lt;GoogleDocsSheetItem&gt;&gt;</code>

<a name="new_GoogleDocsHandler_new"></a>

### new GoogleDocsHandler()
**Example** *(GoogleDocsHandler)*  
```js
const googleDocsHandler = GoogleDocsHandler.create(config);
```
<a name="GoogleDocsHandler.create"></a>

### GoogleDocsHandler.create(config) ⇒ <code>FormHandlerFunction</code>
Creates a Google Docs handler with the provided configuration.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)  
**Returns**: <code>FormHandlerFunction</code> - Form handler function.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>GoogleDocsHandlerConfig</code>](#GoogleDocsHandlerConfig) | Google Docs configuration. |

<a name="GoogleDocsHandler.appendRow"></a>

### GoogleDocsHandler.appendRow(config, formData, formConfig) ⇒ <code>Promise.&lt;module:googleapis~sheets\_v4.Schema$AppendValuesResponse&gt;</code>
Appends a row to the Google Sheet.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)  
**Returns**: <code>Promise.&lt;module:googleapis~sheets\_v4.Schema$AppendValuesResponse&gt;</code> - The response from the Google Sheets API.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>GoogleDocsHandlerConfig</code>](#GoogleDocsHandlerConfig) | Handler configuration. |
| formData | <code>Record.&lt;string, any&gt;</code> | Form data. |
| formConfig | <code>FormConfig</code> | Form configuration. |

<a name="GoogleDocsHandler.prepareRowData"></a>

### GoogleDocsHandler.prepareRowData(formData, formConfig, config) ⇒ <code>Array.&lt;string&gt;</code>
Prepares row data for Google Sheets.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)  
**Returns**: <code>Array.&lt;string&gt;</code> - Row data array.  

| Param | Type | Description |
| --- | --- | --- |
| formData | <code>Record.&lt;string, any&gt;</code> | Form data. |
| formConfig | <code>FormConfig</code> | Form configuration. |
| config | [<code>GoogleDocsHandlerConfig</code>](#GoogleDocsHandlerConfig) | Handler configuration. |

<a name="GoogleDocsHandler.createSpreadsheet"></a>

### GoogleDocsHandler.createSpreadsheet(config, spreadsheetName, [headers]) ⇒ <code>Promise.&lt;string&gt;</code>
Creates a new Google Sheet with the specified name and sheet.
Not used in this handler but is useful for debugging.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)  
**Returns**: <code>Promise.&lt;string&gt;</code> - The ID of the created spreadsheet.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>GoogleDocsHandlerConfig</code>](#GoogleDocsHandlerConfig) | Handler configuration. |
| spreadsheetName | <code>string</code> | Name for the new spreadsheet. |
| [headers] | <code>Array.&lt;string&gt;</code> | Custom headers for the spreadsheet (optional). |

<a name="GoogleDocsHandler.checkSpreadsheetExists"></a>

### GoogleDocsHandler.checkSpreadsheetExists(config) ⇒ <code>Promise.&lt;boolean&gt;</code>
Checks if a spreadsheet exists and is accessible.
Not used in this handler but is useful for debugging.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - True if the spreadsheet exists and is accessible.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>GoogleDocsHandlerConfig</code>](#GoogleDocsHandlerConfig) | Handler configuration. |

<a name="GoogleDocsHandler.listSpreadsheets"></a>

### GoogleDocsHandler.listSpreadsheets(config) ⇒ <code>Promise.&lt;Array.&lt;GoogleDocsSheetItem&gt;&gt;</code>
Lists all spreadsheets the service account has access to.
Not used in this handler but is useful for debugging.

**Kind**: static method of [<code>GoogleDocsHandler</code>](#GoogleDocsHandler)  
**Returns**: <code>Promise.&lt;Array.&lt;GoogleDocsSheetItem&gt;&gt;</code> - List of accessible spreadsheets.  

| Param | Type | Description |
| --- | --- | --- |
| config | [<code>GoogleDocsHandlerConfig</code>](#GoogleDocsHandlerConfig) | Handler configuration. |

<a name="GoogleDocsHandlerConfig"></a>

## GoogleDocsHandlerConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| credentialsPath | <code>string</code> | Path to Google service account credentials JSON file. |
| spreadsheetId | <code>string</code> | Google Sheets spreadsheet ID. |
| sheetName | <code>string</code> | Name of the sheet to write to. |
| [prependTimestamp] | <code>boolean</code> | Whether to prepend a timestamp to each row. |

<a name="GoogleDocsSheetItem"></a>

## GoogleDocsSheetItem : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the sheet. |
| id | <code>string</code> | The ID of the sheet. |

