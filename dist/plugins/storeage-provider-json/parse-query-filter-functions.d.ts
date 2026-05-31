export default parseQueryToFilterFunctions;
/**
 * Document-like object passed to query filter functions.
 */
export type QueryFilterItem = Record<string, unknown>;
export type QueryFilterFunction = (item: QueryFilterItem) => boolean;
/**
 * Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
 * Both `+` and `-` should be done in a pre-parser step or before the query is constructed, or after results are returned.
 * @param {SqlWhereParserAst} ast The parsed output of SqlWhereParser to be filtered.
 * @returns {QueryFilterFunction} The top level filter function.
 * @example <caption>parseQueryToFilterFunctions(ast)</caption>
 * const whereFunctions = parseQueryToFilterFunctions(ast);
 * return objects.filter(whereFunctions);
 * ➜ [{ ... }, { ... }, ...]
 */
declare function parseQueryToFilterFunctions(ast: SqlWhereParserAst): QueryFilterFunction;
import type { SqlWhereParserAst } from '../../../dist/custom.d.ts';
//# sourceMappingURL=parse-query-filter-functions.d.ts.map