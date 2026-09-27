import { createDebug } from '../../debug.js';
import SqlWhereParser from './where-parser.js';
const debug = createDebug('Uttori.ValidateQuery');
/** Regex that splits a query into keywords and their value segments. */
const QUERY_SEGMENT_PATTERN = /(SELECT|FROM|WHERE|ORDER BY|LIMIT)/;
/**
 * Log and throw a query validation error.
 * @param message The error message.
 * @param details Additional values to log.
 */
function invalidQuery(message, ...details) {
    debug(message, ...details);
    throw new Error(message);
}
/**
 * Split a SQL-like query into alternating keyword and value segments.
 * @param query The full query string.
 * @returns Trimmed segments after the leading empty split.
 */
function splitQuerySegments(query) {
    const segments = query.split(QUERY_SEGMENT_PATTERN).map((piece) => piece.trim());
    segments.shift();
    return segments;
}
/**
 * Require a keyword at the expected segment index.
 * @param segments Query segments from {@link splitQuerySegments}.
 * @param keywordIndex Index of the keyword segment.
 * @param keyword Expected keyword text.
 * @returns The value segment immediately following the keyword.
 */
function readSegment(segments, keywordIndex, keyword) {
    if (segments[keywordIndex] !== keyword) {
        invalidQuery(`Invalid Query: Missing ${keyword}`, segments[keywordIndex]);
    }
    return segments[keywordIndex + 1] ?? '';
}
/**
 * Parse the SELECT field list.
 * @param fieldClause Raw field list text.
 * @returns Normalized field names.
 */
function parseSelectFields(fieldClause) {
    const fields = fieldClause.split(',').map((field) => field.trim().replace(/["'`]/g, ''));
    if (fields.length === 0 || fields[0] === '') {
        invalidQuery('Invalid Query: Invalid SELECT', fields);
    }
    return fields;
}
/**
 * Parse the FROM table name.
 * @param tableClause Raw table text.
 * @returns Normalized table name.
 */
function parseTableName(tableClause) {
    const table = tableClause.trim().replace(/["']/g, '');
    if (table === '') {
        invalidQuery('Invalid Query: Invalid FROM', table);
    }
    return table;
}
/**
 * Parse the WHERE clause into an AST.
 * @param whereClause Raw WHERE text.
 * @returns Parsed WHERE AST.
 */
function parseWhereClause(whereClause) {
    try {
        const parser = new SqlWhereParser();
        return parser.parse(whereClause.trim());
    }
    catch (err) {
        const error = err;
        return invalidQuery(`Invalid Query: Invalid WHERE: ${error.message}`, whereClause);
    }
}
/**
 * Parse the ORDER BY clause into sort directives.
 * @param orderClause Raw ORDER BY text.
 * @returns Validated sort directives.
 */
function parseOrderClause(orderClause) {
    if (orderClause.trim() === '') {
        invalidQuery('Invalid Query: Invalid ORDER BY, empty ORDER BY', orderClause);
    }
    const order = orderClause.trim()
        .split(',')
        .map((segment) => segment.trim())
        .map((segment) => {
        const parts = segment.split(/\s+/);
        const prop = parts[0] ?? '';
        let sort = parts[1] ?? '';
        if (prop === 'RANDOM' && !sort) {
            sort = 'ASC';
        }
        return { prop, sort: sort };
    });
    if (order.length === 1 && !order[0].sort && order[0].prop !== 'RANDOM') {
        invalidQuery('Invalid Query: Invalid ORDER BY, missing sort', orderClause);
    }
    for (const ordering of order) {
        if (!(ordering.sort === 'ASC' || ordering.sort === 'DESC')) {
            invalidQuery(`Invalid Query: Invalid ORDER BY, sort must be one of ASC or DESC, got ${String(ordering.sort)}`, orderClause);
        }
    }
    return order;
}
/**
 * Parse the LIMIT clause.
 * @param limitClause Raw LIMIT text.
 * @returns Parsed limit.
 */
function parseLimitClause(limitClause) {
    const limit = Number.parseInt(limitClause.trim(), 10);
    if (Number.isNaN(limit)) {
        invalidQuery('Invalid Query: Invalid LIMIT', limitClause);
    }
    return limit;
}
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
const validateQuery = (query) => {
    debug('validateQuery:', query);
    const segments = splitQuerySegments(query);
    readSegment(segments, 0, 'SELECT');
    const fields = parseSelectFields(segments[1] ?? '');
    readSegment(segments, 2, 'FROM');
    const table = parseTableName(segments[3] ?? '');
    readSegment(segments, 4, 'WHERE');
    const where = parseWhereClause(segments[5] ?? '');
    readSegment(segments, 6, 'ORDER BY');
    const order = parseOrderClause(segments[7] ?? '');
    readSegment(segments, 8, 'LIMIT');
    const limit = parseLimitClause(segments[9] ?? '');
    // debug('validateQuery output:', { fields, table, where, order, limit });
    return {
        fields, table, where, order, limit,
    };
};
export default validateQuery;
//# sourceMappingURL=validate-query.js.map