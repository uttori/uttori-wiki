import parseQueryToFilterFunctions from './parse-query-filter-functions.js';
import validateQuery from './validate-query.js';
import fyShuffle from './fisher-yates-shuffle.js';

let debug = (..._) => {};
/* c8 ignore next 2 */

try { const { default: d } = await import('debug'); debug = d('Uttori.StorageProvider.JSON.QueryTools'); } catch {}

/**
 * Processes a query string.
 * @param {string} query - The SQL-like query to parse.
 * @param {import('../../wiki.js').UttoriWikiDocument[]} objects - An array of object to search within.
 * @returns {import('../../wiki.js').UttoriWikiDocument[]|number} Returns an array of all matched documents, or a count.
 * @example
 * ```js
 * processQuery('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
 * ➜ [{ ... }, ...]
 * ```
 */
const processQuery = (query, objects) => {
  debug('Processing Query:', query);
  // Filter
  const { fields, where, order, limit } = validateQuery(query);
  debug('Found fields:', fields);
  debug('Found where:', where);
  debug('Found order:', order);
  debug('Found limit:', limit);
  const whereFunctions = parseQueryToFilterFunctions(where);
  /** @type {import('../../wiki.js').UttoriWikiDocument[]} */
  const filtered = objects.filter(whereFunctions);

  // Short circuit when we only want the counts.
  if (fields.includes('COUNT(*)')) {
    return filtered.length;
  }

  // Sort / Order
  let output;
  if (order[0].prop === 'RANDOM') {
    output = fyShuffle(filtered);
  } else {
    output = filtered.sort((a, b) => {
      for (const value of order) {
        const direction = value.sort === 'ASC' ? 1 : -1;
        if (a[value.prop] < b[value.prop]) return -1 * direction;
        if (a[value.prop] > b[value.prop]) return 1 * direction;
      }
      return 0;
    });
  }

  // Limit
  if (limit > 0) {
    output = output.slice(0, limit);
  }

  // Select
  if (!fields.includes('*')) {
    output = output.map((item) => {
      /** @type {import('../../wiki.js').UttoriWikiDocument} */
      const newItem = {};
      fields.forEach((field) => {
        if (Object.hasOwn(item, field)) {
          newItem[field] = item[field];
        }
      });
      return newItem;
    });
  }

  return output;
};

export default processQuery;
