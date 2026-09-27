## Functions

<dl>
<dt><a href="#isBetween">isBetween(value, min, max)</a> ⇒</dt>
<dd><p>Checks if a value is between two bounds.</p>
</dd>
<dt><a href="#isIn">isIn(list, value)</a> ⇒</dt>
<dd><p>Checks if a value is included in a list.</p>
</dd>
<dt><a href="#toOperands">toOperands(nodeValue)</a> ⇒</dt>
<dd><p>Normalize an AST node value to its operand list.</p>
</dd>
<dt><a href="#getFieldValue">getFieldValue(item, fieldOperand)</a> ⇒</dt>
<dd><p>Read a field value from an item using a parser operand as the key.</p>
</dd>
<dt><a href="#toArray">toArray(value)</a> ⇒</dt>
<dd><p>Coerce a value to an array for INCLUDES/EXCLUDES checks.</p>
</dd>
<dt><a href="#parseQueryToFilterFunctions">parseQueryToFilterFunctions(ast)</a> ⇒</dt>
<dd><p>Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
Both <code>+</code> and <code>-</code> should be done in a pre-parser step or before the query is constructed, or after results are returned.</p>
</dd>
</dl>

<a name="isBetween"></a>

## isBetween(value, min, max) ⇒
Checks if a value is between two bounds.

**Kind**: global function\
**Returns**: Returns true if the value is between the min and max.\

| Param | Description |
| --- | --- |
| value | The value to check. |
| min | The minimum value. |
| max | The maximum value. |

<a name="isIn"></a>

## isIn(list, value) ⇒
Checks if a value is included in a list.

**Kind**: global function\
**Returns**: Returns true if the value is in the list.\

| Param | Description |
| --- | --- |
| list | The list of values to check. |
| value | The value to check. |

<a name="toOperands"></a>

## toOperands(nodeValue) ⇒
Normalize an AST node value to its operand list.

**Kind**: global function\
**Returns**: The operands for the operator.\

| Param | Description |
| --- | --- |
| nodeValue | The AST node value. |

<a name="getFieldValue"></a>

## getFieldValue(item, fieldOperand) ⇒
Read a field value from an item using a parser operand as the key.

**Kind**: global function\
**Returns**: The field value.\

| Param | Description |
| --- | --- |
| item | The item to read from. |
| fieldOperand | The field name operand. |

<a name="toArray"></a>

## toArray(value) ⇒
Coerce a value to an array for INCLUDES/EXCLUDES checks.

**Kind**: global function\
**Returns**: The normalized array.\

| Param | Description |
| --- | --- |
| value | The value to normalize. |

<a name="parseQueryToFilterFunctions"></a>

## parseQueryToFilterFunctions(ast) ⇒
Using default SQL tree output, iterate over that to convert to items to be checked group by group (AND, OR), prop by prop to filter functions.
Both `+` and `-` should be done in a pre-parser step or before the query is constructed, or after results are returned.

**Kind**: global function\
**Returns**: The top level filter function.\

| Param | Description |
| --- | --- |
| ast | The parsed output of SqlWhereParser to be filtered. |

**Example** *(parseQueryToFilterFunctions(ast))*\
```js
const whereFunctions = parseQueryToFilterFunctions(ast);
return objects.filter(whereFunctions);
➜ [{ ... }, { ... }, ...]
```

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
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

/** Document-like object passed to query filter functions. */
export type QueryFilterItem = Record<string, unknown>;
export type QueryFilterFunction = (item: QueryFilterItem) => boolean;
```

</details>
