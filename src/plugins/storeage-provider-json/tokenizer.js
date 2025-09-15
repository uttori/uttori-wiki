// let debug = (..._) => {};
/* c8 ignore next 2 */
// try { const { default: d } = await import('debug'); debug = d('Uttori.Tokenizer'); } catch {}

const MODE_NONE = 'modeNone';
const MODE_DEFAULT = 'modeDefault';
const MODE_MATCH = 'modeMatch';

/**
 * Parse a string into a token structure.
 * Create an instance of this class for each new string you wish to parse.
 * @property {TokenizeThis} factory Holds the processed configuration.
 * @property {string} str The string to tokenize.
 * @property {Function} forEachToken The function to call for teach token.
 * @property {string} previousCharacter The previous character consumed.
 * @property {string} toMatch The current quote to match.
 * @property {string} currentToken The current token being created.
 * @property {string[]} modeStack Keeps track of the current "mode" of tokenization. The tokenization rules are different depending if you are tokenizing an explicit string (surrounded by quotes), versus a non-explicit string (not surrounded by quotes).
 * @example <caption>Init Tokenizer</caption>
 * const tokenizerInstance = new Tokenizer(this, str, forEachToken);
 * return tokenizerInstance.tokenize();
 * @class
 */
class Tokenizer {
  /** @type {TokenizeThis} Holds the processed configuration. */
  factory;

  /** @type {string} The string to tokenize. */
  str;

  /** @type {Function} The function to call for teach token. */
  forEachToken;

  /** @type {string} The previous character consumed. */
  previousCharacter = '';

  /** @type {string} The current quote to match. */
  toMatch = '';

  /** @type {string} The current token being created. */
  currentToken = '';

  /** @type {Array<'modeNone' | 'modeDefault' | 'modeMatch'>} Keeps track of the current "mode" of tokenization. The tokenization rules are different depending if you are tokenizing an explicit string (surrounded by quotes), versus a non-explicit string (not surrounded by quotes). */
  modeStack = [MODE_NONE];

  /**
   * @param {TokenizeThis} factory Holds the processed configuration.
   * @param {string} str The string to tokenize.
   * @param {function((null | true | false | number | string), string): void} forEachToken The function to call for teach token.
   */
  constructor(factory, str, forEachToken) {
    this.factory = factory;
    this.str = str;
    this.forEachToken = forEachToken;
  }

  /**
   * Get the current mode from the stack.
   * @returns {('modeNone' | 'modeDefault' | 'modeMatch' | string)} The current mode from the stack.
   */
  getCurrentMode() {
    // debug('getCurrentMode:', mode);
    return this.modeStack[this.modeStack.length - 1];
  }

  /**
   * Set the current mode on the stack.
   * @param {'modeNone' | 'modeDefault' | 'modeMatch'} mode The mode to set on the stack.
   * @returns {number} The size of the mode stack.
   */
  setCurrentMode(mode) {
    // debug('setCurrentMode:', mode);
    return this.modeStack.push(mode);
  }

  /**
   * Ends the current mode and removes it from the stack.
   * @returns {string | undefined} The last mode of the stack.
   */
  completeCurrentMode() {
    // debug('completeCurrentMode');
    const currentMode = this.getCurrentMode();

    if (currentMode === MODE_DEFAULT) {
      this.pushDefaultModeTokenizables();
    }

    // Don't push out empty tokens, unless they were an explicit string, e.g. ""
    if ((currentMode === MODE_MATCH && this.currentToken === '') || this.currentToken !== '') {
      this.push(this.currentToken);
    }
    this.currentToken = '';

    return this.modeStack.pop();
  }

  /**
   * Parse the provided token.
   * @param {string} token The token to parse.
   */
  push(token) {
    // debug('push:', token);
    let surroundedBy = '';

    /** @type {null | true | false | number | string}  */
    let newToken = token;
    if (this.factory.config.convertLiterals && this.getCurrentMode() !== MODE_MATCH) {
      newToken = this.convertToken(token);
    } else {
      // The purpose of also transmitting the surroundedBy quote is to inform whether or not
      // the token was an explicit string, versus a non-explicit string, e.g. "=" vs. =
      surroundedBy = this.toMatch;
    }

    this.forEachToken?.(newToken, surroundedBy);
  }

