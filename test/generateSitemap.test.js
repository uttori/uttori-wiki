const fs = require('fs-extra');
const test = require('ava');
const MarkdownIt = require('markdown-it');

const UttoriWiki = require('../app');

const { config, server, cleanup } = require('./_helpers/server.js');

const md = new MarkdownIt();

test.before(() => {
  cleanup();
});

test.after(() => {
  cleanup();
});

test.afterEach(() => {
  cleanup();
});

test('generateSitemap(): writes a valid sitemap', (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  uttori.generateSitemap();
  const data = fs.readFileSync(`${uttori.config.public_dir}/${uttori.config.sitemap_filename}`);
  t.is(data.length, 868);
});

test('generateSitemapXML(): generates a valid sitemap', (t) => {
  t.plan(1);

  const uttori = new UttoriWiki(config, server, md);
  t.is(uttori.generateSitemapXML().length, 868);
});

test('generateSitemapXML(): filters out urls with a filter', (t) => {
  t.plan(1);

  const uttori = new UttoriWiki({ ...config, sitemap_url_filter: [/fake-title$/i] }, server, md);
  t.is(uttori.generateSitemapXML().length, 767);
});
