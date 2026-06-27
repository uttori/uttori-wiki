export default validateQuery;
/**
 * A single ORDER BY directive from a validated query.
 */
export type ValidatedQueryOrder = {
    /**
     * Property to sort by (`RANDOM` selects random order).
     */
    prop: string;
    /**
     * Sort direction.
     */
    sort: "ASC" | "DESC";
};
/**
 * Parsed and validated pieces of a SQL-like storage query.
 */
export type ValidatedQuery = {
    /**
     * Selected field names from the SELECT clause.
     */
    fields: string[];
    /**
     * Source table name from the FROM clause.
     */
    table: string;
    /**
     * Parsed WHERE clause AST.
     */
    where: SqlWhereParserAst;
    /**
     * Sort directives from the ORDER BY clause.
     */
    order: ValidatedQueryOrder[];
    /**
     * Maximum number of results from the LIMIT clause.
     */
    limit: number;
};
/**
 * Validates and parses a SQL-like query structure.
 * Pass in: fields, table, conditions, order, limit as a query string:
 * `SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}`
 * @param {string} query The SQL-like query to parse.
 * @returns {ValidatedQuery} Parsed SELECT, FROM, WHERE, ORDER BY, and LIMIT parts.
 * @example
 * ```js
 * validateQuery('SELECT slug FROM documents WHERE slug IS "home" ORDER BY updateDate DESC LIMIT 10');
 * // ➜ { fields: ['slug'], table: 'documents', where: { ... }, order: [{ prop: 'updateDate', sort: 'DESC' }], limit: 10 }
 * ```
 */
declare function validateQuery(query: string): ValidatedQuery;
import type { SqlWhereParserAst } from '../../../dist/custom.d.ts';
//# sourceMappingURL=validate-query.d.ts.map