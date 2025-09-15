## Classes

<dl>
<dt><a href="#SqlWhereParser">SqlWhereParser</a></dt>
<dd><p>Parses the WHERE portion of an SQL-like string into an abstract syntax tree.
The tree is object-based, where each key is the operator, and its value is an array of the operands.
The number of operands depends on if the operation is defined as unary, binary, or ternary in the config.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#SqlWhereParserConfig">SqlWhereParserConfig</a> : <code>object</code></dt>
<dd></dd>
</dl>

<a name="SqlWhereParser"></a>

## SqlWhereParser
Parses the WHERE portion of an SQL-like string into an abstract syntax tree.
The tree is object-based, where each key is the operator, and its value is an array of the operands.
The number of operands depends on if the operation is defined as unary, binary, or ternary in the config.

**Kind**: global class  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| config | [<code>SqlWhereParserConfig</code>](#SqlWhereParserConfig) | The configuration object. |
| tokenizer | <code>TokenizeThis</code> | The tokenizer instance. |
| operators | <code>object</code> | The operators from config converted to Operator objects. |


* [SqlWhereParser](#SqlWhereParser)
    * [new SqlWhereParser([config])](#new_SqlWhereParser_new)
    * [.tokenizer](#SqlWhereParser+tokenizer) : <code>TokenizeThis</code>
    * [.operators](#SqlWhereParser+operators) : <code>Record.&lt;(string\|symbol), Operator&gt;</code>
    * [.parse](#SqlWhereParser+parse) ⇒ <code>SqlWhereParserAst</code>
    * [.operatorPrecedenceFromValues](#SqlWhereParser+operatorPrecedenceFromValues) ⇒ <code>boolean</code>
    * [.getOperator](#SqlWhereParser+getOperator) ⇒ <code>Operator</code> \| <code>null</code>
    * [.defaultEvaluator](#SqlWhereParser+defaultEvaluator) ⇒ <code>Array.&lt;SqlWhereParserAst&gt;</code> \| <code>SqlWhereParserAst</code>

<a name="new_SqlWhereParser_new"></a>

### new SqlWhereParser([config])
Creates an instance of SqlWhereParser.


| Param | Type | Description |
| --- | --- | --- |
| [config] | [<code>SqlWhereParserConfig</code>](#SqlWhereParserConfig) | A configuration object. |

**Example** *(Init SqlWhereParser)*  
```js
const parser = new SqlWhereParser();
const parsed = parser.parse(sql);
```
<a name="SqlWhereParser+tokenizer"></a>

### sqlWhereParser.tokenizer : <code>TokenizeThis</code>
Tokenizer instance.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)  
<a name="SqlWhereParser+operators"></a>

### sqlWhereParser.operators : <code>Record.&lt;(string\|symbol), Operator&gt;</code>
The operators from config converted to Operator objects.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)  
<a name="SqlWhereParser+parse"></a>

### sqlWhereParser.parse ⇒ <code>SqlWhereParserAst</code>
Parse a SQL statement with an evaluator function. Uses an implementation of the Shunting-Yard Algorithm.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)  
**Returns**: <code>SqlWhereParserAst</code> - The parsed query tree.  
**See**

- [Shunting-Yard_Algorithm (P3G)](https://wcipeg.com/wiki/Shunting_yard_algorithm)
- [Shunting-Yard_Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Shunting-yard_algorithm)


| Param | Type | Description |
| --- | --- | --- |
| sql | <code>string</code> | Query string to process. |
| [evaluator] | <code>SqlWhereParserEvaluator</code> | Function to evaluate operators. |

<a name="SqlWhereParser+operatorPrecedenceFromValues"></a>

### sqlWhereParser.operatorPrecedenceFromValues ⇒ <code>boolean</code>
Returns the precedence order from two values.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)  
**Returns**: <code>boolean</code> - That operatorValue2 precedence is less than or equal to the precedence of operatorValue1.  

| Param | Type | Description |
| --- | --- | --- |
| operatorValue1 | <code>number</code> \| <code>string</code> \| <code>symbol</code> | First operator. |
| operatorValue2 | <code>number</code> \| <code>string</code> \| <code>symbol</code> | Second operator. |

<a name="SqlWhereParser+getOperator"></a>

### sqlWhereParser.getOperator ⇒ <code>Operator</code> \| <code>null</code>
Returns the operator from the string or Symbol provided.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)  
**Returns**: <code>Operator</code> \| <code>null</code> - The operator from the list of operators.  

| Param | Type | Description |
| --- | --- | --- |
| operatorValue | <code>number</code> \| <code>string</code> \| <code>symbol</code> | The operator. |

<a name="SqlWhereParser+defaultEvaluator"></a>

### sqlWhereParser.defaultEvaluator ⇒ <code>Array.&lt;SqlWhereParserAst&gt;</code> \| <code>SqlWhereParserAst</code>
A default fallback evaluator for the parse function.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)  
**Returns**: <code>Array.&lt;SqlWhereParserAst&gt;</code> \| <code>SqlWhereParserAst</code> - Either comma seperated values concated, or an object with the key of the operator and operands as the value.  

| Param | Type | Description |
| --- | --- | --- |
| operatorValue | <code>number</code> \| <code>string</code> \| <code>symbol</code> | The operator to evaluate. |
| operands | <code>Array.&lt;ParserOperand&gt;</code> | The list of operands. |

<a name="SqlWhereParserConfig"></a>

## SqlWhereParserConfig : <code>object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| operators | <code>Array.&lt;Record.&lt;(string\|number\|symbol), (number\|symbol)&gt;&gt;</code> | A collection of operators in precedence order. |
| tokenizer | <code>TokenizeThisConfig</code> | A Tokenizer config. |
| wrapQuery | <code>boolean</code> | Wraps queries in surround parentheses when true. |

