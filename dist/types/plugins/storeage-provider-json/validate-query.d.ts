import type { SqlWhereParserAst } from '../../../custom.js';
/** A single ORDER BY directive from a validated query. */
export interface ValidatedQueryOrder {
    /** Property to sort by (`RANDOM` selects random order). */
    prop: string;
    /** Sort direction. */
    sort: 'ASC' | 'DESC';
}
/** Parsed and validated pieces of a SQL-like storage query. */
export interface ValidatedQuery {
    /** Selected field names from the SELECT clause. */
    fields: string[];
    /** Source table name from the FROM clause. */
    table: string;
    /** Parsed WHERE clause AST. */
    where: SqlWhereParserAst;
    /** Sort directives from the ORDER BY clause. */
    order: ValidatedQueryOrder[];
    /** Maximum number of results from the LIMIT clause. */
    limit: number;
}
//# sourceMappingURL=validate-query.d.ts.map