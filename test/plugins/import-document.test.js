/* eslint-disable n/no-unsupported-features/node-builtins */
import test from 'ava';
import sinon from 'sinon';
import fs from 'fs';
import express from 'express';
import request from 'supertest';
import child_process from 'node:child_process';

import ImportDocument from '../../src/plugins/import-document.js';

let sandbox;
test.beforeEach(() => {
    sandbox = sinon.createSandbox();
});

test.afterEach(() => {
  sandbox.restore();
});

test('configKey: should return the correct configuration key', (t) => {
  t.is(ImportDocument.configKey, 'uttori-plugin-import-document');
});

test('defaultConfig: should return the default configuration', (t) => {
  const defaultConfig = ImportDocument.defaultConfig();
  t.is(typeof defaultConfig.apiRoute, 'string');
  t.is(typeof defaultConfig.publicRoute, 'string');
  t.is(typeof defaultConfig.uploadPath, 'string');
  t.is(typeof defaultConfig.uploadDirectory, 'string');
  t.true(Array.isArray(defaultConfig.allowedReferrers));
  t.true(Array.isArray(defaultConfig.middlewareApi));
  t.true(Array.isArray(defaultConfig.middlewarePublic));
  t.is(typeof defaultConfig.downloadFile, 'function');
  t.is(typeof defaultConfig.processPage, 'function');
  t.is(typeof defaultConfig.apiRequestHandler, 'function');
  t.is(typeof defaultConfig.interfaceRequestHandler, 'function');
});

test('validateConfig: should throw an error if the configuration key is missing', (t) => {
  t.throws(() => ImportDocument.validateConfig(), {
    message: `Config Error: '${ImportDocument.configKey}' configuration key is missing.`
  });
  t.throws(() => ImportDocument.validateConfig({}), {
    message: `Config Error: '${ImportDocument.configKey}' configuration key is missing.`
  });
});

test('validateConfig: should throw an error if allowedReferrers is not an array', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: 'not an array',
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `allowedReferrers` should be an array of URLs or an empty array.'
  });
});

test('validateConfig: should throw an error if uploadPath is not a string', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 123,
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `uploadPath` should be a string path to reference uploaded files by.'
  });
});

test('validateConfig: should throw an error if uploadPath is empty', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: '',
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `uploadPath` should be a string path to reference uploaded files by.'
  });
});

test('validateConfig: should throw an error if uploadDirectory is not a string', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 'uploads',
      uploadDirectory: 123,
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `uploadDirectory` should be a string path to a directory to upload files to.'
  });
});

test('validateConfig: should throw an error if uploadDirectory is empty', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 'uploads',
      uploadDirectory: '',
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `uploadDirectory` should be a string path to a directory to upload files to.'
  });
});

test('validateConfig: should throw an error if apiRequestHandler is not a function', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 'uploads',
      uploadDirectory: '/tmp',
      apiRequestHandler: 'not a function',
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `apiRequestHandler` should be a function to handle the API route.'
  });
});

test('validateConfig: should throw an error if interfaceRequestHandler is not a function', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 'uploads',
      uploadDirectory: '/tmp',
      apiRequestHandler: () => {},
      interfaceRequestHandler: 'not a function',
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `interfaceRequestHandler` should be a function to handle the interface route.'
  });
});

test('validateConfig: should throw an error if downloadFile is not a function', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 'uploads',
      uploadDirectory: '/tmp',
      apiRequestHandler: () => {},
      interfaceRequestHandler: () => {},
      downloadFile: 'not a function',
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `downloadFile` should be a function to handle the download.'
  });
});

test('validateConfig: should throw an error if middlewareApi is not an array', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 'uploads',
      uploadDirectory: '/tmp',
      apiRequestHandler: () => {},
      interfaceRequestHandler: () => {},
      downloadFile: () => {},
      middlewareApi: 'not an array',
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `middlewareApi` should be an array of middleware.'
  });
});

test('validateConfig: should throw an error if middlewarePublic is not an array', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 'uploads',
      uploadDirectory: '/tmp',
      apiRequestHandler: () => {},
      interfaceRequestHandler: () => {},
      downloadFile: () => {},
      middlewareApi: [],
      middlewarePublic: 'not an array',
    },
  };
  t.throws(() => ImportDocument.validateConfig(config), {
    message: 'Config Error: `middlewarePublic` should be an array of middleware.'
  });
});

test('validateConfig: should validate a valid config', (t) => {
  const config = {
    [ImportDocument.configKey]: {
      allowedReferrers: [],
      uploadPath: 'uploads',
      uploadDirectory: '/tmp',
      apiRequestHandler: () => {},
      interfaceRequestHandler: () => {},
      downloadFile: () => {},
      middlewareApi: [],
      middlewarePublic: [],
    },
  };
  t.notThrows(() => ImportDocument.validateConfig(config));
});

