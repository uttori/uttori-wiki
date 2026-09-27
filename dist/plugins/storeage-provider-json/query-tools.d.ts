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
declare const processQuery: (query: string, objects: import('../../wiki.js').UttoriWikiDocument[]) => import('../../wiki.js').UttoriWikiDocument[] | number;
export default processQuery;
//# sourceMappingURL=query-tools.d.ts.map