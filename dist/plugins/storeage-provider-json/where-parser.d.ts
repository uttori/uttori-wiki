export default SqlWhereParser;
export type SqlWhereParserConfig = {
    /**
     * A collection of operators in precedence order.
     */
    operators: Array<Record<string | number | symbol, number | symbol>>;
    /**
     * A Tokenizer config.
     */
    tokenizer: import("./tokenizer.js").TokenizeThisConfig;
    /**
     * Wraps queries in surround parentheses when true.
     */
    wrapQuery: boolean;
};
/**
 * @typedef {object} SqlWhereParserConfig
 * @property {Array<Record<string | number | symbol, number | symbol>>} operators A collection of operators in precedence order.
 * @property {import('./tokenizer.js').TokenizeThisConfig} tokenizer A Tokenizer config.
 * @property {boolean} wrapQuery Wraps queries in surround parentheses when true.
 */
/**
 * Parses the WHERE portion of an SQL-like string into an abstract syntax tree.
 * The tree is object-based, where each key is the operator, and its value is an array of the operands.
 * The number of operands depends on if the operation is defined as unary, binary, or ternary in the config.
 * @property {SqlWhereParserConfig} config The configuration object.
 * @property {import('./tokenizer.js').TokenizeThis} tokenizer The tokenizer instance.
 * @property {object} operators The operators from config converted to Operator objects.
 * @example <caption>Init SqlWhereParser</caption>
 * const parser = new SqlWhereParser();
 * const parsed = parser.parse(sql);
 * @class
 */
declare class SqlWhereParser {
    /**
     * A default fallback evaluator for the parse function.
     * @param {number|string|symbol} operatorValue The operator to evaluate.
     * @param {Array<import('../../../dist/custom.d.ts').ParserOperand>} operands The list of operands.
     * @returns {Array<import('../../../dist/custom.d.ts').SqlWhereParserAst>|import('../../../dist/custom.d.ts').SqlWhereParserAst} Either comma seperated values concated, or an object with the key of the operator and operands as the value.
     */
    static defaultEvaluator: (operatorValue: number | string | symbol, operands: Array<import("../../../dist/custom.d.ts").ParserOperand>) => Array<import("../../../dist/custom.d.ts").SqlWhereParserAst> | import("../../../dist/custom.d.ts").SqlWhereParserAst;
    /**
     * Creates an instance of SqlWhereParser.
     * @param {SqlWhereParserConfig} [config] - A configuration object.
     * @class
     */
    constructor(config?: SqlWhereParserConfig);
    /** @type {import('./tokenizer.js').TokenizeThis} Tokenizer instance. */
    tokenizer: import("./tokenizer.js").TokenizeThis;
    /** @type {Record<string | symbol, Operator>} The operators from config converted to Operator objects. */
    operators: Record<string | symbol, Operator>;
    config: SqlWhereParserConfig;
    /**
     * Parse a SQL statement with an evaluator function. Uses an implementation of the Shunting-Yard Algorithm.
     * @param {string} sql Query string to process.
     * @param {import('../../../dist/custom.d.ts').SqlWhereParserEvaluator} [evaluator] Function to evaluate operators.
     * @returns {import('../../../dist/custom.d.ts').SqlWhereParserAst} The parsed query tree.
     * @see {@link https://wcipeg.com/wiki/Shunting_yard_algorithm|Shunting-Yard_Algorithm (P3G)}
     * @see {@link https://en.wikipedia.org/wiki/Shunting-yard_algorithm|Shunting-Yard_Algorithm (Wikipedia)}
     */
    parse: (sql: string, evaluator?: import("../../../dist/custom.d.ts").SqlWhereParserEvaluator) => import("../../../dist/custom.d.ts").SqlWhereParserAst;
    /**
     * Returns the precedence order from two values.
     * @param {number|string|symbol} operatorValue1 First operator.
     * @param {number|string|symbol} operatorValue2 Second operator.
     * @returns {boolean} That operatorValue2 precedence is less than or equal to the precedence of operatorValue1.
     */
    operatorPrecedenceFromValues: (operatorValue1: number | string | symbol, operatorValue2: number | string | symbol) => boolean;
    /**
     * Returns the operator from the string or Symbol provided.
     * @param {number|string|symbol} operatorValue The operator.
     * @returns {Operator|null} The operator from the list of operators.
     */
    getOperator: (operatorValue: number | string | symbol) => Operator | null;
}
import Operator from './operator.js';
//# sourceMappingURL=where-parser.d.ts.map