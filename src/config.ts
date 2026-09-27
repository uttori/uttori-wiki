import type { UttoriWikiConfig } from './types/config.js';

export type { UttoriWikiConfig } from './types/config.js';

const config: UttoriWikiConfig = {
  production: false,
  homePage: 'home-page',
  ignoreSlugs: ['home-page'],
  ignoreTags: [],
  excerptLength: 400,
  publicUrl: '',
  canonicalPathPrefix: '',
  canonicalTrailingSlash: false,
  routes: {
    search: 'search',
  },
  titles: {
    search: 'Search',
  },
  themePath: '',
  publicPath: '',
  allowCRUDRoutes: true,
  useDeleteKey: false,
  deleteKey: undefined,
  useEditKey: false,
  editKey: undefined,
  publicHistory: true,
  handleNotFound: true,
  allowedDocumentKeys: [],
  useCache: true,
  cacheShort: 60 * 60,
  cacheLong: 60 * 60 * 24,
  routeMiddleware: {
    home: [],
    search: [],
    notFound: [],
    create: [],
    saveNew: [],
    preview: [],
    edit: [],
    delete: [],
    historyIndex: [],
    historyDetail: [],
    historyRestore: [],
    save: [],
    detail: [],
  },
  plugins: [],
  middleware: [],
  redirects: [],
};

export default config;
