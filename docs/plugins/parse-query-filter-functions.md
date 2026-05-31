## Functions

<dl>
<dt><a href="#isBetween">isBetween(value, min, max)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if a value is between two bounds.</p>
</dd>
<dt><a href="#isIn">isIn(list, value)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if a value is included in a list.</p>
</dd>
<dt><a href="#toOperands">toOperands(nodeValue)</a> ⇒ <code>Array.&lt;ParserOperand&gt;</code></dt>
<dd><p>Normalize an AST node value to its operand list.</p>
</dd>
<dt><a href="#getFieldValue">getFieldValue(item, fieldOperand)</a> ⇒ <code>unknown</code></dt>
<dd><p>Read a field value from an item using a parser operand as the key.</p>
</dd>
<dt><a href="#toArray">toArray(value)</a> ⇒ <code>Array.&lt;unknown&gt;</code></dt>
<dd><p>Coerce a value to an array for INCLUDES/EXCLUDES checks.</p>
</dd>
<dt><a href="#parseQueryToFilterFunctions">parseQueryToFilterFunctions(ast)</a> ⇒ <code><a href="#QueryFilterFunction">QueryFilterFunction</a></code></dt>
<dd><p>Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
Both <code>+</code> and <code>-</code> should be done in a pre-parser step or before the query is constructed, or after results are returned.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#QueryFilterItem">QueryFilterItem</a> : <code>Record.&lt;string, unknown&gt;</code></dt>
<dd><p>Document-like object passed to query filter functions.</p>
</dd>
<dt><a href="#QueryFilterFunction">QueryFilterFunction</a> ⇒ <code>boolean</code></dt>
<dd></dd>
</dl>

<a name="isBetween"></a>

## isBetween(value, min, max) ⇒ <code>boolean</code>
Checks if a value is between two bounds.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns true if the value is between the min and max.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>unknown</code> | The value to check. |
| min | <code>unknown</code> | The minimum value. |
| max | <code>unknown</code> | The maximum value. |

<a name="isIn"></a>

## isIn(list, value) ⇒ <code>boolean</code>
Checks if a value is included in a list.

**Kind**: global function  
**Returns**: <code>boolean</code> - Returns true if the value is in the list.  

| Param | Type | Description |
| --- | --- | --- |
| list | <code>unknown</code> | The list of values to check. |
| value | <code>unknown</code> | The value to check. |

<a name="toOperands"></a>

## toOperands(nodeValue) ⇒ <code>Array.&lt;ParserOperand&gt;</code>
Normalize an AST node value to its operand list.

**Kind**: global function  
**Returns**: <code>Array.&lt;ParserOperand&gt;</code> - The operands for the operator.  

| Param | Type | Description |
| --- | --- | --- |
| nodeValue | <code>SqlWhereParserValue</code> | The AST node value. |

<a name="getFieldValue"></a>

## getFieldValue(item, fieldOperand) ⇒ <code>unknown</code>
Read a field value from an item using a parser operand as the key.

**Kind**: global function  
**Returns**: <code>unknown</code> - The field value.  

| Param | Type | Description |
| --- | --- | --- |
| item | [<code>QueryFilterItem</code>](#QueryFilterItem) | The item to read from. |
| fieldOperand | <code>ParserOperand</code> | The field name operand. |

<a name="toArray"></a>

## toArray(value) ⇒ <code>Array.&lt;unknown&gt;</code>
Coerce a value to an array for INCLUDES/EXCLUDES checks.

**Kind**: global function  
**Returns**: <code>Array.&lt;unknown&gt;</code> - The normalized array.  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>unknown</code> | The value to normalize. |

<a name="parseQueryToFilterFunctions"></a>

## parseQueryToFilterFunctions(ast) ⇒ [<code>QueryFilterFunction</code>](#QueryFilterFunction)
Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
Both `+` and `-` should be done in a pre-parser step or before the query is constructed, or after results are returned.

**Kind**: global function  
**Returns**: [<code>QueryFilterFunction</code>](#QueryFilterFunction) - The top level filter function.  

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

### parseQueryToFilterFunctions~operations : [<code>Array.&lt;QueryFilterFunction&gt;</code>](#QueryFilterFunction)
**Kind**: inner constant of [<code>parseQueryToFilterFunctions</code>](#parseQueryToFilterFunctions)  
<a name="QueryFilterItem"></a>

## QueryFilterItem : <code>Record.&lt;string, unknown&gt;</code>
Document-like object passed to query filter functions.

**Kind**: global typedef  
<a name="QueryFilterFunction"></a>

## QueryFilterFunction ⇒ <code>boolean</code>
**Kind**: global typedef  
**Returns**: <code>boolean</code> - Whether the item matches the query.  

| Param | Type | Description |
| --- | --- | --- |
| item | [<code>QueryFilterItem</code>](#QueryFilterItem) | The item to test. |

