import fs from 'node:fs';
import test from 'ava';
import SitemapGenerator from '../../src/plugins/sitemap-generator.js';

const config = SitemapGenerator.defaultConfig();
const context = {
  config: {
    [SitemapGenerator.configKey]: {
      ...config,
      base_url: 'https://domain.tld',
      directory: './',
    },
  },
  hooks: {
    fetch: () => [
      [
        {
          updateDate: null,
          createDate: new Date('2019-04-20').toISOString(),
          slug: 'good-title',
        },
        {
          updateDate: new Date('2019-04-21').toISOString(),
          createDate: new Date('2019-04-21').toISOString(),
          slug: 'fake-title',
        },
      ],
    ],
  },
};

test('SitemapGenerator.register(context): can register', (t) => {
  t.notThrows(() => {
    SitemapGenerator.register({
      hooks: {
        on: () => {},
      },
      config: {
        [SitemapGenerator.configKey]: {
          events: {
            callback: [],
          },
        },
      },
    });
  });
});

test('SitemapGenerator.register(context): errors without event dispatcher', (t) => {
  t.throws(() => {
    SitemapGenerator.register({
      hooks: {},
    });
  }, { message: 'Missing event dispatcher in \'context.hooks.on(event, callback)\' format.' });
});

test('SitemapGenerator.register(context): errors without events', (t) => {
  t.throws(() => {
    SitemapGenerator.register({
      hooks: {
        on: () => {},
      },
      config: {
        [SitemapGenerator.configKey]: {},
      },
    });
  }, { message: 'Missing events to listen to for in \'config.events\'.' });
});

test('SitemapGenerator.register(context): does not error with events corresponding to missing methods', (t) => {
  t.notThrows(() => {
    SitemapGenerator.register({
      hooks: {
        on: () => {},
      },
      config: {
        [SitemapGenerator.configKey]: {
          events: {
            test: ['test'],
            validateConfig: ['validate-config'],
          },
        },
      },
    });
  });
});

test('SitemapGenerator.defaultConfig(): can return a default config', (t) => {
  t.notThrows(SitemapGenerator.defaultConfig);
});

test('SitemapGenerator.generateSitemap(_document, context): generates a valid sitemap', async (t) => {
  t.plan(1);
  const output = await SitemapGenerator.generateSitemap({
    ...context,
    config: {
      ...context.config,
      [SitemapGenerator.configKey]: {
        ...context.config[SitemapGenerator.configKey],
        urls: [],
      },
    },
  });
  t.is(output, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"><url><loc>https://domain.tld/good-title</loc><lastmod>2019-04-20T00:00:00.000Z</lastmod><priority>0.80</priority></url><url><loc>https://domain.tld/fake-title</loc><lastmod>2019-04-21T00:00:00.000Z</lastmod><priority>0.80</priority></url></urlset>');
});

test('SitemapGenerator.generateSitemap(_document, context): generates a valid sitemap with no documents', async (t) => {
  t.plan(1);
  const output = await SitemapGenerator.generateSitemap({
    storageProvider: {
      getQuery: () => [],
    },
    config: {
      ...context.config,
      [SitemapGenerator.configKey]: {
        ...context.config[SitemapGenerator.configKey],
        urls: [],
      },
    },
  });
  t.is(output, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"></urlset>');
});

test('SitemapGenerator.generateSitemap(_document, context): filters out urls with a filter', async (t) => {
  t.plan(1);
  const output = await SitemapGenerator.generateSitemap({
    ...context,
    config: {
      ...context.config,
      [SitemapGenerator.configKey]: {
        ...context.config[SitemapGenerator.configKey],
        urls: [],
        url_filters: [/fake-title$/i],
      },
    },
  });
  t.is(output, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"><url><loc>https://domain.tld/good-title</loc><lastmod>2019-04-20T00:00:00.000Z</lastmod><priority>0.80</priority></url></urlset>');
});

test('SitemapGenerator.validateConfig(config, _context): throws when sitemaps key is missing', (t) => {
  t.throws(() => {
    SitemapGenerator.validateConfig({});
  }, { message: 'sitemap configuration key is missing.' });
});

test('SitemapGenerator.validateConfig(config, _context): throws when urls is not an array', (t) => {
  t.throws(() => {
    SitemapGenerator.validateConfig({
      [SitemapGenerator.configKey]: {
        urls: {},
        url_filters: [],
      },
    });
  }, { message: 'urls should be an array of documents.' });
});

test('SitemapGenerator.validateConfig(config, _context): throws when url_filters is not an array', (t) => {
  t.throws(() => {
    SitemapGenerator.validateConfig({
      [SitemapGenerator.configKey]: {
        urls: [],
        url_filters: {},
      },
    });
  }, { message: 'url_filters should be an array of regular expression url filters.' });
});

test('SitemapGenerator.validateConfig(config, _context): throws when base_url is missing', (t) => {
  t.throws(() => {
    SitemapGenerator.validateConfig({
      [SitemapGenerator.configKey]: {
        urls: [],
        url_filters: [],
      },
    });
  }, { message: 'base_url is required should be an string of your base URL (ie https://domain.tld).' });
});

test('SitemapGenerator.validateConfig(config, _context): throws when base_url is not a string', (t) => {
  t.throws(() => {
    SitemapGenerator.validateConfig({
      [SitemapGenerator.configKey]: {
        urls: [],
        url_filters: [],
        base_url: null,
      },
    });
  }, { message: 'base_url is required should be an string of your base URL (ie https://domain.tld).' });
});

test('SitemapGenerator.validateConfig(config, _context): throws when directory is missing', (t) => {
  t.throws(() => {
    SitemapGenerator.validateConfig({
      [SitemapGenerator.configKey]: {
        urls: [],
        url_filters: [],
        base_url: 'https://domain.tld',
      },
    });
  }, { message: 'directory is required should be the path to the location you want the sitemap to be writtent to.' });
});

test('SitemapGenerator.validateConfig(config, _context): throws when directory is not a string', (t) => {
  t.throws(() => {
    SitemapGenerator.validateConfig({
      [SitemapGenerator.configKey]: {
        urls: [],
        url_filters: [],
        base_url: 'https://domain.tld',
        directory: null,
      },
    });
  }, { message: 'directory is required should be the path to the location you want the sitemap to be writtent to.' });
});

test('SitemapGenerator.validateConfig(config, _context): can validate', (t) => {
  t.notThrows(() => {
    SitemapGenerator.validateConfig({
      [SitemapGenerator.configKey]: {
        urls: [],
        url_filters: [],
        base_url: 'https://domain.tld',
        directory: './',
      },
    });
  });
});

test('SitemapGenerator.callback(_document, context): writes properly generated sitemap to desired location', async (t) => {
  try {
    fs.unlinkSync('./test/sitemap.xml');
  } catch (_) {}
  await SitemapGenerator.callback(null, { ...context, config: { ...context.config, [SitemapGenerator.configKey]: { ...context.config[SitemapGenerator.configKey], urls: [] } } });
  const output = fs.readFileSync('./sitemap.xml', { encoding: 'utf8' });
  t.is(output, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"><url><loc>https://domain.tld/good-title</loc><lastmod>2019-04-20T00:00:00.000Z</lastmod><priority>0.80</priority></url><url><loc>https://domain.tld/fake-title</loc><lastmod>2019-04-21T00:00:00.000Z</lastmod><priority>0.80</priority></url></urlset>');
  fs.unlinkSync('./sitemap.xml');
});