test('register: should throw an error if context is missing', (t) => {
  t.throws(() => ImportDocument.register(), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.'
  });
});

test('register: should throw an error if hooks.on is missing', (t) => {
  t.throws(() => ImportDocument.register({ hooks: {} }), {
    message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.'
  });
});

test('register: should throw an error if events are missing in config', (t) => {
  const context = {
    hooks: {
      on: () => {},
    },
    config: {
      [ImportDocument.configKey]: ImportDocument.defaultConfig(),
    },
  };
  t.throws(() => ImportDocument.register(context), {
    message: 'Missing events to listen to for in \'config.events\'.'
  });
});

test('register: should register events if they are present in config', (t) => {
  const on = sandbox.spy();
  const context = {
    hooks: {
      on,
    },
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        events: {
          bindRoutes: ['bind-routes'],
          validateConfig: ['validate-config'],
          missing: ['bind-routes'],
        },
      },
    },
  };
  ImportDocument.register(context);
  t.true(context.hooks.on.calledWith('bind-routes', ImportDocument.bindRoutes));
  t.true(context.hooks.on.calledWith('validate-config', ImportDocument.validateConfig));
});

test('bindRoutes: should bind routes to the server', (t) => {
  const post = sandbox.spy();
  const get = sandbox.spy();
  const server = { post, get };
  const context = {
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        apiRoute: '/import-api',
        publicRoute: '/import',
        middlewareApi: [],
        middlewarePublic: [],
        apiRequestHandler: () => {},
        interfaceRequestHandler: () => {},
      },
    },
  };
  ImportDocument.bindRoutes(server, context);
  t.true(post.calledOnce);
  t.true(get.calledOnce);
});

test('bindRoutes: should throw an error if interfaceRequestHandler is missing', (t) => {
  const server = { post: () => {}, get: () => {} };
  const context = {
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        interfaceRequestHandler: null,
      },
    },
  };
  t.throws(() => ImportDocument.bindRoutes(server, context), {
    message: 'Config Error: `interfaceRequestHandler` is missing.'
  });
});

test('apiRequestHandler: should return a middleware function', (t) => {
  const context = {
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        allowedReferrers: [],
        uploadDirectory: '/tmp',
        downloadFile: () => {},
        processPage: () => {},
      },
    },
    hooks: {
      filter: () => {},
      fetch: () => {},
      dispatch: () => {},
    },
  };
  const middleware = ImportDocument.apiRequestHandler(context);
  t.is(typeof middleware, 'function');
});

test('apiRequestHandler: should handle requests with empty referrer when allowedReferrers is empty', async (t) => {
  const server = express();
  const context = {
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        allowedReferrers: [],
        uploadDirectory: '/tmp',
        downloadFile: () => {},
        processPage: () => {},
      },
    },
    hooks: {
      filter: () => {},
      fetch: () => {},
      dispatch: () => {},
    },
  };
  server.post('/import-api', ImportDocument.apiRequestHandler(context));

  const response = await request(server)
    .post('/import-api')
    .send({
      title: 'Test Document',
      slug: 'test-document',
      pages: [],
    });

  t.is(response.status, 400);
  t.is(response.body.error, 'Title and slug are required.');
});

test('apiRequestHandler: should handle requests with valid referrer', async (t) => {
  const server = express();
  const context = {
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        allowedReferrers: ['https://example.com'],
        uploadDirectory: '/tmp',
        downloadFile: () => {},
        processPage: () => {},
      },
    },
    hooks: {
      filter: () => {},
      fetch: () => {},
      dispatch: () => {},
    },
  };
  server.post('/import-api', ImportDocument.apiRequestHandler(context));

  const response = await request(server)
    .post('/import-api')
    .set('Referrer', 'https://example.com/page')
    .send({
      title: 'Test Document',
      slug: 'test-document',
      pages: [],
    });

  t.is(response.status, 400);
  t.is(response.body.error, 'Title and slug are required.');
});

test('apiRequestHandler: should reject requests with missing title or slug', async (t) => {
  const server = express();
  const context = {
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        allowedReferrers: [],
        uploadDirectory: '/tmp',
        downloadFile: () => {},
        processPage: () => {},
      },
    },
    hooks: {
      filter: () => {},
      fetch: () => {},
      dispatch: () => {},
    },
  };
  server.post('/import-api', ImportDocument.apiRequestHandler(context));

  const response = await request(server)
    .post('/import-api')
    .send({
      pages: [],
    });

  t.is(response.status, 400);
  t.is(response.body.error, 'Title and slug are required.');
});

