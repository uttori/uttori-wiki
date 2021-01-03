// @ts-nocheck
const test = require('ava');
const express = require('express');
const defaultConfig = require('../src/config');
const wiki = require('../src/middleware');

test('wiki can run', (t) => {
  const config = {
    ...defaultConfig,
    site_sections: [
      {
        title: 'Example',
        description: 'Example description text.',
        tag: 'example',
      },
    ],
    home_page: 'home-page',
    site_url: 'https://fake.test',
    // Specify the theme to use
    theme_dir: 'test/site/themes',
    theme_name: 'default',
    public_dir: 'test/site/themes/default/public',
    use_delete_key: true,
    delete_key: 'test-key',
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
