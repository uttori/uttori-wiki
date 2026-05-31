## Constants

<dl>
<dt><a href="#QUERY_SEGMENT_PATTERN">QUERY_SEGMENT_PATTERN</a></dt>
<dd><p>Regex that splits a query into keywords and their value segments.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#invalidQuery">invalidQuery(message, ...details)</a> ⇒ <code>never</code></dt>
<dd><p>Log and throw a query validation error.</p>
</dd>
<dt><a href="#splitQuerySegments">splitQuerySegments(query)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Split a SQL-like query into alternating keyword and value segments.</p>
</dd>
<dt><a href="#readSegment">readSegment(segments, keywordIndex, keyword)</a> ⇒ <code>string</code></dt>
<dd><p>Require a keyword at the expected segment index.</p>
</dd>
<dt><a href="#parseSelectFields">parseSelectFields(fieldClause)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Parse the SELECT field list.</p>
</dd>
<dt><a href="#parseTableName">parseTableName(tableClause)</a> ⇒ <code>string</code></dt>
<dd><p>Parse the FROM table name.</p>
</dd>
<dt><a href="#parseWhereClause">parseWhereClause(whereClause)</a> ⇒ <code>SqlWhereParserAst</code></dt>
<dd><p>Parse the WHERE clause into an AST.</p>
</dd>
<dt><a href="#parseOrderClause">parseOrderClause(orderClause)</a> ⇒ <code><a href="#ValidatedQueryOrder">Array.&lt;ValidatedQueryOrder&gt;</a></code></dt>
<dd><p>Parse the ORDER BY clause into sort directives.</p>
</dd>
<dt><a href="#parseLimitClause">parseLimitClause(limitClause)</a> ⇒ <code>number</code></dt>
<dd><p>Parse the LIMIT clause.</p>
</dd>
<dt><a href="#validateQuery">validateQuery(query)</a> ⇒ <code><a href="#ValidatedQuery">ValidatedQuery</a></code></dt>
<dd><p>Validates and parses a SQL-like query structure.
Pass in: fields, table, conditions, order, limit as a query string:
<code>SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}</code></p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ValidatedQueryOrder">ValidatedQueryOrder</a> : <code>object</code></dt>
<dd><p>A single ORDER BY directive from a validated query.</p>
</dd>
<dt><a href="#ValidatedQuery">ValidatedQuery</a> : <code>object</code></dt>
<dd><p>Parsed and validated pieces of a SQL-like storage query.</p>
</dd>
</dl>

<a name="QUERY_SEGMENT_PATTERN"></a>

## QUERY\_SEGMENT\_PATTERN
Regex that splits a query into keywords and their value segments.

**Kind**: global constant  
<a name="invalidQuery"></a>

## invalidQuery(message, ...details) ⇒ <code>never</code>
Log and throw a query validation error.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The error message. |
| ...details | <code>unknown</code> | Additional values to log. |

<a name="splitQuerySegments"></a>

## splitQuerySegments(query) ⇒ <code>Array.&lt;string&gt;</code>
Split a SQL-like query into alternating keyword and value segments.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Trimmed segments after the leading empty split.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The full query string. |

<a name="splitQuerySegments..segments"></a>

