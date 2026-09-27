<a name="SqlWhereParser"></a>

## SqlWhereParser
Parses the WHERE portion of an SQL-like string into an abstract syntax tree.
The tree is object-based, where each key is the operator, and its value is an array of the operands.
The number of operands depends on if the operation is defined as unary, binary, or ternary in the config.

**Kind**: global class\

* [SqlWhereParser](#SqlWhereParser)
    * [new SqlWhereParser([config])](#new_SqlWhereParser_new)
    * [.tokenizer](#SqlWhereParser+tokenizer)
    * [.operators](#SqlWhereParser+operators)
    * [.parse](#SqlWhereParser+parse) ⇒
    * [.operatorPrecedenceFromValues](#SqlWhereParser+operatorPrecedenceFromValues) ⇒
    * [.getOperator](#SqlWhereParser+getOperator) ⇒
    * [.defaultEvaluator](#SqlWhereParser+defaultEvaluator) ⇒

<a name="new_SqlWhereParser_new"></a>

### new SqlWhereParser([config])
Creates an instance of SqlWhereParser.


| Param | Description |
| --- | --- |
| [config] | A configuration object. |

**Example** *(Init SqlWhereParser)*\
```js
const parser = new SqlWhereParser();
const parsed = parser.parse(sql);
```
<a name="SqlWhereParser+tokenizer"></a>

### sqlWhereParser.tokenizer
Tokenizer instance.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)\
<a name="SqlWhereParser+operators"></a>

### sqlWhereParser.operators
The operators from config converted to Operator objects.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)\
<a name="SqlWhereParser+parse"></a>

### sqlWhereParser.parse ⇒
Parse a SQL statement with an evaluator function. Uses an implementation of the Shunting-Yard Algorithm.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)\
**Returns**: The parsed query tree.\
**See**

- [Shunting-Yard_Algorithm (P3G)](https://wcipeg.com/wiki/Shunting_yard_algorithm)
- [Shunting-Yard_Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Shunting-yard_algorithm)


| Param | Description |
| --- | --- |
| sql | Query string to process. |
| [evaluator] | Function to evaluate operators. |

<a name="SqlWhereParser+operatorPrecedenceFromValues"></a>

### sqlWhereParser.operatorPrecedenceFromValues ⇒
Returns the precedence order from two values.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)\
**Returns**: That operatorValue2 precedence is less than or equal to the precedence of operatorValue1.\

| Param | Description |
| --- | --- |
| operatorValue1 | First operator. |
| operatorValue2 | Second operator. |

<a name="SqlWhereParser+getOperator"></a>

### sqlWhereParser.getOperator ⇒
Returns the operator from the string or Symbol provided.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)\
**Returns**: The operator from the list of operators.\

| Param | Description |
| --- | --- |
| operatorValue | The operator. |

<a name="SqlWhereParser+defaultEvaluator"></a>

### sqlWhereParser.defaultEvaluator ⇒
A default fallback evaluator for the parse function.

**Kind**: instance property of [<code>SqlWhereParser</code>](#SqlWhereParser)\
**Returns**: Either comma seperated values concated, or an object with the key of the operator and operands as the value.\

| Param | Description |
| --- | --- |
| operatorValue | The operator to evaluate. |
| operands | The list of operands. |

## TypeScript declarations

<details>
<summary>View documented types and signatures</summary>

```typescript
import Operator from './operator.js';
import type { SqlWhereParserEvaluator, ParserOperand } from '../../custom.js';
import type { SqlWhereParserConfig } from '../../types/plugins/storeage-provider-json/where-parser.js';
export type { SqlWhereParserConfig } from '../../types/plugins/storeage-provider-json/where-parser.js';
/**
 * Parses the WHERE portion of an SQL-like string into an abstract syntax tree.
 * The tree is object-based, where each key is the operator, and its value is an array of the operands.
 * The number of operands depends on if the operation is defined as unary, binary, or ternary in the config.
 * @example <caption>Init SqlWhereParser</caption>
 * const parser = new SqlWhereParser();
 * const parsed = parser.parse(sql);
 */
declare class SqlWhereParser {
    /** Tokenizer instance. */
    tokenizer: import('./tokenizer.js').TokenizeThis;
    /** The operators from config converted to Operator objects. */
    operators: Record<string | symbol, Operator>;
    /** The configuration object. */
    config: SqlWhereParserConfig;
    /**
     * Creates an instance of SqlWhereParser.
     * @param [config] - A configuration object.
     */
    constructor(config?: SqlWhereParserConfig);
    /**
     * Parse a SQL statement with an evaluator function. Uses an implementation of the Shunting-Yard Algorithm.
     * @param sql Query string to process.
     * @param [evaluator] Function to evaluate operators.
     * @returns The parsed query tree.
     * @see {@link https://wcipeg.com/wiki/Shunting_yard_algorithm|Shunting-Yard_Algorithm (P3G)}
     * @see {@link https://en.wikipedia.org/wiki/Shunting-yard_algorithm|Shunting-Yard_Algorithm (Wikipedia)}
     */
    parse: (sql: string, evaluator?: SqlWhereParserEvaluator) => ParserOperand;
    /**
     * Returns the precedence order from two values.
     * @param operatorValue1 First operator.
     * @param operatorValue2 Second operator.
     * @returns That operatorValue2 precedence is less than or equal to the precedence of operatorValue1.
     */
    operatorPrecedenceFromValues: (operatorValue1: number | string | symbol, operatorValue2: number | string | symbol) => boolean;
    /**
     * Returns the operator from the string or Symbol provided.
     * @param operatorValue The operator.
     * @returns The operator from the list of operators.
     */
    getOperator: (operatorValue: number | string | symbol) => Operator | null;
    /**
     * A default fallback evaluator for the parse function.
     * @param operatorValue The operator to evaluate.
     * @param operands The list of operands.
     * @returns Either comma seperated values concated, or an object with the key of the operator and operands as the value.
     */
    static defaultEvaluator: (operatorValue: number | string | symbol, operands: ParserOperand[]) => ParserOperand;
}
export default SqlWhereParser;

export interface SqlWhereParserConfig {
    /** A collection of operators in precedence order. */
    operators: Record<string | number | symbol, number | symbol>[];
    /** A Tokenizer config. */
    tokenizer: import('../../../plugins/storeage-provider-json/tokenizer.js').TokenizeThisConfig;
    /** Wraps queries in surround parentheses when true. */
    wrapQuery: boolean;
}
```

</details>