test('apiRequestHandler: should reject requests with invalid referrer', async (t) => {
  const _server = express();
  /** @type {import('express').NextFunction} */
  const next = sandbox.spy();
  const context = {
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        allowedReferrers: ['https://example.com'],
        uploadDirectory: '/tmp',
        downloadFile: () => {},
        processPage: () => {},
      },
    },
    hooks: {
      filter: () => {},
      fetch: () => {},
      dispatch: () => {},
    },
  };

  const middleware = ImportDocument.apiRequestHandler(context);
  const req = {
    get: () => 'https://malicious.com',
    body: {
      title: 'Test Document',
      slug: 'test-document',
      pages: [],
    },
  };
  const res = {};

  await middleware(req, res, next);
  t.true(next.calledOnce);
});

test('apiRequestHandler: should reject requests with empty referrer when allowedReferrers is set', async (t) => {
  /** @type {import('express').NextFunction} */
  const next = sandbox.spy();
  const context = {
    config: {
      [ImportDocument.configKey]: {
        ...ImportDocument.defaultConfig(),
        allowedReferrers: ['https://example.com'],
        uploadDirectory: '/tmp',
        downloadFile: () => {},
        processPage: () => {},
      },
    },
    hooks: {
      filter: () => {},
      fetch: () => {},
      dispatch: () => {},
    },
  };

  const middleware = ImportDocument.apiRequestHandler(context);
  const req = {
    get: () => '',
    body: {
      title: 'Test Document',
      slug: 'test-document',
      pages: [],
    },
  };
  const res = {};

  await middleware(req, res, next);
  t.true(next.calledOnce);
});

// TODO: apiRequestHandler: should fully handle the request

test('interfaceRequestHandler: should return a middleware function', (t) => {
  const context = {
    config: {
      [ImportDocument.configKey]: ImportDocument.defaultConfig(),
    },
    hooks: {
      filter: () => {},
    },
  };
  const middleware = ImportDocument.interfaceRequestHandler(context);
  t.is(typeof middleware, 'function');
});

test('interfaceRequestHandler: should handle requests and render view', async (t) => {
  const server = express();
  const context = {
    config: {
      [ImportDocument.configKey]: ImportDocument.defaultConfig(),
    },
    hooks: {
      filter: sandbox.stub().resolvesArg(0),
    },
  };

  // Mock response.render
  const render = sandbox.spy();
  const set = sandbox.spy();

  server.get('/import', ImportDocument.interfaceRequestHandler(context));

  const middleware = ImportDocument.interfaceRequestHandler(context);
  const req = {
    session: {},
    baseUrl: '/',
    wikiFlash: () => ({}),
  };
  const res = {
    set,
    render,
  };

  await middleware(req, res);

  t.true(set.calledWith('X-Robots-Tag', 'noindex'));
  t.true(render.calledWith('import'));
  t.true(context.hooks.filter.calledWith('view-model-import-document'));
});

test.serial('downloadFile: should download a file from URL', async (t) => {
  // Create a proper mock ReadableStream
  const mockReadableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1, 2, 3]));
      controller.close();
    }
  });

  const mockFetch = sandbox.stub().resolves({
    ok: true,
    body: mockReadableStream,
  });

  // Mock global fetch
  global.fetch = mockFetch;

  const mockMkdir = sandbox.stub(fs.promises, 'mkdir').resolves();
  const mockCreateWriteStream = sandbox.stub().returns({
    on: sandbox.stub().callsArg(1), // Call the 'finish' callback immediately
  });

  // Mock fs.createWriteStream by stubbing the imported function
  const originalCreateWriteStream = fs.createWriteStream;
  fs.createWriteStream = mockCreateWriteStream;

  const options = {
    url: 'https://example.com/test.txt',
    fileName: '/tmp/test.txt',
    type: 'text',
  };

  await ImportDocument.downloadFile(options);

  t.true(mockFetch.calledWith('https://example.com/test.txt'));
  t.true(mockMkdir.calledWith('/tmp', { recursive: true }));

  // Restore
  mockMkdir.restore();
  fs.createWriteStream = originalCreateWriteStream;
  delete global.fetch;
});

test('downloadFile: should throw error on failed download', async (t) => {
  const mockFetch = sandbox.stub().rejects(new Error('Network error'));
  global.fetch = mockFetch;

  const options = {
    url: 'https://example.com/test.txt',
    fileName: '/tmp/test.txt',
    type: 'text',
  };

  await t.throwsAsync(() => ImportDocument.downloadFile(options), {
    message: 'Failed to download file from https://example.com/test.txt: Network error',
  });

  delete global.fetch;
});

