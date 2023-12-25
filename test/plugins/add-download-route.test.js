import test from 'ava';
import sinon from 'sinon';
import fs from 'fs';
import express from 'express';
import request from 'supertest';

import DownloadRouter from '../../src/plugins/add-download-route.js';

test('configKey: should return the correct configuration key', (t) => {
  t.is(DownloadRouter.configKey, 'uttori-plugin-download-router');
});

test('defaultConfig: should return the default configuration', (t) => {
  t.deepEqual(DownloadRouter.defaultConfig(), {
    basePath: '/',
    publicRoute: '/download',
    allowedReferrers: [],
    middleware: [],
  });
});

test('validateConfig: should throw an error if the configuration key is missing', (t) => {
  t.throws(() => DownloadRouter.validateConfig(), { message: `Config Error: '${DownloadRouter.configKey}' configuration key is missing.` });
  t.throws(() => DownloadRouter.validateConfig({}), { message: `Config Error: '${DownloadRouter.configKey}' configuration key is missing.` });
});

test('validateConfig: should throw an error if basePath is not a string', (t) => {
  const config = {
    [DownloadRouter.configKey]: {
      basePath: 123,
    },
  };
  t.throws(() => DownloadRouter.validateConfig(config), { message: 'Config Error: `basePath` should be a string path to where files will be stored.' });
});

test('validateConfig: should throw an error if basePath does not exist', (t) => {
  const config = {
    [DownloadRouter.configKey]: {
      basePath: '/nonexistent',
    },
  };
  sinon.stub(fs, 'existsSync').returns(false);
  t.throws(() => DownloadRouter.validateConfig(config), { message: 'Config Error: `basePath` should exist and be reachable.' });
  fs.existsSync.restore();
});

test('validateConfig: should throw an error if publicRoute is not a string', (t) => {
  const config = {
    [DownloadRouter.configKey]: {
      basePath: '/',
      publicRoute: 123,
    },
  };
  t.throws(() => DownloadRouter.validateConfig(config), { message: 'Config Error: `publicRoute` should be a string server route to where files should be GET from.' });
});

test('validateConfig: should throw an error if allowedReferrers is not an array', (t) => {
  const config = {
    [DownloadRouter.configKey]: {
      basePath: '/',
      publicRoute: '/download',
      allowedReferrers: 'not an array',
    },
  };
  t.throws(() => DownloadRouter.validateConfig(config), { message: 'Config Error: `allowedReferrers` should be an array of URLs or a blank array.' });
});

test('validateConfig: should throw an error if middleware is not an array', (t) => {
  const config = {
    [DownloadRouter.configKey]: {
      basePath: '/',
      publicRoute: '/download',
      allowedReferrers: [],
      middleware: 'not an array',
    },
  };
  t.throws(() => DownloadRouter.validateConfig(config), { message: 'Config Error: `middleware` should be an array of middleware.' });
});

test('validateConfig: should validate a valid config', (t) => {
  const config = {
    [DownloadRouter.configKey]: {
      basePath: '/',
      publicRoute: '/download',
      allowedReferrers: [],
      middleware: [],
    },
  };
  t.notThrows(() => DownloadRouter.validateConfig(config));
});

test('register: should throw an error if context is missing', (t) => {
  t.throws(() => DownloadRouter.register(), {message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('register: should throw an error if events are missing in config', (t) => {
  const context = {
    hooks: {
      on: () => {},
    },
    config: {
      [DownloadRouter.configKey]: DownloadRouter.defaultConfig(),
    },
  };
  t.throws(() => DownloadRouter.register(context), { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('register: should register events if they are present in config', (t) => {
  const on = sinon.spy()
  const context = {
    hooks: {
      on,
    },
    config: {
      [DownloadRouter.configKey]: {
        ...DownloadRouter.defaultConfig(),
        events: {
          bindRoutes: ['bind-routes'],
          missing: ['bind-routes'],
        },
      },
    },
  };
  DownloadRouter.register(context);
  t.true(context.hooks.on.calledWith('bind-routes', DownloadRouter.bindRoutes));
});

test('bindRoutes: should bind routes to the server', (t) => {
  const server = express();
  const context = {
    config: {
      [DownloadRouter.configKey]: {
        basePath: '/',
        publicRoute: '/download',
        allowedReferrers: [],
        middleware: [],
      },
    },
  };
  DownloadRouter.bindRoutes(server, context);
  t.pass(); // If bindRoutes does not throw an error, it is assumed to be successful
});

test('download: should return a middleware function', (t) => {
  const context = {
    config: {
      [DownloadRouter.configKey]: {
        basePath: '/',
        publicRoute: '/download',
        allowedReferrers: [],
        middleware: [],
      },
    },
  };
  const middleware = DownloadRouter.download(context);
  t.is(typeof middleware, 'function');
});

test('download: should handle file download requests', async (t) => {
  const server = express();
  const context = {
    config: {
      [DownloadRouter.configKey]: {
        basePath: './',
        publicRoute: '/download',
        allowedReferrers: ['good.good'],
        middleware: [],
      },
    },
  };
  DownloadRouter.bindRoutes(server, context);

  let response = await request(server).get('/download/test/some-file-that-does-not-exist.txt');
  t.is(response.status, 404);

  // Directrory traversal
  response = await request(server).get('/download/../some-file-that-does-not-exist.txt');
  t.is(response.status, 404);

  // Empty Referrer
  response = await request(server).get('/download/test/plugins/add-download-route.test.js').set('Referrer', '');
  t.is(response.status, 404);

  // Blocked Referrer
  response = await request(server).get('/download/test/plugins/add-download-route.test.js').set('Referrer', 'fake.fake');
  t.is(response.status, 404);

  // Valid
  response = await request(server).get('/download/test/plugins/add-download-route.test.js').set('Referrer', 'good.good');
  t.is(response.status, 200);
});
