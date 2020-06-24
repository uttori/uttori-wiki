/* eslint-disable import/no-extraneous-dependencies */
const express = require('express');
const path = require('path');
const ejs = require('ejs');
const layouts = require('express-ejs-layouts');

const UttoriWiki = require('./wiki');

module.exports = function middleware(config) {
  const app = express();

  app.set('views', path.join(config.theme_dir, config.theme_name, 'templates'));
  app.use(layouts);
  app.set('layout extractScripts', true);
  app.set('layout extractStyles', true);
  app.set('view engine', 'html');
  app.enable('view cache');
  app.engine('html', ejs.renderFile);
  app.use(express.static(config.public_dir));

  // TODO This could be much cleaner
  const _wiki = new UttoriWiki(config, app);

  return app;
};
