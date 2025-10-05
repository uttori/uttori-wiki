/**
 * Checks if a value is between two bounds.
 * @param {number} value The value to check.
 * @param {number} min The minimum value.
 * @param {number} max The maximum value.
 * @returns {boolean} Returns true if the value is between the min and max.
 */
const isBetween = (value, min, max) => value >= min && value <= max;

/**
 * Checks if a value is included in a list.
 * @param {string[]} list The list of values to check.
 * @param {string} value The value to check.
 * @returns {boolean} Returns true if the value is in the list.
 */
const isIn = (list, value) => {
  if (!Array.isArray(list)) {
    return list === value;
  }
  return list.includes(value);
};

/**
 * Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
 * Both `+` and `-` should be done in a pre-parser step or before the query is constructed, or after results are returned.
 * @param {import('../../../dist/custom.d.ts').SqlWhereParserAst} ast The parsed output of SqlWhereParser to be filtered.
 * @returns {function(any): boolean} The top level filter function.
 * @example <caption>parseQueryToFilterFunctions(ast)</caption>
 * const whereFunctions = parseQueryToFilterFunctions(ast);
 * return objects.filter(whereFunctions);
 * ➜ [{ ... }, { ... }, ...]
 */
const parseQueryToFilterFunctions = (ast) => {
  // debug('AST:', JSON.stringify(ast, null, 2));
  /** @type {Array<function(Record<string, any>): boolean>} */
  const operations = Object.keys(ast).map((key) => {
    /** @type {import('../../../dist/custom.d.ts').Value} */
    const operands = ast[key];
    switch (key) {
      case 'AND':
        return (item) => ast[key]?.every((subQuery) => parseQueryToFilterFunctions(subQuery)(item));
      case 'OR':
        return (item) => ast[key]?.some((subQuery) => parseQueryToFilterFunctions(subQuery)(item));
      case 'BETWEEN':
        return (item) => isBetween(item[operands[0]], operands[1], operands[2]);
      case 'IN':
        return (item) => isIn(operands[1], item[operands[0]]);
      case 'NOT_IN':
        return (item) => {
          if (typeof item[operands[0]] === 'undefined') {
            return false;
          }
          return !isIn(operands[1], item[operands[0]]);
        };
      case 'INCLUDES':
        return (item) => {
          let value = operands[1];
          if (!Array.isArray(value)) {
            value = [value];
          }
          let prop = item[operands[0]] || [];
          if (!Array.isArray(prop)) {
            prop = [prop];
          }
          return prop.some((val) => isIn(value, val));
        };
      case 'EXCLUDES':
        return (item) => {
          let value = operands[1];
          if (!Array.isArray(value)) {
            value = [value];
          }
          let prop = item[operands[0]] || [];
          /* c8 ignore next 3 */
          if (!Array.isArray(prop)) {
            prop = [prop];
          }
          return prop.every((val) => !isIn(value, val));
        };
      case 'IS_NULL':
        return (item) => !item[operands[0]];
      case 'IS_NOT_NULL':
        return (item) => !!item[operands[0]];
      case 'LIKE':
        return (item) => (item[operands[0]] || '').includes(operands[1]);
      case '=':
      case 'IS':
        return (item) => item[operands[0]] === operands[1];
      case '<':
        return (item) => item[operands[0]] < operands[1];
      case '>':
        return (item) => item[operands[0]] > operands[1];
      case '>=':
        return (item) => item[operands[0]] >= operands[1];
      case '<=':
        return (item) => item[operands[0]] <= operands[1];
      case '!=':
        return (item) => {
          if (typeof item[operands[0]] === 'undefined') {
            return false;
          }
          return item[operands[0]] !== operands[1];
        };
      default:
        console.error('Uncaught key:', key);
        return () => true;
    }
  });

  return (item) => operations.every((op) => op(item));
};

export default parseQueryToFilterFunctions;
