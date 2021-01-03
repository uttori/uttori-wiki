/* eslint-disable import/no-extraneous-dependencies */
let debug = () => {}; try { debug = require('debug')('Uttori.Wiki'); } catch {}
const express = require('express');

const UttoriWiki = require('./wiki');

module.exports = function middleware(config) {
  const app = express();

  // Apply middleware configuration
  if (config.middleware && Array.isArray(config.middleware)) {
    // console.log('config.middleware', config.middleware);
    config.middleware.forEach((item) => {
      const fn = item.shift();
      if (fn && app[fn] && typeof app[fn] === 'function') {
        debug(`app.${fn}(${JSON.stringify(item)})`);
        app[fn].call(app, ...item);
      }
    });
  }

  // https://expressjs.com/en/4x/api.html#express.static
  // https://webhint.io/docs/user-guide/hints/hint-http-cache/#examples-that-pass-the-hint
  app.use(express.static(config.public_dir, {
    etag: true, // Just being explicit about the default.
    lastModified: true, // Just being explicit about the default.
    immutable: true,
    maxAge: '1y',
  }));

  // TODO This could be much cleaner with a static method
  const _wiki = new UttoriWiki(config, app);

  return app;
};
