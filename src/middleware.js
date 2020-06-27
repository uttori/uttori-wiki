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
  // https://expressjs.com/en/4x/api.html#express.static
  // https://webhint.io/docs/user-guide/hints/hint-http-cache/#examples-that-pass-the-hint
  app.use(express.static(config.public_dir, {
    immutable: true,
    maxAge: 31536000,
  }));

  // TODO This could be much cleaner
  const _wiki = new UttoriWiki(config, app);

  return app;
};