  /**
   * Convert the string version of literals into their literal types.
   * @param {string} token The token to convert.
   * @returns {null | true | false | number | string} The converted token.
   */
  convertToken(token) {
    // debug('convertToken:', token);
    const lowerToken = token.toLowerCase();
    if (lowerToken === 'null') {
      return null;
    }
    if (lowerToken === 'true') {
      return true;
    }
    if (lowerToken === 'false') {
      return false;
    }
    const number = Number(token);
    return Number.isFinite(number) ? number : token;
  }

  /**
   * Process the string.
   */
  tokenize() {
    // debug('tokenize');
    [...this.str].forEach((character) => this.consume(character));
    while (this.getCurrentMode() !== MODE_NONE) {
      // debug(`tokenize: ${this.currentToken}`);
      this.completeCurrentMode();
    }
  }

  /**
   * Adds a character with the current mode.
   * @param {string} character The character to process.
   */
  consume(character) {
    // debug(`consume: "${character}"`);

    this[this.getCurrentMode()](character);
    this.previousCharacter = character;
  }

  /**
   * Changes the current mode depending on the character.
   * @param {string} character The character to consider.
   */
  [MODE_NONE](character) {
    // debug(`[${MODE_NONE}]: "${character}"`);
    if (!this.factory.matchMap.has(character)) {
      this.setCurrentMode(MODE_DEFAULT);
      this.consume(character);
      return;
    }

    this.setCurrentMode(MODE_MATCH);
    this.toMatch = character;
  }

  /**
   * Checks the token for delimiter or quotes, else continue building token.
   * @param {string} character The character to consider.
   * @returns {string | undefined} The current token.
   */
  [MODE_DEFAULT](character) {
    // debug(`[${MODE_DEFAULT}]: "${character}"`);
    // If we encounter a delimiter, its time to push out the current token.
    if (this.factory.delimiterMap.has(character)) {
      return this.completeCurrentMode();
    }

    // If we encounter a quote, only push out the current token if there's a sub-token directly before it.
    if (this.factory.matchMap.has(character)) {
      let tokenizeIndex = 0;

      while (tokenizeIndex < this.factory.tokenizeList.length) {
        if (this.currentToken.endsWith(this.factory.tokenizeList[tokenizeIndex++])) {
          this.completeCurrentMode();
          this.consume(character);
          // eslint-disable-next-line consistent-return
          return;
        }
      }
    }

    this.currentToken += character;

    return this.currentToken;
  }

  /**
   * Parse out potential tokenizable substrings out of the current token.
   */
  pushDefaultModeTokenizables() {
    // debug('pushDefaultModeTokenizables');
    let tokenizeIndex = 0;
    let lowestIndexOfTokenize = Infinity;
    let toTokenize = null;

    // Iterate through the list of tokenizable substrings.
    while (this.currentToken && tokenizeIndex < this.factory.tokenizeList.length) {
      const tokenize = this.factory.tokenizeList[tokenizeIndex++];
      const indexOfTokenize = this.currentToken.indexOf(tokenize);

      // Find the substring closest to the beginning of the current token.
      if (indexOfTokenize !== -1 && indexOfTokenize < lowestIndexOfTokenize) {
        lowestIndexOfTokenize = indexOfTokenize;
        toTokenize = tokenize;
      }
    }

    // No substrings to tokenize. You're done.
    if (!toTokenize) {
      return;
    }

    // A substring was found, but not at the very beginning of the string, e.g. A=B, where "=" is the substring.
    // This will push out "A" first.
    if (lowestIndexOfTokenize > 0) {
      this.push(this.currentToken.slice(0, lowestIndexOfTokenize));
    }

    // Push out the substring, then modify the current token to be everything past that substring.
    // Recursively call this function again until there are no more substrings to tokenize.
    if (lowestIndexOfTokenize !== -1) {
      this.push(toTokenize);
      this.currentToken = this.currentToken.slice(lowestIndexOfTokenize + toTokenize.length);
      this.pushDefaultModeTokenizables();
    }
  }

  /**
   * Checks for a completed match between characters.
   * @param {string} character The character to match.
   * @returns {string | undefined} The current token.
   */
  [MODE_MATCH](character) {
    // debug(`[${MODE_MATCH}]: "${character}"`);
    if (character === this.toMatch) {
      if (this.previousCharacter !== this.factory.config.escapeCharacter) {
        return this.completeCurrentMode();
      }
      this.currentToken = this.currentToken.slice(0, this.currentToken.length - 1);
    }

    this.currentToken += character;

    return this.currentToken;
  }
}

