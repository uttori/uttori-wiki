/** To distinguish between the binary minus and unary. */
const OPERATOR_UNARY_MINUS = Symbol('-');

/** Number of operands in a unary operation. */
const OPERATOR_TYPE_UNARY = 1;

/** Number of operands in a binary operation. */
const OPERATOR_TYPE_BINARY = 2;

/** Number of operands in a ternary operation. */
const OPERATOR_TYPE_TERNARY = 3;

/**
 * A wrapper class around operators to distinguish them from regular tokens.
 * @example <caption>Init TokenizeThis</caption>
 * const op = new Operator(value, type, precedence);
 */
class Operator {
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
  constructor(value: string | symbol, type: number | symbol, precedence: number) {
    this.value = value;
    this.type = type;
    this.precedence = precedence;
  }

  /**
   * Returns the value as is for JSON.
   * @returns value.
   */
  toJSON(): unknown {
    return this.value;
  }

  /**
   * Returns the value as its string format.
   * @returns String representation of value.
   */
  toString(): string {
    return String(this.value);
  }

  /**
   * Returns a type for a given string.
   * @param type - The type to lookup.
   * @returns Either number of parameters or Unary Minus Symbol.
   */
  static type(type: string): number | symbol {
    switch (type) {
      case 'unary':
        return OPERATOR_TYPE_UNARY;
      case 'binary':
        return OPERATOR_TYPE_BINARY;
      case 'ternary':
        return OPERATOR_TYPE_TERNARY;
      case 'unary-minus':
        return OPERATOR_UNARY_MINUS;
      default:
        throw new Error(`Unknown Operator Type: ${type}`);
    }
  }
}

export default Operator;
