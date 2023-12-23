import express from 'express';

import UttoriWiki from './wiki.js';
import { middleware as flash } from './wiki-flash.js';

let debug = (..._) => {};
/* c8 ignore next */
try { const { default: d } = await import('debug'); debug = d('Uttori.middleware'); } catch {}

/**
 *
 * @param {import('./config.js').UttoriWikiConfig} config The UttoriWikiConfig to use.
 * @returns {express.Application} The Express server setup with UttoriWiki.
 */
function middleware(config) {
  const app = express();

  // Add flash messages if Express Session is avaliable.
  app.use(flash);

  // Apply middleware configuration
  if (config.middleware && Array.isArray(config.middleware)) {
    // console.log('config.middleware', config.middleware);
    for (const item of config.middleware) {
      const fn = item.shift();
      if (fn && typeof fn === 'string' && app[fn] && typeof app[fn] === 'function') {
        debug(`app.${fn}(${JSON.stringify(item)})`);
        app[fn].call(app, ...item);
      }
    }
  }

  // https://expressjs.com/en/4x/api.html#express.static
  // https://webhint.io/docs/user-guide/hints/hint-http-cache/#examples-that-pass-the-hint
  app.use(express.static(config.publicPath, {
    etag: true, // Just being explicit about the default.
    lastModified: true, // Just being explicit about the default.
    immutable: true,
    maxAge: '1y',
  }));

  // TODO This could be much cleaner with a static method
  const _wiki = new UttoriWiki(config, app);

  return app;
}

export default middleware;
