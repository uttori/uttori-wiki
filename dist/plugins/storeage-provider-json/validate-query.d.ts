import type { ValidatedQuery } from '../../types/plugins/storeage-provider-json/validate-query.js';
export type { ValidatedQueryOrder, ValidatedQuery } from '../../types/plugins/storeage-provider-json/validate-query.js';
/**
 * Validates and parses a SQL-like query structure.
 * Pass in: fields, table, conditions, order, limit as a query string:
 * `SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}`
 * @param query The SQL-like query to parse.
 * @returns Parsed SELECT, FROM, WHERE, ORDER BY, and LIMIT parts.
 * @example
 * ```js
 * validateQuery('SELECT slug FROM documents WHERE slug IS "home" ORDER BY updateDate DESC LIMIT 10');
 * // ➜ { fields: ['slug'], table: 'documents', where: { ... }, order: [{ prop: 'updateDate', sort: 'DESC' }], limit: 10 }
 * ```
 */
declare const validateQuery: (query: string) => ValidatedQuery;
export default validateQuery;
//# sourceMappingURL=validate-query.d.ts.map