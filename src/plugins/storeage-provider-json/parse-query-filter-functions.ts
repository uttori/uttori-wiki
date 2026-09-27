import type { SqlWhereParserAst, ParserOperand, Value as SqlWhereParserValue } from '../../custom.js';
import type {
  QueryFilterItem, QueryFilterFunction,
} from '../../types/plugins/storeage-provider-json/parse-query-filter-functions.js';

export type {
  QueryFilterItem, QueryFilterFunction,
} from '../../types/plugins/storeage-provider-json/parse-query-filter-functions.js';

/**
 * Checks if a value is between two bounds.
 * @param value The value to check.
 * @param min The minimum value.
 * @param max The maximum value.
 * @returns Returns true if the value is between the min and max.
 */
const isBetween = (value: unknown, min: unknown, max: unknown): boolean => Number(value) >= Number(min) && Number(value) <= Number(max);

/**
 * Checks if a value is included in a list.
 * @param list The list of values to check.
 * @param value The value to check.
 * @returns Returns true if the value is in the list.
 */
const isIn = (list: unknown, value: unknown): boolean => {
  if (!Array.isArray(list)) {
    return list === value;
  }
  return list.includes(value);
};

/**
 * Normalize an AST node value to its operand list.
 * @param nodeValue The AST node value.
 * @returns The operands for the operator.
 */
const toOperands = (nodeValue: SqlWhereParserValue): ParserOperand[] => (Array.isArray(nodeValue) ? nodeValue : [nodeValue]);

/**
 * Read a field value from an item using a parser operand as the key.
 * @param item The item to read from.
 * @param fieldOperand The field name operand.
 * @returns The field value.
 */
const getFieldValue = (item: QueryFilterItem, fieldOperand: ParserOperand): unknown => item[String(fieldOperand)];

/**
 * Coerce a value to an array for INCLUDES/EXCLUDES checks.
 * @param value The value to normalize.
 * @returns The normalized array.
 */
const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value]);

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
const parseQueryToFilterFunctions = (ast: SqlWhereParserAst): QueryFilterFunction => {
  // debug('AST:', JSON.stringify(ast, null, 2));

  const operations: QueryFilterFunction[] = Object.keys(ast).map((key) => {
    const operands = toOperands(ast[key]);
    switch (key) {
      case 'AND':
        return (item) => operands.every((subQuery) => {
          if (typeof subQuery !== 'object' || subQuery === null || Array.isArray(subQuery)) {
            return false;
          }
          return parseQueryToFilterFunctions(subQuery)(item);
        });
      case 'OR':
        return (item) => operands.some((subQuery) => {
          if (typeof subQuery !== 'object' || subQuery === null || Array.isArray(subQuery)) {
            return false;
          }
          return parseQueryToFilterFunctions(subQuery)(item);
        });
      case 'BETWEEN':
        return (item) => isBetween(getFieldValue(item, operands[0]), operands[1], operands[2]);
      case 'IN':
        return (item) => isIn(operands[1], getFieldValue(item, operands[0]));
      case 'NOT_IN':
        return (item) => {
          const fieldValue = getFieldValue(item, operands[0]);
          if (typeof fieldValue === 'undefined') {
            return false;
          }
          return !isIn(operands[1], fieldValue);
        };
      case 'INCLUDES': {
        const includesValues = toArray(operands[1]);
        return (item) => {
          const propValues = toArray(getFieldValue(item, operands[0]) ?? []);
          return propValues.some((val) => isIn(includesValues, val));
        };
      }
      case 'EXCLUDES': {
        const excludesValues = toArray(operands[1]);
        return (item) => {
          const propValues = toArray(getFieldValue(item, operands[0]) ?? []);
          return propValues.every((val) => !isIn(excludesValues, val));
        };
      }
      case 'IS_NULL':
        return (item) => !getFieldValue(item, operands[0]);
      case 'IS_NOT_NULL':
        return (item) => !!getFieldValue(item, operands[0]);
      case 'LIKE':
        return (item) => String(getFieldValue(item, operands[0]) ?? '').includes(String(operands[1]));
      case '=':
      case 'IS':
        return (item) => getFieldValue(item, operands[0]) === operands[1];
      case '<':
        return (item) => Number(getFieldValue(item, operands[0])) < Number(operands[1]);
      case '>':
        return (item) => Number(getFieldValue(item, operands[0])) > Number(operands[1]);
      case '>=':
        return (item) => Number(getFieldValue(item, operands[0])) >= Number(operands[1]);
      case '<=':
        return (item) => Number(getFieldValue(item, operands[0])) <= Number(operands[1]);
      case '!=':
        return (item) => {
          const fieldValue = getFieldValue(item, operands[0]);
          if (typeof fieldValue === 'undefined') {
            return false;
          }
          return fieldValue !== operands[1];
        };
      default:
        console.error('Uncaught key:', key);
        return () => true;
    }
  });

  return (item) => operations.every((op) => op(item));
};

export default parseQueryToFilterFunctions;
