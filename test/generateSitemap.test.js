const fs = require('fs-extra');
const test = require('ava');

const UttoriSitemap = require('../app/sitemap');

const { config, cleanup } = require('./_helpers/server.js');

const documents = () => [
  {
    updateDate: new Date('2019-04-20').toISOString(),
    createDate: new Date('2019-04-20').toISOString(),
    slug: 'good-title',
  },
  {
    updateDate: new Date('2019-04-21').toISOString(),
    createDate: new Date('2019-04-21').toISOString(),
    slug: 'fake-title',
  },
];

test.before(async () => {
  await cleanup();
});

test.after(async () => {
  await cleanup();
});

test.afterEach(async () => {
  await cleanup();
});

test('generateSitemapXML(): generates a valid sitemap', (t) => {
  t.plan(1);
  const output = UttoriSitemap.generateSitemapXML({ ...config, sitemap: [] }, documents());
  t.is(output, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"><url><loc>/good-title</loc><lastmod>2019-04-20T00:00:00.000Z</lastmod><priority>0.80</priority></url><url><loc>/fake-title</loc><lastmod>2019-04-21T00:00:00.000Z</lastmod><priority>0.80</priority></url></urlset>');
});

test('generateSitemapXML(): generates a valid sitemap with no documents', (t) => {
  t.plan(1);
  const output = UttoriSitemap.generateSitemapXML({ ...config, sitemap: [] });
  t.is(output, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"></urlset>');
});

test('generateSitemapXML(): filters out urls with a filter', (t) => {
  t.plan(1);
  const output = UttoriSitemap.generateSitemapXML({ ...config, sitemap: [], sitemap_url_filter: [/fake-title$/i] }, documents());
  t.is(output, '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"><url><loc>/good-title</loc><lastmod>2019-04-20T00:00:00.000Z</lastmod><priority>0.80</priority></url></urlset>');
});

test('UttoriSitemap.generateSitemap(): writes a valid sitemap', async (t) => {
  t.plan(1);

  await UttoriSitemap.generateSitemap(config, documents());
  const data = await fs.readFile(`${config.public_dir}/${config.sitemap_filename}`, 'utf8');
  t.is(data.length, 764);
});

test('UttoriSitemap.generateSitemap(): writes a valid sitemap with no documents', async (t) => {
  t.plan(1);

  await UttoriSitemap.generateSitemap(config);
  const data = await fs.readFile(`${config.public_dir}/${config.sitemap_filename}`, 'utf8');
  t.is(data.length, 764);
});
