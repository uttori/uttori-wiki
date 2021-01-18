const express = require('express');
const ejs = require('ejs');
const layouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');

const { Plugin: StorageProviderJSON } = require('@uttori/storage-provider-json-memory');
const { Plugin: SearchProviderLunr } = require('@uttori/search-provider-lunr');
const defaultConfig = require('../../src/config');

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
  theme_dir: 'test/site/theme',
  public_dir: 'test/site/theme/public',
  use_delete_key: true,
  delete_key: 'test-key',
  use_edit_key: true,
  edit_key: 'test-key',
  allowedDocumentKeys: ['author'],
  plugins: [
    StorageProviderJSON,
    SearchProviderLunr,
  ],
  middleware: [
    ['disable', 'x-powered-by'],
    ['enable', 'view cache'],
  ],
};

const serverSetup = () => {
  // Server & process.title (for stopping after)
  const server = express();
  server.set('port', process.env.PORT || 8123);
  server.set('ip', process.env.IP || '127.0.0.1');

  server.set('views', path.join(config.theme_dir, 'templates'));
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
    // eslint-disable-next-line no-console
    console.log('Setting process.title:', typeof process.argv[2], process.argv[2]);
    // eslint-disable-next-line prefer-destructuring
    process.title = process.argv[2];
  }

  // Is this a require()?
  // In the future use `if (import.meta.main) {`
  // Or alternatively the below:
  // import url from 'url';
  // if (url.fileURLToPath(import.meta.url) === process.argv[1]) {
  if (require.main === module) {
    // No, this is a CLI tool.
    // eslint-disable-next-line no-console
    console.log('Starting test server...');
    server.listen(server.get('port'), server.get('ip'));
  }

  return server;
};

const next = function next() {};
// Seed some example documents as requests to be saved
const seed = async (uttori) => {
  const response = { set: () => {}, render: () => {}, redirect: () => {} };
  const demoTitle = {
    title: 'Demo Title Beta',
    slug: 'demo-title',
    content: '## Demo Title Beta',
    updateDate: 1459310452002,
    createDate: 1459310452002,
    tags: 'Demo Tag,Cool',
  };
  // await uttori.hooks.dispatch('storage-add', demoTitle, uttori);
  // await uttori.hooks.dispatch('search-add', [demoTitle], uttori);
  await uttori.saveValid({ params: {}, body: demoTitle }, response, next);

  const demoTitleHistory = {
    title: 'Demo Title',
    slug: 'demo-title',
    content: '## Demo Title',
    updateDate: 1500000000000,
    createDate: 1500000000000,
    tags: 'Demo Tag,Cool',
  };
  // await uttori.hooks.dispatch('storage-update', { document: demoTitleHistory, originalSlug: 'demo-title' }, uttori);
  // await uttori.hooks.dispatch('search-update', [{ document: demoTitleHistory, originalSlug: 'demo-title' }], uttori);
  await uttori.saveValid({ params: {}, body: demoTitleHistory }, response, next);

  const exampleTitle = {
    title: 'Example Title',
    slug: 'example-title',
    content: '## Example Title',
    updateDate: 1459310452001,
    createDate: 1459310452001,
    tags: 'Example Tag,example',
  };
  // await uttori.hooks.dispatch('storage-add', exampleTitle, uttori);
  // await uttori.hooks.dispatch('search-add', [exampleTitle], uttori);
  await uttori.saveValid({ params: {}, body: exampleTitle }, response, next);

  const fakeTitle = {
    title: 'Fake Title',
    slug: 'fake-title',
    content: '## Fake Title',
    updateDate: 1459310452000,
    createDate: 1459310452000,
    tags: 'Fake Tag,Cool',
  };
  // await uttori.hooks.dispatch('storage-add', fakeTitle, uttori);
  // await uttori.hooks.dispatch('search-add', [fakeTitle], uttori);
  await uttori.saveValid({ params: {}, body: fakeTitle }, response, next);

  const homePage = {
    content: '## Home Page',
    createDate: undefined,
    slug: 'home-page',
    title: 'Home Page',
    updateDate: 1512921841841,
  };
  // await uttori.hooks.dispatch('storage-add', homePage, uttori);
  // await uttori.hooks.dispatch('search-add', [homePage], uttori);
  await uttori.saveValid({ params: {}, body: homePage }, response, next);
};

module.exports = { config, serverSetup, seed };
