/**
 * To distinguish between the binary minus and unary.
 */
const OPERATOR_UNARY_MINUS = Symbol('-');

/**
 * Number of operands in a unary operation.
 */
const OPERATOR_TYPE_UNARY = 1;

/**
 * Number of operands in a binary operation.
 */
const OPERATOR_TYPE_BINARY = 2;

/**
 * Number of operands in a ternary operation.
 */
const OPERATOR_TYPE_TERNARY = 3;

/**
 * A wrapper class around operators to distinguish them from regular tokens.
 * @property {string | symbol} value The value.
 * @property {number | symbol} type The type of operator.
 * @property {number} precedence Priority to sort the operators with.
 * @example <caption>Init TokenizeThis</caption>
 * const op = new Operator(value, type, precedence);
 * @class
 */
class Operator {
  /** @type {string | symbol} The value. */
  value;

  /** @type {number | symbol} The type of operator. */
  type;

  /** @type {number} Priority to sort the operators with. */
  precedence;

  /**
   * Creates an instance of Operator.
   * @param {string | symbol} value The value.
   * @param {number | symbol} type The type of operator.
   * @param {number} precedence Priority to sort the operators with.
   * @class
   */
  constructor(value, type, precedence) {
    this.value = value;
    this.type = type;
    this.precedence = precedence;
  }

  /**
   * Returns the value as is for JSON.
   * @returns {*} value.
   */
  toJSON() {
    return this.value;
  }

  /**
   * Returns the value as its string format.
   * @returns {string} String representation of value.
   */
  toString() {
    return String(this.value);
  }

  /**
   * Returns a type for a given string.
   * @param {string} type - The type to lookup.
   * @returns {number | symbol} Either number of parameters or Unary Minus Symbol.
   * @static
   */
  static type(type) {
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
