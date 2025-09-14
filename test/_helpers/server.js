import express from 'express';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import ejs from 'ejs';
import layouts from 'express-ejs-layouts';
import path from 'node:path';
import cors from 'cors';

const MemoryStore = createMemoryStore(session);

import { Plugin as StorageProviderJSON } from '@uttori/storage-provider-json-memory';
import { Plugin as SearchProviderLunr } from '@uttori/search-provider-lunr';
import defaultConfig from '../../src/config.js';
import { middleware as flash } from '../../src/wiki-flash.js';

/** @type {import('../../src/config.js').UttoriWikiConfig} */
export const config = {
  ...defaultConfig,
  homePage: 'home-page',
  publicUrl: 'https://fake.test',
  // Specify the theme to use
  themePath: 'test/site/theme',
  publicPath: 'test/site/public',
  useDeleteKey: true,
  deleteKey: 'test-key',
  useEditKey: true,
  editKey: 'test-key',
  allowedDocumentKeys: ['author'],
  plugins: [
    StorageProviderJSON,
    SearchProviderLunr,
  ],
  middleware: [
    ['disable', 'x-powered-by'],
    ['enable', 'view cache'],
  ],
  useCache: true,
  redirects: [
    {
      route: '/2008/:slug',
      target: '/:slug',
    },
    // Invalid redirect for testing
    {
      route: '/2009/:slug',
    },
  ],
};

export const serverSetup = () => {
  // Server & process.title (for stopping after)
  const server = express();
  server.set('port', process.env.PORT || 8123);
  server.set('ip', process.env.IP || '127.0.0.1');

  // Setup sessions.
  server.use(session({
    secret: 'auth-simple',
    name: 'session',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60000,
      sameSite: true,
      secure: true,
    },
    store: new MemoryStore({
      checkPeriod: 3600000, // prune expired entries every hour
    }),
  }));

  server.set('views', path.join(config.themePath, 'templates'));
  server.use(layouts);
  server.set('layout extractScripts', true);
  server.set('layout extractStyles', true);
  server.set('view engine', 'html');
  // server.enable('view cache');
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  server.engine('html', ejs.renderFile);

  // Setup Express
  server.use(express.static(config.publicPath));
  server.use(express.json({ limit: '5mb' }));
  server.use(express.text({ limit: '5mb' }));
  server.use(express.urlencoded({ limit: '5mb', extended: true }));
  server.use(cors({
    origin: ['*'],
    methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  }));

  // Setup wikiFlash
  server.use(flash);

  // process.title (for stopping after)
  if (process.argv[2] && process.argv[2] !== 'undefined') {
    console.log('Setting process.title:', typeof process.argv[2], process.argv[2]);
    process.title = process.argv[2];
  }

  // https://github.com/nodejs/node/issues/49440
  // Is this a require()?
  // if (require.main === module) {
  // In the future use `if (import.meta.main) {`
  // Or alternatively the below:
  // import url from 'url';
  // if (url.fileURLToPath(import.meta.url) === process.argv[1]) {
  // if (import.meta.main) {
  if (import.meta.url === (`file:///${process.argv[1].replace(/\\/g, '/')}`).replace(/\/{3,}/, '///')) {
    // No, this is a CLI tool.
    console.log('Starting test server...');
    server.listen(Number(server.get('port')), String(server.get('ip')));
  }

  return server;
};

const next = () => {};
// Seed some example documents as requests to be saved
export const seed = async (uttori) => {
  const response = { set: () => {}, render: () => {}, redirect: () => {} };
  const demoTitle = {
    title: 'Demo Title Beta',
    slug: 'demo-title',
    content: '## Demo Title Beta',
    updateDate: 1459310452002,
    createDate: 1459310452002,
    tags: ['Demo Tag', 'Cool'],
  };
  await uttori.saveValid({ params: {}, body: demoTitle }, response, next);

  const demoTitleHistory = {
    title: 'Demo Title',
    slug: 'demo-title',
    content: '## Demo Title',
    updateDate: 1500000000000,
    createDate: 1500000000000,
    tags: ['Demo Tag', 'Cool'],
    redirects: [],
  };
  await uttori.saveValid({ params: {}, body: demoTitleHistory }, response, next);

  const exampleTitle = {
    title: 'Example Title',
    slug: 'example-title',
    content: '## Example Title',
    updateDate: 1459310452001,
    createDate: 1459310452001,
    tags: ['Example Tag', 'example'],
    redirects: ['example-titlez'],
  };
  await uttori.saveValid({ params: {}, body: exampleTitle }, response, next);

  const fakeTitle = {
    title: 'Fake Title',
    slug: 'fake-title',
    content: '## Fake Title',
    updateDate: 1459310452000,
    createDate: 1459310452000,
    tags: ['Fake Tag', 'Cool'],
    redirects: [],
  };
  await uttori.saveValid({ params: {}, body: fakeTitle }, response, next);

  const homePage = {
    content: '## Home Page',
    createDate: undefined,
    slug: 'home-page',
    title: 'Home Page',
    updateDate: 1512921841841,
  };
  await uttori.saveValid({ params: {}, body: homePage }, response, next);
};

export default { config, serverSetup, seed };