### splitQuerySegments~segments : <code>Array.&lt;string&gt;</code>
**Kind**: inner constant of [<code>splitQuerySegments</code>](#splitQuerySegments)  
<a name="readSegment"></a>

## readSegment(segments, keywordIndex, keyword) ⇒ <code>string</code>
Require a keyword at the expected segment index.

**Kind**: global function  
**Returns**: <code>string</code> - The value segment immediately following the keyword.  

| Param | Type | Description |
| --- | --- | --- |
| segments | <code>Array.&lt;string&gt;</code> | Query segments from [splitQuerySegments](#splitQuerySegments). |
| keywordIndex | <code>number</code> | Index of the keyword segment. |
| keyword | <code>string</code> | Expected keyword text. |

<a name="parseSelectFields"></a>

## parseSelectFields(fieldClause) ⇒ <code>Array.&lt;string&gt;</code>
Parse the SELECT field list.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Normalized field names.  

| Param | Type | Description |
| --- | --- | --- |
| fieldClause | <code>string</code> | Raw field list text. |

<a name="parseTableName"></a>

## parseTableName(tableClause) ⇒ <code>string</code>
Parse the FROM table name.

**Kind**: global function  
**Returns**: <code>string</code> - Normalized table name.  

| Param | Type | Description |
| --- | --- | --- |
| tableClause | <code>string</code> | Raw table text. |

<a name="parseWhereClause"></a>

## parseWhereClause(whereClause) ⇒ <code>SqlWhereParserAst</code>
Parse the WHERE clause into an AST.

**Kind**: global function  
**Returns**: <code>SqlWhereParserAst</code> - Parsed WHERE AST.  

| Param | Type | Description |
| --- | --- | --- |
| whereClause | <code>string</code> | Raw WHERE text. |

<a name="parseOrderClause"></a>

## parseOrderClause(orderClause) ⇒ [<code>Array.&lt;ValidatedQueryOrder&gt;</code>](#ValidatedQueryOrder)
Parse the ORDER BY clause into sort directives.

**Kind**: global function  
**Returns**: [<code>Array.&lt;ValidatedQueryOrder&gt;</code>](#ValidatedQueryOrder) - Validated sort directives.  

| Param | Type | Description |
| --- | --- | --- |
| orderClause | <code>string</code> | Raw ORDER BY text. |

<a name="parseOrderClause..order"></a>

### parseOrderClause~order : [<code>Array.&lt;ValidatedQueryOrder&gt;</code>](#ValidatedQueryOrder)
**Kind**: inner constant of [<code>parseOrderClause</code>](#parseOrderClause)  
<a name="parseLimitClause"></a>

## parseLimitClause(limitClause) ⇒ <code>number</code>
Parse the LIMIT clause.

**Kind**: global function  
**Returns**: <code>number</code> - Parsed limit.  

| Param | Type | Description |
| --- | --- | --- |
| limitClause | <code>string</code> | Raw LIMIT text. |

<a name="validateQuery"></a>

## validateQuery(query) ⇒ [<code>ValidatedQuery</code>](#ValidatedQuery)
Validates and parses a SQL-like query structure.
Pass in: fields, table, conditions, order, limit as a query string:
`SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}`

**Kind**: global function  
**Returns**: [<code>ValidatedQuery</code>](#ValidatedQuery) - Parsed SELECT, FROM, WHERE, ORDER BY, and LIMIT parts.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The SQL-like query to parse. |

**Example**  
```js
validateQuery('SELECT slug FROM documents WHERE slug IS "home" ORDER BY updateDate DESC LIMIT 10');
// ➜ { fields: ['slug'], table: 'documents', where: { ... }, order: [{ prop: 'updateDate', sort: 'DESC' }], limit: 10 }
```
<a name="ValidatedQueryOrder"></a>

## ValidatedQueryOrder : <code>object</code>
A single ORDER BY directive from a validated query.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| prop | <code>string</code> | Property to sort by (`RANDOM` selects random order). |
| sort | <code>&#x27;ASC&#x27;</code> \| <code>&#x27;DESC&#x27;</code> | Sort direction. |

<a name="ValidatedQuery"></a>

## ValidatedQuery : <code>object</code>
Parsed and validated pieces of a SQL-like storage query.

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| fields | <code>Array.&lt;string&gt;</code> | Selected field names from the SELECT clause. |
| table | <code>string</code> | Source table name from the FROM clause. |
| where | <code>SqlWhereParserAst</code> | Parsed WHERE clause AST. |
| order | [<code>Array.&lt;ValidatedQueryOrder&gt;</code>](#ValidatedQueryOrder) | Sort directives from the ORDER BY clause. |
| limit | <code>number</code> | Maximum number of results from the LIMIT clause. |

