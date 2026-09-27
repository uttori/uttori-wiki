import { createDebug } from '../../debug.js';
import parseQueryToFilterFunctions from './parse-query-filter-functions.js';
import validateQuery from './validate-query.js';
import fyShuffle from './fisher-yates-shuffle.js';
const debug = createDebug('Uttori.StorageProvider.JSON.QueryTools');
/**
 * Processes a query string.
 * @param query - The SQL-like query to parse.
 * @param objects - An array of object to search within.
 * @returns Returns an array of all matched documents, or a count.
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
    const filtered = objects.filter(whereFunctions);
    // Short circuit when we only want the counts.
    if (fields.includes('COUNT(*)')) {
        return filtered.length;
    }
    // Sort / Order
    let output;
    if (order[0].prop === 'RANDOM') {
        output = fyShuffle(filtered.slice());
    }
    else {
        output = filtered.sort((a, b) => {
            for (const value of order) {
                const direction = value.sort === 'ASC' ? 1 : -1;
                // Preserve JavaScript's comparison semantics for fields selected by the query.
                const left = a[value.prop];
                const right = b[value.prop];
                if (left < right)
                    return -1 * direction;
                if (left > right)
                    return 1 * direction;
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
            const source = item;
            const newItem = {};
            for (const field of fields) {
                if (Object.hasOwn(source, field)) {
                    newItem[field] = source[field];
                }
            }
            return newItem;
        });
    }
    return output;
};
export default processQuery;
//# sourceMappingURL=query-tools.js.map