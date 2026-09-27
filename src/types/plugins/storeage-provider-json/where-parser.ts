export interface SqlWhereParserConfig {
  /** A collection of operators in precedence order. */
  operators: Record<string | number | symbol, number | symbol>[];
  /** A Tokenizer config. */
  tokenizer: import('../../../plugins/storeage-provider-json/tokenizer.js').TokenizeThisConfig;
  /** Wraps queries in surround parentheses when true. */
  wrapQuery: boolean;
}
