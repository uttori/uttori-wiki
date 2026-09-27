## Constants

<dl>
<dt><a href="#QUERY_SEGMENT_PATTERN">QUERY_SEGMENT_PATTERN</a></dt>
<dd><p>Regex that splits a query into keywords and their value segments.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#invalidQuery">invalidQuery(message, ...details)</a></dt>
<dd><p>Log and throw a query validation error.</p>
</dd>
<dt><a href="#splitQuerySegments">splitQuerySegments(query)</a> ⇒</dt>
<dd><p>Split a SQL-like query into alternating keyword and value segments.</p>
</dd>
<dt><a href="#readSegment">readSegment(segments, keywordIndex, keyword)</a> ⇒</dt>
<dd><p>Require a keyword at the expected segment index.</p>
</dd>
<dt><a href="#parseSelectFields">parseSelectFields(fieldClause)</a> ⇒</dt>
<dd><p>Parse the SELECT field list.</p>
</dd>
<dt><a href="#parseTableName">parseTableName(tableClause)</a> ⇒</dt>
<dd><p>Parse the FROM table name.</p>
</dd>
<dt><a href="#parseWhereClause">parseWhereClause(whereClause)</a> ⇒</dt>
<dd><p>Parse the WHERE clause into an AST.</p>
</dd>
<dt><a href="#parseOrderClause">parseOrderClause(orderClause)</a> ⇒</dt>
<dd><p>Parse the ORDER BY clause into sort directives.</p>
</dd>
<dt><a href="#parseLimitClause">parseLimitClause(limitClause)</a> ⇒</dt>
<dd><p>Parse the LIMIT clause.</p>
</dd>
<dt><a href="#validateQuery">validateQuery(query)</a> ⇒</dt>
<dd><p>Validates and parses a SQL-like query structure.
Pass in: fields, table, conditions, order, limit as a query string:
<code>SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}</code></p>
</dd>
</dl>

<a name="QUERY_SEGMENT_PATTERN"></a>

## QUERY\_SEGMENT\_PATTERN
Regex that splits a query into keywords and their value segments.

**Kind**: global constant\
<a name="invalidQuery"></a>

## invalidQuery(message, ...details)
Log and throw a query validation error.

**Kind**: global function\

| Param | Description |
| --- | --- |
| message | The error message. |
| ...details | Additional values to log. |

<a name="splitQuerySegments"></a>

## splitQuerySegments(query) ⇒
Split a SQL-like query into alternating keyword and value segments.

**Kind**: global function\
**Returns**: Trimmed segments after the leading empty split.\

| Param | Description |
| --- | --- |
| query | The full query string. |

<a name="readSegment"></a>

## readSegment(segments, keywordIndex, keyword) ⇒
Require a keyword at the expected segment index.

**Kind**: global function\
**Returns**: The value segment immediately following the keyword.\

| Param | Description |
| --- | --- |
| segments | Query segments from [splitQuerySegments](#splitQuerySegments). |
| keywordIndex | Index of the keyword segment. |
| keyword | Expected keyword text. |

<a name="parseSelectFields"></a>

## parseSelectFields(fieldClause) ⇒
Parse the SELECT field list.

**Kind**: global function\
**Returns**: Normalized field names.\

| Param | Description |
| --- | --- |
| fieldClause | Raw field list text. |

<a name="parseTableName"></a>

## parseTableName(tableClause) ⇒
Parse the FROM table name.

**Kind**: global function\
**Returns**: Normalized table name.\

| Param | Description |
| --- | --- |
| tableClause | Raw table text. |

<a name="parseWhereClause"></a>

## parseWhereClause(whereClause) ⇒
Parse the WHERE clause into an AST.

**Kind**: global function\
**Returns**: Parsed WHERE AST.\

| Param | Description |
| --- | --- |
| whereClause | Raw WHERE text. |

<a name="parseOrderClause"></a>

## parseOrderClause(orderClause) ⇒
Parse the ORDER BY clause into sort directives.

**Kind**: global function\
**Returns**: Validated sort directives.\

| Param | Description |
| --- | --- |
| orderClause | Raw ORDER BY text. |

<a name="parseLimitClause"></a>

## parseLimitClause(limitClause) ⇒
Parse the LIMIT clause.

**Kind**: global function\
**Returns**: Parsed limit.\

| Param | Description |
| --- | --- |
| limitClause | Raw LIMIT text. |

<a name="validateQuery"></a>

## validateQuery(query) ⇒
Validates and parses a SQL-like query structure.
Pass in: fields, table, conditions, order, limit as a query string:
`SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}`

**Kind**: global function\
**Returns**: Parsed SELECT, FROM, WHERE, ORDER BY, and LIMIT parts.\

| Param | Description |
| --- | --- |
| query | The SQL-like query to parse. |

**Example**\
```js
validateQuery('SELECT slug FROM documents WHERE slug IS "home" ORDER BY updateDate DESC LIMIT 10');
// ➜ { fields: ['slug'], table: 'documents', where: { ... }, order: [{ prop: 'updateDate', sort: 'DESC' }], limit: 10 }
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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
```

</details>
