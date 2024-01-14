/** @type {Function} */
const debug = () => {}; // try { debug = require('debug')('Uttori.Wiki.WikiFlash'); } catch {}

/**
 * Flash messages are stored in the session.
 * First, use `wikiFlash(key, value)` to set a flash message.
 * Then, on subsequent requests, you can retrieve the message with `wikiFlash(key)`.
 * @param {string} [key] The key to get or set flash data under.
 * @param {string} [value] The value to store as flash data.
 * @returns {Record<string, string[]>|Array|boolean} Returns the current flash data, or the data for the given key, or false if no data is found.
 */
export function wikiFlash(key, value) {
  if (!this.session) {
    debug('Express Session is required.');
    return {};
  }

  this.session.wikiFlash = this.session.wikiFlash || {};
  /** @type {Record<string, string[]>} */
  const current = this.session.wikiFlash;

  // Set a value to a key.
  if (key && value) {
    current[key] = current[key] || [];
    current[key].push(value);
    return current;
  }

  // Return a specific value for a given key and reset it.
  if (key) {
    const values = current[key] || [];
    delete current[key];
    return values;
  }

  // Return all data and reset.
  this.session.wikiFlash = {};
  return current;
}

/**
 * Return the middleware that adds `wikiFlash`.
 * @type {import('express').RequestHandler}
 * @param {import('express').Request} request The Express Request object.
 * @param {import('express').Response} _response The Express Response object.
 * @param {import('express').NextFunction} next The Express Next function.
 */
export function middleware(request, _response, next) {
  /* istanbul ignore else */
  if (!request.wikiFlash) {
    request.wikiFlash = wikiFlash;
  }
  next();
}

export default {
  wikiFlash,
  middleware,
};
