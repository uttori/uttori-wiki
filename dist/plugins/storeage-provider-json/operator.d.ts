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
//# sourceMappingURL=operator.d.ts.map