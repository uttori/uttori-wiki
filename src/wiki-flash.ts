import { createDebug } from './debug.js';

const debug = createDebug('Uttori.Wiki.WikiFlash');
/**
 * Flash messages are stored in the session.
 * First, use `wikiFlash(key, value)` to set a flash message.
 * Then, on subsequent requests, you can retrieve the message with `wikiFlash(key)`.
 * @param [key] The key to get or set flash data under.
 * @param [value] The value to store as flash data.
 * @returns Returns the current flash data, or the data for the given key, or false if no data is found.
 */
export function wikiFlash(this: { session?: { wikiFlash?: Record<string, string[]> } }, key?: string, value?: string): Record<string, string[]>|unknown[]|boolean {
  /* c8 ignore next 4 */
  if (!this.session) {
    debug('Express Session is required.');
    return {};
  }

  this.session.wikiFlash = this.session.wikiFlash || {};

  const current: Record<string, string[]> = this.session.wikiFlash;

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
 * @param request The Express Request object.
 * @param _response The Express Response object.
 * @param next The Express Next function.
 */
export function middleware(request: import('express').Request, _response: import('express').Response, next: import('express').NextFunction) {
  if (!request.wikiFlash) {
    request.wikiFlash = wikiFlash;
  }
  next();
  return;
}

export default {
  wikiFlash,
  middleware,
};
