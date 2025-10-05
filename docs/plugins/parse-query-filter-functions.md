## Functions

<dl>
<dt><a href="#isBetween">isBetween(value, min, max)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if a value is between two bounds.</p>
</dd>
<dt><a href="#isIn">isIn(list, value)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if a value is included in a list.</p>
</dd>
<dt><a href="#parseQueryToFilterFunctions">parseQueryToFilterFunctions(ast)</a> ⇒ <code>function</code></dt>
<dd><p>Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
Both <code>+</code> and <code>-</code> should be done in a pre-parser step or before the query is constructed, or after results are returned.</p>
</dd>
</dl>

<a name="isBetween"></a>

## isBetween(value, min, max) ⇒ <code>boolean</code>
Checks if a value is between two bounds.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns true if the value is between the min and max.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>number</code> | The value to check. |
| min | <code>number</code> | The minimum value. |
| max | <code>number</code> | The maximum value. |

<a name="isIn"></a>

## isIn(list, value) ⇒ <code>boolean</code>
Checks if a value is included in a list.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns true if the value is in the list.  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>Array.&lt;string&gt;</code> | The list of values to check. |
| value | <code>string</code> | The value to check. |

<a name="parseQueryToFilterFunctions"></a>

## parseQueryToFilterFunctions(ast) ⇒ <code>function</code>
Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
Both `+` and `-` should be done in a pre-parser step or before the query is constructed, or after results are returned.

**Kind**: global function  
**Returns**: <code>function</code> - The top level filter function.  

| Param | Type | Description |
| --- | --- | --- |
| ast | <code>SqlWhereParserAst</code> | The parsed output of SqlWhereParser to be filtered. |

**Example** *(parseQueryToFilterFunctions(ast))*  
```js
const whereFunctions = parseQueryToFilterFunctions(ast);
return objects.filter(whereFunctions);
➜ [{ ... }, { ... }, ...]
```
<a name="parseQueryToFilterFunctions..operations"></a>

### parseQueryToFilterFunctions~operations : <code>Array.&lt;function(Record.&lt;string, any&gt;): boolean&gt;</code>
**Kind**: inner constant of [<code>parseQueryToFilterFunctions</code>](#parseQueryToFilterFunctions)  
