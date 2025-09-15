import SqlWhereParser from './where-parser.js';

let debug = (..._) => {};
/* c8 ignore next 2 */
try { const { default: d } = await import('debug'); debug = d('Uttori.ValidateQuery'); } catch {}

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
const validateQuery = (query) => {
  debug('validateQuery:', query);
  let error;

  // Split into parts:
  // - fields parser (N/A): 'SELECT'
  // - table parser (N/A): 'FROM'
  // - where parser (SqlWhereParser): 'WHERE'
  // - order parser (TBD): 'ORDER BY', 'ASC', 'DESC', 'RANDOM':
  // - limit parser (N/A): 'LIMIT'
  const pieces = query.split(/(SELECT|FROM|WHERE|ORDER BY|LIMIT)/).map((piece) => piece.trim());
  pieces.shift(); // Empty item is always first.

  // Fields
  if (pieces[0] !== 'SELECT') {
    error = 'Invalid Query: Missing SELECT';
    debug(error, pieces[0]);
    throw new Error(error);
  }
  const fields = pieces[1].split(',').map((field) => field.trim().replace(/["'`]/g, ''));
  if (fields.length === 0 || fields[0] === '') {
    error = 'Invalid Query: Invalid SELECT';
    debug(error, fields);
    throw new Error(error);
  }

  // Table
  if (pieces[2] !== 'FROM') {
    error = 'Invalid Query: Missing FROM';
    debug(error, pieces[2]);
    throw new Error(error);
  }
  const table = pieces[3].trim().replace(/["']/g, '');
  if (table === '') {
    error = 'Invalid Query: Invalid FROM';
    debug(error, table);
    throw new Error(error);
  }

  // Where
  if (pieces[4] !== 'WHERE') {
    error = 'Invalid Query: Missing WHERE';
    debug(error, pieces[4]);
    throw new Error(error);
  }
  const where_string = pieces[5].trim();
  /** @type {import('../../../dist/custom.d.ts').SqlWhereParserAst} */
  let where;
  try {
    const parser = new SqlWhereParser();
    where = parser.parse(where_string);
  } catch (error2) {
    error = `Invalid Query: Invalid WHERE: ${error2.message}`;
    debug(error, where_string);
    throw new Error(error);
  }

  // Order By / Sort
  if (pieces[6] !== 'ORDER BY') {
    error = 'Invalid Query: Missing ORDER BY';
    debug(error, pieces[6]);
    throw new Error(error);
  }
  if (pieces[7] === '') {
    error = 'Invalid Query: Invalid ORDER BY, empty ORDER BY';
    debug(error, pieces[7]);
    throw new Error(error);
  }
  /** @type {ValidateQueryOrder[]} */
  const order = pieces[7].trim() // Trim the string
    .split(',') // Split by comma
    .map((s) => s.trim()) // Trim each part
    .map((s) => s.split(' ')) // Split each part by space
    .map(([prop, sort]) => ({ prop, sort })); // Create an object from each pair
  if (order.length === 1 && order[0].prop === 'RANDOM') {
    order[0].sort = 'ASC';
  }
  if (order.length === 1 && !order[0].sort && order[0].prop !== 'RANDOM') {
    error = 'Invalid Query: Invalid ORDER BY, missing sort';
    debug(error, pieces[7]);
    throw new Error(error);
  }
  order.forEach((ordering) => {
    if (!(ordering.sort === 'ASC' || ordering.sort === 'DESC')) {
      error = `Invalid Query: Invalid ORDER BY, sort must be one of ASC or DESC, got ${String(ordering.sort)}`;
      debug(error, pieces[7]);
      throw new Error(error);
    }
  });

  // Limit
  if (pieces[8] !== 'LIMIT') {
    error = 'Invalid Query: Missing LIMIT';
    debug(error, pieces[8]);
    throw new Error(error);
  }
  const limit = Number.parseInt(pieces[9].trim(), 10);
  if (Number.isNaN(limit)) {
    error = 'Invalid Query: Invalid LIMIT';
    debug(error, pieces[9]);
    throw new Error(error);
  }

  // debug('validateQuery output:', { fields, table, where, order, limit });
  return {
    fields, table, where, order, limit,
  };
};

export default validateQuery;
