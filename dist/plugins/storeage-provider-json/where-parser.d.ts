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
//# sourceMappingURL=where-parser.d.ts.map