## Functions

<dl>
<dt><a href="#validateQuery">validateQuery(query)</a> ⇒ <code><a href="#ValidateQueryFields">ValidateQueryFields</a></code></dt>
<dd><p>Validates and parses a SQL-like query structure.
Pass in: fields, table, conditions, order, limit as a query string:
<code>SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}</code></p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ValidateQueryOrder">ValidateQueryOrder</a> : <code>object</code></dt>
<dd></dd>
<dt><a href="#ValidateQueryFields">ValidateQueryFields</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="validateQuery"></a>

## validateQuery(query) ⇒ [<code>ValidateQueryFields</code>](#ValidateQueryFields)
Validates and parses a SQL-like query structure.
Pass in: fields, table, conditions, order, limit as a query string:
`SELECT {fields} FROM {table} WHERE {conditions} ORDER BY {order} LIMIT {limit}`

**Kind**: global function  
**Returns**: [<code>ValidateQueryFields</code>](#ValidateQueryFields) - The extrated and validated fields, table, where, order and limit properties.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>string</code> | The conditions on which a document should be returned. |


* [validateQuery(query)](#validateQuery) ⇒ [<code>ValidateQueryFields</code>](#ValidateQueryFields)
    * [~where](#validateQuery..where) : <code>SqlWhereParserAst</code>
    * [~order](#validateQuery..order) : [<code>Array.&lt;ValidateQueryOrder&gt;</code>](#ValidateQueryOrder)

<a name="validateQuery..where"></a>

### validateQuery~where : <code>SqlWhereParserAst</code>
**Kind**: inner property of [<code>validateQuery</code>](#validateQuery)  
<a name="validateQuery..order"></a>

### validateQuery~order : [<code>Array.&lt;ValidateQueryOrder&gt;</code>](#ValidateQueryOrder)
**Kind**: inner constant of [<code>validateQuery</code>](#validateQuery)  
<a name="ValidateQueryOrder"></a>

## ValidateQueryOrder : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| prop | <code>string</code> | The property to sort by. |
| sort | <code>string</code> \| <code>&#x27;ASC&#x27;</code> \| <code>&#x27;DESC&#x27;</code> | The direction to sort. |

<a name="ValidateQueryFields"></a>

## ValidateQueryFields : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| fields | <code>Array.&lt;string&gt;</code> | The fields to return. |
| table | <code>string</code> | The table to query. |
| where | <code>SqlWhereParserAst</code> | The conditions on which a document should be returned. |
| order | [<code>Array.&lt;ValidateQueryOrder&gt;</code>](#ValidateQueryOrder) | The various orders to sort by. |
| limit | <code>number</code> | The maximum number of results to return. |

