import test from 'ava';
import sinon from 'sinon';
import { google } from 'googleapis';
import GoogleDocsHandler from '../../../src/plugins/form-handlers/google-docs-handler.js';

/** @type {import('sinon').SinonSandbox} */
let sandbox;
test.beforeEach(() => {
  sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

/**
 * Returns a minimal GoogleDocsHandlerConfig for tests.
 * @returns {import('../../../src/plugins/form-handlers/google-docs-handler.js').GoogleDocsHandlerConfig}
 */
const baseConfig = () => ({
  credentialsPath: '/fake/credentials.json',
  spreadsheetId: 'fake-spreadsheet-id',
  sheetName: 'Sheet1',
});

/**
 * Returns a minimal FormConfig for tests.
 * @returns {import('../../../src/plugins/form-handler.js').FormConfig}
 */
const baseFormConfig = () => /** @type {any} */ ({
  name: 'contact-form',
  route: '/contact',
  fields: [
    { name: 'name', type: 'text', required: false },
    { name: 'email', type: 'email', required: false },
  ],
  successMessage: 'Success!',
  errorMessage: 'Error!',
});

/**
 * Stubs google.auth.GoogleAuth and google.sheets with in-memory fakes.
 * Returns the append stub so callers can assert on it.
 * @param {{ rejectAppend?: boolean }} [opts]
 * @returns {{ appendStub: import('sinon').SinonStub, updateStub: import('sinon').SinonStub, createStub: import('sinon').SinonStub, getStub: import('sinon').SinonStub }}
 */
const stubGoogleSheets = ({ rejectAppend = false } = {}) => {
  const fakeAuth = {};
  sandbox.stub(google.auth, 'GoogleAuth').callsFake(function () { return fakeAuth; });

  const appendStub = rejectAppend
    ? sandbox.stub().rejects(new Error('Sheets API error'))
    : sandbox.stub().resolves({ data: { tableRange: 'Sheet1!A1:B1' } });
  const updateStub = sandbox.stub().resolves({ data: {} });
  const createStub = sandbox.stub().resolves({ data: { spreadsheetId: 'new-id' } });
  const getStub = sandbox.stub().resolves({ data: { spreadsheetId: 'fake-spreadsheet-id' } });

  sandbox.stub(google, 'sheets').returns({
    spreadsheets: {
      values: { append: appendStub, update: updateStub },
      create: createStub,
      get: getStub,
    },
  });

  return { appendStub, updateStub, createStub, getStub };
};

/**
 * Stubs google.auth.GoogleAuth and google.drive with in-memory fakes.
 * @param {{ rejectList?: boolean }} [opts]
 * @returns {{ listStub: import('sinon').SinonStub }}
 */
const stubGoogleDrive = ({ rejectList = false } = {}) => {
  const fakeAuth = {};
  sandbox.stub(google.auth, 'GoogleAuth').callsFake(function () { return fakeAuth; });

  const listStub = rejectList
    ? sandbox.stub().rejects(new Error('Drive API error'))
    : sandbox.stub().resolves({
      data: {
        files: [
          { id: 'sheet-1', name: 'My Sheet' },
          { id: 'sheet-2', name: 'Another Sheet' },
        ],
      },
    });

  sandbox.stub(google, 'drive').returns({
    files: { list: listStub },
  });

  return { listStub };
};

test('create: throws error on missing credentialsPath', (t) => {
  const config = /** @type {any} */ ({
    spreadsheetId: 'test-spreadsheet-id',
    sheetName: 'test-sheet',
  });

  t.throws(() => GoogleDocsHandler.create(config), {
    message: 'Google Docs handler requires credentialsPath, spreadsheetId, and sheetName configuration',
  });
});

test('create: throws error on missing spreadsheetId', (t) => {
  const config = /** @type {any} */ ({
    credentialsPath: '/path/to/credentials.json',
    sheetName: 'test-sheet',
  });

  t.throws(() => GoogleDocsHandler.create(config), {
    message: 'Google Docs handler requires credentialsPath, spreadsheetId, and sheetName configuration',
  });
});

test('create: throws error on missing sheetName', (t) => {
  const config = /** @type {any} */ ({
    credentialsPath: '/path/to/credentials.json',
    spreadsheetId: 'test-spreadsheet-id',
  });

  t.throws(() => GoogleDocsHandler.create(config), {
    message: 'Google Docs handler requires credentialsPath, spreadsheetId, and sheetName configuration',
  });
});

test('create: returns handler function with valid config', (t) => {
  const handler = GoogleDocsHandler.create(baseConfig());
  t.is(typeof handler, 'function');
});

test.serial('create: handler resolves successfully via stubbed appendRow', async (t) => {
  const appendRowStub = sandbox.stub(GoogleDocsHandler, 'appendRow').resolves({ tableRange: 'Sheet1!A1' });

  const handler = GoogleDocsHandler.create(baseConfig());
  const result = await handler({ name: 'Alice' }, baseFormConfig(), null, null);

  t.true(result.success);
  t.true(appendRowStub.calledOnce);
});

test.serial('create: handler resolves with failure when appendRow rejects', async (t) => {
  sandbox.stub(GoogleDocsHandler, 'appendRow').rejects(new Error('Network failure'));

  const handler = GoogleDocsHandler.create(baseConfig());
  const result = await handler({ name: 'Alice' }, baseFormConfig(), null, null);

  t.false(result.success);
});

test.serial('appendRow: appends data to Google Sheet', async (t) => {
  const { appendStub } = stubGoogleSheets();

  await GoogleDocsHandler.appendRow(baseConfig(), { name: 'Alice', email: 'alice@example.com' }, baseFormConfig());

  t.true(appendStub.calledOnce);
  const callArgs = appendStub.firstCall.args[0];
  t.is(callArgs.spreadsheetId, 'fake-spreadsheet-id');
  t.is(callArgs.range, 'Sheet1!A:Z');
  t.deepEqual(callArgs.requestBody.values[0], ['contact-form', 'Alice', 'alice@example.com']);
});

test.serial('appendRow: includes timestamp when prependTimestamp is true', async (t) => {
  const { appendStub } = stubGoogleSheets();

  const config = { ...baseConfig(), prependTimestamp: true };
  await GoogleDocsHandler.appendRow(config, { name: 'Bob', email: 'bob@example.com' }, baseFormConfig());

  t.true(appendStub.calledOnce);
  const row = appendStub.firstCall.args[0].requestBody.values[0];
  // row: [timestamp, formName, name, email]
  t.is(row.length, 4);
  t.is(row[1], 'contact-form');
  t.is(row[2], 'Bob');
});

test.serial('appendRow: throws when sheets API rejects', async (t) => {
  stubGoogleSheets({ rejectAppend: true });

  await t.throwsAsync(
    () => GoogleDocsHandler.appendRow(baseConfig(), {}, baseFormConfig()),
    { message: 'Sheets API error' },
  );
});

test('prepareRowData: returns correct row data without timestamp', (t) => {
  const result = GoogleDocsHandler.prepareRowData(
    { name: 'John Doe', email: 'john@example.com' },
    baseFormConfig(),
    { ...baseConfig(), prependTimestamp: false },
  );

  t.deepEqual(result, ['contact-form', 'John Doe', 'john@example.com']);
});

test('prepareRowData: returns correct row data with timestamp', (t) => {
  const result = GoogleDocsHandler.prepareRowData(
    { name: 'John Doe', email: 'john@example.com' },
    baseFormConfig(),
    { ...baseConfig(), prependTimestamp: true },
  );

  t.is(result.length, 4);
  t.true(typeof result[0] === 'string');
  t.is(result[1], 'contact-form');
  t.is(result[2], 'John Doe');
  t.is(result[3], 'john@example.com');
});

test('prepareRowData: handles missing form data values', (t) => {
  const result = GoogleDocsHandler.prepareRowData(
    { name: 'John Doe' },
    baseFormConfig(),
    { ...baseConfig(), prependTimestamp: false },
  );

  t.deepEqual(result, ['contact-form', 'John Doe', '']);
});

test('prepareRowData: converts all values to strings', (t) => {
  const formConfig = /** @type {any} */ ({
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
  });

  const result = GoogleDocsHandler.prepareRowData(
    { number: 123, boolean: true, nullValue: null, undefinedValue: undefined },
    formConfig,
    { ...baseConfig(), prependTimestamp: false },
  );

  t.deepEqual(result, ['test-form', '123', 'true', '', '']);
});

test('prepareRowData: handles empty form data', (t) => {
  const formConfig = /** @type {any} */ ({
    name: 'empty-form',
    route: '/empty',
    fields: [
      { name: 'field1', type: 'text', required: false },
      { name: 'field2', type: 'email', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  });

  const result = GoogleDocsHandler.prepareRowData({}, formConfig, { ...baseConfig(), prependTimestamp: false });

  t.deepEqual(result, ['empty-form', '', '']);
});

test('prepareRowData: ignores extra fields not in form config', (t) => {
  const result = GoogleDocsHandler.prepareRowData(
    { name: 'John Doe', email: 'john@example.com', extraField: 'ignored' },
    baseFormConfig(),
    { ...baseConfig(), prependTimestamp: false },
  );

  t.deepEqual(result, ['contact-form', 'John Doe', 'john@example.com']);
});

test('prepareRowData: handles complex data types', (t) => {
  const formConfig = /** @type {any} */ ({
    name: 'complex-form',
    route: '/complex',
    fields: [
      { name: 'object', type: 'text', required: false },
      { name: 'array', type: 'text', required: false },
      { name: 'date', type: 'date', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  });

  const result = GoogleDocsHandler.prepareRowData(
    { object: { key: 'value' }, array: [1, 2, 3], date: new Date('2023-01-01') },
    formConfig,
    { ...baseConfig(), prependTimestamp: false },
  );

  t.is(result[0], 'complex-form');
  t.is(result[1], '[object Object]');
  t.is(result[2], '1,2,3');
  t.true(typeof result[3] === 'string');
});

test('prepareRowData: maintains field order from form config', (t) => {
  const formConfig = /** @type {any} */ ({
    name: 'order-test',
    route: '/order',
    fields: [
      { name: 'first', type: 'text', required: false },
      { name: 'second', type: 'text', required: false },
      { name: 'third', type: 'text', required: false },
    ],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  });

  const result = GoogleDocsHandler.prepareRowData(
    { third: 'third value', first: 'first value', second: 'second value' },
    formConfig,
    { ...baseConfig(), prependTimestamp: false },
  );

  t.deepEqual(result, ['order-test', 'first value', 'second value', 'third value']);
});

test('prepareRowData: handles empty fields array', (t) => {
  const formConfig = /** @type {any} */ ({
    name: 'test-form',
    route: '/test',
    fields: [],
    successMessage: 'Success!',
    errorMessage: 'Error!',
  });

  const result = GoogleDocsHandler.prepareRowData({ name: 'Test' }, formConfig, { ...baseConfig(), prependTimestamp: false });

  t.deepEqual(result, ['test-form']);
});

test('prepareRowData: does not add timestamp when prependTimestamp is undefined', (t) => {
  const result = GoogleDocsHandler.prepareRowData(
    { name: 'Test' },
    /** @type {any} */ ({ name: 'test-form', route: '/test', fields: [{ name: 'name', type: 'text', required: false }], successMessage: 'Success!', errorMessage: 'Error!' }),
    baseConfig(),
  );

  t.is(result.length, 2);
  t.deepEqual(result, ['test-form', 'Test']);
});

test.serial('createSpreadsheet: creates a spreadsheet and returns its id', async (t) => {
  const { createStub } = stubGoogleSheets();

  const id = await GoogleDocsHandler.createSpreadsheet(baseConfig(), 'My New Sheet');

  t.is(id, 'new-id');
  t.true(createStub.calledOnce);
});

test.serial('createSpreadsheet: writes headers when headers array is provided', async (t) => {
  const { updateStub } = stubGoogleSheets();

  await GoogleDocsHandler.createSpreadsheet(baseConfig(), 'My Sheet', ['Col A', 'Col B']);

  // update should have been called to write the headers
  t.true(updateStub.calledOnce);
});

test.serial('createSpreadsheet: throws when sheets API rejects', async (t) => {
  const fakeAuth = {};
  sandbox.stub(google.auth, 'GoogleAuth').callsFake(function () { return fakeAuth; });
  sandbox.stub(google, 'sheets').returns({
    spreadsheets: {
      values: { update: sandbox.stub().resolves() },
      create: sandbox.stub().rejects(new Error('Sheets unavailable')),
    },
  });

  await t.throwsAsync(
    () => GoogleDocsHandler.createSpreadsheet(baseConfig(), 'Bad Sheet'),
    { message: /Failed to create Google Sheet/ },
  );
});

test('checkSpreadsheetExists: returns false when spreadsheetId is missing', async (t) => {
  const config = { credentialsPath: '/fake/creds.json', sheetName: 'Sheet1', spreadsheetId: '' };
  const result = await GoogleDocsHandler.checkSpreadsheetExists(/** @type {any} */ (config));
  t.false(result);
});

test.serial('checkSpreadsheetExists: returns true when spreadsheet is accessible', async (t) => {
  const { getStub } = stubGoogleSheets();

  const result = await GoogleDocsHandler.checkSpreadsheetExists(baseConfig());

  t.true(result);
  t.true(getStub.calledOnce);
});

test.serial('checkSpreadsheetExists: returns false when API throws', async (t) => {
  const fakeAuth = {};
  sandbox.stub(google.auth, 'GoogleAuth').callsFake(function () { return fakeAuth; });
  sandbox.stub(google, 'sheets').returns({
    spreadsheets: {
      get: sandbox.stub().rejects(new Error('Not found')),
    },
  });

  const result = await GoogleDocsHandler.checkSpreadsheetExists(baseConfig());

  t.false(result);
});

test.serial('listSpreadsheets: returns list of spreadsheets', async (t) => {
  const { listStub } = stubGoogleDrive();

  const result = await GoogleDocsHandler.listSpreadsheets(baseConfig());

  t.true(listStub.calledOnce);
  t.is(result.length, 2);
  t.is(result[0].name, 'My Sheet');
  t.is(result[1].id, 'sheet-2');
});

test.serial('listSpreadsheets: returns empty array when files is null', async (t) => {
  const fakeAuth = {};
  sandbox.stub(google.auth, 'GoogleAuth').callsFake(function () { return fakeAuth; });
  sandbox.stub(google, 'drive').returns({
    files: { list: sandbox.stub().resolves({ data: { files: null } }) },
  });

  const result = await GoogleDocsHandler.listSpreadsheets(baseConfig());

  t.deepEqual(result, []);
});