/**
 * Sorts the tokenizable substrings by their length DESC.
 * @param {string} a Substring A
 * @param {string} b Substring B
 * @returns {number} -1 if A is longer than B, 1 if B is longer than A, else 0.
 */
const sortTokenizableSubstrings = (a, b) => {
  if (a.length > b.length) {
    return -1;
  }
  if (a.length < b.length) {
    return 1;
  }
  return 0;
};

/**
 * @typedef {object} TokenizeThisConfig
 * @property {string[]} [shouldTokenize] The list of tokenizable substrings.
 * @property {string[]} [shouldMatch] The list of quotes to match explicit strings with.
 * @property {string[]} [shouldDelimitBy] The list of delimiters.
 * @property {boolean} convertLiterals If literals should be converted or not, ie 'true' -> true.
 * @property {string} escapeCharacter Character to use as an escape in strings.
 */

/**
 * Takes in the config, processes it, and creates tokenizer instances based on that config.
 * @property {TokenizeThisConfig} config The configuration object.
 * @property {boolean} convertLiterals If literals should be converted or not, ie 'true' -> true.
 * @property {string} escapeCharacter Character to use as an escape in strings.
 * @property {string[]} tokenizeList Holds the list of tokenizable substrings.
 * @property {object} tokenizeMap Holds an easy lookup map of tokenizable substrings.
 * @property {object} matchList Holds the list of quotes to match explicit strings with.
 * @property {object} matchMap Holds an easy lookup map of quotes to match explicit strings with.
 * @property {object} delimiterList Holds the list of delimiters.
 * @property {object} delimiterMap Holds an easy lookup map of delimiters.
 * @example <caption>Init TokenizeThis</caption>
 * const tokenizer = new TokenizeThis(config.tokenizer);
 * this.tokenizer.tokenize('(sql)', (token, surroundedBy) => { ... });
 * @class
 */
export class TokenizeThis {
  /** @type {boolean} If literals should be converted or not, ie 'true' -> true. */
  convertLiterals = true;

  /** @type {string} Character to use as an escape in strings. */
  escapeCharacter = '\\';

  /** @type {string[]} Holds the list of tokenizable substrings. */
  tokenizeList = [];

  /** @type {Map} Holds an easy lookup map of tokenizable substrings. */
  tokenizeMap = new Map();

  /** @type {Array} Holds the list of quotes to match explicit strings with. */
  matchList = [];

  /** @type {Map} Holds an easy lookup map of quotes to match explicit strings with. */
  matchMap = new Map();

  /** @type {Array} Holds the list of delimiters. */
  delimiterList = [];

  /** @type {Map} Holds an easy lookup map of delimiters. */
  delimiterMap = new Map();

  /**
   * @param {TokenizeThisConfig} config The configuration object.
   */
  constructor(config) {
    /** @type {TokenizeThisConfig} The current configuration. */
    this.config = {
      shouldTokenize: ['(', ')', ',', '*', '/', '%', '+', '-', '=', '!=', '!', '<', '>', '<=', '>=', '^'],
      shouldMatch: ['"', '\'', '`'],
      shouldDelimitBy: [' ', '\n', '\r', '\t'],
      convertLiterals: true,
      escapeCharacter: '\\',
      ...config,
    };

    // Sorts the tokenizable substrings based on their length, such that "<=" will get matched before "<" does.
    this.config.shouldTokenize
      ?.sort(sortTokenizableSubstrings)
      ?.forEach((token) => {
        if (!this.tokenizeMap.has(token)) {
          this.tokenizeList.push(token);
          this.tokenizeMap.set(token, token);
        }
      });

    this.config.shouldMatch?.forEach((match) => this.matchMap.set(match, match));
    this.config.shouldDelimitBy?.forEach((delimiter) => this.delimiterMap.set(delimiter, delimiter));
  }

  /**
   * Creates a Tokenizer, then immediately calls "tokenize".
   * @param {string} input The string to scan for tokens.
   * @param {function((null | true | false | number | string), string): void} forEachToken Function to run over each token.
   * @returns {void} The new Tokenizer instance after being tokenized.
   */
  tokenize(input, forEachToken) {
    const tokenizerInstance = new Tokenizer(this, input, forEachToken);
    return tokenizerInstance.tokenize();
  }
}

export default {
  Tokenizer,
  TokenizeThis,
};
