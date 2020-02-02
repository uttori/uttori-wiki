/* eslint-disable no-console */
// Server
const express = require('express');
const ejs = require('ejs');
const layouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');

const StorageProvider = require('uttori-storage-provider-json-memory');
const SearchProvider = require('./../__stubs/SearchProvider.js');
const defaultConfig = require('../../src/config.default.js');

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

  // Providers
  StorageProvider,
  storageProviderConfig: {},
  SearchProvider,
  searchProviderConfig: {},
};

const serverSetup = () => {
  // Server & process.title (for stopping after)
  const server = express();
  server.set('port', process.env.PORT || 8123);
  server.set('ip', process.env.IP || '127.0.0.1');

  server.set('views', path.join(config.theme_dir, config.theme_name, 'templates'));
  server.use(layouts);
  server.set('layout extractScripts', true);
  server.set('layout extractStyles', true);
  server.set('view engine', 'html');
  // server.enable('view cache');
  server.engine('html', ejs.renderFile);

  // Setup Express
  server.use(express.static(config.public_dir));
  server.use(bodyParser.json({ limit: '50mb' }));
  server.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

  if (process.argv[2] && process.argv[2] !== 'undefined') {
    console.log('Setting process.title:', typeof process.argv[2], process.argv[2]);
    // eslint-disable-next-line prefer-destructuring
    process.title = process.argv[2];
  }

  // Is this a require()?
  if (require.main === module) {
    console.log('Starting test server...');
    server.listen(server.get('port'), server.get('ip'));
  }

  return server;
};

const seed = (storageProvider) => {
  const demoTitle = {
    title: 'Demo Title Beta',
    slug: 'demo-title',
    content: '## Demo Title Beta',
    html: '',
    updateDate: 1459310452002,
    createDate: 1459310452002,
    tags: ['Demo Tag', 'Cool'],
  };
  storageProvider.add(demoTitle);

  const demoTitleHistory = {
    title: 'Demo Title',
    slug: 'demo-title',
    content: '## Demo Title',
    html: '',
    updateDate: 1500000000000,
    createDate: 1500000000000,
    tags: ['Demo Tag', 'Cool'],
  };
  storageProvider.update(demoTitleHistory, 'demo-title');

  const exampleTitle = {
    title: 'Example Title',
    slug: 'example-title',
    content: '## Example Title',
    html: '',
    updateDate: 1459310452001,
    createDate: 1459310452001,
    tags: ['Example Tag', 'example'],
  };
  storageProvider.add(exampleTitle);

  const fakeTitle = {
    title: 'Fake Title',
    slug: 'fake-title',
    content: '## Fake Title',
    html: '',
    updateDate: 1459310452000,
    createDate: 1459310452000,
    tags: ['Fake Tag', 'Cool'],
  };
  storageProvider.add(fakeTitle);

  const homePage = {
    content: '## Home Page',
    createDate: null,
    html: '',
    slug: 'home-page',
    tags: [],
    title: 'Home Page',
    updateDate: 1512921841841,
  };
  storageProvider.add(homePage);
};

module.exports = { config, serverSetup, seed };
