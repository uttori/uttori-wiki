export default Operator;
/**
 * A wrapper class around operators to distinguish them from regular tokens.
 * @property {string | symbol} value The value.
 * @property {number | symbol} type The type of operator.
 * @property {number} precedence Priority to sort the operators with.
 * @example <caption>Init TokenizeThis</caption>
 * const op = new Operator(value, type, precedence);
 * @class
 */
declare class Operator {
    /**
     * Returns a type for a given string.
     * @param {string} type - The type to lookup.
     * @returns {number | symbol} Either number of parameters or Unary Minus Symbol.
     * @static
     */
    static type(type: string): number | symbol;
    /**
     * Creates an instance of Operator.
     * @param {string | symbol} value The value.
     * @param {number | symbol} type The type of operator.
     * @param {number} precedence Priority to sort the operators with.
     * @class
     */
    constructor(value: string | symbol, type: number | symbol, precedence: number);
    /** @type {string | symbol} The value. */
    value: string | symbol;
    /** @type {number | symbol} The type of operator. */
    type: number | symbol;
    /** @type {number} Priority to sort the operators with. */
    precedence: number;
    /**
     * Returns the value as is for JSON.
     * @returns {*} value.
     */
    toJSON(): any;
    /**
     * Returns the value as its string format.
     * @returns {string} String representation of value.
     */
    toString(): string;
}
//# sourceMappingURL=operator.d.ts.map