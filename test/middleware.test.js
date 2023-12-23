import test from 'ava';

import express from 'express';
import defaultConfig from '../src/config.js';
import wiki from '../src/middleware.js';

test('wiki can run', (t) => {
  const config = {
    ...defaultConfig,
    homePage: 'home-page',
    publicUrl: 'https://fake.test',
    // Specify the theme to use
    themePath: 'test/site/theme',
    publicPath: 'test/site/public',
    useDeleteKey: true,
    deleteKey: 'test-key',
    plugins: [],
    middleware: [
      ['disable', 'x-powered-by'],
      ['enable', 'view cache'],
      ['fake', 'fake'],
    ],
  };

  t.notThrows(() => {
    const app = express();
    app.use('/', wiki(config));
  });

  t.notThrows(() => {
    const app = express();
    app.use('/', wiki({ ...config, middleware: {} }));
  });

  t.notThrows(() => {
    const app = express();
    delete config.middleware;
    app.use('/', wiki(config));
  });
});
