export default processQuery;
/**
 * Processes a query string.
 * @param {string} query - The SQL-like query to parse.
 * @param {import('../../wiki.js').UttoriWikiDocument[]} objects - An array of object to search within.
 * @returns {import('../../wiki.js').UttoriWikiDocument[]|Partial<import('../../wiki.js').UttoriWikiDocument>[]|number} Returns an array of all matched documents, or a count.
 * @example
 * ```js
 * processQuery('SELECT name FROM table WHERE age > 1 ORDER BY RANDOM LIMIT 3', [{ ... }, ...]);
 * ➜ [{ ... }, ...]
 * ```
 */
declare function processQuery(query: string, objects: import("../../wiki.js").UttoriWikiDocument[]): import("../../wiki.js").UttoriWikiDocument[] | Partial<import("../../wiki.js").UttoriWikiDocument>[] | number;
//# sourceMappingURL=query-tools.d.ts.map