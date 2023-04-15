const express = require('express');

/** @type {Function} */
let debug = () => {}; try { debug = require('debug')('Uttori.Wiki.WikiFlash'); } catch {}

/**
 * @function
 * @param {string} [key] The key to get or set flash data under.
 * @param {*} [value] The value to store as flash data.
 * @returns {object|Array|boolean} Returns
 */
function wikiFlash(key, value) {
  if (!this.session) {
    debug('Express Session is required.');
    return () => {};
  }

  this.session.wikiFlash = this.session.wikiFlash || {};
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
 *
 * @type {express.RequestHandler}
 * @param {express.Request} request The Express Request object.
 * @param {express.Response} _response The Express Response object.
 * @param {express.NextFunction} next The Express Next function.
 */
function middleware(request, _response, next) {
  /* istanbul ignore else */
  if (!request.wikiFlash) {
    request.wikiFlash = wikiFlash;
  }
  next();
}

module.exports = {
  wikiFlash,
  middleware,
};
