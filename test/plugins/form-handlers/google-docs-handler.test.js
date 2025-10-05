import test from 'ava';
import sinon from 'sinon';
import GoogleDocsHandler from '../../../src/plugins/form-handlers/google-docs-handler.js';

let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('create: throws error on missing credentialsPath', (t) => {
  const config = {
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
  };

  t.throws(() => GoogleDocsHandler.create(config), {
    message: 'Google Docs handler requires credentialsPath, spreadsheetId, and sheetName configuration',
  });
});

test('create: throws error on missing spreadsheetId', (t) => {
  const config = {
    credentialsPath: '/path/to/credentials.json',
    sheetName: 'test-sheet',
  };

  t.throws(() => GoogleDocsHandler.create(config), {
    message: 'Google Docs handler requires credentialsPath, spreadsheetId, and sheetName configuration',
  });
});

test('create: throws error on missing sheetName', (t) => {
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
  };

  t.throws(() => GoogleDocsHandler.create(config), {
    message: 'Google Docs handler requires credentialsPath, spreadsheetId, and sheetName configuration',
  });
});

test('create: returns handler function with valid config', (t) => {
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
  };

  const handler = GoogleDocsHandler.create(config);
  t.is(typeof handler, 'function');
});

test('prepareRowData: returns correct row data without timestamp', (t) => {
  const formData = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  const formConfig = {
    name: 'contact-form',
    route: '/contact',
    fields: [
      { name: 'name', type: 'text', required: false },
      { name: 'email', type: 'email', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.deepEqual(result, ['contact-form', 'John Doe', 'john@example.com']);
});

test('prepareRowData: returns correct row data with timestamp', (t) => {
  const formData = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  const formConfig = {
    name: 'contact-form',
    route: '/contact',
    fields: [
      { name: 'name', type: 'text', required: false },
      { name: 'email', type: 'email', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: true,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.is(result.length, 4);
  t.true(typeof result[0] === 'string'); // Timestamp comes first
  t.is(result[1], 'contact-form'); // Form name comes second
  t.is(result[2], 'John Doe');
  t.is(result[3], 'john@example.com');
});

test('prepareRowData: handles missing form data values', (t) => {
  const formData = {
    name: 'John Doe',
    // email is missing
  };

  const formConfig = {
    name: 'contact-form',
    route: '/contact',
    fields: [
      { name: 'name', type: 'text', required: false },
      { name: 'email', type: 'email', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.deepEqual(result, ['contact-form', 'John Doe', '']);
});

test('prepareRowData: converts all values to strings', (t) => {
  const formData = {
    number: 123,
    boolean: true,
    nullValue: null,
    undefinedValue: undefined,
  };

  const formConfig = {
    name: 'test-form',
    route: '/test',
    fields: [
      { name: 'number', type: 'number', required: false },
      { name: 'boolean', type: 'checkbox', required: false },
      { name: 'nullValue', type: 'text', required: false },
      { name: 'undefinedValue', type: 'text', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.deepEqual(result, ['test-form', '123', 'true', '', '']);
});

test('prepareRowData: handles empty form data', (t) => {
  const formData = {};

  const formConfig = {
    name: 'empty-form',
    route: '/empty',
    fields: [
      { name: 'field1', type: 'text', required: false },
      { name: 'field2', type: 'email', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.deepEqual(result, ['empty-form', '', '']);
});

test('prepareRowData: handles form data with extra fields not in config', (t) => {
  const formData = {
    name: 'John Doe',
    email: 'john@example.com',
    extraField: 'should be ignored',
  };

  const formConfig = {
    name: 'contact-form',
    route: '/contact',
    fields: [
      { name: 'name', type: 'text', required: false },
      { name: 'email', type: 'email', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.deepEqual(result, ['contact-form', 'John Doe', 'john@example.com']);
});

test('prepareRowData: handles complex data types', (t) => {
  const formData = {
    object: { key: 'value' },
    array: [1, 2, 3],
    date: new Date('2023-01-01'),
  };

  const formConfig = {
    name: 'complex-form',
    route: '/complex',
    fields: [
      { name: 'object', type: 'text', required: false },
      { name: 'array', type: 'text', required: false },
      { name: 'date', type: 'date', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.is(result[0], 'complex-form');
  t.is(result[1], '[object Object]');
  t.is(result[2], '1,2,3');
  t.true(typeof result[3] === 'string'); // Date converted to string
});

test('prepareRowData: handles timestamp configuration correctly', (t) => {
  const formData = {
    name: 'Test',
  };
  const formConfig = {
    name: 'test-form',
    route: '/test',
    fields: [{ name: 'name', type: 'text', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  // Test with timestamp enabled
  const configWithTimestamp = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: true,
  };
  const resultWithTimestamp = GoogleDocsHandler.prepareRowData(formData, formConfig, configWithTimestamp);
  t.is(resultWithTimestamp.length, 3); // timestamp + form name + field
  t.true(typeof resultWithTimestamp[0] === 'string'); // timestamp
  t.is(resultWithTimestamp[1], 'test-form');
  t.is(resultWithTimestamp[2], 'Test');

  // Test with timestamp disabled
  const configWithoutTimestamp = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };
  const resultWithoutTimestamp = GoogleDocsHandler.prepareRowData(formData, formConfig, configWithoutTimestamp);
  t.is(resultWithoutTimestamp.length, 2); // form name + field only
  t.is(resultWithoutTimestamp[0], 'test-form');
  t.is(resultWithoutTimestamp[1], 'Test');

  // Test with undefined timestamp config (should default to false)
  const configUndefined = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
  };
  const resultUndefined = GoogleDocsHandler.prepareRowData(formData, formConfig, configUndefined);
  t.is(resultUndefined.length, 2); // form name + field only
  t.is(resultUndefined[0], 'test-form');
  t.is(resultUndefined[1], 'Test');
});

test('prepareRowData: maintains field order from form config', (t) => {
  const formData = {
    third: 'third value',
    first: 'first value',
    second: 'second value',
  };

  const formConfig = {
    name: 'order-test',
    route: '/order',
    fields: [
      { name: 'first', type: 'text', required: false },
      { name: 'second', type: 'text', required: false },
      { name: 'third', type: 'text', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.deepEqual(result, ['order-test', 'first value', 'second value', 'third value']);
});

test('prepareRowData: handles special characters in data', (t) => {
  const formData = {
    special: 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?',
    unicode: 'Unicode: 你好世界 🌍',
    newlines: 'Line 1\nLine 2\r\nLine 3',
  };

  const formConfig = {
    name: 'special-chars',
    route: '/special',
    fields: [
      { name: 'special', type: 'text', required: false },
      { name: 'unicode', type: 'text', required: false },
      { name: 'newlines', type: 'textarea', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.is(result[0], 'special-chars');
  t.is(result[1], 'Special chars: !@#$%^&*()_+-=[]{}|;:,.<>?');
  t.is(result[2], 'Unicode: 你好世界 🌍');
  t.is(result[3], 'Line 1\nLine 2\r\nLine 3');
});

test('prepareRowData: handles very long strings', (t) => {
  const longString = 'a'.repeat(10000);
  const formData = { longField: longString };

  const formConfig = {
    name: 'long-string-test',
    route: '/long',
    fields: [{ name: 'longField', type: 'textarea', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.is(result[0], 'long-string-test');
  t.is(result[1], longString);
  t.is(result[1].length, 10000);
});

test('prepareRowData: handles numeric zero and false values', (t) => {
  const formData = {
    zero: 0,
    falseValue: false,
    emptyString: '',
  };

  const formConfig = {
    name: 'falsy-values',
    route: '/falsy',
    fields: [
      { name: 'zero', type: 'number', required: false },
      { name: 'falseValue', type: 'checkbox', required: false },
      { name: 'emptyString', type: 'text', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.deepEqual(result, ['falsy-values', '', '', '']);
});

test('prepareRowData: handles undefined timestamp config gracefully', (t) => {
  const formData = { name: 'Test' };
  const formConfig = {
    name: 'test-form',
    route: '/test',
    fields: [{ name: 'name', type: 'text', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  // No prependTimestamp property
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.is(result.length, 2); // Should not include timestamp
  t.deepEqual(result, ['test-form', 'Test']);
});

test('prepareRowData: handles null timestamp config gracefully', (t) => {
  const formData = { name: 'Test' };
  const formConfig = {
    name: 'test-form',
    route: '/test',
    fields: [{ name: 'name', type: 'text', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: null,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.is(result.length, 2); // Should not include timestamp
  t.deepEqual(result, ['test-form', 'Test']);
});

test('prepareRowData: handles empty fields array', (t) => {
  const formData = { name: 'Test' };
  const formConfig = {
    name: 'test-form',
    route: '/test',
    fields: [],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.is(result.length, 1); // Only form name
  t.deepEqual(result, ['test-form']);
});

test('prepareRowData: handles fields with no name property', (t) => {
  const formData = { name: 'Test' };
  const formConfig = {
    name: 'test-form',
    route: '/test',
    fields: [
      { type: 'text', required: false }, // Missing name
      { name: 'validField', type: 'text' },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
    prependTimestamp: false,
  };

  const result = GoogleDocsHandler.prepareRowData(formData, formConfig, config);

  t.is(result.length, 3); // form name + undefined + valid field
  t.is(result[0], 'test-form');
  t.is(result[1], ''); // undefined field name
  t.is(result[2], ''); // valid field but formData doesn't have 'validField'
});

test('appendRow: is a static method', (t) => {
  t.is(typeof GoogleDocsHandler.appendRow, 'function');
});

test('appendRow: requires config parameter', async (t) => {
  const formData = { name: 'Test' };
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [{ name: 'name', type: 'text', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  await t.throwsAsync(
    () => GoogleDocsHandler.appendRow(null, formData, formConfig),
    { message: /Cannot read properties of null/ }
  );
});

test('appendRow: requires formData parameter', async (t) => {
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
  };
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [{ name: 'name', type: 'text', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  await t.throwsAsync(
    () => GoogleDocsHandler.appendRow(config, null, formConfig),
    { message: /Cannot read properties of null/ }
  );
});

test('appendRow: requires formConfig parameter', async (t) => {
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
  };
  const formData = { name: 'Test' };

  await t.throwsAsync(
    () => GoogleDocsHandler.appendRow(config, formData, null),
    { message: /Cannot read properties of null/ }
  );
});

test('appendRow: throws error when credentialsPath is missing', async (t) => {
  const config = {
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
  };
  const formData = { name: 'Test' };
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [{ name: 'name', type: 'text', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  await t.throwsAsync(
    () => GoogleDocsHandler.appendRow(config, formData, formConfig),
    { message: /Could not load the default credentials/ }
  );
});

test('appendRow: throws error when spreadsheetId is missing', async (t) => {
  const config = {
    credentialsPath: '/path/to/credentials.json',
    sheetName: 'test-sheet',
  };
  const formData = { name: 'Test' };
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [{ name: 'name', type: 'text', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  await t.throwsAsync(
    () => GoogleDocsHandler.appendRow(config, formData, formConfig),
    { message: /spreadsheetId/ }
  );
});

test('appendRow: throws error when sheetName is missing', async (t) => {
  const config = {
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
  };
  const formData = { name: 'Test' };
  const formConfig = {
    name: 'test',
    route: '/test',
    fields: [{ name: 'name', type: 'text', required: false }],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  };

  await t.throwsAsync(
    () => GoogleDocsHandler.appendRow(config, formData, formConfig),
    { message: /ENOENT/ }
  );
});