test('processPage: should process text type pages', async (t) => {
  const mockDownloadFile = sandbox.stub().resolves();
  const mockReadFile = sandbox.stub().resolves('Test markdown content');
  const mockMkdir = sandbox.stub(fs.promises, 'mkdir').resolves();
  const mockReadFileStub = sandbox.stub(fs.promises, 'readFile').callsFake(mockReadFile);

  const config = {
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: mockDownloadFile,
  };

  const slug = 'test-document';
  const page = {
    url: 'https://example.com/test.md',
    name: 'test.md',
    type: 'text',
  };

  const result = await ImportDocument.processPage(config, slug, page);

  t.is(result.content, 'Test markdown content\n\n---\n\n');
  t.deepEqual(result.attachments, []);
  t.true(mockDownloadFile.calledWith({
    url: 'https://example.com/test.md',
    fileName: '/tmp/test-document/test.md',
    type: 'text',
  }));

  mockMkdir.restore();
  mockReadFileStub.restore();
});

test.serial('processPage: should process binary type pages', async (t) => {
  const mockDownloadFile = sandbox.stub().resolves();
  const mockMkdir = sandbox.stub(fs.promises, 'mkdir').resolves();

  const config = {
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: mockDownloadFile,
  };

  const slug = 'test-document';
  const page = {
    url: 'https://example.com/test.pdf',
    name: 'test.pdf',
    type: 'binary',
  };

  const result = await ImportDocument.processPage(config, slug, page);

  t.is(result.content,`This document contains 1 file(s) as attachments.

## Attachments

- [test.pdf](uploads/test-document/test.pdf)

*This article was automatically generated for PDF files.*`);
  t.deepEqual(result.attachments, [{
    name: 'test.pdf',
    path: 'uploads/test-document/test.pdf',
    type: 'application/pdf',
  }]);
  t.true(mockDownloadFile.calledWith({
    url: 'https://example.com/test.pdf',
    fileName: '/tmp/test-document/test.pdf',
    type: 'binary',
  }));

  mockMkdir.restore();
});

test.serial('processPage: should process binary type pages with image extensions', async (t) => {
  const mockDownloadFile = sandbox.stub().resolves();
  const mockMkdir = sandbox.stub(fs.promises, 'mkdir').resolves();

  const config = {
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: mockDownloadFile,
  };

  const slug = 'test-document';
  const page = {
    url: 'https://example.com/test.jpg',
    name: 'test.jpg',
    type: 'binary',
  };

  const result = await ImportDocument.processPage(config, slug, page);

  t.is(result.content, '');
  t.deepEqual(result.attachments, [{
    name: 'test.jpg',
    path: 'uploads/test-document/test.jpg',
    type: 'jpg',
  }]);

  mockMkdir.restore();
});

test.serial('processPage: should create stub article for PDF files when no content', async (t) => {
  const mockDownloadFile = sandbox.stub().resolves();
  const mockMkdir = sandbox.stub(fs.promises, 'mkdir').resolves();

  const config = {
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: mockDownloadFile,
  };

  const slug = 'test-document';
  const page = {
    url: 'https://example.com/test.pdf',
    name: 'test.pdf',
    type: 'binary',
  };

  const result = await ImportDocument.processPage(config, slug, page);

  t.true(result.content.includes('This document contains 1 file(s) as attachments.'));
  t.true(result.content.includes('## Attachments'));
  t.true(result.content.includes('- [test.pdf](uploads/test-document/test.pdf)'));
  t.true(result.content.includes('*This article was automatically generated for PDF files.*'));

  mockMkdir.restore();
});

test.serial('processPage: should handle scrape type pages', async (t) => {
  const mockMkdir = sandbox.stub(fs.promises, 'mkdir').resolves();
  const mockReaddir = sandbox.stub(fs.promises, 'readdir').resolves(['index.html']);
  const mockReadFile = sandbox.stub(fs.promises, 'readFile').resolves('Converted markdown content');
  const mockCmd = sandbox.stub(child_process, 'exec').returns('TEST');

  const config = {
    uploadDirectory: '/tmp',
    uploadPath: 'uploads',
    downloadFile: () => {},
  };

  const slug = 'test-document';
  const page = {
    url: 'https://example.com',
    name: 'index.html',
    type: 'scrape',
  };

  const result = await ImportDocument.processPage(config, slug, page);

  t.true(result.content.includes('Converted markdown content'));
  t.true(mockCmd.called);
  t.true(mockReaddir.called);

  // Restore
  mockCmd.restore();
  mockMkdir.restore();
  mockReaddir.restore();
  mockReadFile.restore();
});
