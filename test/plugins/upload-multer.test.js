import test from 'ava';
import sinon from 'sinon';
import request from 'supertest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import MulterUpload from '../../dist/plugins/upload-multer.js';

test('MulterUpload.register(context): can register', (t) => {
  t.notThrows(() => {
    MulterUpload.register({
      hooks: { on: () => {} },
      config: {
        [MulterUpload.configKey]: {
          directory: '/tmp/uploads',
          events: { callback: [] },
        },
      },
    });
  });
});

test('MulterUpload.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    MulterUpload.register({ hooks: {} });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('MulterUpload.register(context): errors without events', (t) => {
  t.throws(() => {
    MulterUpload.register({ hooks: { on: () => {} }, config: { [MulterUpload.configKey]: { } } });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('Plugin.register(context): does not error with events corresponding to missing methods', (t) => {
  t.notThrows(() => {
    MulterUpload.register({
      hooks: {
        on: () => {},
      },
      config: {
        [MulterUpload.configKey]: {
          directory: '/tmp/uploads',
          events: {
            test: ['test'],
            bindRoutes: ['bind-routes'],
          },
        },
      },
    });
  });
});

test('MulterUpload.defaultConfig(): can return a default config', (t) => {
  t.notThrows(MulterUpload.defaultConfig);
});

test('MulterUpload.validateConfig(config, _context): throws when configuration key is missing', (t) => {
  t.throws(() => {
    MulterUpload.validateConfig({});
  }, { message: 'Config Error: \'uttori-plugin-upload-multer\' configuration key is missing.' });
});

test('MulterUpload.validateConfig(config, _context): throws when directory is not a string', (t) => {
  t.throws(() => {
    MulterUpload.validateConfig({
      [MulterUpload.configKey]: {
        directory: 10,
      },
    });
  }, { message: 'Config Error: `directory` should be a string path to where files should be stored.' });
});

test('MulterUpload.validateConfig(config, _context): throws when route is not a string', (t) => {
  t.throws(() => {
    MulterUpload.validateConfig({
      [MulterUpload.configKey]: {
        directory: '/tmp/uploads',
        route: 10,
      },
    });
  }, { message: 'Config Error: `route` should be a string server route to where files should be POSTed to.' });
});

test('MulterUpload.validateConfig(config, _context): throws when publicRoute is not a string', (t) => {
  t.throws(() => {
    MulterUpload.validateConfig({
      [MulterUpload.configKey]: {
        directory: '/tmp/uploads',
        route: '/upload',
      },
    });
  }, { message: 'Config Error: `publicRoute` should be a string server route to where files should be GET from.' });
});

test('MulterUpload.validateConfig(config, _context): throws when middleware is not an array', (t) => {
  t.throws(() => {
    MulterUpload.validateConfig({
      [MulterUpload.configKey]: {
        directory: '/tmp/uploads',
        route: '/upload',
        publicRoute: '/uploads',
        middleware: {},
      },
    });
  }, { message: 'Config Error: `middleware` should be an array of middleware.' });
});

test('MulterUpload.validateConfig(config, _context): can validate', (t) => {
  t.notThrows(() => {
    MulterUpload.validateConfig({
      [MulterUpload.configKey]: {
        directory: '/tmp/uploads',
        route: '/upload',
        publicRoute: '/uploads',
        middleware: [],
      },
    });
  });
});

test('MulterUpload.bindRoutes(server, context): can bind routes', (t) => {
  const use = sinon.spy();
  const post = sinon.spy();
  const server = { use, post };
  MulterUpload.bindRoutes(server, {
    config: {
      [MulterUpload.configKey]: {
        directory: '/tmp/uploadz',
        route: '/up-load',
      },
    },
  });
  t.true(use.calledOnce);
  t.true(post.calledOnce);
});

test('MulterUpload.upload(context): serves the uploaded file at its public path with the correct content type', async (t) => {
  const { serverSetup } = await import('./../_helpers/server.js');
  const directory = await mkdtemp(path.join(tmpdir(), 'uttori-upload-'));
  t.teardown(() => rm(directory, { recursive: true, force: true }));
  const route = '/upload';
  const context = {
    config: {
      [MulterUpload.configKey]: {
        directory: path.relative(process.cwd(), directory),
        route,
        publicRoute: '/media/uploads/',
      },
    },
  };
  const server = serverSetup();
  MulterUpload.bindRoutes(server, context);
  const response = await request(server).post(route).attach('file', 'test/_helpers/am-i-human.png', 'PCB Front.png');
  t.is(response.status, 200);
  t.regex(response.text, /^\/media\/uploads\/PCB Front-\d+\.png$/);
  const image = await request(server).get(encodeURI(response.text));
  t.is(image.status, 200);
  t.is(image.type, 'image/png');
  t.is(image.headers['x-content-type-options'], 'nosniff');
  t.is(image.headers['content-security-policy'], undefined);

  const document = await request(server).post(route).attach('file', Buffer.from('<p>Uploaded document</p>'), 'document.html');
  t.is(document.status, 200);
  const html = await request(server).get(document.text);
  t.is(html.status, 200);
  t.is(html.type, 'text/html');
  t.is(html.headers['content-security-policy'], 'sandbox');
});

test('MulterUpload.upload(context): ignores nested paths and preserves extensionless filenames', async (t) => {
  t.plan(2);
  const { serverSetup } = await import('./../_helpers/server.js');
  const route = '/upload';
  const context = {
    config: {
      [MulterUpload.configKey]: {
        directory: '/tmp/uploads',
        route,
      },
    },
  };
  const server = serverSetup();
  MulterUpload.bindRoutes(server, context);
  const response = await request(server).post(route).field('fullPath', '/fake dir/nested/am-i-human').attach('file', 'test/_helpers/am-i-human.png', 'am-i-human');
  t.is(response.status, 200);
  t.regex(response.text, /^\/uploads\/am-i-human-\d+$/);
});

test('MulterUpload.upload(context): rejects disallowed mime types', async (t) => {
  t.plan(2);
  const { serverSetup } = await import('./../_helpers/server.js');
  const route = '/upload';
  const context = {
    config: {
      [MulterUpload.configKey]: {
        directory: '/tmp/uploads',
        route,
        allowedMimeTypes: ['text/plain'],
      },
    },
  };
  const server = serverSetup();
  MulterUpload.bindRoutes(server, context);
  const response = await request(server).post(route).attach('file', 'test/_helpers/am-i-human.png');
  t.is(response.status, 422);
  t.true(response.text.includes('not allowed'));
});
