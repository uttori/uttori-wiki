## Classes

<dl>
<dt><a href="#Operator">Operator</a></dt>
<dd><p>A wrapper class around operators to distinguish them from regular tokens.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#OPERATOR_UNARY_MINUS">OPERATOR_UNARY_MINUS</a></dt>
<dd><p>To distinguish between the binary minus and unary.</p>
</dd>
<dt><a href="#OPERATOR_TYPE_UNARY">OPERATOR_TYPE_UNARY</a></dt>
<dd><p>Number of operands in a unary operation.</p>
</dd>
<dt><a href="#OPERATOR_TYPE_BINARY">OPERATOR_TYPE_BINARY</a></dt>
<dd><p>Number of operands in a binary operation.</p>
</dd>
<dt><a href="#OPERATOR_TYPE_TERNARY">OPERATOR_TYPE_TERNARY</a></dt>
<dd><p>Number of operands in a ternary operation.</p>
</dd>
</dl>

<a name="Operator"></a>

## Operator
A wrapper class around operators to distinguish them from regular tokens.

**Kind**: global class\

* [Operator](#Operator)
    * [new Operator(value, type, precedence)](#new_Operator_new)
    * _instance_
        * [.value](#Operator+value)
        * [.type](#Operator+type)
        * [.precedence](#Operator+precedence)
        * [.toJSON()](#Operator+toJSON) ⇒
        * [.toString()](#Operator+toString) ⇒
    * _static_
        * [.type(type)](#Operator.type) ⇒

<a name="new_Operator_new"></a>

### new Operator(value, type, precedence)
Creates an instance of Operator.


| Param | Description |
| --- | --- |
| value | The value. |
| type | The type of operator. |
| precedence | Priority to sort the operators with. |

**Example** *(Init TokenizeThis)*\
```js
const op = new Operator(value, type, precedence);
```
<a name="Operator+value"></a>

### operator.value
The value.

**Kind**: instance property of [<code>Operator</code>](#Operator)\
<a name="Operator+type"></a>

### operator.type
The type of operator.

**Kind**: instance property of [<code>Operator</code>](#Operator)\
<a name="Operator+precedence"></a>

### operator.precedence
Priority to sort the operators with.

**Kind**: instance property of [<code>Operator</code>](#Operator)\
<a name="Operator+toJSON"></a>

### operator.toJSON() ⇒
Returns the value as is for JSON.

**Kind**: instance method of [<code>Operator</code>](#Operator)\
**Returns**: value.\
<a name="Operator+toString"></a>

### operator.toString() ⇒
Returns the value as its string format.

**Kind**: instance method of [<code>Operator</code>](#Operator)\
**Returns**: String representation of value.\
<a name="Operator.type"></a>

### Operator.type(type) ⇒
Returns a type for a given string.

**Kind**: static method of [<code>Operator</code>](#Operator)\
**Returns**: Either number of parameters or Unary Minus Symbol.\

| Param | Description |
| --- | --- |
| type | The type to lookup. |

<a name="OPERATOR_UNARY_MINUS"></a>

## OPERATOR\_UNARY\_MINUS
To distinguish between the binary minus and unary.

**Kind**: global constant\
<a name="OPERATOR_TYPE_UNARY"></a>

## OPERATOR\_TYPE\_UNARY
Number of operands in a unary operation.

**Kind**: global constant\
<a name="OPERATOR_TYPE_BINARY"></a>

## OPERATOR\_TYPE\_BINARY
Number of operands in a binary operation.

**Kind**: global constant\
<a name="OPERATOR_TYPE_TERNARY"></a>

## OPERATOR\_TYPE\_TERNARY
Number of operands in a ternary operation.

**Kind**: global constant\

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
/**
 * A wrapper class around operators to distinguish them from regular tokens.
 * @example <caption>Init TokenizeThis</caption>
 * const op = new Operator(value, type, precedence);
 */
declare class Operator {
    /** The value. */
    value: string | symbol;
    /** The type of operator. */
    type: number | symbol;
    /** Priority to sort the operators with. */
    precedence: number;
    /**
     * Creates an instance of Operator.
     * @param value The value.
     * @param type The type of operator.
     * @param precedence Priority to sort the operators with.
     */
    constructor(value: string | symbol, type: number | symbol, precedence: number);
    /**
     * Returns the value as is for JSON.
     * @returns value.
     */
    toJSON(): unknown;
    /**
     * Returns the value as its string format.
     * @returns String representation of value.
     */
    toString(): string;
    /**
     * Returns a type for a given string.
     * @param type - The type to lookup.
     * @returns Either number of parameters or Unary Minus Symbol.
     */
    static type(type: string): number | symbol;
}
export default Operator;
```

</details>
