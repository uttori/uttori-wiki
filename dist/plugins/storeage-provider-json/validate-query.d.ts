export default validateQuery;
export type ValidateQueryOrder = {
    /**
     * The property to sort by.
     */
    prop: string;
    /**
     * The direction to sort.
     */
    sort: string | "ASC" | "DESC";
};
export type ValidateQueryFields = {
    /**
     * The fields to return.
     */
    fields: string[];
    /**
     * The table to query.
     */
    table: string;
    /**
     * The conditions on which a document should be returned.
     */
    where: import("../../../dist/custom.d.ts").SqlWhereParserAst;
    /**
     * The various orders to sort by.
     */
    order: ValidateQueryOrder[];
    /**
     * The maximum number of results to return.
     */
    limit: number;
};
/**
 * @typedef {object} ValidateQueryOrder
 * @property {string} prop The property to sort by.
 * @property {string | 'ASC' | 'DESC'} sort The direction to sort.
 */
/**
 * @typedef {object} ValidateQueryFields
 * @property {string[]} fields The fields to return.
 * @property {string} table The table to query.
 * @property {import('../../../dist/custom.d.ts').SqlWhereParserAst} where The conditions on which a document should be returned.
 * @property {ValidateQueryOrder[]} order The various orders to sort by.
 * @property {number} limit The maximum number of results to return.
 */
/**
 * Validates and parses a SQL-like query structure.
 * Pass in: fields, table, conditions, order, limit as a query string:
 * `SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}`
 * @param {string} query - The conditions on which a document should be returned.
 * @returns {ValidateQueryFields} The extrated and validated fields, table, where, order and limit properties.
 */
declare function validateQuery(query: string): ValidateQueryFields;
//# sourceMappingURL=validate-query.d.ts.map