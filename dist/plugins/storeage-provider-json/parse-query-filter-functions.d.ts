import type { SqlWhereParserAst } from '../../custom.js';
import type { QueryFilterFunction } from '../../types/plugins/storeage-provider-json/parse-query-filter-functions.js';
export type { QueryFilterItem, QueryFilterFunction, } from '../../types/plugins/storeage-provider-json/parse-query-filter-functions.js';
/**
 * Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
 * Both `+` and `-` should be done in a pre-parser step or before the query is constructed, or after results are returned.
 * @param ast The parsed output of SqlWhereParser to be filtered.
 * @returns The top level filter function.
 * @example <caption>parseQueryToFilterFunctions(ast)</caption>
 * const whereFunctions = parseQueryToFilterFunctions(ast);
 * return objects.filter(whereFunctions);
 * ➜ [{ ... }, { ... }, ...]
 */
declare const parseQueryToFilterFunctions: (ast: SqlWhereParserAst) => QueryFilterFunction;
export default parseQueryToFilterFunctions;
//# sourceMappingURL=parse-query-filter-functions.d.ts.map