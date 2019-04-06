const fs = require('fs-extra');

// Server
const express = require('express');
const ejs = require('ejs');
const layouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');

const StorageProvider = require('uttori-storage-provider-json-file');
const UploadProvider = require('uttori-upload-provider-multer'); // require('./__stubs/UploadProvider.js');
const SearchProvider = require('./../__stubs/SearchProvider.js');
const Renderer = require('./../__stubs/Renderer.js');
const defaultConfig = require('../../app/config.default.js');

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
  content_dir: 'test/site/content',
  history_dir: 'test/site/content/history',
  uploads_dir: 'test/site/uploads',
  data_dir: 'test/site/data',
  public_dir: 'test/site/themes/default/public',
  // Providers
  StorageProvider,
  SearchProvider,
  UploadProvider,
  Renderer,
  use_delete_key: true,
  delete_key: 'test-key',
  use_recaptcha: false,
  recaptcha_site_key: '',
  use_google_analytics: false,
  google_analytics_id: '',
};

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
server.use('/uploads', express.static(config.uploads_dir));
server.use(bodyParser.json({ limit: '50mb' }));
server.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));

if (process.argv[2] && process.argv[2] !== 'undefined') {
  console.log('Setting process.title:', typeof process.argv[2], process.argv[2]);
  process.title = process.argv[2];
}

// Is this a require()?
if (require.main === module) {
  console.log('Starting test server...');
  server.listen(server.get('port'), server.get('ip'));
}

const cleanup = async () => {
  try { await fs.remove('test/site/content/history/test-delete'); } catch (error) {}
  try { await fs.remove('test/site/content/history/test-new'); } catch (error) {}
  try { await fs.remove('test/site/content/test-old.json'); } catch (error) {}
  try { await fs.remove('test/site/data/visits.json'); } catch (error) {}
  try { await fs.remove('test/site/themes/default/public/sitemap.xml'); } catch (error) {}
  try { await fs.remove('test/site/uploads'); } catch (error) {}
  try { await fs.ensureDir('test/site/uploads'); } catch (error) {}
};

module.exports = { config, server, cleanup };
